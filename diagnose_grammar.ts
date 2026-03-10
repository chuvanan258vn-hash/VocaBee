
import { PrismaClient } from '@prisma/client';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } }
});

async function main() {
    const now = new Date();
    const todayStart = new Date(now);
    if (now.getHours() < 4) todayStart.setDate(todayStart.getDate() - 1);
    todayStart.setHours(4, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    console.log(`\n⏰ Now: ${now.toISOString()}`);
    console.log(`📅 todayStart (4AM): ${todayStart.toISOString()}`);
    console.log(`📅 yesterdayStart:   ${yesterdayStart.toISOString()}`);

    try {
        const total = await prisma.grammarCard.count();
        console.log(`\n📦 Total grammar cards: ${total}`);

        // Cards that are "NEW" (interval = 0)
        const newCards: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, type, substr(prompt,1,60) as prompt, interval, repetition, nextReview, updatedAt, createdAt
             FROM GrammarCard WHERE interval = 0 ORDER BY createdAt ASC LIMIT 20`,
        );
        console.log(`\n🟢 NEW cards (interval=0): ${newCards.length} shown`);
        newCards.forEach(c => console.log(`  ID:${c.id.slice(0, 8)} | rep:${c.repetition} | next:${c.nextReview} | updated:${c.updatedAt} | "${c.prompt}"`));

        // DUE cards (interval > 0 AND nextReview <= now)
        const dueCards: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, type, substr(prompt,1,60) as prompt, interval, repetition, nextReview, updatedAt
             FROM GrammarCard WHERE interval > 0 AND nextReview <= ? ORDER BY nextReview ASC`,
            now.toISOString()
        );
        console.log(`\n🔴 DUE cards (interval>0, nextReview<=now): ${dueCards.length}`);
        dueCards.forEach(c => console.log(`  ID:${c.id.slice(0, 8)} | int:${c.interval} | rep:${c.repetition} | next:${c.nextReview} | updated:${c.updatedAt} | "${c.prompt}"`));

        // Cards excluded by the "NOT yesterday" filter
        const excludedCards: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, type, substr(prompt,1,60) as prompt, interval, repetition, nextReview, updatedAt
             FROM GrammarCard 
             WHERE interval > 0 AND nextReview <= ? AND isDeferred = 0
               AND (repetition = 1 AND updatedAt >= ? AND updatedAt < ?)
             ORDER BY updatedAt DESC`,
            now.toISOString(),
            yesterdayStart.toISOString(),
            todayStart.toISOString()
        );
        console.log(`\n⚠️ DUE but EXCLUDED by "yesterday" filter: ${excludedCards.length}`);
        excludedCards.forEach(c => console.log(`  ID:${c.id.slice(0, 8)} | int:${c.interval} | rep:${c.repetition} | next:${c.nextReview} | updated:${c.updatedAt} | "${c.prompt}"`));

        // Cards that WILL appear in dueGrammar after filter
        const afterFilter: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, type, substr(prompt,1,60) as prompt, interval, repetition, nextReview, updatedAt
             FROM GrammarCard 
             WHERE interval > 0 AND nextReview <= ? AND isDeferred = 0
               AND NOT (repetition = 1 AND updatedAt >= ? AND updatedAt < ?)
             ORDER BY nextReview ASC`,
            now.toISOString(),
            yesterdayStart.toISOString(),
            todayStart.toISOString()
        );
        console.log(`\n✅ WILL appear in dueGrammar (after filter): ${afterFilter.length}`);
        afterFilter.forEach(c => console.log(`  ID:${c.id.slice(0, 8)} | int:${c.interval} | rep:${c.repetition} | next:${c.nextReview} | updated:${c.updatedAt}`));

        // Cards reviewed today
        const reviewedToday: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, substr(prompt,1,60) as prompt, interval, repetition, updatedAt
             FROM GrammarCard WHERE updatedAt >= ? ORDER BY updatedAt DESC`,
            todayStart.toISOString()
        );
        console.log(`\n📝 Reviewed today (updatedAt >= todayStart): ${reviewedToday.length}`);
        reviewedToday.forEach(c => console.log(`  ID:${c.id.slice(0, 8)} | int:${c.interval} | rep:${c.repetition} | updated:${c.updatedAt} | "${c.prompt}"`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
