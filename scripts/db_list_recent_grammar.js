const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const userId = '87fa33f1-3812-4fd1-a0e2-bcc0c1db1094';
    const now = new Date();
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    console.log('Listing grammar cards for user:', userId);
    const recent = await prisma.grammarCard.findMany({
      where: { userId, createdAt: { gte: threeDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, prompt: true, interval: true, repetition: true, createdAt: true, updatedAt: true, nextReview: true }
    });

    console.log('Found', recent.length, 'cards created in last 3 days');
    recent.forEach(r => {
      console.log(JSON.stringify(r, null, 2));
    });
  } catch (e) {
    console.error('Error listing recent grammar:', e);
  } finally {
    await prisma.$disconnect();
  }
}

// Ensure DATABASE_URL for local run
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:D:/AI/VocaBee/prisma/dev.db';

main();
