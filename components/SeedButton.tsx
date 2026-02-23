'use client';

import { useState } from 'react';
import { seedVocabularyAction } from '@/app/actions';

export default function SeedButton() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSeed = async () => {
        setLoading(true);
        setMessage('');
        try {
            const res = await seedVocabularyAction();
            if (res.error) {
                setMessage(res.error);
            } else {
                setMessage(`Đã nạp thành công ${res.count} từ mẫu! 🐝`);
                // Refresh page to show data
                window.location.reload();
            }
        } catch (e) {
            setMessage("Lỗi kết nối.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-yellow-50/50 dark:bg-yellow-900/10 border-2 border-dashed border-yellow-400 rounded-xl max-w-md mx-auto mt-8">
            <div className="text-4xl">🍯</div>
            <div className="text-center">
                <h3 className="font-bold text-lg text-yellow-700 dark:text-yellow-400">Kho từ vựng đang trống?</h3>
                <p className="text-sm text-muted-foreground">Bạn có muốn nạp nhanh 20 từ vựng mẫu (TOEIC/IELTS) để trải nghiệm ngay không?</p>
            </div>

            <button
                onClick={handleSeed}
                disabled={loading}
                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold rounded-full transition-colors disabled:opacity-50"
            >
                {loading ? 'Đang nạp...' : 'Nạp dữ liệu mẫu'}
            </button>

            {message && <p className="text-sm font-medium text-green-600">{message}</p>}
        </div>
    );
}
