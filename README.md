# 🐝 VocaBee - Smart Spaced Repetition Vocabulary App

VocaBee là một ứng dụng học từ vựng thông minh dựa trên phương pháp **Spaced Repetition (Lặp lại ngắt quãng)**. Ứng dụng giúp người dùng ghi nhớ từ vựng lâu dài thông qua việc lên lịch ôn tập khoa học và đặt mục tiêu hàng ngày, với giao diện hiện đại và trải nghiệm người dùng cao cấp.

---

## ✨ Điểm nổi bật (Highlights)

- **Giao diện Premium & Accessibility:** Sử dụng phong cách **Glassmorphism** (kính mờ) hiện đại, chiều sâu và sang trọng, đồng thời tuân thủ các tiêu chuẩn **a11y** (accessibility) để mọi người dùng đều có thể tiếp cận dễ dàng.
- **Typography tinh tế:** Sử dụng font chữ **Plus Jakarta Sans** – mang lại vẻ ngoài thanh thoát và chuyên nghiệp.
- **Dark Mode & Light Mode:** Hỗ trợ giao diện sáng/tối mượt mà, bảo vệ mắt người dùng.
- **Hiệu ứng sống động:** Các vi tương tác (micro-animations) giúp trải nghiệm học tập trở nên thú vị hơn.

---

## 🃏 Tính năng Ôn tập qua Flashcard (Flashcard Mode)

Flashcard là cốt lõi của trải nghiệm học tập trên VocaBee. Khi đến phiên ôn tập (Review Session), hệ thống sẽ đưa ra các thẻ từ vựng với các tính năng sau:
- **Lật thẻ 3D (3D Flip Animation):** Mặt trước hiển thị từ, mặt sau hiển thị phiên âm, nghĩa tiếng Việt và ví dụ minh họa bằng hiệu ứng lật mượt mà.
- **Phát âm tự động (Text-to-Speech):** Hỗ trợ đọc từ vựng ngay khi lật thẻ và đính kèm nút phát âm lại ở mặt sau để rèn luyện kỹ năng nghe.
- **Đánh giá mức độ nhớ (4 Levels - Anki-style):** Sau khi lật thẻ, bạn chọn 1 trong 4 mức độ để hệ thống lên lịch:
  - **Quên mất (Again):** Không nhớ từ, thẻ sẽ quay lại hàng đợi học lại ngay lập tức (< 1 phút).
  - **Khó nhớ (Hard):** Nhớ một chút, khoảng cách tăng chậm (1.2x).
  - **Nhớ được (Good):** Mức độ ổn định, khoảng cách tăng theo hệ số Ease Factor chuẩn.
  - **Nhớ ngay (Easy):** Từ quá quen thuộc, nhận thêm Bonus khoảng cách (nhảy vọt ngay lập tức) để đẩy lùi lịch ôn tập ra xa.
- **Thanh Tiến độ (Progress tracking):** Hệ thống review session sẽ hiển thị thanh biểu diễn (Progress bar) cho bạn biết mình đã hoàn thành bao nhiêu thẻ và còn lại bao nhiêu thẻ.
- **Chế độ Nhập liệu (Typing / Active Recall Mode):** Hệ thống sẽ hiển thị ngẫu nhiên các thẻ yêu cầu người dùng tự gõ lại từ vựng dựa trên định nghĩa (thay vì lật thẻ).
  - **Gợi ý Thông minh (Smart Hint):** Hỗ trợ hiển thị pattern chữ cái thông minh (ví dụ: `H _ _ _ _ d   o _ _` cho "Headed out"). Hệ thống tự động nhận diện cụm từ, hiển thị chữ cái đầu của mỗi từ và thêm các điểm gợi ý dựa trên độ dài từ, giúp kích thích gợi nhớ tối đa.
  - **Phản hồi Sinh động:** Hiệu ứng **Confetti** vui nhộn khi gõ đúng và **Shake animation** (rung lắc) khi gõ sai, mang lại cảm giác chinh phục.
  - **Tự động Phát âm (TTS):** Máy sẽ tự động đọc từ vựng ngay khi kết quả lộ diện (dù gõ đúng hay chọn xem đáp án) để rèn luyện kỹ năng nghe song song.
  - **Loại từ Trực quan:** Hiển thị Badge loại từ (Noun, Verb, Adj...) ngay trên thẻ để bổ sung dữ kiện ghi nhớ quan trọng.
  - **Hệ thống Điểm thưởng (Typing Bonus):** Khi người dùng gõ đúng hoàn toàn mà **không sử dụng Hint**, hệ thống sẽ tặng thêm **+1 điểm** tích lũy (Tổng +3) và cộng thêm chỉ số **Ease Factor** giúp từ vựng đó được giãn lịch ôn tập tối ưu hơn. Một Badge "Stars" sẽ xuất hiện để vinh danh nỗ lực này.
  - **Logic Bỏ qua Thông minh:** Khi chọn "Xem đáp án", hệ thống tự động đánh dấu là "Quên mất" (Forgot) và chuyển sang giao diện ôn tập lại chuyên biệt với nút "Tiếp tục ôn tập" mượt mà.


---

## 📓 Sổ tay lỗi sai (Mistake Notebook)

Tính năng **Mistake Notebook** là công cụ mạnh mẽ dành cho người học TOEIC (đặc biệt Part 5, 6, 7) để biến những câu làm sai thành bài học sâu sắc:
- **Lưu lỗi sai tức thì (Minimal Capture):** Giao diện nhập liệu tối giản chỉ yêu cầu 3 thông tin cốt lõi: Câu hỏi gốc, Đáp án đúng và Lý do tại sao bạn sai.
- **Phân tích chuyên sâu (Advanced Analysis):** Hỗ trợ lưu trữ các thông tin "Cái bẫy" (Trap), "Quy tắc vàng" (Golden Rule) và giải nghĩa chi tiết để tránh lặp lại sai lầm.
- **Tích hợp SM-2:** Các câu hỏi trong sổ tay lỗi sai sẽ được đưa vào lịch ôn tập giống như các thẻ ngữ pháp/từ vựng khác, giúp bạn ghi nhớ quy tắc và sửa lỗi triệt để.
- **Giao diện Ôn tập Premium:** Khi ôn tập thẻ Mistake, hệ thống hiển thị phân tích lỗi sai với màu sắc và biểu tượng trực quan (Rose for Errors, Amber for Golden Rules), giúp kích thích tư duy phản biện.

---

## ➕ Tính năng Thêm Từ vựng & Ngữ pháp (Add Content)

Ứng dụng cung cấp công cụ linh hoạt để bạn dễ dàng làm giàu vốn từ vựng của mình:
- **Thêm Từ Thủ công (Manual Entry):** Điền đầy đủ thông tin từ vựng bao gồm: Từ, Loại từ (Danh từ, Cụm danh từ, Cụm tính từ, Động từ, Cụm động từ, Tính từ...), Nghĩa, Phiên âm, Ví dụ và Từ đồng nghĩa.
- **Dịch Nhanh thông minh (Smart Capture):** Cho phép bạn copy một đoạn văn bản (đặc biệt hữu dụng khi đọc tin tức tiếng Anh), công cụ Smart Capture sẽ tự động dịch, trích xuất các từ quan trọng (khó/mới) để bạn có thể thêm ngay vào bộ sưu tập.
- **Cơ chế Inbox/Deferred:** Nếu bạn chưa có thời gian học ngay, các từ vựng mới thêm có thể được đẩy vào "Hộp thư đến" (Inbox/Deferred) để chờ bạn đưa ra quyết định bắt đầu học vào một thời điểm thích hợp, tránh làm loãng danh sách cần ôn tập hàng ngày.
- **Nhập/Xuất Dữ liệu (Dự kiến):** Trong tương lai, ứng dụng hỗ trợ tải lên file danh sách từ vựng từ Excel/CSV.

---

## 🏗 Kiến trúc Hệ thống & Trách nhiệm Files (System Architecture)

Dự án VocaBee được xây dựng trên nền tảng **Next.js 15 (App Router)**, kết hợp cùng **Prisma ORM** và **Tailwind CSS**. Dưới đây là kiến trúc tổng quan và vai trò của từng thư mục, file quan trọng trong hệ thống:

### 1. `app/` - Routing & Pages (App Router Next.js)
Đây là trái tim của hệ thống định tuyến (Routing). Mỗi thư mục con bên trong tương ứng với một đường dẫn trên trình duyệt.

- **`app/page.tsx`**: Trang Dashboard chính (Trang chủ). Hiển thị tổng quan tiến độ, số lượng từ cần ôn tập, biểu đồ hoạt động và Debug Panel.
- **`app/layout.tsx`**: Root Layout bao bọc toàn bộ ứng dụng, cấu hình font chữ (Plus Jakarta Sans), Theme Provider, Toast Provider và metadata toàn cục.
- **`app/globals.css`**: File CSS chứa các thiết lập toàn cục và các utility classes của Tailwind CSS.
- **`app/api/`**: Nơi chứa các API Routes (Backend logic), xử lý các request từ client khi không sử dụng Server Actions.
- **`app/(auth)/` (login, register, forgot-password, reset-password)**: Các trang liên quan đến phần luồng xác thực người dùng.
- **`app/review/`**: Trang Khởi tạo Phiên Ôn Tập (Review Session).
- **`app/vocabulary/`**: Trang quản lý Danh sách từ vựng (Word List).
- **`app/inbox/`**: Trang chứa các từ vựng đang tạm hoãn (Deferred Words), chưa được đưa vào lịch ôn tập.
- **`app/leaderboard/`**: Trang Bảng xếp hạng.
- **`app/profile/`**: Trang thông tin Cập nhật Hồ sơ cá nhân.
- **`app/settings/`**: Trang Cài đặt ứng dụng (Mục tiêu hàng ngày, Chủ đề, Giao diện).
- **`app/stats/`**: Trang Thống kê chi tiết tiến trình học.

### 2. `components/` - Giao diện & Các thành phần tái sử dụng (UI Components)
Nơi chứa toàn bộ React Components được module hóa để sử dụng ở nhiều nơi.

- **`ReviewSession.tsx`**: Component xử lý luồng ôn tập từ vựng, tính toán logic tiến trình học (Progress bar) và quản lý trạng thái của từng flashcard.
- **`Flashcard.tsx` & `GrammarFlashcard.tsx`**: Giao diện thẻ ghi nhớ (mặt trước/mặt sau) hỗ trợ 3D Flip animations, nút phát âm Tiếng Anh và các nút đánh giá hiệu quả học (Dễ, Trung bình, Khó).
- **`AddWordForm.tsx` & `AddGrammarForm.tsx`**: Form thêm từ vựng và ngữ pháp mới vào cơ sở dữ liệu.
- **`WordList.tsx` & `WordItem.tsx`**: Danh sách quản lý từ vựng, hỗ trợ bộ lọc và chỉnh sửa nhanh.
- **`Dashboard.tsx` & `DashboardWidgets.tsx`**: Component hiển thị thông tin thống kê tiến độ trên trang chủ.
- **`Sidebar.tsx`**: Thanh điều hướng bên trái (Navigation Menu).
- **`SmartCaptureDialog.tsx`**: Công cụ dịch nhanh/mở rộng, cho phép capture từ mới nhanh chóng từ mọi nơi trong ứng dụng.
- **`SrsDebugPanel.tsx`**: Bảng điều khiển ẩn hỗ trợ dành riêng cho môi trường Development để thẽo dõi logic SM-2 ở trang chủ.

### 3. `lib/` - Thư viện & Logic tiện ích (Utilities & Core Logic)
Chứa các function và module xử lý logic lõi không phụ thuộc vào giao diện.

- **`sm2.ts`**: **Quan trọng nhất!** Chứa thuật toán Spaced Repetition (SM-2 Algorithm). File này xử lý việc trả về `nextReview`, `interval`, `repetition` và `efactor` mới sau mỗi lần người dùng ôn tập từ.
- **`db.ts` & `prisma.ts`**: Cấu hình và tạo ra Singleton instance cho Prisma Client để thao tác với DataBase.
- **`user.ts`**: Các hàm truy vấn database liên quan đến thông tin người dùng (Lấy user by email, by ID...).
- **`utils.ts`**: Các hàm hỗ trợ, ví dụ: ghép nối chuỗi CSS (`cn` - clsx/tailwind-merge), format số, format ngày tháng.
- **`tokens.ts`**: Logic sinh chuỗi mã thông báo (tokens) bảo mật dùng cho việc Reset Password.
- **`mail.ts`**: Hàm gửi email (gửi link reset password, thông báo, v.v.).

### 4. `prisma/` - Database Layer (Cơ sở dữ liệu)
- **`schema.prisma`**: Tệp định nghĩa toàn bộ mô hình dữ liệu (Data models) của ứng dụng. Tham chiếu trực tiếp tới cấu trúc database chuẩn được biên dịch qua Prisma Client.

### 5. `scripts/` - Công cụ kịch bản (Automation & Dev Tools)
Tập hợp các file script chạy độc lập phục vụ nhu cầu Debug hoặc cron-jobs.

- **`debug-streak.ts` / `update-goal.ts` / `verify_gamification.ts`**: Script liên quan tới hệ thống Chuỗi Ngày Học (Streak) và Điểm thưởng (Gamification).

### 6. Cấu hình & Root Files
- **`auth.ts` & `auth.config.ts`**: Cấu hình NextAuth.js (Auth.js v5) dùng để bảo mật ứng dụng, mã hóa mật khẩu, session strategies và định nghĩa các providers đăng nhập (Credentials).
- **`middleware.ts`**: File Middleware của Next.js, đứng ở cửa ngõ kiểm tra quyền truy cập của các Request. Nếu người dùng chưa đăng nhập, tự động đẩy về trang Login; hoặc ngăn người dùng đã đăng nhập vào các trang xác thực.

---

## 🤖 Hướng dẫn cho AI Agent (AI Agent Guidelines)

Để đảm bảo tính nhất quán trong quá trình phát triển tự động, các AI Agent khi tham gia chỉnh sửa mã nguồn cần tuân thủ:
- **Skill thiết kế**: Đọc kỹ file [.agents/vocaBeeSkill.md](file:///.agents/vocaBeeSkill.md) trước khi thực hiện bất kỳ thay đổi nào liên quan đến giao diện (UI/UX).
- **Skill SM-2**: Tuân thủ [.agents/sm2Skill.md](file:///.agents/sm2Skill.md) khi làm việc với logic ôn tập và thuật toán ghi nhớ.
- **Skill Thêm Từ vựng**: Xem [.agents/addWordSkill.md](file:///.agents/addWordSkill.md) để đảm bảo quy trình nhập liệu và validate dữ liệu chuẩn xác.
- **Skill Git Push**: Khi đẩy code, tuân thủ [.agents/gitPushSkill.md](file:///.agents/gitPushSkill.md) để viết Commit Message chuẩn quốc tế (Conventional Commits) và đảm bảo an toàn repository.
- **Quy tắc Task**: Luôn cập nhật tiến độ vào `brain/task.md` và ghi nhận thay đổi vào `README.md` ngay lập tức.
- **Tiêu chuẩn UI**: Tuyệt đối sử dụng các Design Tokens trong `globals.css` (Glass, Amber, Premium Input/Button) để duy trì phong cách **Ethereal Flow**.

---

## 🗄️ Cấu trúc Cơ sở dữ liệu (Database Schema)

Dự án sử dụng SQLite (phát triển) / PostgreSQL (Sản xuất) thông qua Prisma ORM. Dưới đây là chi tiết các bảng và ý nghĩa từng cột:

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

### 2. Bảng `Vocabulary` (Từ vựng)
Trái tim của hệ thống SRS, lưu trữ dữ liệu học tập của từng từ.
- `word`: Từ vựng (không trùng lặp đối với cùng một người dùng).
- `meaning`: Nghĩa tiếng Việt của từ.
- `pronunciation`: Phiên âm quốc tế.
- `importanceScore`: Điểm độ quan trọng (0-4), được tính toán tự động.
- `source`: Nguồn gốc từ (`COLLECTION` - tự thêm, hoặc `TEST` - từ bài thi).
- `isDeferred`: Nếu là `true`, từ này nằm trong "Inbox" và chưa được đưa vào lịch học.
- **Các trường SRS (SM-2 Algorithm):**
  - `nextReview`: Thời điểm (ngày/giờ) từ này sẽ hiện lên để ôn tập lại.
  - `interval`: Khoảng cách ngày giữa lần ôn tập này và lần trước đó.
  - `repetition`: Số lần bạn đã nhớ từ này liên tiếp (bị reset về 0 nếu chọn "Quên").
  - `efactor`: Hệ số dễ (Ease Factor) - thể hiện độ khó của từ.

### 3. Bảng `GrammarCard` (Ngữ pháp)
Tương tự như từ vựng nhưng tối ưu cho việc luyện cấu trúc câu.
- `type`: Loại bài tập (`CLOZE`, `MCQ`, `PRODUCTION`, v.v.).
- `prompt`: Nội dung câu hỏi hoặc đề bài.
- `answer`: Đáp án chính xác.
- `meaning`: Nghĩa tiếng Việt hoặc giải thích ngắn gọn.
- `options` / `hint` / `explanation`: Thông tin hỗ trợ học liệu.
- `myError`: Phân tích lý do người dùng làm sai (Notebook mode).
- `trap`: Mô tả cái bẫy của câu hỏi (Notebook mode).
- `goldenRule`: Quy tắc ngữ pháp "sống còn" để giải câu (Notebook mode).
- `source`: Nguồn gốc (`MANUAL`, `TEST`, `NOTEBOOK`).
- `importanceScore`: Độ ưu tiên.

---

---

## ⏳ Giới hạn học tập hàng ngày (Daily Study Limits)

Để đảm bảo hiệu quả ghi nhớ và tránh tình trạng quá tải (burnout), VocaBee áp dụng giới hạn thông minh cho mỗi ngày học:
- **Tối đa 30 từ mới:** Bao gồm mục tiêu hàng ngày của bạn cộng với các từ chưa học từ ngày hôm trước, nhưng tổng cộng không quá 30 từ.
- **Tối đa 30 lượt ôn tập:** Hệ thống sẽ ưu tiên các từ đến hạn nhất và giới hạn ở con số 30 lượt để mỗi phiên học luôn tinh gọn và hiệu quả.
- **Tổng cộng 60 lượt/ngày:** Banner nhiệm vụ hàng ngày sẽ hiển thị tối đa 60 lượt (30 ôn tập + 30 học mới) để giúp bạn duy trì thói quen học tập bền bỉ.

---

## 📊 Logic hiển thị Thống kê (Dashboard Logic)

### 1. Lộ trình ngày (Daily Progress)
- Lấy từ thiết lập `dailyNewWordGoal` của người dùng (mặc định là 20).
- Đếm số lượng từ vựng có sự thay đổi (`updatedAt`) kể từ **4:00 sáng** hôm nay. Bao gồm cả các từ đánh dấu là "Quên".

### 2. Cần ôn tập (Due Reviews)
Một từ được tính là "Cần ôn tập" khi:
1. **Đã từng học:** `interval > 0`. (Bao gồm cả những từ quên với `repetition = 0`).
2. **Đến hạn:** Thời điểm `nextReview` nhỏ hơn hoặc bằng thời điểm hiện tại.

> [!TIP]
> **Từ mới (New Words):** Có `interval = 0`.
> **Từ đã học nhưng quên:** Có `interval > 0` nhưng `repetition = 0`. Vẫn được tính vào "Cần ôn tập".

---

Chúng ta sử dụng thuật toán **SM-2** đã được cải tiến (giống Anki) để tối ưu hóa việc ghi nhớ:
- **Lần đầu tiên ($n=1$):**
  - **Hard / Good:** 1 ngày.
  - **Easy:** 4 ngày.
- **Lần thứ hai ($n=2$):**
  - **Hard:** 3 ngày.
  - **Good:** 6 ngày.
  - **Easy:** 8 ngày.
- **Các lần sau ($n>2$):** $I(n) = I(n-1) \times Multiplier$.
  - **Hard:** Multiplier = 1.2.
  - **Good:** Multiplier = EF.
  - **Easy:** Multiplier = EF × 1.3 (Easy Bonus).

**Các cải tiến bổ sung:**
- **Diferentiated Intervals:** Các mức độ đánh giá khác nhau sẽ tạo ra khoảng thời gian ôn tập khác nhau ngay lập tức, giúp việc phân loại thẻ chính xác hơn.
- **Fuzz Logic:** Tự động cộng/trừ ngẫu nhiên một lượng nhỏ thời gian (±5%) cho các thẻ có interval > 4 ngày để tránh việc quá nhiều thẻ dồn vào cùng một ngày học (Card Clumping).
- **Interval Stabilization:** Trên giao diện nút bấm, yếu tố "Fuzz" sẽ được ẩn đi để đảm bảo số ngày hiển thị luôn nhất quán và dễ hiểu.
- **EF (Ease Factor)**: Độ dễ của từ sẽ được điều chỉnh linh hoạt. Công thức:  
`EF' = EF + 0.1 − (5−q)×(0.08 + (5−q)×0.02)`  
Trong đó `q` là chất lượng trả lời (0-5). VocaBee hiện ánh xạ: **Nhớ ngay** → q=5, **Nhớ được** → q=4, **Khó nhớ** → q=3, **Quên mất** → q=0. Ngưỡng tối thiểu của EF là 1.3.

---

## 🚀 Hướng dẫn bắt đầu

1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```
2. **Cấu hình môi trường:** Tạo file `.env` chứa `DATABASE_URL` (SQLite file: `file:./dev.db`) và `AUTH_SECRET`.
3. **Migration database:**
   ```bash
   npx prisma migrate dev
   ```
4. **Xem giao diện Database / Dữ liệu:**
   ```bash
   npx prisma studio
   ```
5. **Chạy server phát triển (Development Server):**
   ```bash
   npm run dev
   ```

---
*Phát triển bởi team VocaBee 🐝 – Học tập không giới hạn.*
