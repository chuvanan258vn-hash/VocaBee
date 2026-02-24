// app/page.tsx
import { auth } from '@/auth';
import AddWordForm from '@/components/AddWordForm';
import Dashboard from '@/components/Dashboard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getDashboardStats } from './actions';
import SmartCaptureTrigger from '@/components/SmartCaptureTrigger';
import SeedButton from '@/components/SeedButton';
import { getAuthenticatedUser } from '@/lib/user';
import Sidebar from '@/components/Sidebar';
import { LeaderboardWidget, ActivityWidget } from '@/components/DashboardWidgets';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const user = await getAuthenticatedUser();
  const stats = await getDashboardStats();

  // Lấy các từ đến hạn ôn tập (Thời điểm hiện tại)
  const now = new Date();

  let dueReviewsCount = 0;
  let hasNewWords = false;
  let allWords: any[] = [];
  if (user) {
    dueReviewsCount = await prisma.vocabulary.count({
      where: {
        userId: user.id,
        interval: { gt: 0 },
        nextReview: { lte: now },
        isDeferred: false
      } as any
    });

    hasNewWords = await prisma.vocabulary.count({
      where: {
        userId: user.id,
        interval: 0,
        nextReview: { lte: now }
      } as any
    }) > 0;

    // allWords logic removed - accessed via Vocabulary page
  }

  const canLearnNewVocab = stats && stats.learnedToday < stats.dailyGoal && hasNewWords;
  const showButton = dueReviewsCount > 0 || canLearnNewVocab;

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />

      <main className="flex-1 md:ml-64 relative h-screen overflow-y-auto no-scrollbar bg-background transition-colors">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-4 sm:px-8 py-5 flex items-center justify-between border-b border-glass-border">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-foreground p-2 rounded-lg hover:bg-surface/50">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-foreground text-xl font-bold tracking-tight hidden md:block">Dashboard</h2>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex items-center gap-2 bg-surface/50 border border-glass-border px-3 py-1.5 rounded-full backdrop-blur-sm" title={`${stats?.streak || 0} Day Streak`}>
              <span className="material-symbols-outlined text-amber-500 text-[20px] filled">local_fire_department</span>
              <span className="text-amber-500 font-bold text-sm">{stats?.streak || 0}</span>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-surface/50 border border-glass-border px-3 py-1.5 rounded-full backdrop-blur-sm" title={`${(stats?.points || 0).toLocaleString()} Bees`}>
              <span className="material-symbols-outlined text-primary text-[20px] filled">hive</span>
              <span className="text-primary font-bold text-sm">{(stats?.points || 0).toLocaleString()}</span>
            </div>
            <div className="h-8 w-px bg-glass-border mx-1 md:mx-2"></div>

            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground leading-none group-hover:text-primary transition-colors">{session.user?.name}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-medium uppercase tracking-wide">Level 5 Scholar</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 bg-cover bg-center border border-glass-border ring-2 ring-transparent group-hover:ring-primary/50 transition-all shadow-lg flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="p-4 sm:p-6 max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8 pb-24">
          {/* Daily Mission Banner */}
          {showButton && (
            <div className="amber-glass-gradient rounded-3xl p-1 md:p-1.5 shadow-glow relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 pointer-events-none"></div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/30 transition-colors duration-500"></div>
              <div className="bg-surface/40 backdrop-blur-md rounded-2xl p-6 md:px-8 md:py-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5">
                <div className="flex items-center gap-6 w-full md:w-auto relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                    <span className="material-symbols-outlined text-white text-3xl">menu_book</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      <p className="text-amber-500 dark:text-amber-200 text-xs font-bold uppercase tracking-widest">Nhiệm vụ hàng ngày</p>
                    </div>
                    <h3 className="text-foreground text-xl md:text-2xl font-bold tracking-tight">
                      Hệ thống đã trộn <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600 dark:from-amber-400 dark:to-yellow-200">
                        {dueReviewsCount > 0 ? `${dueReviewsCount} lượt` : 'nội dung mới'}
                      </span> ôn tập & từ mới
                    </h3>
                  </div>
                </div>
                <Link
                  href="/review"
                  className="relative z-10 w-full md:w-auto group overflow-hidden bg-primary text-[#0F172A] font-bold text-sm py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] hover:bg-amber-300 hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  BẮT ĐẦU NGAY
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </div>
          )}

          {stats && <Dashboard stats={stats} />}

          {allWords.length === 0 && <SeedButton />}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AddWordForm />
            </div>
            <div className="flex flex-col gap-8">
              <SmartCaptureTrigger />
              <LeaderboardWidget />
              <ActivityWidget />
            </div>
          </div>

          {/* WordList removed from Dashboard */}
        </div>
      </main>
    </div>
  );
}