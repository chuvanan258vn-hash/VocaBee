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
        context?: string | null;
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
        if (inputValue !== "") setInputValue("");
        if (isCorrect !== null) setIsCorrect(null);
        if (showAnswer) setShowAnswer(false);
        if (showHint) setShowHint(false);
        
        // Use requestAnimationFrame for smoother focus
        const timer = setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 50);
        return () => clearTimeout(timer);
    }, [word.id]);

    const getHintCharacter = (char: string, idx: number) => {
        if (!word.word) return "";
        
        const answer = word.word;
        const words = answer.split(' ');
        
        if (char === " ") return " ";

        let charInWordIdx = idx;
        let wordIdx = 0;
        
        for (let i = 0; i < words.length; i++) {
            if (charInWordIdx < words[i].length) {
                wordIdx = i;
                break;
            }
            charInWordIdx -= (words[i].length + 1);
        }
        
        const currentWord = words[wordIdx];
        if (!currentWord) return '_';

        const isPermanentHint = charInWordIdx === 0 || 
                               (currentWord.length > 5 && charInWordIdx === currentWord.length - 1) ||
                               (currentWord.length > 9 && charInWordIdx === Math.floor(currentWord.length / 2));

        return isPermanentHint ? char : '_';
    };

    // Effect to auto-focus the input
    useEffect(() => {
        if (!showAnswer) {
            // Check if user is clicking text to allow selection
            const handleFocus = () => {
                const selection = window.getSelection();
                if (!selection || selection.toString().length === 0) {
                    inputRef.current?.focus();
                }
            };
            
            handleFocus(); // Initial focus
            
            // Re-focus on window focus to ensure keyboard stays active
            window.addEventListener('focus', handleFocus);
            return () => window.removeEventListener('focus', handleFocus);
        }
    }, [showAnswer, inputValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (showAnswer) return;
        const val = e.target.value;
        if (val.length <= word.word.length) {
            setInputValue(val.toLowerCase());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCheckAnswer();
        }
    };

    const triggerConfetti = () => {
        const duration = 2000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#FACC15', '#2DD4BF', '#F472B6'] 
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#FACC15', '#2DD4BF', '#F472B6']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    };

    const handleCheckAnswer = () => {
        if (!inputValue.trim()) return;

        const cleanInput = inputValue.trim().toLowerCase();
        const cleanAnswer = word.word.trim().toLowerCase();

        if (cleanInput === cleanAnswer) {
            setIsCorrect(true);
            setShowAnswer(true);
            speak(word.word);
            if (!showHint) triggerConfetti(); // Trigger confetti only if no hint was used
        } else {
            setIsCorrect(false);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    const handleReview = async (quality: number) => {
        setIsChecking(true);
        const isTypingBonus = isCorrect === true && !showHint && quality >= 4;
        onNext();
        const result = await reviewWordAction(word.id, quality, isTypingBonus);
        if (!result.success) {
            showToast(result.error || "Lỗi khi cập nhật", "error");
        }
        setIsChecking(false);
    };

    const getNextReviewLabel = (quality: number) => {
        if (quality === 0) return "< 1 phút";
        const result = calculateSm2({ interval: word.interval, repetition: word.repetition, efactor: word.efactor, quality, hideFuzz: true });
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
        <div 
            className="w-full max-w-4xl mx-auto px-4 py-4 md:py-6 flex flex-col items-center cursor-text"
            onClick={() => {
                const selection = window.getSelection();
                if (!selection || selection.toString().length === 0) {
                    inputRef.current?.focus();
                }
            }}
        >
            <div className={`w-full min-h-[350px] sm:min-h-[450px] py-10 max-w-2xl bg-white dark:bg-slate-900/50 rounded-[2rem] border ${isCorrect === false ? 'border-rose-500/50 shadow-rose-500/20' : isCorrect === true ? 'border-teal-500/50 shadow-teal-500/20' : 'border-slate-800/80'} shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group transition-colors duration-300`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

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

                <div className="z-10 flex flex-col items-center w-full px-6 md:px-10 py-10 h-full relative">
                    {/* Header Badges: Badge (Left) and Speaker (Right) */}
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none z-20">
                        <span className={`px-4 py-1.5 rounded-full border-2 text-[10px] md:text-xs font-bold uppercase tracking-widest ${typeStyles.text} ${typeStyles.border} bg-[#131722]/80 backdrop-blur-sm pointer-events-auto`}>
                            {normalizeWordType(word.wordType)}
                        </span>
                        
                        <button
                            onClick={() => speak(word.word)}
                            className="size-10 md:size-12 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm active:scale-90 pointer-events-auto"
                            title="Nghe phát âm"
                        >
                            <span className="material-symbols-outlined text-xl md:text-2xl filled">volume_up</span>
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex flex-col items-center text-center w-full flex-1 justify-center mt-6">
                        {!showAnswer ? (
                            /* --- PHẢI NGHĨ Phase --- */
                            <div className="flex flex-col items-center w-full gap-6">
                                <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
                                    ĐỊNH NGHĨA
                                </span>
                                <h2 className="font-plus font-black text-slate-200 leading-tight text-3xl md:text-5xl opacity-90">
                                    {word.meaning}
                                </h2>

                                {word.context && (
                                    <div className="bg-[#1A1F2D] dark:bg-amber-900/5 rounded-2xl px-5 py-3.5 border border-amber-200/30 dark:border-amber-700/20 max-w-md w-full shadow-sm mt-8">
                                        <p className="text-[12px] md:text-[15px] text-slate-400 font-medium leading-relaxed italic">
                                            {word.context}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* --- KẾT QUẢ Phase --- */
                            <div className="flex flex-col items-center w-full gap-8 animate-in fade-in zoom-in-95 duration-500">
                                {/* Word & Pronunciation */}
                                <div className="flex flex-col items-center gap-3">
                                    <h3 className={`font-black text-white tracking-tight leading-none drop-shadow-sm ${word.word?.length > 15 ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl'}`}>
                                        {word.word}
                                    </h3>
                                    {word.pronunciation && (
                                        <p className="text-sm md:text-lg text-slate-400 font-mono tracking-[0.2em] opacity-80">
                                            /{word.pronunciation.replace(/^\/|\/$/g, '')}/
                                        </p>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="w-16 h-px bg-slate-700/50 my-2"></div>

                                {/* Meaning */}
                                <h2 className={`font-plus font-black text-slate-200 leading-tight ${word.meaning?.length > 40 ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'}`}>
                                    {word.meaning}
                                </h2>

                                {/* Examples & Context */}
                                <div className="flex flex-col w-full max-w-2xl gap-3 mt-6">
                                    {word.example && (
                                        <div className="bg-slate-800/40 rounded-2xl px-6 py-4 md:px-8 md:py-5 border border-slate-700/50 w-full">
                                            <p className="text-[13px] md:text-[15px] text-slate-300 italic font-medium leading-relaxed text-center">
                                                "{word.example.replace(new RegExp(word.word, "gi"), "_____")}"
                                            </p>
                                        </div>
                                    )}

                                    {word.context && (
                                        <div className="bg-slate-800/40 rounded-2xl px-6 py-4 md:px-8 md:py-5 border border-amber-500/20 w-full flex items-center gap-4">
                                            <span className="material-symbols-outlined text-amber-500 text-xl md:text-2xl shrink-0">lightbulb</span>
                                            <p className="text-[13px] md:text-[15px] text-slate-300 font-medium leading-relaxed text-left">
                                                {word.context}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {!showAnswer && (
                        <div className="mt-auto pt-8 flex flex-col items-center gap-4">
                            <span className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] opacity-60">
                                Lần học: {word.repetition + 1}
                            </span>

                            {!showHint && (
                                <button
                                    onClick={() => {
                                        setShowHint(true);
                                        setInputValue("");
                                    }}
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
                                <div className={`relative w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 border-2 ${isCorrect === false ? 'border-rose-500 focus-within:border-rose-500 focus-within:ring-rose-500/20' : 'border-slate-200 dark:border-slate-800 focus-within:border-primary focus-within:ring-primary/20'} rounded-2xl transition-all duration-300 shadow-lg overflow-hidden`}>
                                    <div 
                                        className="w-full flex justify-center flex-wrap gap-y-2 py-4 px-6 select-none pointer-events-none"
                                        aria-hidden="true"
                                    >
                                        {word.word.split('').map((char, idx) => {
                                            const isTyped = idx < inputValue.length;
                                            const isCurrent = idx === inputValue.length;
                                            const typedChar = isTyped ? inputValue[idx] : null;
                                            const hintChar = getHintCharacter(char, idx);
                                            
                                            return (
                                                <div 
                                                    key={idx}
                                                    className={`relative flex items-center justify-center text-xl md:text-2xl font-black font-mono transition-all duration-200 w-[1.2em] h-[1.5em] ${
                                                        isTyped 
                                                            ? (isCorrect === false ? 'text-rose-500' : 'text-slate-900 dark:text-white') 
                                                            : (showHint ? 'text-slate-300 dark:text-slate-700' : 'text-transparent')
                                                    }`}
                                                >
                                                    <span>{isTyped ? typedChar : (showHint ? hintChar : (char === " " ? "\u00A0" : ""))}</span>
                                                    
                                                    {isCurrent && !isCorrect && (
                                                        <motion.div 
                                                            className="absolute bottom-0 w-full h-1 bg-primary"
                                                            animate={{ opacity: [1, 0] }}
                                                            transition={{ duration: 0.8, repeat: Infinity }}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <input
                                        ref={inputRef}
                                        type="text"
                                        title="Flashcard answer input"
                                        aria-label="Flashcard answer input"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        maxLength={word.word.length}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                                        autoComplete="off"
                                        spellCheck="false"
                                        autoFocus
                                    />

                                    {!showHint && inputValue.length === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-sm md:text-base italic">
                                            Nhấn để gõ...
                                        </div>
                                    )}
                                </div>

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
                                        setIsCorrect(false); 
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
                            <div className="relative group/alert w-full max-w-sm px-6 py-6 rounded-[2.5rem] bg-white/5 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/10 dark:border-white/5 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-rose-500/10 hover:border-rose-500/20">
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

                            <button
                                onClick={() => handleReview(0)}
                                disabled={isChecking}
                                className="group relative w-full max-w-xs h-16 rounded-[2rem] bg-[#FACC15] hover:bg-[#FDE047] text-slate-900 font-extrabold tracking-tight transition-all duration-500 shadow-[0_20px_40px_-15px_rgba(250,204,21,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(250,204,21,0.5)] transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden flex items-center justify-center gap-3"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                <span className="text-lg relative z-10">TIẾP TỤC ÔN TẬP</span>
                                <div className="size-8 rounded-full bg-slate-900/5 flex items-center justify-center group-hover:bg-slate-900 transition-colors relative z-10">
                                    <span className="material-symbols-outlined text-[20px] group-hover:text-white group-hover:translate-x-0.5 transition-all">arrow_forward</span>
                                </div>
                            </button>
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
