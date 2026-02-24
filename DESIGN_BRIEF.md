# VocaBee --- Design Brief

## dark mode

Bảng màu chủ đạo (Brand Palette):

Màu nền: Sử dụng một tông Navy/Charcoal sâu (#0F172A) cho toàn bộ ứng dụng để tạo sự huyền bí và sang trọng.

Màu nhấn chính (Primary Gold): Màu vàng VocaBee (#FACC15) được sử dụng nhất quán cho các hành động quan trọng (nút Lưu, nút Bắt đầu, menu đang hoạt động).

Màu nhấn phụ (Cyan/Teal): Màu xanh ngọc (#2DD4BF) được dùng cho các thanh tiến độ, chỉ số thành công và các biểu đồ thống kê.


## light mode

Bố cục & Màu sắc (Light Theme):
Nền: Chuyển sang màu trắng sứ (#FFFFFF) và xám siêu nhạt (#F8FAFC), tạo cảm giác sạch sẽ, thoáng đãng.
Vàng VocaBee (#FACC15): Tiếp tục đóng vai trò là màu nhấn cho các nút hành động chính, tạo sự ấm áp trên nền sáng.
Xanh ngọc (#0B9488): Được điều chỉnh tông màu một chút để đạt độ tương phản tốt nhất trên nền trắng cho các thanh tiến độ và thống kê.
Chi tiết các màn hình:
Dashboard & Quản lý từ vựng: Các thẻ nội dung sử dụng đổ bóng mờ (soft shadow) thay vì đường viền đậm, giúp giao diện trông hiện đại và có chiều sâu.
Cửa sổ chỉnh sửa (Modal): Thiết kế trắng tinh khôi với các ô nhập liệu màu xám nhạt, tạo sự tập trung tối đa.
Học Flashcard (Mặt trước & Mặt sau): Thẻ học màu trắng nổi bật trên nền xám nhạt của môi trường học tập, giúp chữ viết tối màu trở nên cực kỳ dễ đọc.
Thống kê: Các biểu đồ được làm mới với màu sắc tươi sáng, năng động.

## 1. Project Summary

VocaBee là ứng dụng học từ vựng sử dụng Spaced Repetition (SM-2).\
Mục tiêu: tạo trải nghiệm học tập cao cấp, trực quan và thúc đẩy việc ôn
tập hàng ngày.

------------------------------------------------------------------------

## 2. Target Users & Goals

**Target users:** - Người học tiếng Anh (18--35 tuổi) - Học TOEIC /
IELTS / giao tiếp - Tự học dài hạn (3--6 tháng)

**Primary goals:** - Tăng khả năng ghi nhớ dài hạn - Tăng tần suất quay
lại app mỗi ngày - Giảm cognitive load khi học

**Brand tone:** Hiện đại -- tin cậy -- thân thiện -- có yếu tố
"delight".

------------------------------------------------------------------------

## 3. Visual Direction (Must-have)

-   Style: Glassmorphism (kính mờ, depth, soft shadow)
-   Font: Plus Jakarta Sans (400 / 500 / 700)
-   Rounded corners: 2xl
-   Dark mode & Light mode bắt buộc

### Gợi ý màu (có thể refine thêm):

-   Primary: #0066FF
-   Accent (Honey): #FFB400
-   Neutral dark/light tone system

------------------------------------------------------------------------

## 4. Key Screens (Priority Order)

1.  Onboarding / Goal Setup
2.  Dashboard (Due count, Today progress, Streak, Points)
3.  Study Session (Flashcard review: Forgot / Hard / Easy)
4.  Inbox / Deferred words
5.  Library / Word Detail
6.  Import Flow (Text/CSV)
7.  Profile / Settings / Achievements

------------------------------------------------------------------------

## 5. Core Components (Deliverables)

-   Flashcard (front/back, flip animation)
-   Rating buttons (Forgot / Hard / Easy)
-   Progress bar
-   Streak badge
-   Points badge (🍯 Honey system)
-   Word detail card
-   Modal (confirm, import summary)
-   Empty states illustration
-   Toast notifications

------------------------------------------------------------------------

## 6. Motion & Interaction Notes

-   Card flip: 3D rotate (220--300ms)
-   Button press: scale 0.97 + subtle ripple
-   Goal completed: small confetti + toast "+🍯 points"
-   Dark mode: tăng blur glass, giảm saturation nhẹ

------------------------------------------------------------------------

## 7. Accessibility Requirements

-   Contrast ratio ≥ 4.5:1 (body text)
-   Minimum tap target: 44x44px
-   Support dynamic text scaling ±20%

------------------------------------------------------------------------

## 8. Deliverables

-   Figma file (Mobile-first, component-based)
-   Organized pages: Tokens / Components / Screens / Prototype
-   SVG icon exports
-   Design tokens (color, spacing, radius, typography)
-   Motion specs notes (Lottie/Framer-ready nếu có)

------------------------------------------------------------------------

## 9. Attachments (Will Be Provided)

-   Logo (SVG)
-   Font files
-   Example user flow
-   Current screenshots (if available)

------------------------------------------------------------------------

## 10. Timeline

-   First draft (core screens): 7 days
-   Revision round: 2--3 days
