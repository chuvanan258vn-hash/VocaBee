import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const incompleteWords = await prisma.vocabulary.findMany({
        where: {
            OR: [
                { pronunciation: null },
                { pronunciation: "" },
                { wordType: null },
                { wordType: "" },
                { context: null },
                { context: "" },
                { example: null },
                { example: "" }
            ]
        }
    });

    fs.writeFileSync('todo_updates_final.json', JSON.stringify(incompleteWords, null, 2));
    console.log(`Found ${incompleteWords.length} remaining words to update.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
