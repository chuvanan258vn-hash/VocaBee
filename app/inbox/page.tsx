"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, Inbox, Trash2, CheckCircle2, BookOpen, Brain, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { getDeferredItemsAction, manageInboxItemAction } from "@/app/actions";
import { useToast } from "@/components/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

export default function InboxPage() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [vocab, setVocab] = useState<any[]>([]); // Using any here temporarily as it comes from a dynamic server action, but will fix the component usage

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const res = await getDeferredItemsAction();
        if (res.success) {
            setVocab(res.vocab || []);
        } else {
            showToast(res.error || "Không thể tải dữ liệu Inbox.", "error");
        }
        setIsLoading(false);
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = async (id: string, type: "VOCAB" | "GRAMMAR", action: "ADD" | "DELETE") => {
        const res = await manageInboxItemAction(id, type, action);
        if (res.success) {
            showToast(action === "ADD" ? "Đã chuyển vào tổ ong chính! 🐝" : "Đã xóa khỏi Inbox.", "success");
            fetchData();
        } else {
            showToast(res.error || "Thao tác thất bại.", "error");
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center bg-slate-50 dark:bg-slate-950 transition-colors font-sans px-4 pb-20">
            {/* Header */}
            <header className="w-full max-w-4xl flex justify-between items-center py-8">
                <Link href="/" className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-600 dark:text-slate-400">
                    <ChevronLeft size={24} />
                </Link>
                <div className="text-center">
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center justify-center gap-3">
                        <Inbox className="text-blue-500" /> Inbox Backlog
                    </h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Weekly Catch-up Session</p>
                </div>
                <div className="w-12 h-12" /> {/* Spacer */}
            </header>

            <div className="w-full max-w-4xl space-y-8 mt-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-slate-400 font-bold animate-pulse uppercase text-xs tracking-widest">Đang quét tổ ong...</p>
                    </div>
                ) : vocab.length === 0 ? (
                    <div className="text-center py-20 glass dark:bg-slate-900/50 rounded-[3rem] border border-white/20">
                        <span className="text-6xl block mb-6">🎉</span>
                        <h2 className="text-xl font-black text-slate-700 dark:text-slate-200">Inbox trống trơn!</h2>
                        <p className="text-slate-500 text-sm mt-2">Bạn đã xử lý hết mọi nội dung từ đề thi rồi. Tuyệt vời!</p>
                        <Link href="/" className="inline-block mt-8 px-8 py-3 bg-blue-500 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">VỀ TRANG CHỦ</Link>
                    </div>
                ) : (
                    <>
                        {/* Summary Alert */}
                        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-start gap-4">
                            <ShieldAlert className="text-blue-500 shrink-0" size={24} />
                            <div>
                                <h3 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight">Quy tắc Weekly Catch-up</h3>
                                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 font-bold mt-1 leading-relaxed">
                                    Đừng cố dồn tất cả vào SRS chính. Chỉ chọn 10-15 nội dung quan trọng nhất để chuyển đổi (Promote) mỗi tuần. Những cái còn lại hãy mạnh dạn xóa bỏ!
                                </p>
                            </div>
                        </div>

                        {/* Vocabulary Section */}
                        {vocab.length > 0 && (
                            <section className="space-y-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4">Từ vựng chờ xử lý ({vocab.length})</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <AnimatePresence mode="popLayout">
                                        {vocab.map((item) => (
                                            <InboxCard
                                                key={item.id}
                                                title={item.word}
                                                subtitle={item.meaning}
                                                score={item.importanceScore}
                                                type="VOCAB"
                                                onAdd={() => handleAction(item.id, "VOCAB", "ADD")}
                                                onDelete={() => handleAction(item.id, "VOCAB", "DELETE")}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

interface InboxCardProps {
    title: string;
    subtitle: string | null;
    score: number;
    type: "VOCAB" | "GRAMMAR";
    onAdd: () => void;
    onDelete: () => void;
}

function InboxCard({ title, subtitle, score, type, onAdd, onDelete }: InboxCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="group flex items-center gap-4 p-4 glass dark:bg-slate-900/80 rounded-2xl border border-white/20 dark:border-white/5 hover:border-blue-500/30 transition-all shadow-sm hover:shadow-md"
        >
            <div className={`p-3 rounded-xl shrink-0 ${type === "VOCAB" ? "bg-orange-500/10 text-orange-500" : "bg-purple-500/10 text-purple-500"}`}>
                {type === "VOCAB" ? <BookOpen size={20} /> : <Brain size={20} />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-black text-slate-700 dark:text-slate-200 truncate leading-tight">{title}</h4>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md text-[9px] font-black text-slate-400">SCORE: {score}</span>
                </div>
                <p className="text-xs font-medium text-slate-500 truncate">{subtitle}</p>
            </div>

            <div className="flex items-center gap-2 pr-2">
                <button
                    onClick={onDelete}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                    title="Xóa"
                >
                    <Trash2 size={18} />
                </button>
                <button
                    onClick={onAdd}
                    className="p-2.5 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 px-5"
                >
                    <CheckCircle2 size={18} />
                    <span className="text-[11px] font-black hidden md:block">PROMOTE</span>
                </button>
            </div>
        </motion.div>
    );
}
