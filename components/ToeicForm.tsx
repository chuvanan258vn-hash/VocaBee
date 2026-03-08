"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { saveToeicQuestionAction } from "@/app/actions";
import { useToast } from "./ToastProvider";

// ─── Types ───
type ToeicPart = 5 | 6 | 7;

interface PartTab {
    part: ToeicPart;
    label: string;
    icon: string;
    color: string;
    activeColor: string;
    glowColor: string;
}

const PART_TABS: PartTab[] = [
    {
        part: 5,
        label: "Part 5",
        icon: "edit_note",
        color: "text-teal-500",
        activeColor: "from-teal-500 to-cyan-500",
        glowColor: "shadow-teal-500/30",
    },
    {
        part: 6,
        label: "Part 6",
        icon: "article",
        color: "text-violet-500",
        activeColor: "from-violet-500 to-purple-500",
        glowColor: "shadow-violet-500/30",
    },
    {
        part: 7,
        label: "Part 7",
        icon: "psychology",
        color: "text-rose-500",
        activeColor: "from-rose-500 to-pink-500",
        glowColor: "shadow-rose-500/30",
    },
];

// ─── Main Component ───
export default function ToeicForm() {
    const [activePart, setActivePart] = useState<ToeicPart | null>(5);

    const activeTab = PART_TABS.find((t) => t.part === activePart);

    return (
        <div className="glass-panel rounded-3xl shadow-[var(--shadow-glass)] w-full max-w-4xl transition-all flex flex-col overflow-hidden">
            {/* ── Header ── */}
            <div className="p-5 pb-0">
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-teal-500/20"></div>
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
                            <span className="material-symbols-outlined text-white text-[14px]">quiz</span>
                        </div>
                        <h2 className="text-sm font-black text-foreground tracking-[0.15em] shrink-0 uppercase">TOEIC Practice</h2>
                    </div>
                    <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-teal-500/20"></div>
                </div>
                <p className="text-[10px] text-center text-slate-500 font-medium mt-1 tracking-wide">
                    Luyện đề Part 5 · 6 · 7 chuẩn format 🎯
                </p>
            </div>

            {/* ── Part Tabs ── */}
            <div className="flex items-center gap-2 px-5 pt-4 pb-3">
                {PART_TABS.map((tab) => {
                    const isActive = activePart === tab.part;
                    return (
                        <button
                            key={tab.part}
                            type="button"
                            onClick={() => setActivePart(isActive ? null : tab.part)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border ${isActive
                                ? `bg-gradient-to-r ${tab.activeColor} text-white border-transparent shadow-lg ${tab.glowColor} scale-[1.02]`
                                : "bg-surface/50 dark:bg-slate-800/40 text-slate-500 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[16px] ${isActive ? "text-white" : tab.color}`}>{tab.icon}</span>
                            {tab.label}
                            {isActive && (
                                <motion.span
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: 180 }}
                                    className="material-symbols-outlined text-[14px]"
                                >
                                    expand_less
                                </motion.span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Form Content ── */}
            <AnimatePresence mode="wait">
                {activePart && activeTab && (
                    <motion.div
                        key={activePart}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-1">
                            {activePart === 5 && <Part5Form tab={activeTab} />}
                            {activePart === 6 && <Part6Form tab={activeTab} />}
                            {activePart === 7 && <Part7Form tab={activeTab} />}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Shared: Options Grid ───
function OptionsGrid({ options, setOptions, correctAnswer, setCorrectAnswer, accentColor }: {
    options: Record<string, string>;
    setOptions: (o: Record<string, string>) => void;
    correctAnswer: string;
    setCorrectAnswer: (a: string) => void;
    accentColor: string;
}) {
    const keys = ["A", "B", "C", "D"];
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
                Đáp án A–D <span className={accentColor}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
                {keys.map((key) => {
                    const isCorrect = correctAnswer === key;
                    return (
                        <div key={key} className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCorrectAnswer(key)}
                                className={`w-8 h-8 rounded-lg text-[11px] font-black flex items-center justify-center border-2 transition-all duration-300 shrink-0 ${isCorrect
                                    ? `bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30 scale-110`
                                    : "bg-surface dark:bg-slate-800/40 text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                                    }`}
                                title={isCorrect ? "Đáp án đúng" : "Chọn làm đáp án đúng"}
                            >
                                {key}
                            </button>
                            <input
                                value={options[key] || ""}
                                onChange={(e) => setOptions({ ...options, [key]: e.target.value })}
                                placeholder={`Đáp án ${key}...`}
                                className="input-premium w-full px-3 py-2 text-sm font-medium"
                            />
                        </div>
                    );
                })}
            </div>
            <p className="text-[9px] text-slate-400 ml-1 mt-1">
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500 inline-block"></span> Nhấn chữ cái để chọn đáp án đúng</span>
            </p>
        </div>
    );
}

// ─── Shared: Advanced Section ───
function AdvancedSection({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-teal-500 uppercase tracking-widest transition-colors py-1 px-1 w-fit"
            >
                {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {isOpen ? "Ẩn chi tiết" : "Thêm chi tiết (Category, Formula, Keywords)"}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-3 pt-1">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── Shared: Submit Button ───
function SubmitButton({ isLoading, isDisabled, tab }: { isLoading: boolean; isDisabled: boolean; tab: PartTab }) {
    return (
        <button
            type="submit"
            disabled={isLoading || isDisabled}
            className={`w-full py-2.5 mt-1 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${isLoading || isDisabled
                ? "bg-slate-200 dark:bg-surface text-slate-400 cursor-not-allowed"
                : `bg-gradient-to-r ${tab.activeColor} text-white shadow-lg ${tab.glowColor} hover:shadow-xl hover:scale-[1.01] active:scale-95`
                }`}
        >
            {isLoading ? (
                <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ĐANG LƯU...
                </>
            ) : (
                <>
                    <Check size={18} />
                    LƯU CÂU HỎI {tab.label.toUpperCase()}
                </>
            )}
        </button>
    );
}

// ════════════════════════════════════════════════
//  PART 5 FORM
// ════════════════════════════════════════════════
function Part5Form({ tab }: { tab: PartTab }) {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState<Record<string, string>>({ A: "", B: "", C: "", D: "" });
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [grammarCategory, setGrammarCategory] = useState("");
    const [signalKeywords, setSignalKeywords] = useState("");
    const [explanation, setExplanation] = useState("");
    const [formula, setFormula] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const isDisabled = !question.trim() || !correctAnswer;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await saveToeicQuestionAction({
                toeicPart: 5,
                prompt: question.trim(),
                answer: correctAnswer,
                options: JSON.stringify(options),
                explanation: explanation.trim() || undefined,
                grammarCategory: grammarCategory.trim() || undefined,
                signalKeywords: signalKeywords.trim() || undefined,
                formula: formula.trim() || undefined,
            });
            if (res.success) {
                showToast("Đã lưu câu Part 5! 🎯", "success");
                setQuestion(""); setOptions({ A: "", B: "", C: "", D: "" }); setCorrectAnswer("");
                setGrammarCategory(""); setSignalKeywords(""); setExplanation(""); setFormula("");
            } else {
                showToast(res.error || "Lỗi khi lưu.", "error");
            }
        } catch { showToast("Lỗi kỹ thuật.", "error"); }
        finally { setIsLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Question */}
            <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
                    Câu hỏi <span className="text-teal-500">*</span>
                </label>
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="The marketing team ________ the new campaign results yesterday."
                    className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400 min-h-[70px] max-h-[120px] resize-none text-sm font-medium"
                />
            </div>

            {/* Options */}
            <OptionsGrid
                options={options}
                setOptions={setOptions}
                correctAnswer={correctAnswer}
                setCorrectAnswer={setCorrectAnswer}
                accentColor="text-teal-500"
            />

            {/* Explanation */}
            <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
                    Giải thích
                </label>
                <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Câu có trạng từ 'yesterday' nên dùng thì Quá khứ đơn..."
                    className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400 min-h-[50px] max-h-[80px] resize-none text-sm font-medium"
                />
            </div>

            {/* Advanced */}
            <AdvancedSection>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grammar Category</label>
                        <input value={grammarCategory} onChange={(e) => setGrammarCategory(e.target.value)} placeholder="Tenses - Past Simple" className="input-premium w-full px-3 py-2 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1">Signal Keywords ✨</label>
                        <input value={signalKeywords} onChange={(e) => setSignalKeywords(e.target.value)} placeholder="yesterday, last week, ago..." className="input-premium border-amber-200 dark:border-amber-500/20 bg-amber-50/30 dark:bg-amber-500/5 w-full px-3 py-2 text-sm text-amber-600 font-bold" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Formula</label>
                    <input value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="S + V2/ed + O" className="input-premium w-full px-3 py-2 text-sm font-mono" />
                </div>
            </AdvancedSection>

            <SubmitButton isLoading={isLoading} isDisabled={isDisabled} tab={tab} />
        </form>
    );
}

// ════════════════════════════════════════════════
//  PART 6 FORM
// ════════════════════════════════════════════════
function Part6Form({ tab }: { tab: PartTab }) {
    const [contextPassage, setContextPassage] = useState("");
    const [questionAtGap, setQuestionAtGap] = useState("");
    const [options, setOptions] = useState<Record<string, string>>({ A: "", B: "", C: "", D: "" });
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [grammarCategory, setGrammarCategory] = useState("");
    const [contextClue, setContextClue] = useState("");
    const [explanation, setExplanation] = useState("");
    const [formula, setFormula] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const isDisabled = !contextPassage.trim() || !correctAnswer;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await saveToeicQuestionAction({
                toeicPart: 6,
                prompt: contextPassage.trim(),
                answer: correctAnswer,
                options: JSON.stringify(options),
                explanation: explanation.trim() || undefined,
                grammarCategory: grammarCategory.trim() || undefined,
                formula: formula.trim() || undefined,
                hint: contextClue.trim() || undefined,
                questionAtGap: questionAtGap.trim() || undefined,
            });
            if (res.success) {
                showToast("Đã lưu câu Part 6! 📄", "success");
                setContextPassage(""); setQuestionAtGap(""); setOptions({ A: "", B: "", C: "", D: "" }); setCorrectAnswer("");
                setGrammarCategory(""); setContextClue(""); setExplanation(""); setFormula("");
            } else {
                showToast(res.error || "Lỗi khi lưu.", "error");
            }
        } catch { showToast("Lỗi kỹ thuật.", "error"); }
        finally { setIsLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Context Passage */}
            <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
                    Đoạn văn <span className="text-violet-500">*</span>
                </label>
                <textarea
                    value={contextPassage}
                    onChange={(e) => setContextPassage(e.target.value)}
                    placeholder="Dear Staff, Please note that the office ________ closed this Friday for maintenance..."
                    className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400 min-h-[100px] max-h-[200px] resize-y text-sm font-medium leading-relaxed"
                />
            </div>

            {/* Question at Gap */}
            <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
                    Câu chứa chỗ trống
                </label>
                <input
                    value={questionAtGap}
                    onChange={(e) => setQuestionAtGap(e.target.value)}
                    placeholder="the office ________ closed this Friday"
                    className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400 text-sm font-medium"
                />
            </div>

            {/* Options */}
            <OptionsGrid
                options={options}
                setOptions={setOptions}
                correctAnswer={correctAnswer}
                setCorrectAnswer={setCorrectAnswer}
                accentColor="text-violet-500"
            />

            {/* Explanation */}
            <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
                    Giải thích
                </label>
                <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Thông báo về sự kiện sắp diễn ra trong tương lai gần..."
                    className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400 min-h-[50px] max-h-[80px] resize-none text-sm font-medium"
                />
            </div>

            {/* Advanced */}
            <AdvancedSection>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grammar Category</label>
                        <input value={grammarCategory} onChange={(e) => setGrammarCategory(e.target.value)} placeholder="Tenses - Future Simple" className="input-premium w-full px-3 py-2 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-violet-500 uppercase tracking-widest ml-1">Context Clue 🔍</label>
                        <input value={contextClue} onChange={(e) => setContextClue(e.target.value)} placeholder="Sự việc sắp xảy ra vào 'this Friday'..." className="input-premium border-violet-200 dark:border-violet-500/20 bg-violet-50/30 dark:bg-violet-500/5 w-full px-3 py-2 text-sm text-violet-600 font-bold" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Formula</label>
                    <input value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="S + will + be + Adj/V3" className="input-premium w-full px-3 py-2 text-sm font-mono" />
                </div>
            </AdvancedSection>

            <SubmitButton isLoading={isLoading} isDisabled={isDisabled} tab={tab} />
        </form>
    );
}

// ════════════════════════════════════════════════
//  PART 7 FORM
// ════════════════════════════════════════════════
function Part7Form({ tab }: { tab: PartTab }) {
    const [complexSentence, setComplexSentence] = useState("");
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState<Record<string, string>>({ A: "", B: "", C: "", D: "" });
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [grammarCategory, setGrammarCategory] = useState("");
    const [explanation, setExplanation] = useState("");
    const [formula, setFormula] = useState("");
    // Sentence Structure
    const [subject, setSubject] = useState("");
    const [relativeClause, setRelativeClause] = useState("");
    const [mainVerb, setMainVerb] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const isDisabled = !complexSentence.trim() || !question.trim() || !correctAnswer;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const sentenceStructure = (subject || relativeClause || mainVerb)
                ? JSON.stringify({ subject, relativeClause, mainVerb })
                : undefined;
            const res = await saveToeicQuestionAction({
                toeicPart: 7,
                prompt: complexSentence.trim() + "\n---Q---\n" + question.trim(),
                answer: correctAnswer,
                options: JSON.stringify(options),
                explanation: explanation.trim() || undefined,
                grammarCategory: grammarCategory.trim() || undefined,
                formula: formula.trim() || undefined,
                sentenceStructure,
            });
            if (res.success) {
                showToast("Đã lưu câu Part 7! 🧠", "success");
                setComplexSentence(""); setQuestion(""); setOptions({ A: "", B: "", C: "", D: "" }); setCorrectAnswer("");
                setGrammarCategory(""); setExplanation(""); setFormula("");
                setSubject(""); setRelativeClause(""); setMainVerb("");
            } else {
                showToast(res.error || "Lỗi khi lưu.", "error");
            }
        } catch { showToast("Lỗi kỹ thuật.", "error"); }
        finally { setIsLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Complex Sentence */}
            <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
                    Câu phức <span className="text-rose-500">*</span>
                </label>
                <textarea
                    value={complexSentence}
                    onChange={(e) => setComplexSentence(e.target.value)}
                    placeholder="The candidate who has the most experience in digital marketing will be selected for the position."
                    className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400 min-h-[80px] max-h-[150px] resize-y text-sm font-medium leading-relaxed"
                />
            </div>

            {/* Question */}
            <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
                    Câu hỏi <span className="text-rose-500">*</span>
                </label>
                <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Identify the main verb of the sentence."
                    className="input-premium w-full px-3 py-2 text-foreground text-sm font-medium"
                />
            </div>

            {/* Options */}
            <OptionsGrid
                options={options}
                setOptions={setOptions}
                correctAnswer={correctAnswer}
                setCorrectAnswer={setCorrectAnswer}
                accentColor="text-rose-500"
            />

            {/* Explanation */}
            <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
                    Giải thích
                </label>
                <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Cụm 'who has...' là mệnh đề quan hệ. Động từ chính là 'will be selected'."
                    className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400 min-h-[50px] max-h-[80px] resize-none text-sm font-medium"
                />
            </div>

            {/* Advanced */}
            <AdvancedSection>
                {/* Sentence Structure */}
                <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-2">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Sentence Structure 🧩</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="The candidate" className="input-premium w-full px-2 py-1.5 text-xs" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Relative Clause</label>
                            <input value={relativeClause} onChange={(e) => setRelativeClause(e.target.value)} placeholder="who has the most..." className="input-premium w-full px-2 py-1.5 text-xs" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Main Verb</label>
                            <input value={mainVerb} onChange={(e) => setMainVerb(e.target.value)} placeholder="will be selected" className="input-premium w-full px-2 py-1.5 text-xs" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grammar Category</label>
                        <input value={grammarCategory} onChange={(e) => setGrammarCategory(e.target.value)} placeholder="Relative Clauses / Main Verb" className="input-premium w-full px-3 py-2 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Formula</label>
                        <input value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="S + [Relative Clause] + Main Verb" className="input-premium w-full px-3 py-2 text-sm font-mono" />
                    </div>
                </div>
            </AdvancedSection>

            <SubmitButton isLoading={isLoading} isDisabled={isDisabled} tab={tab} />
        </form>
    );
}
