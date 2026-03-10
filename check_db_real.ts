
import { PrismaClient } from '@prisma/client';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `file:${dbPath}`
        }
    }
});

async function main() {
    try {
        console.log(`--- CHECKING ${dbPath} ---`);

        const count = await prisma.grammarCard.count();
        console.log(`Total GrammarCards: ${count}`);

        const duplicates: any[] = await prisma.$queryRaw`
            SELECT prompt, userId, COUNT(*) as count 
            FROM GrammarCard 
            GROUP BY prompt, userId 
            HAVING count > 1
        `;

        if (duplicates.length === 0) {
            console.log('No exact duplicates found.');
        } else {
            console.log(`Found ${duplicates.length} duplicate prompts:`);
            for (const dup of duplicates) {
                console.log(`\nPrompt: "${dup.prompt}"`);
                console.log(`Count: ${dup.count}`);

                const cards = await prisma.grammarCard.findMany({
                    where: {
                        userId: dup.userId,
                        prompt: dup.prompt
                    }
                });

                cards.forEach(c => {
                    console.log(`  - ID: ${c.id} | Answer: ${c.answer} | Int: ${c.interval} | Created: ${c.createdAt}`);
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
