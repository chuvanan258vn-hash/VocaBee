import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying User schema options...');
    try {
        const user = await prisma.user.findFirst();
        if (user) {
            console.log('User found:', user.id);
            console.log('Points:', (user as any).points);
            console.log('Streak Freeze:', (user as any).streakFreeze);

            // Try to update to confirm write access
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    points: { increment: 1 }
                }
            });
            console.log('Successfully incremented points.');
        } else {
            console.log('No user found to test, but schema loaded.');
        }
    } catch (e) {
        console.error('Error verifying schema:', e);
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
