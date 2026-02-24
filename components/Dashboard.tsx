"use client";

import { motion } from "framer-motion";

interface DashboardProps {
    stats: {
        dailyGoal: number;
        learnedToday: number;
        testVocabToday?: number;
        totalWords: number;
        dueReviews: number;
        streak?: number;
    };
}

export default function Dashboard({ stats }: DashboardProps) {
    const dailyGoal = stats.dailyGoal || 20;
    const learnedToday = stats.learnedToday || 0;
    const vocabPercentage = Math.min(Math.round((learnedToday / dailyGoal) * 100), 100);

    return (
        <div className="w-full max-w-7xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Progress Card (2/3 cols) */}
                <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                    <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="4" className="text-slate-200 dark:text-slate-700/50"></circle>
                            <motion.circle
                                cx="50" cy="50" fill="none" r="45"
                                stroke="url(#gradient-segment)"
                                strokeWidth="4"
                                strokeDasharray="283"
                                initial={{ strokeDashoffset: 283 }}
                                animate={{ strokeDashoffset: 283 - (283 * vocabPercentage) / 100 }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            />
                            <defs>
                                <linearGradient id="gradient-segment" x1="0%" x2="100%" y1="0%" y2="0%">
                                    <stop offset="0%" stopColor="#FBBF24"></stop>
                                    <stop offset="100%" stopColor="#F59E0B"></stop>
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                            {learnedToday >= dailyGoal ? (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center"
                                >
                                    <span className="material-symbols-outlined text-primary mb-1 text-[32px] text-shadow-gold">check_circle</span>
                                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter">Hoàn thành</span>
                                </motion.div>
                            ) : (
                                <>
                                    <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
                                        {vocabPercentage}<span className="text-2xl text-slate-400 font-medium">%</span>
                                    </span>
                                    <span className="text-[10px] text-primary dark:text-primary font-bold uppercase tracking-widest mt-1">Mục tiêu</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <h2 className="text-3xl font-bold text-foreground tracking-tight">Lộ trình ngày</h2>
                                <span className="material-symbols-outlined text-primary text-lg animate-bounce text-shadow-gold">target</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md mx-auto md:mx-0">
                                Bạn đã hoàn thành <span className="font-bold text-gradient-amber">{learnedToday}</span> mục tiêu. {learnedToday >= dailyGoal ? "Thật tuyệt vời! 🐝" : `Hãy tiếp tục cố gắng để đạt ${dailyGoal} mục tiêu hôm nay!`}
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <StatBadge icon={<span className="material-symbols-outlined text-base">local_fire_department</span>} label={`${stats.streak || 0} Ngày Streak`} color="orange" />
                            <StatBadge icon={<span className="material-symbols-outlined text-base">check_circle</span>} label={`${dailyGoal} Mục tiêu`} color="yellow" />
                            {stats.testVocabToday ? (
                                <StatBadge icon={<span className="material-symbols-outlined text-base">trending_up</span>} label={`${stats.testVocabToday} Test`} color="blue" />
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Secondary Stats Column */}
                <div className="flex flex-col gap-4">
                    <StatCard
                        icon={<span className="material-symbols-outlined text-xl">menu_book</span>}
                        label="Tổng vựng"
                        value={stats.totalWords}
                        color="blue"
                        trend="+12 today"
                    />
                    <StatCard
                        icon={<span className="material-symbols-outlined text-xl">history_edu</span>}
                        label="Cần ôn tập"
                        value={stats.dueReviews}
                        color="amber"
                        variant="high"
                    />
                </div>
            </div>
        </div>
    );
}

function StatBadge({ icon, label, color }: { icon: any, label: string, color: 'orange' | 'yellow' | 'blue' }) {
    const colors = {
        orange: "text-secondary bg-secondary-glow/10 border-secondary/20",
        yellow: "text-primary bg-primary/10 border-primary/20",
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    };

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wide backdrop-blur-sm ${colors[color]}`}>
            {icon}
            <span>{label}</span>
        </div>
    );
}

function StatCard({ icon, label, value, color, trend, variant }: { icon: any, label: string, value: number, color: 'blue' | 'amber', trend?: string, variant?: 'high' }) {
    const isAmber = color === 'amber';
    return (
        <div className={`flex-1 glass-panel rounded-3xl p-6 flex flex-col justify-between relative group overflow-hidden transition-all hover:border-${isAmber ? 'secondary/30' : 'primary/30'}`}>
            <div className={`absolute right-0 top-0 w-32 h-32 ${isAmber ? 'bg-secondary/5 group-hover:bg-secondary/10' : 'bg-primary/5 group-hover:bg-primary/10'} rounded-bl-full transition-all`}></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border ${isAmber ? 'text-secondary bg-secondary/10 border-secondary/20' : 'text-primary bg-primary/10 border-primary/20'}`}>
                    {icon}
                </div>
                {trend && <span className="text-xs font-medium text-slate-500 bg-surface/50 px-2 py-1 rounded-md border border-glass-border">{trend}</span>}
                {variant === 'high' && <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded-md border border-secondary/20 shadow-glow">High priority</span>}
            </div>
            <div className="relative z-10">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-4xl font-bold tracking-tighter text-foreground">{value.toLocaleString()}</h3>
            </div>
        </div>
    );
}
