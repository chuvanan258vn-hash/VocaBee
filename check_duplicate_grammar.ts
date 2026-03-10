import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching cards containing 'For this reason'...");

    const cards = await prisma.grammarCard.findMany({
        where: {
            prompt: {
                contains: "For this reason"
            }
        }
    });

    console.log(`Found ${cards.length} cards.`);
    cards.forEach(c => {
        console.log(`\nID: ${c.id}`);
        console.log(`Prompt: ${c.prompt}`);
        console.log(`Answer: ${c.answer}`);
        console.log(`Interval: ${c.interval}, Repetition: ${c.repetition}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
