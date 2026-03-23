const fs = require('fs');
let code = fs.readFileSync('./app/actions.ts', 'utf8');

const replacement = `export async function getDashboardStats() {
  const userBase = await getAuthenticatedUser();
  if (!userBase) return null;

  // Re-fetch with include
  const user = await prisma.user.findUnique({
    where: { id: userBase.id },
    include: {
      _count: {
        select: { words: true }
      }
    }
  });

  if (!user) return null;

  // Calculate "Today" starting from 4:00 AM
  const now = new Date();
  const todayStart = new Date(now);
  if (now.getHours() < 4) {
    todayStart.setDate(todayStart.getDate() - 1);
  }
  todayStart.setHours(4, 0, 0, 0);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  // Group all independent sequential queries into a single Promise.all
  const [
    learnedToday,
    learnedGrammarToday,
    unlearnedYesterdayVocab,
    unlearnedYesterdayGrammar,
    availableNewVocabCount,
    availableNewGrammarCount,
    alreadyReviewedVocabToday,
    rawVocabDueCount,
    alreadyReviewedGrammarRaw,
    grammarDue,
    vTest,
    wordTypesData
  ] = await Promise.all([
    // 1. Count items successfully learned for the FIRST TIME today (interval: 0 -> interval > 0)
    prisma.vocabulary.count({
      where: {
        userId: user.id,
        updatedAt: { gte: todayStart },
        repetition: 1
      } as any
    }),
    (prisma as any).grammarCard.count({
      where: {
        userId: user.id,
        updatedAt: { gte: todayStart },
        repetition: 1
      }
    }),
    // 2. Count items added YESTERDAY (unlearned)
    prisma.vocabulary.count({
      where: {
        userId: user.id,
        interval: 0,
        isDeferred: false,
        createdAt: { gte: yesterdayStart, lt: todayStart }
      } as any
    }),
    (prisma as any).grammarCard.count({
      where: {
        userId: user.id,
        interval: 0,
        isDeferred: false,
        createdAt: { gte: yesterdayStart, lt: todayStart }
      }
    }),
    // 4. Calculate actual available new items (interval = 0)
    prisma.vocabulary.count({
      where: { userId: user.id, interval: 0, isDeferred: false } as any
    }),
    (prisma as any).grammarCard.count({
      where: { userId: user.id, interval: 0, isDeferred: false }
    }),
    // A. Vocabulary already reviewed today
    prisma.vocabulary.count({
      where: {
        userId: user.id,
        updatedAt: { gte: todayStart },
        repetition: { gt: 1 }
      } as any
    }),
    // rawVocabDueCount
    prisma.vocabulary.count({
      where: {
        userId: user.id,
        interval: { gt: 0 },
        nextReview: { lte: now },
        isDeferred: false
      } as any
    }),
    // B. Grammar already reviewed
    prisma.$queryRawUnsafe(\`
      SELECT COUNT(*) as count FROM "GrammarCard" 
      WHERE "userId" = $1 
        AND "updatedAt" >= $2
        AND repetition > 1
    \`, user.id, todayStart) as Promise<{ count: bigint }[]>,
    // rawGrammarDueCount
    prisma.$queryRawUnsafe(\`
      SELECT COUNT(*) as count FROM "GrammarCard" 
      WHERE "userId" = $1 
        AND interval > 0 
        AND "nextReview" <= $2 
        AND "isDeferred" = false
        AND NOT (repetition = 1 AND "updatedAt" >= $3 AND "updatedAt" < $4)
    \`, user.id, now, yesterdayStart, todayStart) as Promise<any[]>,
    // testVocabToday
    // Wrap in catch to handled un-migrated schema safely
    prisma.$queryRawUnsafe(
      \`SELECT COUNT(*) as count FROM "Vocabulary" WHERE "userId" = $1 AND source = 'TEST' AND "importanceScore" >= 3 AND "createdAt" >= $2\`,
      user.id,
      todayStart
    ).catch(() => {
      console.log("Smart Capture columns not yet migrated, skipping test item count");
      return [{ count: 0 }];
    }) as Promise<any[]>,
    // Fetch all unique word types for the user (for filtering)
    prisma.vocabulary.findMany({
      where: { userId: user.id },
      select: { wordType: true },
      distinct: ['wordType']
    })
  ]);

  // 3. Calculate Goals
  const vUser = user as unknown as VocaBeeUser;
  const baseVocabGoal = vUser.dailyNewWordGoal || 30;
  const totalVocabGoal = baseVocabGoal + unlearnedYesterdayVocab;

  const baseGrammarGoal = vUser.dailyNewGrammarGoal || 30;
  const totalGrammarGoal = baseGrammarGoal + unlearnedYesterdayGrammar;

  // Calculate "Can Learn More" (Dynamic Goal Progress limited by available DB items)
  const canLearnMoreCount = Math.min(
    Math.max(0, totalVocabGoal - learnedToday),
    availableNewVocabCount
  );
  const canLearnMoreGrammarCount = Math.min(
    Math.max(0, totalGrammarGoal - learnedGrammarToday),
    availableNewGrammarCount
  );

  // --- BANNER COUNTS ---
  // A. Vocabulary
  const MAX_DAILY_VOCAB_REVIEWS = vUser.dailyMaxVocabReview || 100;
  const remainingVocabReviewQuota = Math.max(0, MAX_DAILY_VOCAB_REVIEWS - alreadyReviewedVocabToday);

  const vocabDueCount = Math.min(rawVocabDueCount, remainingVocabReviewQuota);
  const totalDueVocab = vocabDueCount + canLearnMoreCount;

  // B. Grammar
  const alreadyReviewedGrammarToday = Number(alreadyReviewedGrammarRaw[0]?.count || 0);
  const MAX_DAILY_GRAMMAR_REVIEWS = vUser.dailyMaxGrammarReview || 50;
  const remainingGrammarReviewQuota = Math.max(0, MAX_DAILY_GRAMMAR_REVIEWS - alreadyReviewedGrammarToday);

  const rawGrammarDueCountResolved = Number(grammarDue[0]?.count || 0);
  const grammarDueCount = Math.min(rawGrammarDueCountResolved, remainingGrammarReviewQuota);
  const totalDueGrammar = grammarDueCount + canLearnMoreGrammarCount;

  let currentStreak = vUser.streakCount || 0;
  const lastGoalMetDate = vUser.lastGoalMetDate ? new Date(vUser.lastGoalMetDate) : null;

  // Reset streak if last goal met was before yesterday (and wasn't met today yet)
  // Check for Streak Freeze protection visually
  let streakFrozen = false;
  if (lastGoalMetDate && lastGoalMetDate < yesterdayStart) {
    // Missed yesterday. Check if missed ONLY yesterday?
    const twoDaysAgo = new Date(yesterdayStart);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);

    if (lastGoalMetDate >= twoDaysAgo && vUser.streakFreeze > 0) {
      // Missed 1 day but has freeze -> Show streak as frozen (not 0)
      streakFrozen = true;
      // Don't reset currentStreak variable for display
    } else {
      currentStreak = 0;
    }
  }

  // testVocabToday processing
  const testVocabTodayCount = Number(vTest[0]?.count || 0);

  const allWordTypes = wordTypesData
    .map(w => w.wordType?.trim())
    .filter(w => !!w)
    .sort();

  return {
    dailyGoal: totalVocabGoal + totalGrammarGoal,
    learnedToday,
    learnedGrammarToday,
    testVocabToday: testVocabTodayCount,
    totalWords: user._count.words,
    dueReviews: totalDueVocab,
    dueGrammarCount: totalDueGrammar,
    rawVocabDueCount: rawVocabDueCount,
    rawGrammarDueCount: rawGrammarDueCountResolved,
    wordTypes: allWordTypes,
    streak: currentStreak,
    points: vUser.points || 0,
    streakFrozen
  };
}`;

const startIndex = code.indexOf('export async function getDashboardStats() {');
const endIndex = code.indexOf('export async function checkWordsExistenceAction', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    code = code.slice(0, startIndex) + replacement + "\n\n" + code.slice(endIndex);
    fs.writeFileSync('./app/actions.ts', code);
    console.log("Replaced successfully!");
} else {
    console.error("Could not find start or end bounds.");
}
