// Ensure DATABASE_URL is set for local runs
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:D:/AI/VocaBee/prisma/dev.db';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = '87fa33f1-3812-4fd1-a0e2-bcc0c1db1094';
  const newGoal = 20;
  try {
    const before = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, dailyNewGrammarGoal: true } });
    console.log('Before:', before);
    const res = await prisma.user.update({ where: { id: userId }, data: { dailyNewGrammarGoal: newGoal } });
    console.log('Updated:', { id: res.id, dailyNewGrammarGoal: res.dailyNewGrammarGoal });
  } catch (e) {
    console.error('Error updating user goal:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
