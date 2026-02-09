"use client";

import { useState } from "react";
import { seedGrammarCardsAction } from "@/app/actions";
import { useToast } from "./ToastProvider";
import { Database } from "lucide-react";

export default function SeedGrammarButton() {
    const [isSeeding, setIsSeeding] = useState(false);
    const { showToast } = useToast();

    const handleSeed = async () => {
        setIsSeeding(true);
        const result = await seedGrammarCardsAction();
        setIsSeeding(false);

        if (result.success) {
            showToast(`Đã tạo thành công ${result.count} thẻ ngữ pháp mẫu! 🐝✨`, "success");
        } else {
            showToast(result.error || "Lỗi khi nạp dữ liệu.", "error");
        }
    };

    return (
        <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold rounded-xl hover:bg-purple-500/20 transition-all border border-purple-500/20 disabled:opacity-50"
        >
            <Database size={16} />
            {isSeeding ? "Đang nạp..." : "Nạp Grammar mẫu"}
        </button>
    );
}
