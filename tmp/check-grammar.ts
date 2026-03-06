import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    try {
        const count = await prisma.grammarCard.count()
        console.log(`Total GrammarCards: ${count}`)
        const lastCard = await prisma.grammarCard.findFirst({
            orderBy: { createdAt: 'desc' }
        })
        console.log('Last GrammarCard:', JSON.stringify(lastCard, null, 2))
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
