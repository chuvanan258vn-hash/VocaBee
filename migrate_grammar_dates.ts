
/**
 * Migration: Fix GrammarCard date fields stored as locale strings.
 * 
 * Bug: When Prisma updates GrammarCard using `(prisma as any).grammarCard.update()`
 * with a Date object, SQLite stores it as the locale string format (e.g. "Mon Jul 06 2026 04:00:00 GMT+0700")
 * instead of ISO format (e.g. "2026-07-05T21:00:00.000Z").
 * 
 * This causes SQLite date comparisons to be WRONG because they become lexicographic string comparisons.
 * Cards that are due in the future appear as "due now" (because "M" < "2026-").
 * 
 * Fix: Read all cards, parse their dates, write them back as ISO strings.
 */

import { PrismaClient } from '@prisma/client';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } }
});

function isIsoFormat(dateStr: string): boolean {
    // ISO format starts with "YYYY-"
    return /^\d{4}-\d{2}-\d{2}T/.test(dateStr);
}

async function main() {
    console.log('Migration: GrammarCard date format fix\n');

    try {
        // Fetch all raw records with string dates
        const rawCards: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, nextReview, updatedAt, createdAt FROM GrammarCard`
        );

        let fixedCount = 0;
        let alreadyOkCount = 0;
        let errorCount = 0;

        for (const card of rawCards) {
            const nextReviewStr = String(card.nextReview);
            const updatedAtStr = String(card.updatedAt);
            const createdAtStr = String(card.createdAt);

            const nextReviewOk = isIsoFormat(nextReviewStr);
            const updatedAtOk = isIsoFormat(updatedAtStr);
            const createdAtOk = isIsoFormat(createdAtStr);

            if (nextReviewOk && updatedAtOk && createdAtOk) {
                alreadyOkCount++;
                continue;
            }

            try {
                const nextReviewDate = new Date(nextReviewStr);
                const updatedAtDate = new Date(updatedAtStr);
                const createdAtDate = new Date(createdAtStr);

                if (isNaN(nextReviewDate.getTime()) || isNaN(updatedAtDate.getTime()) || isNaN(createdAtDate.getTime())) {
                    console.error(`  SKIP (invalid date): ID ${card.id.slice(0, 8)} nextReview="${nextReviewStr}"`);
                    errorCount++;
                    continue;
                }

                await prisma.$executeRawUnsafe(
                    `UPDATE GrammarCard SET nextReview = ?, updatedAt = ?, createdAt = ? WHERE id = ?`,
                    nextReviewDate.toISOString(),
                    updatedAtDate.toISOString(),
                    createdAtDate.toISOString(),
                    card.id
                );

                console.log(`  FIXED: ID ${card.id.slice(0, 8)}`);
                console.log(`    nextReview: "${nextReviewStr}" => "${nextReviewDate.toISOString()}"`);
                fixedCount++;
            } catch (e) {
                console.error(`  ERROR processing ID ${card.id.slice(0, 8)}: ${e}`);
                errorCount++;
            }
        }

        console.log(`\n=== Migration Complete ===`);
        console.log(`  Already OK:  ${alreadyOkCount}`);
        console.log(`  Fixed:       ${fixedCount}`);
        console.log(`  Errors:      ${errorCount}`);

        // Verify: check that the due query now works correctly
        const now = new Date();
        const dueAfterFix: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, nextReview, interval, repetition FROM GrammarCard WHERE interval > 0 AND nextReview <= ?`,
            now.toISOString()
        );
        console.log(`\nVerification: Cards legitimately due now (nextReview <= ${now.toISOString()}): ${dueAfterFix.length}`);
        dueAfterFix.forEach(c => console.log(`  ID:${c.id.slice(0, 8)} int:${c.interval} rep:${c.repetition} nextReview: "${c.nextReview}"`));

    } catch (e) {
        console.error('Fatal error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
