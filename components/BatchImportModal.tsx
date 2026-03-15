"use client";

import { useState } from "react";
import { X, ClipboardList, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { importWordsAction, checkWordsExistenceAction } from "@/app/actions";
import { useToast } from "./ToastProvider";
import { getWordTypeStyles, normalizeWordType } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatchImportModal({ isOpen, onClose, onSuccess }: BatchImportModalProps) {
  const [text, setText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewItems, setPreviewItems] = useState<any[]>([]);
  const { showToast } = useToast();

  const parseBatchText = (rawText: string) => {
    // Try JSON format first
    try {
      const parsedJson = JSON.parse(rawText);
      if (Array.isArray(parsedJson)) {
        const items: any[] = [];
        parsedJson.forEach(item => {
          if (item.word) {
            // Optional: combine purpose and context into meaning if context/meaning are empty,
            // but for JSON, they are usually explicitly provided as keys.
            // We'll map them directly.
            let combinedMeaning = item.meaning || "";
            if (item.purpose) combinedMeaning += (combinedMeaning ? "\n" : "") + `Sử dụng cho mục đích: ${item.purpose}`;
            // Context is now stored in the context field directly, no need to merge unless context is missing in DB 
            items.push({
              word: item.word.trim(),
              pronunciation: item.pronunciation || item.phonetic || "",
              wordType: item.wordType || item.type || "",
              meaning: combinedMeaning.trim(),
              synonyms: item.synonyms || "",
              example: item.example || "",
              context: item.context || ""
            });
          }
        });
        if (items.length > 0) return items;
      }
    } catch (e) {
      // Fallback to legacy text parsing if JSON parsing fails
      console.log("Not a valid JSON array, falling back to text parsing.");
    }

    // Legacy text parsing fallback
    const lines = rawText.split("\n").map(l => l.trim());
    const items: any[] = [];
    
    let currentItem: any = null;
    let currentMeaning = "";
    let purpose = "";
    let context = "";

    const finalizeItem = () => {
      if (currentItem && currentItem.word) {
        let combinedMeaning = currentMeaning;
        if (purpose) combinedMeaning += (combinedMeaning ? "\n" : "") + `Sử dụng cho mục đích: ${purpose}`;
        // Note: For legacy parsing, we will map context string to context field, but we can also append it to meaning 
        // if we choose. Since we added 'context' field to DB, we should just assign it to currentItem.context
        currentItem.meaning = combinedMeaning;
        currentItem.context = context;

        if (currentItem.meaning) {
          items.push(currentItem);
        }
      }
    };

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();

      if (lowerLine.startsWith("từ vựng:")) {
        finalizeItem();
        currentItem = {
          word: line.split(":")[1]?.trim(),
          pronunciation: "",
          wordType: "",
          meaning: "",
          synonyms: "",
          example: "",
          context: ""
        };
        currentMeaning = "";
        purpose = "";
        context = "";
      } else if (currentItem) {
        if (lowerLine.startsWith("phiên âm:")) {
          currentItem.pronunciation = line.split(":")[1]?.trim();
        } else if (lowerLine.startsWith("loại từ:")) {
          currentItem.wordType = line.split(":")[1]?.trim();
        } else if (lowerLine.startsWith("nghĩa tiếng việt:")) {
          currentMeaning = line.split(":")[1]?.trim();
        } else if (lowerLine.startsWith("sử dụng cho mục đích:")) {
          purpose = line.split(":")[1]?.trim();
        } else if (lowerLine.startsWith("ngữ cảnh:")) {
          context = line.split(":")[1]?.trim();
        } else if (lowerLine.startsWith("từ đồng nghĩa:")) {
          currentItem.synonyms = line.split(":")[1]?.trim();
        } else if (lowerLine.startsWith("ví dụ:")) {
          currentItem.example = line.split(":")[1]?.trim();
        }
      }
    });

    finalizeItem();
    return items;
  };

  const handleParse = async () => {
    if (!text.trim()) {
      showToast("Vui lòng nhập văn bản để xử lý.", "error");
      return;
    }
    setIsParsing(true);
    try {
      const parsedItems = parseBatchText(text);
      if (parsedItems.length === 0) {
        showToast("Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra lại định dạng.", "error");
        setIsParsing(false);
        return;
      }

      // Check existence on server
      const wordNames = parsedItems.map(item => item.word);
      const res = await checkWordsExistenceAction(wordNames);

      if (res.error) {
        showToast(res.error, "error");
        setIsParsing(false);
        return;
      }

      const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

      const existingMap = new Map();
      res.existingWords?.forEach((w: any) => {
        existingMap.set(normalize(w.word), w);
      });

      const enrichedItems = parsedItems.map(item => {
        const existing = existingMap.get(normalize(item.word));
        return {
          ...item,
          isUpdate: !!existing,
          existingData: existing
        };
      });

      setPreviewItems(enrichedItems);
      showToast(`Đã nhận diện được ${enrichedItems.length} từ vựng! 🐝`, "success");
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi xử lý dữ liệu.", "error");
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (previewItems.length === 0) return;

    setIsImporting(true);
    try {
      const res = await importWordsAction(previewItems);
      if (res.success) {
        showToast(`Đã nhập thành công ${res.successCount} từ! 🍯`, "success");
        onSuccess();
        onClose();
        setText("");
        setPreviewItems([]);
      } else {
        showToast(res.error || "Lỗi khi nhập dữ liệu.", "error");
      }
    } catch (err) {
      showToast("Lỗi kỹ thuật khi lưu.", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const renderDiff = (label: string, newVal: string, oldVal?: string) => {
    const cleanOld = oldVal?.trim() || "";
    const cleanNew = newVal?.trim() || "";
    
    if (!cleanNew) return null;
    
    const isChanged = cleanOld && cleanOld !== cleanNew;

    return (
      <div className="pt-1">
        <span className="text-[10px] font-black text-amber-500 uppercase shrink-0 mt-0.5">{label}: </span>
        {isChanged ? (
          <span className="text-xs">
            <span className="text-slate-400 line-through mr-1">{cleanOld}</span>
            <span className="text-primary font-bold">→ {cleanNew}</span>
          </span>
        ) : (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{cleanNew}</span>
        )}
      </div>
    );
  };

  const handleClose = () => {
    setText("");
    setPreviewItems([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] glass dark:bg-slate-900 border-glass-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-glass-border flex items-center justify-between bg-white/50 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
              <ClipboardList size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Nhập văn bản (Batch)</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-0.5">AI Text Processor</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-400"
            title="Đóng"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
          {previewItems.length === 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black text-slate-500 uppercase tracking-tight">Dán văn bản vào đây</label>
                <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md uppercase">Hỗ trợ format AI Toeic</span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Dán JSON Array vào đây...&#10;vd: [{&#10;  &quot;word&quot;: &quot;Hello&quot;,&#10;  &quot;wordType&quot;: &quot;Noun&quot;,&#10;  &quot;meaning&quot;: &quot;Xin chào&quot;&#10;}]&#10;&#10;Hoặc dán theo định dạng văn bản thường:&#10;Từ vựng: Hello&#10;Nghĩa tiếng Việt: Xin chào"
                className="w-full h-80 input-premium p-6 font-mono text-sm resize-none focus:ring-amber-500/30 dark:text-white"
              />
              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-blue-500 shrink-0" size={20} />
                <p className="text-xs font-bold text-blue-500/80 leading-relaxed">
                  Tip: Bạn có thể dán một mảng (Array) gồm nhiều object JSON. Hệ thống cũng giữ nguyên khả năng phân tích dạng văn bản chữ (vd: <i>Từ vựng: ...</i>).
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-500 uppercase tracking-tight">Bản xem trước ({previewItems.length} mục)</h4>
                <button 
                  onClick={() => setPreviewItems([])}
                  className="text-xs font-bold text-amber-500 hover:underline"
                >
                  Quay lại chỉnh sửa text
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {previewItems.map((item, idx) => (
                  <div key={idx} className={`p-5 bg-white dark:bg-white/5 border ${item.isUpdate ? 'border-primary/30' : 'border-glass-border'} rounded-3xl space-y-3 relative group overflow-hidden`}>
                    {item.isUpdate && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-[#0F172A] text-[9px] font-black uppercase rounded-bl-xl shadow-sm">
                        Cập nhật
                      </div>
                    )}
                    {!item.isUpdate && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-green-500 text-white text-[9px] font-black uppercase rounded-bl-xl shadow-sm">
                        Thêm mới
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-black text-slate-800 dark:text-white">{item.word}</span>
                      <span className={`px-2 py-0.5 ${getWordTypeStyles(item.wordType).bg} text-white text-[9px] font-black rounded-lg uppercase`}>
                        {normalizeWordType(item.wordType)}
                      </span>
                    </div>

                    {renderDiff("Phiên âm", item.pronunciation, item.existingData?.pronunciation)}
                    {renderDiff("Nghĩa", item.meaning, item.existingData?.meaning)}
                    {renderDiff("Đồng nghĩa", item.synonyms, item.existingData?.synonyms)}
                    {renderDiff("Ngữ cảnh", item.context, item.existingData?.context)}
                    {renderDiff("Ví dụ", item.example, item.existingData?.example)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* Footer */}
        <div className="px-8 py-6 border-t border-glass-border bg-slate-50/50 dark:bg-white/5 flex items-center justify-end gap-4">
          <button
            onClick={handleClose}
            className="px-6 py-3 font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase text-xs tracking-widest"
          >
            Hủy bỏ
          </button>
          
          {previewItems.length === 0 ? (
            <button
              onClick={handleParse}
              disabled={isParsing || !text.trim()}
              className="btn-amber px-8 py-4 flex items-center gap-3 disabled:opacity-50 disabled:grayscale cursor-pointer"
            >
              {isParsing ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
              <span className="uppercase text-xs tracking-widest font-black">Kiểm tra dữ liệu</span>
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="btn-amber px-10 py-4 flex items-center gap-3 shadow-glow-primary cursor-pointer"
            >
              {isImporting ? <Loader2 size={20} className="animate-spin" /> : <div className="text-xl">🍯</div>}
              <span className="uppercase text-xs tracking-widest font-black">Lưu vào tổ ong</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
