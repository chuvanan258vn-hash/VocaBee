// app/vocabulary/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/user';
import Sidebar from '@/components/Sidebar';
import { getDashboardStats, getWordsPaginatedAction } from '@/app/actions';
import { ThemeToggle } from '@/components/ThemeToggle';
import WordList from '@/components/WordList';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function VocabularyPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    const user = await getAuthenticatedUser();
    const stats = await getDashboardStats();

    // Get all unique word types for filtering
    const allWordTypes = stats?.allWordTypes || [];

    // Lấy 20 từ đầu tiên để SSR ban đầu
    const allWords = await prisma.vocabulary.findMany({
        where: { userId: user?.id },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

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
                        <h2 className="text-foreground text-xl font-bold tracking-tight hidden md:block text-shadow-gold">Tổ ong Từ vựng</h2>
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
                                <p className="text-[10px] text-slate-500 mt-1 font-medium uppercase tracking-wide">Kho lưu trữ 🐝</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/20 bg-cover bg-center border border-glass-border ring-2 ring-transparent group-hover:ring-primary/50 transition-all shadow-lg flex items-center justify-center">
                                <span className="text-lg">👤</span>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </header>

                <div className="p-4 sm:p-6 max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8 pb-24">
                    <WordList
                        initialWords={allWords}
                        totalWords={stats?.totalWords || 0}
                        availableWordTypes={allWordTypes}
                    />
                </div>
            </main>
        </div>
    );
}
