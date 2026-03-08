import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function resetGrammar() {
    try {
        const result = await prisma.grammarCard.updateMany({
            data: {
                interval: 0,
                repetition: 0,
                efactor: 2.0,
                nextReview: new Date(),
            }
        });
        console.log(`Successfully reset ${result.count} grammar records.`);
    } catch (error) {
        console.error('Error resetting grammar:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetGrammar();
