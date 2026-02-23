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
            <div className="p-8 bg-white/80 dark:bg-slate-900/50 backdrop-blur-2xl shadow-2xl rounded-3xl border border-yellow-400/30 transition-all space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/20">
                        <Edit2 size={16} className="text-white" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Chỉnh sửa từ vựng</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Từ vựng</label>
                        <input
                            className="w-full p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all font-bold"
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
                                    <div className={`absolute inset-0 border-2 rounded-2xl opacity-10 dark:opacity-20 ${getWordTypeStyles(editData.wordType).border}`} style={{ backgroundColor: "transparent" }} />
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
                            className="w-full p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all"
                            placeholder="Phiên âm (/.../)"
                            value={editData.pronunciation}
                            onChange={(e) => setEditData({ ...editData, pronunciation: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Từ đồng nghĩa</label>
                        <input
                            className="w-full p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all"
                            placeholder="Từ đồng nghĩa"
                            value={editData.synonyms}
                            onChange={(e) => setEditData({ ...editData, synonyms: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Nghĩa tiếng Việt</label>
                    <input
                        className="w-full p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all font-medium"
                        placeholder="Nghĩa tiếng Việt"
                        value={editData.meaning}
                        onChange={(e) => setEditData({ ...editData, meaning: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Ví dụ minh họa</label>
                    <textarea
                        className="w-full p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all h-24 resize-none italic"
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
                        className="px-8 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600 transition-all flex items-center gap-2 font-black shadow-lg shadow-yellow-500/20 scale-100 hover:scale-[1.03] active:scale-[0.97]"
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
        <div className="group relative p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-[1.5rem] transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/5 hover:border-yellow-400/40">
            {/* Background Decoration - Smaller */}
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <span className="text-5xl font-black select-none italic text-slate-400 dark:text-slate-500">
                    {normalizeWordType(item.wordType).charAt(0)}
                </span>
            </div>

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Word & Main Info Section */}
                <div className="flex-1 min-w-0 space-y-3">
                    {/* Header: Word & Meaning */}
                    <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-yellow-500 transition-colors drop-shadow-sm truncate max-w-[200px] sm:max-w-none">
                                {item.word}
                            </h3>
                            {item.wordType && (
                                <span className={`px-2 py-0.5 ${getWordTypeColor(item.wordType)} text-[9px] font-black rounded-full shadow-md shadow-current/5 uppercase tracking-wider h-fit`}>
                                    {normalizeWordType(item.wordType)}
                                </span>
                            )}
                        </div>
                        {item.pronunciation && (
                            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-medium font-mono text-[13px]">
                                <span className="opacity-40">/</span>
                                {item.pronunciation.replace(/^\/|\/$/g, '')}
                                <span className="opacity-40">/</span>
                            </div>
                        )}
                    </div>

                    {/* Meaning: More compact */}
                    <p className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200 leading-snug">
                        {item.meaning}
                    </p>

                    {/* Extra Details: Synonyms & Example - Integrated */}
                    <div className="flex flex-col gap-2.5">
                        {item.synonyms && (
                            <div className="flex flex-wrap items-center gap-1.5">
                                {item.synonyms.split(',').slice(0, 3).map((s: string, idx: number) => (
                                    <span key={idx} className="px-2 py-1 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-[11px] font-bold rounded-lg border border-slate-100 dark:border-slate-800/50">
                                        {s.trim()}
                                    </span>
                                ))}
                                {item.synonyms.split(',').length > 3 && <span className="text-[10px] text-slate-400">...</span>}
                            </div>
                        )}

                        {item.example && (
                            <div className="relative pl-3 border-l-2 border-yellow-400/20 py-0.5 transition-all group-hover:border-yellow-400/40">
                                <p className="text-[13px] italic text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                                    "{item.example}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Section: Vertically integrated and smaller */}
                <div className="flex flex-row sm:flex-col items-center gap-1.5 sm:pl-5 sm:border-l border-slate-100 dark:border-slate-800/40">
                    <div className="flex sm:flex-col gap-1.5">
                        <button
                            onClick={() => speak(item.word)}
                            className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:bg-blue-500 hover:text-white transition-all duration-200 active:scale-90"
                            title="Phát âm"
                        >
                            <Volume2 size={20} />
                        </button>
                        <button
                            onClick={() => setIsStarred(!isStarred)}
                            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 active:scale-90 ${isStarred
                                ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-500/20'
                                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}
                        >
                            <Star size={20} fill={isStarred ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <div className="w-[1px] h-5 sm:w-6 sm:h-[1px] bg-slate-100 dark:bg-slate-800/80 mx-1 sm:my-1" />

                    <div className="flex sm:flex-col gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 rounded-lg text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition-all"
                            title="Sửa"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-500 transition-all"
                            title="Xóa"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Subtle highlight on hover */}
            <div className="absolute bottom-3 right-5 pointer-events-none">
                <span className="text-[10px] font-black text-yellow-500/0 group-hover:text-yellow-500/40 transition-all duration-500 uppercase tracking-widest">Bee 🐝</span>
            </div>
        </div>
    );
}


