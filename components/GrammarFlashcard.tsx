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
    options?: string | null;
    hint?: string | null;
    explanation?: string | null;
    tags?: string | null;
    repetition: number;
    interval: number;
    efactor: number;
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
        await reviewGrammarCardAction(card.id, grade);
        // Reset state for next card
        setUserInput("");
        setIsSubmitted(false);
        setShowExplanation(false);
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
        <div className="w-full max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-surface-card p-6 sm:p-10 rounded-2xl md:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden"
            >
                {/* Card Type Tag */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-8 flex items-center gap-2">
                    {card.repetition === 0 && card.interval === 0 ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase tracking-wider rounded-full border border-cyan-500/20">
                            <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                            TỪ MỚI
                        </span>
                    ) : card.repetition === 0 && card.interval > 0 ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-wider rounded-full border border-violet-500/20">
                            <span className="material-symbols-outlined text-[12px]">replay</span>
                            HỌC LẠI
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-500/20">
                            <span className="material-symbols-outlined text-[12px]">history</span>
                            ÔN TẬP
                        </span>
                    )}
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider rounded-full border border-primary/20">
                        {card.type.replace("_", " ")}
                    </span>
                </div>

                <div className="space-y-6 sm:space-y-8">
                    {/* Prompt section */}
                    <div className="space-y-3 sm:space-y-4 pt-2">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                            <span className="material-symbols-outlined text-sm">help</span>
                            <span>Question / Task</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                            {card.prompt}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                title="Phát âm"
                                onClick={() => handleSpeak(card.prompt)}
                                className="size-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-300"
                            >
                                <span className="material-symbols-outlined text-[20px]">volume_up</span>
                            </button>
                            {card.hint && (
                                <button
                                    onClick={() => setShowHint(!showHint)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${showHint
                                        ? "bg-primary text-slate-900"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary"
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                                    <span>{showHint ? "ẨN GỢI Ý" : "GỢI Ý"}</span>
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {showHint && card.hint && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-2xl overflow-hidden"
                                >
                                    <p className="text-xs sm:text-sm text-primary italic font-medium">
                                        💡 {card.hint}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Input section */}
                    {!isSubmitted ? (
                        <div className="space-y-4 sm:space-y-6">
                            {card.type === "MCQ" ? (
                                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                    {options.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setUserInput(opt); }}
                                            className={`p-4 rounded-xl text-left font-bold border-2 transition-all text-sm sm:text-base ${userInput === opt
                                                ? "bg-primary/10 border-primary text-foreground shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                                                : "bg-slate-50 dark:bg-surface-lighter/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary/50"
                                                }`}
                                        >
                                            <span className="mr-3 text-slate-300">{String.fromCharCode(65 + i)}.</span>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                card.type === "PRODUCTION" || card.type === "TRANSFORMATION" ? (
                                    <textarea
                                        ref={inputRef as any}
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder="Type your answer here..."
                                        className="w-full p-4 sm:p-6 bg-slate-50 dark:bg-surface-lighter/30 border border-slate-200 dark:border-slate-700 focus:border-primary rounded-2xl outline-none text-base sm:text-lg font-medium text-slate-900 dark:text-white transition-all min-h-[100px] resize-none focus:ring-2 focus:ring-primary/20"
                                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                                    />
                                ) : (
                                    <input
                                        ref={inputRef as any}
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder="Type here..."
                                        className="w-full p-4 sm:p-6 bg-slate-50 dark:bg-surface-lighter/30 border border-slate-200 dark:border-slate-700 focus:border-primary rounded-2xl outline-none text-xl sm:text-2xl font-bold text-slate-900 dark:text-white transition-all text-center focus:ring-2 focus:ring-primary/20"
                                        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                                    />
                                )
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!userInput.trim()}
                                    className="flex-[2] py-4 bg-primary hover:bg-amber-400 text-[#0F172A] font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                    <span>GỬI ĐÁP ÁN</span>
                                </button>

                                <button
                                    onClick={handleDontKnow}
                                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-xs border border-transparent hover:border-red-500/30"
                                    title="Tôi không biết đáp án"
                                >
                                    <span className="material-symbols-outlined text-[20px]">skip_next</span>
                                    <span className="hidden xs:inline">BỎ QUA</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6 sm:space-y-8"
                        >
                            {/* Result Display */}
                            <div className={`p-4 sm:p-6 rounded-2xl border ${isCorrect
                                ? "bg-green-500/10 border-green-500/20"
                                : "bg-red-500/10 border-red-500/20"
                                }`}>
                                <div className="flex items-center gap-2 mb-3">
                                    {isCorrect ? (
                                        <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
                                    )}
                                    <span className={`font-bold uppercase tracking-widest text-xs ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                        }`}>
                                        {isCorrect ? "Chính xác!" : "Cần xem lại"}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                        {card.answer}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSpeak(card.answer)}
                                            className="px-3 py-1.5 bg-white/50 dark:bg-white/5 rounded-lg text-slate-500 hover:text-primary transition-colors flex items-center gap-2 text-xs font-bold border border-slate-200 dark:border-white/10"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">volume_up</span> Listen
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Explanation */}
                            {card.explanation && (
                                <div className="p-4 sm:p-5 bg-blue-500/5 dark:bg-slate-800/50 rounded-2xl border border-blue-500/20">
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                        💡 {card.explanation}
                                    </p>
                                </div>
                            )}

                            {/* Self-grading Buttons */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                {[
                                    { grade: 0, label: "Again", color: "text-red-500", icon: "refresh" },
                                    { grade: 1, label: "Hard", color: "text-amber-500", icon: "priority_high" },
                                    { grade: 2, label: "Good", color: "text-green-500", icon: "check" },
                                    { grade: 3, label: "Easy", color: "text-blue-500", icon: "bolt" },
                                ].map((btn) => (
                                    <button
                                        key={btn.grade}
                                        onClick={() => handleGrade(btn.grade)}
                                        className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.95] transition-all group border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                                    >
                                        <span className={`material-symbols-outlined text-xl font-bold ${btn.color}`}>{btn.icon}</span>
                                        <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">{btn.label}</span>
                                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">{getNextReviewLabel(btn.grade)}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
