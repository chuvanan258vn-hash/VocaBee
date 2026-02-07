import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ReviewSession from '@/components/ReviewSession';

export const dynamic = 'force-dynamic';

export default async function ReviewPage() {
    const session = await auth();
    if (!session?.user?.email) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) redirect('/login');

    // Lấy các từ đến hạn ôn tập (Trước 4:00 sáng mai)
    const now = new Date();
    // Đồng nhất logic 4h sáng với Dashboard
    now.setHours(23, 59, 59, 999);

    const dueWords = await prisma.vocabulary.findMany({
        where: {
            userId: user.id,
            nextReview: {
                lte: now,
            },
        },
        orderBy: {
            nextReview: 'asc',
        },
    });

    return (
        <main className="flex min-h-screen flex-col items-center bg-background dark:bg-background transition-colors font-sans px-4 pb-20">
            <ReviewSession dueWords={dueWords as any} />
        </main>
    );
}
