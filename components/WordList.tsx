"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import WordItem from "./WordItem";
import { Search, FilterX, Download, Upload, Loader2, RefreshCw } from "lucide-react";
import { getWordTypeColor, exportToCSV, parseCSV, normalizeWordType } from "@/lib/utils";
import { importWordsAction, getWordsPaginatedAction } from "@/app/actions";
import { useToast } from "./ToastProvider";
import BatchImportModal from "./BatchImportModal";
import { PlusCircle } from "lucide-react";

import { Vocabulary } from "@/types";

export default function WordList({ initialWords, totalWords, availableWordTypes }: { initialWords: Vocabulary[], totalWords: number, availableWordTypes: string[] }) {
  const [words, setWords] = useState(initialWords);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [serverTotal, setServerTotal] = useState(totalWords);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Icons for major categories based on screen2.html
  const categoryIcons: Record<string, string> = {
    "Danh từ": "description",
    "Động từ": "run_circle",
    "Tính từ": "palette",
    "Trạng từ": "bolt",
    "Cụm từ": "extension",
    "Thành ngữ": "forum",
    "Giới từ": "link",
    "Khác": "help"
  };

  const categoryColors: Record<string, string> = {
    "Danh từ": "text-secondary",
    "Động từ": "text-orange-600",
    "Tính từ": "text-purple-400",
    "Trạng từ": "text-yellow-500",
    "Cụm từ": "text-green-500",
    "Thành ngữ": "text-blue-400",
    "Khác": "text-pink-500"
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
      } catch (_err) {
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

  const onBatchSuccess = async () => {
    // Refresh the list after batch import
    setIsSearching(true);
    const res = await getWordsPaginatedAction(0, 40, searchQuery);
    if (res.success && res.words) {
      setWords(res.words);
    }
    setIsSearching(false);
  };

  const hasMore = searchQuery === "" ? (words.length < serverTotal) : (words.length >= 20 && words.length % 20 === 0);

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header & Stats from screen2.html */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Danh sách từ vựng</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg flex items-center gap-2">
            Bạn đang sở hữu mật ngọt từ <span className="text-primary font-bold">{serverTotal}</span> bông hoa
            <span className="text-pink-400 text-xl">✿</span>
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Download size={18} />
              Xuất
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              Nhập CSV
            </button>
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-lg text-sm font-bold transition-all"
            >
              <PlusCircle size={18} />
              Nhập văn bản (Batch)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".csv"
              className="hidden"
              title="Nhập file CSV"
              placeholder="Chọn file CSV"
            />
          </div>
        </div>

        {/* Search Bar from screen2.html */}
        <div className="w-full lg:w-1/3 relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
            {isSearching ? <RefreshCw size={18} className="animate-spin text-primary" /> : <Search size={18} />}
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm mọi nơi trong tổ ong..."
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent placeholder-slate-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Filters from screen2.html */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="h-px w-8 bg-slate-200 dark:bg-slate-800"></span>
          <span>Lọc theo loại từ</span>
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${!activeFilter
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-white/5'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
          >
            <span className={`material-symbols-outlined text-lg ${!activeFilter ? 'text-primary filled' : 'text-slate-400'}`}>filter_alt</span>
            TẤT CẢ
          </button>

          {normalizedGroups.map((group) => {
            const isActive = activeFilter === group;
            const iconName = categoryIcons[group as string] || "stars";
            const colorClass = categoryColors[group as string] || "text-primary";

            return (
              <button
                key={group as string}
                onClick={() => setActiveFilter(isActive ? null : group as string)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
              >
                <span className={`material-symbols-outlined text-lg ${isActive ? 'text-white' : colorClass}`}>{iconName}</span>
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

      <BatchImportModal 
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSuccess={onBatchSuccess}
      />
    </div>
  );
}
