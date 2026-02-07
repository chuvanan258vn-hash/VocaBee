# 🐝 VocaBee - Smart Spaced Repetition Vocabulary App

VocaBee là một ứng dụng học từ vựng thông minh dựa trên phương pháp **Spaced Repetition (Lặp lại ngắt quãng)**. Ứng dụng giúp người dùng ghi nhớ từ vựng lâu dài thông qua việc lên lịch ôn tập khoa học và đặt mục tiêu hàng ngày, với giao diện hiện đại và trải nghiệm người dùng cao cấp.

---

## ✨ Điểm nổi bật (Highlights)

- **Giao diện Premium:** Sử dụng phong cách **Glassmorphism** (kính mờ) hiện đại, chiều sâu và sang trọng.
- **Typography tinh tế:** Sử dụng font chữ **Plus Jakarta Sans** – mang lại vẻ ngoài thanh thoát và chuyên nghiệp.
- **Dark Mode & Light Mode:** Hỗ trợ giao diện sáng/tối mượt mà, bảo vệ mắt người dùng.
- **Hiệu ứng sống động:** Các vi tương tác (micro-animations) giúp trải nghiệm học tập trở nên thú vị hơn.

---

## 🛠 Công nghệ sử dụng (Tech Stack)

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS.
- **Backend/Database:** Prisma ORM + PostgreSQL/SQLite.
- **Authentication:** Auth.js (NextAuth) v5.
- **Styling:** Headless UI, Heroicons, Glassmorphism utilities.
- **Font:** Plus Jakarta Sans (Google Fonts).

---

## 🗺 Lộ trình phát triển (Roadmap)

### ✅ Giai đoạn 1: Nền tảng & Đột phá giao diện (Foundation & UI Overhaul)
- [x] Thiết lập dự án Next.js 15 và cấu hình Tailwind CSS.
- [x] Thiết kế Database Schema hoàn chỉnh với Prisma.
- [x] Xây dựng hệ thống Đăng nhập/Đăng ký bảo mật với NextAuth.
- [x] **Nâng cấp giao diện Premium UI/UX:** Triển khai Glassmorphism và tối ưu hóa Typography.
- [x] Hoàn thiện các thành phần cốt lõi: Header, User Menu, Add Word Form, Word List.

### 🏃 Giai đoạn 2: Tính năng cốt lõi & Thuật toán (Core Features & SRS)
- [ ] Triển khai thuật toán **SM-2** (Spaced Repetition) để tính toán lịch trình ôn tập.
- [ ] Xây dựng giao diện **Flashcard Mode** (Lật mặt thẻ) với hiệu ứng mượt mà.
- [ ] Hệ thống đánh giá từ vựng (Dễ, Trung bình, Khó).
- [ ] Tự động lọc danh sách từ vựng "Đã đến hạn ôn tập".

### 📅 Giai đoạn 3: Mục tiêu & Theo dõi (Goals & Analytics)
- [ ] Thiết lập hệ thống **Daily Goal** (Mục tiêu 15 từ/ngày).
- [ ] Xử lý logic **Cộng dồn (Rollover)** cho các từ chưa học.
- [ ] Biểu đồ trực quan theo dõi tiến độ ghi nhớ.

### 🎨 Giai đoạn 4: Hoàn thiện & Mở rộng (Polishing & Extension)
- [ ] Tích hợp Text-to-Speech (Phát âm từ vựng).
- [ ] Hỗ trợ bộ từ vựng mẫu theo chủ đề.
- [ ] Xuất/Nhập dữ liệu (Excel/CSV).

---

## 🧠 Thuật toán Spaced Repetition (SM-2)

Chúng ta sử dụng thuật toán **SM-2** để tối ưu hóa việc ghi nhớ:
- Lần đầu tiên ($n=1$): $I(1) = 1$ ngày.
- Lần thứ hai ($n=2$): $I(2) = 6$ ngày.
- Các lần sau ($n>2$): $I(n) = I(n-1) \times EF$.

**EF (Ease Factor)**: Độ dễ của từ sẽ được điều chỉnh linh hoạt dựa trên phản hồi thực tế của bạn trong quá trình học.

---

## 🚀 Hướng dẫn bắt đầu

1. **Clone project:**
   ```bash
   git clone https://github.com/chuvanan258vn-hash/VocaBee.git
   ```
2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```
3. **Cấu hình môi trường:** Tạo file `.env` và thiết lập `DATABASE_URL` cùng các secret keys cần thiết.
4. **Migration database:**
   ```bash
   npx prisma migrate dev
   ```
5. **Chạy server phát triển:**
   ```bash
   npm run dev
   ```

---
*Phát triển bởi team VocaBee 🐝 – Học tập không giới hạn.*
