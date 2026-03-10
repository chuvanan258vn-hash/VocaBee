
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const words = await prisma.vocabulary.findMany({
            where: {
                OR: [
                    { word: { contains: 'league' } },
                    { word: { contains: 'adut' } },
                    { word: { contains: 'adult' } }
                ]
            }
        });
        console.log('--- MATCHING VOCABULARY ---');
        words.forEach(w => {
            console.log(`${w.word} | ID: ${w.id} | User: ${w.userId} | Next: ${w.nextReview} | Int: ${w.interval} | Rep: ${w.repetition}`);
        });

        const grammar = await prisma.grammarCard.findMany({
            where: {
                OR: [
                    { prompt: { contains: 'league' } },
                    { prompt: { contains: 'adut' } },
                    { prompt: { contains: 'adult' } }
                ]
            }
        });
        console.log('\n--- MATCHING GRAMMAR ---');
        grammar.forEach(g => {
            console.log(`P: ${g.prompt.substring(0, 50)} | A: ${g.answer} | Next: ${g.nextReview}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
