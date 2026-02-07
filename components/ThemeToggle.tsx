"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="group relative rounded-xl p-2.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm"
            aria-label="Toggle Dark Mode"
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-500" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-2.5 left-2.5 text-blue-400" />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
