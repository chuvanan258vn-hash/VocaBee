import { cn } from "@/lib/utils";
import Link from "next/link";

export function LeaderboardWidget() {
    return (
        <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                    <span className="material-symbols-outlined text-primary text-lg text-shadow-gold">emoji_events</span>
                    Leaderboard
                </h3>
                <Link className="text-primary text-xs font-bold hover:text-amber-300 transition-colors" href="/leaderboard">See All</Link>
            </div>
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="w-6 text-center font-bold text-primary text-sm">1</div>
                    <div className="w-10 h-10 rounded-full bg-slate-300 ring-2 ring-transparent group-hover:ring-primary/50 transition-all"></div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Sarah J.</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase">1,240 XP</p>
                    </div>
                    <span className="material-symbols-outlined text-green-500 text-sm">arrow_drop_up</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="w-6 text-center font-bold text-slate-500 text-sm">2</div>
                    <div className="w-10 h-10 rounded-full bg-slate-400 ring-2 ring-transparent group-hover:ring-slate-500/50 transition-all"></div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">Mike T.</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase">1,150 XP</p>
                    </div>
                    <span className="text-slate-600 text-xs font-bold">-</span>
                </div>
                <div className="flex items-center gap-3 bg-primary/5 p-3 rounded-2xl border border-primary/20 mt-2 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-amber-300"></div>
                    <div className="w-6 text-center font-bold text-slate-400 text-sm">14</div>
                    <div className="w-10 h-10 rounded-full bg-slate-500 border-2 border-primary/40 shadow-glow"></div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">You</p>
                        <p className="text-[10px] text-gradient-amber font-bold uppercase">850 XP</p>
                    </div>
                    <span className="flex items-center text-neon-green text-xs font-bold gap-0.5">
                        <span className="material-symbols-outlined text-sm">arrow_drop_up</span> 3
                    </span>
                </div>
            </div>
        </div>
    );
}

export function ActivityWidget() {
    return (
        <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                    <span className="material-symbols-outlined text-primary text-lg text-shadow-gold">bar_chart</span>
                    Activity
                </h3>
                <div className="flex items-center gap-3">
                    <Link href="/stats" className="text-primary text-[10px] font-bold hover:underline">Chi tiết</Link>
                    <button className="text-xs text-foreground bg-surface/50 px-3 py-1 rounded-full hover:bg-surface border border-glass-border font-medium transition-colors">
                        This Week
                    </button>
                </div>
            </div>
            <div className="h-40 flex items-end justify-between gap-2 px-1">
                {/* Mon */}
                <div className="flex flex-col items-center gap-3 w-full group cursor-pointer">
                    <div className="w-full bg-slate-500/10 rounded-t-sm relative h-28 flex items-end justify-center overflow-hidden group-hover:bg-slate-500/20 transition-colors">
                        <div className="w-full bg-primary/30 h-[40%] rounded-t-sm relative group-hover:bg-primary/50 transition-colors"></div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">M</span>
                </div>
                {/* Tue */}
                <div className="flex flex-col items-center gap-3 w-full group cursor-pointer">
                    <div className="w-full bg-slate-500/10 rounded-t-sm relative h-28 flex items-end justify-center overflow-hidden group-hover:bg-slate-500/20 transition-colors">
                        <div className="w-full bg-gradient-to-t from-primary to-yellow-300 h-[75%] rounded-t-sm relative shadow-glow"></div>
                    </div>
                    <span className="text-[10px] text-foreground font-bold uppercase">T</span>
                </div>
                {/* Wed */}
                <div className="flex flex-col items-center gap-3 w-full group cursor-pointer">
                    <div className="w-full bg-slate-500/10 rounded-t-sm relative h-28 flex items-end justify-center overflow-hidden group-hover:bg-slate-500/20 transition-colors">
                        <div className="w-full bg-primary/30 h-[30%] rounded-t-sm relative group-hover:bg-primary/50 transition-colors"></div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">W</span>
                </div>
                {/* Thu */}
                <div className="flex flex-col items-center gap-3 w-full group cursor-pointer">
                    <div className="w-full bg-slate-500/10 rounded-t-sm relative h-28 flex items-end justify-center overflow-hidden group-hover:bg-slate-500/20 transition-colors">
                        <div className="w-full bg-primary/30 h-[50%] rounded-t-sm relative group-hover:bg-primary/50 transition-colors"></div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">T</span>
                </div>
                {/* Fri */}
                <div className="flex flex-col items-center gap-3 w-full group cursor-pointer">
                    <div className="w-full bg-slate-500/10 rounded-t-sm relative h-28 flex items-end justify-center overflow-hidden group-hover:bg-slate-500/20 transition-colors">
                        <div className="w-full bg-primary/30 h-[20%] rounded-t-sm relative group-hover:bg-primary/50 transition-colors"></div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">F</span>
                </div>
                {/* Sat */}
                <div className="flex flex-col items-center gap-3 w-full group cursor-pointer">
                    <div className="w-full bg-slate-500/10 rounded-t-sm relative h-28 flex items-end justify-center overflow-hidden group-hover:bg-slate-500/20 transition-colors">
                        <div className="w-full bg-slate-500/20 h-[5%] rounded-t-sm relative"></div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">S</span>
                </div>
                {/* Sun */}
                <div className="flex flex-col items-center gap-3 w-full group cursor-pointer">
                    <div className="w-full bg-slate-500/10 rounded-t-sm relative h-28 flex items-end justify-center overflow-hidden group-hover:bg-slate-500/20 transition-colors">
                        <div className="w-full bg-slate-500/20 h-[5%] rounded-t-sm relative"></div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">S</span>
                </div>
            </div>
        </div>
    );
}
