
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const userId = '87fa33f1-3812-4fd1-a0e2-bcc0c1db1094';
  
  const now = new Date();
  const todayStart = new Date(now);
  if (now.getHours() < 4) todayStart.setDate(todayStart.getDate() - 1);
  todayStart.setHours(4, 0, 0, 0);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  const learnedToday = await prisma.vocabulary.count({
    where: { userId, updatedAt: { gte: todayStart }, repetition: 1 }
  });

  const unlearnedYesterdayVocab = await prisma.vocabulary.count({
    where: { userId, interval: 0, isDeferred: false, createdAt: { gte: yesterdayStart, lt: todayStart } }
  });

  const vGoal = user.dailyNewWordGoal || 20;
  const gGoal = user.dailyNewGrammarGoal || 10;

  const totalVocabGoal = vGoal + unlearnedYesterdayVocab;
  
  const availableNewVocabCount = await prisma.vocabulary.count({
    where: { userId, interval: 0, isDeferred: false }
  });

  const canLearnMoreCount = Math.min(
    Math.max(0, totalVocabGoal - learnedToday),
    availableNewVocabCount
  );

  const vocabDueCount = await prisma.vocabulary.count({
    where: { userId, interval: { gt: 0 }, nextReview: { lte: now }, isDeferred: false }
  });

  const totalDueVocab = Math.min(vocabDueCount, 100) + canLearnMoreCount;

  console.log(JSON.stringify({
    dailyGoal: vGoal,
    learnedToday,
    unlearnedYesterday: unlearnedYesterdayVocab,
    totalVocabGoal,
    canLearnMoreCount,
    vocabDueCount,
    totalDueVocab,
    percentage: Math.round((learnedToday / vGoal) * 100)
  }, null, 2));

  await prisma.$disconnect();
}

run();
