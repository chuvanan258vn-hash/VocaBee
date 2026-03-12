const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const userId = process.env.USER_ID || '87fa33f1-3812-4fd1-a0e2-bcc0c1db1094';
    const now = new Date();

    const todayStart = new Date(now);
    if (now.getHours() < 4) {
      todayStart.setDate(todayStart.getDate() - 1);
    }
    todayStart.setHours(4,0,0,0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // learned today (first time learned)
    const learnedToday = await prisma.vocabulary.count({
      where: { userId, updatedAt: { gte: todayStart }, repetition: 1 }
    });

    const learnedGrammarToday = await prisma.grammarCard.count({
      where: { userId, updatedAt: { gte: todayStart }, repetition: 1 }
    });

    const unlearnedYesterdayVocab = await prisma.vocabulary.count({
      where: { userId, interval: 0, isDeferred: false, createdAt: { gte: yesterdayStart, lt: todayStart } }
    });

    const unlearnedYesterdayGrammar = await prisma.grammarCard.count({
      where: { userId, interval: 0, isDeferred: false, createdAt: { gte: yesterdayStart, lt: todayStart } }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const baseVocabGoal = (user && (user.dailyNewWordGoal || 0)) || 30;
    const totalVocabGoal = baseVocabGoal + unlearnedYesterdayVocab;
    const baseGrammarGoal = (user && (user.dailyNewGrammarGoal || 0)) || 30;
    const totalGrammarGoal = baseGrammarGoal + unlearnedYesterdayGrammar;

    const availableNewVocabCount = await prisma.vocabulary.count({ where: { userId, interval: 0, isDeferred: false } });
    const availableNewGrammarCount = await prisma.grammarCard.count({ where: { userId, interval: 0, isDeferred: false } });

    const canLearnMoreCount = Math.min(Math.max(0, totalVocabGoal - learnedToday), availableNewVocabCount);
    const canLearnMoreGrammarCount = Math.min(Math.max(0, totalGrammarGoal - learnedGrammarToday), availableNewGrammarCount);

    const vocabDueCount = await prisma.vocabulary.count({ where: { userId, interval: { gt: 0 }, nextReview: { lte: now }, isDeferred: false } });
    const vocabDueToStudy = Math.min(vocabDueCount, 100);
    const totalDueVocab = vocabDueToStudy + canLearnMoreCount;

    const grammarDueRaw = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM GrammarCard 
      WHERE userId = ? 
        AND interval > 0 
        AND nextReview <= ? 
        AND isDeferred = 0
        AND NOT (repetition = 1 AND updatedAt >= ? AND updatedAt < ?)
    `, userId, now.toISOString(), yesterdayStart.toISOString(), todayStart.toISOString());
    const grammarDueCount = Number(grammarDueRaw[0]?.count || 0);
    const grammarDueToStudy = Math.min(grammarDueCount, 30);
    const totalDueGrammar = grammarDueToStudy + canLearnMoreGrammarCount;

    console.log('--- Banner counts breakdown for user:', userId, '---');
    console.log('now:', now.toISOString());
    console.log('todayStart (4:00am):', todayStart.toISOString());
    console.log('yesterdayStart:', yesterdayStart.toISOString());
    console.log('learnedToday (vocab, first-time):', learnedToday);
    console.log('learnedGrammarToday (grammar, first-time):', learnedGrammarToday);
    console.log('unlearnedYesterdayVocab:', unlearnedYesterdayVocab);
    console.log('unlearnedYesterdayGrammar:', unlearnedYesterdayGrammar);
    console.log('baseVocabGoal:', baseVocabGoal);
    console.log('totalVocabGoal (base + unlearnedYesterday):', totalVocabGoal);
    console.log('baseGrammarGoal:', baseGrammarGoal);
    console.log('totalGrammarGoal (base + unlearnedYesterday):', totalGrammarGoal);
    console.log('availableNewVocabCount (interval=0):', availableNewVocabCount);
    console.log('availableNewGrammarCount (interval=0):', availableNewGrammarCount);
    console.log('canLearnMoreCount:', canLearnMoreCount);
    console.log('canLearnMoreGrammarCount:', canLearnMoreGrammarCount);
    console.log('rawVocabDueCount (interval>0 & nextReview<=now):', vocabDueCount);
    console.log('vocabDueToStudy (min cap):', vocabDueToStudy);
    console.log('totalDueVocab (vocabDueToStudy + canLearnMore):', totalDueVocab);
    console.log('rawGrammarDueCount:', grammarDueCount);
    console.log('grammarDueToStudy (min cap):', grammarDueToStudy);
    console.log('totalDueGrammar (grammarDueToStudy + canLearnMoreGrammar):', totalDueGrammar);
    console.log('dailyGoal total (vocab+grammar):', totalVocabGoal + totalGrammarGoal);

  } catch (e) {
    console.error('Error computing counts:', e);
  } finally {
    await prisma.$disconnect();
  }
}

// ensure DATABASE_URL fallback for local
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:D:/AI/VocaBee/prisma/dev.db';

main();
