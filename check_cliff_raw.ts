import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching cards using raw SQL...");

    const cards: any[] = await prisma.$queryRawUnsafe(`
        SELECT id, prompt, answer, interval, repetition, nextReview 
        FROM GrammarCard 
        WHERE prompt LIKE '%Walder Valley%' OR prompt LIKE '%cliff%'
    `);

    let output = `Found ${cards.length} cards.\n`;
    cards.forEach(c => {
        output += `\nID: ${c.id}\n`;
        output += `Prompt: ${c.prompt.substring(0, 100)}...\n`;
        output += `Answer: ${c.answer}\n`;
        output += `Interval: ${c.interval}, Repetition: ${c.repetition}\n`;
        output += `NextReview: ${c.nextReview}\n`;
    });

    fs.writeFileSync('cliff_log_2.txt', output);
    console.log("Wrote to cliff_log_2.txt");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
