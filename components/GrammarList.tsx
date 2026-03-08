"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import GrammarItem from "./GrammarItem";
import { Search, FilterX, Download, Upload, Loader2, RefreshCw, Brain } from "lucide-react";
import { getGrammarPaginatedAction } from "@/app/actions";
import { useToast } from "./ToastProvider";

export default function GrammarList({ initialCards, totalCards }: { initialCards: any[], totalCards: number }) {
    const [cards, setCards] = useState(initialCards);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [serverTotal, setServerTotal] = useState(totalCards);
    const { showToast } = useToast();

    const grammarTypes = ["CLOZE", "MCQ", "NOTEBOOK", "TRANS"];

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Perform server-side search
    useEffect(() => {
        const performSearch = async () => {
            setIsSearching(true);
            try {
                const res = await getGrammarPaginatedAction(0, 40, debouncedSearch);
                if (res.success && res.cards) {
                    setCards(res.cards);
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
            setCards(initialCards);
        }
    }, [debouncedSearch, initialCards, showToast]);

    // Update cards if initialCards changes
    useEffect(() => {
        if (searchQuery === "") {
            setCards(initialCards);
            setServerTotal(totalCards);
        }
    }, [initialCards, totalCards, searchQuery]);

    // Client-side filtering for Type
    const filteredCards = useMemo(() => {
        return cards.filter((item) => {
            const matchesFilter = !activeFilter || item.type === activeFilter;
            return matchesFilter;
        });
    }, [cards, activeFilter]);

    const handleLoadMore = async () => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);

        const res = await getGrammarPaginatedAction(cards.length, 20, debouncedSearch);

        if (res.success && res.cards) {
            setCards((prev) => [...prev, ...res.cards!]);
        } else if (res.error) {
            showToast(res.error, "error");
        }

        setIsLoadingMore(false);
    };

    const hasMore = searchQuery === "" ? (cards.length < serverTotal) : (cards.length >= 20 && cards.length % 20 === 0);

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 underline decoration-purple-500 decoration-4 underline-offset-8">Tổ ong Ngữ pháp</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg flex items-center gap-2">
                        Bạn đang rèn luyện <span className="text-purple-500 font-bold">{serverTotal}</span> cấu trúc thông minh 🧠✨
                    </p>
                </div>

                {/* Search Bar */}
                <div className="w-full lg:w-1/3 relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors">
                        {isSearching ? <RefreshCw size={18} className="animate-spin text-purple-500" /> : <Search size={18} />}
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm ngữ pháp, lỗi sai..."
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent placeholder-slate-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span className="h-px w-8 bg-slate-200 dark:bg-slate-800"></span>
                    <span>Lọc theo loại ngữ pháp</span>
                    <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setActiveFilter(null)}
                        className={`px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${!activeFilter
                            ? 'bg-purple-600 text-white shadow-purple-500/20'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        <span className={`material-symbols-outlined text-lg ${!activeFilter ? 'text-white filled' : 'text-slate-400'}`}>filter_alt</span>
                        TẤT CẢ
                    </button>

                    {grammarTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setActiveFilter(activeFilter === type ? null : type)}
                            className={`px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${activeFilter === type
                                ? 'bg-purple-600 text-white shadow-purple-500/20'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Brain size={18} className={activeFilter === type ? 'text-white' : 'text-purple-400'} />
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Body */}
            <div className="grid gap-6 w-full pb-10">
                {filteredCards.length > 0 ? (
                    filteredCards.map((item) => (
                        <GrammarItem key={item.id} item={item} />
                    ))
                ) : (
                    <div className="py-20 text-center space-y-4 glass rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800">
                        <div className="text-5xl">{isSearching ? "⏳" : "🔍"}</div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {isSearching ? "Đang tìm kiếm trong tổ ong ngữ pháp..." : "Không tìm thấy câu nào phù hợp..."}
                        </p>
                        {!isSearching && (
                            <button
                                onClick={() => { setSearchQuery(""); setActiveFilter(null); }}
                                className="text-purple-500 font-bold hover:underline"
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
                            className="group flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-400 rounded-2xl shadow-lg hover:shadow-purple-400/10 transition-all font-bold text-slate-600 dark:text-slate-400 hover:text-purple-500 disabled:opacity-50"
                        >
                            {isLoadingMore ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <Brain size={20} className="text-purple-400" />
                            )}
                            <span>{isLoadingMore ? "Đang tải cấu trúc..." : (searchQuery === "" ? `Tải thêm (Còn ${serverTotal - cards.length} câu)` : "Tải thêm kết quả tìm kiếm")}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
