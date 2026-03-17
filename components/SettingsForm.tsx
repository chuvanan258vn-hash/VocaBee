"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Minus } from "lucide-react";
import { updateUserSettingsAction } from "@/app/actions";
import { useToast } from "./ToastProvider";
import { motion } from "framer-motion";

interface SettingsFormProps {
    initialDailyGoal: number;
    initialDailyGrammarGoal?: number;
    initialDailyMaxVocabReview?: number;
    initialDailyMaxGrammarReview?: number;
}

export default function SettingsForm({ initialDailyGoal, initialDailyGrammarGoal, initialDailyMaxVocabReview, initialDailyMaxGrammarReview }: SettingsFormProps) {
    const { showToast } = useToast();
    const router = useRouter();
    const [dailyGoal, setDailyGoal] = useState(initialDailyGoal || 20);
    const [dailyGrammarGoal, setDailyGrammarGoal] = useState<number>(
        (typeof (initialDailyGrammarGoal as number) === 'number' ? (initialDailyGrammarGoal as number) : 5)
    );
    const [dailyMaxVocabReview, setDailyMaxVocabReview] = useState<number>(
        typeof initialDailyMaxVocabReview === 'number' ? initialDailyMaxVocabReview : 100
    );
    const [dailyMaxGrammarReview, setDailyMaxGrammarReview] = useState<number>(
        typeof initialDailyMaxGrammarReview === 'number' ? initialDailyMaxGrammarReview : 50
    );
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await updateUserSettingsAction({ dailyGoal, dailyGrammarGoal, dailyMaxVocabReview, dailyMaxGrammarReview });
            if (res.success) {
                showToast("Đã lưu cài đặt thành công! Đang về Dashboard... 🐝✨", "success");
                // Refresh current page data, then auto-navigate to dashboard
                router.refresh();
                setTimeout(() => router.push('/'), 1500);
            } else {
                showToast(res.error || "Lỗi khi lưu cài đặt.", "error");
            }
        } catch (error) {
            showToast("Lỗi kỹ thuật khi lưu cài đặt.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const adjustGoal = (amount: number) => {
        setDailyGoal(prev => Math.max(5, Math.min(200, prev + amount)));
    };

    const adjustGrammarGoal = (amount: number) => {
        setDailyGrammarGoal(prev => Math.max(1, Math.min(50, prev + amount)));
    };

    const adjustMaxVocabReview = (amount: number) => {
        setDailyMaxVocabReview(prev => Math.max(10, Math.min(500, prev + amount)));
    };

    const adjustMaxGrammarReview = (amount: number) => {
        setDailyMaxGrammarReview(prev => Math.max(10, Math.min(200, prev + amount)));
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header with Save Button */}
            <header className="fixed top-0 right-0 z-30 px-4 sm:px-8 py-5 flex items-center justify-end pointer-events-none">
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="pointer-events-auto flex items-center gap-2 bg-primary text-black font-black text-xs px-6 py-2.5 rounded-xl shadow-glow hover:bg-amber-300 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    LƯU THAY ĐỔI
                </button>
            </header>

            {/* Section 1: Interface Theme (Display only for now) */}
            <section className="glass-panel rounded-[32px] p-8 border border-glass-border shadow-soft bg-surface/20">
                <h3 className="text-foreground tracking-tight text-xl font-black leading-tight pb-8 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[28px]">palette</span>
                    Giao diện hệ thống
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group cursor-pointer relative opacity-50 grayscale hover:grayscale-0 transition-all">
                        <div className="bg-slate-50 border-2 border-transparent rounded-2xl overflow-hidden aspect-video relative">
                            <div className="absolute inset-x-0 top-0 h-4 bg-slate-200"></div>
                            <div className="p-4 space-y-2">
                                <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                                <div className="h-10 w-full bg-white rounded border border-slate-100 mt-2"></div>
                            </div>
                        </div>
                        <p className="text-slate-500 text-center font-bold mt-4 uppercase tracking-widest text-[10px]">Chế độ sáng</p>
                    </div>
                    <div className="group cursor-pointer relative">
                        <div className="bg-[#0B1221] border-2 border-primary rounded-2xl overflow-hidden aspect-video relative shadow-glow-primary">
                            <div className="absolute inset-x-0 top-0 h-4 bg-[#050912]"></div>
                            <div className="p-4 space-y-2">
                                <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                                <div className="h-10 w-full bg-slate-800/50 rounded border border-slate-700 mt-2"></div>
                            </div>
                            <div className="absolute bottom-3 right-3 text-primary">
                                <span className="material-symbols-outlined filled text-[24px]">check_circle</span>
                            </div>
                        </div>
                        <p className="text-foreground text-center font-black mt-4 uppercase tracking-widest text-[10px]">Chế độ tối (Mặc định)</p>
                    </div>
                    <div className="group cursor-pointer relative opacity-50 grayscale hover:grayscale-0 transition-all">
                        <div className="bg-gradient-to-br from-slate-50 via-slate-400 to-[#0B1221] border-2 border-transparent rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-white/50">brightness_auto</span>
                        </div>
                        <p className="text-slate-500 text-center font-bold mt-4 uppercase tracking-widest text-[10px]">Tự động</p>
                    </div>
                </div>
            </section>

            {/* Section 2: Learning Settings */}
            <section className="glass-panel rounded-[32px] p-8 border border-glass-border shadow-soft bg-surface/20">
                <h3 className="text-foreground tracking-tight text-xl font-black leading-tight pb-8 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[28px]">settings_accessibility</span>
                    Cài đặt học tập
                </h3>
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="font-bold text-foreground">Ngôn ngữ hiển thị</p>
                            <p className="text-xs text-slate-500">Chọn ngôn ngữ bạn muốn sử dụng trên giao diện.</p>
                        </div>
                        <select
                            title="Chọn ngôn ngữ hiển thị"
                            disabled
                            className="bg-surface border border-glass-border rounded-xl px-4 py-2.5 text-sm font-bold opacity-50 cursor-not-allowed outline-none min-w-[200px]"
                        >
                            <option>Tiếng Việt</option>
                        </select>
                    </div>

                    <hr className="border-glass-border opacity-50" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="font-bold text-foreground">Mục tiêu từ mới hàng ngày</p>
                            <p className="text-xs text-slate-500">Số lượng từ vựng mới hệ thống sẽ gợi ý cho bạn mỗi ngày.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-surface border border-glass-border rounded-2xl overflow-hidden p-1 shadow-inner">
                                <button
                                    onClick={() => adjustGoal(-5)}
                                    type="button"
                                    className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors rounded-xl"
                                    title="Giảm 5 từ"
                                >
                                    <Minus size={20} />
                                </button>
                                <input
                                    type="number"
                                    value={dailyGoal}
                                    onChange={(e) => setDailyGoal(Number(e.target.value))}
                                    title="Số lượng từ mới hàng ngày"
                                    className="w-20 bg-transparent border-none text-center font-black text-primary focus:ring-0 outline-none text-2xl"
                                />
                                <button
                                    onClick={() => adjustGoal(5)}
                                    type="button"
                                    className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors rounded-xl"
                                    title="Thêm 5 từ"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">TỪ / NGÀY</span>
                        </div>
                    </div>

                    <hr className="border-glass-border opacity-50" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="font-bold text-foreground">Giới hạn ôn tập từ vựng</p>
                            <p className="text-xs text-slate-500">Giới hạn số lượng từ cũ xuất hiện mỗi ngày để tránh quá tải.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-surface border border-glass-border rounded-2xl overflow-hidden p-1 shadow-inner">
                                <button
                                    onClick={() => adjustMaxVocabReview(-10)}
                                    type="button"
                                    className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors rounded-xl"
                                    title="Giảm 10 từ"
                                >
                                    <Minus size={20} />
                                </button>
                                <input
                                    type="number"
                                    value={dailyMaxVocabReview}
                                    onChange={(e) => setDailyMaxVocabReview(Number(e.target.value))}
                                    title="Giới hạn ôn tập từ vựng hàng ngày"
                                    className="w-20 bg-transparent border-none text-center font-black text-primary focus:ring-0 outline-none text-2xl"
                                />
                                <button
                                    onClick={() => adjustMaxVocabReview(10)}
                                    type="button"
                                    className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors rounded-xl"
                                    title="Thêm 10 từ"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">TỪ / NGÀY</span>
                        </div>
                    </div>
                </div>
            </section>

                {/* Section: Grammar Goal */}
                <section className="glass-panel rounded-[32px] p-8 border border-glass-border shadow-soft bg-surface/20">
                    <h3 className="text-foreground tracking-tight text-xl font-black leading-tight pb-8 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[28px]">menu_book</span>
                        Mục tiêu ngữ pháp
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="font-bold text-foreground">Mục tiêu ngữ pháp hàng ngày</p>
                            <p className="text-xs text-slate-500">Số lượng bài ngữ pháp mới hệ thống sẽ gợi ý cho bạn mỗi ngày.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-surface border border-glass-border rounded-2xl overflow-hidden p-1 shadow-inner">
                                <button
                                    onClick={() => adjustGrammarGoal(-1)}
                                    type="button"
                                    className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors rounded-xl"
                                    title="Giảm 1"
                                >
                                    <Minus size={20} />
                                </button>
                                <input
                                    type="number"
                                    value={dailyGrammarGoal}
                                    onChange={(e) => setDailyGrammarGoal(Number(e.target.value))}
                                    title="Số lượng ngữ pháp mới hàng ngày"
                                    className="w-20 bg-transparent border-none text-center font-black text-primary focus:ring-0 outline-none text-2xl"
                                />
                                <button
                                    onClick={() => adjustGrammarGoal(1)}
                                    type="button"
                                    className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors rounded-xl"
                                    title="Thêm 1"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">PHẦN NGỮ PHÁP / NGÀY</span>
                        </div>
                    </div>

                    <hr className="border-glass-border opacity-50 mt-8 mb-8" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="font-bold text-foreground">Giới hạn ôn tập ngữ pháp</p>
                            <p className="text-xs text-slate-500">Giới hạn số thẻ ngữ pháp cũ xuất hiện mỗi ngày.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-surface border border-glass-border rounded-2xl overflow-hidden p-1 shadow-inner">
                                <button
                                    onClick={() => adjustMaxGrammarReview(-5)}
                                    type="button"
                                    className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors rounded-xl"
                                    title="Giảm 5 thẻ"
                                >
                                    <Minus size={20} />
                                </button>
                                <input
                                    type="number"
                                    value={dailyMaxGrammarReview}
                                    onChange={(e) => setDailyMaxGrammarReview(Number(e.target.value))}
                                    title="Giới hạn ôn tập ngữ pháp hàng ngày"
                                    className="w-20 bg-transparent border-none text-center font-black text-primary focus:ring-0 outline-none text-2xl"
                                />
                                <button
                                    onClick={() => adjustMaxGrammarReview(5)}
                                    type="button"
                                    className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors rounded-xl"
                                    title="Thêm 5 thẻ"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">THẺ / NGÀY</span>
                        </div>
                    </div>
                </section>

            {/* Customization (Display only) */}
            <section className="glass-panel rounded-[32px] p-8 border border-glass-border shadow-soft bg-surface/20 opacity-70">
                <h3 className="text-foreground tracking-tight text-xl font-black leading-tight pb-8 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[28px]">text_fields</span>
                    Tùy chỉnh văn bản
                </h3>
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <label className="text-foreground font-bold text-base flex items-center gap-2">
                            Kích thước chữ
                        </label>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Trung bình (100%)</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-sm font-black text-slate-500">Aa</span>
                        <div className="relative w-full h-3 bg-slate-800 border border-glass-border rounded-full cursor-not-allowed">
                            <div className="absolute top-0 left-0 h-full w-1/2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-2xl font-black text-foreground">Aa</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
