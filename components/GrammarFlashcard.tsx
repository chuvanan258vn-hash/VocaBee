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
    myError?: string | null;
    trap?: string | null;
    goldenRule?: string | null;
    tags?: string | null;
    toeicPart?: number | null;
    grammarCategory?: string | null;
    signalKeywords?: string | null;
    formula?: string | null;
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

    // Determine if this is a TOEIC card
    const isToeic = card.type.startsWith("TOEIC_P");

    // Parse options: TOEIC uses {A,B,C,D} object, regular MCQ uses string[]
    let mcqOptions: { key: string; value: string }[] = [];
    if (card.options) {
        try {
            const parsed = JSON.parse(card.options);
            if (isToeic && typeof parsed === "object" && !Array.isArray(parsed)) {
                mcqOptions = Object.entries(parsed).map(([k, v]) => ({ key: k, value: v as string }));
            } else if (Array.isArray(parsed)) {
                mcqOptions = parsed.map((v: string, i: number) => ({ key: String.fromCharCode(65 + i), value: v }));
            }
        } catch { /* ignore parse errors */ }
    }

    // Parse TOEIC Part 6 passage: split by ---GAP--- separator
    const toeicPromptParts = isToeic && card.type === "TOEIC_P6"
        ? card.prompt.split("\n---GAP---\n")
        : null;
    // Parse TOEIC Part 7: split by ---Q--- separator
    const toeicP7Parts = isToeic && card.type === "TOEIC_P7"
        ? card.prompt.split("\n---Q---\n")
        : null;
    // Parse sentence structure from goldenRule (Part 7)
    let sentenceStructure: { subject?: string; relativeClause?: string; mainVerb?: string } | null = null;
    if (isToeic && card.type === "TOEIC_P7" && card.goldenRule) {
        try { sentenceStructure = JSON.parse(card.goldenRule); } catch { /* ignore */ }
    }

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
                className="bg-surface p-6 sm:p-10 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/80 relative overflow-hidden"
            >
                {/* Card Type Tag */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-8 flex items-center gap-2">
                    {card.repetition === 0 && card.interval === 0 ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase tracking-wider rounded-full border border-cyan-500/20">
                            <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                            CẤU TRÚC MỚI
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
                    <span className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${isToeic ? (card.type === "TOEIC_P5" ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                            : card.type === "TOEIC_P6" ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20")
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}>
                        {isToeic ? `TOEIC Part ${card.toeicPart}` : card.type === "NOTEBOOK" ? "MISTAKE NOTEBOOK" : card.type.replace("_", " ")}
                    </span>
                    {isToeic && card.grammarCategory && (
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-indigo-500/20 hidden sm:inline-flex">
                            {card.grammarCategory}
                        </span>
                    )}
                </div>

                <div className="space-y-6 sm:space-y-8">
                    {/* Prompt section */}
                    <div className="space-y-3 sm:space-y-4 pt-2">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                            <span className="material-symbols-outlined text-sm">help</span>
                            <span>Question / Task</span>
                        </div>
                        {/* TOEIC-specific prompt rendering */}
                        {isToeic && card.type === "TOEIC_P6" && toeicPromptParts ? (
                            <div className="space-y-3">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                        {toeicPromptParts[0]}
                                    </p>
                                </div>
                                {toeicPromptParts[1] && (
                                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                        📌 {toeicPromptParts[1]}
                                    </p>
                                )}
                            </div>
                        ) : isToeic && card.type === "TOEIC_P7" && toeicP7Parts ? (
                            <div className="space-y-3">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                        {toeicP7Parts[0]}
                                    </p>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                    ❓ {toeicP7Parts[1]}
                                </h2>
                            </div>
                        ) : (
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                {card.prompt}
                            </h2>
                        )}
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
                            {(card.type === "MCQ" || (isToeic && mcqOptions.length > 0)) ? (
                                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                    {mcqOptions.map((opt) => {
                                        const isSelected = isToeic ? userInput === opt.key : userInput === opt.value;
                                        return (
                                            <button
                                                key={opt.key}
                                                onClick={() => { setUserInput(isToeic ? opt.key : opt.value); }}
                                                className={`p-4 rounded-xl text-left font-bold border-2 transition-all text-sm sm:text-base ${isSelected
                                                    ? "bg-primary/10 border-primary text-foreground shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                                                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary/50"
                                                    }`}
                                            >
                                                <span className="mr-3 text-slate-300 font-black">{opt.key}.</span>
                                                {opt.value}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                card.type === "PRODUCTION" || card.type === "TRANSFORMATION" ? (
                                    <textarea
                                        ref={inputRef as any}
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder="Type your answer here..."
                                        className="w-full p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-primary rounded-2xl outline-none text-base sm:text-lg font-medium text-slate-900 dark:text-white transition-all min-h-[100px] resize-none focus:ring-2 focus:ring-primary/20"
                                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                                    />
                                ) : (
                                    <input
                                        ref={inputRef as any}
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder="Type here..."
                                        className="w-full p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-primary rounded-2xl outline-none text-xl sm:text-2xl font-bold text-slate-900 dark:text-white transition-all text-center focus:ring-2 focus:ring-primary/20"
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

                            {/* Analysis Section (for NOTEBOOK type) */}
                            {card.type === "NOTEBOOK" && (
                                <div className="space-y-4">
                                    {/* Primary Analysis: Error & Rule */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {card.myError && (
                                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase tracking-widest">
                                                    <span className="material-symbols-outlined text-sm">sentiment_dissatisfied</span>
                                                    LỖI CỦA TÔI
                                                </div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{card.myError}</p>
                                            </div>
                                        )}
                                        {card.goldenRule && (
                                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400 font-black text-[10px] uppercase tracking-widest">
                                                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                                    QUY TẮC VÀNG
                                                </div>
                                                <p className="text-xs font-bold text-amber-700 dark:text-amber-200">{card.goldenRule}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Secondary Analysis: Trap & Meaning */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {card.trap && (
                                            <div className="p-4 bg-slate-500/10 border border-slate-500/20 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-2 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                                                    <span className="material-symbols-outlined text-sm">nest_cam_floodlight</span>
                                                    CÁI BẪY (TRAP)
                                                </div>
                                                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 italic">{card.trap}</p>
                                            </div>
                                        )}
                                        {card.meaning && (
                                            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-2 text-indigo-500 font-black text-[10px] uppercase tracking-widest">
                                                    <span className="material-symbols-outlined text-sm">translate</span>
                                                    DỊCH NGHĨA
                                                </div>
                                                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 italic">{card.meaning}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Standard Meaning (if not Notebook or if Notebook is somehow structured differently) */}
                            {card.type !== "NOTEBOOK" && card.meaning && (
                                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 ml-1">Dịch nghĩa</div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic">
                                        {card.meaning}
                                    </p>
                                </div>
                            )}

                            {/* Explanation */}
                            {/* TOEIC-specific back-side sections */}
                            {isToeic && (
                                <div className="space-y-3">
                                    {/* Grammar Category + Formula row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {card.grammarCategory && (
                                            <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                                                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Grammar Category</div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{card.grammarCategory}</p>
                                            </div>
                                        )}
                                        {card.formula && (
                                            <div className="p-3 bg-teal-500/5 border border-teal-500/10 rounded-xl">
                                                <div className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-1">Formula</div>
                                                <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">{card.formula}</p>
                                            </div>
                                        )}
                                    </div>
                                    {/* Signal Keywords */}
                                    {card.signalKeywords && (
                                        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                            <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Signal Keywords ✨</div>
                                            <p className="text-sm font-bold text-amber-600 dark:text-amber-300">{card.signalKeywords}</p>
                                        </div>
                                    )}
                                    {/* Part 7: Sentence Structure */}
                                    {sentenceStructure && (
                                        <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                                            <div className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2">Sentence Structure 🧩</div>
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                {sentenceStructure.subject && (
                                                    <div><span className="font-black text-slate-400 block mb-0.5">S</span><span className="font-medium text-slate-600 dark:text-slate-300">{sentenceStructure.subject}</span></div>
                                                )}
                                                {sentenceStructure.relativeClause && (
                                                    <div><span className="font-black text-slate-400 block mb-0.5">RC</span><span className="font-medium text-slate-600 dark:text-slate-300">{sentenceStructure.relativeClause}</span></div>
                                                )}
                                                {sentenceStructure.mainVerb && (
                                                    <div><span className="font-black text-slate-400 block mb-0.5">V</span><span className="font-medium text-slate-600 dark:text-slate-300">{sentenceStructure.mainVerb}</span></div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {card.explanation && (
                                <div className="p-4 sm:p-5 bg-blue-500/5 dark:bg-slate-800/50 rounded-2xl border border-blue-500/20">
                                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5 ml-1">Giải thích</div>
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
