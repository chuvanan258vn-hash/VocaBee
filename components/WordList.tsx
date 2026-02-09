"use client";

import { useState, useMemo, useRef } from "react";
import WordItem from "./WordItem";
import { Search, FilterX, Download, Upload, Loader2 } from "lucide-react";
import { getWordTypeColor, exportToCSV, parseCSV } from "@/lib/utils";
import { importWordsAction } from "@/app/actions";
import { useToast } from "./ToastProvider";

export default function WordList({ initialWords }: { initialWords: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Get unique word types for filtering
  const wordTypes = useMemo(() => {
    const types = new Set<string>();
    initialWords.forEach((w) => {
      if (w.wordType) types.add(w.wordType.toLowerCase().trim());
    });
    return Array.from(types).sort();
  }, [initialWords]);

  // Filtered words logic
  const filteredWords = useMemo(() => {
    return initialWords.filter((item) => {
      const matchesSearch =
        item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        !activeFilter || (item.wordType && item.wordType.toLowerCase().trim() === activeFilter);

      return matchesSearch && matchesFilter;
    });
  }, [initialWords, searchQuery, activeFilter]);

  const handleExport = () => {
    exportToCSV(initialWords, `vocabee-backup-${new Date().toISOString().split('T')[0]}.csv`);
    showToast("Đã xuất tổ ong thành công! 📥", "success");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const words = parseCSV(text);

      if (words.length === 0) {
        showToast("File không hợp lệ hoặc trống.", "error");
        setIsImporting(false);
        return;
      }

      const res = await importWordsAction(words);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        showToast(`Đã nhập thành công ${res.successCount} từ! 🐝 (${res.failCount} lỗi)`, "success");
      }
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="mt-16 space-y-8 w-full max-w-4xl px-2 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Danh sách từ vựng</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Bạn đang sở hữu mật ngọt từ <span className="text-yellow-500 font-bold">{initialWords.length}</span> bông hoa 🌸</p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-white text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl transition-all shadow-sm"
              title="Xuất CSV"
            >
              <Download size={14} /> Xuất
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-white text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
              title="Nhập CSV"
            >
              {isImporting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Nhập
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".csv"
              className="hidden"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group w-full md:w-80">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-yellow-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm từ hoặc nghĩa..."
            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all shadow-sm group-hover:border-yellow-400/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-3 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveFilter(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!activeFilter
            ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-lg'
            : 'bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-yellow-400/50'
            }`}
        >
          <FilterX size={14} /> Tất cả
        </button>
        {wordTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type === activeFilter ? null : type)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeFilter === type
              ? 'ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-slate-900 shadow-lg'
              : 'opacity-70 hover:opacity-100 hover:scale-105'
              } ${getWordTypeColor(type)}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* List Body */}
      <div className="grid gap-6 w-full">
        {filteredWords.length > 0 ? (
          filteredWords.map((item) => (
            <WordItem key={item.id} item={item} />
          ))
        ) : (
          <div className="py-20 text-center space-y-4 glass rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800">
            <div className="text-5xl">🔦</div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Không tìm thấy từ nào phù hợp với yêu cầu của bạn...</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveFilter(null); }}
              className="text-yellow-500 font-bold hover:underline"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
