
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- USERS ---');
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true }
        });
        users.forEach(u => console.log(`${u.id} | ${u.email} | ${u.name}`));

        console.log('\n--- DUPLICATE WORDS ---');
        const duplicates = await prisma.$queryRaw`
            SELECT word, userId, COUNT(*) as count 
            FROM Vocabulary 
            GROUP BY word, userId 
            HAVING count > 1
        `;
        console.log(JSON.stringify(duplicates, null, 2));

        console.log('\n--- ALL "LEAGUE" ENTRIES ---');
        const league = await prisma.vocabulary.findMany({
            where: {
                word: { contains: 'league' }
            }
        });
        league.forEach(l => console.log(`${l.word} | ${l.id} | ${l.userId} | Next: ${l.nextReview} | Int: ${l.interval}`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
