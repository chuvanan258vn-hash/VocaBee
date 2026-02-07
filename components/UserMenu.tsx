"use client";

import { LogOut, User } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { useToast } from "./ToastProvider";

interface UserMenuProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default function UserMenu({ user }: UserMenuProps) {
    const { showToast } = useToast();

    const handleSignOut = async () => {
        try {
            await signOutAction();
            showToast("Hẹn gặp lại bạn sớm nhé! 🐝👋", "info");
        } catch (error) {
            showToast("Có lỗi khi đăng xuất.", "error");
        }
    };

    return (
        <div className="flex items-center gap-4 p-1.5 pl-4 pr-1.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
                    {user.name || user.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-yellow-600 dark:text-yellow-500 font-semibold tracking-wide uppercase">Tổ ong 🐝</span>
            </div>

            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-yellow-500/20 overflow-hidden border-2 border-white dark:border-slate-800">
                {user.image ? (
                    <img src={user.image} alt="User avatar" className="h-full w-full object-cover" />
                ) : (
                    <User size={20} />
                )}
            </div>

            <button
                onClick={handleSignOut}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200"
                title="Đăng xuất"
            >
                <LogOut size={20} />
            </button>
        </div>
    );
}
