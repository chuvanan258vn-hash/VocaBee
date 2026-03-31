import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, VocaBeeUser } from '@/lib/user';
import { GrammarCard, Vocabulary } from '@/types';
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
            `SELECT COUNT(*) as count FROM "Vocabulary" WHERE "userId" = $1 AND source = 'TEST' AND "importanceScore" >= 3 AND "createdAt" >= $2`,
            user.id,
            todayStart
        );
        testVocabToday = Number(vTest[0]?.count || 0);
    } catch (_e) {
        console.error("Error fetching test vocab count:", _e);
    }

    // Count words learned for the FIRST TIME today
    const learnedTodayCount = await prisma.vocabulary.count({
        where: {
            userId: user.id,
            updatedAt: { gte: todayStart },
            repetition: 1
        }
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
        }
    });

    const baseVocabGoal = (user as unknown as VocaBeeUser).dailyNewWordGoal || 30;
    // Total goal = unlearned from yesterday + normal daily goal (Capped at 30)
    const totalVocabGoal = baseVocabGoal + unlearnedYesterdayVocab;
    const canLearnMoreCount = Math.max(0, totalVocabGoal - learnedTodayCount);

    // Count grammar learned for the FIRST TIME today
    const learnedGrammarToday = await prisma.grammarCard.count({
        where: {
            userId: user.id,
            updatedAt: { gte: todayStart },
            repetition: 1
        }
    });

    // Count grammar added YESTERDAY that haven't been studied yet (interval: 0)
    const unlearnedYesterdayGrammar = await prisma.grammarCard.count({
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

    const baseGrammarGoal = (user as unknown as VocaBeeUser).dailyNewGrammarGoal || 30;
    // Total goal = unlearned from yesterday + normal daily goal
    const totalGrammarGoal = baseGrammarGoal + unlearnedYesterdayGrammar;
    const canLearnMoreGrammarCount = Math.max(0, totalGrammarGoal - learnedGrammarToday);

    // --- SESSION LIMITS ---
    // --- DYNAMIC SESSION LIMITS ---
    // Count exact items available to decide if we should merge sessions
    const alreadyReviewedVocabToday = await prisma.vocabulary.count({
        where: {
            userId: user.id,
            updatedAt: { gte: todayStart },
            repetition: { gt: 1 }
        }
    });
    const vUser = user as unknown as VocaBeeUser;
    const MAX_DAILY_VOCAB_REVIEWS = vUser.dailyMaxVocabReview ?? 100;
    const remainingVocabReviewQuota = isReviewAll ? 9999 : Math.max(0, MAX_DAILY_VOCAB_REVIEWS - alreadyReviewedVocabToday);

    const rawVocabDueCount = await prisma.vocabulary.count({
        where: {
            userId: user.id,
            interval: { gt: 0 },
            nextReview: { lte: now },
            isDeferred: false
        }
    });
    const vocabDueCount = Math.min(rawVocabDueCount, remainingVocabReviewQuota);
    const totalPotentialVocab = vocabDueCount + canLearnMoreCount;

    // Similarly for grammar
    const alreadyReviewedGrammarRaw: { count: bigint }[] = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM "GrammarCard" 
        WHERE "userId" = $1 
          AND "updatedAt" >= $2
          AND repetition > 1
    `, user.id, todayStart);
    const alreadyReviewedGrammarToday = Number(alreadyReviewedGrammarRaw[0]?.count || 0);
    const MAX_DAILY_GRAMMAR_REVIEWS = vUser.dailyMaxGrammarReview ?? 50;
    const remainingGrammarReviewQuota = isReviewAll ? 9999 : Math.max(0, MAX_DAILY_GRAMMAR_REVIEWS - alreadyReviewedGrammarToday);

    const grammarDueRaw: { count: bigint }[] = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM "GrammarCard" 
        WHERE "userId" = $1 AND interval > 0 AND "nextReview" <= $2 AND "isDeferred" = false
        AND NOT (repetition = 1 AND "updatedAt" >= $3 AND "updatedAt" < $4)
    `, user.id, now, yesterdayStart, todayStart);
    
    const maxGrammarQueryCount = Number(grammarDueRaw[0]?.count || 0);
    const effectiveGrammarDueCount = Math.min(maxGrammarQueryCount, remainingGrammarReviewQuota);
    const totalPotentialGrammar = effectiveGrammarDueCount + canLearnMoreGrammarCount;

    // Thresholds: if items are below these, take them all in one session
    const VOCAB_THRESHOLD = 25;
    const GRAMMAR_THRESHOLD = 15;

    const VOCAB_SESSION_LIMIT = isReviewAll 
        ? 200 
        : (totalPotentialVocab <= VOCAB_THRESHOLD ? VOCAB_THRESHOLD : 15);
        
    const GRAMMAR_SESSION_LIMIT = isReviewAll 
        ? 100 
        : (totalPotentialGrammar <= GRAMMAR_THRESHOLD ? GRAMMAR_THRESHOLD : 10);

    // 1. Lấy các từ ĐANG ÔN TẬP nhưng đến hạn (Priority 1)
    const dueVocabLimit = Math.min(VOCAB_SESSION_LIMIT, remainingVocabReviewQuota);
    const dueWords = (type === 'grammar') ? [] : await prisma.vocabulary.findMany({
        where: {
            userId: user.id,
            interval: { gt: 0 },
            nextReview: { lte: now },
            isDeferred: false
        },
        orderBy: { nextReview: 'asc' },
        take: dueVocabLimit
    });

        // 1.5. Lấy các câu NGỮ PHÁP đến hạn (Priority 1), loại grammar mới học hôm qua
        const dueGrammarLimit = Math.min(GRAMMAR_SESSION_LIMIT, remainingGrammarReviewQuota);
        let dueGrammar: GrammarCard[] = [];
        if (type !== 'vocab') {
            let filterString = ``;
            if (type === 'toeic_p5') filterString = `AND type = 'TOEIC_P5'`;
            else if (type === 'toeic_p6') filterString = `AND type = 'TOEIC_P6'`;
            else if (type === 'toeic_p7') filterString = `AND type = 'TOEIC_P7'`;
            else if (type === 'grammar_other') filterString = `AND type NOT IN ('TOEIC_P5', 'TOEIC_P6', 'TOEIC_P7')`;

            dueGrammar = await prisma.$queryRawUnsafe(`
                SELECT * FROM "GrammarCard" 
                WHERE "userId" = $1 
                    AND interval > 0 
                    AND "nextReview" <= $2 
                    AND "isDeferred" = false
                    AND NOT (repetition = 1 AND "updatedAt" >= $3 AND "updatedAt" < $4)
                    ${filterString}
                ORDER BY "nextReview" ASC 
                LIMIT $5
            `, user.id, now, yesterdayStart, todayStart, dueGrammarLimit);
        }

    // Calculate remaining slots for new items in this session
    const vocabSlotsLeft = Math.max(0, VOCAB_SESSION_LIMIT - dueWords.length);
    const grammarSlotsLeft = Math.max(0, GRAMMAR_SESSION_LIMIT - dueGrammar.length);

    // 2. Lấy thêm một số từ MỚI (repetition = 0)
    let newWords: Vocabulary[] = [];
    if (vocabSlotsLeft > 0 && canLearnMoreCount > 0 && type !== 'grammar') {
        const fetchNewCount = Math.min(vocabSlotsLeft, canLearnMoreCount);
        const testNewWords: Vocabulary[] = await prisma.vocabulary.findMany({
            where: {
                userId: user.id,
                interval: 0,
                source: "TEST",
                importanceScore: { gte: 3 },
            },
            take: fetchNewCount,
            orderBy: { createdAt: 'asc' }
        });

        const remainingNewCount = fetchNewCount - testNewWords.length;
        let scheduledNewWords: Vocabulary[] = [];
        if (remainingNewCount > 0) {
            scheduledNewWords = await prisma.vocabulary.findMany({
                where: {
                    userId: user.id,
                    interval: 0,
                    source: "COLLECTION",
                    isDeferred: false,
                },
                take: remainingNewCount,
                orderBy: { createdAt: 'asc' }
            });
        }

        newWords = [...testNewWords, ...scheduledNewWords];
    }

    // 3. Lấy thêm một số câu NGỮ PHÁP MỚI (interval = 0)
    let newGrammar: GrammarCard[] = [];
    if (grammarSlotsLeft > 0 && canLearnMoreGrammarCount > 0 && type !== 'vocab') {
        const fetchGrammarCount = Math.min(grammarSlotsLeft, canLearnMoreGrammarCount);
        
        let newFilterString = ``;
        if (type === 'toeic_p5') newFilterString = `AND type = 'TOEIC_P5'`;
        else if (type === 'toeic_p6') newFilterString = `AND type = 'TOEIC_P6'`;
        else if (type === 'toeic_p7') newFilterString = `AND type = 'TOEIC_P7'`;
        else if (type === 'grammar_other') newFilterString = `AND type NOT IN ('TOEIC_P5', 'TOEIC_P6', 'TOEIC_P7')`;

        newGrammar = await prisma.$queryRawUnsafe(`
            SELECT * FROM "GrammarCard" 
            WHERE "userId" = $1 
              AND interval = 0 
              AND "isDeferred" = false
              ${newFilterString}
            ORDER BY "createdAt" ASC 
            LIMIT $2
        `, user.id, fetchGrammarCount);
    }

    // Interleave Logic: Mix Due and New items for better flow
    const combinedDue = [...dueWords, ...dueGrammar];
    const combinedNew = [...newWords, ...newGrammar];

    const interleaved: (Vocabulary | GrammarCard)[] = [];
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
            <ReviewSession dueWords={interleaved} />
        </main>
    );
}
