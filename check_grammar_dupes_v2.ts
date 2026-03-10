
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- CHECKING FOR DUPLICATE GRAMMAR CARDS ---');

        // Find duplicates based on userId, type, prompt, and answer
        const duplicates: any[] = await prisma.$queryRaw`
            SELECT userId, type, prompt, answer, COUNT(*) as count 
            FROM GrammarCard 
            GROUP BY userId, type, prompt, answer 
            HAVING count > 1
        `;

        if (duplicates.length === 0) {
            console.log('No duplicate grammar cards found.');
        } else {
            console.log(`Found ${duplicates.length} sets of duplicate grammar cards:`);
            for (const dup of duplicates) {
                console.log(`\nUser: ${dup.userId}`);
                console.log(`Type: ${dup.type}`);
                console.log(`Prompt: ${dup.prompt}`);
                console.log(`Answer: ${dup.answer}`);
                console.log(`Count: ${dup.count}`);

                // Fetch the actual IDs and their SRS state
                const cards = await prisma.grammarCard.findMany({
                    where: {
                        userId: dup.userId,
                        type: dup.type,
                        prompt: dup.prompt,
                        answer: dup.answer
                    },
                    select: {
                        id: true,
                        interval: true,
                        repetition: true,
                        nextReview: true,
                        createdAt: true
                    }
                });

                cards.forEach(c => {
                    console.log(`  - ID: ${c.id} | Int: ${c.interval} | Rep: ${c.repetition} | Next: ${c.nextReview} | Created: ${c.createdAt}`);
                });
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
