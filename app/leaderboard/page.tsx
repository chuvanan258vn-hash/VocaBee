// app/leaderboard/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/user';
import Sidebar from '@/components/Sidebar';
import { getLeaderboardAction, getDashboardStats } from '@/app/actions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Crown, Trophy, Medal } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    const user = await getAuthenticatedUser();
    const leaderboardData = await getLeaderboardAction();
    const stats = await getDashboardStats();

    if ('error' in leaderboardData) {
        return <div>Lỗi khi tải bảng xếp hạng: {leaderboardData.error}</div>;
    }

    const users = leaderboardData.users || [];
    const top3 = users.slice(0, 3);
    const others = users.slice(3);
    const currentUserRank = users.findIndex(u => u.id === user?.id) + 1;

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
                        <h2 className="text-foreground text-xl font-bold tracking-tight hidden md:block text-shadow-gold">Bảng vinh danh</h2>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="hidden md:flex items-center gap-2 bg-surface/50 border border-glass-border px-3 py-1.5 rounded-full backdrop-blur-sm">
                            <span className="material-symbols-outlined text-amber-500 text-[20px] filled">local_fire_department</span>
                            <span className="text-amber-500 font-bold text-sm">{stats?.streak || 0}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 bg-surface/50 border border-glass-border px-3 py-1.5 rounded-full backdrop-blur-sm">
                            <span className="material-symbols-outlined text-primary text-[20px] filled">hive</span>
                            <span className="text-primary font-bold text-sm">{(stats?.points || 0).toLocaleString()}</span>
                        </div>
                        <div className="h-8 w-px bg-glass-border mx-1 md:mx-2"></div>
                        <ThemeToggle />
                    </div>
                </header>

                <div className="p-4 sm:p-6 max-w-5xl mx-auto flex flex-col gap-12 pb-24 pt-8">
                    {/* Podium / Top 3 Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        {/* 2nd Place */}
                        {top3[1] && (
                            <div className="order-2 md:order-1 flex flex-col items-center gap-4 pt-8 md:pt-16">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-slate-400/50 shadow-lg flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                                        🥈
                                    </div>
                                    <div className="absolute -top-4 -right-2 bg-slate-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-background">2</div>
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg truncate max-w-[150px]">{top3[1].name}</h3>
                                    <p className="text-slate-500 font-medium">{top3[1].points.toLocaleString()} XP</p>
                                </div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {top3[0] && (
                            <div className="order-1 md:order-2 flex flex-col items-center gap-4 relative">
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
                                    <Crown className="text-primary w-12 h-12 drop-shadow-glow" />
                                </div>
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full bg-amber-100 dark:bg-amber-900/30 border-4 border-primary shadow-glow flex items-center justify-center text-5xl group-hover:scale-110 transition-all duration-500">
                                        🥇
                                    </div>
                                    <div className="absolute -top-4 -right-2 bg-primary text-black w-10 h-10 rounded-full flex items-center justify-center font-black border-2 border-background shadow-lg">1</div>
                                </div>
                                <div className="text-center">
                                    <h3 className="font-black text-2xl text-gradient-amber tracking-tight">{top3[0].name}</h3>
                                    <p className="text-amber-500 font-bold text-lg">{top3[0].points.toLocaleString()} XP</p>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {top3[2] && (
                            <div className="order-3 flex flex-col items-center gap-4 pt-8 md:pt-16">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/20 border-4 border-orange-400/50 shadow-lg flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                                        🥉
                                    </div>
                                    <div className="absolute -top-4 -right-2 bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-background">3</div>
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg truncate max-w-[150px]">{top3[2].name}</h3>
                                    <p className="text-slate-500 font-medium">{top3[2].points.toLocaleString()} XP</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rankings List */}
                    <div className="glass-panel rounded-[2rem] border border-glass-border overflow-hidden shadow-soft">
                        <div className="p-6 border-b border-glass-border bg-surface/30">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Bảng xếp hạng đầy đủ</h3>
                        </div>
                        <div className="divide-y divide-glass-border">
                            {others.map((u, i) => {
                                const isCurrentUser = u.id === user?.id;
                                return (
                                    <div
                                        key={u.id}
                                        className={`flex items-center gap-4 p-5 transition-colors hover:bg-surface/50 ${isCurrentUser ? 'bg-primary/10' : ''}`}
                                    >
                                        <div className="w-8 font-bold text-slate-400 text-center">{i + 4}</div>
                                        <div className="w-10 h-10 rounded-full bg-surface/50 flex items-center justify-center text-lg border border-glass-border self-center">
                                            👤
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-bold ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                                                {u.name} {isCurrentUser && '(Bạn)'}
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{u.streakCount} Day Streak</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-foreground">{u.points.toLocaleString()} <span className="text-[10px] text-slate-500">XP</span></p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Current User Float Banner */}
                    {user && currentUserRank > 3 && (
                        <div className="mt-8 amber-glass-gradient rounded-2xl p-6 flex items-center justify-between border border-primary/20 shadow-glow animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary text-black font-black w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                                    {currentUserRank}
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">Xếp hạng của bạn</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">Hãy nỗ lực để vươn tới top 3 nhé! 🐝🚀</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-primary">{stats?.points.toLocaleString()} <span className="text-xs text-slate-500 font-bold uppercase">XP</span></p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
