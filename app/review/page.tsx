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

    // ─── OPTIMIZATION: Gộp 8+ sequential queries thành 2 parallel SQL aggregations ───
    // OLD: 8-10 sequential Prisma/raw calls (~6-10s)
    // NEW: 2 SQL FILTER aggregations + Promise.all (~1 round-trip, ~1s)
    // ─────────────────────────────────────────────────────────────────────────────────
    const [vocabCounts, grammarCounts, testVocabRaw] = await Promise.all([

        // ① Tất cả Vocabulary counts trong 1 SQL
        prisma.$queryRawUnsafe<any[]>(`
            SELECT
                COUNT(*) FILTER (WHERE "updatedAt" >= $2 AND repetition = 1)                         AS "learnedToday",
                COUNT(*) FILTER (WHERE interval = 0 AND "isDeferred" = false
                                       AND "createdAt" >= $3 AND "createdAt" < $2)                   AS "unlearnedYesterday",
                COUNT(*) FILTER (WHERE "updatedAt" >= $2 AND repetition > 1)                         AS "alreadyReviewed",
                COUNT(*) FILTER (WHERE interval > 0 AND "nextReview" <= $1 AND "isDeferred" = false) AS "rawDueCount"
            FROM "Vocabulary"
            WHERE "userId" = $4
        `, now, todayStart, yesterdayStart, user.id),

        // ② Tất cả GrammarCard counts trong 1 SQL
        prisma.$queryRawUnsafe<any[]>(`
            SELECT
                COUNT(*) FILTER (WHERE "updatedAt" >= $2 AND repetition = 1)                         AS "learnedToday",
                COUNT(*) FILTER (WHERE interval = 0 AND "isDeferred" = false
                                       AND "createdAt" >= $3 AND "createdAt" < $2)                   AS "unlearnedYesterday",
                COUNT(*) FILTER (WHERE "updatedAt" >= $2 AND repetition > 1)                         AS "alreadyReviewed",
                COUNT(*) FILTER (WHERE interval > 0 AND "nextReview" <= $1 AND "isDeferred" = false
                                       AND NOT (repetition = 1 AND "updatedAt" >= $3
                                                AND "updatedAt" < $2))                               AS "rawDueCount"
            FROM "GrammarCard"
            WHERE "userId" = $4
        `, now, todayStart, yesterdayStart, user.id),

        // ③ TEST vocab high-prio count (kept separate with .catch())
        prisma.$queryRawUnsafe<any[]>(
            `SELECT COUNT(*) AS count FROM "Vocabulary"
             WHERE "userId" = $1 AND source = 'TEST' AND "importanceScore" >= 3 AND "createdAt" >= $2`,
            user.id, todayStart
        ).catch(() => [{ count: 0 }]),
    ]);

    // ─── Extract & cast (PostgreSQL COUNT returns bigint) ────────────────────────
    const vc = vocabCounts[0] || {};
    const gc = grammarCounts[0] || {};

    const learnedTodayCount           = Number(vc.learnedToday       || 0);
    const unlearnedYesterdayVocab     = Number(vc.unlearnedYesterday  || 0);
    const alreadyReviewedVocabToday   = Number(vc.alreadyReviewed     || 0);
    const rawVocabDueCount            = Number(vc.rawDueCount         || 0);
    const testVocabToday              = Number(testVocabRaw[0]?.count || 0);

    const learnedGrammarToday         = Number(gc.learnedToday        || 0);
    const unlearnedYesterdayGrammar   = Number(gc.unlearnedYesterday   || 0);
    const alreadyReviewedGrammarToday = Number(gc.alreadyReviewed      || 0);
    const rawGrammarDueCount          = Number(gc.rawDueCount          || 0);

    // ─── Compute goals & quotas ──────────────────────────────────────────────────
    const vUser = user as unknown as VocaBeeUser;

    const baseVocabGoal = vUser.dailyNewWordGoal || 30;
    const totalVocabGoal = baseVocabGoal + unlearnedYesterdayVocab;
    const canLearnMoreCount = Math.max(0, totalVocabGoal - learnedTodayCount);

    const baseGrammarGoal = vUser.dailyNewGrammarGoal || 30;
    const totalGrammarGoal = baseGrammarGoal + unlearnedYesterdayGrammar;
    const canLearnMoreGrammarCount = Math.max(0, totalGrammarGoal - learnedGrammarToday);

    const MAX_DAILY_VOCAB_REVIEWS = vUser.dailyMaxVocabReview ?? 100;
    const remainingVocabReviewQuota = isReviewAll ? 9999 : Math.max(0, MAX_DAILY_VOCAB_REVIEWS - alreadyReviewedVocabToday);
    const vocabDueCount = Math.min(rawVocabDueCount, remainingVocabReviewQuota);
    const totalPotentialVocab = vocabDueCount + canLearnMoreCount;

    const MAX_DAILY_GRAMMAR_REVIEWS = vUser.dailyMaxGrammarReview ?? 50;
    const remainingGrammarReviewQuota = isReviewAll ? 9999 : Math.max(0, MAX_DAILY_GRAMMAR_REVIEWS - alreadyReviewedGrammarToday);
    const effectiveGrammarDueCount = Math.min(rawGrammarDueCount, remainingGrammarReviewQuota);
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
    const dueWords: Vocabulary[] = (type === 'grammar') ? [] : await prisma.$queryRawUnsafe(`
        SELECT id, word, "wordType", meaning, pronunciation, example, synonyms, context, "importanceScore", source, "isDeferred", "nextReview", interval, repetition, efactor, "userId", "createdAt", "updatedAt"
        FROM "Vocabulary"
        WHERE "userId" = $1
          AND interval > 0
          AND "nextReview" <= $2
          AND "isDeferred" = false
        ORDER BY "nextReview" ASC
        LIMIT $3
    `, user.id, now, dueVocabLimit);

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
        const testNewWords: Vocabulary[] = await prisma.$queryRawUnsafe(`
            SELECT id, word, "wordType", meaning, pronunciation, example, synonyms, context, "importanceScore", source, "isDeferred", "nextReview", interval, repetition, efactor, "userId", "createdAt", "updatedAt"
            FROM "Vocabulary"
            WHERE "userId" = $1
              AND interval = 0
              AND source = 'TEST'
              AND "importanceScore" >= 3
            ORDER BY "createdAt" ASC
            LIMIT $2
        `, user.id, fetchNewCount);

        const remainingNewCount = fetchNewCount - testNewWords.length;
        let scheduledNewWords: Vocabulary[] = [];
        if (remainingNewCount > 0) {
            scheduledNewWords = await prisma.$queryRawUnsafe(`
                SELECT id, word, "wordType", meaning, pronunciation, example, synonyms, context, "importanceScore", source, "isDeferred", "nextReview", interval, repetition, efactor, "userId", "createdAt", "updatedAt"
                FROM "Vocabulary"
                WHERE "userId" = $1
                  AND interval = 0
                  AND source = 'COLLECTION'
                  AND "isDeferred" = false
                ORDER BY "createdAt" ASC
                LIMIT $2
            `, user.id, remainingNewCount);
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
