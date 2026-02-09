"use client";

import { useState } from "react";
import { Target } from "lucide-react";
import SmartCaptureDialog from "./SmartCaptureDialog";
import { AnimatePresence } from "framer-motion";

export default function SmartCaptureTrigger() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 p-1.5 px-4 bg-orange-500/10 dark:bg-orange-500/5 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-2xl shadow-sm hover:shadow-md hover:bg-orange-500/20 transition-all duration-300 group"
            >
                <div className="p-1.5 bg-orange-500/20 rounded-xl group-hover:rotate-12 transition-transform">
                    <Target size={16} />
                </div>
                <div className="flex flex-col items-start mr-1">
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-70 leading-none mb-0.5">Quick</span>
                    <span className="text-xs font-black">Capture</span>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <SmartCaptureDialog
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
