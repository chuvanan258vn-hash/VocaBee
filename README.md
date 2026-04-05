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
- `example`: Ví dụ minh họa.
- `synonyms`: Từ đồng nghĩa.
- `context`: Ngữ cảnh, hoàn cảnh sử dụng hoặc chuyên ngành của từ (tuỳ chọn).
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

> [!IMPORTANT]
> **[Bug Fix - 2026-03-10] GrammarCard `nextReview` Date Format:** Phát hiện lỗi nghiêm trọng: `reviewGrammarCardAction` lưu `nextReview` dưới dạng **locale string** (`"Mon Jul 06 2026 04:00:00 GMT+0700"`) thay vì **ISO 8601** (`"2026-07-05T21:00:00.000Z"`). SQLite so sánh date bằng string lexicographic, dẫn đến mọi thẻ đã ôn tập (interval>0) đều xuất hiện như "đến hạn" ngay lập tức. **Fix:** Chuyển sang dùng `$executeRawUnsafe` + `.toISOString()` trong `reviewGrammarCardAction`. Đã migrate 22 records hiện có bằng script `migrate_grammar_dates.ts`. **Quy tắc:** Khi update GrammarCard bằng Prisma ORM `(as any)`, LUÔN dùng raw SQL để lưu date dưới dạng ISO string.

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
2. **Cấu hình môi trường:** Tạo file `.env` với các biến sau và `AUTH_SECRET`.
   > Dự án hiện sử dụng **Supabase (PostgreSQL)** thay cho SQLite.
   ```env
   # Connection pooling (dùng cho ứng dụng)
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   # Direct connection (dùng cho Migration)
   DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
   ```
3. **Đồng bộ Schema lên Database:**
   ```bash
   npx prisma db push
   ```
4. **Xem và quản lý Database:**
   ```bash
   npx prisma studio
   ```
5. **Chạy server phát triển:**
   ```bash
   npm run dev
   ```

> [!TIP]
> **Migrate dữ liệu từ SQLite cũ lên Supabase (chỉ thực hiện 1 lần):**
> ```bash
> npx tsx scripts/migrate_to_supabase.ts
> ```
---

_Phát triển bởi team VocaBee 🐝 – Học tập không giới hạn._

> [!NOTE]
> - **Review Session Snappiness**: Implemented Optimistic UI, background data syncing, and stabilized session state to eliminate "hangs" when clicking evaluation buttons. Reduced server-side revalidation overhead by 90% during active study.
> - **[UI/UX - 2026-03-14] Accessibility Improvement:** Fixed accessibility issues in `GrammarList.tsx` and `AddGrammarForm.tsx`. Fixed missing `aria-label` and `title` for close buttons and inputs to ensure discernible text for screen readers.
> - **[UI/UX - 2026-03-15] Study Flow Enhancement:** Added **Pronunciation** and **Context** display during the typing phase in `FlashcardInput.tsx`. This provides users with essential clues and reinforcement BEFORE they reveal the answer, making the active recall process more effective.
> - **[Performance - 2026-03-23] Dashboard Load Time:** Optimized `getDashboardStats` in `actions.ts` by parallelizing 13 sequential Prisma SQL queries using `Promise.all`. This significantly reduced delay/lag (from 12s down to ~1s) on the dashboard and Server Actions (like Add/Review Word) that trigger `revalidatePath('/')`.
> - **[Feature - 2026-03-28] Phân loại luyện tập TOEIC Part 5, 6, 7:** Nâng cấp bảng thống kê Thử thách Ngữ pháp tại Dashboard để chia tách số lượng cần học mới / ôn luyện theo từng Part cụ thể (Part 5, Part 6, Part 7, và Khác). Bổ sung khả năng click vào từng huy hiệu Part trên Dashboard để chỉ ôn luyện riêng những thẻ ngữ pháp thuộc phần TOEIC đó, giúp cá nhân hóa lộ trình học chính xác hơn. Fix lỗi giao diện "TOEIC PART NULL" trên Flashcard.
> - **[Performance - 2026-04-02] Background Review Session Update:** Tối ưu hóa lại luồng xử lý ở phiên học. Thay vì bắt người dùng phải đợi API xử lý hàng loạt thẻ ở cuối buổi, hệ thống đã chuyển sang cập nhật nhanh từng từ vựng/ngữ pháp ở chế độ nền (background) ngay sau mỗi cú lật thẻ hay gõ bài. Màn hình tổng hợp cuối cùng (Review Summary) vẫn được giữ lại để người học chiêm ngưỡng thành quả, nhưng trải nghiệm lúc nhấn nút hoàn thành bây giờ là độ mượt tức thì.
T h � m   g i �i   h �n 
 
 - Đã thêm logic giới hạn từ/ngữ pháp ôn tập mỗi ngày (100 từ vựng, 50 ngữ pháp) để tránh bị quá tải số lượng ôn tập.
- Đã thêm tùy biến vào Cài đặt để thay đổi giới hạn từ vựng/ngữ pháp hiển thị trong phần ôn tập mỗi ngày.


## Logic Ôn Tập Hằng Ngày (Daily Review System)
Hệ thống tải danh sách ôn tập hàng ngày theo thứ tự ưu tiên và đảm bảo không gây quá tải cho người học. Logic hoạt động cho cả Từ Vựng và Ngữ Pháp:
1. **Reset theo khung giờ thực tế**: Mọi tiến trình Ngày Mới được reset không phải vào 0h mà là **4h00 Sáng**.
2. **Cap giới hạn tồn đọng**: Người dùng có thể chỉnh số lượng Ôn bài Cũ tối đa mỗi ngày ở mốc 100 Từ vựng / 50 Ngữ pháp (tùy chỉnh trong Settings). Hệ thống đếm lượng bài học đạt chuẩn và tự động Stop nếu bạn chạm mốc Daily Limit. 
3. **Mục tiêu học Mới**: Bên cạnh Ôn thẻ Cũ, mỗi ngày có hạn ngạch nạp thẻ MỚI (ưu tiên các từ nguồn \TEST\ điểm cao, sau đó đến \COLLECTION\). Bài bị tồn nợ không học hôm qua sẽ được nhồi dồn thành Quota ngày hôm sau.
4. **Thuật toán xen kẽ phiền chán (Interleaving)**: Tại mỗi phiên 25 thẻ (session), hệ thống không dồn 1 đống từ mới/cũ vào nhau mả rải theo thuật toán tỉ lệ **3 thẻ Cũ xuất hiện -> 1 thẻ Mới xen vào**.
*(Tham khảo chi tiết quy trình lấy API Data tại \.agents/dailyReviewLogicSkill.md\ hoặc \pp/review/page.tsx\)*

- Đã thêm tính năng gợi ý 2 mức (ký tự và phiên âm) trong component FlashcardInput

- Tự động đánh giá SM-2 (Ease Factor) dựa trên số lượng Hint sử dụng trong quá trình học. Không còn bước tự đánh giá thủ công.
Mapping Hint sang EF (Quality):

Không gởi ý (nhập đúng liền) -> Level 0: q = 5 (Nhớ ngay)
Mở gợi ý chữ cái -> Level 1: q = 4 (Nhớ được)
Mở gợi ý phiên âm -> Level 2: q = 3 (Khó nhớ)
Nghe audio để đoán -> Level 3: q = 2 (Nhớ kém)
Bỏ qua / trả lời sai -> q = 0 (Quên mất)

- Bổ sung hiệu ứng hiển thị trạng thái đúng (chuyển chữ màu xanh) và delay 800ms để người dùng kịp nhận biết trước khi tự động chuyển sang thẻ kết quả/ôn từ tiếp theo.

### Cơ chế tính toán số ngày ôn tập (Spaced Repetition SM-2)

Dựa vào cấp độ gợi ý (Hint Level) bạn sử dụng, hệ thống sẽ xác định khoảng chất lượng nhớ (Quality - `q` từ 0 đến 5) và tính toán số ngày ôn tiếp theo (`interval`) cùng Hệ số dễ nhớ (`Ease Factor - EF`, mặc định bắt đầu là 2.5).

**Quy tắc cộng ngày chung:**
- **Lần học đầu tiên (Lần gặp mới)**:
  - Nhập đúng ngay (q=5): Ôn lại sau **4 ngày**.
  - Dùng gợi ý chữ cái/phiên âm (q=4, q=3): Ôn lại sau **1 ngày**.
  - Sai/Nghe Audio (q<3): Nhắc lại vào **ngày mai (1 ngày)**.
- **Lần ôn thành công thứ hai (Repetition = 1)**:
  - Không cần gợi ý (q=5): Ôn lại sau **8 ngày**.
  - Cần gợi ý nhẹ (q=4): Ôn lại sau **6 ngày**.
  - Cần gợi ý nhiều (q=3): Ôn lại sau **3 ngày**.
- **Từ lần ôn thứ ba trở đi (Repetition > 1)**:
  - Số ngày dời lại = `Khoảng ngày lần trước` × `Hệ số`.
  - Hệ số linh hoạt theo loại gợi ý: Nếu phải dùng gợi ý `q=4`, số ngày sẽ nhân với mức `EF`. Còn tự nhớ hoàn toàn `q=5` số ngày sẽ tăng tốc nhanh hơn (nhân `EF × 1.3`).
  *(Lưu ý: EF của từ cũng sẽ tăng giảm nhẹ sau mỗi lần ôn tùy vào bạn nhớ dễ hay khó)*
- **Fuzz Logic**: Với các từ có khoảng cách ôn lớn hơn 4 ngày, hệ thống sẽ tự cộng trừ xê dịch ngẫu nhiên ±5% số ngày để các từ không bị tụ hội cùng một lúc.

**Ví dụ thực tế với từ "national highway" (EF ban đầu = 2.5):**
1. **Ngày 1 (Lần đầu gặp - rep=0)**: Bạn thấy từ mới "quốc lộ" và nhập đúng chữ "national highway" mà **không dùng gợi ý** (`q=5`). 
   👉 Từ này được dời sang **4 ngày sau**. (EF tăng nhẹ lên 2.6).
2. **Ngày 5 (Lần ôn 2 - rep=1)**: Bạn dùng **1 gợi ý chữ cái** (`q=4`) để nhớ ra từ. 
   👉 Theo mốc cố định, từ này được dời sang **6 ngày sau**. (EF giữ nguyên 2.6).
3. **Ngày 11 (Lần ôn 3 - rep=2)**: Bạn trả lời ngay lập tức mà **không cần gợi ý** (`q=5`). 
   👉 Lúc này khoảng ngày mới = 6 ngày (lần trước) × (2.6 × 1.3) ≈ **20 ngày sau**.
4. **Ngày 31**: Nếu tới đây bạn **quên mất** (q=0): 
   👉 Từ "national highway" sẽ bị lùi về mốc đầu `rep=0`, bắt buộc ôn lại vào ngay **ngày mai (1 ngày sau)**, và mức độ EF bị trừ điểm đi.
