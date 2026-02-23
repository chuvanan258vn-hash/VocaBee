'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Correct import for App Router
import Link from 'next/link';
import { resetPasswordAction } from '@/app/actions';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    if (!token) {
        return (
            <div className="text-center text-red-400">
                <p>Token không hợp lệ hoặc bị thiếu.</p>
                <Link href="/forgot-password" className="text-yellow-400 hover:underline mt-4 block">
                    Yêu cầu lại
                </Link>
            </div>
        );
    }

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true);
        setError(null);
        setSuccess(null);

        const result = await resetPasswordAction(token, formData);

        if (result.error) {
            setError(result.error);
        } else if (result.success) {
            setSuccess(result.success);
            // Optional: redirect after delay
        }
        setIsPending(false);
    };

    return (
        <>
            <form action={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="password" className="block text-sm font-bold text-slate-300 mb-2">
                        Mật khẩu mới
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full bg-[#0F172A] border border-slate-700 text-white rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-300 mb-2">
                        Xác nhận mật khẩu
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full bg-[#0F172A] border border-slate-700 text-white rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    />
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2">
                        ⚠️ {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-sm p-3 rounded-xl flex items-center gap-2">
                        ✅ {success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-slate-900 font-black py-4 rounded-xl shadow-lg shadow-yellow-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                </button>
            </form>

            <div className="mt-8 text-center">
                <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-yellow-400 transition-colors">
                    ← Quay lại đăng nhập
                </Link>
            </div>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 font-sans">
            <div className="w-full max-w-md bg-[#1E293B] rounded-3xl p-8 shadow-2xl border border-white/5">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-yellow-400/20 text-4xl mb-4">
                        🔑
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2">Đặt lại mật khẩu</h1>
                    <p className="text-slate-400 text-sm">
                        Nhập mật khẩu mới cho tài khoản của bạn.
                    </p>
                </div>
                <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
