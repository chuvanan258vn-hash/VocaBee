'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reviewWordAction } from '@/app/actions';
import { useToast } from './ToastProvider';
import { getWordTypeColor, speak, normalizeWordType } from '@/lib/utils';

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
    };
    onNext: () => void;
}

export default function Flashcard({ word, onNext }: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const { showToast } = useToast();

    const handleFlip = () => {
        if (!isAnimating) {
            setIsFlipped(!isFlipped);
            setIsAnimating(true);
        }
    };

    // Auto-pronunciation on Appear (Front)
    useEffect(() => {
        // Only trigger if word exists
        if (!word.word) return;

        const autoPlaySetting = localStorage.getItem("vocabee-autoplay");
        // Default to true if not set, otherwise check if explicitly "true"
        const autoPlay = autoPlaySetting === null || autoPlaySetting === "true";

        if (autoPlay) {
            speak(word.word);
        }
    }, [word.id]); // Only trigger when the word ID changes (initial appearance)

    const handleReview = async (quality: number) => {
        const result = await reviewWordAction(word.id, quality);
        if (result.success) {
            onNext();
            setIsFlipped(false);
        } else {
            showToast(result.error || "Lỗi khi cập nhật", "error");
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="group perspective-1000 w-full min-h-[600px] md:min-h-[750px] cursor-pointer relative">
                <motion.div
                    className="relative w-full h-full duration-700 preserve-3d group-hover:shadow-glow-primary transition-all flex flex-col"
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        mass: 1
                    }}
                    style={{ height: '100%', minHeight: 'inherit' }}
                    onAnimationComplete={() => setIsAnimating(false)}
                    onClick={handleFlip}
                >
                    {/* Front Side: Large Word - Matches screen5.html */}
                    <div className="absolute inset-0 backface-hidden w-full h-full bg-surface rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col p-12 md:p-20 items-center justify-center overflow-hidden">
                        {/* Top Toolbar */}
                        <div
                            className="absolute top-10 right-10 flex gap-5"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-all duration-300" title="Add to favorites">
                                <span className="material-symbols-outlined text-[36px]">star</span>
                            </button>
                        </div>

                        <div className="mb-12 md:mb-16">
                            <span className="px-6 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-black uppercase tracking-[0.3em]">
                                {word.repetition === 0 ? 'TỪ MỚI' : 'ÔN TẬP'}
                            </span>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 mb-12">
                            <h1 className="text-7xl md:text-9xl font-black text-center text-slate-900 dark:text-white tracking-tighter leading-none select-none">
                                {word.word}
                            </h1>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    speak(word.word);
                                }}
                                className="flex-shrink-0 size-24 md:size-32 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-500 shadow-[0_0_35px_-5px_rgba(250,204,21,0.4)] hover:shadow-[0_0_50px_-5px_rgba(250,204,21,0.6)] active:scale-90 group/audio"
                                title="Play Audio"
                            >
                                <span className="material-symbols-outlined text-[56px] md:text-[72px] group-hover/audio:scale-110 transition-transform duration-700">volume_up</span>
                            </button>
                        </div>

                        {word.pronunciation && (
                            <p className="text-slate-400 dark:text-slate-500 text-3xl font-medium mt-6 italic opacity-0 group-hover:opacity-100 transition-all duration-500 tracking-widest bg-slate-50 dark:bg-white/5 px-8 py-2 rounded-full">
                                /{word.pronunciation.replace(/^\/|\/$/g, '')}/
                            </p>
                        )}

                        <div className="absolute bottom-12 text-slate-400 dark:text-slate-500 text-sm font-black flex items-center gap-4 uppercase tracking-[0.3em] opacity-40 animate-pulse">
                            <span className="material-symbols-outlined text-[28px]">touch_app</span>
                            Chạm để lật
                        </div>
                    </div>

                    {/* Back Side: The Meaning & Details - Matches screen6.html layout exactly */}
                    <div
                        className="absolute inset-0 backface-hidden w-full h-full bg-surface rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col p-12 md:p-16 [transform:rotateY(180deg)] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full h-full flex flex-col">
                            {/* Header Section */}
                            <div className="w-full flex justify-between items-center mb-10">
                                <span className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.5em] bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                                    {normalizeWordType(word.wordType || 'Word')}
                                </span>
                                <div className="flex gap-4">
                                    <button className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-all duration-300">
                                        <span className="material-symbols-outlined text-[28px]">edit</span>
                                    </button>
                                    <button className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-all duration-300">
                                        <span className="material-symbols-outlined text-[28px]">star</span>
                                    </button>
                                </div>
                            </div>

                            {/* Word Header with Line */}
                            <div className="mb-12 w-full border-b-2 border-slate-100 dark:border-slate-800/60 pb-10 flex flex-col items-center">
                                <div className="flex items-center justify-center gap-6 mb-3">
                                    <h3 className="text-4xl md:text-5xl font-black text-slate-700 dark:text-slate-300 tracking-tighter">{word.word}</h3>
                                    <button
                                        onClick={() => speak(word.word)}
                                        className="size-14 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all shadow-md active:scale-90"
                                    >
                                        <span className="material-symbols-outlined text-[32px]">volume_up</span>
                                    </button>
                                </div>
                                {word.pronunciation && (
                                    <span className="text-xl font-mono text-slate-500 tracking-[0.2em] bg-slate-50 dark:bg-white/5 px-6 py-1.5 rounded-full">/{word.pronunciation.replace(/^\/|\/$/g, '')}/</span>
                                )}
                            </div>

                            {/* Main Content: Meaning - TRULY BIG */}
                            <div className="flex-1 flex flex-col items-center justify-center w-full gap-12 px-6">
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.2] tracking-tight text-center max-w-full mx-auto break-words overflow-visible">
                                    {word.meaning}
                                </h1>

                                {/* Illustration - Premium Placeholders */}
                                <div className="w-52 h-52 md:w-72 md:h-72 rounded-[50px] overflow-hidden bg-white/5 border-2 border-primary/20 shrink-0 shadow-[0_0_50px_rgba(250,204,21,0.25)] flex items-center justify-center group/img relative transition-all duration-700 hover:scale-105">
                                    <span className="material-symbols-outlined text-8xl text-primary/20 group-hover/img:scale-110 transition-transform duration-1000">image</span>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                                </div>
                            </div>

                            {/* Footer: Examples */}
                            {word.example && (
                                <div className="mt-12 w-full bg-slate-50/50 dark:bg-white/5 rounded-[32px] p-10 border border-slate-100/50 dark:border-slate-700/30 shadow-inner">
                                    <p className="text-3xl text-slate-600 dark:text-slate-300 font-bold italic leading-relaxed text-center">
                                        "{word.example}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Rating Buttons - Spacious and Matching Design */}
            <AnimatePresence>
                {isFlipped && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="w-full grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 mb-16"
                    >
                        <button
                            onClick={() => handleReview(0)}
                            className="group flex flex-col items-center justify-center gap-3 h-28 md:h-32 rounded-[30px] border-2 border-red-500/10 hover:border-red-500 bg-surface hover:bg-red-500/5 transition-all duration-400 shadow-2xl hover:shadow-red-500/20 active:scale-95"
                        >
                            <span className="text-lg font-black text-red-500 uppercase tracking-[0.3em]">Again</span>
                            <span className="text-sm text-slate-500 group-hover:text-red-500/80 font-black">&lt; 1 MIN</span>
                        </button>
                        <button
                            onClick={() => handleReview(3)}
                            className="group flex flex-col items-center justify-center gap-3 h-28 md:h-32 rounded-[30px] border-2 border-orange-500/10 hover:border-orange-500 bg-surface hover:bg-orange-500/5 transition-all duration-400 shadow-2xl hover:shadow-orange-500/20 active:scale-95"
                        >
                            <span className="text-lg font-black text-orange-500 uppercase tracking-[0.3em]">Hard</span>
                            <span className="text-sm text-slate-500 group-hover:text-orange-500/80 font-black">2 DAYS</span>
                        </button>
                        <button
                            onClick={() => handleReview(4)}
                            className="group flex flex-col items-center justify-center gap-3 h-28 md:h-32 rounded-[30px] border-2 border-green-500/10 hover:border-green-500 bg-surface hover:bg-green-500/5 transition-all duration-400 shadow-2xl hover:shadow-green-500/20 active:scale-95"
                        >
                            <span className="text-lg font-black text-green-500 uppercase tracking-[0.3em]">Good</span>
                            <span className="text-sm text-slate-500 group-hover:text-green-500/80 font-black">4 DAYS</span>
                        </button>
                        <button
                            onClick={() => handleReview(5)}
                            className="group flex flex-col items-center justify-center gap-3 h-28 md:h-32 rounded-[30px] border-2 border-teal-500/10 hover:border-teal-500 bg-surface hover:bg-teal-500/5 transition-all duration-400 shadow-2xl hover:shadow-teal-500/20 active:scale-95"
                        >
                            <span className="text-lg font-black text-teal-500 uppercase tracking-[0.3em]">Easy</span>
                            <span className="text-sm text-slate-500 group-hover:text-teal-500/80 font-black">7 DAYS</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isFlipped && (
                <div className="mt-20 flex flex-col items-center gap-10 w-full max-w-md mx-auto mb-16">
                    <button
                        onClick={handleFlip}
                        className="group/flip relative px-12 py-5 bg-surface/40 hover:bg-surface/60 backdrop-blur-xl border border-white/10 hover:border-primary/50 text-foreground rounded-[28px] font-black text-2xl shadow-2xl transition-all hover:scale-[1.05] active:scale-[0.95] flex items-center gap-6 overflow-hidden"
                    >
                        {/* Glowing Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover/flip:translate-x-[100%] transition-transform duration-1000"></div>

                        <div className="size-12 rounded-2xl bg-primary/10 group-hover/flip:bg-primary/20 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-primary text-[32px] group-hover/flip:rotate-180 transition-transform duration-700">flip</span>
                        </div>
                        <span className="relative z-10 tracking-tight">Lật Thẻ</span>
                    </button>

                    <div className="flex items-center gap-5 px-6 py-2.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-xs font-black tracking-[0.3em] uppercase opacity-60 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">space_bar</span>
                            <span>SPACE</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                        <span>ĐỂ LẬT</span>
                    </div>
                </div>
            )}
        </div>
    );
}
