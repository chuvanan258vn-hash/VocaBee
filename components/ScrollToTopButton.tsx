'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollToTopButton({ scrollContainerId }: { scrollContainerId: string }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const container = document.getElementById(scrollContainerId);
        if (!container) return;

        const onScroll = () => setVisible(container.scrollTop > 400);
        container.addEventListener('scroll', onScroll, { passive: true });
        return () => container.removeEventListener('scroll', onScroll);
    }, [scrollContainerId]);

    const scrollToTop = () => {
        const container = document.getElementById(scrollContainerId);
        container?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    key="scroll-top"
                    initial={{ opacity: 0, scale: 0.7, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7, y: 16 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    onClick={scrollToTop}
                    title="Lên đầu trang"
                    className="fixed bottom-8 right-6 z-50 size-12 rounded-full bg-primary text-slate-900 shadow-[0_4px_24px_rgba(250,204,21,0.4)] hover:bg-yellow-300 hover:shadow-[0_6px_32px_rgba(250,204,21,0.55)] active:scale-90 transition-all duration-300 flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-[22px] font-bold">arrow_upward</span>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
