
import { PrismaClient } from '@prisma/client';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } }
});

async function main() {
    try {
        // Get RAW nextReview values as stored in the DB (no Prisma type conversion)
        const raw: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, nextReview, updatedAt, interval, repetition, substr(prompt,1,60) as prompt FROM GrammarCard ORDER BY nextReview ASC LIMIT 20`
        );
        console.log('=== RAW nextReview values from SQLite ===');
        raw.forEach(r => {
            console.log(`ID: ${r.id.slice(0, 8)} | nextReview: [${typeof r.nextReview}] "${r.nextReview}" | int:${r.interval}`);
        });

        // Compare what Prisma does vs raw
        console.log('\n=== Prisma-parsed values ===');
        const prismaCards = await prisma.grammarCard.findMany({
            select: { id: true, nextReview: true, interval: true, repetition: true },
            orderBy: { nextReview: 'asc' },
            take: 20
        });
        prismaCards.forEach(c => {
            const nextReview = c.nextReview;
            console.log(`ID: ${c.id.slice(0, 8)} | nextReview type: ${typeof nextReview} | value: ${nextReview} | iso: ${nextReview instanceof Date ? (nextReview as Date).toISOString() : 'NOT A DATE'}`);
        });

        // Check what the current time comparison looks like
        const now = new Date();
        console.log(`\nnow ISO: ${now.toISOString()}`);
        console.log(`Comparing with raw query...`);

        const dueRaw: any[] = await prisma.$queryRawUnsafe(
            `SELECT id, nextReview, interval FROM GrammarCard WHERE nextReview <= ? AND interval > 0`,
            now.toISOString()
        );
        console.log(`Due with ISO string comparison: ${dueRaw.length}`);
        dueRaw.forEach(r => console.log(`  nextReview: "${r.nextReview}"`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
