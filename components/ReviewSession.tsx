'use client';

import { useState, useEffect } from 'react';
import Flashcard from './Flashcard';
import FlashcardInput from './FlashcardInput';
import GrammarFlashcard from './GrammarFlashcard';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ReviewSessionProps {
    dueWords: any[];
}

export default function ReviewSession({ dueWords }: ReviewSessionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDone, setIsDone] = useState(false);
    // Track if current card should be presented as Input or Flip
    const [useInputMode, setUseInputMode] = useState(false);

    // Randomize mode whenever currentIndex changes
    useEffect(() => {
        if (!isDone && dueWords[currentIndex]) {
            // Grammar cards always use standard mode for now, 
            // Vocabulary cards have a 50% chance to be Input mode
            const isGrammar = !!dueWords[currentIndex].prompt;
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
                >
                    QUAY VỀ TRANG CHỦ
                </Link>
            </div>
        );
    }

    const handleNext = () => {
        if (currentIndex < dueWords.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsDone(true);
        }
    };

    const currentWord = dueWords[currentIndex];

    if (isDone || !currentWord) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
            >
                <div className="text-6xl">🍯🏆</div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white text-shadow-gold">Xong rồi nhé!</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">Bạn vừa hoàn thành phiên học hiện tại. Càng học, tổ ong càng tràn đầy mật ngọt thức thức! 🐝✨</p>
                <Link
                    href="/"
                    className="btn-amber px-8 py-3 rounded-2xl"
                >
                    QUAY VỀ TRANG CHỦ
                </Link>
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

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentWord.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            {currentWord.prompt ? (
                                <GrammarFlashcard card={currentWord} onNext={handleNext} />
                            ) : useInputMode ? (
                                <FlashcardInput word={currentWord} onNext={handleNext} />
                            ) : (
                                <Flashcard word={currentWord} onNext={handleNext} />
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
