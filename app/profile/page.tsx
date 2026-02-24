// app/profile/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/user';
import Sidebar from '@/components/Sidebar';
import { getDashboardStats } from '@/app/actions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { User, Mail, Calendar, Award, ShieldCheck, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    const user = await getAuthenticatedUser();
    const stats = await getDashboardStats();

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            <Sidebar />

            <main className="flex-1 md:ml-64 relative h-screen overflow-y-auto no-scrollbar bg-background transition-colors">
                {/* Sticky Header */}
                <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-4 sm:px-8 py-5 flex items-center justify-between border-b border-glass-border">
                    <h2 className="text-foreground text-xl font-bold tracking-tight text-shadow-gold">Hồ sơ cá nhân</h2>
                    <ThemeToggle />
                </header>

                <div className="p-4 sm:p-8 max-w-4xl mx-auto flex flex-col gap-8 pb-24">
                    {/* Profile Header Card */}
                    <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 border border-glass-border shadow-soft relative overflow-hidden flex flex-col items-center text-center gap-6">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20"></div>

                        <div className="relative mt-8">
                            <div className="w-32 h-32 rounded-full bg-surface border-4 border-background ring-4 ring-primary/30 shadow-glow flex items-center justify-center text-5xl overflow-hidden">
                                👤
                            </div>
                            <div className="absolute bottom-1 right-1 bg-primary text-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                                <Award className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="z-10">
                            <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">{session.user?.name}</h1>
                            <p className="text-primary font-bold uppercase tracking-widest text-xs">Học giả vàng 🐝</p>
                        </div>

                        <div className="grid grid-cols-3 gap-8 w-full max-w-lg mt-4 z-10 border-t border-glass-border pt-8">
                            <div>
                                <p className="text-2xl font-black text-foreground tracking-tight">{stats?.streak || 0}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ngày liên tiếp</p>
                            </div>
                            <div className="border-x border-glass-border">
                                <p className="text-2xl font-black text-foreground tracking-tight">{(stats?.points || 0).toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Điểm tích lũy</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-foreground tracking-tight">{stats?.totalWords || 0}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Từ vựng</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Information Section */}
                        <div className="glass-panel rounded-3xl p-8 border border-glass-border shadow-soft">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Thông tin tài khoản
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-surface/50 border border-glass-border flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</p>
                                        <p className="text-sm font-medium text-foreground">{session.user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-surface/50 border border-glass-border flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ngày gia nhập</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : '---'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-surface/50 border border-glass-border flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bảo mật</p>
                                        <p className="text-sm font-medium text-foreground">Xác thực 2 lớp (Tắt)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity/Badges */}
                        <div className="glass-panel rounded-3xl p-8 border border-glass-border shadow-soft flex flex-col">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Award className="w-5 h-5 text-primary" />
                                Huy chương đã đạt
                            </h3>
                            <div className="grid grid-cols-2 gap-4 flex-1">
                                {[
                                    { name: 'Khởi đầu mới', icon: '🌱' },
                                    { name: 'Ong chăm chỉ', icon: '🐝' },
                                    { name: 'Học giả vàng', icon: '📜' },
                                    { name: 'Kẻ hủy diệt', icon: '🔥' },
                                ].map((badge, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-surface/30 border border-glass-border grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-default group">
                                        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">{badge.icon}</span>
                                        <span className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest leading-tight">{badge.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
