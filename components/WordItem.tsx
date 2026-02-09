"use client";

import { useState } from "react";
import { updateWordAction, deleteWordAction } from "@/app/actions";
import { Edit2, Trash2, Check, X, Volume2, Star } from "lucide-react";
import { useToast } from "./ToastProvider";
import { getWordTypeColor, speak } from "@/lib/utils";

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
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Loại từ</label>
                        <input
                            className="w-full p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all"
                            placeholder="Loại từ (n., v., adj.)"
                            value={editData.wordType}
                            onChange={(e) => setEditData({ ...editData, wordType: e.target.value })}
                        />
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
        <div className="group relative p-6 bg-white/60 dark:bg-slate-900/40 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 shadow-xl rounded-3xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-yellow-500/10 hover:border-yellow-400/30">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Left: Main Word */}
                <div className="flex-shrink-0 min-w-[140px] md:min-w-[180px] pr-6 md:border-r border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight break-words group-hover:text-yellow-500 transition-colors">
                            {item.word}
                        </h3>
                        {item.wordType && (
                            <span className={`px-2.5 py-0.5 ${getWordTypeColor(item.wordType)} text-[10px] font-black rounded-lg shadow-sm uppercase tracking-wider h-fit`}>
                                {item.wordType}
                            </span>
                        )}
                    </div>
                    {item.pronunciation && (
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 font-mono italic">
                            {item.pronunciation}
                        </p>
                    )}
                </div>

                {/* Right: Info */}
                <div className="flex-1 space-y-3">
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200 leading-tight">
                        {item.meaning}
                    </p>

                    {item.synonyms && (
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Synonyms:</span>
                            {item.synonyms.split(',').map((s: string, idx: number) => (
                                <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                                    {s.trim()}
                                </span>
                            ))}
                        </div>
                    )}

                    {item.example && (
                        <div className="relative pl-4 border-l-2 border-yellow-400/30">
                            <p className="text-sm italic text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                "{item.example}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-2 md:ml-4 self-end md:self-center">
                    <button
                        onClick={() => setIsStarred(!isStarred)}
                        className={`p-2 rounded-xl transition-all duration-300 ${isStarred ? 'bg-yellow-400/20 text-yellow-500' : 'text-slate-400 hover:bg-yellow-400/10 hover:text-yellow-500'}`}
                    >
                        <Star size={20} fill={isStarred ? "currentColor" : "none"} />
                    </button>
                    <button
                        onClick={() => speak(item.word)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-blue-400/10 hover:text-blue-500 transition-all duration-300"
                        title="Phát âm"
                    >
                        <Volume2 size={22} />
                    </button>
                    <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700/50 mx-1" />
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-green-400/10 hover:text-green-500 transition-all duration-200"
                        title="Sửa"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 rounded-xl text-slate-400 hover:bg-red-400/10 hover:text-red-500 transition-all duration-200"
                        title="Xóa"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}


