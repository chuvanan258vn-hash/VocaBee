"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import WordItem from "./WordItem";
import { Search, FilterX, Download, Upload, Loader2, RefreshCw } from "lucide-react";
import { getWordTypeColor, exportToCSV, parseCSV, normalizeWordType } from "@/lib/utils";
import { importWordsAction, getWordsPaginatedAction } from "@/app/actions";
import { useToast } from "./ToastProvider";

export default function WordList({ initialWords, totalWords, availableWordTypes }: { initialWords: any[], totalWords: number, availableWordTypes: string[] }) {
  const [words, setWords] = useState(initialWords);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [serverTotal, setServerTotal] = useState(totalWords);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Icons for major categories
  const categoryIcons: Record<string, string> = {
    "Danh từ": "📝",
    "Động từ": "🏃",
    "Tính từ": "🎨",
    "Trạng từ": "⚡",
    "Cụm từ": "🧩",
    "Thành ngữ": "🗣️",
    "Giới từ": "🔗",
    "Khác": "❓"
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform server-side search when debounced search changes
  useEffect(() => {
    const performSearch = async () => {
      setIsSearching(true);
      try {
        const res = await getWordsPaginatedAction(0, 40, debouncedSearch); // Increase limit for search to show more at once
        if (res.success && res.words) {
          setWords(res.words);
        } else if (res.error) {
          showToast(res.error, "error");
        }
      } catch (err) {
        showToast("Lỗi khi kết nối đến máy chủ để tìm kiếm.", "error");
      } finally {
        setIsSearching(false);
      }
    };

    if (debouncedSearch.trim() !== "") {
      performSearch();
    } else {
      setWords(initialWords);
    }
  }, [debouncedSearch, initialWords, showToast]);

  // Update words if initialWords changes (e.g. after adding a new word)
  useEffect(() => {
    if (searchQuery === "") {
      setWords(initialWords);
      setServerTotal(totalWords);
    }
  }, [initialWords, totalWords, searchQuery]);

  // Normalize all available word types and group them
  const normalizedGroups = useMemo(() => {
    const groups = new Set<string>();
    availableWordTypes.forEach(t => groups.add(normalizeWordType(t)));
    return Array.from(groups).sort();
  }, [availableWordTypes]);

  // Filtered words logic (Client-side filtering for WordType on top of search results)
  const filteredWords = useMemo(() => {
    return words.filter((item) => {
      const matchesFilter =
        !activeFilter || normalizeWordType(item.wordType) === activeFilter;
      return matchesFilter;
    });
  }, [words, activeFilter]);

  const handleExport = () => {
    exportToCSV(words, `vocabee-backup-${new Date().toISOString().split('T')[0]}.csv`);
    showToast("Đã xuất tổ ong thành công! 📥", "success");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const csvWords = parseCSV(text);

      if (csvWords.length === 0) {
        showToast("File không hợp lệ hoặc trống.", "error");
        setIsImporting(false);
        return;
      }

      const res = await importWordsAction(csvWords);
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

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    const res = await getWordsPaginatedAction(words.length, 20, debouncedSearch);

    if (res.success && res.words) {
      setWords((prev) => [...prev, ...res.words!]);
    } else if (res.error) {
      showToast(res.error, "error");
    }

    setIsLoadingMore(false);
  };

  const hasMore = searchQuery === "" ? (words.length < serverTotal) : (words.length >= 20 && words.length % 20 === 0);

  return (
    <div className="mt-16 space-y-8 w-full max-w-4xl px-2 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Danh sách từ vựng</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Bạn đang sở hữu mật ngọt từ <span className="text-yellow-500 font-bold">{serverTotal}</span> bông hoa 🌸</p>

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
            {isSearching ? <RefreshCw size={18} className="animate-spin text-yellow-500" /> : <Search size={18} />}
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm mọi nơi trong tổ ong..."
            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all shadow-sm group-hover:border-yellow-400/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Filters - Redesigned Style */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
            Lọc theo loại từ
            <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pb-2">
          <button
            onClick={() => setActiveFilter(null)}
            className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${!activeFilter
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105'
              : 'bg-white dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-yellow-400/50 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
          >
            <FilterX size={14} className={!activeFilter ? "text-yellow-400" : "group-hover:text-yellow-400"} />
            Tất cả
          </button>

          {normalizedGroups.map((group) => {
            const isActive = activeFilter === group;
            const colorClass = getWordTypeColor(group);
            const icon = categoryIcons[group as string] || "✨";

            return (
              <button
                key={group as string}
                onClick={() => setActiveFilter(isActive ? null : group as string)}
                className={`group flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${isActive
                  ? `ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-slate-950 shadow-xl scale-105 ${colorClass}`
                  : 'bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-yellow-400/50 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
              >
                <span className="text-base group-hover:scale-125 transition-transform">{icon}</span>
                {group as string}
              </button>
            );
          })}
        </div>
      </div>

      {/* List Body */}
      <div className="grid gap-6 w-full pb-10">
        {filteredWords.length > 0 ? (
          filteredWords.map((item) => (
            <WordItem key={item.id} item={item} />
          ))
        ) : (
          <div className="py-20 text-center space-y-4 glass rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800">
            <div className="text-5xl">{isSearching ? "⏳" : "🔦"}</div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {isSearching ? "Đang tìm kiếm trong tổ ong..." : "Không tìm thấy từ nào phù hợp với yêu cầu của bạn..."}
            </p>
            {!isSearching && (
              <button
                onClick={() => { setSearchQuery(""); setActiveFilter(null); }}
                className="text-yellow-500 font-bold hover:underline"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !activeFilter && (
          <div className="flex justify-center pt-6">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="group flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-yellow-400 dark:hover:border-yellow-400 rounded-2xl shadow-lg hover:shadow-yellow-400/10 transition-all font-bold text-slate-600 dark:text-slate-400 hover:text-yellow-500 disabled:opacity-50"
            >
              {isLoadingMore ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span className="text-xl">🐝</span>
              )}
              <span>{isLoadingMore ? "Đang tải mật ngọt..." : (searchQuery === "" ? `Tải thêm từ vựng (Còn ${serverTotal - words.length} từ)` : "Tải thêm kết quả tìm kiếm")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
