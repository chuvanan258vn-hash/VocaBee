import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching cards containing 'Walder Valley'...");

    const cards = await prisma.grammarCard.findMany({
        where: {
            prompt: {
                contains: "Walder Valley"
            }
        }
    });

    let output = `Found ${cards.length} cards.\n`;
    cards.forEach(c => {
        output += `\nID: ${c.id}\n`;
        output += `Prompt: ${c.prompt.substring(0, 50)}...\n`;
        output += `Answer: ${c.answer}\n`;
        output += `Interval: ${c.interval}, Repetition: ${c.repetition}\n`;
        output += `NextReview: ${c.nextReview}\n`;
    });

    fs.writeFileSync('cliff_log.txt', output);
    console.log("Wrote to cliff_log.txt");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
