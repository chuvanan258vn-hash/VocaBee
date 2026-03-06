"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { reviewGrammarCardAction } from "@/app/actions";
import { calculateSm2 } from "@/lib/sm2";

interface GrammarCard {
    id: string;
    type: string;
    prompt: string;
    answer: string;
    meaning?: string | null;
    options?: string | null;
    hint?: string | null;
    explanation?: string | null;
    repetition: number;
    interval: number;
    efactor: number;
    myError?: string | null;
    trap?: string | null;
    goldenRule?: string | null;
}

interface GrammarFlashcardProps {
    card: GrammarCard;
    onNext: () => void;
}

export default function GrammarFlashcard({ card, onNext }: GrammarFlashcardProps) {
    const [userInput, setUserInput] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    // Parse options if it's an MCQ card
    const options: string[] = card.options ? JSON.parse(card.options) : [];

    useEffect(() => {
        // Focus input on mount
        if (inputRef.current) inputRef.current.focus();
        setShowHint(false);
    }, [card.id]);

    const handleSubmit = () => {
        if (isSubmitted) return;

        const cleanUser = userInput.trim().toLowerCase().replace(/[.,!?;]$/, "");
        const cleanAnswer = card.answer.toLowerCase().replace(/[.,!?;]$/, "");

        // Match logic: strict for cloze/mcq, fuzzy-ish for production
        let match = cleanUser === cleanAnswer;

        if (card.type === "PRODUCTION") {
            // For production, we could allow minor punctuation differences
            match = cleanUser === cleanAnswer;
        }

        setIsCorrect(match);
        setIsSubmitted(true);
        setShowExplanation(true);
    };

    const handleDontKnow = () => {
        setIsCorrect(false);
        setIsSubmitted(true);
        setShowExplanation(true);
    };

    const handleGrade = async (grade: number) => {
        setIsChecking(true);
        let quality = 0;
        if (grade === 1) quality = 3;
        if (grade === 2) quality = 4;
        if (grade === 3) quality = 5;

        await reviewGrammarCardAction(card.id, quality);
        // Reset state for next card
        setUserInput("");
        setIsSubmitted(false);
        setShowExplanation(false);
        setIsChecking(false);
        onNext();
    };

    const getNextReviewLabel = (grade: number) => {
        let quality = 0;
        if (grade === 1) quality = 3;
        if (grade === 2) quality = 4;
        if (grade === 3) quality = 5;

        if (quality === 0 && grade === 0) return "< 1 MIN";

        const result = calculateSm2({
            interval: card.interval,
            repetition: card.repetition,
            efactor: card.efactor,
            quality: quality
        });

        const days = result.interval;
        if (days === 0) return "< 1 DAY";
        if (days === 1) return "1 DAY";
        return `${days} DAYS`;
    };

    const handleSpeak = (text: string) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
            >
                {/* Visual glow background */}
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 to-purple-600/20 rounded-[2.5rem] blur opacity-40 group-hover:opacity-60 transition duration-1000"></div>

                <div className="relative bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800/50 overflow-hidden">

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

                    {/* Header Tags */}
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-8 flex items-center gap-2 z-10">
                        <div className="hidden xs:flex items-center gap-2">
                            {card.repetition === 0 && card.interval === 0 ? (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 text-sky-500 dark:text-sky-300 text-[9px] font-black uppercase tracking-wider rounded-full border border-sky-500/20">
                                    <span className="material-symbols-outlined text-[12px] filled">auto_awesome</span>
                                    TỪ MỚI
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-300 text-[9px] font-black uppercase tracking-wider rounded-full border border-purple-500/20">
                                    <span className="material-symbols-outlined text-[12px] filled">history</span>
                                    ÔN TẬP
                                </span>
                            )}
                        </div>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-slate-200 dark:border-slate-700/50">
                            {card.type.replace("_", " ")}
                        </span>
                    </div>

                    <div className="space-y-6 sm:space-y-8 relative z-10">
                        {/* Prompt section */}
                        <div className="space-y-3 sm:space-y-5 pt-4">
                            <div className="flex items-center gap-2 text-sky-500/60 font-black text-[10px] uppercase tracking-[0.2em]">
                                <span className="size-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                                <span>Question Task</span>
                            </div>

                            <h2 className="font-plus text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                                {card.prompt}
                            </h2>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleSpeak(card.prompt)}
                                    className="p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 transition-all active:scale-95"
                                    title="Listen"
                                >
                                    <span className="material-symbols-outlined text-xl filled">volume_up</span>
                                </button>

                                {(card.hint || card.meaning) && (
                                    <button
                                        onClick={() => setShowHint(!showHint)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black transition-all ${showHint
                                                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-purple-500 border border-transparent hover:border-purple-500/30"
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-sm filled">lightbulb</span>
                                        <span>{showHint ? "ẨN GỢI Ý" : "XEM GỢI Ý"}</span>
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {showHint && (card.hint || card.meaning) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: "auto" }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-500/5 to-sky-500/5 border border-purple-500/10 rounded-2xl shadow-inner mt-2">
                                            <div className="space-y-3">
                                                {card.meaning && (
                                                    <div className="flex items-start gap-3">
                                                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[8px] font-black uppercase mt-0.5">Nghĩa</span>
                                                        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-bold italic leading-relaxed">
                                                            "{card.meaning}"
                                                        </p>
                                                    </div>
                                                )}
                                                {card.hint && (
                                                    <div className="flex items-start gap-3 pt-2 border-t border-purple-500/10">
                                                        <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[8px] font-black uppercase mt-0.5 shrink-0">Gợi ý</span>
                                                        <p className="text-xs sm:text-sm text-sky-600 dark:text-sky-400 font-medium">
                                                            {card.hint}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Input Area */}
                        {!isSubmitted ? (
                            <div className="space-y-5 sm:space-y-6">
                                {card.type === "MCQ" ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {options.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setUserInput(opt)}
                                                className={`group flex items-center p-4 rounded-2xl text-left font-bold border-2 transition-all relative overflow-hidden ${userInput === opt
                                                        ? "bg-sky-500/10 border-sky-400 text-sky-600 dark:text-sky-300 shadow-lg shadow-sky-500/10"
                                                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-sky-400/50"
                                                    }`}
                                            >
                                                <span className={`size-7 rounded-lg flex items-center justify-center mr-4 text-xs tracking-tighter transition-colors ${userInput === opt ? "bg-sky-400 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                                                    }`}>
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                <span className="text-sm sm:text-base">{opt}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="relative group/input">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-purple-500 rounded-2xl blur opacity-10 group-focus-within/input:opacity-30 transition duration-500"></div>
                                        {card.type === "PRODUCTION" || card.type === "TRANSFORMATION" ? (
                                            <textarea
                                                ref={inputRef as any}
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                                placeholder="Viết đáp án tại đây..."
                                                className="relative w-full p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-base sm:text-lg font-bold text-foreground focus:border-sky-400 transition-all min-h-[120px] resize-none"
                                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                                            />
                                        ) : (
                                            <input
                                                ref={inputRef as any}
                                                type="text"
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                                placeholder="Nhập câu trả lời..."
                                                className="relative w-full p-5 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-xl sm:text-2xl font-black text-foreground text-center focus:border-sky-400 transition-all"
                                                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                                                autoComplete="off"
                                            />
                                        )
                                        }
                                    </div>
                                )}

                                <div className="flex gap-3 sm:gap-4 pt-2">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!userInput.trim()}
                                        className="flex-[2.5] py-4.5 bg-gradient-to-r from-sky-400 to-purple-500 hover:from-sky-300 hover:to-purple-400 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:grayscale shadow-[0_10px_20px_-5px_rgba(56,189,248,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(56,189,248,0.6)] active:scale-[0.97] group"
                                    >
                                        <span>GỬI ĐÁP ÁN</span>
                                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">send</span>
                                    </button>

                                    <button
                                        onClick={handleDontKnow}
                                        className="flex-1 py-4.5 bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:text-red-500 dark:hover:text-red-400 font-bold text-[11px] rounded-2xl flex items-center justify-center gap-2 transition-all border border-transparent hover:border-red-500/20 active:scale-[0.97]"
                                        title="Bỏ qua câu này"
                                    >
                                        <span className="material-symbols-outlined text-base">skip_next</span>
                                        <span className="hidden xs:inline uppercase tracking-widest">Bỏ qua</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6 sm:space-y-8"
                            >
                                {/* Result Feedback */}
                                <div className={`relative p-6 sm:p-8 rounded-3xl border-2 overflow-hidden ${isCorrect
                                        ? "bg-green-500/5 border-green-500/20"
                                        : "bg-red-500/5 border-red-500/20"
                                    }`}>
                                    <div className={`absolute top-0 right-0 p-4 opacity-5 bg-gradient-to-br ${isCorrect ? "from-green-500 to-emerald-600" : "from-red-500 to-rose-600"} w-32 h-32 rounded-full -mr-12 -mt-12`}></div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`size-8 rounded-full flex items-center justify-center border ${isCorrect ? "bg-green-500/20 border-green-500/30 text-green-500" : "bg-red-500/20 border-red-500/30 text-red-500"
                                            }`}>
                                            <span className="material-symbols-outlined text-base filled">
                                                {isCorrect ? "check_circle" : "error"}
                                            </span>
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                            }`}>
                                            {isCorrect ? "Rất tốt! 🎉" : "Cần lưu ý thêm 🐝"}
                                        </span>
                                    </div>

                                    <div className="space-y-5">
                                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                                            {card.answer}
                                        </p>

                                        <button
                                            onClick={() => handleSpeak(card.answer)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-sky-500 font-black text-[10px] uppercase transition-all shadow-sm active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-base filled">volume_up</span>
                                            <span>Nghe lại</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Explanation & Analysis */}
                                <div className="space-y-4">
                                    {card.explanation && (
                                        <div className="p-5 bg-sky-500/5 border border-sky-500/10 rounded-2xl">
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                                💡 {card.explanation}
                                            </p>
                                        </div>
                                    )}

                                    {/* Specialized Notebook Analysis */}
                                    <AnimatePresence>
                                        {(card.myError || card.trap || card.goldenRule) && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                                {card.myError && (
                                                    <div className="bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800">
                                                        <div className="flex items-center gap-2 mb-2 font-black uppercase text-[10px] text-slate-500 tracking-widest">
                                                            <span className="material-symbols-outlined text-sm">history_edu</span>
                                                            Lỗi của bạn
                                                        </div>
                                                        <p className="text-sm text-slate-700 dark:text-slate-300 italic font-medium">
                                                            "{card.myError}"
                                                        </p>
                                                    </div>
                                                )}

                                                {card.trap && (
                                                    <div className="bg-rose-500/5 dark:bg-rose-500/10 rounded-2xl p-4 sm:p-5 border border-rose-500/10">
                                                        <div className="flex items-center gap-2 mb-2 font-black uppercase text-[10px] text-rose-500 tracking-widest">
                                                            <span className="material-symbols-outlined text-sm filled">warning</span>
                                                            Cái bẫy (The Trap) 🪤
                                                        </div>
                                                        <p className="text-sm text-rose-700 dark:text-rose-300 font-bold leading-snug">
                                                            {card.trap}
                                                        </p>
                                                    </div>
                                                )}

                                                {card.goldenRule && (
                                                    <div className="bg-amber-500/10 dark:bg-amber-500/5 rounded-2xl p-4 sm:p-5 border-2 border-amber-500/20 ring-1 ring-amber-500/10 shadow-[0_5px_15px_rgba(251,191,36,0.1)]">
                                                        <div className="flex items-center gap-2 mb-2 font-black uppercase text-[10px] text-amber-600 dark:text-amber-500 tracking-widest">
                                                            <span className="material-symbols-outlined text-sm filled animate-pulse">auto_awesome</span>
                                                            Quy tắc vàng 🍯
                                                        </div>
                                                        <p className="text-base text-amber-900 dark:text-amber-200 font-black leading-tight">
                                                            {card.goldenRule}
                                                        </p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Grading Buttons */}
                                <div className="pt-2">
                                    <div className="text-center mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đánh giá độ khó</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { grade: 0, label: "Again", color: "text-rose-500", icon: "refresh", bg: "hover:bg-rose-500/5", border: "hover:border-rose-500/30" },
                                            { grade: 1, label: "Hard", color: "text-amber-500", icon: "priority_high", bg: "hover:bg-amber-500/5", border: "hover:border-amber-500/30" },
                                            { grade: 2, label: "Good", color: "text-emerald-500", icon: "check", bg: "hover:bg-emerald-500/5", border: "hover:border-emerald-500/30" },
                                            { grade: 3, label: "Easy", color: "text-sky-500", icon: "bolt", bg: "hover:bg-sky-500/5", border: "hover:border-sky-500/30" },
                                        ].map((btn) => (
                                            <button
                                                key={btn.grade}
                                                disabled={isChecking}
                                                onClick={() => handleGrade(btn.grade)}
                                                className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 transition-all active:scale-95 disabled:opacity-50 ${btn.bg} ${btn.border} group`}
                                            >
                                                <span className={`material-symbols-outlined text-lg ${btn.color} font-bold group-hover:scale-110 transition-transform`}>
                                                    {btn.icon}
                                                </span>
                                                <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">{btn.label}</span>
                                                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500">
                                                    {getNextReviewLabel(btn.grade)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Hint for Enter key */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                className="mt-6 text-center"
            >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                    <span className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">Enter</span>
                    để tiếp tục
                </p>
            </motion.div>
        </div>
    );
}
