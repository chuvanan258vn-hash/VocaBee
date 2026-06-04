# 🐝 VocaBee

> **Ứng dụng học từ vựng & ngữ pháp tiếng Anh thông minh** dành cho người luyện thi TOEIC, được xây dựng với Next.js 15, Prisma và thuật toán lặp lại cách quãng SM-2.

---

## 📋 Mục lục

- [Tính năng chính](#-tính-năng-chính)
- [Tech Stack](#-tech-stack)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cấu trúc Database](#-cấu-trúc-database)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Các trang & Routes](#-các-trang--routes)
- [Components](#-components)
- [Server Actions](#-server-actions)
- [Thuật toán SRS (SM-2)](#-thuật-toán-srs-sm-2)
- [Hệ thống Gamification](#-hệ-thống-gamification)
- [Cài đặt & Chạy](#-cài-đặt--chạy)
- [Biến môi trường](#-biến-môi-trường)

---

## ✨ Tính năng chính

### 🧠 Học từ vựng thông minh
- **Spaced Repetition (SM-2):** Hệ thống tự động lên lịch ôn tập dựa trên hiệu suất của người dùng. Từ dễ sẽ được ôn ít hơn, từ khó được ôn thường xuyên hơn.
- **Review Session:** Giao diện flashcard với animation lật thẻ, hỗ trợ swipe trái/phải, nhập câu trả lời bằng bàn phím.
- **Text-to-Speech:** Phát âm từ vựng với lựa chọn accent Anh-Mỹ, Anh-Anh, Anh-Úc.
- **Smart Capture:** Bắt từ nhanh khi đọc tài liệu — lưu ngay vào hộp thư đến (inbox) nếu độ ưu tiên thấp.

### 📚 Ngữ pháp TOEIC chuyên sâu
- **Nhiều dạng bài:** CLOZE, PRODUCTION, ERROR_CORRECTION, MCQ, TRANSFORMATION, EXPLANATION.
- **Phân loại theo Part:** TOEIC Part 5, 6, 7 với tracking riêng biệt.
- **Phân tích điểm yếu:** Thuật toán tính điểm yếu dựa trên tỉ lệ sai, độ gần đây và efactor.
- **Chiến dịch ôn thi:** Đặt ngày bắt đầu thêm từ và ngày thi để hiển thị banner đếm ngược khẩn cấp.

### 🎮 Gamification
- **Điểm (Bees):** Kiếm điểm sau mỗi lần ôn tập. +1 điểm cơ bản, +1 nếu chất lượng ≥ 4, +1 nếu nhập đúng bằng bàn phím, +5 khi đạt mục tiêu ngày.
- **Streak hàng ngày:** Theo dõi chuỗi ngày học liên tục (ranh giới ngày lúc 4:00 AM).
- **Streak Freeze:** Mua bảo vệ streak bằng 50 điểm.
- **Leaderboard:** Top 50 người dùng theo điểm và streak.

### 📊 Thống kê chi tiết
- Biểu đồ hoạt động 365 ngày (heatmap).
- Phân bổ cấp độ thành thạo (New → Mastered).
- Tỉ lệ giữ bài (Retention Rate).
- Breakdown từ vựng theo từ loại.

### 📥 Import / Export
- Import từ vựng hàng loạt qua CSV/Excel.
- Import grammar cards hàng loạt.
- Inbox (hộp thư đến) cho các từ bắt được nhanh — xem xét và chuyển vào bộ sưu tập chính sau.

### ⚙️ Cài đặt linh hoạt
- Mục tiêu từ mới hàng ngày (vocab + grammar).
- Giới hạn số thẻ ôn tập mỗi ngày.
- Ngày chiến dịch ôn thi (examStartDate → examDate).
- Câu hỏi bảo mật để khôi phục mật khẩu.

---

## 🛠 Tech Stack

| Layer | Công nghệ |
|---|---|
| **Framework** | Next.js 15 (App Router, Server Components, Server Actions) |
| **UI** | React 19, Tailwind CSS v4, Framer Motion |
| **Icons** | Lucide React, Google Material Symbols |
| **Auth** | NextAuth v5 (JWT + Credentials + Google OAuth) |
| **ORM** | Prisma v6 với PostgreSQL (Supabase) |
| **Local Cache** | better-sqlite3 (offline sync layer) |
| **Email** | Nodemailer (password reset) |
| **Animations** | canvas-confetti (khi đạt mục tiêu) |
| **Password** | bcryptjs |
| **Deployment** | Vercel / bất kỳ Node.js host |

---

## 🏗 Kiến trúc hệ thống

```
Browser
  │
  ├── Next.js App Router (SSR + Client Components)
  │     ├── Server Components → trực tiếp gọi Prisma
  │     ├── Server Actions → mutations, SRS updates
  │     └── Client Components → UI tương tác (flashcard, forms)
  │
  ├── NextAuth v5 → JWT sessions (Google OAuth + Credentials)
  │
  ├── Prisma ORM (với Proxy để sync LocalDB)
  │     ├── PostgreSQL (Supabase) — production data
  │     └── SQLite (local) — offline sync cho mutations
  │
  └── Email (Nodemailer) → password reset links
```

### Tối ưu performance
`getDashboardStats()` từng thực hiện 15+ sequential DB round-trips (~22s). Hiện tại dùng **4 parallel queries** với PostgreSQL `FILTER` aggregation để tính tất cả counts trong 1 SQL statement → giảm xuống còn 2–4s.

---

## 🗄 Cấu trúc Database

### `User`
| Field | Type | Mô tả |
|---|---|---|
| `id` | String (UUID) | Primary key |
| `email` | String (unique) | Email đăng nhập |
| `password` | String? | Bcrypt hash (null với Google OAuth) |
| `name`, `image` | String? | Tên và avatar |
| `dailyNewWordGoal` | Int (default 20) | Mục tiêu từ mới/ngày |
| `dailyNewGrammarGoal` | Int (default 10) | Mục tiêu ngữ pháp/ngày |
| `dailyMaxVocabReview` | Int (default 100) | Giới hạn ôn vocab/ngày |
| `dailyMaxGrammarReview` | Int (default 50) | Giới hạn ôn grammar/ngày |
| `streakCount` | Int | Chuỗi ngày học liên tục |
| `streakFreeze` | Int | Số lần bảo vệ streak còn lại |
| `points` | Int | Tổng điểm tích lũy |
| `examStartDate` | DateTime? | Ngày bắt đầu thêm từ ôn thi |
| `examDate` | DateTime? | Ngày thi (deadline) |
| `securityQuestion` | String? | Câu hỏi bảo mật |
| `securityAnswer` | String? | Câu trả lời bảo mật |

### `Vocabulary`
| Field | Type | Mô tả |
|---|---|---|
| `word` | String | Từ vựng (unique per user) |
| `wordType` | String? | Noun, Verb, Adjective... |
| `meaning` | String | Nghĩa tiếng Việt |
| `pronunciation` | String? | Phiên âm IPA |
| `example` | String? | Câu ví dụ |
| `synonyms`, `context` | String? | Từ đồng nghĩa, ngữ cảnh |
| `importanceScore` | Int (0–4) | Độ quan trọng (smart capture) |
| `source` | String | `COLLECTION` hoặc `TEST` |
| `isDeferred` | Boolean | Đang trong inbox chờ xử lý |
| `nextReview` | DateTime | Thời điểm ôn tập tiếp theo |
| `interval` | Int | Khoảng cách ôn (ngày) |
| `repetition` | Int | Số lần đã ôn thành công |
| `efactor` | Float (2.5) | Hệ số dễ/khó (SM-2) |

### `GrammarCard`
| Field | Type | Mô tả |
|---|---|---|
| `type` | String | CLOZE, MCQ, PRODUCTION, ERROR_CORRECTION, TRANSFORMATION, EXPLANATION |
| `prompt` | String | Câu hỏi / bài tập |
| `answer` | String | Đáp án đúng |
| `options` | String? | Các lựa chọn (MCQ, dạng JSON) |
| `hint`, `explanation` | String? | Gợi ý, giải thích |
| `myError`, `trap` | String? | Lỗi hay mắc, bẫy đề |
| `goldenRule`, `formula` | String? | Quy tắc vàng, công thức |
| `toeicPart` | String? | `TOEIC_P5`, `TOEIC_P6`, `TOEIC_P7` |
| `grammarCategory` | String? | Loại ngữ pháp |
| `signalKeywords` | String? | Từ tín hiệu nhận dạng dạng bài |
| `tags` | String? | Nhãn phân loại |
| `importanceScore` | Int | Độ ưu tiên (0–4) |
| `source` | String | `COLLECTION` hoặc `TEST` |
| `isDeferred` | Boolean | Đang trong inbox |
| `nextReview`, `interval`, `repetition`, `efactor` | SRS fields | SM-2 parameters |

---

## 📁 Cấu trúc thư mục

```
VocaBee/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Dashboard (Home)
│   ├── layout.tsx                # Root layout (theme, fonts)
│   ├── actions.ts                # Tất cả Server Actions (~1600 dòng)
│   ├── globals.css               # CSS variables, fluid font scaling
│   ├── login/page.tsx            # Đăng nhập
│   ├── register/page.tsx         # Đăng ký
│   ├── forgot-password/page.tsx  # Quên mật khẩu
│   ├── reset-password/page.tsx   # Đặt lại mật khẩu
│   ├── vocabulary/page.tsx       # Danh sách từ vựng
│   ├── grammar/page.tsx          # Danh sách ngữ pháp
│   ├── review/page.tsx           # Phiên ôn tập SRS
│   ├── stats/page.tsx            # Thống kê chi tiết
│   ├── leaderboard/page.tsx      # Bảng xếp hạng
│   ├── inbox/page.tsx            # Hộp thư đến (deferred items)
│   ├── profile/page.tsx          # Hồ sơ người dùng
│   ├── settings/page.tsx         # Cài đặt hệ thống
│   └── api/auth/[...nextauth]/   # NextAuth API routes
│
├── components/                   # React components
│   ├── Sidebar.tsx               # Navigation sidebar
│   ├── Dashboard.tsx             # Dashboard card chính
│   ├── DashboardWidgets.tsx      # Leaderboard + Activity heatmap
│   ├── ReviewSession.tsx         # Giao diện ôn tập flashcard
│   ├── Flashcard.tsx             # Thẻ từ vựng (flip animation)
│   ├── GrammarFlashcard.tsx      # Thẻ ngữ pháp
│   ├── FlashcardInput.tsx        # Input nhập câu trả lời
│   ├── AddWordForm.tsx           # Form thêm từ mới
│   ├── AddGrammarForm.tsx        # Form thêm grammar card
│   ├── ToeicForm.tsx             # Form nhập câu hỏi TOEIC
│   ├── WordList.tsx              # Danh sách từ vựng có phân trang
│   ├── WordItem.tsx              # Row từ vựng đơn
│   ├── GrammarList.tsx           # Danh sách grammar có phân trang
│   ├── GrammarItem.tsx           # Row grammar card đơn
│   ├── GrammarMenu.tsx           # Menu điều hướng ngữ pháp
│   ├── SmartCaptureTrigger.tsx   # Nút bắt từ nhanh
│   ├── SmartCaptureDialog.tsx    # Modal bắt từ nhanh
│   ├── BatchImportModal.tsx      # Modal import hàng loạt
│   ├── ImportGrammarButton.tsx   # Nút import grammar CSV
│   ├── SettingsForm.tsx          # Form cài đặt hệ thống
│   ├── ThemeToggle.tsx           # Nút đổi dark/light mode
│   ├── ThemeProvider.tsx         # next-themes wrapper
│   ├── ToastProvider.tsx         # Notification system
│   ├── SrsDebugPanel.tsx         # Debug panel (chỉ dev mode)
│   ├── AccentSelector.tsx        # Chọn accent phát âm
│   └── ScrollToTopButton.tsx     # Nút cuộn lên đầu
│
├── lib/
│   ├── prisma.ts                 # PrismaClient singleton + LocalDB proxy
│   ├── user.ts                   # getAuthenticatedUser() (React.cache)
│   ├── sm2.ts                    # Thuật toán SM-2 spaced repetition
│   ├── definitions.ts            # TypeScript interfaces & types
│   ├── utils.ts                  # Helpers: wordType normalize, TTS, CSV
│   ├── mail.ts                   # Nodemailer email service
│   ├── tokens.ts                 # Password reset token helpers
│   ├── localdb.ts                # SQLite instance (offline sync)
│   └── db.ts                     # DB utilities
│
├── prisma/
│   ├── schema.prisma             # PostgreSQL schema (production)
│   └── schema.sqlite.prisma     # SQLite schema (local sync)
│
├── auth.ts                       # NextAuth configuration
├── auth.config.ts                # Route protection rules
├── middleware.ts                 # NextAuth middleware
└── next.config.ts                # Next.js config (4MB action limit)
```

---

## 🗺 Các trang & Routes

| Route | Mô tả |
|---|---|
| `/` | **Dashboard** — Tổng quan: banner chiến dịch ôn thi, nhiệm vụ hàng ngày, thử thách ngữ pháp, thống kê nhanh, leaderboard mini |
| `/login` | Đăng nhập bằng email/mật khẩu hoặc Google OAuth |
| `/register` | Đăng ký tài khoản mới |
| `/forgot-password` | Khôi phục mật khẩu qua câu hỏi bảo mật |
| `/reset-password` | Đặt mật khẩu mới bằng token |
| `/vocabulary` | Danh sách toàn bộ từ vựng — tìm kiếm, lọc theo từ loại, thêm/sửa/xóa |
| `/grammar` | Danh sách grammar cards — tìm kiếm, lọc theo TOEIC part, thêm/sửa/xóa |
| `/review` | Phiên ôn tập SRS — hỗ trợ query params: `?type=vocab`, `grammar`, `vocab_exam`, `grammar_exam`, `toeic_p5`, `toeic_p6` |
| `/stats` | Thống kê chi tiết — heatmap 365 ngày, mastery distribution, retention rate, top 10 từ yếu |
| `/leaderboard` | Bảng xếp hạng top 50 theo điểm |
| `/inbox` | Hộp thư đến — các từ/grammar bắt nhanh đang chờ xử lý |
| `/profile` | Hồ sơ người dùng |
| `/settings` | Cài đặt: mục tiêu hàng ngày, giới hạn ôn tập, chiến dịch ôn thi, bảo mật |

---

## 🧩 Components

### Layout
- **`Sidebar`** — Menu điều hướng chính, hiển thị điểm + streak, link đến tất cả trang.
- **`ThemeToggle`** — Chuyển đổi dark/light mode với smooth transition.
- **`ThemeProvider`** — Wrapper `next-themes` bao toàn bộ app.
- **`ToastProvider`** — Hệ thống notification (success/error/info) với auto-dismiss.
- **`GrammarMenu`** — Dropdown menu học ngữ pháp, điều hướng TOEIC parts.

### Dashboard
- **`Dashboard`** — Card tổng quan: circular progress ring, daily goal tracking, quick stats.
- **`DashboardWidgets`** — Widget leaderboard mini + activity heatmap.
- **`SrsDebugPanel`** — Panel debug (chỉ hiện ở `NODE_ENV=development`): đếm queue forgotten, new, deferred.

### Review & Flashcard
- **`ReviewSession`** — Giao diện ôn tập chính: batch processing, swipe gesture, keyboard shortcuts, confetti khi đạt goal.
- **`Flashcard`** — Thẻ từ vựng với flip animation 3D, nút phát âm, nút xóa.
- **`GrammarFlashcard`** — Thẻ ngữ pháp với reveal hint/explanation từng bước.
- **`FlashcardInput`** — Input nhập câu trả lời dạng production/fill-in.

### Vocabulary Management
- **`AddWordForm`** — Form thêm từ: word, type, meaning, pronunciation, example, synonyms, context. Có auto-detect wordType.
- **`WordList`** — Danh sách phân trang, search full-text, filter by type.
- **`WordItem`** — Row đơn: preview, inline edit, delete, quick review button.
- **`BatchImportModal`** — Import CSV/Excel hàng loạt với preview và skip duplicates.

### Grammar Management
- **`AddGrammarForm`** — Form thêm grammar card với tất cả fields TOEIC-specific.
- **`ToeicForm`** — Form chuyên biệt cho câu hỏi TOEIC Part 5/6/7 với fields đặc thù.
- **`GrammarList`** / **`GrammarItem`** — List + row tương tự vocabulary.
- **`ImportGrammarButton`** — Nút import grammar từ CSV.

### Smart Capture
- **`SmartCaptureTrigger`** — Nút nổi để kích hoạt bắt từ nhanh khi đang đọc.
- **`SmartCaptureDialog`** — Modal: paste text → tự detect từ/grammar → lưu với importanceScore.

### Settings
- **`SettingsForm`** — Toàn bộ form cài đặt: daily goals (vocab + grammar), review limits, exam campaign dates (date picker với format DD/MM/YYYY), security Q&A.
- **`AccentSelector`** — Chọn giọng đọc: 🇺🇸 Mỹ, 🇬🇧 Anh, 🇦🇺 Úc.

---

## ⚡ Server Actions

Tất cả mutations và data fetching chính đặt trong `app/actions.ts`:

### Vocabulary
| Action | Mô tả |
|---|---|
| `addWordAction()` | Thêm từ mới (kiểm tra duplicate) |
| `updateWordAction()` | Cập nhật thông tin từ |
| `deleteWordAction()` | Xóa từ |
| `importWordsAction()` | Import hàng loạt (bỏ qua duplicate) |
| `getWordsPaginatedAction()` | Lấy danh sách có phân trang + full-text search |
| `checkDuplicateWordAction()` | Kiểm tra từ đã tồn tại chưa |
| `reviewWordAction()` | Ôn tập 1 từ: SM-2 + cộng điểm + cập nhật streak |

### Grammar
| Action | Mô tả |
|---|---|
| `addGrammarCardAction()` | Thêm grammar card |
| `updateGrammarCardAction()` | Cập nhật grammar card |
| `deleteGrammarCardAction()` | Xóa grammar card |
| `importGrammarCardsAction()` | Import hàng loạt (parallel upsert) |
| `getGrammarPaginatedAction()` | Danh sách + search by prompt/answer/tags |
| `reviewGrammarCardAction()` | Ôn tập 1 grammar card (grade 0–3 → quality 0–5) |
| `generateGrammarHintsAction()` | Tự động generate hints từ explanation |

### Stats & Dashboard
| Action | Mô tả |
|---|---|
| `getDashboardStats()` | Stats tổng hợp cho Dashboard (4 parallel SQL queries) |
| `getVocabPageHeaderStats()` | Stats nhẹ cho trang Vocabulary |
| `getDetailedStatsAction()` | Heatmap 365 ngày, mastery distribution, retention rate |
| `getLeaderboardAction()` | Top 50 users theo điểm |
| `getWeakCategoriesAction()` | Phân tích điểm yếu TOEIC theo category |

### Batch Review
| Action | Mô tả |
|---|---|
| `batchReviewAction()` | Xử lý nhiều thẻ cùng lúc, cập nhật điểm + streak atomic |

### Smart Capture & Inbox
| Action | Mô tả |
|---|---|
| `smartCaptureAction()` | Lưu từ/grammar nhanh (deferred nếu priority < 3) |
| `getDeferredItemsAction()` | Lấy tất cả items trong inbox |
| `manageInboxItemAction()` | Chuyển vào collection hoặc xóa item |

### Settings & Auth
| Action | Mô tả |
|---|---|
| `updateUserSettingsAction()` | Lưu daily goals, review limits, exam dates |
| `buyStreakFreezeAction()` | Mua streak freeze (50 điểm) |
| `signOutAction()` | Đăng xuất |
| `getSecurityQuestionAction()` | Lấy câu hỏi bảo mật (quên mật khẩu) |
| `verifySecurityAnswerAction()` | Xác minh câu trả lời → tạo reset link |
| `resetPasswordAction()` | Đặt mật khẩu mới |

---

## 🔁 Thuật toán SRS (SM-2)

Implemented tại `lib/sm2.ts`, áp dụng thuật toán **SuperMemo 2** với một số điều chỉnh:

```
quality = 0..5   (0-1: fail, 2: hard, 3: ok, 4: good, 5: perfect)

if quality < 3:
  interval = 1, repetition = 0     ← reset về đầu
else:
  if repetition == 0: interval = 1
  if repetition == 1: interval = 6
  else: interval = round(prev_interval × efactor)

  efactor = efactor + (0.1 - (5-quality) × (0.08 + (5-quality) × 0.02))
  efactor = max(1.3, efactor)       ← không giảm quá thấp

nextReview = now + interval days (với ±10% fuzz để tránh review storm)
```

**Grammar cards** dùng thang điểm 0–3 (grade) → convert sang quality 0–5 trước khi áp dụng SM-2.

---

## 🎮 Hệ thống Gamification

### Điểm (Bees 🍯)
| Điều kiện | Điểm |
|---|---|
| Ôn 1 thẻ bất kỳ | +1 |
| Chất lượng ≥ 4 (Good/Perfect) | +1 bonus |
| Nhập đúng bằng bàn phím | +1 typing bonus |
| Hoàn thành mục tiêu ngày | +5 goal bonus |

### Streak
- Streak tăng khi đạt daily goal trong ngày (ranh giới 4:00 AM mỗi ngày).
- **Streak Freeze:** Tốn 50 điểm, bảo vệ streak 1 ngày nếu không học.
- Streak reset về 0 nếu bỏ học >1 ngày mà không có freeze.

### Chiến dịch ôn thi
- Đặt `examStartDate` (ngày bắt đầu thêm từ ôn thi) và `examDate` (ngày thi thực sự).
- Dashboard hiển thị 2 banner khẩn cấp: vocab cần ôn + grammar cần ôn trong khoảng ngày đó.
- Banner tự tắt khi không set hoặc khi hết thời gian chiến dịch.

> **Lưu ý:** `examStartDate` là ngày bạn **bắt đầu thêm từ vào app** cho kỳ thi này (không phải ngày bắt đầu học). Ví dụ: bắt đầu thêm từ từ 24/04 → ngày thi 28/09 → đặt `24/04` và `28/09`.

---

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js >= 18
- PostgreSQL (hoặc Supabase account)

### 1. Clone & Install
```bash
git clone <repo-url>
cd VocaBee
npm install --legacy-peer-deps
```

### 2. Cấu hình môi trường
```bash
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn
```

### 3. Setup Database
```bash
# Push schema lên PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 4. Chạy development
```bash
npm run dev
# App chạy tại http://localhost:3000
```

### 5. Build production
```bash
npm run build
npm run start
```

---

## 🔐 Biến môi trường

```env
# Database (PostgreSQL / Supabase)
DATABASE_URL="postgresql://user:password@host:port/db?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/db"

# NextAuth
AUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth (tuỳ chọn)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (tuỳ chọn — dùng cho password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

---

## 📝 Ghi chú phát triển

- **Raw SQL fallback:** Một số features dùng `prisma.$queryRawUnsafe()` cho các cột mới thêm chưa kịp regenerate client, hoặc cho các aggregation query phức tạp.
- **4:00 AM boundary:** Ngày học được tính bắt đầu từ 4:00 AM (không phải 0:00), phù hợp với người học khuya.
- **Fluid scaling:** `html { font-size: clamp(13px, 0.75vw, 16px) }` — UI tự scale theo viewport width, hoạt động tốt từ laptop 13" đến màn hình 27".
- **React.cache:** `getAuthenticatedUser()` được wrap bằng `React.cache` để dedup concurrent calls trong cùng 1 request.
- **`force-dynamic`:** Tất cả pages dùng `export const dynamic = 'force-dynamic'` để luôn lấy data mới nhất từ DB.
- **`--legacy-peer-deps`:** Cần dùng flag này khi install do conflict giữa `nodemailer@8` và `next-auth@5-beta`.

---

<div align="center">
  <p>Built with ❤️ for TOEIC learners</p>
  <p>🐝 <strong>VocaBee</strong> — Golden Amber Edition</p>
</div>
