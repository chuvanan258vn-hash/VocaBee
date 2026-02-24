// app/stats/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/user';
import Sidebar from '@/components/Sidebar';
import { getDetailedStatsAction, getDashboardStats } from '@/app/actions';
import { ThemeToggle } from '@/components/ThemeToggle';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    const user = await getAuthenticatedUser();
    const stats = await getDetailedStatsAction();
    const dashboardStats = await getDashboardStats();

    if (!stats) {
        return <div>Lỗi khi tải dữ liệu thống kê. 🐝</div>;
    }

    const { mastered, learning, newItems, total } = stats.mastery;
    const masteryPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;

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
                        <h2 className="text-foreground text-xl font-bold tracking-tight hidden md:block text-shadow-gold">Thống kê & Thông tin</h2>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="hidden md:flex items-center gap-2 bg-surface/50 border border-glass-border px-3 py-1.5 rounded-full backdrop-blur-sm" title={`${dashboardStats?.streak || 0} Day Streak`}>
                            <span className="material-symbols-outlined text-amber-500 text-[20px] filled">local_fire_department</span>
                            <span className="text-amber-500 font-bold text-sm">{dashboardStats?.streak || 0}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 bg-surface/50 border border-glass-border px-3 py-1.5 rounded-full backdrop-blur-sm" title={`${(dashboardStats?.points || 0).toLocaleString()} Bees`}>
                            <span className="material-symbols-outlined text-primary text-[20px] filled">hive</span>
                            <span className="text-primary font-bold text-sm">{(dashboardStats?.points || 0).toLocaleString()}</span>
                        </div>
                        <div className="h-8 w-px bg-glass-border mx-1 md:mx-2"></div>
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-foreground leading-none group-hover:text-primary transition-colors">{session.user?.name}</p>
                                <p className="text-[10px] text-slate-500 mt-1 font-medium uppercase tracking-wide italic">Học giả Ong mật 🐝</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/20 bg-cover bg-center border border-glass-border ring-2 ring-transparent group-hover:ring-primary/50 transition-all shadow-lg flex items-center justify-center">
                                <span className="text-lg">👤</span>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </header>

                <div className="p-4 sm:p-6 max-w-7xl mx-auto flex flex-col gap-8 pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Weekly Mastery Card */}
                        <div className="lg:col-span-3 glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-10 border border-glass-border shadow-soft">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>

                            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="6" className="text-slate-200 dark:text-slate-800"></circle>
                                    <circle
                                        cx="50" cy="50" fill="none" r="45"
                                        stroke="url(#gradient-primary)" strokeWidth="6"
                                        strokeDasharray="283"
                                        strokeDashoffset={283 - (283 * masteryPercent) / 100}
                                        strokeLinecap="round"
                                        className="drop-shadow-glow"
                                    ></circle>
                                    <defs>
                                        <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#f59e0b" />
                                            <stop offset="100%" stopColor="#fbbf24" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                                    <span className="text-5xl font-extrabold text-foreground tracking-tighter">
                                        {masteryPercent}<span className="text-2xl text-slate-400 font-medium">%</span>
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Đã thành thạo</span>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-6 z-10">
                                <div>
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                        <h2 className="text-3xl font-bold text-foreground tracking-tight text-shadow-gold">Tiến trình thành thạo</h2>
                                        <span className="material-symbols-outlined text-amber-500 text-lg filled">trending_up</span>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md mx-auto md:mx-0">
                                        Bạn đã làm chủ <span className="text-amber-500 font-bold">{mastered} từ vựng</span>.
                                        Hãy tiếp tục duy trì đà học tập để làm đầy hũ mật kiến thức của mình nhé! 🍯
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wide">
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                        Thành thạo: {mastered}
                                    </div>
                                    <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wide">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Đang học: {learning}
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-500/10 px-4 py-2 rounded-xl border border-slate-500/20 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wide">
                                        <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                                        Mới: {newItems}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Sidebar */}
                        <div className="flex flex-col gap-4">
                            <div className="flex-1 glass-panel rounded-3xl p-6 border border-glass-border shadow-soft flex flex-col justify-between relative group overflow-hidden transition-all hover:shadow-lg hover:border-amber-500/30">
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-500/20">
                                        <span className="material-symbols-outlined text-xl">psychology</span>
                                    </div>
                                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">Ước tính</span>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Tỉ lệ ghi nhớ</p>
                                    <h3 className="text-4xl font-bold text-foreground tracking-tighter">{stats.retentionRate}%</h3>
                                </div>
                                <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="material-symbols-outlined text-7xl">brain</span>
                                </div>
                            </div>

                            <div className="flex-1 glass-panel rounded-3xl p-6 border border-glass-border shadow-soft flex flex-col justify-between relative group overflow-hidden transition-all hover:shadow-lg hover:border-blue-500/30">
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-500/20">
                                        <span className="material-symbols-outlined text-xl">timer</span>
                                    </div>
                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">Hôm nay</span>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Thời gian học</p>
                                    <h3 className="text-4xl font-bold text-foreground tracking-tighter">{stats.timeSpentToday}m</h3>
                                </div>
                                <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="material-symbols-outlined text-7xl">schedule</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Heatmap Section */}
                    <div className="glass-panel rounded-3xl p-8 border border-glass-border shadow-soft relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8 border-b border-glass-border pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
                                    <span className="material-symbols-outlined text-2xl">calendar_month</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight text-shadow-gold">Biểu đồ hoạt động</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">Sự chăm chỉ của bạn trong suốt 1 năm qua</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 uppercase font-bold mr-2">Cường độ</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800"></div>
                                    <div className="w-3 h-3 rounded-sm bg-amber-500/20"></div>
                                    <div className="w-3 h-3 rounded-sm bg-amber-500/40"></div>
                                    <div className="w-3 h-3 rounded-sm bg-amber-500/60"></div>
                                    <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto pb-2 no-scrollbar">
                            <ActivityHeatmap data={stats.heatmap} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Summary Info */}
                        <div className="glass-panel rounded-3xl p-8 border border-glass-border shadow-soft relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-6 border-b border-glass-border pb-6">
                                <div className="w-12 h-12 bg-gradient-to-tr from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                                    <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight text-shadow-gold">Phân tích học tập</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">Phân loại thẻ và mức độ ưu tiên</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/30 border border-glass-border transition-colors hover:bg-surface/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <span className="material-symbols-outlined text-xl">check_circle</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Đã ôn tập hôm nay</span>
                                    </div>
                                    <span className="text-xl font-bold text-foreground">{stats.studiedToday} thẻ</span>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface/30 border border-glass-border transition-colors hover:bg-surface/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-xl">hive</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Tổng số mục lưu trữ</span>
                                    </div>
                                    <span className="text-xl font-bold text-foreground">{total} mục</span>
                                </div>

                                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 italic text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    "Kiến thức như những giọt mật, tích tụ từng ngày sẽ tạo nên một tổ ong vĩ đại. Hãy giữ vững phong độ nhé!" 🐝🐝🐝
                                </div>
                            </div>
                        </div>

                        {/* Recent Badges / Goals */}
                        <div className="glass-panel rounded-3xl p-8 border border-glass-border shadow-soft relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-6 border-b border-glass-border pb-6">
                                <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
                                    <span className="material-symbols-outlined text-2xl">military_tech</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight text-shadow-gold">Thành tựu</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">Những dấu mốc bạn đã đạt được</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: 'temp_preferences_eco', label: 'Người mới', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                    { icon: 'local_fire_department', label: 'Nhiệt huyết', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                    { icon: 'auto_stories', label: 'Chăm học', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                    { icon: 'workspace_premium', label: 'Học giả', color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                ].map((badge, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl border border-glass-border bg-surface/30 grayscale hover:grayscale-0 transition-all cursor-default">
                                        <div className={`w-12 h-12 ${badge.bg} ${badge.color} rounded-full flex items-center justify-center mb-2 shadow-sm`}>
                                            <span className="material-symbols-outlined text-2xl filled">{badge.icon}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{badge.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ActivityHeatmap({ data }: { data: any[] }) {
    // Generate simple heatmap grid for the last 52 weeks (approx)
    const weeks = 52;
    const daysPerWeek = 7;

    // Mapping data to a map for quick lookup
    const dataMap = new Map(data.map(d => [d.date, d.count]));

    const today = new Date();
    const cells: React.ReactNode[] = [];

    // Calculate the start date (1 year ago, adjusted to start of week)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (weeks * daysPerWeek));
    // Adjust to Monday (or Sunday) if needed

    for (let i = 0; i < weeks * daysPerWeek; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = dataMap.get(dateStr) || 0;

        let intensity = "bg-slate-100 dark:bg-slate-800";
        if (count > 0 && count <= 2) intensity = "bg-amber-500/20";
        else if (count > 2 && count <= 5) intensity = "bg-amber-500/40";
        else if (count > 5 && count <= 10) intensity = "bg-amber-500/70";
        else if (count > 10) intensity = "bg-amber-500";

        cells.push(
            <div
                key={dateStr}
                className={`w-3 h-3 rounded-[2px] ${intensity} transition-all hover:scale-150 hover:z-10 cursor-pointer`}
                title={`${dateStr}: ${count} hoạt động`}
            />
        );
    }

    return (
        <div className="flex gap-1">
            {Array.from({ length: weeks }).map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                    {cells.slice(weekIndex * daysPerWeek, (weekIndex + 1) * daysPerWeek)}
                </div>
            ))}
        </div>
    );
}
