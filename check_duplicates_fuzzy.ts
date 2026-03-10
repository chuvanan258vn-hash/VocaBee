
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalize(text: string): string {
    return text.toLowerCase().replace(/[.,!?;]/g, '').replace(/\s+/g, ' ').trim();
}

async function main() {
    try {
        console.log('--- CHECKING FOR FUZZY DUPLICATE GRAMMAR PROMPTS ---');

        const cards = await prisma.grammarCard.findMany({
            select: { id: true, prompt: true, userId: true, answer: true, type: true }
        });

        const seen: Map<string, any[]> = new Map();

        for (const card of cards) {
            const key = normalize(card.prompt) + '|' + card.userId;
            if (!seen.has(key)) {
                seen.set(key, []);
            }
            seen.get(key)!.push(card);
        }

        let found = false;
        for (const [key, cardList] of seen.entries()) {
            if (cardList.length > 1) {
                found = true;
                const [promptPart, userId] = key.split('|');
                console.log(`\nNormalized Prompt: "${promptPart}"`);
                console.log(`User: ${userId}`);
                console.log(`Count: ${cardList.length}`);
                cardList.forEach(c => {
                    console.log(`  - ID: ${c.id} | Type: ${c.type} | Original Prompt: "${c.prompt}" | Answer: "${c.answer}"`);
                });
            }
        }

        if (!found) {
            console.log('No fuzzy duplicate grammar prompts found.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
