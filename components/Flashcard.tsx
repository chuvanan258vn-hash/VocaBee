'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reviewWordAction } from '@/app/actions';
import { useToast } from './ToastProvider';
import { getWordTypeColor, speak } from '@/lib/utils';

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
        <div className="w-full max-w-xl mx-auto perspective-1000 h-[420px] sm:h-[500px]">
            <motion.div
                className="relative w-full h-[420px] sm:h-[500px] cursor-pointer preserve-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    mass: 1
                }}
                onAnimationComplete={() => setIsAnimating(false)}
                onClick={handleFlip}
            >
                {/* Front Side: The Word */}
                <div className="absolute inset-0 backface-hidden w-full h-full p-6 sm:p-8 bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
                    {/* Top Toolbar */}
                    <div
                        className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2">
                            {word.repetition === 0 ? (
                                <span className="px-2 py-0.5 bg-yellow-400 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                                    TỪ MỚI
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-300/50 dark:border-slate-700/50">
                                    ÔN TẬP
                                </span>
                            )}
                            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 hover:text-yellow-500 transition-colors cursor-help">
                                <span className="text-sm">💡</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider hidden xs:inline">Gợi ý</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <button className="hover:text-yellow-500 transition-colors">
                                <span className="text-sm">✏️</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    speak(word.word);
                                }}
                                className="hover:text-yellow-500 transition-colors"
                                title="Phát âm"
                            >
                                <span className="text-sm">🔊</span>
                            </button>
                            <button className="hover:text-yellow-500 transition-colors">
                                <span className="text-sm">⭐</span>
                            </button>
                        </div>
                    </div>

                    <div className="h-10 w-10 sm:h-14 sm:w-14 bg-yellow-400/20 rounded-2xl flex items-center justify-center mb-2 sm:mb-4">
                        <span className="text-2xl sm:text-3xl">🐝</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tight">{word.word}</h2>
                    {word.pronunciation && (
                        <p className="text-lg sm:text-xl font-mono text-slate-400 dark:text-slate-500 italic">{word.pronunciation}</p>
                    )}

                    {/* Quick Next Button */}
                    <div className="absolute bottom-6 sm:bottom-10 w-full px-8 sm:px-12" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => handleReview(5)}
                            className="w-full py-2.5 sm:py-3 px-6 bg-yellow-400/10 hover:bg-yellow-400 text-yellow-500 hover:text-slate-900 border border-yellow-500/30 rounded-xl sm:rounded-2xl font-black transition-all flex items-center justify-center gap-2 group text-xs sm:text-sm"
                        >
                            <span>ĐÃ BIẾT - TIẾP THEO</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </div>

                {/* Back Side: The Meaning & Details */}
                <div
                    className="absolute inset-0 backface-hidden w-full h-full p-6 sm:p-8 bg-slate-900 dark:bg-slate-800 text-white rounded-3xl border border-yellow-400/30 shadow-2xl flex flex-col items-center justify-center text-center rotate-y-180"
                    style={{ transform: 'rotateY(180deg)' }}
                >
                    {/* Top Toolbar (Back) */}
                    <div
                        className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-center text-slate-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-1.5 text-yellow-500/50">
                            <span className="text-sm">💡</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider hidden xs:inline">Đã mở</span>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <button className="hover:text-yellow-500 transition-colors">
                                <span className="text-sm">✏️</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    speak(word.word);
                                }}
                                className="hover:text-yellow-500 transition-colors"
                            >
                                <span className="text-sm">🔊</span>
                            </button>
                            <button className="hover:text-yellow-500 transition-colors">
                                <span className="text-sm">⭐</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6 w-full">
                        <div>
                            <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                                <h3 className="text-2xl sm:text-3xl font-black text-yellow-400">{word.word}</h3>
                                {word.wordType && (
                                    <span className={`px-2 py-0.5 ${getWordTypeColor(word.wordType)} text-[8px] sm:text-[10px] font-black rounded-lg uppercase`}>
                                        {word.wordType}
                                    </span>
                                )}
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-white leading-tight">{word.meaning}</p>
                        </div>

                        {word.example && (
                            <div className="p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/10 italic text-slate-300 text-xs sm:text-sm line-clamp-3 sm:line-clamp-none">
                                "{word.example}"
                            </div>
                        )}

                        <div className="pt-4 sm:pt-6 border-t border-white/10 w-full" onClick={(e) => e.stopPropagation()}>
                            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 sm:mb-4">Bạn nhớ từ này thế nào?</p>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                <button
                                    onClick={() => handleReview(0)}
                                    className="py-2.5 sm:py-3 px-2 sm:px-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 rounded-xl font-extrabold transition-all text-[10px] sm:text-sm uppercase"
                                >
                                    Quên
                                </button>
                                <button
                                    onClick={() => handleReview(3)}
                                    className="py-2.5 sm:py-3 px-2 sm:px-4 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-white border border-yellow-500/50 rounded-xl font-extrabold transition-all text-[10px] sm:text-sm uppercase"
                                >
                                    Khó
                                </button>
                                <button
                                    onClick={() => handleReview(5)}
                                    className="py-2.5 sm:py-3 px-2 sm:px-4 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/50 rounded-xl font-extrabold transition-all text-[10px] sm:text-sm uppercase"
                                >
                                    Dễ
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
}
