import { prisma } from './lib/prisma';

async function main() {
    console.log('--- Checking Database Content ---');
    try {
        const userCount = await prisma.user.count();
        console.log(`Total users: ${userCount}`);

        const users = await prisma.user.findMany();
        console.log('Users found:');
        users.forEach(u => {
            console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.name}`);
        });

        if (userCount === 0) {
            console.log('WARNING: User table is empty! This explains why the user is not found.');
        }
    } catch (e) {
        console.error('Error querying database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
