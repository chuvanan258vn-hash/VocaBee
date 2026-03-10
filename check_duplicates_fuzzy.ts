import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching cards similar to 'This tool (131)'...");

    // Search for cards that contain "This tool" or "assist you in identifying"
    const cards: any[] = await prisma.$queryRawUnsafe(`
        SELECT id, prompt, answer, interval, repetition, nextReview, createdAt 
        FROM GrammarCard 
        WHERE prompt LIKE '%This tool%' OR prompt LIKE '%assist you in identifying%'
    `);

    let output = `Found ${cards.length} cards.\n`;
    cards.forEach(c => {
        output += `\nID: ${c.id}\n`;
        output += `Prompt: ${c.prompt.substring(0, 100)}...\n`;
        output += `Answer: ${c.answer}\n`;
        output += `Interval: ${c.interval}, Repetition: ${c.repetition}\n`;
        output += `NextReview: ${c.nextReview}\n`;
        output += `CreatedAt: ${c.createdAt}\n`;
    });

    fs.writeFileSync('this_tool_log_fuzzy.txt', output);
    console.log("Wrote to this_tool_log_fuzzy.txt");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
