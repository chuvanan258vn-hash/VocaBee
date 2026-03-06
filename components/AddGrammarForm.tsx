"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { addGrammarCardAction } from "@/app/actions";
import { useToast } from "./ToastProvider";

type CardType = "CLOZE" | "MCQ" | "PRODUCTION" | "ERROR_CORRECTION" | "TRANSFORMATION" | "NOTEBOOK";

const CARD_TEMPLATES = {
    CLOZE: {
        label: "Điền ô trống",
        icon: "📝",
        description: "Hoàn thành câu bằng cách điền từ hoặc cụm từ còn thiếu",
        promptPlaceholder: "She _____ to school every day.",
        answerPlaceholder: "goes",
        hintPlaceholder: "thì hiện tại đơn của 'go'",
    },
    MCQ: {
        label: "Trắc nghiệm",
        icon: "✓",
        description: "Chọn đáp án chính xác nhất từ danh sách các lựa chọn",
        promptPlaceholder: "Which is correct? 'I _____ seen that movie.'",
        answerPlaceholder: "have",
        hintPlaceholder: "Sử dụng thì hiện tại hoàn thành",
    },
    PRODUCTION: {
        label: "Viết câu",
        icon: "✍️",
        description: "Tạo một câu hoàn chỉnh dựa trên các từ hoặc gợi ý cho sẵn",
        promptPlaceholder: "Write a sentence using: go, school, yesterday",
        answerPlaceholder: "I went to school yesterday.",
        hintPlaceholder: "Sử dụng thì quá khứ đơn",
    },
    ERROR_CORRECTION: {
        label: "Sửa lỗi sai",
        icon: "🔍",
        description: "Tìm và sửa lại lỗi sai về ngữ pháp hoặc từ vựng trong câu",
        promptPlaceholder: "She don't like coffee.",
        answerPlaceholder: "She doesn't like coffee.",
        hintPlaceholder: "Kiểm tra sự hòa hợp chủ ngữ - động từ",
    },
    TRANSFORMATION: {
        label: "Biến đổi câu",
        icon: "🔄",
        description: "Viết lại câu theo một cấu trúc khác nhưng giữ nguyên ý nghĩa",
        promptPlaceholder: "Active: They built this house. → Passive: ?",
        answerPlaceholder: "This house was built by them.",
        hintPlaceholder: "Chuyển sang câu bị động",
    },
    NOTEBOOK: {
        label: "Sổ tay lỗi sai",
        icon: "📓",
        description: "Phân tích sâu nguyên nhân sai, bẫy từ vựng và quy tắc cốt lõi",
        promptPlaceholder: "The manager is looking for a __________ candidate...",
        answerPlaceholder: "reliable",
        hintPlaceholder: "Chọn tính từ để bổ nghĩa cho danh từ",
    },
};

export default function AddGrammarForm() {
    const [cardType, setCardType] = useState<CardType>("CLOZE");
    const [prompt, setPrompt] = useState("");
    const [answer, setAnswer] = useState("");
    const [meaning, setMeaning] = useState("");
    const [options, setOptions] = useState<string[]>(["", "", "", ""]);
    const [hint, setHint] = useState("");
    const [explanation, setExplanation] = useState("");
    const [myError, setMyError] = useState("");
    const [trap, setTrap] = useState("");
    const [goldenRule, setGoldenRule] = useState("");
    const [tags, setTags] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const template = CARD_TEMPLATES[cardType];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await addGrammarCardAction({
                type: cardType,
                prompt: prompt.trim(),
                answer: answer.trim(),
                meaning: meaning.trim() || null,
                options: cardType === "MCQ" ? JSON.stringify(options.filter(o => o.trim())) : null,
                hint: hint.trim() || null,
                explanation: explanation.trim() || null,
                myError: cardType === "NOTEBOOK" ? myError.trim() : null,
                trap: cardType === "NOTEBOOK" ? trap.trim() : null,
                goldenRule: cardType === "NOTEBOOK" ? goldenRule.trim() : null,
                tags: tags.trim() || null,
            });

            if (result.success) {
                showToast("✅ Đã thêm thẻ ngữ pháp thành công!", "success");
                // Reset form
                setPrompt("");
                setAnswer("");
                setMeaning("");
                setOptions(["", "", "", ""]);
                setHint("");
                setExplanation("");
                setMyError("");
                setTrap("");
                setGoldenRule("");
            } else {
                showToast(result.error || "Lỗi khi thêm thẻ", "error");
            }
        } catch (error) {
            showToast("Lỗi khi thêm thẻ ngữ pháp", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-5 glass-panel rounded-3xl shadow-[var(--shadow-glass)] w-full max-w-4xl transition-all hover:shadow-[var(--shadow-glow)] flex flex-col gap-4 border-purple-500/10">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-glass-border"></div>
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-glow-primary shrink-0 transition-transform hover:rotate-12">
                        <span className="text-sm">✨</span>
                    </div>
                    <h2 className="text-sm font-black text-foreground tracking-[0.15em] shrink-0 uppercase text-shadow-purple text-purple-600 dark:text-purple-400">THÊM NGỮ PHÁP & PHÂN TÍCH</h2>
                </div>
                <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-glass-border"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Card Type Selection */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 ml-1">
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                            CHỌN TEMPLATE
                        </label>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {Object.entries(CARD_TEMPLATES).map(([type, temp]) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setCardType(type as CardType)}
                                className={`group relative p-2.5 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center gap-1 overflow-visible ${cardType === type
                                    ? "border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.1)] scale-[1.05] z-10"
                                    : "border-slate-50 dark:border-slate-800/40 bg-surface dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:border-purple-300 dark:hover:border-purple-700/50"
                                    }`}
                            >
                                <div className="text-xl group-hover:scale-110 transition-transform duration-300">{temp.icon}</div>
                                <div className={`text-[8px] font-black transition-colors ${cardType === type ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {temp.label.split(' ')[0]}
                                </div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                                    <p className="text-[9px] font-bold text-white leading-tight">
                                        {temp.description}
                                    </p>
                                    {/* Arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-800/95"></div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Required Info */}
                    <div className="space-y-3">
                        {/* Prompt */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase">
                                Câu hỏi / Nhiệm vụ <span className="text-purple-500">*</span>
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={template.promptPlaceholder}
                                required
                                className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400/60 min-h-[80px] max-h-[120px] resize-none text-sm font-medium"
                            />
                        </div>

                        {/* Answer */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase">
                                Đáp án chính xác <span className="text-purple-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder={template.answerPlaceholder}
                                required
                                className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400/60 text-sm font-bold"
                            />
                        </div>

                        {/* Meaning */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase">
                                Nghĩa của câu (Gợi ý)
                            </label>
                            <textarea
                                value={meaning}
                                onChange={(e) => setMeaning(e.target.value)}
                                placeholder="Dịch nghĩa hoặc gợi ý tiếng Việt cho câu này..."
                                className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400/60 min-h-[60px] max-h-[100px] resize-none text-sm font-medium italic"
                            />
                        </div>

                        {/* MCQ Options */}
                        {cardType === "MCQ" && (
                            <div className="space-y-1 px-3 py-2 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1 uppercase">
                                    Các lựa chọn
                                </label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {options.map((opt, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...options];
                                                newOpts[idx] = e.target.value;
                                                setOptions(newOpts);
                                            }}
                                            placeholder={`Lựa chọn ${String.fromCharCode(65 + idx)}`}
                                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-purple-400 rounded-xl outline-none text-foreground text-[11px]"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hint */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase">
                                Gợi ý (tùy chọn)
                            </label>
                            <input
                                type="text"
                                value={hint}
                                onChange={(e) => setHint(e.target.value)}
                                placeholder={template.hintPlaceholder}
                                className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400/60 text-sm italic"
                            />
                        </div>
                    </div>

                    {/* Right Column: Deep Analysis (Notebook) or Explanation */}
                    <div className="space-y-3">
                        {cardType === "NOTEBOOK" ? (
                            <div className="space-y-3 p-4 bg-purple-50/30 dark:bg-purple-900/10 rounded-3xl border border-purple-100 dark:border-purple-800/30 shadow-inner">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">PHÂN TÍCH SỔ TAY</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-1">
                                            Lỗi của tôi
                                        </label>
                                        <textarea
                                            value={myError}
                                            onChange={(e) => setMyError(e.target.value)}
                                            placeholder="Vì sao tôi sai?..."
                                            className="w-full p-2.5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:border-purple-400 rounded-xl outline-none text-foreground text-xs min-h-[50px] resize-none"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[9px] font-black text-rose-500 uppercase ml-1">
                                            Cái bẫy 🪤
                                        </label>
                                        <textarea
                                            value={trap}
                                            onChange={(e) => setTrap(e.target.value)}
                                            placeholder="Điểm gây lừa đảo?..."
                                            className="w-full p-2.5 bg-rose-50/30 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 focus:border-rose-400 rounded-xl outline-none text-foreground text-xs min-h-[50px] resize-none"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[9px] font-black text-amber-600 uppercase ml-1">
                                            Quy tắc vàng ✨
                                        </label>
                                        <textarea
                                            value={goldenRule}
                                            onChange={(e) => setGoldenRule(e.target.value)}
                                            placeholder="Nguyên tắc cốt lõi?..."
                                            className="w-full p-2.5 bg-amber-50/20 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 focus:border-amber-400 rounded-xl outline-none text-foreground text-[12px] font-bold min-h-[50px] resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase">
                                    Giải thích chi tiết
                                </label>
                                <textarea
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                    placeholder="Tại sao đáp án này đúng?..."
                                    className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400/60 min-h-[140px] resize-none text-sm"
                                />
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase">
                                Tags
                            </label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="ví dụ: tenses, toeic..."
                                className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400/60 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || !prompt.trim() || !answer.trim()}
                    className={`w-full py-2.5 mt-2 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 group shadow-lg ${isSubmitting || !prompt.trim() || !answer.trim()
                        ? 'bg-slate-300 dark:bg-surface cursor-not-allowed text-slate-500'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:brightness-110 active:scale-[0.98]'}`}
                >
                    {isSubmitting ? (
                        <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ĐANG LƯU...
                        </>
                    ) : (
                        <>
                            <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                            CẤT VÀO SỔ TAY NGỮ PHÁP 🐝
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
