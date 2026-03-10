
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Searching in Vocabulary...');
        const words = await prisma.vocabulary.findMany({
            where: {
                OR: [
                    { word: { contains: 'adult' } },
                    { word: { contains: 'league' } },
                    { word: { contains: 'adut' } },
                    { word: { contains: 'adult league' } }
                ]
            }
        });
        console.log(`Found ${words.length} matches in Vocabulary.`);
        words.forEach(w => console.log(`- ${w.word}: ${w.nextReview}`));

        console.log('\nSearching in GrammarCard...');
        const grammar = await prisma.grammarCard.findMany({
            where: {
                OR: [
                    { prompt: { contains: 'adult' } },
                    { prompt: { contains: 'league' } },
                    { prompt: { contains: 'adut' } },
                    { prompt: { contains: 'adult league' } },
                    { answer: { contains: 'adult' } },
                    { answer: { contains: 'league' } },
                    { answer: { contains: 'adut' } },
                    { answer: { contains: 'adult league' } }
                ]
            }
        });
        console.log(`Found ${grammar.length} matches in GrammarCard.`);
        grammar.forEach(g => console.log(`- [${g.type}] Prompt: ${g.prompt.substring(0, 30)}... Answer: ${g.answer}: ${g.nextReview}`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
