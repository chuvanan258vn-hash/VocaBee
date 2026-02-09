'use client';

import { useState } from 'react';
import Flashcard from './Flashcard';
import GrammarFlashcard from './GrammarFlashcard';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ReviewSessionProps {
    dueWords: any[];
}

export default function ReviewSession({ dueWords }: ReviewSessionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDone, setIsDone] = useState(false);

    if (dueWords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="text-6xl animate-bounce">🌻</div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white">Tuyệt vời! Tuyệt vời!</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">Tổ ong của bạn đã sạch bóng rồi. Không còn từ nào cần ôn tập hôm nay nữa đâu! 🐝✨</p>
                <Link
                    href="/"
                    className="px-8 py-3 bg-yellow-400 text-slate-900 font-black rounded-2xl shadow-xl shadow-yellow-500/20 hover:scale-105 transition-all"
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
                <h2 className="text-3xl font-black text-slate-800 dark:text-white">Xong rồi nhé!</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">Bạn vừa hoàn thành phiên học hiện tại. Càng học, tổ ong càng tràn đầy mật ngọt thức thức! 🐝✨</p>
                <Link
                    href="/"
                    className="px-8 py-3 bg-yellow-400 text-slate-900 font-black rounded-2xl shadow-xl shadow-yellow-500/20 hover:scale-105 transition-all"
                >
                    QUAY VỀ TRANG CHỦ
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-8 pt-4 sm:pt-10">
            <div className="flex justify-between items-center px-4">
                <Link href="/" className="text-slate-400 hover:text-yellow-500 transition-colors flex items-center gap-2 font-bold text-sm">
                    <span>←</span> THOÁT
                </Link>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Tiến độ</span>
                    <span className="text-lg font-black text-yellow-500">{currentIndex + 1} / {dueWords.length}</span>
                </div>
            </div>

            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-yellow-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / dueWords.length) * 100}%` }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentWord.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    {currentWord.prompt ? (
                        <GrammarFlashcard card={currentWord} onNext={handleNext} />
                    ) : (
                        <Flashcard word={currentWord} onNext={handleNext} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
