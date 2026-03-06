'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reviewWordAction } from '@/app/actions';
import { useToast } from './ToastProvider';
import { speak, normalizeWordType, getWordTypeStyles } from '@/lib/utils';
import { calculateSm2 } from '@/lib/sm2';
import confetti from 'canvas-confetti';

interface FlashcardInputProps {
    word: {
        id: string;
        word: string;
        meaning: string;
        pronunciation?: string | null;
        wordType?: string | null;
        example?: string | null;
        synonyms?: string | null;
        repetition: number;
        interval: number;
        efactor: number;
    };
    onNext: () => void;
}

export default function FlashcardInput({ word, onNext }: FlashcardInputProps) {
    const { showToast } = useToast();
    const [inputValue, setInputValue] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [shake, setShake] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset state when word changes
    useEffect(() => {
        setInputValue("");
        setIsCorrect(null);
        setShowAnswer(false);
        setShowHint(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [word.id]);

    const getHintPattern = () => {
        if (!word.word) return "";

        // Split into words to handle phrases like "Headed out" intelligently
        const words = word.word.split(' ');

        const mappedWords = words.map(w => {
            const characters = w.split('');
            return characters.map((char, index) => {
                // Always reveal the first letter of each word
                if (index === 0) return char;

                // For words longer than 5 letters, reveal the last letter
                if (w.length > 5 && index === w.length - 1) return char;

                // For very long words (> 9), reveal a middle letter
                if (w.length > 9 && index === Math.floor(w.length / 2)) return char;

                return '_';
            }).join(' ');
        });

        // Join words with more space to distinguish them
        return mappedWords.join('   ');
    };

    const handleCheckAnswer = () => {
        if (!inputValue.trim()) return;

        const cleanInput = inputValue.trim().toLowerCase();
        const cleanAnswer = word.word.trim().toLowerCase();

        if (cleanInput === cleanAnswer) {
            // Correct answer
            setIsCorrect(true);
            setShowAnswer(true);
            speak(word.word);

            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FACC15', '#2DD4BF', '#F472B6']
            });

        } else {
            // Incorrect answer
            setIsCorrect(false);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCheckAnswer();
        }
    };

    const handleReview = async (quality: number) => {
        setIsChecking(true);
        // Bonus only applies for Good (4) or Easy (5) quality AND if typed correctly without hints
        const isTypingBonus = isCorrect === true && !showHint && quality >= 4;
        const result = await reviewWordAction(word.id, quality, isTypingBonus);
        if (result.success) {
            onNext();
        } else {
            showToast(result.error || "Lỗi khi cập nhật", "error");
        }
        setIsChecking(false);
    };

    const getNextReviewLabel = (quality: number) => {
        if (quality === 0) return "< 1 phút";
        const result = calculateSm2({ interval: word.interval, repetition: word.repetition, efactor: word.efactor, quality });
        const days = result.interval;
        if (days === 0) return "< 1 ngày";
        if (days === 1) return "1 ngày";
        return `${days} ngày`;
    };

    const ratingButtons = [
        { quality: 0, label: "Quên mất", sublabel: getNextReviewLabel(0), color: "text-rose-500", border: "hover:border-rose-500/70 hover:bg-rose-500/5 hover:shadow-rose-500/10" },
        { quality: 3, label: "Khó nhớ", sublabel: getNextReviewLabel(3), color: "text-orange-500", border: "hover:border-orange-500/70 hover:bg-orange-500/5 hover:shadow-orange-500/10" },
        { quality: 4, label: "Nhớ được", sublabel: getNextReviewLabel(4), color: "text-emerald-500", border: "hover:border-emerald-500/70 hover:bg-emerald-500/5 hover:shadow-emerald-500/10" },
        { quality: 5, label: "Nhớ ngay", sublabel: getNextReviewLabel(5), color: "text-teal-400", border: "hover:border-teal-400/70 hover:bg-teal-400/5 hover:shadow-teal-400/10" },
    ];

    const typeStyles = getWordTypeStyles(word.wordType);

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-4 md:py-6 flex flex-col items-center">

            {/* Flashcard Container */}
            <div className={`w-full aspect-[4/3] sm:aspect-[16/10] max-w-2xl bg-white dark:bg-slate-900/50 rounded-3xl border ${isCorrect === false ? 'border-rose-500/50 shadow-rose-500/20' : isCorrect === true ? 'border-teal-500/50 shadow-teal-500/20' : 'border-slate-200 dark:border-slate-800'} shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group transition-colors duration-300`}>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

                {/* Typing Bonus Badge */}
                <AnimatePresence>
                    {isCorrect === true && !showHint && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg border-2 border-amber-400/50"
                        >
                            <span className="material-symbols-outlined text-[16px] md:text-[18px] filled">stars</span>
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Typing Bonus +1</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="z-10 flex flex-col items-center w-full px-6 md:px-8 py-6">
                    <span className="text-[8px] md:text-xs font-bold text-primary uppercase tracking-[0.3em] mb-4 md:mb-6">
                        Định nghĩa tiếng Việt
                    </span>

                    <div className="flex flex-col items-center gap-4 md:gap-6 w-full text-center">
                        <h2 className="font-plus text-xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                            {word.meaning}
                        </h2>

                        {word.example && !showAnswer && (
                            <div className="mt-2 bg-slate-50/60 dark:bg-white/5 rounded-xl px-4 py-2 md:px-6 md:py-3 border border-slate-100 dark:border-slate-800/50 max-w-sm md:max-w-md w-full">
                                <p className="text-[12px] md:text-base text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">
                                    "{word.example.replace(new RegExp(word.word, "gi"), "_____")}"
                                </p>
                            </div>
                        )}

                        {/* Revealed Answer */}
                        <AnimatePresence>
                            {showAnswer && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -20 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    className="pt-6 w-full flex flex-col items-center border-t border-slate-200 dark:border-slate-700 mt-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-3xl md:text-5xl font-black text-teal-500 dark:text-teal-400 tracking-tighter shadow-teal-500/20 drop-shadow-lg">
                                            {word.word}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => speak(word.word)}
                                                className="size-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-300 active:scale-90"
                                            >
                                                <span className="material-symbols-outlined text-2xl filled">volume_up</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${typeStyles.text} ${typeStyles.border} bg-white dark:bg-slate-900`}>
                                            {normalizeWordType(word.wordType)}
                                        </span>
                                        {word.pronunciation && (
                                            <p className="text-sm md:text-base text-slate-400 dark:text-slate-500 font-mono tracking-[0.1em]">
                                                /{word.pronunciation.replace(/^\/|\/$/g, '')}/
                                            </p>
                                        )}
                                    </div>

                                    {word.example && (
                                        <div className="mt-4 text-center">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                                                "{word.example}"
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {!showAnswer && (
                        <div className="mt-auto pt-6 flex flex-col items-center gap-6">
                            <div className="flex gap-3">
                                <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${typeStyles.text} ${typeStyles.border}`}>
                                    {normalizeWordType(word.wordType)}
                                </span>
                                {/* Repetition Level */}
                                <span className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Lần học: {word.repetition + 1}
                                </span>
                            </div>

                            {/* New Hint Button Placement */}
                            {!showHint && (
                                <button
                                    onClick={() => setShowHint(true)}
                                    className="group flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary/5 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary transition-all duration-500 animate-bounce-subtle"
                                >
                                    <span className="material-symbols-outlined text-[18px] filled">lightbulb</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Xem gợi ý (Hint)</span>
                                </button>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Interaction Area */}
            <div className="mt-8 flex flex-col items-center gap-6 w-full relative z-20">
                <AnimatePresence mode="wait">
                    {!showAnswer ? (
                        <motion.div
                            key="input-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full flex flex-col items-center gap-6"
                        >
                            <motion.div
                                className="w-full max-w-md relative group/input"
                                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                                transition={{ duration: 0.4 }}
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={showHint ? getHintPattern() : "Nhấn vào bóng đèn để xem gợi ý..."}
                                    className={`w-full bg-white dark:bg-slate-900 border-2 ${isCorrect === false ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 text-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/20 text-slate-900 dark:text-white'} rounded-2xl py-4 px-6 text-center text-xl font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 transition-all duration-300 shadow-lg`}
                                    autoComplete="off"
                                    spellCheck="false"
                                />

                                {isCorrect === false && (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 material-symbols-outlined">
                                        error
                                    </span>
                                )}
                            </motion.div>

                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <button
                                    onClick={handleCheckAnswer}
                                    disabled={!inputValue.trim()}
                                    className="group flex items-center justify-center gap-2 bg-primary hover:bg-yellow-400 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-600 text-slate-900 font-bold py-3.5 px-10 rounded-2xl transition-all duration-300 shadow-[0_0_15px_-3px_rgba(250,204,21,0.4)] disabled:shadow-none transform hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined font-bold text-xl">check_circle</span>
                                    <span className="text-base tracking-wide uppercase">Kiểm tra</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setShowAnswer(true);
                                        setIsCorrect(false); // They gave up
                                        speak(word.word);
                                    }}
                                    className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 border border-transparent hover:border-rose-500/20 hover:bg-rose-500/5 transition-all duration-500 uppercase tracking-widest"
                                >
                                    <span className="material-symbols-outlined text-[18px] opacity-70 group-hover:rotate-12 transition-transform">visibility</span>
                                    <span>Bỏ qua / Xem đáp án</span>
                                </button>
                            </div>
                        </motion.div>
                    ) : !isCorrect ? (
                        <motion.div
                            key="skip-next"
                            initial={{ opacity: 0, scale: 0.9, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="w-full flex flex-col items-center gap-8"
                        >
                            {/* Premium Glass Alert */}
                            <div className="relative group/alert w-full max-w-sm px-6 py-6 rounded-[2.5rem] bg-white/5 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/10 dark:border-white/5 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-rose-500/10 hover:border-rose-500/20">
                                {/* Ambient rose glow */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] pointer-events-none group-hover/alert:bg-rose-500/20 transition-all" />

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20 rotate-3 group-hover/alert:rotate-0 transition-transform">
                                        <span className="material-symbols-outlined text-rose-500 text-2xl filled animate-pulse">priority_high</span>
                                    </div>
                                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-2 opacity-80">Ghi nhận: Quên mất</h4>
                                    <p className="text-base font-bold text-slate-700 dark:text-slate-100 leading-snug max-w-[220px]">
                                        Tổ ong sẽ giúp bạn ôn tập lại từ này sớm nhất!
                                    </p>
                                </div>
                            </div>

                            {/* Premium Primary Button */}
                            <button
                                onClick={() => handleReview(0)}
                                disabled={isChecking}
                                className="group relative w-full max-w-xs h-16 rounded-[2rem] bg-[#FACC15] hover:bg-[#FDE047] text-slate-900 font-extrabold tracking-tight transition-all duration-500 shadow-[0_20px_40px_-15px_rgba(250,204,21,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(250,204,21,0.5)] transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden flex items-center justify-center gap-3"
                            >
                                {/* Liquid shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                                <span className="text-lg relative z-10">TIẾP TỤC ÔN TẬP</span>
                                <div className="size-8 rounded-full bg-slate-900/5 flex items-center justify-center group-hover:bg-slate-900 transition-colors relative z-10">
                                    <span className="material-symbols-outlined text-[20px] group-hover:text-white group-hover:translate-x-0.5 transition-all">arrow_forward</span>
                                </div>
                            </button>

                            {/* Subtle footer hint */}
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] opacity-40">
                                Nhấn Enter để chuyển tiếp
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="rating-buttons"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <h4 className="text-center text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                                Bạn đánh giá độ khó thế nào?
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {ratingButtons.map(({ quality, label, sublabel, color, border }) => (
                                    <button
                                        key={quality}
                                        onClick={() => handleReview(quality)}
                                        disabled={isChecking}
                                        className={`group flex flex-col items-center justify-center gap-1.5 py-5 rounded-2xl border-2 border-slate-200/70 dark:border-slate-800/70 bg-surface/80 ${border} shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50`}
                                    >
                                        <span className={`text-sm font-black ${color} uppercase tracking-[0.1em]`}>{label}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold">{sublabel}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
