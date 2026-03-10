
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } }
});

const lines: string[] = [];
const log = (s: string) => { lines.push(s); process.stdout.write(s + '\n'); };

async function main() {
    const now = new Date();
    const todayStart = new Date(now);
    if (now.getHours() < 4) todayStart.setDate(todayStart.getDate() - 1);
    todayStart.setHours(4, 0, 0, 0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    log(`Now: ${now.toISOString()}`);
    log(`todayStart (4AM): ${todayStart.toISOString()}`);
    log(`yesterdayStart:   ${yesterdayStart.toISOString()}`);

    try {
        const total = await prisma.grammarCard.count();
        log(`\nTotal grammar cards: ${total}`);

        const newCards: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, type, substr(prompt,1,80) as prompt, interval, repetition, nextReview, updatedAt, createdAt
             FROM GrammarCard WHERE interval = 0 ORDER BY createdAt ASC`
        );
        log(`\n[NEW cards (interval=0)]: ${newCards.length}`);
        newCards.forEach(c => log(`  ID:${c.id.slice(0, 8)} rep:${c.repetition} next:${c.nextReview} upd:${c.updatedAt} => "${c.prompt}"`));

        const dueAll: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, type, substr(prompt,1,80) as prompt, interval, repetition, nextReview, updatedAt
             FROM GrammarCard WHERE interval > 0 AND nextReview <= ? ORDER BY nextReview ASC`,
            now.toISOString()
        );
        log(`\n[DUE cards (interval>0, nextReview<=now)]: ${dueAll.length}`);
        dueAll.forEach(c => log(`  ID:${c.id.slice(0, 8)} int:${c.interval} rep:${c.repetition} next:${c.nextReview} upd:${c.updatedAt} => "${c.prompt}"`));

        const excluded: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, substr(prompt,1,80) as prompt, interval, repetition, nextReview, updatedAt
             FROM GrammarCard WHERE interval > 0 AND nextReview <= ? AND isDeferred = 0
               AND (repetition = 1 AND updatedAt >= ? AND updatedAt < ?)`,
            now.toISOString(), yesterdayStart.toISOString(), todayStart.toISOString()
        );
        log(`\n[DUE but BLOCKED by "yesterday" filter]: ${excluded.length}`);
        excluded.forEach(c => log(`  ID:${c.id.slice(0, 8)} int:${c.interval} rep:${c.repetition} next:${c.nextReview} upd:${c.updatedAt} => "${c.prompt}"`));

        const afterFilter: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, substr(prompt,1,80) as prompt, interval, repetition, nextReview, updatedAt
             FROM GrammarCard WHERE interval > 0 AND nextReview <= ? AND isDeferred = 0
               AND NOT (repetition = 1 AND updatedAt >= ? AND updatedAt < ?)
             ORDER BY nextReview ASC LIMIT 20`,
            now.toISOString(), yesterdayStart.toISOString(), todayStart.toISOString()
        );
        log(`\n[WILL APPEAR as dueGrammar]: ${afterFilter.length}`);
        afterFilter.forEach(c => log(`  ID:${c.id.slice(0, 8)} int:${c.interval} rep:${c.repetition} next:${c.nextReview} => "${c.prompt}"`));

        const reviewedToday: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, substr(prompt,1,80) as prompt, interval, repetition, updatedAt
             FROM GrammarCard WHERE updatedAt >= ? ORDER BY updatedAt DESC`,
            todayStart.toISOString()
        );
        log(`\n[Reviewed TODAY (updatedAt >= todayStart)]: ${reviewedToday.length}`);
        reviewedToday.forEach(c => log(`  ID:${c.id.slice(0, 8)} int:${c.interval} rep:${c.repetition} upd:${c.updatedAt} => "${c.prompt}"`));

        const upcoming: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, substr(prompt,1,80) as prompt, interval, repetition, nextReview
             FROM GrammarCard WHERE interval > 0 AND nextReview > ? ORDER BY nextReview ASC LIMIT 20`,
            now.toISOString()
        );
        log(`\n[UPCOMING (interval>0, nextReview in future)]: ${upcoming.length}`);
        upcoming.forEach(c => log(`  ID:${c.id.slice(0, 8)} int:${c.interval} rep:${c.repetition} next:${c.nextReview} => "${c.prompt}"`));

    } catch (e) {
        log(`ERROR: ${e}`);
    } finally {
        await prisma.$disconnect();
    }

    fs.writeFileSync('grammar_diagnose.txt', lines.join('\n'), 'utf8');
    process.stdout.write('Output saved to grammar_diagnose.txt\n');
}

main();
