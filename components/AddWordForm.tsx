'use client';

import { useState } from 'react';
import { addWordAction } from '@/app/actions';
import { useToast } from './ToastProvider';

export default function AddWordForm() {
  const { showToast } = useToast();
  // 1. Khai báo các state cho form
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [wordType, setWordType] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [synonyms, setSynonyms] = useState('');
  const [example, setExample] = useState('');

  // 2. ĐÂY LÀ CHỖ BẠN THIẾU: Khai báo trạng thái loading
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Bắt đầu xử lý

    // Gom dữ liệu gửi đi
    const formData = {
      word: term,
      meaning: definition,
      wordType: wordType,
      pronunciation: phonetic,
      synonyms,
      example,
    };

    const result = await addWordAction(formData);

    if (result?.error) {
      // Thông báo nếu từ đã tồn tại hoặc lỗi khác
      showToast(result.error, "error");
    } else {
      showToast("Đã cất từ vào tổ ong thành công! 🐝", "success");
      // Reset form sau khi lưu thành công
      setTerm('');
      setDefinition('');
      setWordType('');
      setPhonetic('');
      setSynonyms('');
      setExample('');
    }

    setLoading(false); // Kết thúc xử lý
  };

  return (
    <form onSubmit={handleSave} className="p-8 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-2xl space-y-6 border border-white/20 dark:border-slate-700/50 w-full max-w-4xl transition-all hover:shadow-yellow-500/5">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700/50"></div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20 animate-bounce-slow">
            <span className="text-2xl">🐝</span>
          </div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-[0.2em] shrink-0 uppercase">THÊM TỪ VỰNG MỚI VÀO TỔ ONG</h2>
        </div>
        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700/50"></div>
      </div>

      {/* Hàng 1: Từ vựng & Loại từ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Từ vựng</label>
          <input
            type="text"
            placeholder="v.d: Persistence"
            className="w-full p-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all placeholder:text-slate-400 text-sm font-semibold"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Loại từ</label>
          <input
            type="text"
            placeholder="n, v, adj..."
            className="w-full p-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all placeholder:text-slate-400 text-sm"
            value={wordType}
            onChange={(e) => setWordType(e.target.value)}
          />
        </div>
      </div>

      {/* Hàng 2: Phiên âm & Từ đồng nghĩa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Phiên âm</label>
          <input
            type="text"
            placeholder="/pəˈsɪstəns/"
            className="w-full p-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all placeholder:text-slate-400 text-sm font-mono"
            value={phonetic}
            onChange={(e) => setPhonetic(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Từ đồng nghĩa</label>
          <input
            type="text"
            placeholder="v.d: endurance"
            className="w-full p-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all placeholder:text-slate-400 text-sm"
            value={synonyms}
            onChange={(e) => setSynonyms(e.target.value)}
          />
        </div>
      </div>

      {/* Nghĩa tiếng Việt */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Nghĩa tiếng Việt</label>
        <textarea
          placeholder="Dịch nghĩa chi tiết của từ này..."
          className="w-full p-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all placeholder:text-slate-400 min-h-[80px] resize-none text-sm font-medium"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          required
        />
      </div>

      {/* Ví dụ */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Ví dụ minh họa</label>
        <textarea
          placeholder="Cách dùng từ trong câu thực tế..."
          className="w-full p-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all placeholder:text-slate-400 min-h-[80px] resize-none text-sm italic"
          value={example}
          onChange={(e) => setExample(e.target.value)}
        />
      </div>

      {/* Nút lưu */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${loading ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500' : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-yellow-500/20 scale-100 hover:scale-[1.02] active:scale-[0.98]'
          }`}
      >
        {loading ? (
          <>
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ĐANG CẤT VÀO TỔ...
          </>
        ) : 'LƯU VÀO TỔ ONG 🐝'}
      </button>
    </form>
  );
}