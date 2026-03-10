import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching cards that might share the passage...");
    const cards: any[] = await prisma.$queryRawUnsafe(`
        SELECT id, prompt, answer 
        FROM GrammarCard 
        WHERE prompt LIKE '%assist you in identifying your strengths and interests%'
    `);

    let output = `Found ${cards.length} cards.\n`;
    cards.forEach(c => {
        output += `\nID: ${c.id}\n`;
        // Split by GAP to see the context vs the specific question
        const parts = c.prompt.split('---GAP---');
        output += `Context Length: ${parts[0]?.length}\n`;
        output += `Question: ${parts[1]?.substring(0, 50).trim()}\n`;
        output += `Prompt snippet: ${c.prompt.substring(0, 100)}\n`;
    });

    fs.writeFileSync('passage_check.txt', output);
    console.log("Wrote to passage_check.txt");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
