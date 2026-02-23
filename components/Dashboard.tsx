"use client";

import { motion } from "framer-motion";
import { Trophy, Target, BookOpen, Flame, CheckCircle2, TrendingUp } from "lucide-react";

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
        <div className="w-full max-w-5xl space-y-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Main Progress Card (8 cols) */}
                <div className="lg:col-span-8 glass relative overflow-hidden p-6 sm:p-8 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-8 group">
                    {/* Subtle Background Glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-400/10 blur-[100px] rounded-full group-hover:bg-yellow-400/20 transition-colors duration-700" />

                    {/* Progress Circle container */}
                    <div className="relative shrink-0 flex items-center justify-center w-40 h-40">
                        <svg className="w-full h-full -rotate-90">
                            <circle
                                cx="80" cy="80" r="70"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-slate-100 dark:text-slate-800/50"
                            />
                            <motion.circle
                                cx="80" cy="80" r="70"
                                stroke="currentColor"
                                strokeWidth="12"
                                strokeDasharray={440}
                                initial={{ strokeDashoffset: 440 }}
                                animate={{ strokeDashoffset: 440 - (440 * vocabPercentage) / 100 }}
                                transition={{ duration: 2, ease: "circOut" }}
                                strokeLinecap="round"
                                fill="transparent"
                                className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                            />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {learnedToday >= dailyGoal ? (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center"
                                >
                                    <CheckCircle2 className="text-yellow-500 mb-1" size={32} />
                                    <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">Hoàn thành</span>
                                </motion.div>
                            ) : (
                                <>
                                    <motion.span
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 0.5 }}
                                        className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter"
                                    >
                                        {vocabPercentage}%
                                    </motion.span>
                                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5">Mục tiêu</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Progress Info */}
                    <div className="flex-1 w-full text-center md:text-left space-y-5 z-10">
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Lộ trình ngày</h2>
                                <div className="p-1.5 bg-orange-500/10 rounded-lg">
                                    <Target className="text-orange-500" size={20} />
                                </div>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
                                Bạn đã hoàn thành <span className="text-yellow-600 dark:text-yellow-400 font-black tabular-nums">{learnedToday}</span> trong tổng số <span className="font-bold text-slate-700 dark:text-slate-200">{dailyGoal}</span> mục tiêu hôm nay.
                            </p>
                        </div>

                        {/* Badges/Streaks row */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <Badge icon={<Flame size={14} />} label={`${stats.streak || 0} Ngày`} color="orange" />
                            <Badge icon={<CheckCircle2 size={14} />} label="Mục tiêu" color="yellow" pulse />
                            {stats.testVocabToday ? (
                                <Badge icon={<TrendingUp size={14} />} label={`+${stats.testVocabToday} Test`} color="blue" />
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Secondary Stats Grid (4 cols) */}
                <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4 h-full">
                    <EnhancedStatCard
                        icon={<BookOpen size={24} />}
                        label="Tổng vựng"
                        value={stats.totalWords}
                        color="blue"
                        delay={0.2}
                    />
                    <EnhancedStatCard
                        icon={<Target size={24} />}
                        label="Cần ôn tập"
                        value={stats.dueReviews}
                        color="orange"
                        delay={0.4}
                    />
                </div>
            </div>
        </div>
    );
}

function Badge({ icon, label, color, pulse }: { icon: any, label: string, color: 'orange' | 'yellow' | 'blue', pulse?: boolean }) {
    const colors = {
        orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
        yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
        blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    };

    return (
        <div className={`px-4 py-1.5 rounded-2xl border flex items-center gap-2 text-xs font-black tracking-wide ${colors[color]} ${pulse ? 'animate-pulse' : ''}`}>
            {icon}
            <span>{label}</span>
        </div>
    );
}

function EnhancedStatCard({ icon, label, value, color, delay }: { icon: any, label: string, value: number, color: 'blue' | 'orange', delay: number }) {
    const colors = {
        blue: "from-blue-500/20 to-indigo-500/10 text-blue-500 border-blue-500/20",
        orange: "from-orange-500/20 to-red-500/10 text-orange-500 border-orange-500/20",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.8 }}
            className={`glass h-full p-6 pb-5 rounded-[2rem] border border-white/40 dark:border-white/10 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
        >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${colors[color]} border shadow-inner`}>
                {icon}
            </div>

            <div className="z-10">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black text-slate-800 dark:text-white tabular-nums tracking-tight">{value}</p>
                    <div className={`h-1.5 w-1.5 rounded-full ${color === 'blue' ? 'bg-blue-500' : 'bg-orange-500'} animate-pulse`} />
                </div>
            </div>
        </motion.div>
    );
}
