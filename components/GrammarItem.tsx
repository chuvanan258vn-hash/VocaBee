"use client";

import { useState, useEffect } from "react";
import { updateGrammarCardAction, deleteGrammarCardAction } from "@/app/actions";
import { Edit2, Trash2, Check, X, Volume2, Star, Brain, HelpCircle, AlertCircle, Info, Zap } from "lucide-react";
import { useToast } from "./ToastProvider";
import { speak } from "@/lib/utils";

export default function GrammarItem({ item }: { item: any }) {
    const { showToast } = useToast();
    const [isStarred, setIsStarred] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        type: item.type,
        prompt: item.prompt,
        answer: item.answer,
        meaning: item.meaning || "",
        options: item.options || "",
        hint: item.hint || "",
        explanation: item.explanation || "",
        myError: item.myError || "",
        trap: item.trap || "",
        goldenRule: item.goldenRule || "",
        tags: item.tags || "",
    });
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setEditData({
            type: item.type,
            prompt: item.prompt,
            answer: item.answer,
            meaning: item.meaning || "",
            options: item.options || "",
            hint: item.hint || "",
            explanation: item.explanation || "",
            myError: item.myError || "",
            trap: item.trap || "",
            goldenRule: item.goldenRule || "",
            tags: item.tags || "",
        });
    };

    useEffect(() => {
        resetForm();
    }, [item]);

    const handleUpdate = async () => {
        setLoading(true);
        const res = await updateGrammarCardAction(item.id, editData);
        if (res.error) {
            showToast(res.error, "error");
        } else {
            showToast("Đã cập nhật câu ngữ pháp! 🍯", "success");
            setIsEditing(false);
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (confirm("Bạn có chắc muốn xóa câu này khỏi tổ ong không? 🐝")) {
            setLoading(true);
            const res = await deleteGrammarCardAction(item.id);
            if (res.error) {
                showToast(res.error, "error");
            } else {
                showToast("Đã xóa khỏi tổ! 💨", "info");
            }
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="p-8 glass-panel shadow-[var(--shadow-glass)] rounded-3xl transition-all space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Edit2 size={16} className="text-white" />
                    </div>
                    <h2 className="text-xl font-black text-foreground tracking-tight">Chỉnh sửa Ngữ pháp</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Câu hỏi / Đề bài (Prompt)</label>
                        <textarea
                            className="input-premium w-full p-3 text-foreground font-bold h-20 resize-none"
                            placeholder="Nhập câu hỏi hoặc câu có chỗ trống..."
                            value={editData.prompt}
                            onChange={(e) => setEditData({ ...editData, prompt: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Đáp án (Answer)</label>
                        <input
                            className="input-premium w-full p-3 text-foreground font-bold"
                            placeholder="Đáp án đúng"
                            value={editData.answer}
                            onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Dịch nghĩa (Meaning)</label>
                        <input
                            className="input-premium w-full p-3 text-foreground"
                            placeholder="Nghĩa của câu"
                            value={editData.meaning}
                            onChange={(e) => setEditData({ ...editData, meaning: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Loại thẻ (Type)</label>
                        <select
                            className="input-premium w-full p-3 text-foreground"
                            title="Chọn loại thẻ"
                            value={editData.type}
                            onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                        >
                            <option value="CLOZE">CLOZE (Điền từ)</option>
                            <option value="MCQ">MCQ (Trắc nghiệm)</option>
                            <option value="NOTEBOOK">NOTEBOOK (Sổ tay lỗi sai)</option>
                            <option value="TRANS">TRANS (Dịch câu)</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Gợi ý (Hint)</label>
                        <input
                            className="input-premium w-full p-3 text-foreground"
                            placeholder="Gợi ý khi bí"
                            value={editData.hint}
                            onChange={(e) => setEditData({ ...editData, hint: e.target.value })}
                        />
                    </div>
                </div>

                {editData.type === "NOTEBOOK" && (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                            <Zap size={12} /> Phân tích lỗi sai
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 ml-1">Lỗi của tôi</label>
                                <input
                                    className="input-premium w-full p-2 text-xs"
                                    placeholder="Tôi đã làm sai ntn?"
                                    value={editData.myError}
                                    onChange={(e) => setEditData({ ...editData, myError: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 ml-1">Cạm bẫy (Trap)</label>
                                <input
                                    className="input-premium w-full p-2 text-xs"
                                    placeholder="Câu này lừa ntn?"
                                    value={editData.trap}
                                    onChange={(e) => setEditData({ ...editData, trap: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 ml-1">Quy tắc vàng</label>
                                <input
                                    className="input-premium w-full p-2 text-xs"
                                    placeholder="Ghi nhớ quan trọng"
                                    value={editData.goldenRule}
                                    onChange={(e) => setEditData({ ...editData, goldenRule: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Giải thích chi tiết (Explanation)</label>
                    <textarea
                        className="input-premium w-full p-4 text-foreground h-24 resize-none italic"
                        placeholder="Phân tích ngữ pháp..."
                        value={editData.explanation}
                        onChange={(e) => setEditData({ ...editData, explanation: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            resetForm();
                        }}
                        className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2 font-bold"
                        disabled={loading}
                    >
                        <X size={18} /> Hủy
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center gap-2 font-black shadow-lg shadow-purple-500/20 scale-100 hover:scale-[1.03] active:scale-[0.97]"
                        disabled={loading}
                    >
                        {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={20} />}
                        LƯU NGỮ PHÁP ✨
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 relative group hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all duration-300">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Brain size={80} className="text-slate-400 dark:text-slate-500" />
            </div>

            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-500 text-[10px] font-black uppercase tracking-wider rounded-md">
                        {item.type}
                    </span>
                    {item.tags && item.tags.split(',').map((tag: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[9px] font-bold rounded border border-slate-200 dark:border-slate-700">
                            #{tag.trim()}
                        </span>
                    ))}
                </div>

                {/* Dates: created and next review */}
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {(() => {
                        const fmt = (d: string | Date) => {
                            try {
                                const dt = typeof d === 'string' ? new Date(d) : d;
                                return dt.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
                            } catch (e) {
                                return '-';
                            }
                        };

                        const createdStr = item.createdAt ? fmt(item.createdAt) : '-';
                        const nextStr = item.nextReview ? fmt(item.nextReview) : (item.interval === 0 ? 'Sẵn sàng học' : 'Chưa lên lịch');

                        return (
                            <>
                                <span className="px-2 py-1 bg-slate-100/40 dark:bg-white/5 rounded-md border border-slate-200 dark:border-white/5">
                                    Thêm: <strong className="ml-1 text-slate-700 dark:text-white">{createdStr}</strong>
                                </span>
                                <span className="px-2 py-1 bg-slate-100/40 dark:bg-white/5 rounded-md border border-slate-200 dark:border-white/5">
                                    Lần ôn tiếp: <strong className="ml-1 text-slate-700 dark:text-white">{nextStr}</strong>
                                </span>
                            </>
                        );
                    })()}
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-purple-500 transition-colors">
                        {item.prompt}
                    </h3>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Đáp án:</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 underline decoration-2 underline-offset-4">
                            {item.answer}
                        </span>
                    </div>
                </div>

                {(item.meaning || item.explanation) && (
                    <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-white/5 mt-2">
                        {item.meaning && (
                            <div className="flex items-start gap-3">
                                <div className="p-1 bg-blue-500/10 text-blue-500 rounded-md mt-0.5">
                                    <Info size={12} />
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium italic">"{item.meaning}"</p>
                            </div>
                        )}
                        {item.explanation && (
                            <div className="flex items-start gap-3">
                                <div className="p-1 bg-amber-500/10 text-amber-500 rounded-md mt-0.5">
                                    <HelpCircle size={12} />
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">{item.explanation}</p>
                            </div>
                        )}
                    </div>
                )}

                {item.type === "NOTEBOOK" && (item.myError || item.trap || item.goldenRule) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                        {item.myError && (
                            <div className="px-3 py-2 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                                <p className="text-[9px] font-black text-rose-500 uppercase mb-1">Cần tránh</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">{item.myError}</p>
                            </div>
                        )}
                        {item.trap && (
                            <div className="px-3 py-2 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                                <p className="text-[9px] font-black text-orange-500 uppercase mb-1">Cạm bẫy</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">{item.trap}</p>
                            </div>
                        )}
                        {item.goldenRule && (
                            <div className="px-3 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Quy tắc vàng</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">{item.goldenRule}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions Section */}
            <div className="flex md:flex-col items-center justify-end gap-2 md:border-l border-slate-200 dark:border-slate-700 md:pl-6">
                <button
                    onClick={() => speak(item.prompt)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title="Nghe"
                >
                    <Volume2 size={20} />
                </button>
                <button
                    onClick={() => setIsStarred(!isStarred)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isStarred
                        ? 'bg-purple-500/20 text-purple-500'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-purple-500'}`}
                    title={isStarred ? "Bỏ yêu thích" : "Yêu thích"}
                >
                    <Star size={20} fill={isStarred ? "currentColor" : "none"} />
                </button>
                <button
                    onClick={() => setIsEditing(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-purple-500/10 text-slate-400 hover:text-purple-500 transition-colors"
                    title="Sửa"
                >
                    <Edit2 size={20} />
                </button>
                <button
                    onClick={handleDelete}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Xóa"
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
}
