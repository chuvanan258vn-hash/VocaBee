
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

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
        console.log(`--- REPORTING DUPLICATES IN ${dbPath} ---`);

        const duplicates: any[] = await prisma.$queryRaw`
            SELECT prompt, userId, COUNT(*) as count 
            FROM GrammarCard 
            GROUP BY prompt, userId 
            HAVING count > 1
        `;

        let report = `Total duplicate prompt sets: ${duplicates.length}\n\n`;

        for (const dup of duplicates) {
            report += `Prompt: "${dup.prompt}"\n`;
            report += `User: ${dup.userId}\n`;
            report += `Count: ${dup.count}\n`;

            const cards = await prisma.grammarCard.findMany({
                where: {
                    userId: dup.userId,
                    prompt: dup.prompt
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            cards.forEach(c => {
                report += `  - ID: ${c.id} | Type: ${c.type} | Answer: ${c.answer} | Int: ${c.interval} | Rep: ${c.repetition} | Created: ${c.createdAt}\n`;
            });
            report += '\n';
        }

        fs.writeFileSync('grammar_duplicates_report.txt', report);
        console.log('Report written to grammar_duplicates_report.txt');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
