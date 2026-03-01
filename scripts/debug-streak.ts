/**
 * Debug script: Kiểm tra streak của user
 * Chạy bằng: npx ts-node --skip-project scripts/debug-streak.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Lấy user đầu tiên (hoặc thay bằng email cụ thể)
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            dailyNewWordGoal: true,
            streakCount: true,
            lastGoalMetDate: true,
            streakFreeze: true,
        } as any,
        take: 5,
    });

    const now = new Date();
    // Tính todayStart (4:00 AM giờ local)
    const todayStart = new Date(now);
    if (now.getHours() < 4) todayStart.setDate(todayStart.getDate() - 1);
    todayStart.setHours(4, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const twoDaysAgo = new Date(yesterdayStart);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);

    console.log('\n========== STREAK DEBUG ==========');
    console.log('⏰ Thời điểm hiện tại (local):', now.toLocaleString('vi-VN'));
    console.log('📅 "Hôm nay" bắt đầu từ:       ', todayStart.toLocaleString('vi-VN'));
    console.log('📅 "Hôm qua" bắt đầu từ:        ', yesterdayStart.toLocaleString('vi-VN'));
    console.log('📅 "2 ngày trước" bắt đầu từ:   ', twoDaysAgo.toLocaleString('vi-VN'));

    for (const user of users) {
        const u = user as any;
        console.log('\n------ USER:', u.email, '------');
        console.log('  streakCount:     ', u.streakCount);
        console.log('  streakFreeze:    ', u.streakFreeze);
        console.log('  dailyNewWordGoal:', u.dailyNewWordGoal || 20);

        const lastGoalMetDate = u.lastGoalMetDate ? new Date(u.lastGoalMetDate) : null;
        if (lastGoalMetDate) {
            console.log('  lastGoalMetDate: ', lastGoalMetDate.toLocaleString('vi-VN'));

            // Phân tích vị trí của lastGoalMetDate
            if (lastGoalMetDate >= todayStart) {
                console.log('  → Đã đạt mục tiêu HÔM NAY ✅ (alreadyMetToday = true, streak KHÔNG tăng thêm)');
            } else if (lastGoalMetDate >= yesterdayStart && lastGoalMetDate < todayStart) {
                console.log('  → lastGoalMetDate là HÔM QUA ✅ → Nếu đạt mục tiêu hôm nay thì streak sẽ +1');
            } else if (lastGoalMetDate >= twoDaysAgo && lastGoalMetDate < yesterdayStart) {
                console.log('  → lastGoalMetDate là 2 NGÀY TRƯỚC ⚠️ → Bỏ 1 ngày, cần streakFreeze để giữ streak');
            } else {
                console.log('  → lastGoalMetDate quá cũ ❌ → Streak sẽ reset về 1');
            }
        } else {
            console.log('  lastGoalMetDate:  NULL (chưa bao giờ đạt mục tiêu)');
        }

        // Đếm learnedToday (theo logic streak trong reviewWordAction)
        const learnedTodayStreak = await prisma.vocabulary.count({
            where: {
                userId: u.id,
                repetition: { gte: 1 },
                updatedAt: { gte: todayStart },
            },
        });

        // Đếm learnedToday (theo logic dashboard)
        const learnedTodayDashboard = await prisma.vocabulary.count({
            where: {
                userId: u.id,
                updatedAt: { gte: todayStart },
                OR: [
                    { repetition: { gte: 1 } },
                    { nextReview: { gt: now } },
                ],
            } as any,
        });

        const goal = u.dailyNewWordGoal || 20;
        console.log(`\n  📊 Số từ đã học HÔM NAY:`);
        console.log(`     - Theo STREAK logic (repetition ≥ 1):           ${learnedTodayStreak} / ${goal} ${learnedTodayStreak >= goal ? '✅ ĐẠT' : '❌ CHƯA ĐẠT'}`);
        console.log(`     - Theo DASHBOARD logic (incl. nextReview > now): ${learnedTodayDashboard} / ${goal} ${learnedTodayDashboard >= goal ? '✅ ĐẠT' : '❌ CHƯA ĐẠT'}`);

        if (learnedTodayDashboard >= goal && learnedTodayStreak < goal) {
            console.log('\n  ⚠️  PHÁT HIỆN VẤN ĐỀ:');
            console.log('     Dashboard hiển thị "đạt mục tiêu" nhưng streak logic tính THẤP HƠN!');
            console.log('     Nguyên nhân: Dashboard đếm cả từ bị "Quên" (nextReview > now)');
            console.log('     nhưng streak chỉ đếm từ có repetition ≥ 1 (đang trong chuỗi nhớ).');
        }
    }

    console.log('\n==================================\n');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
