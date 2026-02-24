// app/settings/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/user';
import Sidebar from '@/components/Sidebar';
import { getDashboardStats } from '@/app/actions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Settings, Bell, Lock, Eye, Globe, LogOut, Save } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
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
                    <h2 className="text-foreground text-xl font-bold tracking-tight text-shadow-gold italic">Cài đặt hệ thống</h2>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 bg-primary text-black font-bold text-xs px-4 py-2 rounded-xl shadow-glow hover:bg-amber-300 transition-all">
                            <Save className="w-4 h-4" />
                            LƯU THAY ĐỔI
                        </button>
                        <ThemeToggle />
                    </div>
                </header>

                <div className="p-4 sm:p-8 max-w-5xl mx-auto flex flex-col gap-8 pb-24">
                    {/* Title Section */}
                    <div className="flex flex-col gap-2 mb-2">
                        <h1 className="text-foreground text-4xl font-black leading-tight tracking-tight">Cài đặt hiển thị</h1>
                        <p className="text-slate-500 text-sm font-medium">Tùy chỉnh giao diện học tập của bạn để có trải nghiệm tốt nhất.</p>
                    </div>

                    {/* Section 1: Interface Theme */}
                    <section className="glass-panel rounded-[32px] p-8 border border-glass-border shadow-soft bg-surface/20">
                        <h3 className="text-foreground tracking-tight text-xl font-black leading-tight pb-8 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-[28px]">palette</span>
                            Giao diện hệ thống
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Light Option */}
                            <div className="group cursor-pointer relative">
                                <div className="bg-slate-50 border-2 border-primary rounded-2xl overflow-hidden aspect-video shadow-glow-primary relative transition-all hover:scale-[1.02]">
                                    <div className="absolute inset-x-0 top-0 h-4 bg-slate-200"></div>
                                    <div className="p-4 space-y-2">
                                        <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                                        <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
                                        <div className="h-10 w-full bg-white rounded border border-slate-100 mt-2"></div>
                                    </div>
                                    <div className="absolute bottom-3 right-3 text-primary">
                                        <span className="material-symbols-outlined filled text-[24px]">check_circle</span>
                                    </div>
                                </div>
                                <p className="text-foreground text-center font-black mt-4 uppercase tracking-widest text-xs">Chế độ sáng</p>
                            </div>
                            {/* Dark Option */}
                            <div className="group cursor-pointer relative">
                                <div className="bg-[#0B1221] border-2 border-transparent hover:border-slate-700 transition-all rounded-2xl overflow-hidden aspect-video relative hover:scale-[1.02]">
                                    <div className="absolute inset-x-0 top-0 h-4 bg-[#050912]"></div>
                                    <div className="p-4 space-y-2">
                                        <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                                        <div className="h-2 w-1/2 bg-slate-800 rounded"></div>
                                        <div className="h-10 w-full bg-slate-800/50 rounded border border-slate-700 mt-2"></div>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-center font-bold mt-4 uppercase tracking-widest text-xs group-hover:text-foreground">Chế độ tối</p>
                            </div>
                            {/* Auto Option */}
                            <div className="group cursor-pointer relative">
                                <div className="bg-gradient-to-br from-slate-50 via-slate-400 to-[#0B1221] border-2 border-transparent hover:border-slate-500 transition-all rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center hover:scale-[1.02]">
                                    <span className="material-symbols-outlined text-5xl text-white/50">brightness_auto</span>
                                </div>
                                <p className="text-slate-500 text-center font-bold mt-4 uppercase tracking-widest text-xs group-hover:text-foreground">Tự động</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Text Customization */}
                    <section className="glass-panel rounded-[32px] p-8 border border-glass-border shadow-soft bg-surface/20">
                        <h3 className="text-foreground tracking-tight text-xl font-black leading-tight pb-8 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-[28px]">text_fields</span>
                            Tùy chỉnh văn bản
                        </h3>
                        <div className="flex flex-col gap-10">
                            {/* Font Size Slider */}
                            <div className="flex flex-col gap-6">
                                <div className="flex justify-between items-center">
                                    <label className="text-foreground font-bold text-base flex items-center gap-2">
                                        Kích thước chữ
                                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">Mặc định</span>
                                    </label>
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Trung bình (100%)</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-sm font-black text-slate-500">Aa</span>
                                    <div className="relative w-full h-3 bg-surface border border-glass-border rounded-full group cursor-pointer">
                                        <div className="absolute top-0 left-0 h-full w-1/2 bg-primary rounded-full shadow-glow"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 size-7 bg-white border-4 border-primary rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95"></div>
                                    </div>
                                    <span className="text-2xl font-black text-foreground">Aa</span>
                                </div>
                            </div>

                            <hr className="border-glass-border opacity-50" />

                            {/* Glow Effects Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex gap-5">
                                    <div className="size-12 bg-amber-500/10 rounded-2xl text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                                        <span className="material-symbols-outlined text-[28px] filled">lightbulb</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-foreground font-bold text-base">Hiệu ứng phát sáng</span>
                                        <span className="text-slate-500 text-xs mt-1">Tăng cường phản hồi hình ảnh trong lúc học</span>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer" title="Bật/Tắt Hiệu ứng phát sáng">
                                    <input checked readOnly className="sr-only peer" type="checkbox" title="Bật/Tắt Hiệu ứng phát sáng" />
                                    <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:rounded-full after:h-[21px] after:w-[21px] after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Accessibility */}
                    <section className="glass-panel rounded-[32px] p-8 border border-glass-border shadow-soft bg-surface/20">
                        <h3 className="text-foreground tracking-tight text-xl font-black leading-tight pb-8 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-[28px]">accessibility_new</span>
                            Hỗ trợ tiếp cận
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button className="flex items-center justify-between p-6 rounded-2xl border border-glass-border bg-surface/40 hover:border-primary/50 hover:bg-surface/60 transition-all group">
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors text-[24px]">contrast</span>
                                    <span className="text-foreground font-bold group-hover:text-primary transition-colors">Độ tương phản cao</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-primary opacity-50 text-[32px]">toggle_off</span>
                            </button>
                            <button className="flex items-center justify-between p-6 rounded-2xl border border-glass-border bg-surface/40 hover:border-primary/50 hover:bg-surface/60 transition-all group">
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors text-[24px]">motion_photos_off</span>
                                    <span className="text-foreground font-bold group-hover:text-primary transition-colors">Giảm chuyển động</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-600 group-hover:text-primary opacity-50 text-[32px]">toggle_off</span>
                            </button>
                        </div>
                    </section>

                    {/* Section 4: Mission & Language (Legacy Consolidated) */}
                    <section className="glass-panel rounded-[32px] p-8 border border-glass-border shadow-soft bg-surface/20">
                        <h3 className="text-foreground tracking-tight text-xl font-black leading-tight pb-8 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-[28px]">settings_accessibility</span>
                            Cài đặt học tập
                        </h3>
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold text-foreground">Ngôn ngữ hiển thị</p>
                                    <p className="text-xs text-slate-500">Chọn ngôn ngữ bạn muốn sử dụng trên giao diện.</p>
                                </div>
                                <select
                                    title="Chọn ngôn ngữ hiển thị"
                                    className="bg-surface border border-glass-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none min-w-[200px]"
                                >
                                    <option>Tiếng Việt</option>
                                    <option>English</option>
                                </select>
                            </div>

                            <hr className="border-glass-border opacity-50" />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold text-foreground">Mục tiêu từ mới hàng ngày</p>
                                    <p className="text-xs text-slate-500">Số lượng từ vựng mới hệ thống sẽ gợi ý cho bạn mỗi ngày.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        defaultValue={user?.dailyNewWordGoal || 20}
                                        title="Số lượng từ mới hàng ngày"
                                        placeholder="20"
                                        className="w-24 bg-surface border border-glass-border rounded-xl px-4 py-3 text-center font-black text-primary focus:ring-2 focus:ring-primary/50 outline-none text-lg"
                                    />
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">TỪ</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="text-center mt-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] opacity-50">VocaBee Engine v2.4.0 • Golden Amber Edition</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
