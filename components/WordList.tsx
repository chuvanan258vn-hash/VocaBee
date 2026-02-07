import { prisma } from '@/lib/prisma';
import WordItem from './WordItem';

export default async function WordList() {
  const words = await prisma.vocabulary.findMany({ orderBy: { createdAt: 'desc' } });

  if (!words || words.length === 0)
    return <div className="p-10 text-center text-gray-500">Tổ ong đang trống... 🐝</div>;


  return (
    <div className="mt-16 space-y-6 w-full max-w-4xl px-2">
      <div className="flex items-center gap-4 mb-2">
        <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Danh sách từ vựng</h3>
        <span className="px-3 py-1 bg-yellow-400 text-white text-sm font-black rounded-full shadow-lg shadow-yellow-500/20">{words.length}</span>
      </div>
      <div className="grid gap-6 w-full">
        {words.map((item) => (
          <WordItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
