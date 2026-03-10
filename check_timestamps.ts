
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const word = await prisma.vocabulary.findFirst({
            where: { word: 'adult league' }
        });

        if (word) {
            console.log(`Word: ${word.word}`);
            console.log(`- Next Review: ${word.nextReview}`);
            console.log(`- Interval: ${word.interval}`);
            console.log(`- Repetition: ${word.repetition}`);
            console.log(`- UpdatedAt: ${word.updatedAt}`);
            console.log(`- CreatedAt: ${word.createdAt}`);
        } else {
            console.log('Word not found.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
