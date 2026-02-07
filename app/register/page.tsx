import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#fdfcf4] dark:bg-[#0f172a] transition-colors">
            <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                <RegisterForm />
            </div>
        </main>
    );
}
