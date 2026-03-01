const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({ take: 5 });
    const now = new Date();
    const todayStart = new Date(now);
    if (now.getHours() < 4) todayStart.setDate(todayStart.getDate() - 1);
    todayStart.setHours(4, 0, 0, 0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const twoDaysAgo = new Date(yesterdayStart);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);

    const opts = { timeZone: 'Asia/Ho_Chi_Minh' };
    console.log('=== STREAK DEBUG ===');
    console.log('Now:             ', now.toLocaleString('vi-VN', opts));
    console.log('Today start:     ', todayStart.toLocaleString('vi-VN', opts));
    console.log('Yesterday start: ', yesterdayStart.toLocaleString('vi-VN', opts));

    for (const u of users) {
        const lastGoalMetDate = u.lastGoalMetDate ? new Date(u.lastGoalMetDate) : null;
        const goal = u.dailyNewWordGoal || 20;

        const learnedStreak = await prisma.vocabulary.count({
            where: {
                userId: u.id,
                repetition: { gte: 1 },
                updatedAt: { gte: todayStart }
            }
        });

        const learnedDash = await prisma.vocabulary.count({
            where: {
                userId: u.id,
                updatedAt: { gte: todayStart },
                OR: [
                    { repetition: { gte: 1 } },
                    { nextReview: { gt: now } }
                ]
            }
        });

        console.log('\n--- USER:', u.email, '---');
        console.log('  streak:', u.streakCount, '| goal:', goal, '| freeze:', u.streakFreeze);
        console.log('  lastGoalMetDate RAW:', u.lastGoalMetDate);
        if (lastGoalMetDate) {
            console.log('  lastGoalMetDate:', lastGoalMetDate.toLocaleString('vi-VN', opts));
            if (lastGoalMetDate >= todayStart) {
                console.log('  -> Da dat muc tieu HOM NAY (alreadyMetToday=true, streak KHONG tang them nua)');
            } else if (lastGoalMetDate >= yesterdayStart) {
                console.log('  -> lastGoalMetDate = HOM QUA => neu dat hom nay streak se +1');
            } else if (lastGoalMetDate >= twoDaysAgo) {
                console.log('  -> lastGoalMetDate = 2 NGAY TRUOC => can streakFreeze de giu streak');
            } else {
                console.log('  -> lastGoalMetDate qua cu => streak se reset ve 1');
            }
        } else {
            console.log('  lastGoalMetDate: NULL (chua bao gio dat muc tieu)');
        }

        console.log('  learnedToday streak-logic (rep>=1):           ', learnedStreak, '/', goal, learnedStreak >= goal ? '[DAT ✓]' : '[CHUA DAT]');
        console.log('  learnedToday dashboard-logic (incl. quen):   ', learnedDash, '/', goal, learnedDash >= goal ? '[DAT ✓]' : '[CHUA DAT]');

        if (learnedDash >= goal && learnedStreak < goal) {
            console.log('  *** PHAT HIEN BUG ***');
            console.log('  Dashboard hien thi "dat" nhung streak-logic CHUA du so tu!');
            console.log('  => Dashboard dem ca tu bi Quen (nextReview > now, repetition=0)');
            console.log('  => Streak chi dem tu co repetition >= 1');
        }
    }

    await prisma.$disconnect();
}

main().catch(console.error);
