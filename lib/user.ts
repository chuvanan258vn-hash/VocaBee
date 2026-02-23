import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function getAuthenticatedUser() {
    const session = await auth();
    if (!session?.user?.email) return null;

    const email = session.user.email;
    // Try exact match first
    let user = await prisma.user.findUnique({ where: { email } });

    // Fallback to case-insensitive if not found
    if (!user) {
        console.warn(`User not found by exact email: ${email}. Trying case-insensitive lookup.`);
        // Use raw query to force case-insensitive check on SQLite
        // & re-fetch to ensure valid Date objects and types
        try {
            const users = await prisma.$queryRawUnsafe<any[]>(
                `SELECT id FROM "User" WHERE LOWER(email) = LOWER(?) LIMIT 1`,
                email
            );
            if (users && users.length > 0) {
                user = await prisma.user.findUnique({ where: { id: users[0].id } });
            }
        } catch (e) {
            console.error("Error during case-insensitive lookup:", e);
        }
    }

    if (!user) {
        console.warn(`User absolutely not found for email: ${email}. Auto-creating user to recover session state.`);
        try {
            // Auto-create user to fix "User not found" error when session exists but DB is empty
            // Use a dummy hash for password since they are already authenticated via session
            // Next login will fail unless they register again or reset password, but current session works.
            user = await prisma.user.create({
                data: {
                    email: email,
                    name: session.user.name || email.split('@')[0],
                    password: "$2a$10$UserWasAutoCreatedFromSessionButDBWasWiped", // Dummy hash
                    dailyNewWordGoal: 20,
                    dailyNewGrammarGoal: 10
                }
            });
        } catch (createError) {
            console.error("Error auto-creating user:", createError);
        }
    }

    return user;
}
