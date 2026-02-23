// app/page.tsx
import { auth } from '@/auth';
import AddWordForm from '@/components/AddWordForm';
import WordList from '@/components/WordList';
import Dashboard from '@/components/Dashboard';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AccentSelector from '@/components/AccentSelector';
import { getDashboardStats } from './actions';
import SmartCaptureTrigger from '@/components/SmartCaptureTrigger';
import SeedButton from '@/components/SeedButton';
import { getAuthenticatedUser } from '@/lib/user';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();

  // Bảo vệ route: Nếu chưa login thì về trang login
  if (!session) {
    redirect('/login');
  }

  // const user = await prisma.user.findUnique({ where: { email: session.user?.email || "" } });
  const user = await getAuthenticatedUser();

  const stats = await getDashboardStats();

  // Lấy các từ đến hạn ôn tập (Thời điểm hiện tại)
  const now = new Date();

  let dueReviewsCount = 0;
  let hasNewWords = false;
  let allWords: any[] = [];
  if (user) {
    // 1. Lấy các từ ĐANG ÔN TẬP thực sự (đã học qua ít nhất 1 lần, kể cả đang bị quên)
    dueReviewsCount = await prisma.vocabulary.count({
      where: {
        userId: user.id,
        interval: { gt: 0 },
        nextReview: { lte: now },
        isDeferred: false
      } as any
    });

    // 2. Kiểm tra xem còn từ MỚI thực sự nào trong kho không (chưa từng học bao giờ)
    hasNewWords = await prisma.vocabulary.count({
      where: {
        userId: user.id,
        interval: 0,
        nextReview: { lte: now }
      } as any
    }) > 0;

    allWords = await prisma.vocabulary.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }

  // 3. Logic hiển thị nút: 
  // - Có từ vựng hoặc ngữ pháp cần ôn tập (ưu tiên cao)
  // - HOẶC (Chưa đạt mục tiêu ngày VÀ vẫn còn nội dung mới để nạp)
  const canLearnNewVocab = stats && stats.learnedToday < stats.dailyGoal && hasNewWords;
  const showButton = dueReviewsCount > 0 || canLearnNewVocab;

  return (
    <main className="flex min-h-screen flex-col items-center bg-background dark:bg-background transition-colors font-sans px-4 pb-20">
      {/* Sticky Header */}
      <header className="sticky top-4 z-50 w-full max-w-5xl glass rounded-2xl flex justify-between items-center p-2 sm:p-3 px-3 sm:px-6 shadow-xl mb-8 sm:mb-12 mt-4 mx-auto border border-white/20 dark:border-white/5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xl sm:text-2xl">🐝</span>
            <span className="text-lg sm:text-xl font-extrabold tracking-tighter bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">VocaBee</span>
          </div>
          <div className="hidden xs:block">
            <AccentSelector />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <SmartCaptureTrigger />
          <ThemeToggle />
          <UserMenu user={session.user as any} dailyGoal={stats?.dailyGoal || 20} />
        </div>
      </header>

      {stats && <Dashboard stats={stats} />}

      <div className="text-center mb-12">
        <h1 className="sr-only">VocaBee 🐝</h1>

        {/* Nút Nhiệm vụ (Hiện khi có từ cần ôn hoặc còn từ mới để học) */}
        {showButton && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link
              href="/review"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-black rounded-3xl shadow-2xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all group"
            >
              <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <span className="text-3xl">📖</span>
              </div>
              <div className="text-left">
                <p className="text-xs text-white/80 uppercase tracking-widest font-bold">Nhiệm vụ hàng ngày</p>
                <p className="text-xl">
                  {dueReviewsCount > 0
                    ? `Hệ thống đã trộn ${dueReviewsCount} lượt ôn tập & từ mới`
                    : `Khám phá nội dung mới ngay thôi!`}
                </p>
              </div>
              <span className="ml-6 text-2xl font-black">BẮT ĐẦU →</span>
            </Link>
          </div>
        )}
      </div>

      {allWords.length === 0 && <SeedButton />}

      <AddWordForm />

      <WordList
        initialWords={allWords}
        totalWords={stats?.totalWords || 0}
        availableWordTypes={stats?.allWordTypes || []}
      />
    </main>
  );
}