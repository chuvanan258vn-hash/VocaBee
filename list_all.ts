
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const words = await prisma.vocabulary.findMany({
            select: { word: true, nextReview: true, interval: true, repetition: true }
        });
        console.log('--- ALL VOCABULARY ---');
        words.forEach(w => {
            console.log(`${w.word} | Next: ${w.nextReview} | Int: ${w.interval} | Rep: ${w.repetition}`);
        });

        const grammar = await prisma.grammarCard.findMany({
            select: { prompt: true, answer: true, nextReview: true }
        });
        console.log('\n--- ALL GRAMMAR ---');
        grammar.forEach(g => {
            console.log(`P: ${g.prompt.substring(0, 20)} | A: ${g.answer} | Next: ${g.nextReview}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
