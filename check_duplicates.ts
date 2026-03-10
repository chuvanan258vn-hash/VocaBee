import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching cards containing 'This tool (131)'...");

    const cards = await prisma.grammarCard.findMany({
        where: {
            prompt: {
                contains: "This tool (131)"
            }
        }
    });

    let output = `Found ${cards.length} cards.\n`;
    cards.forEach(c => {
        output += `\nID: ${c.id}\n`;
        output += `Prompt: ${c.prompt.substring(0, 100)}...\n`;
        output += `Answer: ${c.answer}\n`;
        output += `Interval: ${c.interval}, Repetition: ${c.repetition}\n`;
        output += `NextReview: ${c.nextReview}\n`;
        output += `CreatedAt: ${c.createdAt}\n`;
    });

    fs.writeFileSync('this_tool_log.txt', output);
    console.log("Wrote to this_tool_log.txt");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
