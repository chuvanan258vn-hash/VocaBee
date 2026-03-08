import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const now = new Date();
        const dueGrammar = await prisma.grammarCard.count({
            where: {
                nextReview: { lte: now },
                isDeferred: false
            } as any
        });
        const totalGrammar = await prisma.grammarCard.count();
        console.log('Due Grammar Cards:', dueGrammar);
        console.log('Total Grammar Cards:', totalGrammar);

        const firstFew = await prisma.grammarCard.findMany({ take: 3 });
        console.log('Sample Cards:', JSON.stringify(firstFew, null, 2));

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
