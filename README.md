This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# 📚 VocabMaster - Spaced Repetition Web App

VocabMaster là một ứng dụng học từ vựng thông minh dựa trên phương pháp **Spaced Repetition (Lặp lại ngắt quãng)**. Ứng dụng giúp người dùng ghi nhớ từ vựng lâu dài thông qua việc lên lịch ôn tập khoa học và đặt mục tiêu hàng ngày.

## 🛠 Công nghệ sử dụng (Tech Stack)
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS.
- **Backend/Database:** SQLite (Local Database) + Prisma ORM.
- **Algorithm:** SM-2 (SuperMemo-2) cho việc tính toán lịch trình ôn tập.

---

## 🗺 Lộ trình phát triển (Roadmap)

### Giai đoạn 1: Nền tảng & Thiết lập (Foundation)
- [ ] Thiết lập dự án Next.js và cấu hình Tailwind CSS.
- [ ] Kết nối dự án với **Supabase**.
- [ ] Thiết kế Database Schema (Bảng `flashcards` và `user_stats`).
- [ ] Xây dựng hệ thống Đăng nhập/Đăng ký đơn giản.

### Giai đoạn 2: Tính năng cốt lõi (Core Features)
- [ ] **Thêm từ vựng:** Form cho phép user nhập Từ mới và Định nghĩa(check từ vựng đã được thêm trước đó hay chưa, nếu có rồi thông báo ko add vào table).
- [ ] **Danh sách từ vựng:** Hiển thị tất cả từ đã thêm.
- [ ] **Hệ thống Filter:** Tự động lọc ra các từ "Đã đến hạn ôn tập" (`next_review <= Today`).

### Giai đoạn 3: Bộ não SRS (The SRS Brain)
- [ ] Triển khai thuật toán **SM-2** bằng TypeScript.
- [ ] Xây dựng giao diện **Flashcard Mode** (Lật mặt thẻ).
- [ ] Xử lý logic đánh giá:
    - `Dễ`: Tăng khoảng cách ôn tập lớn.
    - `Trung bình`: Tăng khoảng cách vừa phải.
    - `Khó/Quên`: Đặt lịch ôn lại vào ngày mai.

### Giai đoạn 4: Mục tiêu & Tiến độ (Daily Goals)
- [ ] Thiết lập hệ thống **Daily Goal** (Mục tiêu 15 từ/ngày).
- [ ] Xử lý logic **Cộng dồn (Rollover)**: Các từ chưa học ngày hôm trước sẽ được dồn vào danh sách hôm nay.
- [ ] Biểu đồ theo dõi tiến độ học tập đơn giản.

### Giai đoạn 5: Hoàn thiện & UI/UX (Polishing)
- [ ] Thêm hiệu ứng chuyển động (Framer Motion) khi lật thẻ.
- [ ] Hỗ trợ chế độ Dark Mode.
- [ ] Tối ưu giao diện trên thiết bị di động.

---

## 🧠 Thuật toán Spaced Repetition (SM-2)

Chúng ta sẽ sử dụng công thức sau để tính toán khoảng cách ($I$):
- Lần đầu tiên ($n=1$): $I(1) = 1$ ngày.
- Lần thứ hai ($n=2$): $I(2) = 6$ ngày.
- Các lần sau ($n>n$): $I(n) = I(n-1) \times EF$.

Trong đó **EF** (Ease Factor) là độ dễ của từ, được điều chỉnh dựa trên đánh giá của người dùng.
