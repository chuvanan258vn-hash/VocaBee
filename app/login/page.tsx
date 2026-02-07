import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background transition-colors">
            <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                <LoginForm />
            </div>
        </main>
    );
}
