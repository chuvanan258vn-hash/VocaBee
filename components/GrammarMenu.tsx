"use client";

import { useState, useRef } from "react";
import { Brain, Database, FileSpreadsheet, ChevronDown, Loader2, Lightbulb } from "lucide-react";
import { parseGrammarCSV } from "@/lib/utils";
import { importGrammarCardsAction, seedGrammarCardsAction, generateGrammarHintsAction } from "@/app/actions";
import { useToast } from "./ToastProvider";

export default function GrammarMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const handleSeed = async () => {
        setIsLoading(true);
        setIsOpen(false);
        const result = await seedGrammarCardsAction();
        setIsLoading(false);

        if (result.success) {
            showToast(`Đã nạp ${result.count} mẫu ngữ pháp! 🐝`, "success");
        } else {
            showToast(result.error || "Lỗi khi nạp mẫu.", "error");
        }
    };

    const handleSmartHint = async () => {
        setIsLoading(true);
        setIsOpen(false);
        const result = await generateGrammarHintsAction();
        setIsLoading(false);

        if (result.error) {
            showToast(result.error, "error");
        } else if (result.count === 0) {
            showToast(result.message || "Không có câu nào cần thêm gợi ý.", "info");
        } else {
            showToast(`Tuyệt vời! Đã tạo thông minh ${result.count} gợi ý mới. 🐝✨`, "success");
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            showToast(`Đã nhận file: ${file.name}`, "info");
            setIsLoading(true);
            setIsOpen(false);

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const text = event.target?.result as string;
                    if (!text) {
                        showToast("Không thể đọc nội dung file.", "error");
                        setIsLoading(false);
                        return;
                    }

                    const cards = parseGrammarCSV(text);
                    if (cards.length === 0) {
                        showToast("File không có dữ liệu phù hợp hoặc sai định dạng cột.", "error");
                        setIsLoading(false);
                        return;
                    }

                    showToast(`Đang tải ${cards.length} câu lên hệ thống...`, "info");
                    const res = await importGrammarCardsAction(cards);

                    if (!res) {
                        showToast("Lỗi kết nối máy chủ.", "error");
                    } else if (res.error) {
                        showToast(res.error, "error");
                    } else {
                        const success = res.successCount || 0;
                        const fail = res.failCount || 0;
                        if (success > 0) {
                            showToast(`Thành công! Đã nạp ${success} thẻ mới. 🐝✨`, "success");
                        }
                        if (fail > 0) {
                            showToast(`Có ${fail} hàng không thể nhập được.`, "info");
                        }
                        if (success === 0 && fail === 0) {
                            showToast("Không có dữ liệu mới để nhập.", "info");
                        }
                    }
                } catch (err) {
                    console.error("Inner import error:", err);
                    showToast("Lỗi xử lý: " + (err instanceof Error ? err.message : "không xác định"), "error");
                } finally {
                    setIsLoading(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                }
            };

            reader.onerror = (err) => {
                console.error("FileReader error:", err);
                showToast("Không thể đọc file này.", "error");
                setIsLoading(false);
            };

            reader.readAsText(file);
        } catch (err) {
            console.error("Outer import error:", err);
            showToast("Lỗi khởi tạo import.", "error");
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className={`flex items-center gap-2 p-1.5 px-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group
                ${isOpen ? "ring-2 ring-yellow-400" : ""}`}
            >
                <div className={`p-1.5 rounded-xl transition-colors ${isLoading ? "bg-slate-100 dark:bg-white/5" : "bg-purple-500/10 text-purple-600 dark:text-purple-400"}`}>
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                </div>
                <div className="flex flex-col items-start mr-1">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 leading-none mb-0.5">Học tập</span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">Ngữ pháp</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full mt-2 right-0 w-56 glass dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2 space-y-1">
                            <button
                                onClick={handleSeed}
                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all hover:bg-yellow-400/10 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-xl group"
                            >
                                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                                    <Database size={14} />
                                </div>
                                <span>Nạp dữ liệu mẫu</span>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all hover:bg-yellow-400/10 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-xl group"
                            >
                                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                    <FileSpreadsheet size={14} />
                                </div>
                                <span>Nhập từ file CSV</span>
                            </button>

                            <button
                                onClick={handleSmartHint}
                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all hover:bg-yellow-400/10 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-xl group border-t border-slate-100 dark:border-white/5 pt-3 mt-1"
                            >
                                <div className="p-2 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 rounded-lg group-hover:bg-yellow-400/20 transition-colors">
                                    <Lightbulb size={14} />
                                </div>
                                <div className="flex flex-col items-start leading-tight">
                                    <span>Tạo gợi ý thông minh</span>
                                    <span className="text-[9px] font-medium opacity-50">Tự động điền gợi ý còn thiếu</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".csv"
                className="hidden"
            />
        </div>
    );
}
