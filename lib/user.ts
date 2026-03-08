import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export interface VocaBeeUser {
    id: string;
    email: string;
    name?: string | null;
    dailyNewWordGoal: number;
    dailyNewGrammarGoal: number;
    streakCount: number;
    lastGoalMetDate?: Date | null;
    points: number;
    streakFreeze: number;
    createdAt: Date;
}

export async function getAuthenticatedUser(): Promise<VocaBeeUser | null> {
    const session = await auth();
    if (!session?.user?.email) return null;

    const email = session.user.email;
    // Try exact match first
    let user = await prisma.user.findUnique({ where: { email } }) as VocaBeeUser | null;

    // Fallback to case-insensitive if not found
    if (!user) {
        console.warn(`User not found by exact email: ${email}. Trying case-insensitive lookup.`);
        try {
            const users = await prisma.$queryRawUnsafe<any[]>(
                `SELECT id FROM "User" WHERE LOWER(email) = LOWER(?) LIMIT 1`,
                email
            );
            if (users && users.length > 0) {
                user = await prisma.user.findUnique({ where: { id: users[0].id } }) as VocaBeeUser | null;
            }
        } catch (e) {
            console.error("Error during case-insensitive lookup:", e);
        }
    }

    if (!user) {
        console.warn(`User absolutely not found for email: ${email}. Auto-creating user to recover session state.`);
        try {
            user = await prisma.user.create({
                data: {
                    email: email,
                    name: session.user.name || email.split('@')[0],
                    password: "$2a$10$UserWasAutoCreatedFromSessionButDBWasWiped", // Dummy hash
                    dailyNewWordGoal: 20,
                    dailyNewGrammarGoal: 10
                }
            }) as unknown as VocaBeeUser;
        } catch (createError) {
            console.error("Error auto-creating user:", createError);
        }
    }

    return user;
}
