"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Send, CheckCircle2, AlertCircle, HelpCircle, ChevronRight, Lightbulb, SkipForward } from "lucide-react";
import { reviewGrammarCardAction } from "@/app/actions";

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
                className="glass dark:bg-slate-900/80 p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl relative overflow-hidden"
            >
                {/* Card Type Tag */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-8 flex items-center gap-2">
                    {card.repetition === 0 ? (
                        <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-yellow-400 text-slate-900 text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                            TỪ MỚI
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-300/50 dark:border-slate-700/50">
                            ÔN TẬP
                        </span>
                    )}
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-full border border-yellow-400/20">
                        {card.type.replace("_", " ")}
                    </span>
                </div>

                <div className="space-y-6 sm:space-y-8">
                    {/* Prompt section */}
                    <div className="space-y-3 sm:space-y-4 pt-2">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-tighter">
                            <HelpCircle size={12} className="sm:w-[14px] sm:h-[14px]" />
                            <span>Question / Task</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-tight">
                            {card.prompt}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleSpeak(card.prompt)}
                                className="p-1.5 sm:p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-yellow-500 transition-colors"
                            >
                                <Volume2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                            {card.hint && (
                                <button
                                    onClick={() => setShowHint(!showHint)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${showHint
                                        ? "bg-yellow-400 text-slate-900"
                                        : "bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-yellow-500"
                                        }`}
                                >
                                    <Lightbulb size={12} className="sm:w-[14px] sm:h-[14px]" />
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
                                    className="p-3 sm:p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl overflow-hidden"
                                >
                                    <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400/80 italic font-medium">
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
                                            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left font-bold border-2 transition-all text-sm sm:text-base ${userInput === opt
                                                ? "bg-yellow-400 border-yellow-400 text-slate-900 shadow-md"
                                                : "bg-slate-50 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-300 hover:border-slate-200 dark:hover:border-white/10"
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
                                        className="w-full p-4 sm:p-6 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-yellow-400 rounded-2xl sm:rounded-3xl outline-none text-base sm:text-xl font-bold text-slate-800 dark:text-white transition-all min-h-[100px] sm:min-h-[120px] resize-none"
                                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                                    />
                                ) : (
                                    <input
                                        ref={inputRef as any}
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder="Type here..."
                                        className="w-full p-4 sm:p-6 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-yellow-400 rounded-2xl sm:rounded-3xl outline-none text-xl sm:text-3xl font-black text-slate-800 dark:text-white transition-all text-center"
                                        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                                    />
                                )
                            )}

                            <div className="flex gap-2 sm:gap-3">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!userInput.trim()}
                                    className="flex-[2] py-4 sm:py-5 bg-slate-900 dark:bg-yellow-400 text-white dark:text-slate-900 font-black rounded-xl sm:rounded-[1.5rem] flex items-center justify-center gap-2 sm:gap-3 active:scale-[0.98] transition-all disabled:opacity-50 text-sm sm:text-base"
                                >
                                    <Send size={18} className="sm:w-[20px] sm:h-[20px]" />
                                    <span>GỬI ĐÁP ÁN</span>
                                </button>

                                <button
                                    onClick={handleDontKnow}
                                    className="flex-1 py-4 sm:py-5 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-red-500 font-bold rounded-xl sm:rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-[10px] sm:text-xs"
                                    title="Tôi không biết đáp án"
                                >
                                    <SkipForward size={18} className="sm:w-[20px] sm:h-[20px]" />
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
                            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 ${isCorrect
                                ? "bg-green-500/10 border-green-500/20"
                                : "bg-red-500/10 border-red-500/20"
                                }`}>
                                <div className="flex items-center gap-3 mb-2">
                                    {isCorrect ? (
                                        <CheckCircle2 size={18} className="text-green-500" />
                                    ) : (
                                        <AlertCircle size={18} className="text-red-500" />
                                    )}
                                    <span className={`font-black uppercase tracking-widest text-[10px] sm:text-xs ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                        }`}>
                                        {isCorrect ? "Chính xác!" : "Cần xem lại"}
                                    </span>
                                </div>
                                <div className="space-y-3 sm:space-y-4">
                                    <p className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white leading-tight">
                                        {card.answer}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSpeak(card.answer)}
                                            className="px-2.5 py-1.5 bg-white/50 dark:bg-white/5 rounded-xl text-slate-400 hover:text-yellow-500 transition-colors flex items-center gap-2 text-[10px] font-bold"
                                        >
                                            <Volume2 size={14} /> Listen
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Explanation */}
                            {card.explanation && (
                                <div className="p-4 sm:p-6 bg-blue-500/5 dark:bg-white/5 rounded-2xl sm:rounded-3xl border border-blue-500/10">
                                    <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                        💡 {card.explanation}
                                    </p>
                                </div>
                            )}

                            {/* Self-grading Buttons */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                {[
                                    { grade: 0, label: "Học lại", color: "text-red-500", icon: "↺" },
                                    { grade: 1, label: "Khó", color: "text-orange-500", icon: "!" },
                                    { grade: 2, label: "Dễ", color: "text-green-500", icon: "✓" },
                                    { grade: 3, label: "Rất dễ", color: "text-blue-500", icon: "⚡" },
                                ].map((btn) => (
                                    <button
                                        key={btn.grade}
                                        onClick={() => handleGrade(btn.grade)}
                                        className="flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-white/5 active:scale-[0.95] transition-all group"
                                    >
                                        <span className={`text-lg sm:text-xl font-black ${btn.color}`}>{btn.icon}</span>
                                        <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 truncate w-full">{btn.label}</span>
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
