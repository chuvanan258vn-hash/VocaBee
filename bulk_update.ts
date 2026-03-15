import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error("Please provide the path to the updates JSON file.");
        process.exit(1);
    }

    const updates = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Starting bulk update for Batch: ${filePath}...`);

    for (const update of updates) {
        const { id, word, ...data } = update;
        try {
            await prisma.vocabulary.update({
                where: { id },
                data: data
            });
            console.log(`Updated: ${word}`);
        } catch (error) {
            console.error(`Failed to update ${word} (${id}):`, error.message);
        }
    }

    console.log(`Bulk update for ${filePath} completed.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
