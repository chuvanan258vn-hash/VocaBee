'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getSecurityQuestionAction, verifySecurityAnswerAction } from '@/app/actions';

type Step = 'EMAIL' | 'QUESTION' | 'SUCCESS';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>('EMAIL');
    const [email, setEmail] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [resetLink, setResetLink] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setError(null);

        const result = await getSecurityQuestionAction(email);

        if (result.error) {
            setError(result.error);
        } else if (result.success && result.question) {
            setQuestion(result.question);
            setStep('QUESTION');
        }
        setIsPending(false);
    };

    const handleAnswerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setError(null);

        const result = await verifySecurityAnswerAction(email, answer);

        if (result.error) {
            setError(result.error);
        } else if (result.success && result.link) {
            setResetLink(result.link);
            setStep('SUCCESS');
        }
        setIsPending(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 font-sans">
            <div className="w-full max-w-md bg-[#1E293B] rounded-3xl p-8 shadow-2xl border border-white/5">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-yellow-400/20 text-4xl mb-4">
                        {step === 'EMAIL' && '🤔'}
                        {step === 'QUESTION' && '🔐'}
                        {step === 'SUCCESS' && '🎉'}
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2">
                        {step === 'EMAIL' && 'Quên mật khẩu?'}
                        {step === 'QUESTION' && 'Câu hỏi bảo mật'}
                        {step === 'SUCCESS' && 'Xác minh thành công!'}
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {step === 'EMAIL' && 'Nhập email của bạn để bắt đầu khôi phục.'}
                        {step === 'QUESTION' && 'Vui lòng trả lời câu hỏi dưới đây để tiếp tục.'}
                        {step === 'SUCCESS' && 'Bạn có thể đặt lại mật khẩu ngay bây giờ.'}
                    </p>
                </div>

                {step === 'EMAIL' && (
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-slate-300 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="v.d: kien@honey.com"
                                className="w-full bg-[#0F172A] border border-slate-700 text-white rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                            />
                        </div>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2">
                                ⚠️ {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-slate-900 font-black py-4 rounded-xl shadow-lg shadow-yellow-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Đang kiểm tra...' : 'Tiếp tục'}
                        </button>
                    </form>
                )}

                {step === 'QUESTION' && (
                    <form onSubmit={handleAnswerSubmit} className="space-y-6">
                        <div className="bg-yellow-400/5 border border-yellow-400/20 p-4 rounded-2xl">
                            <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-1">CÂU HỎI:</p>
                            <p className="text-white font-medium italic">&ldquo;{question}&rdquo;</p>
                        </div>
                        <div>
                            <label htmlFor="answer" className="block text-sm font-bold text-slate-300 mb-2">
                                Câu trả lời của bạn
                            </label>
                            <input
                                id="answer"
                                name="answer"
                                type="text"
                                required
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Nhập câu trả lời..."
                                className="w-full bg-[#0F172A] border border-slate-700 text-white rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                            />
                        </div>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2">
                                ⚠️ {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-slate-900 font-black py-4 rounded-xl shadow-lg shadow-yellow-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Đang xác minh...' : 'Xác nhận'}
                        </button>
                    </form>
                )}

                {step === 'SUCCESS' && (
                    <div className="space-y-6">
                        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-2xl text-center">
                            <p className="text-sm font-medium mb-4">Mã bảo mật đã được tạo thành công!</p>
                            <Link
                                href={resetLink}
                                className="inline-block w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 text-center"
                            >
                                ĐẶT LẠI MẬT KHẨU NGAY
                            </Link>
                        </div>
                        <p className="text-slate-500 text-[10px] text-center italic">
                            Nếu nút trên không hoạt động, hãy copy link này: <br />
                            <span className="break-all select-all font-mono opacity-50">{resetLink}</span>
                        </p>
                    </div>
                )}

                <div className="mt-8 text-center flex flex-col gap-3">
                    {step !== 'EMAIL' && (
                        <button
                            onClick={() => { setStep('EMAIL'); setError(null); }}
                            className="text-sm font-bold text-slate-500 hover:text-white transition-colors"
                        >
                            Quay lại bước trước
                        </button>
                    )}
                    <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-yellow-400 transition-colors">
                        ← Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div >
    );
}
