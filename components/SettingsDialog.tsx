"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Save, CheckCircle2 } from "lucide-react";
import { updateUserSettingsAction } from "@/app/actions";
import { useToast } from "./ToastProvider";

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentGoal: number;
}

export default function SettingsDialog({ isOpen, onClose, currentGoal }: SettingsDialogProps) {
    const [goal, setGoal] = useState(currentGoal);
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateUserSettingsAction({ dailyGoal: goal });
        setIsSaving(false);

        if (result.success) {
            showToast("Đã lưu cài đặt mục tiêu mới! 🐝✨", "success");
            onClose();
        } else {
            showToast(result.error || "Lỗi khi lưu cài đặt.", "error");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Dialog Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 pb-4 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                Cài đặt <span className="text-yellow-500">🐝</span>
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-8 pt-0 space-y-8">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">
                                    Mục tiêu từ mới mỗi ngày
                                </label>

                                <div className="grid grid-cols-4 gap-3">
                                    {[5, 10, 20, 50].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setGoal(val)}
                                            className={`py-4 rounded-2xl font-black transition-all border-2 ${goal === val
                                                    ? "bg-yellow-400 border-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/20"
                                                    : "bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:border-slate-200 dark:hover:border-white/10"
                                                }`}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>

                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 italic">
                                    Mẹo: Nếu bạn bận rộn, hãy chọn 5 hoặc 10 từ để duy trì thói quen học tập.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full py-4 bg-slate-900 dark:bg-yellow-400 dark:text-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <div className="h-5 w-5 border-2 border-white dark:border-slate-900 border-t-transparent animate-spin rounded-full" />
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            <span>LƯU CÀI ĐẶT</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
