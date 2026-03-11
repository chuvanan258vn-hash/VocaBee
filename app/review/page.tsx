import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/user';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ReviewSession from '@/components/ReviewSession';

export const dynamic = 'force-dynamic';

export default async function ReviewPage({
    searchParams
}: {
    searchParams: Promise<{ type?: string; all?: string }>;
}) {
    const { type, all } = await searchParams;
    const isReviewAll = all === 'true';
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

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

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

    // Count words learned for the FIRST TIME today
    const learnedTodayCount = await prisma.vocabulary.count({
        where: {
            userId: user.id,
            updatedAt: { gte: todayStart },
            repetition: 1
        } as any
    });

    // Count words added YESTERDAY that haven't been studied yet (interval: 0)
    const unlearnedYesterdayVocab = await prisma.vocabulary.count({
        where: {
            userId: user.id,
            interval: 0,
            isDeferred: false,
            createdAt: {
                gte: yesterdayStart,
                lt: todayStart
            }
        } as any
    });

    const baseVocabGoal = (user as any).dailyNewWordGoal || 30;
    // Total goal = unlearned from yesterday + normal daily goal (Capped at 30)
    const totalVocabGoal = baseVocabGoal + unlearnedYesterdayVocab;
    const canLearnMoreCount = Math.max(0, totalVocabGoal - learnedTodayCount);

    // Count grammar learned for the FIRST TIME today
    const learnedGrammarToday = await (prisma as any).grammarCard.count({
        where: {
            userId: user.id,
            updatedAt: { gte: todayStart },
            repetition: 1
        }
    });

    // Count grammar added YESTERDAY that haven't been studied yet (interval: 0)
    const unlearnedYesterdayGrammar = await (prisma as any).grammarCard.count({
        where: {
            userId: user.id,
            interval: 0,
            isDeferred: false,
            createdAt: {
                gte: yesterdayStart,
                lt: todayStart
            }
        }
    });

    const baseGrammarGoal = (user as any).dailyNewGrammarGoal || 30;
    // Total goal = unlearned from yesterday + normal daily goal
    const totalGrammarGoal = baseGrammarGoal + unlearnedYesterdayGrammar;
    const canLearnMoreGrammarCount = Math.max(0, totalGrammarGoal - learnedGrammarToday);

    // --- SESSION LIMITS ---
    const VOCAB_SESSION_LIMIT = isReviewAll ? 200 : 15;
    const GRAMMAR_SESSION_LIMIT = isReviewAll ? 100 : 10;

    // 1. Lấy các từ ĐANG ÔN TẬP nhưng đến hạn (Priority 1)
    const dueWords = (type === 'grammar') ? [] : await prisma.vocabulary.findMany({
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
        take: VOCAB_SESSION_LIMIT
    });

        // 1.5. Lấy các câu NGỮ PHÁP đến hạn (Priority 1), loại grammar mới học hôm qua
        const dueGrammar: any[] = (type === 'vocab') ? [] : await prisma.$queryRawUnsafe(`
                SELECT * FROM GrammarCard 
                WHERE userId = ? 
                    AND interval > 0 
                    AND nextReview <= ? 
                    AND isDeferred = 0
                    AND NOT (repetition = 1 AND updatedAt >= ? AND updatedAt < ?)
                ORDER BY nextReview ASC 
                LIMIT ?
        `, user.id, now.toISOString(), yesterdayStart.toISOString(), todayStart.toISOString(), GRAMMAR_SESSION_LIMIT);

    // Calculate remaining slots for new items in this session
    const vocabSlotsLeft = Math.max(0, VOCAB_SESSION_LIMIT - dueWords.length);
    const grammarSlotsLeft = Math.max(0, GRAMMAR_SESSION_LIMIT - dueGrammar.length);

    // 2. Lấy thêm một số từ MỚI (repetition = 0)
    let newWords: any[] = [];
    if (vocabSlotsLeft > 0 && canLearnMoreCount > 0 && type !== 'grammar') {
        const fetchNewCount = Math.min(vocabSlotsLeft, canLearnMoreCount);

        const testNewWords = await prisma.vocabulary.findMany({
            where: {
                userId: user.id,
                interval: 0,
                source: "TEST",
                importanceScore: { gte: 3 },
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
            take: fetchNewCount,
            orderBy: { createdAt: 'asc' }
        });

        const remainingNewCount = fetchNewCount - testNewWords.length;

        let scheduledNewWords: any[] = [];
        if (remainingNewCount > 0) {
            scheduledNewWords = await prisma.vocabulary.findMany({
                where: {
                    userId: user.id,
                    interval: 0,
                    source: "COLLECTION",
                    isDeferred: false,
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
                orderBy: { createdAt: 'asc' }
            });
        }

        newWords = [...testNewWords, ...scheduledNewWords];
    }

    // 3. Lấy thêm một số câu NGỮ PHÁP MỚI (interval = 0)
    let newGrammar: any[] = [];
    if (grammarSlotsLeft > 0 && canLearnMoreGrammarCount > 0 && type !== 'vocab') {
        const fetchGrammarCount = Math.min(grammarSlotsLeft, canLearnMoreGrammarCount);

        newGrammar = await prisma.$queryRawUnsafe(`
            SELECT * FROM GrammarCard 
            WHERE userId = ? 
              AND interval = 0 
              AND isDeferred = 0
            ORDER BY createdAt ASC 
            LIMIT ?
        `, user.id, fetchGrammarCount);
    }

    // Interleave Logic: Mix Due and New items for better flow
    const combinedDue = [...dueWords, ...dueGrammar];
    const combinedNew = [...newWords, ...newGrammar];

    const interleaved: any[] = [];
    let reviewIdx = 0;
    let newIdx = 0;

    // Pattern: 3-4 Reviews followed by 1 New item
    while (reviewIdx < combinedDue.length || newIdx < combinedNew.length) {
        // Add up to 3 reviews
        for (let i = 0; i < 3 && reviewIdx < combinedDue.length; i++) {
            interleaved.push(combinedDue[reviewIdx++]);
        }
        // Add 1 new item
        if (newIdx < combinedNew.length) {
            interleaved.push(combinedNew[newIdx++]);
        }
        // If no more reviews, just drain new items
        if (reviewIdx >= combinedDue.length && newIdx < combinedNew.length) {
            interleaved.push(combinedNew[newIdx++]);
        }
    }

    return (
        <main className="min-h-screen bg-background font-sans">
            <ReviewSession dueWords={interleaved as any} />
        </main>
    );
}
