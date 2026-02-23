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

## 🗄️ Cấu trúc Cơ sở dữ liệu (Database Schema)

Dự án sử dụng SQLite thông qua Prisma ORM. Dưới đây là chi tiết các bảng và ý nghĩa từng cột:

### 1. Bảng `User` (Người dùng)
Lưu trữ thông tin tài khoản và tiến độ tổng quát.
- `id`: Mã định danh duy nhất (UUID).
- `email`: Địa chỉ email dùng để đăng nhập (duy nhất).
- `password`: Mật khẩu đã được mã hóa (Bcrypt).
- `name`: Tên hiển thị của người dùng.
- `dailyNewWordGoal`: Mục tiêu số từ mới cần học mỗi ngày.
- `streakCount`: Số ngày học liên tiếp hiện tại (Chuỗi streak).
- `lastGoalMetDate`: Ngày gần nhất người dùng đạt mục tiêu hàng ngày (dùng để kiểm tra và duy trì/reset streak).
- `points`: Tổng số điểm "Mật ngọt" (🍯) tích lũy được từ việc học.
- `streakFreeze`: Số lượng vật phẩm đóng băng streak đang sở hữu.
- `securityQuestion / Answer`: Câu hỏi và câu trả lời bảo mật dùng để khôi phục mật khẩu.

### 2. Bảng `Vocabulary` (Từ vựng)
Trái tim của hệ thống SRS, lưu trữ dữ liệu học tập của từng từ.
- `word`: Từ vựng (không trùng lặp đối với cùng một người dùng).
- `wordType`: Loại từ (Danh từ, Động từ, Tính từ, v.v.).
- `meaning`: Nghĩa tiếng Việt của từ.
- `pronunciation`: Phiên âm quốc tế.
- `example`: Ví dụ minh họa cách dùng từ.
- `importanceScore`: Điểm độ quan trọng (0-4), được tính toán tự động khi capture từ bài Test.
- `source`: Nguồn gốc từ (`COLLECTION` - tự thêm, hoặc `TEST` - từ bài thi).
- `isDeferred`: Nếu là `true`, từ này nằm trong "Inbox" và chưa được đưa vào lịch học chính thức.
- **Các trường SRS (SM-2 Algorithm):**
  - `nextReview`: Thời điểm (ngày/giờ) từ này sẽ hiện lên để ôn tập lại.
  - `interval`: Khoảng cách ngày giữa lần ôn tập này và lần trước đó.
  - `repetition`: Số lần bạn đã nhớ từ này liên tiếp (bị reset về 0 nếu chọn "Quên").
  - `efactor`: Hệ số dễ (Ease Factor) - thể hiện độ khó của từ, giá trị này thay đổi dựa trên đánh giá của bạn (Dễ/Khó).

### 3. Bảng `GrammarCard` (Ngữ pháp)
Tương tự như từ vựng nhưng tối ưu cho việc luyện cấu trúc câu.
- `type`: Loại bài tập (`CLOZE` - điền từ, `MCQ` - trắc nghiệm, `PRODUCTION` - viết câu, v.v.).
- `prompt`: Nội dung câu hỏi hoặc đề bài.
- `answer`: Đáp án chính xác.
- `options`: Danh sách các lựa chọn (đối với bài trắc nghiệm).
- `hint`: Gợi ý khi người dùng gặp khó khăn.
- `explanation`: Giải thích chi tiết về điểm ngữ pháp đó.
- `tags`: Nhãn phân loại (Thì, Câu bị động, Cụm động từ, v.v.).

---

## 📊 Logic hiển thị Thống kê (Dashboard Logic)

Để giúp bạn hiểu rõ các con số hiển thị trên Dashboard, dưới đây là logic tính toán chi tiết từ mã nguồn:

### 1. Lộ trình ngày (Daily Progress)
- **Mục tiêu:** Lấy từ thiết lập `dailyNewWordGoal` của người dùng (mặc định là 20).
- **Đã hoàn thành:** Đếm số lượng từ vựng có sự thay đổi (`updatedAt`) kể từ **4:00 sáng** hôm nay.
  - Bao gồm các từ đã học (`interval > 0`).
  - Bao gồm cả những từ vừa bị đánh dấu là "Quên" (vừa được học lại trong phiên hiện tại).

### 2. Tổng vựng (Total Words)
- Là tổng số lượng bản ghi trong bảng `Vocabulary` thuộc về tài khoản của bạn.

### 3. Cần ôn tập (Due Reviews)
Đây là con số quan trọng nhất của hệ thống SRS. Một từ được tính là "Cần ôn tập" khi thỏa mãn đồng thời 2 điều kiện:
1. **Đã từng học:** Từ đó đã có dữ liệu học tập (`interval > 0`). Điều này bao gồm cả những từ bạn đã thuộc và cả những từ bạn **lỡ quên** (ngay cả khi `repetition` bị reset về 0).
2. **Đến hạn:** Thời điểm `nextReview` trong database nhỏ hơn hoặc bằng thời điểm hiện tại.

> [!TIP]
> **Sự khác biệt giữa Từ mới và Từ quên:**
> - **Từ mới (New Words):** Là những từ có `interval = 0`. Đây là những từ bạn chưa bao giờ nhấn nút "Bắt đầu" để học.
> - **Từ đã học nhưng quên:** Là những từ có `interval > 0` nhưng `repetition = 0`. Những từ này **vẫn được tính** vào mục "Cần ôn tập" vì chúng đã nằm trong lộ trình học của bạn.

### ⚡ Tối ưu hiệu năng (Performance Optimization)
Để đảm bảo ứng dụng luôn mượt mà khi số lượng từ vựng lớn:
- **Phân trang (Lazy Loading):** Danh sách từ vựng ban đầu chỉ tải **20 từ** mới nhất.
- **Tải thêm (Load More):** Khi kéo xuống cuối, bạn có thể nhấn nút 🐝 để tải tiếp các từ vựng cũ hơn. Việc này giúp giảm tải cho server và trình duyệt của bạn.

---

## 🛠 Cách mở và xem Database (Prisma Studio)
Để mở và xem cơ sở dữ liệu (database) của dự án VocaBee, cách đơn giản và trực quan nhất là sử dụng Prisma Studio. Đây là giao diện web đi kèm với công cụ Prisma mà dự án đang dùng.

Cách 1: Sử dụng Prisma Studio (Khuyên dùng)
Bạn hãy mở một Terminal mới (hoặc dùng terminal hiện tại nếu đang rảnh) và chạy lệnh sau:

bash
npx prisma studio
Kết quả:

Một cửa sổ trình duyệt sẽ tự động mở tại địa chỉ http://localhost:5555.
Bạn sẽ thấy danh sách các bảng như 
User
 (Người dùng), 
Vocabulary
 (Từ vựng), 
GrammarCard
 (Ngữ pháp).
Click vào bảng Vocabulary để xem tất cả từ vựng bạn đã thêm, cùng với các thông số SRS như efactor, repetition, và nextReview.
---

## 🗺 Lộ trình phát triển (Roadmap)

### ✅ Giai đoạn 1: Nền tảng & Đột phá giao diện (Foundation & UI Overhaul)
- [x] Thiết lập dự án Next.js 15 và cấu hình Tailwind CSS.
- [x] Thiết kế Database Schema hoàn chỉnh với Prisma.
- [x] Xây dựng hệ thống Đăng nhập/Đăng ký bảo mật với NextAuth.
- [x] **Nâng cấp giao diện Premium UI/UX:** Triển khai Glassmorphism và tối ưu hóa Typography.
- [x] Hoàn thiện các thành phần cốt lõi: Header, User Menu, Add Word Form, Word List.

### ✅ Giai đoạn 2: Tính năng cốt lõi & Thuật toán (Core Features & SRS)
- [x] Triển khai thuật toán **SM-2** (Spaced Repetition) để tính toán lịch trình ôn tập.
- [x] Xây dựng giao diện **Flashcard Mode** (Lật mặt thẻ) với hiệu ứng mượt mà.
- [x] Hệ thống đánh giá từ vựng (Dễ, Trung bình, Khó).
- [x] Tự động lọc danh sách từ vựng "Đã đến hạn ôn tập".

### 🏃 Giai đoạn 3: Trải nghiệm người dùng & Tiện ích (UX & Utilities)
- [x] **Hỗ trợ Phát âm (Text-to-Speech):** Tích hợp giọng đọc tự động cho từ vựng.
- [x] **Tìm kiếm & Lọc:** Tìm kiếm từ vựng và lọc theo loại từ (màu sắc).
- [x] **Nhập/Xuất Dữ liệu:** Hỗ trợ file Excel/CSV (Import/Export).

### 📅 Giai đoạn 4: Mục tiêu & Phân tích (Goals & Analytics)
- [x] **Thống kê (Dashboard):** Biểu đồ trực quan theo dõi tiến độ ghi nhớ và số lượng từ đã thuộc.
- [x] **Mục tiêu Hàng ngày:** Thiết lập và theo dõi mục tiêu học tập hàng ngày.
- [ ] **Thông báo nhắc nhở:** Nhắc người dùng ôn tập khi đến hạn.

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
