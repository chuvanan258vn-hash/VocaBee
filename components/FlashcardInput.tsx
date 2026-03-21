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
    const [inputValue, setInputValue] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [shake, setShake] = useState(false);
    const [hintLevel, setHintLevel] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset when word changes
    useEffect(() => {
        setInputValue('');
        setIsCorrect(null);
        setShowAnswer(false);
        setHintLevel(0);
        const t = setTimeout(() => inputRef.current?.focus(), 80);
        return () => clearTimeout(t);
    }, [word.id]);

    // Keep input focused
    useEffect(() => {
        if (!showAnswer) {
            const handleFocus = () => {
                const sel = window.getSelection();
                if (!sel || sel.toString().length === 0) inputRef.current?.focus();
            };
            handleFocus();
            window.addEventListener('focus', handleFocus);
            return () => window.removeEventListener('focus', handleFocus);
        }
    }, [showAnswer, inputValue]);

    // Auto-redirect typing to input: if user types a printable char anywhere, refocus input
    useEffect(() => {
        if (showAnswer) return;
        const handleGlobalKey = (e: KeyboardEvent) => {
            // Ignore modifier-only, special keys, and keys already in the input
            if (document.activeElement === inputRef.current) return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            if (e.key.length !== 1) return; // only printable characters
            inputRef.current?.focus();
        };
        window.addEventListener('keydown', handleGlobalKey);
        return () => window.removeEventListener('keydown', handleGlobalKey);
    }, [showAnswer]);

    // Seeded pseudo-random: deterministic per word string
    const buildHintSet = (answer: string): Set<number> => {
        // Simple hash from the answer string → seed
        let seed = 0;
        for (let i = 0; i < answer.length; i++) seed = (seed * 31 + answer.charCodeAt(i)) >>> 0;

        // LCG random using seed
        const lcg = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0xFFFFFFFF; };

        const revealed = new Set<number>();
        const words = answer.split(' ');
        let offset = 0;

        for (const w of words) {
            if (w.length === 0) { offset++; continue; }

            // Always reveal the first letter of each sub-word
            revealed.add(offset);

            // Add ~20% more random chars from remaining positions (min 0 extra for short words)
            const remaining = Array.from({ length: w.length - 1 }, (_, i) => i + 1)
                .sort(() => lcg() - 0.5);
            const extraCount = Math.floor(w.length * 0.20); // max 20% total random
            for (let i = 0; i < extraCount; i++) revealed.add(offset + remaining[i]);

            offset += w.length + 1;
        }
        return revealed;
    };

    // Memoize the hint set per word so it doesn't change on re-render
    const hintSetRef = useRef<Set<number>>(new Set());
    useEffect(() => { hintSetRef.current = buildHintSet(word.word); }, [word.id]);

    const getHintCharacter = (char: string, idx: number) => {
        if (char === ' ') return ' ';
        return hintSetRef.current.has(idx) ? char : '_';
    };

    const triggerConfetti = () => {
        const end = Date.now() + 2000;
        const frame = () => {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FACC15', '#2DD4BF', '#F472B6'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FACC15', '#2DD4BF', '#F472B6'] });
            if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
    };

    const calculatedQuality = isCorrect ? (hintLevel === 0 ? 5 : hintLevel === 1 ? 4 : hintLevel === 2 ? 3 : 2) : 0;

    useEffect(() => {
        if (showAnswer && !isChecking) {
            let active = false;
            // Delay listener activation slightly to prevent catching the same Enter press or key-repeat
            const t = setTimeout(() => { active = true; }, 400);

            const handleEnter = (e: KeyboardEvent) => {
                if (!active) return;
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleReview(calculatedQuality);
                }
            };
            window.addEventListener('keydown', handleEnter);
            return () => {
                clearTimeout(t);
                window.removeEventListener('keydown', handleEnter);
            };
        }
    }, [showAnswer, isChecking, calculatedQuality]);

    const handleCheckAnswer = () => {
        if (!inputValue.trim() || isCorrect === true) return;
        const cleanInput = inputValue.trim().toLowerCase();
        const cleanAnswer = word.word.trim().toLowerCase();
        if (cleanInput === cleanAnswer) {
            setIsCorrect(true);
            speak(word.word);
            if (hintLevel === 0) triggerConfetti();
            
            // Wait 800ms before showing the Result screen to let user see green text
            setTimeout(() => {
                setShowAnswer(true);
            }, 800);
        } else {
            setIsCorrect(false);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { e.preventDefault(); handleCheckAnswer(); }
    };

    const handleReview = async (quality: number) => {
        setIsChecking(true);
        const isTypingBonus = isCorrect === true && hintLevel === 0 && quality >= 4;
        onNext();
        const result = await reviewWordAction(word.id, quality, isTypingBonus);
        if (!result.success) showToast(result.error || 'Lỗi khi cập nhật', 'error');
        setIsChecking(false);
    };

    const getNextReviewLabel = (quality: number) => {
        if (quality === 0) return '< 1 phút';
        const result = calculateSm2({ interval: word.interval, repetition: word.repetition, efactor: word.efactor, quality, hideFuzz: true });
        const days = result.interval;
        if (days === 0) return '< 1 ngày';
        if (days === 1) return '1 ngày';
        return `${days} ngày`;
    };

    const typeStyles = getWordTypeStyles(word.wordType);
    const borderColor = isCorrect === null
        ? 'border-slate-800/80'
        : isCorrect
            ? 'border-teal-500/60 shadow-teal-500/10'
            : 'border-rose-500/60 shadow-rose-500/10';

    return (
        <div
            className="w-full max-w-2xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-4 cursor-text"
            onClick={() => {
                const sel = window.getSelection();
                if (!sel || sel.toString().length === 0) inputRef.current?.focus();
            }}
        >
            {/* ═══════════ CARD ═══════════ */}
            <div className={`w-full rounded-[2rem] bg-slate-900/60 backdrop-blur border-2 ${borderColor} shadow-2xl transition-all duration-500 overflow-hidden`}>

                {/* ── Top bar ── */}
                <div className="flex items-center justify-between px-6 pt-5 pb-0">
                    <span className={`px-3 py-1 rounded-lg border-2 text-[10px] font-black uppercase tracking-[0.2em] ${typeStyles.text} ${typeStyles.border}`}>
                        {normalizeWordType(word.wordType)}
                    </span>

                    <div className="flex items-center gap-2">
                        {/* Typing Bonus badge */}
                        <AnimatePresence>
                            {isCorrect === true && hintLevel === 0 && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.7, x: 10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-1.5 bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border-2 border-amber-400/60"
                                >
                                    <span className="material-symbols-outlined text-[14px] filled">stars</span>
                                    Typing Bonus +1
                                </motion.span>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {(showAnswer || hintLevel >= 3) && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={(e) => { e.stopPropagation(); speak(word.word); }}
                                    className="size-10 rounded-full bg-amber-500/10 hover:bg-amber-500/25 text-amber-500 flex items-center justify-center transition-all duration-300 active:scale-90"
                                    title="Nghe phát âm"
                                >
                                    <span className="material-symbols-outlined text-xl filled">volume_up</span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Main content ── */}
                <div className="px-6 pt-6 pb-8 flex flex-col items-center gap-5">
                    <AnimatePresence mode="wait">
                        {!showAnswer ? (
                            /* ─── Phase: Guess ─── */
                            <motion.div
                                key="guess"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center gap-5 w-full"
                            >
                                {/* Label */}
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.35em]">
                                    Định nghĩa
                                </span>

                                {/* Meaning — big */}
                                <h2 className="font-black text-white text-center leading-tight text-3xl md:text-4xl">
                                    {word.meaning}
                                </h2>

                                {/* Pronunciation hint */}
                                {hintLevel >= 2 && word.pronunciation && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center -mt-2 mb-2"
                                    >
                                        <span className="text-lg md:text-xl font-mono text-teal-400/90 tracking-[0.15em] bg-teal-500/10 px-4 py-1.5 rounded-xl border border-teal-500/20 shadow-sm inline-block">
                                            /{word.pronunciation.replace(/^\/|\/$/g, '')}/
                                        </span>
                                    </motion.div>
                                )}

                                {/* Context hint */}
                                {word.context && (
                                    <div className="w-full max-w-md bg-amber-500/5 border border-amber-500/20 rounded-2xl px-4 py-3">
                                        <p className="text-xs md:text-sm text-slate-400 italic text-center leading-relaxed">
                                            <span className="material-symbols-outlined text-[13px] text-amber-500 align-middle mr-1">lightbulb</span>
                                            {word.context}
                                        </p>
                                    </div>
                                )}

                                {/* Meta row */}
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="px-3 py-1 rounded-full border border-slate-700 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                        Lần học: {word.repetition + 1}
                                    </span>
                                    {hintLevel < 3 && (
                                        <button
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                if (hintLevel === 0) {
                                                    setHintLevel(1); 
                                                    setInputValue('');
                                                } else if (hintLevel === 1) {
                                                    setHintLevel(word.pronunciation ? 2 : 3);
                                                    if (!word.pronunciation) speak(word.word);
                                                } else {
                                                    setHintLevel(3);
                                                    speak(word.word);
                                                }
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300"
                                        >
                                            <span className="material-symbols-outlined text-[14px] filled">
                                                {hintLevel === 0 ? 'lightbulb' : hintLevel === 1 && word.pronunciation ? 'subtitles' : 'volume_up'}
                                            </span>
                                            {hintLevel === 0 ? 'Gợi ý' : hintLevel === 1 && word.pronunciation ? 'Phiên âm' : 'Nghe Audio'}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            /* ─── Phase: Result ─── */
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center gap-4 w-full"
                            >
                                {/* Correct / Wrong icon */}
                                <div className={`size-14 rounded-2xl flex items-center justify-center border-2 ${isCorrect ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                                    <span className="material-symbols-outlined text-3xl filled">
                                        {isCorrect ? 'check_circle' : 'cancel'}
                                    </span>
                                </div>

                                {/* Word + phonetic */}
                                <div className="flex flex-col items-center gap-1">
                                    <h3 className={`font-black text-white tracking-tight text-4xl md:text-5xl leading-none`}>
                                        {word.word}
                                    </h3>
                                    {word.pronunciation && (
                                        <span className="text-sm font-mono text-slate-400 tracking-[0.1em]">
                                            /{word.pronunciation.replace(/^\/|\/$/g, '')}/
                                        </span>
                                    )}
                                </div>

                                <div className="w-12 h-px bg-slate-700/60 my-1" />

                                {/* Meaning */}
                                <p className={`font-black text-slate-200 text-center leading-tight ${word.meaning?.length > 40 ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'}`}>
                                    {word.meaning}
                                </p>

                                {/* Example */}
                                {word.example && (
                                    <div className="w-full bg-slate-800/50 rounded-2xl px-5 py-3.5 border border-slate-700/50">
                                        <p className="text-sm text-slate-300 italic leading-relaxed text-center">
                                            &ldquo;{word.example.replace(new RegExp(word.word, 'gi'), '_____')}&rdquo;
                                        </p>
                                    </div>
                                )}

                                {/* Context */}
                                {word.context && (
                                    <div className="w-full bg-amber-500/5 rounded-2xl px-5 py-3.5 border border-amber-500/20 flex items-start gap-3">
                                        <span className="material-symbols-outlined text-amber-500 text-lg shrink-0 mt-0.5">lightbulb</span>
                                        <p className="text-sm text-slate-300 leading-relaxed">{word.context}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ═══════════ INPUT + ACTIONS ═══════════ */}
            <AnimatePresence mode="wait">
                {!showAnswer ? (
                    <motion.div
                        key="input-section"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center gap-4 w-full"
                    >
                        {/* ── Letter display + hidden input ── */}
                        <motion.div
                            className="w-full relative"
                            animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
                            transition={{ duration: 0.35 }}
                        >
                            <div className={`relative w-full bg-slate-900 border-2 ${isCorrect === false ? 'border-rose-500' : 'border-slate-700 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(250,204,21,0.15)]'} rounded-2xl transition-all duration-300 overflow-hidden`}>
                                {/* Letter boxes */}
                                <div className="flex justify-center flex-wrap gap-y-2 gap-x-0.5 py-5 px-6 select-none pointer-events-none" aria-hidden="true">
                                    {word.word.split('').map((char, idx) => {
                                        const isTyped = idx < inputValue.length;
                                        const isCurrent = idx === inputValue.length;
                                        const typedChar = isTyped ? inputValue[idx] : null;
                                        const hintChar = getHintCharacter(char, idx);
                                        const isSpace = char === ' ';

                                        return (
                                            <div
                                                key={idx}
                                                className={`relative flex items-end justify-center transition-all duration-150 ${isSpace ? 'w-4' : 'w-[1.35rem] md:w-[1.6rem]'} h-9`}
                                            >
                                                {!isSpace && (
                                                    <span className={`text-xl md:text-2xl font-black font-mono leading-none pb-1 transition-colors duration-150 ${
                                                        isTyped
                                                            ? (isCorrect === false ? 'text-rose-400' : isCorrect === true ? 'text-teal-400' : 'text-white')
                                                            : hintLevel > 0
                                                                ? 'text-slate-500'
                                                                : 'text-transparent'
                                                    }`}>
                                                        {isTyped ? typedChar : (hintLevel > 0 ? hintChar : char)}
                                                    </span>
                                                )}
                                                {/* Underline */}
                                                {!isSpace && (
                                                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-colors duration-200 ${
                                                        isTyped
                                                            ? (isCorrect === false ? 'bg-rose-500' : isCorrect === true ? 'bg-teal-500' : 'bg-primary')
                                                            : 'bg-slate-700'
                                                    }`} />
                                                )}
                                                {/* Cursor blink */}
                                                {isCurrent && isCorrect !== false && (
                                                    <motion.div
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                                                        animate={{ opacity: [1, 0] }}
                                                        transition={{ duration: 0.7, repeat: Infinity }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Placeholder when empty */}
                                {hintLevel === 0 && inputValue.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-600 text-sm italic">
                                        Nhấn để gõ...
                                    </div>
                                )}

                                {/* Hidden real input */}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    title="Nhập từ vựng"
                                    aria-label="Nhập từ vựng"
                                    value={inputValue}
                                    readOnly={showAnswer || isCorrect === true}
                                    onChange={(e) => {
                                        if (showAnswer || isCorrect === true) return;
                                        const v = e.target.value;
                                        if (v.length <= word.word.length) setInputValue(v.toLowerCase());
                                    }}
                                    onKeyDown={handleKeyDown}
                                    maxLength={word.word.length}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                                    autoComplete="off"
                                    spellCheck="false"
                                    autoFocus
                                />

                                {/* Error icon */}
                                {isCorrect === false && (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 material-symbols-outlined text-xl pointer-events-none">
                                        error
                                    </span>
                                )}
                            </div>
                        </motion.div>

                        {/* ── Action buttons ── */}
                        <div className="flex items-center gap-3 w-full justify-center">
                            <button
                                onClick={handleCheckAnswer}
                                disabled={!inputValue.trim()}
                                className="flex items-center justify-center gap-2 bg-primary hover:bg-yellow-300 disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 font-black py-3 px-8 rounded-2xl transition-all duration-300 shadow-[0_0_20px_-4px_rgba(250,204,21,0.4)] disabled:shadow-none hover:scale-105 active:scale-95 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
                            >
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                Kiểm tra
                            </button>

                            <button
                                onClick={() => { setShowAnswer(true); setIsCorrect(false); speak(word.word); }}
                                className="flex items-center gap-1.5 px-5 py-3 rounded-2xl font-bold text-xs text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all duration-300 uppercase tracking-widest"
                            >
                                <span className="material-symbols-outlined text-[16px] opacity-70">visibility</span>
                                Bỏ qua
                            </button>
                        </div>
                    </motion.div>
                ) : !isCorrect ? (
                    /* ─── Skipped / Wrong: next card ─── */
                    <motion.div
                        key="skip-next"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-4 w-full"
                    >
                        <div className="w-full max-w-sm px-5 py-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-rose-500 text-xl filled">priority_high</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Ghi nhận: Quên mất</p>
                                <p className="text-sm font-semibold text-slate-300 leading-snug">VocaBee sẽ ôn lại từ này sớm nhất!</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleReview(0)}
                            disabled={isChecking}
                            className="group relative w-full max-w-sm h-14 rounded-2xl bg-primary hover:bg-yellow-300 text-slate-900 font-black tracking-tight transition-all duration-300 shadow-[0_8px_25px_-8px_rgba(250,204,21,0.4)] hover:shadow-[0_12px_30px_-6px_rgba(250,204,21,0.5)] hover:scale-[1.02] active:scale-[0.98] overflow-hidden flex items-center justify-center gap-2.5 disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <span className="text-base relative z-10 uppercase tracking-widest">Tiếp tục ôn tập</span>
                            <span className="material-symbols-outlined text-xl relative z-10">arrow_forward</span>
                        </button>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Hoặc nhấn Enter</p>
                    </motion.div>
                ) : (
                    /* ─── Correct: auto rate difficulty ─── */
                    <motion.div
                        key="auto-rating"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-4 w-full"
                    >
                        {(() => {
                            const finalRating = [
                                { quality: 0, label: 'Quên mất', sublabel: getNextReviewLabel(0), color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
                                { quality: 2, label: 'Nhớ kém', sublabel: getNextReviewLabel(2), color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
                                { quality: 3, label: 'Khó nhớ', sublabel: getNextReviewLabel(3), color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
                                { quality: 4, label: 'Nhớ được', sublabel: getNextReviewLabel(4), color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
                                { quality: 5, label: 'Nhớ ngay', sublabel: getNextReviewLabel(5), color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/30' },
                            ].find(r => r.quality === calculatedQuality) || { quality: calculatedQuality, label: 'Nhớ ngay', sublabel: getNextReviewLabel(5), color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/30' };

                            return (
                                <>
                                    <div className={`w-full max-w-sm px-5 py-4 rounded-2xl ${finalRating.bg} border ${finalRating.border} flex items-center gap-3`}>
                                        <div className={`size-10 rounded-xl ${finalRating.bg} border ${finalRating.border} flex items-center justify-center shrink-0`}>
                                            <span className={`material-symbols-outlined ${finalRating.color} text-xl filled`}>
                                                {calculatedQuality >= 4 ? 'verified' : 'fact_check'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-[10px] font-black ${finalRating.color} uppercase tracking-widest mb-0.5`}>Đánh giá: {finalRating.label}</p>
                                            <p className="text-sm font-semibold text-slate-300 leading-snug">Ôn lại sau: {finalRating.sublabel}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleReview(calculatedQuality)}
                                        disabled={isChecking}
                                        className="group relative w-full max-w-sm h-14 rounded-2xl bg-primary hover:bg-yellow-300 text-slate-900 font-black tracking-tight transition-all duration-300 shadow-[0_8px_25px_-8px_rgba(250,204,21,0.4)] hover:shadow-[0_12px_30px_-6px_rgba(250,204,21,0.5)] hover:scale-[1.02] active:scale-[0.98] overflow-hidden flex items-center justify-center gap-2.5 disabled:opacity-50"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                        <span className="text-base relative z-10 uppercase tracking-widest">Tiếp tục ôn tập</span>
                                        <span className="material-symbols-outlined text-xl relative z-10">arrow_forward</span>
                                    </button>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Hoặc nhấn Enter</p>
                                </>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
