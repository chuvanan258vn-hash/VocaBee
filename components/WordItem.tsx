"use client";

import { useState } from "react";
import { updateWordAction, deleteWordAction } from "@/app/actions";
import { Edit2, Trash2, Check, X, Volume2, Star } from "lucide-react";
import { useToast } from "./ToastProvider";
import { getWordTypeColor, speak, normalizeWordType, getWordTypeStyles } from "@/lib/utils";

export default function WordItem({ item }: { item: any }) {
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        word: item.word,
        wordType: item.wordType || "",
        meaning: item.meaning,
        pronunciation: item.pronunciation || "",
        synonyms: item.synonyms || "",
        example: item.example || "",
    });
    const [loading, setLoading] = useState(false);
    const [isStarred, setIsStarred] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        const res = await updateWordAction(item.id, editData);
        if (res.error) {
            showToast(res.error, "error");
        } else {
            showToast("Đã cập nhật từ vựng! 🍯", "success");
            setIsEditing(false);
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (confirm("Bạn có chắc muốn xóa từ này khỏi tổ ong không? 🐝")) {
            setLoading(true);
            const res = await deleteWordAction(item.id);
            if (res.error) {
                showToast(res.error, "error");
            } else {
                showToast("Đã xóa từ vựng khỏi tổ! 💨", "info");
            }
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="p-8 glass-panel shadow-[var(--shadow-glass)] rounded-3xl transition-all space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <Edit2 size={16} className="text-slate-900" />
                    </div>
                    <h2 className="text-xl font-black text-foreground tracking-tight">Chỉnh sửa từ vựng</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Từ vựng</label>
                        <input
                            className="input-premium w-full p-3 text-foreground font-bold"
                            placeholder="Từ vựng"
                            value={editData.word}
                            onChange={(e) => setEditData({ ...editData, word: e.target.value })}
                        />
                    </div>
                    <div className="space-y-4 md:col-span-1">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Phân loại từ vựng</label>
                            {editData.wordType && (
                                <button
                                    type="button"
                                    onClick={() => setEditData({ ...editData, wordType: "" })}
                                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-all flex items-center gap-1.5 group"
                                >
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">Xóa chọn</span>
                                    <Trash2 size={12} className="group-hover:rotate-12 transition-transform" />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {[
                                { short: "N", full: "Noun" },
                                { short: "V", full: "Verb" },
                                { short: "ADJ", full: "Adjective" },
                                { short: "ADV", full: "Adverb" },
                                { short: "PHR", full: "Phrase" },
                                { short: "IDM", full: "Idiom" },
                            ].map((type) => {
                                const styles = getWordTypeStyles(type.short);
                                const isSelected = normalizeWordType(editData.wordType) === normalizeWordType(type.full);

                                return (
                                    <button
                                        key={type.short}
                                        type="button"
                                        onClick={() => setEditData({ ...editData, wordType: type.full })}
                                        className={`relative py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden group/btn ${isSelected
                                            ? `${styles.bg} shadow-lg shadow-current/30 ring-2 ${styles.ring}/30`
                                            : "bg-slate-100 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                                            }`}
                                    >
                                        <div className={`absolute inset-0 opacity-0 group-hover/btn:opacity-10 transition-opacity bg-current`} />
                                        <span className={`relative z-10 ${isSelected ? "text-white" : ""}`}>{type.short}</span>
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Type Display Badge */}
                        <div className={`relative h-14 rounded-2xl transition-all duration-500 flex items-center justify-center overflow-hidden border-2 shadow-sm ${editData.wordType
                            ? `${getWordTypeStyles(editData.wordType).border} shadow-lg`
                            : "border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
                            }`}>
                            {editData.wordType && (
                                <>
                                    <div className={`absolute inset-0 opacity-20 dark:opacity-40 ${getWordTypeColor(editData.wordType)}`} />
                                    <div className={`absolute inset-0 border-2 rounded-2xl opacity-10 dark:opacity-20 ${getWordTypeStyles(editData.wordType).border}`} />
                                </>
                            )}

                            <div className="relative z-10 flex items-center gap-4">
                                {editData.wordType ? (
                                    <>
                                        <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${getWordTypeColor(editData.wordType)} shadow-[0_0_10px_currentColor]`} />
                                        <span className={`text-sm font-black uppercase tracking-[0.25em] drop-shadow-sm ${editData.wordType ? "text-slate-900 dark:text-white" : "text-slate-400"
                                            }`}>
                                            {normalizeWordType(editData.wordType)}
                                        </span>
                                        <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${getWordTypeColor(editData.wordType)} shadow-[0_0_10px_currentColor]`} />
                                    </>
                                ) : (
                                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-600 italic tracking-[0.1em]">
                                        Vui lòng chọn phân loại từ 🐝
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Phiên âm</label>
                        <input
                            className="input-premium w-full p-3 text-foreground"
                            placeholder="Phiên âm (/.../)"
                            value={editData.pronunciation}
                            onChange={(e) => setEditData({ ...editData, pronunciation: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Từ đồng nghĩa</label>
                        <input
                            className="input-premium w-full p-3 text-foreground"
                            placeholder="Từ đồng nghĩa"
                            value={editData.synonyms}
                            onChange={(e) => setEditData({ ...editData, synonyms: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Nghĩa tiếng Việt</label>
                    <input
                        className="input-premium w-full p-3 text-foreground font-medium"
                        placeholder="Nghĩa tiếng Việt"
                        value={editData.meaning}
                        onChange={(e) => setEditData({ ...editData, meaning: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Ví dụ minh họa</label>
                    <textarea
                        className="input-premium w-full p-4 text-foreground h-24 resize-none italic"
                        placeholder="Ví dụ minh họa"
                        value={editData.example}
                        onChange={(e) => setEditData({ ...editData, example: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2 font-bold"
                        disabled={loading}
                    >
                        <X size={18} /> Hủy
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-amber-500 hover:to-amber-600 transition-all flex items-center gap-2 font-black shadow-[var(--shadow-glow-primary)] scale-100 hover:scale-[1.03] active:scale-[0.97]"
                        disabled={loading}
                    >
                        {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={20} />}
                        LƯU MẬT 🍯
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 relative group hover:border-primary/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300">
            {/* Background Decoration from screen2.html */}
            <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <span className="text-7xl font-black select-none italic text-slate-400 dark:text-slate-500">
                    {normalizeWordType(item.wordType).charAt(0)}
                </span>
            </div>

            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">
                        {item.word}
                    </h3>
                    {item.wordType && (
                        <span className={`bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide`}>
                            {normalizeWordType(item.wordType)}
                        </span>
                    )}
                </div>

                {item.pronunciation && (
                    <div className="flex items-center text-slate-500 font-mono text-sm gap-2">
                        <span>/</span>
                        <span className="text-slate-400">{item.pronunciation.replace(/^\/|\/$/g, '')}</span>
                        <span>/</span>
                    </div>
                )}

                <div className="space-y-2">
                    <h4 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                        {item.meaning}
                    </h4>
                    {item.example && (
                        <div className="flex items-start gap-2 text-slate-400 italic">
                            <span className="w-1 h-full min-h-[1.2rem] bg-orange-500/50 rounded-full block mt-1"></span>
                            <p>"{item.example}"</p>
                        </div>
                    )}
                </div>

                {item.synonyms && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        {item.synonyms.split(',').map((s: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700">
                                {s.trim()}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions Section from screen2.html layout */}
            <div className="flex md:flex-col items-center justify-end gap-2 md:border-l border-slate-200 dark:border-slate-700 md:pl-6">
                <button
                    onClick={() => speak(item.word)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title="Nghe"
                >
                    <Volume2 size={20} />
                </button>
                <button
                    onClick={() => setIsStarred(!isStarred)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isStarred
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary'}`}
                    title={isStarred ? "Bỏ yêu thích" : "Yêu thích"}
                >
                    <Star size={20} fill={isStarred ? "currentColor" : "none"} />
                </button>
                <button
                    onClick={() => setIsEditing(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors"
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


