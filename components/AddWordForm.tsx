'use client';

import { useState, useEffect } from 'react';
import { addWordAction, checkDuplicateWordAction } from '@/app/actions';
import { useToast } from './ToastProvider';
import { getWordTypeColor, getWordTypeStyles, normalizeWordType } from '@/lib/utils';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';

export default function AddWordForm() {
  const { showToast } = useToast();
  // 1. Khai báo các state cho form
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [wordType, setWordType] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [synonyms, setSynonyms] = useState('');
  const [example, setExample] = useState('');

  // States for duplicate check
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // 2. Trạng thái loading
  const [loading, setLoading] = useState(false);

  // Real-time duplicate check with debounce
  useEffect(() => {
    if (!term.trim()) {
      setIsDuplicate(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      const res = await checkDuplicateWordAction(term);
      if (res && 'exists' in res) {
        setIsDuplicate(!!res.exists);
      }
      setIsChecking(false);
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [term]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDuplicate) {
      showToast("Từ này đã có rồi, vui lòng kiểm tra lại! 🐝", "error");
      return;
    }
    setLoading(true);

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
      showToast(result.error, "error");
    } else {
      showToast("Đã cất từ vào tổ ong thành công! 🐝", "success");
      setTerm('');
      setDefinition('');
      setWordType('');
      setPhonetic('');
      setSynonyms('');
      setExample('');
      setIsDuplicate(false);
    }

    setLoading(false);
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
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Từ vựng</label>
            {isChecking && (
              <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold animate-pulse">
                <Loader2 size={10} className="animate-spin" /> Đang kiểm tra...
              </div>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="v.d: Persistence"
              className={`w-full p-3 bg-white dark:bg-slate-800/50 border ${isDuplicate ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 dark:border-slate-700'} text-slate-900 dark:text-white rounded-2xl focus:ring-4 ${isDuplicate ? 'focus:ring-rose-500/20 focus:border-rose-500' : 'focus:ring-yellow-400/20 focus:border-yellow-400'} outline-none transition-all placeholder:text-slate-400 text-sm font-semibold`}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              required
            />
            {isDuplicate && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 animate-pulse">
                <AlertCircle size={20} />
              </div>
            )}
          </div>
          {isDuplicate && (
            <div className="mt-2 p-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
              <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                Từ <span className="underline">"{term}"</span> đã có trong tổ ong rồi! 🐝 Bạn hãy kiểm tra lại nhé.
              </p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Phân loại từ vựng</label>
            {wordType && (
              <button
                type="button"
                onClick={() => setWordType('')}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-all flex items-center gap-1.5 group"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">Xóa chọn</span>
                <Trash2 size={12} className="group-hover:rotate-12 transition-transform" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { short: 'N', full: 'Noun' },
              { short: 'V', full: 'Verb' },
              { short: 'ADJ', full: 'Adjective' },
              { short: 'ADV', full: 'Adverb' },
              { short: 'PHR', full: 'Phrase' },
              { short: 'IDM', full: 'Idiom' }
            ].map((type) => {
              const styles = getWordTypeStyles(type.short);
              return (
                <button
                  key={type.short}
                  type="button"
                  onClick={() => setWordType(type.full)}
                  className={`relative py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden group/btn ${wordType === type.full
                    ? `${styles.bg} shadow-lg shadow-current/30 ring-2 ${styles.ring}/30`
                    : 'bg-slate-100 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 border border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                    }`}
                >
                  <div className={`absolute inset-0 opacity-0 group-hover/btn:opacity-10 transition-opacity bg-current`} />
                  <span className="relative z-10">{type.short}</span>
                  {wordType === type.full && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Type Display Badge */}
          <div className={`relative h-16 rounded-2xl transition-all duration-500 flex items-center justify-center overflow-hidden border-2 shadow-sm ${wordType
            ? `${getWordTypeStyles(wordType).border} shadow-lg`
            : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'
            }`}>
            {wordType && (
              <>
                <div className={`absolute inset-0 opacity-20 dark:opacity-40 ${getWordTypeColor(wordType)}`} />
                <div className={`absolute inset-0 border-2 rounded-2xl opacity-10 dark:opacity-20 ${getWordTypeStyles(wordType).border}`} style={{ backgroundColor: 'transparent' }} />
              </>
            )}

            <div className="relative z-10 flex items-center gap-5">
              {wordType ? (
                <>
                  <div className={`h-2 w-2 rounded-full animate-pulse ${getWordTypeColor(wordType)} shadow-[0_0_10px_currentColor]`} />
                  <span className={`text-sm font-black uppercase tracking-[0.25em] drop-shadow-sm ${wordType ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                    }`}>
                    {normalizeWordType(wordType)}
                  </span>
                  <div className={`h-2 w-2 rounded-full animate-pulse ${getWordTypeColor(wordType)} shadow-[0_0_10px_currentColor]`} />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-slate-400 dark:text-slate-600 italic tracking-[0.1em]">
                    Vui lòng chọn phân loại từ
                  </span>
                  <span className="animate-bounce-slow">🐝</span>
                </div>
              )}
            </div>
          </div>
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
        disabled={loading || isDuplicate}
        className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${loading || isDuplicate ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500' : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-yellow-500/20 scale-100 hover:scale-[1.02] active:scale-[0.98]'
          }`}
      >
        {loading ? (
          <>
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ĐANG CẤT VÀO TỔ...
          </>
        ) : isDuplicate ? 'TỪ ĐÃ TỒN TẠI' : 'LƯU VÀO TỔ ONG 🐝'}
      </button>
    </form>
  );
}
