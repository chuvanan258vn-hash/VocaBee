// components/SrsDebugPanel.tsx
// Panel debug hiển thị chi tiết breakdown từ ôn tập SRS

interface SrsDebugData {
    /** Số từ đang trong lộ trình SRS và đã đến hạn hôm nay (interval > 0, nextReview <= now) */
    dueReviews: number;
    /** Số từ bị quên (interval > 0 nhưng repetition = 0) nằm trong nhóm dueReviews */
    forgottenWords: number;
    /** Số từ chưa học lần nào (interval = 0) */
    newWords: number;
    /** Số từ bị hoãn vào Inbox (isDeferred = true) */
    deferredWords: number;
    /** Tổng số từ trong DB của user này */
    totalWords: number;
    /** Ngưỡng "Hôm nay" bắt đầu từ lúc nào (4:00 AM) */
    todayStart: string;
    /** Thời điểm query hiện tại */
    queryTime: string;
    /** Số từ từ nguồn TEST chưa học */
    newTestWords: number;
    /** Số từ từ nguồn COLLECTION chưa học */
    newCollectionWords: number;
    /** Mục tiêu từ mới hàng ngày */
    dailyGoal: number;
    /** Số từ đã học hôm nay */
    learnedToday: number;
    /** Ngữ pháp đến hạn */
    dueGrammar: number;
    /** Ngữ pháp đã học hôm nay */
    learnedGrammarToday: number;
}

interface SrsDebugPanelProps {
    data: SrsDebugData;
}

function DebugRow({
    label,
    value,
    color = "text-foreground",
    description,
    icon,
}: {
    label: string;
    value: number | string;
    color?: string;
    description?: string;
    icon?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-3 py-2.5 border-b border-white/5 last:border-0 group">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    {icon && (
                        <span className={`material-symbols-outlined text-[16px] ${color}`}>
                            {icon}
                        </span>
                    )}
                    <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                        {label}
                    </span>
                </div>
                {description && (
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed pl-0">
                        {description}
                    </p>
                )}
            </div>
            <span className={`text-sm font-bold tabular-nums ${color} shrink-0`}>
                {typeof value === "number" ? value.toLocaleString('en-US') : value}
            </span>
        </div>
    );
}

export default function SrsDebugPanel({ data }: SrsDebugPanelProps) {
    // reviewedPercent kept for potential future use
    void Math.round((data.learnedToday / Math.max(1, data.dueReviews + data.newWords)) * 100);

    const canLearnMore = Math.max(0, data.dailyGoal - data.learnedToday);
    const progressPct = Math.min(100, Math.round((data.learnedToday / Math.max(1, data.dailyGoal)) * 100));

    // Map percentage to nearest Tailwind w-* class (0, 10, 20, ... 100)
    const progressWidthClass: Record<number, string> = {
        0: "w-0", 5: "w-[5%]", 10: "w-[10%]", 15: "w-[15%]",
        20: "w-1/5", 25: "w-1/4", 30: "w-[30%]", 33: "w-1/3",
        40: "w-2/5", 50: "w-1/2", 60: "w-3/5", 67: "w-2/3",
        70: "w-[70%]", 75: "w-3/4", 80: "w-4/5", 90: "w-[90%]",
        100: "w-full",
    };
    const buckets = Object.keys(progressWidthClass).map(Number);
    const nearest = buckets.reduce((prev, cur) =>
        Math.abs(cur - progressPct) < Math.abs(prev - progressPct) ? cur : prev, 0);
    const progressClass = progressWidthClass[nearest] ?? "w-0";

    return (
        <div className="glass-panel rounded-3xl p-6 border border-amber-500/10 relative overflow-hidden">
            {/* Accent glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                    <span className="material-symbols-outlined text-amber-400 text-lg">
                        bug_report
                    </span>
                    SRS Debug Panel
                </h3>
                <span className="text-[10px] text-amber-400/70 bg-amber-400/10 px-2 py-0.5 rounded-full font-mono border border-amber-400/20">
                    DEV
                </span>
            </div>

            {/* Timestamp */}
            <div className="mb-4 bg-surface/50 rounded-xl px-3 py-2 border border-glass-border text-[10px] font-mono text-slate-500 space-y-0.5">
                <div>
                    ⏰ Hôm nay bắt đầu:{" "}
                    <span className="text-slate-400">{data.todayStart}</span>
                </div>
                <div>
                    🕒 Query lúc:{" "}
                    <span className="text-slate-400">{data.queryTime}</span>
                </div>
            </div>

            {/* === PHẦN 1: CẦN ÔN TẬP === */}
            <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80 mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                    CẦN ÔN TẬP (interval &gt; 0)
                </p>
                <div className="bg-surface/40 rounded-2xl px-4 py-1 border border-glass-border">
                    <DebugRow
                        label="Tổng từ đến hạn hôm nay"
                        value={data.dueReviews}
                        color="text-amber-400"
                        icon="schedule"
                        description="interval > 0 AND nextReview ≤ now AND isDeferred = false"
                    />
                    <DebugRow
                        label="Trong đó: từ bị quên"
                        value={data.forgottenWords}
                        color="text-red-400"
                        icon="psychology"
                        description="interval > 0 AND repetition = 0 (đã quên nhưng vẫn xếp lịch lại)"
                    />
                    <DebugRow
                        label="Còn lại: đang tiến triển tốt"
                        value={Math.max(0, data.dueReviews - data.forgottenWords)}
                        color="text-emerald-400"
                        icon="trending_up"
                        description="repetition ≥ 1 — đang trong chuỗi nhớ liên tiếp"
                    />
                </div>
            </div>

            {/* === PHẦN 1.5: NGỮ PHÁP (Grammar Cards) === */}
            <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400/80 mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block" />
                    NGỮ PHÁP (Grammar Cards)
                </p>
                <div className="bg-surface/40 rounded-2xl px-4 py-1 border border-glass-border">
                    <DebugRow
                        label="Ngữ pháp đến hạn"
                        value={data.dueGrammar}
                        color="text-purple-400"
                        icon="psychology"
                        description="nextReview ≤ now AND isDeferred = false"
                    />
                    <DebugRow
                        label="Ngữ pháp đã luyện hôm nay"
                        value={data.learnedGrammarToday}
                        color="text-purple-300"
                        icon="auto_awesome"
                        description="updatedAt ≥ 4:00 AM AND (repetition ≥ 1 OR nextReview > now)"
                    />
                </div>
            </div>

            {/* === PHẦN 2: TỪ MỚI === */}
            <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/80 mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
                    TỪ MỚI CHƯA HỌC (interval = 0)
                </p>
                <div className="bg-surface/40 rounded-2xl px-4 py-1 border border-glass-border">
                    <DebugRow
                        label="Từ TEST (quan trọng ≥ 3) chưa học"
                        value={data.newTestWords}
                        color="text-violet-400"
                        icon="quiz"
                        description="source = TEST, importanceScore ≥ 3, createdAt < 4:00 sáng hôm nay"
                    />
                    <DebugRow
                        label="Từ COLLECTION chưa học"
                        value={data.newCollectionWords}
                        color="text-blue-400"
                        icon="auto_stories"
                        description="source = COLLECTION, isDeferred = false, createdAt < 4:00 sáng hôm nay"
                    />
                    <DebugRow
                        label="Tổng từ mới sẵn sàng"
                        value={data.newWords}
                        color="text-blue-300"
                        icon="add_circle"
                    />
                </div>
            </div>

            {/* === PHẦN 3: TIẾN ĐỘ HÔM NAY === */}
            <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    TIẾN ĐỘ HÔM NAY
                </p>
                <div className="bg-surface/40 rounded-2xl px-4 py-1 border border-glass-border">
                    <DebugRow
                        label="Mục tiêu hàng ngày"
                        value={data.dailyGoal}
                        color="text-foreground"
                        icon="flag"
                    />
                    <DebugRow
                        label="Đã học hôm nay"
                        value={data.learnedToday + data.learnedGrammarToday}
                        color="text-emerald-400"
                        icon="check_circle"
                        description="Tổng Vocabulary + Grammar đã hoàn thành"
                    />
                    <DebugRow
                        label="Còn có thể học thêm từ mới"
                        value={canLearnMore}
                        color={canLearnMore > 0 ? "text-amber-400" : "text-slate-500"}
                        icon="add_task"
                        description={`= dailyGoal (${data.dailyGoal}) − (learnedVocab + learnedGrammar)`}
                    />
                </div>
                {/* Progress bar */}
                <div className="mt-3 bg-surface/50 rounded-full h-1.5 overflow-hidden border border-glass-border">
                    <div
                        className={`h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700 ${progressClass}`}
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-500">0</span>
                    <span className="text-[10px] text-slate-500">
                        {progressPct}% hoàn thành
                    </span>
                    <span className="text-[10px] text-slate-500">{data.dailyGoal}</span>
                </div>
            </div>

            {/* === PHẦN 4: TỔNG QUAN DB === */}
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400/80 mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                    TỔNG QUAN DATABASE
                </p>
                <div className="bg-surface/40 rounded-2xl px-4 py-1 border border-glass-border">
                    <DebugRow
                        label="Tổng từ trong DB"
                        value={data.totalWords}
                        color="text-foreground"
                        icon="database"
                    />
                    <DebugRow
                        label="Đang hoãn (Inbox)"
                        value={data.deferredWords}
                        color="text-slate-400"
                        icon="inbox"
                        description="isDeferred = true — chưa đưa vào lịch học chính thức"
                    />
                    <DebugRow
                        label="Đang trong lộ trình SRS"
                        value={data.totalWords - data.newWords - data.deferredWords}
                        color="text-teal-400"
                        icon="route"
                        description="interval > 0 — đã học ít nhất 1 lần"
                    />
                </div>
            </div>

            {/* Footer note */}
            <p className="mt-4 text-[10px] text-slate-600 text-center italic">
                Panel này chỉ hiển thị trong môi trường development.
                <br />
                Xem tài liệu chi tiết trong{" "}
                <span className="text-slate-500 font-mono">README.md → Debug Panel</span>.
            </p>
        </div>
    );
}
