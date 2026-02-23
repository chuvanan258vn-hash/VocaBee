'use client';

import { useActionState } from 'react'; // or useFormState depending on Next.js version
import { authenticate } from '@/app/lib/actions';

export default function LoginForm() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <form action={dispatch} className="w-full">
            <div className="flex-1 rounded-3xl glass p-8 shadow-2xl space-y-6 transition-all border border-white/20 dark:border-slate-700/50">
                <div className="flex flex-col items-center gap-2 mb-6 text-center">
                    <div className="h-12 w-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20 animate-bounce-slow">
                        <span className="text-2xl">🐝</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight mt-2">
                        Chào mừng bạn trở lại!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Đăng nhập vào VocaBee tổ ong của bạn</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label
                            className="text-sm font-bold text-slate-600 dark:text-slate-300 ml-1"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <input
                                className="w-full p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all placeholder:text-slate-400"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="v.d: kien@honey.com"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label
                            className="text-sm font-bold text-slate-600 dark:text-slate-300 ml-1"
                            htmlFor="password"
                        >
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                className="w-full p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all placeholder:text-slate-400"
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex flex-col gap-4">
                    <button className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-yellow-500/20 transition-all scale-100 hover:scale-[1.02] active:scale-[0.98]" aria-disabled={false}>
                        Đăng nhập 🐝
                    </button>

                    <div className="text-center">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Chưa có tài khoản? </span>
                        <a href="/register" className="text-sm text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 font-bold transition-colors">Đăng ký ngay</a>
                    </div>
                </div>

                <div
                    className="flex h-6 items-end space-x-1 justify-center"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {errorMessage && (
                        <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full border border-red-200 dark:border-red-500/20">{errorMessage}</p>
                    )}
                </div>
                <div className="flex justify-end">
                    <a href="/forgot-password" className="text-xs font-bold text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 transition-colors">
                        Quên mật khẩu?
                    </a>
                </div>
            </div>
        </form>
    );
}
