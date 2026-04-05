'use client';

import { useState, useEffect } from 'react';
import Flashcard from './Flashcard';
import FlashcardInput from './FlashcardInput';
import GrammarFlashcard from './GrammarFlashcard';
import { GrammarCard, Vocabulary } from '@/types';
import { batchReviewAction } from '@/app/actions';
import { useToast } from './ToastProvider';
import { speak, normalizeWordType, getWordTypeStyles } from '@/lib/utils';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ReviewSessionProps {
    dueWords: (Vocabulary | GrammarCard)[];
}

const isGrammarCard = (item: Vocabulary | GrammarCard): item is GrammarCard => {
    return 'prompt' in item;
};

export default function ReviewSession({ dueWords: initialDueWords }: ReviewSessionProps) {
    const [dueWords, setDueWords] = useState(initialDueWords);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDone, setIsDone] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);
    const [results, setResults] = useState<{ id: string; quality: number; type: 'vocab' | 'grammar'; isTypingBonus?: boolean }[]>([]);
    // Track the current card's result as soon as it's confirmed (before user clicks NEXT)
    const [pendingResult, setPendingResult] = useState<{ id: string; quality: number; type: 'vocab' | 'grammar'; isTypingBonus?: boolean } | null>(null);
    const { showToast } = useToast();
    // Track if current card should be presented as Input or Flip
    const [useInputMode, setUseInputMode] = useState(false);

    // Randomize mode whenever currentIndex changes
    useEffect(() => {
        if (!isDone && dueWords[currentIndex]) {
            // Grammar cards always use standard mode for now, 
            // Vocabulary cards have a 50% chance to be Input mode
            const isGrammar = isGrammarCard(dueWords[currentIndex]);
            setUseInputMode(!isGrammar && Math.random() > 0.5);
        }
    }, [currentIndex, isDone, dueWords]);


    if (dueWords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="text-6xl animate-bounce">🌻</div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white text-shadow-gold">Tuyệt vời! Tuyệt vời!</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">Tổ ong của bạn đã sạch bóng rồi. Không còn từ nào cần ôn tập hôm nay nữa đâu! 🐝✨</p>
                <Link
                    href="/"
                    className="btn-amber px-8 py-3 rounded-2xl"
                    onClick={() => {
                        // Force a refresh when going home to see updated stats
                        window.location.href = "/";
                    }}
                >
                    QUAY VỀ TRANG CHỦ
                </Link>
            </div>
        );
    }

    const handleNext = (result?: { id: string; quality: number; type: 'vocab' | 'grammar'; isTypingBonus?: boolean }) => {
        if (result) {
            setResults(prev => [...prev, result]);
            batchReviewAction([result]).catch(err => console.error("Background update failed", err));
        }
        setPendingResult(null); // Clear pending when moving to next card
        
        if (currentIndex < dueWords.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsDone(true);
        }
    };

    // Called immediately when user confirms an answer (before clicking NEXT)
    const handlePendingResult = (result: { id: string; quality: number; type: 'vocab' | 'grammar'; isTypingBonus?: boolean }) => {
        setPendingResult(result);
    };

    const currentWord = dueWords[currentIndex];

    const handleBatchSubmit = async (extraResult?: { id: string; quality: number; type: 'vocab' | 'grammar'; isTypingBonus?: boolean } | null) => {
        setIsSubmitting(true);
        const pending = extraResult !== undefined ? extraResult : pendingResult;
        if (pending) {
            await batchReviewAction([pending]).catch(err => console.error("Background update failed", err));
        }
        setIsSubmitting(false);
        setIsFinished(true);
    };

    if (isFinished) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
            >
                <div className="text-6xl">🍯🏆</div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white text-shadow-gold">Lưu Thành Công!</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">Tiến độ của bạn đã được cập nhật. Càng học, tổ ong càng tràn đầy mật ngọt tri thức! 🐝✨</p>
                <Link
                    href="/"
                    className="btn-amber px-8 py-3 rounded-2xl"
                    onClick={() => window.location.href = "/"}
                >
                    QUAY VỀ TRANG CHỦ
                </Link>
            </motion.div>
        );
    }

    if (isDone || !currentWord) {
        // Compute summary stats
        const easyCount = results.filter(r => {
            if (isGrammarCard(dueWords.find(w => w.id === r.id)!)) return r.quality === 3;
            return r.quality >= 4;
        }).length;
        const hardCount = results.filter(r => {
            if (isGrammarCard(dueWords.find(w => w.id === r.id)!)) return r.quality === 1;
            return r.quality <= 2;
        }).length;
        const mediumCount = results.length - easyCount - hardCount;

        return (
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-2xl mx-auto flex flex-col items-center min-h-[70vh] pt-10 px-4 pb-10"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="relative mb-6 flex flex-col items-center"
                >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30 mb-4">
                        🏆
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Tổng kết phiên học</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                        Hoàn thành <span className="font-bold text-amber-500">{dueWords.length}</span> thẻ · Tiến độ của bạn đã được lưu tự động
                    </p>
                </motion.div>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.35 }}
                    className="grid grid-cols-3 gap-3 w-full mb-5"
                >
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/5 border border-emerald-500/20">
                        <span className="text-2xl font-black text-emerald-500">{easyCount}</span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Dễ / Tốt</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-amber-500/5 border border-amber-500/20">
                        <span className="text-2xl font-black text-amber-500">{mediumCount}</span>
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">Trung bình</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 dark:from-red-500/20 dark:to-red-500/5 border border-red-500/20">
                        <span className="text-2xl font-black text-red-500">{hardCount}</span>
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 mt-0.5">Cần ôn lại</span>
                    </div>
                </motion.div>

                {/* Word List */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.35 }}
                    className="w-full bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden backdrop-blur-sm"
                >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">checklist</span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Danh sách thẻ</span>
                    </div>
                    <div className="max-h-[55vh] overflow-y-auto p-3 space-y-3 scrollbar-slim">
                        {dueWords.map((item, index) => {
                            const isGrammar = isGrammarCard(item);
                            const result = results.find(r => r.id === item.id);
                            const vocab = !isGrammar ? (item as Vocabulary) : null;

                            let borderColor = "border-slate-300 dark:border-slate-600/80";
                            let badgeBg = "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400";
                            let badgeLabel = "Chưa đánh giá";

                            if (result) {
                                if (isGrammar) {
                                    if (result.quality === 1) { borderColor = "border-red-400 dark:border-red-500"; badgeBg = "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"; badgeLabel = "Khó"; }
                                    else if (result.quality === 2) { borderColor = "border-amber-400 dark:border-amber-500"; badgeBg = "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"; badgeLabel = "Vừa"; }
                                    else if (result.quality === 3) { borderColor = "border-emerald-400 dark:border-emerald-500"; badgeBg = "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"; badgeLabel = "Dễ"; }
                                } else {
                                    if (result.quality <= 2) { borderColor = "border-red-400 dark:border-red-500"; badgeBg = "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"; badgeLabel = "Khó/Lại"; }
                                    else if (result.quality === 3) { borderColor = "border-amber-400 dark:border-amber-500"; badgeBg = "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"; badgeLabel = "Khó"; }
                                    else if (result.quality === 4) { borderColor = "border-emerald-400 dark:border-emerald-500"; badgeBg = "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"; badgeLabel = "Tốt"; }
                                    else if (result.quality === 5) { borderColor = "border-indigo-400 dark:border-indigo-500"; badgeBg = "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"; badgeLabel = "Dễ"; }
                                }
                            }

                            const wordTypeStyle = vocab?.wordType ? getWordTypeStyles(normalizeWordType(vocab.wordType)) : null;

                            return (
                                <div
                                    key={item.id + index}
                                    className={`rounded-xl bg-slate-50 dark:bg-slate-700/40 border-l-[3px] ${borderColor} overflow-hidden`}
                                >
                                    {/* Top row: word + badge + audio */}
                                    <div className="flex items-start justify-between px-3 pt-3 pb-2">
                                        <div className="flex flex-col min-w-0 flex-1 mr-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-slate-800 dark:text-white text-base leading-tight">
                                                    {isGrammar ? item.prompt : vocab!.word}
                                                </span>
                                                {vocab?.pronunciation && (
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                                                        /{vocab.pronunciation}/
                                                    </span>
                                                )}
                                                {wordTypeStyle && (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${wordTypeStyle.bg} text-white`}>
                                                        {normalizeWordType(vocab!.wordType!)}
                                                    </span>
                                                )}
                                                {isGrammar && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                                        Ngữ pháp
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
                                                {isGrammar ? (item as GrammarCard).answer : vocab!.meaning}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {/* Audio button */}
                                            {!isGrammar && (
                                                <button
                                                    onClick={() => speak(vocab!.word)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                                    title="Nghe phát âm"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">volume_up</span>
                                                </button>
                                            )}
                                            <div className={`px-2.5 py-1 text-xs font-bold rounded-lg ${badgeBg} flex items-center gap-1 whitespace-nowrap`}>
                                                {badgeLabel}
                                                {result?.isTypingBonus && <span className="text-amber-400">⭐</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Context / Example / Explanation */}
                                    {(vocab?.context || vocab?.example || (!isGrammar && false) || (isGrammar && (item as GrammarCard).explanation)) && (
                                        <div className="px-3 pb-3 space-y-1.5 border-t border-slate-100 dark:border-slate-600/40 pt-2">
                                            {vocab?.context && (
                                                <div className="flex gap-1.5 text-xs">
                                                    <span className="shrink-0 font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Ngữ cảnh</span>
                                                    <span className="text-slate-500 dark:text-slate-400 italic">{vocab.context}</span>
                                                </div>
                                            )}
                                            {vocab?.example && (
                                                <div className="flex gap-1.5 text-xs">
                                                    <span className="shrink-0 font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Ví dụ</span>
                                                    <span className="text-slate-500 dark:text-slate-400">{vocab.example}</span>
                                                </div>
                                            )}
                                            {isGrammar && (item as GrammarCard).explanation && (
                                                <div className="flex gap-1.5 text-xs">
                                                    <span className="shrink-0 font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Giải thích</span>
                                                    <span className="text-slate-500 dark:text-slate-400">{(item as GrammarCard).explanation}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.35 }}
                    className="flex flex-col sm:flex-row gap-3 mt-5 w-full"
                >
                    <button
                        onClick={() => handleBatchSubmit()}
                        disabled={isSubmitting}
                        className="flex-1 btn-amber px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-base shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-shadow disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                <span>Hoàn tất phiên học</span>
                            </>
                        )}
                    </button>
                </motion.div>
            </motion.div>
        );
    }

    const progressPercent = Math.round(((currentIndex + 1) / dueWords.length) * 100);

    return (
        <div className="w-full min-h-screen flex flex-col bg-background relative selection:bg-teal-brand/30">
            {/* Sticky Header from screen5.html */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 md:px-10 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3 text-foreground">
                    <div className="size-8 text-primary">
                        <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"></path>
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">VocaBee</h2>
                </div>

                <div className="hidden md:flex flex-col items-center gap-2 flex-1 max-w-md px-8">
                    <div className="flex w-full justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>Session Progress</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-visible relative">
                        <motion.div
                            className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_2px_rgba(45,212,191,0.6)] relative z-10"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                        onClick={(e) => {
                            e.preventDefault();
                            if (results.length > 0 || pendingResult !== null || currentIndex > 0) {
                                setShowQuitConfirm(true);
                            } else {
                                window.location.href = "/";
                            }
                        }}
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                        <span className="hidden sm:inline">Quit Session</span>
                        <span className="sm:hidden">Quit</span>
                    </Link>
                    <button className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-[24px]">settings</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
                {/* Early Quit Confirmation Modal */}
                <AnimatePresence>
                    {showQuitConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.95 }}
                                className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800"
                            >
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center text-3xl mb-2">
                                        🐝
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Bạn muốn thoát thật sao?</h3>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Bạn đã ôn tập được {results.length + (pendingResult ? 1 : 0)} thẻ. Tiến độ cho các thẻ này đã được lưu vào hệ thống!
                                    </p>
                                    
                                    <div className="flex flex-col w-full gap-3 mt-6">
                                        <button
                                            onClick={async () => {
                                                if (pendingResult) {
                                                    setIsSubmitting(true);
                                                    await batchReviewAction([pendingResult]).catch(e => console.error(e));
                                                }
                                                window.location.href = "/";
                                            }}
                                            disabled={isSubmitting}
                                            className="w-full btn-amber py-3 rounded-2xl flex items-center justify-center font-semibold gap-2"
                                        >
                                            {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                            {isSubmitting ? "Đang xử lý..." : "Thoát Về Trang Chủ"}
                                        </button>
                                        <button
                                            onClick={() => setShowQuitConfirm(false)}
                                            disabled={isSubmitting}
                                            className="w-full py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium transition-colors"
                                        >
                                            Tiếp tục học
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Background Decoration from screen5.html */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
                </div>

                <div className="w-full max-w-4xl flex flex-col items-center gap-8 relative z-10">
                    {/* Mobile Progress */}
                    <div className="w-full md:hidden mb-4">
                        <div className="flex justify-between text-sm text-slate-400 mb-2">
                            <span>Card {currentIndex + 1} of {dueWords.length}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-visible relative">
                            <motion.div
                                className="h-full bg-teal-500 rounded-full shadow-[0_0_10px_2px_rgba(45,212,191,0.6)] relative z-10"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                            key={currentWord.id}
                            initial={{ opacity: 0, scale: 0.96, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.02, y: -10 }}
                            transition={{ 
                                duration: 0.2,
                                ease: [0.23, 1, 0.32, 1] // Custom cubic-bezier for snappy feel
                            }}
                            className="w-full"
                        >
                            {isGrammarCard(currentWord) ? (
                                <GrammarFlashcard card={currentWord} onNext={handleNext} />
                            ) : useInputMode ? (
                                <FlashcardInput word={currentWord as Vocabulary} onNext={handleNext} onResult={handlePendingResult} />
                            ) : (
                                <Flashcard word={currentWord as Vocabulary} onNext={handleNext} />
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
