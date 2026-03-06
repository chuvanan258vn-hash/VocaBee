"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Info, AlertTriangle, Target, Search, BookOpen, Clock } from "lucide-react";
import { smartCaptureAction } from "@/app/actions";
import { useToast } from "./ToastProvider";

interface SmartCaptureDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SmartCaptureDialog({ isOpen, onClose }: SmartCaptureDialogProps) {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"VOCAB" | "GRAMMAR">("VOCAB");

    // Core Data
    const [word, setWord] = useState("");
    const [meaning, setMeaning] = useState("");
    const [prompt, setPrompt] = useState("");
    const [answer, setAnswer] = useState("");

    // Scoring Criteria (0-4 total points)
    const [isRecurring, setIsRecurring] = useState(false); // 2 pts if true
    const [isCore, setIsCore] = useState(false); // 1 pt
    const [isConfusing, setIsConfusing] = useState(false); // 1 pt
    const [isKeyOption, setIsKeyOption] = useState(false); // 1 pt

    const totalScore = (isRecurring ? 2 : 0) + (isCore ? 1 : 0) + (isConfusing ? 1 : 0) + (isKeyOption ? 1 : 0);

    const reset = () => {
        setWord("");
        setMeaning("");
        setPrompt("");
        setAnswer("");
        setIsRecurring(false);
        setIsCore(false);
        setIsConfusing(false);
        setIsKeyOption(false);
    };

    const handleCapture = async () => {
        if (mode === "VOCAB" && !word) return showToast("Vui lòng nhập từ mới.", "error");
        if (mode === "GRAMMAR" && !prompt) return showToast("Vui lòng nhập câu hỏi.", "error");

        setIsLoading(true);
        const res = await smartCaptureAction({
            word: mode === "VOCAB" ? word : undefined,
            meaning: mode === "VOCAB" ? meaning : undefined,
            prompt: mode === "GRAMMAR" ? prompt : undefined,
            answer: mode === "GRAMMAR" ? answer : undefined,
            source: "TEST",
            importanceScore: totalScore,
            type: mode === "GRAMMAR" ? "PRODUCTION" : undefined
        });
        setIsLoading(false);

        if (res.success) {
            showToast(
                res.deferred
                    ? "Đã lưu vào Inbox (Chờ xử lý sau) 📥"
                    : "Đã thêm vào SRS chính! 🐝✨",
                "success"
            );
            reset();
            onClose();
        } else {
            showToast(res.error || "Lỗi khi lưu.", "error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-xl h-full sm:h-auto glass dark:bg-slate-900/90 rounded-none sm:rounded-[2.5rem] border-none sm:border border-white/20 dark:border-white/10 shadow-2xl overflow-y-auto"
            >
                <div className="p-4 sm:p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 sm:mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <Target className="text-orange-500" size={20} /> Smart Capture
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">Quyết định nhanh: Thêm ngay hay Hoãn?</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl mb-4 sm:mb-6">
                        <button
                            onClick={() => setMode("VOCAB")}
                            className={`flex-1 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${mode === "VOCAB" ? "bg-white dark:bg-slate-800 shadow-sm text-orange-600" : "text-slate-500"}`}
                        >
                            TỪ VỰNG MỚI
                        </button>
                        <button
                            onClick={() => setMode("GRAMMAR")}
                            className={`flex-1 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${mode === "GRAMMAR" ? "bg-white dark:bg-slate-800 shadow-sm text-purple-600" : "text-slate-500"}`}
                        >
                            NGỮ PHÁP MỚI
                        </button>
                    </div>

                    {/* Form Inputs */}
                    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                        {mode === "VOCAB" ? (
                            <>
                                <input
                                    value={word}
                                    onChange={(e) => setWord(e.target.value)}
                                    placeholder="Từ mới..."
                                    className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl sm:rounded-2xl px-4 py-3 sm:py-4 text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                                />
                                <input
                                    value={meaning}
                                    onChange={(e) => setMeaning(e.target.value)}
                                    placeholder="Nghĩa ngắn gọn..."
                                    className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl sm:rounded-2xl px-4 py-3 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                                />
                            </>
                        ) : (
                            <>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Câu hỏi / Cấu trúc..."
                                    className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl sm:rounded-2xl px-4 py-3 sm:py-4 text-sm font-bold h-20 sm:h-24 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 transition-all outline-none resize-none"
                                />
                                <input
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Đáp án..."
                                    className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl sm:rounded-2xl px-4 py-3 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                                />
                            </>
                        )}
                    </div>

                    {/* Scoring Rules (The 4 Criteria) */}
                    <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Scoring Criteria</p>
                        <div className="grid grid-cols-2 gap-2">
                            <ScoreButton
                                label="Xuất hiện >= 2 lần"
                                score="+2"
                                active={isRecurring}
                                onClick={() => setIsRecurring(!isRecurring)}
                                color="orange"
                            />
                            <ScoreButton
                                label="Từ cốt lõi (TOEIC)"
                                score="+1"
                                active={isCore}
                                onClick={() => setIsCore(!isCore)}
                                color="blue"
                            />
                            <ScoreButton
                                label="Gây khó hiểu sâu"
                                score="+1"
                                active={isConfusing}
                                onClick={() => setIsConfusing(!isConfusing)}
                                color="purple"
                            />
                            <ScoreButton
                                label="Trong Option/Keyword"
                                score="+1"
                                active={isKeyOption}
                                onClick={() => setIsKeyOption(!isKeyOption)}
                                color="emerald"
                            />
                        </div>
                    </div>

                    {/* Action Suggestion & Button */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100 dark:border-white/10">
                        <div className="flex-1 w-full text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                <span className="text-2xl sm:text-3xl font-black">{totalScore}</span>
                                <div className="flex flex-col leading-none text-left">
                                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase">Tổng điểm</span>
                                    <span className={`text-[10px] sm:text-xs font-bold ${totalScore >= 3 ? "text-emerald-500" : totalScore >= 1 ? "text-blue-500" : "text-slate-400"}`}>
                                        {totalScore >= 3 ? "ADD (Học ngay)" : totalScore >= 1 ? "DEFER (Hộp thư)" : "IGNORE (Bỏ qua)"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {totalScore > 0 ? (
                            <button
                                onClick={handleCapture}
                                disabled={isLoading}
                                className={`w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2
                                ${totalScore >= 3 ? "bg-emerald-500 shadow-emerald-500/20" : "bg-blue-500 shadow-blue-500/20"}`}
                            >
                                {isLoading ? <span className="animate-pulse italic">SAVING...</span> : (
                                    <>
                                        {totalScore >= 3 ? <Check size={18} /> : <Clock size={18} />}
                                        <span className="text-xs sm:text-sm">{totalScore >= 3 ? "HỌC NGAY" : "LƯU INBOX"}</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl sm:rounded-2xl font-black active:scale-95 transition-all text-xs sm:text-sm"
                            >
                                ĐÃ HIỂU / BỎ QUA
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function ScoreButton({ label, score, active, onClick, color }: { label: string, score: string, active: boolean, onClick: () => void, color: string }) {
    const colors = {
        orange: active ? "bg-orange-500 text-white" : "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        blue: active ? "bg-blue-500 text-white" : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        purple: active ? "bg-purple-500 text-white" : "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        emerald: active ? "bg-emerald-500 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    } as any;

    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${colors[color]} ${active ? "scale-[1.02] shadow-md" : "hover:bg-opacity-20"}`}
        >
            <span className="text-[11px] font-black leading-tight text-left">{label}</span>
            <span className="text-[10px] font-black opacity-60">{score}</span>
        </button>
    );
}
