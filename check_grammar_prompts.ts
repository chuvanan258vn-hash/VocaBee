
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- CHECKING FOR DUPLICATE GRAMMAR PROMPTS (Independent of answer/type) ---');

        const duplicates: any[] = await prisma.$queryRaw`
            SELECT prompt, userId, COUNT(*) as count 
            FROM GrammarCard 
            GROUP BY prompt, userId 
            HAVING count > 1
        `;

        if (duplicates.length === 0) {
            console.log('No duplicate grammar prompts found.');
        } else {
            console.log(`Found ${duplicates.length} prompts that are used in multiple cards:`);
            for (const dup of duplicates) {
                console.log(`\nPrompt: ${dup.prompt}`);
                console.log(`User: ${dup.userId}`);
                console.log(`Count: ${dup.count}`);

                const cards = await prisma.grammarCard.findMany({
                    where: {
                        userId: dup.userId,
                        prompt: dup.prompt
                    }
                });

                cards.forEach(c => {
                    console.log(`  - ID: ${c.id} | Type: ${c.type} | Answer: ${c.answer} | Int: ${c.interval}`);
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
