// app/settings/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/user';
import Sidebar from '@/components/Sidebar';
import { getDashboardStats } from '@/app/actions';
import { ThemeToggle } from '@/components/ThemeToggle';
import SettingsForm from '@/components/SettingsForm';
import { Settings, Save } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    const user = await getAuthenticatedUser();

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            <Sidebar />

            <main className="flex-1 md:ml-64 relative h-screen overflow-y-auto no-scrollbar bg-background transition-colors">
                {/* Sticky Header */}
                <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-4 sm:px-8 py-5 flex items-center justify-between border-b border-glass-border">
                    <h2 className="text-foreground text-xl font-bold tracking-tight text-shadow-gold italic">Cài đặt hệ thống</h2>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                    </div>
                </header>

                <div className="p-4 sm:p-8 max-w-5xl mx-auto flex flex-col gap-8 pb-24">
                    {/* Title Section */}
                    <div className="flex flex-col gap-2 mb-2">
                        <h1 className="text-foreground text-4xl font-black leading-tight tracking-tight">Cài đặt hiển thị</h1>
                        <p className="text-slate-500 text-sm font-medium">Tùy chỉnh giao diện học tập của bạn để có trải nghiệm tốt nhất.</p>
                    </div>

                    <SettingsForm initialDailyGoal={user?.dailyNewWordGoal || 20} />
                </div>
            </main>
        </div>
    );
}
