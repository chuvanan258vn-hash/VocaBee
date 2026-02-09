"use client";

import { motion } from "framer-motion";
import { Trophy, Target, BookOpen, Flame, CheckCircle2 } from "lucide-react";

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

    const vocabPercentage = Math.min(Math.round((stats.learnedToday / dailyGoal) * 100), 100) || 0;

    return (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 sm:mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">
            {/* Daily Progress Circle */}
            <div className="md:col-span-2 glass dark:bg-slate-900/50 p-4 sm:p-6 rounded-[2rem] border border-white/20 dark:border-white/5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-2xl">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
                    {/* Background Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="48" cy="48" r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-slate-100 dark:text-slate-800 sm:hidden"
                        />
                        <circle
                            cx="64" cy="64" r="56"
                            stroke="currentColor"
                            strokeWidth="10"
                            fill="transparent"
                            className="hidden sm:block text-slate-100 dark:text-slate-800"
                        />

                        {/* Vocab Progress (Yellow) */}
                        <motion.circle
                            cx="48" cy="48" r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray={251}
                            initial={{ strokeDashoffset: 251 }}
                            animate={{ strokeDashoffset: 251 - (251 * vocabPercentage) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                            fill="transparent"
                            className="sm:hidden text-yellow-500"
                        />
                        <motion.circle
                            cx="64" cy="64" r="56"
                            stroke="currentColor"
                            strokeWidth="10"
                            strokeDasharray={352}
                            initial={{ strokeDashoffset: 352 }}
                            animate={{ strokeDashoffset: 352 - (352 * vocabPercentage) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                            fill="transparent"
                            className="hidden sm:block text-yellow-500"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-none">{vocabPercentage}%</span>
                        <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Done</span>
                    </div>
                </div>

                <div className="flex-1 space-y-3 sm:space-y-4 text-center sm:text-left">
                    <div>
                        <h4 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                            Lộ trình ngày <Target className="text-orange-500" size={18} />
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-2">
                            🐝 Từ vựng: <span className="text-yellow-600 dark:text-yellow-400 font-black">{stats.learnedToday}/{dailyGoal}</span>
                            {stats.testVocabToday ? (
                                <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[9px] font-black rounded-lg border border-yellow-500/20">+{stats.testVocabToday} test</span>
                            ) : null}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center gap-1.5">
                        <Flame className="text-orange-500" size={12} />
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-200">{stats.streak || 0} Ngày</span>
                    </div>
                    <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-yellow-400/10 rounded-xl flex items-center gap-1.5">
                        <CheckCircle2 className="text-yellow-500" size={12} />
                        <span className="text-[10px] sm:text-xs font-bold text-yellow-600 dark:text-yellow-400">Combo Đạt</span>
                    </div>
                </div>
            </div>

            {/* Mini Stats Grid */}
            <div className="md:col-span-2 grid grid-cols-2 gap-3 sm:gap-4">
                <StatCard icon={<BookOpen size={20} />} label="Tổng Vựng" value={stats.totalWords} color="blue" />
                <StatCard icon={<Target size={20} />} label="Cần ôn" value={stats.dueReviews} color="orange" />
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
    const colors = {
        blue: "bg-blue-500/10 text-blue-500",
        orange: "bg-orange-500/10 text-orange-500",
        purple: "bg-purple-500/10 text-purple-500",
        green: "bg-green-500/10 text-green-500",
    } as any;

    return (
        <div className="glass dark:bg-slate-900/50 p-3 sm:p-4 rounded-[1.5rem] border border-white/20 dark:border-white/5 flex items-center gap-3 shadow-xl">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none truncate">{label}</p>
                <p className="text-base sm:text-lg font-black text-slate-800 dark:text-white mt-1">{value}</p>
            </div>
        </div>
    );
}
