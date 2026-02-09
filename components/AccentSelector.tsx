"use client";

import { useEffect, useState } from "react";
import { Volume2, ChevronDown } from "lucide-react";

const ACCENTS = [
    { id: "US", label: "US", flag: "🇺🇸" },
    { id: "UK", label: "UK", flag: "🇬🇧" },
    { id: "AU", label: "AU", flag: "🇦🇺" },
];

export default function AccentSelector() {
    const [accent, setAccent] = useState("US");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const savedAccent = localStorage.getItem("vocabee-accent");
        if (savedAccent) setAccent(savedAccent);
    }, []);

    const handleSelect = (id: string) => {
        setAccent(id);
        localStorage.setItem("vocabee-accent", id);
        setIsOpen(false);
    };

    const currentAccent = ACCENTS.find(a => a.id === accent);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 px-3 bg-slate-100 dark:bg-white/5 hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-white dark:text-slate-300 text-slate-600 rounded-xl transition-all shadow-sm group border border-transparent active:scale-95"
            >
                <Volume2 size={16} className={isOpen ? "text-white" : "text-yellow-500"} />
                <span className="text-xs font-black tracking-widest">{currentAccent?.flag} {currentAccent?.label}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[60]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full mt-2 right-0 w-32 glass dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {ACCENTS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleSelect(item.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition-colors hover:bg-yellow-400/10 ${accent === item.id ? "text-yellow-500 bg-yellow-400/5" : "text-slate-600 dark:text-slate-300"
                                    }`}
                            >
                                <span>{item.flag} {item.label}</span>
                                {accent === item.id && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
