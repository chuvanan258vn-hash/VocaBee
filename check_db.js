
const { PrismaClient } = require('my-prisma-client');

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || 'file:./dev.db',
});

async function main() {
    try {
        console.log('Connecting to DB...');
        const words = await prisma.vocabulary.findMany();
        console.log('Success! Found words:', words.length);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
