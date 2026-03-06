import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/user';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ReviewSession from '@/components/ReviewSession';

export const dynamic = 'force-dynamic';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ReviewPage(props: Props) {
    const searchParams = await props.searchParams;
    const reviewType = searchParams.type;

    const session = await auth();
    if (!session?.user?.email) redirect('/login');

    const user = await getAuthenticatedUser();

    if (!user) redirect('/login');

    // Calculate "Today" starting from 4:00 AM (Sync with Dashboard)
    const now = new Date();
    const todayStart = new Date(now);
    if (now.getHours() < 4) {
        todayStart.setDate(todayStart.getDate() - 1);
    }
    todayStart.setHours(4, 0, 0, 0);

    // Count high-prio from_test items added today to implement "Swap, don't add"
    let testVocabToday = 0;
    try {
        const vTest: any = await prisma.$queryRawUnsafe(
            `SELECT COUNT(*) as count FROM Vocabulary WHERE userId = ? AND source = 'TEST' AND importanceScore >= 3 AND createdAt >= ?`,
            user.id,
            todayStart.toISOString()
        );
        testVocabToday = Number(vTest[0]?.count || 0);
    } catch (e) {
        console.error("Error fetching test vocab count:", e);
    }

    // Count words studied today (any review action)
    const learnedTodayCount = await prisma.vocabulary.count({
        where: {
            userId: user.id,
            updatedAt: { gte: todayStart },
            // A word is considered "learned/studied" if it's not new or was updated today
            OR: [
                { repetition: { gte: 1 } },
                { nextReview: { gt: now } } // Recently forgotten or scheduled for future
            ]
        } as any
    });

    const baseVocabGoal = (user as any).dailyNewWordGoal || 20;
    const canLearnMoreCount = Math.max(0, baseVocabGoal - learnedTodayCount);

    // 1. Lấy các từ ĐANG ÔN TẬP nhưng đến hạn (Priority 1)
    // Bao gồm cả các từ bị quên (interval > 0, repetition = 0)
    // EXCLUDE deferred items from regular review flow
    const dueWords = await prisma.vocabulary.findMany({
        where: {
            userId: user.id,
            interval: { gt: 0 },
            nextReview: { lte: now },
            isDeferred: false
        } as any,
        select: {
            id: true,
            word: true,
            wordType: true,
            meaning: true,
            pronunciation: true,
            example: true,
            synonyms: true,
            interval: true,
            repetition: true,
            efactor: true,
        },
        orderBy: { nextReview: 'asc' },
    });

    // 2. Lấy thêm một số từ MỚI (repetition = 0)
    // Prioritize high-prio test words (Swap, don't add)
    let newWords: any[] = [];
    if (canLearnMoreCount > 0) {
        // First, get high-prio test words that haven't been studied yet
        // Use interval: 0 (not just repetition: 0) to exclude forgotten words
        const testNewWords = await prisma.vocabulary.findMany({
            where: {
                userId: user.id,
                interval: 0, // Strictly never-studied words only
                source: "TEST",
                importanceScore: { gte: 3 },
                createdAt: { lt: todayStart } // 1-day buffer
            } as any,
            select: {
                id: true,
                word: true,
                wordType: true,
                meaning: true,
                pronunciation: true,
                example: true,
                synonyms: true,
                interval: true,
                repetition: true,
                efactor: true,
            },
            take: canLearnMoreCount,
            orderBy: { createdAt: 'desc' }
        });

        const remainingNewCount = canLearnMoreCount - testNewWords.length;

        let scheduledNewWords: any[] = [];
        if (remainingNewCount > 0) {
            scheduledNewWords = await prisma.vocabulary.findMany({
                where: {
                    userId: user.id,
                    interval: 0, // Strictly never-studied words only
                    source: "COLLECTION",
                    isDeferred: false,
                    createdAt: { lt: todayStart } // 1-day buffer
                } as any,
                select: {
                    id: true,
                    word: true,
                    wordType: true,
                    meaning: true,
                    pronunciation: true,
                    example: true,
                    synonyms: true,
                    interval: true,
                    repetition: true,
                    efactor: true,
                },
                take: remainingNewCount,
                orderBy: { createdAt: 'desc' }
            });
        }

        newWords = [...testNewWords, ...scheduledNewWords];
    }

    // 3. Lấy thêm các thẻ NGỮ PHÁP đến hạn (Priority 2)
    const dueGrammar = await prisma.grammarCard.findMany({
        where: {
            userId: user.id,
            nextReview: { lte: now },
            isDeferred: false
        } as any,
        orderBy: { nextReview: 'asc' },
    });

    // Interleave Logic: Mix Due Vocab, New Vocab, and Grammar for better flow
    const interleaved: any[] = [];
    let reviewIdx = 0;
    let newIdx = 0;
    let grammarIdx = 0;

    // Pattern: 2-3 Reviews, 1 New item, 1 Grammar item
    while (reviewIdx < dueWords.length || newIdx < newWords.length || grammarIdx < dueGrammar.length) {
        // Add up to 3 vocab reviews
        for (let i = 0; i < 3 && reviewIdx < dueWords.length; i++) {
            interleaved.push(dueWords[reviewIdx++]);
        }
        // Add 1 grammar item
        if (grammarIdx < dueGrammar.length) {
            interleaved.push(dueGrammar[grammarIdx++]);
        }
        // Add 1 new vocab item
        if (newIdx < newWords.length) {
            interleaved.push(newWords[newIdx++]);
        }
        // Drain logic
        if (reviewIdx >= dueWords.length && newIdx >= newWords.length && grammarIdx < dueGrammar.length) {
            interleaved.push(dueGrammar[grammarIdx++]);
        }
        if (reviewIdx >= dueWords.length && grammarIdx >= dueGrammar.length && newIdx < newWords.length) {
            interleaved.push(newWords[newIdx++]);
        }
    }

    // Filter by type if requested
    let finalItems = interleaved;
    if (reviewType === 'vocab') {
        finalItems = interleaved.filter(item => !('type' in item && 'prompt' in item)); // Vocab items don't have 'prompt' (grammar cards have prompt)
    } else if (reviewType === 'grammar') {
        finalItems = interleaved.filter(item => 'type' in item && 'prompt' in item); // Only grammar items
    }

    return (
        <main className="min-h-screen bg-background font-sans">
            <ReviewSession dueWords={finalItems as any} />
        </main>
    );
}
