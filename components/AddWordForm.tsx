'use client';

import { useState, useEffect } from 'react';
import { addWordAction, checkDuplicateWordAction } from '@/app/actions';
import { useToast } from './ToastProvider';
import { getWordTypeColor, getWordTypeStyles, normalizeWordType } from '@/lib/utils';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';

export default function AddWordForm() {
  const { showToast } = useToast();
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [wordType, setWordType] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [synonyms, setSynonyms] = useState('');
  const [example, setExample] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!term.trim()) { setIsDuplicate(false); return; }
    const timer = setTimeout(async () => {
      setIsChecking(true);
      const res = await checkDuplicateWordAction(term);
      if (res && 'exists' in res) setIsDuplicate(!!res.exists);
      setIsChecking(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [term]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !wordType || !definition.trim()) {
      showToast("Vui lòng điền đầy đủ các thông tin bắt buộc! 🐝", "error");
      return;
    }
    if (isDuplicate) {
      showToast("Từ này đã có rồi, vui lòng kiểm tra lại! 🐝", "error");
      return;
    }
    setLoading(true);
    const result = await addWordAction({ word: term, meaning: definition, wordType, pronunciation: phonetic, synonyms, example });
    if (result?.error) {
      showToast(result.error, "error");
    } else {
      showToast("Đã cất từ vào tổ ong thành công! 🐝", "success");
      setTerm(''); setDefinition(''); setWordType(''); setPhonetic(''); setSynonyms(''); setExample(''); setIsDuplicate(false);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSave} className="p-5 glass-panel rounded-3xl shadow-[var(--shadow-glass)] w-full max-w-4xl transition-all hover:shadow-[var(--shadow-glow)] flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-glass-border"></div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-glow-primary shrink-0">
            <span className="text-sm">🐝</span>
          </div>
          <h2 className="text-sm font-black text-foreground tracking-[0.15em] shrink-0 uppercase text-shadow-gold">THÊM TỪ VỰNG MỚI VÀO TỔ ONG</h2>
        </div>
        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-glass-border"></div>
      </div>

      {/* Hàng 1: Từ vựng & Loại từ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Từ vựng */}
        <div className="space-y-1">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Từ vựng <span className="text-rose-500">*</span>
            </label>
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
              className={`input-premium w-full px-3 py-2 text-foreground ${isDuplicate ? '!border-rose-500 ring-4 ring-rose-500/10' : ''} placeholder:text-slate-400 text-sm font-semibold`}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              required
            />
            {isDuplicate && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 animate-pulse">
                <AlertCircle size={16} />
              </div>
            )}
          </div>
          {isDuplicate && (
            <div className="mt-1 px-2 py-1.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-xl flex items-start gap-2">
              <AlertCircle size={12} className="text-rose-500 mt-0.5 shrink-0" />
              <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                Từ <span className="underline">"{term}"</span> đã có trong tổ ong rồi! 🐝
              </p>
            </div>
          )}
        </div>

        {/* Phân loại từ */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]">
              Phân loại <span className="text-rose-500">*</span>
            </label>
            {wordType && (
              <button type="button" onClick={() => setWordType('')}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-all flex items-center gap-1 group">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">Xóa</span>
                <Trash2 size={11} className="group-hover:rotate-12 transition-transform" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-6 gap-1">
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
                <button key={type.short} type="button" onClick={() => setWordType(type.full)}
                  className={`relative py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden group/btn ${wordType === type.full
                    ? `${styles.bg} shadow-glow-primary ring-2 ${styles.ring}/50`
                    : 'bg-surface dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-amber-200 dark:hover:border-amber-600/30'
                    }`}>
                  <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-10 transition-opacity bg-current" />
                  <span className="relative z-10">{type.short}</span>
                  {wordType === type.full && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                </button>
              );
            })}
          </div>
          {/* Type badge */}
          <div className={`relative h-8 rounded-lg transition-all duration-500 flex items-center justify-center overflow-hidden border-2 ${wordType
            ? `${getWordTypeStyles(wordType).border} shadow-lg`
            : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'}`}>
            {wordType && (
              <>
                <div className={`absolute inset-0 opacity-20 dark:opacity-40 ${getWordTypeColor(wordType)}`} />
                <div className={`absolute inset-0 border-2 rounded-lg opacity-10 ${getWordTypeStyles(wordType).border}`} />
              </>
            )}
            <div className="relative z-10 flex items-center gap-3">
              {wordType ? (
                <>
                  <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${getWordTypeColor(wordType)}`} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                    {normalizeWordType(wordType)}
                  </span>
                  <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${getWordTypeColor(wordType)}`} />
                </>
              ) : (
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 italic">Vui lòng chọn phân loại từ 🐝</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hàng 2: Nghĩa & Ví dụ (side by side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1">
            Nghĩa tiếng Việt <span className="text-rose-500">*</span>
          </label>
          <textarea
            placeholder="Dịch nghĩa chi tiết của từ này..."
            className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400 min-h-[80px] max-h-[110px] resize-none text-sm font-medium"
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1">Ví dụ minh họa</label>
          <textarea
            placeholder="Cách dùng từ trong câu thực tế..."
            className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400 min-h-[80px] max-h-[110px] resize-none text-sm italic"
            value={example}
            onChange={(e) => setExample(e.target.value)}
          />
        </div>
      </div>

      {/* Hàng 3: Phiên âm & Từ đồng nghĩa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1">Phiên âm</label>
          <input type="text" placeholder="/pəˈsɪstəns/"
            className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400 text-sm font-mono"
            value={phonetic} onChange={(e) => setPhonetic(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1">Từ đồng nghĩa</label>
          <input type="text" placeholder="v.d: endurance"
            className="input-premium w-full px-3 py-2 text-foreground placeholder:text-slate-400 text-sm"
            value={synonyms} onChange={(e) => setSynonyms(e.target.value)} />
        </div>
      </div>

      {/* Nút lưu */}
      <button
        type="submit"
        disabled={loading || isDuplicate}
        className={`w-full py-2.5 mt-2 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${loading || isDuplicate
          ? 'bg-slate-300 dark:bg-surface cursor-not-allowed text-slate-500'
          : 'btn-amber text-[#FFFFFF] hover:text-[#FFFFFF]'}`}
      >
        {loading ? (
          <>
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ĐANG CẤT VÀO TỔ...
          </>
        ) : isDuplicate ? 'TỪ ĐÃ TỒN TẠI' : 'LƯU VÀO TỔ ONG 🐝'}
      </button>
    </form>
  );
}
