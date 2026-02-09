"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, FileSpreadsheet } from "lucide-react";
import { parseGrammarCSV } from "@/lib/utils";
import { importGrammarCardsAction } from "@/app/actions";
import { useToast } from "./ToastProvider";

export default function ImportGrammarButton() {
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const cards = parseGrammarCSV(text);

            if (cards.length === 0) {
                showToast("File không hợp lệ hoặc thiếu thông tin bắt buộc (type, prompt, answer).", "error");
                setIsImporting(false);
                return;
            }

            const res = await importGrammarCardsAction(cards);
            if (res.error) {
                showToast(res.error, "error");
            } else {
                showToast(`Đã nhập thành công ${res.successCount} thẻ ngữ pháp! 🐝✨ (${res.failCount} lỗi)`, "success");
            }
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/20 transition-all border border-emerald-500/20 disabled:opacity-50"
            >
                {isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                {isImporting ? "Đang xử lý..." : "Import CSV Ngữ Pháp"}
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".csv"
                className="hidden"
            />
        </div>
    );
}
