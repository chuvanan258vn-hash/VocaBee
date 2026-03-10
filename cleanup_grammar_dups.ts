import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching all grammar cards...");
    const allCards = await prisma.grammarCard.findMany({
        orderBy: [
            { repetition: 'desc' },
            { interval: 'desc' },
            { createdAt: 'asc' }
        ]
    });

    // Normalize prompt strings and cluster them
    const duplicates: Record<string, typeof allCards> = {};

    for (const card of allCards) {
        // Normalize: lowercase, remove all whitespaces/newlines, remove underscores
        const normalized = card.prompt.toLowerCase().replace(/[\s\n\r_]/g, '');
        if (!duplicates[normalized]) {
            duplicates[normalized] = [];
        }
        duplicates[normalized].push(card);
    }

    let deletedCount = 0;
    for (const [key, cards] of Object.entries(duplicates)) {
        if (cards.length > 1) {
            console.log(`\nFound ${cards.length} duplicates for prompt starting with '${cards[0].prompt.substring(0, 30)}...'`);

            // cards are already sorted, best one is first.
            const [keep, ...toDelete] = cards;

            for (const dup of toDelete) {
                console.log(`  -> Deleting ID: ${dup.id}`);
                await prisma.grammarCard.delete({
                    where: { id: dup.id }
                });
                deletedCount++;
            }
        }
    }

    console.log(`\nCleanup complete. Deleted ${deletedCount} duplicate cards.`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
