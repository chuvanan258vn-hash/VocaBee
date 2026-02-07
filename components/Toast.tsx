"use client";

import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = "success", onClose, duration = 2000 }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Wait for fade-out animation
    };

    const icons = {
        success: <CheckCircle className="text-green-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
    };

    const colors = {
        success: "border-green-500/50 bg-green-50 dark:bg-green-900/20",
        error: "border-red-500/50 bg-red-50 dark:bg-red-900/20",
        info: "border-blue-500/50 bg-blue-50 dark:bg-blue-900/20",
    };

    return (
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 p-4 pr-10 rounded-xl border shadow-2xl transition-all duration-300 transform ${isExiting ? "opacity-0 translate-y-2 scale-95" : "opacity-100 translate-y-0 scale-100 animate-in slide-in-from-right-10"
            } ${colors[type]}`}>
            {icons[type]}
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {message}
            </p>
            <button
                onClick={handleClose}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close"
            >
                <X size={16} />
            </button>
        </div>
    );
}
