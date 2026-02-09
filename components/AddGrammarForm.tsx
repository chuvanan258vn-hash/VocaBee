"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { addGrammarCardAction } from "@/app/actions";
import { useToast } from "./ToastProvider";

type CardType = "CLOZE" | "MCQ" | "PRODUCTION" | "ERROR_CORRECTION" | "TRANSFORMATION";

const CARD_TEMPLATES = {
    CLOZE: {
        label: "Fill in the Blank",
        icon: "📝",
        description: "Complete the sentence with the missing word/phrase",
        promptPlaceholder: "She _____ to school every day.",
        answerPlaceholder: "goes",
        hintPlaceholder: "present simple form of 'go'",
    },
    MCQ: {
        label: "Multiple Choice",
        icon: "✓",
        description: "Choose the correct answer from options",
        promptPlaceholder: "Which is correct? 'I _____ seen that movie.'",
        answerPlaceholder: "have",
        hintPlaceholder: "Use present perfect here",
    },
    PRODUCTION: {
        label: "Sentence Writing",
        icon: "✍️",
        description: "Write a complete sentence using given words",
        promptPlaceholder: "Write a sentence using: go, school, yesterday",
        answerPlaceholder: "I went to school yesterday.",
        hintPlaceholder: "Use past simple tense",
    },
    ERROR_CORRECTION: {
        label: "Error Correction",
        icon: "🔍",
        description: "Find and correct the mistake",
        promptPlaceholder: "She don't like coffee.",
        answerPlaceholder: "She doesn't like coffee.",
        hintPlaceholder: "Check subject-verb agreement",
    },
    TRANSFORMATION: {
        label: "Sentence Transform",
        icon: "🔄",
        description: "Rewrite the sentence in a different form",
        promptPlaceholder: "Active: They built this house. → Passive: ?",
        answerPlaceholder: "This house was built by them.",
        hintPlaceholder: "Convert to passive voice",
    },
};

export default function AddGrammarForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [cardType, setCardType] = useState<CardType>("CLOZE");
    const [prompt, setPrompt] = useState("");
    const [answer, setAnswer] = useState("");
    const [options, setOptions] = useState<string[]>(["", "", "", ""]);
    const [hint, setHint] = useState("");
    const [explanation, setExplanation] = useState("");
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
                options: cardType === "MCQ" ? JSON.stringify(options.filter(o => o.trim())) : null,
                hint: hint.trim() || null,
                explanation: explanation.trim() || null,
                tags: tags.trim() || null,
            });

            if (result.success) {
                showToast("✅ Đã thêm thẻ ngữ pháp thành công!", "success");
                // Reset form
                setPrompt("");
                setAnswer("");
                setOptions(["", "", "", ""]);
                setHint("");
                setExplanation("");
                setTags("");
                setIsOpen(false);
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
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl font-bold text-sm transition-all border border-purple-500/20 flex items-center gap-2"
            >
                <Plus size={16} />
                <span>Thêm Ngữ Pháp</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-3xl sm:max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">Thêm Thẻ Ngữ Pháp</h2>
                                    <p className="text-sm text-slate-500 mt-1">Tạo thẻ luyện tập ngữ pháp theo template</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Card Type Selection */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                                            Loại thẻ
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {Object.entries(CARD_TEMPLATES).map(([type, temp]) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setCardType(type as CardType)}
                                                    className={`p-4 rounded-2xl border-2 transition-all text-left ${cardType === type
                                                            ? "border-purple-500 bg-purple-500/10 shadow-lg"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700"
                                                        }`}
                                                >
                                                    <div className="text-2xl mb-2">{temp.icon}</div>
                                                    <div className="text-xs font-black text-slate-800 dark:text-white">
                                                        {temp.label}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                                        {temp.description}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Prompt */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Câu hỏi / Nhiệm vụ *
                                        </label>
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder={template.promptPlaceholder}
                                            required
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-purple-400 rounded-2xl outline-none text-slate-800 dark:text-white min-h-[80px] resize-none"
                                        />
                                    </div>

                                    {/* Answer */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Đáp án chính xác *
                                        </label>
                                        <input
                                            type="text"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            placeholder={template.answerPlaceholder}
                                            required
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-purple-400 rounded-2xl outline-none text-slate-800 dark:text-white"
                                        />
                                    </div>

                                    {/* MCQ Options */}
                                    {cardType === "MCQ" && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                Các lựa chọn (ít nhất 2)
                                            </label>
                                            <div className="space-y-2">
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
                                                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-purple-400 rounded-xl outline-none text-slate-800 dark:text-white text-sm"
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2">
                                                💡 Đáp án chính xác phải nằm trong danh sách này
                                            </p>
                                        </div>
                                    )}

                                    {/* Hint */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Gợi ý (tùy chọn)
                                        </label>
                                        <input
                                            type="text"
                                            value={hint}
                                            onChange={(e) => setHint(e.target.value)}
                                            placeholder={template.hintPlaceholder}
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-purple-400 rounded-2xl outline-none text-slate-800 dark:text-white"
                                        />
                                    </div>

                                    {/* Explanation */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Giải thích (tùy chọn)
                                        </label>
                                        <textarea
                                            value={explanation}
                                            onChange={(e) => setExplanation(e.target.value)}
                                            placeholder="Tại sao đáp án này đúng? Quy tắc ngữ pháp nào áp dụng?"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-purple-400 rounded-2xl outline-none text-slate-800 dark:text-white min-h-[80px] resize-none"
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Tag (tùy chọn)
                                        </label>
                                        <input
                                            type="text"
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            placeholder="vd: tenses, prepositions, TOEIC"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-purple-400 rounded-2xl outline-none text-slate-800 dark:text-white"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !prompt.trim() || !answer.trim()}
                                            className="flex-1 py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-black rounded-2xl transition-all disabled:cursor-not-allowed shadow-lg"
                                        >
                                            {isSubmitting ? "Đang thêm..." : "✅ Thêm Thẻ"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
