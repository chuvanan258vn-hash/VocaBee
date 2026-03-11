// Ensure DATABASE_URL is set for Prisma when running this script locally
// Use absolute path to SQLite DB to avoid relative path issues on Windows
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:D:/AI/VocaBee/prisma/dev.db';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    if (now.getHours() < 4) todayStart.setDate(todayStart.getDate() - 1);
    todayStart.setHours(4, 0, 0, 0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    console.log('now =', now.toISOString());
    console.log('todayStart =', todayStart.toISOString());
    console.log('yesterdayStart =', yesterdayStart.toISOString());

    const grammarNewYesterday = await prisma.grammarCard.count({
      where: {
        interval: 0,
        isDeferred: false,
        createdAt: { gte: yesterdayStart, lt: todayStart }
      }
    });

    const availableNewGrammarCount = await prisma.grammarCard.count({
      where: { interval: 0, isDeferred: false }
    });

    const grammarDueCount = await prisma.grammarCard.count({
      where: { interval: { gt: 0 }, nextReview: { lte: now }, isDeferred: false }
    });

    const specific = await prisma.grammarCard.findFirst({
      where: { prompt: { contains: 'Good weather' } },
      select: { id: true, userId: true, prompt: true, interval: true, repetition: true, isDeferred: true, createdAt: true, updatedAt: true, nextReview: true }
    });

    let userScoped = null;
    if (specific && specific.userId) {
      const userId = specific.userId;
      const learnedGrammarTodayUser = await prisma.grammarCard.count({
        where: { userId, updatedAt: { gte: todayStart }, repetition: 1 }
      });
      const unlearnedYesterdayGrammarUser = await prisma.grammarCard.count({
        where: { userId, interval: 0, isDeferred: false, createdAt: { gte: yesterdayStart, lt: todayStart } }
      });
      const baseGrammarGoal = (await prisma.user.findUnique({ where: { id: userId }, select: { dailyNewGrammarGoal: true } }))?.dailyNewGrammarGoal || 30;
      const totalGrammarGoal = baseGrammarGoal + unlearnedYesterdayGrammarUser;
      const availableNewGrammarCountUser = await prisma.grammarCard.count({ where: { userId, interval: 0, isDeferred: false } });
      const canLearnMoreGrammarCountUser = Math.min(Math.max(0, totalGrammarGoal - learnedGrammarTodayUser), availableNewGrammarCountUser);
      const grammarDueCountUser = await prisma.grammarCard.count({ where: { userId, interval: { gt: 0 }, nextReview: { lte: now }, isDeferred: false } });

      userScoped = { userId, learnedGrammarTodayUser, unlearnedYesterdayGrammarUser, baseGrammarGoal, totalGrammarGoal, availableNewGrammarCountUser, canLearnMoreGrammarCountUser, grammarDueCountUser };
    }

    console.log('\nResults:');
    console.log({ grammarNewYesterday, availableNewGrammarCount, grammarDueCount, specific, userScoped });
  } catch (e) {
    console.error('Error running checks:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
