// app/page.tsx
import { auth } from '@/auth';
import AddWordForm from '@/components/AddWordForm';
import WordList from '@/components/WordList';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();

  // Bảo vệ route: Nếu chưa login thì về trang login
  if (!session) {
    redirect('/login');
  }

  // Lấy các từ đến hạn ôn tập (Trước 4:00 sáng mai)
  const now = new Date();
  // Nếu bây giờ là sau nửa đêm nhưng trước 4 sáng, vẫn tính là "ngày hôm trước"
  // (Giúp cú đêm ôn nốt bài)
  now.setHours(23, 59, 59, 999);

  const user = await prisma.user.findUnique({ where: { email: session.user?.email || "" } });

  let dueCount = 0;
  if (user) {
    dueCount = await prisma.vocabulary.count({
      where: { userId: user.id, nextReview: { lte: now } }
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background dark:bg-background transition-colors font-sans px-4 pb-20">
      {/* Sticky Header */}
      <header className="sticky top-4 z-50 w-full max-w-5xl glass rounded-2xl flex justify-between items-center p-3 px-6 shadow-xl mb-12 mt-4 mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐝</span>
            <span className="text-xl font-extrabold tracking-tighter bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">VocaBee</span>
          </div>
          <button
            title="Tính năng phát âm (Sắp ra mắt)"
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-yellow-500 transition-all cursor-help"
          >
            <span className="text-lg">🔊</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu user={session.user as any} />
        </div>
      </header>

      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-yellow-500 dark:text-yellow-400 flex items-center justify-center gap-3 tracking-tight animate-bounce-slow">
          VocaBee <span className="text-4xl">🐝</span>
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-4 text-xl font-medium max-w-md mx-auto leading-relaxed">
          "Mỗi ngày 15 từ, ghi nhớ vạn hành trình."
        </p>

        {/* Nút Ôn tập (Hiện khi có từ đến hạn) */}
        {dueCount > 0 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link
              href="/review"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-black rounded-2xl shadow-2xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all group"
            >
              <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <span className="text-2xl">📖</span>
              </div>
              <div className="text-left">
                <p className="text-xs text-white/80 uppercase tracking-widest font-bold">Nhiệm vụ ôn tập</p>
                <p className="text-lg">Bạn có {dueCount} từ cần học lại</p>
              </div>
              <span className="ml-4 text-xl">→</span>
            </Link>
          </div>
        )}
      </div>

      <AddWordForm />

      <WordList />
    </main>
  );
}