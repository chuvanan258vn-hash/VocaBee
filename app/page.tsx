// app/page.tsx
import { auth } from '@/auth';
import AddWordForm from '@/components/AddWordForm';
import WordList from '@/components/WordList';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();

  // Bảo vệ route: Nếu chưa login thì về trang login
  if (!session) {
    redirect('/login');
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background dark:bg-background transition-colors font-sans px-4 pb-20">
      {/* Sticky Header */}
      <header className="sticky top-4 z-50 w-full max-w-5xl glass rounded-2xl flex justify-between items-center p-3 px-6 shadow-xl mb-12 mt-4 mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐝</span>
          <span className="text-xl font-extrabold tracking-tighter bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">VocaBee</span>
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
      </div>

      <AddWordForm />

      <WordList />
    </main>
  );
}