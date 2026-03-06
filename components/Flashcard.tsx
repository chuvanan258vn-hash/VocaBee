'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reviewWordAction } from '@/app/actions';
import { useToast } from './ToastProvider';
import { speak, normalizeWordType, getWordTypeStyles } from '@/lib/utils';
import { calculateSm2 } from '@/lib/sm2';

interface FlashcardProps {
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

const StatusBadge = ({ repetition, interval }: { repetition: number; interval: number }) => {
    if (repetition === 0 && interval === 0) {
        return (
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] border border-cyan-500/25 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                TỪ MỚI
            </span>
        );
    }
    if (repetition === 0 && interval > 0) {
        return (
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-violet-500/15 text-violet-500 dark:text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] border border-violet-500/25 shadow-[0_0_12px_rgba(139,92,246,0.15)]">
                <span className="material-symbols-outlined text-[12px]">replay</span>
                HỌC LẠI
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] border border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <span className="material-symbols-outlined text-[12px]">history</span>
            ÔN TẬP
        </span>
    );
};

export default function Flashcard({ word, onNext }: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const { showToast } = useToast();

    const handleFlip = useCallback(() => {
        setIsFlipped(prev => !prev);
    }, []);

    // Keyboard shortcut (Space)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                handleFlip();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleFlip]);

    // Auto-pronunciation on Appear (Front)
    useEffect(() => {
        if (!word.word) return;
        setIsFlipped(false);
        const autoPlaySetting = localStorage.getItem("vocabee-autoplay");
        const autoPlay = autoPlaySetting === null || autoPlaySetting === "true";
        if (autoPlay) {
            speak(word.word);
        }
    }, [word.id]);

    const handleReview = async (quality: number) => {
        const result = await reviewWordAction(word.id, quality);
        if (result.success) {
            onNext();
        } else {
            showToast(result.error || "Lỗi khi cập nhật", "error");
        }
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

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">

            {/* === CARD CONTAINER === */}
            <div
                className="w-full cursor-pointer select-none card-flip-container"
                onClick={handleFlip}
            >
                <div
                    className={`card-flip-inner${isFlipped ? ' flipped' : ''}`}
                >

                    {/* ====== FRONT FACE ====== */}
                    <div
                        className="card-face absolute inset-0 rounded-[28px] bg-surface border border-slate-200 dark:border-slate-800/80 shadow-2xl flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden"
                    >
                        {/* Subtle ambient glow */}
                        <div className="card-ambient-glow absolute inset-0 pointer-events-none" />

                        {/* Top-left: Word type badge */}
                        <div className="absolute top-5 left-5" onClick={e => e.stopPropagation()}>
                            {(() => {
                                const typeStyles = getWordTypeStyles(word.wordType);
                                return (
                                    <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border-2 ${typeStyles.text} ${typeStyles.border}`}>
                                        {normalizeWordType(word.wordType)}
                                    </span>
                                );
                            })()}
                        </div>

                        {/* Top-right: Star button */}
                        <div className="absolute top-5 right-5" onClick={e => e.stopPropagation()}>
                            <button className="p-2.5 rounded-full text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all duration-300" title="Đánh dấu yêu thích">
                                <span className="material-symbols-outlined text-[22px]">star</span>
                            </button>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-7">
                            <StatusBadge repetition={word.repetition} interval={word.interval} />
                        </div>

                        {/* Word */}
                        <h1 className="text-5xl md:text-7xl font-black text-center text-slate-900 dark:text-white tracking-tighter leading-none mb-6">
                            {word.word}
                        </h1>

                        {/* Phonetic */}
                        {word.pronunciation && (
                            <p className="text-base text-slate-400 dark:text-slate-500 font-mono italic mb-6 tracking-wider">
                                /{word.pronunciation.replace(/^\/|\/$/g, '')}/
                            </p>
                        )}

                        {/* Audio button */}
                        <div onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => speak(word.word)}
                                className="size-14 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_30px_rgba(250,204,21,0.35)] active:scale-90"
                                title="Nghe phát âm"
                            >
                                <span className="material-symbols-outlined text-[30px] filled">volume_up</span>
                            </button>
                        </div>

                        {/* Bottom hint */}
                        <div className="absolute bottom-6 flex items-center gap-2 text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                            <span className="material-symbols-outlined text-[16px]">touch_app</span>
                            Chạm để lật
                        </div>
                    </div>

                    {/* ====== BACK FACE ====== */}
                    <div
                        className="card-face-back absolute inset-0 rounded-[28px] bg-surface border border-slate-200 dark:border-slate-800/80 shadow-2xl flex flex-col p-7 md:p-10 overflow-y-auto"
                    >
                        {/* Subtle colored glow */}
                        <div className="card-ambient-glow absolute inset-0 pointer-events-none rounded-[28px]" />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-5 shrink-0" onClick={e => e.stopPropagation()}>
                            {(() => {
                                const typeStyles = getWordTypeStyles(word.wordType);
                                return (
                                    <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-lg border-2 ${typeStyles.text} ${typeStyles.border}`}>
                                        {normalizeWordType(word.wordType)}
                                    </span>
                                );
                            })()}
                            <button
                                onClick={() => speak(word.word)}
                                className="size-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all shadow-sm active:scale-90"
                            >
                                <span className="material-symbols-outlined text-[20px] filled">volume_up</span>
                            </button>
                        </div>

                        {/* Word + phonetic */}
                        <div className="flex flex-col items-center gap-1 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
                            <h3 className="text-2xl md:text-3xl font-black text-slate-700 dark:text-slate-200 tracking-tighter">
                                {word.word}
                            </h3>
                            {word.pronunciation && (
                                <span className="text-sm font-mono text-slate-400 dark:text-slate-500 tracking-[0.1em]">
                                    /{word.pronunciation.replace(/^\/|\/$/g, '')}/
                                </span>
                            )}
                        </div>

                        {/* Meaning — the BIG reveal */}
                        <div className="flex-1 flex items-center justify-center py-4">
                            <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white text-center leading-snug tracking-tight">
                                {word.meaning}
                            </p>
                        </div>

                        {/* Example */}
                        {word.example && (
                            <div className="mt-4 bg-slate-50/60 dark:bg-white/4 rounded-2xl px-6 py-4 border border-slate-100 dark:border-slate-800/50 shrink-0">
                                <p className="text-sm text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed text-center">
                                    "{word.example}"
                                </p>
                            </div>
                        )}

                        {/* Synonyms */}
                        {word.synonyms && (
                            <div className="mt-3 flex flex-wrap gap-2 justify-center shrink-0">
                                {word.synonyms.split(',').map((s, i) => (
                                    <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                        {s.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* === RATING BUTTONS === */}
            <AnimatePresence mode="wait">
                {isFlipped ? (
                    <motion.div
                        key="rating"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-3"
                    >
                        {ratingButtons.map(({ quality, label, sublabel, color, border }) => (
                            <button
                                key={quality}
                                onClick={() => handleReview(quality)}
                                className={`group flex flex-col items-center justify-center gap-1.5 py-5 rounded-2xl border-2 border-slate-200/70 dark:border-slate-800/70 bg-surface/80 ${border} shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95`}
                            >
                                <span className={`text-sm font-black ${color} uppercase tracking-[0.1em]`}>{label}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">{sublabel}</span>
                            </button>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="hint"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <button
                            onClick={handleFlip}
                            className="group relative px-10 py-3.5 bg-surface/60 hover:bg-surface/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 text-foreground rounded-2xl font-black text-base shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] flex items-center gap-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <span className="material-symbols-outlined text-primary text-[22px] group-hover:rotate-180 transition-transform duration-500">flip</span>
                            <span className="relative z-10">Lật Thẻ</span>
                        </button>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-50">
                            Hoặc nhấn Space
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
