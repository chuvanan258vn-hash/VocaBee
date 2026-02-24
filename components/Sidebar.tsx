"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Library,
    BarChart3,
    User,
    Settings,
    Crown,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { icon: "home", label: "Home", href: "/" },
    { icon: "hive", label: "My Vocabulary", href: "/vocabulary" },
    { icon: "style", label: "Decks", href: "#" }, // Placeholder for now
    { icon: "leaderboard", label: "Leaderboard", href: "/leaderboard" },
    { icon: "person", label: "Profile", href: "/profile" },
    { icon: "settings", label: "Settings", href: "/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-[#0B1221] border-r border-glass-border hidden md:flex flex-col h-screen fixed left-0 top-0 z-30">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-glow-primary">
                        <span className="text-white text-xl">🐝</span>
                    </div>
                    <div>
                        <h1 className="text-white text-xl font-bold tracking-tight text-shadow-gold">VocaBee</h1>
                        <p className="text-amber-400 text-[10px] font-bold tracking-widest uppercase">Golden Amber</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-1.5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                                    isActive
                                        ? "bg-primary/10 text-primary border border-primary/20 shadow-glow"
                                        : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
                                )}
                            >
                                <span
                                    className={cn(
                                        "material-symbols-outlined transition-transform group-hover:scale-110",
                                        isActive && "filled"
                                    )}
                                >
                                    {item.icon}
                                </span>
                                <span className={cn("text-sm", isActive ? "font-bold text-gradient-amber" : "font-medium")}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6">
                <div className="amber-glass-gradient rounded-2xl p-5 relative overflow-hidden group border-amber-500/20">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 blur-2xl rounded-full"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Crown className="text-primary w-5 h-5" />
                            <p className="text-primary font-bold text-sm text-shadow-gold">Go Golden</p>
                        </div>
                        <p className="text-amber-100/70 text-xs mb-4 font-light leading-relaxed">Unlock unlimited honey and advanced analytics.</p>
                        <button className="btn-amber w-full py-2.5 text-xs">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
