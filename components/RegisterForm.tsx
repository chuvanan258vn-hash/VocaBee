'use client';

import { useActionState } from 'react';
import { register } from '@/app/lib/actions';
import { useFormStatus } from 'react-dom';

export default function RegisterForm() {
    const [errorMessage, dispatch] = useActionState(register, undefined);

    return (
        <form action={dispatch} className="w-full">
            <div className="flex-1 rounded-3xl glass p-8 shadow-2xl space-y-6 transition-all border border-white/20 dark:border-slate-700/50">
                <div className="flex flex-col items-center gap-2 mb-6 text-center">
                    <div className="h-12 w-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 animate-bounce-slow">
                        <span className="text-2xl">🐝</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight mt-2">
                        Tạo tài khoản mới
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Gia nhập cộng đồng VocaBee ngay hôm nay</p>
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
                                className="w-full p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-green-400/20 focus:border-green-500 outline-none transition-all placeholder:text-slate-400"
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
                            htmlFor="name"
                        >
                            Tên hiển thị (Tùy chọn)
                        </label>
                        <div className="relative">
                            <input
                                className="w-full p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-green-400/20 focus:border-green-500 outline-none transition-all placeholder:text-slate-400"
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Nhập tên của bạn"
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
                                className="w-full p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-green-400/20 focus:border-green-500 outline-none transition-all placeholder:text-slate-400"
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="pt-4 space-y-4 border-t border-slate-100 dark:border-slate-700/50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Bảo mật tài khoản</p>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-300 ml-1" htmlFor="securityQuestion">
                                Câu hỏi bảo mật (Để khôi phục mật khẩu)
                            </label>
                            <input
                                className="w-full p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-green-400/20 focus:border-green-500 outline-none transition-all placeholder:text-slate-400"
                                id="securityQuestion"
                                name="securityQuestion"
                                placeholder="v.d: Tên con vật đầu tiên của bạn?"
                                required
                                minLength={3}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-300 ml-1" htmlFor="securityAnswer">
                                Câu trả lời
                            </label>
                            <input
                                className="w-full p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-green-400/20 focus:border-green-500 outline-none transition-all placeholder:text-slate-400"
                                id="securityAnswer"
                                name="securityAnswer"
                                placeholder="Nhập câu trả lời..."
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex flex-col gap-4">
                    <RegisterButton />

                    <div className="text-center">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Đã có tài khoản? </span>
                        <a href="/login" className="text-sm text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-bold transition-colors">Đăng nhập</a>
                    </div>
                </div>

                <div
                    className="flex h-6 items-end space-x-1 justify-center"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {errorMessage && (
                        <p className={`text-xs font-bold px-4 py-1.5 rounded-full border ${errorMessage === 'success'
                            ? 'text-green-600 bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/20'
                            : 'text-red-500 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20'
                            }`}>
                            {errorMessage === 'success' ? 'Đăng ký thành công! Đang chuyển hướng...' : errorMessage}
                        </p>
                    )}
                </div>
            </div>
        </form>
    );
}

function RegisterButton() {
    const { pending } = useFormStatus();

    return (
        <button
            className={`w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-500/20 transition-all scale-100 flex items-center justify-center gap-2 ${pending ? 'grayscale cursor-not-allowed opacity-70' : 'hover:scale-[1.02] active:scale-[0.98]'
                }`}
            aria-disabled={pending}
            disabled={pending}
        >
            {pending ? (
                <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ĐANG XỬ LÝ...
                </>
            ) : 'ĐĂNG KÝ NGAY 🐝'}
        </button>
    );
}
