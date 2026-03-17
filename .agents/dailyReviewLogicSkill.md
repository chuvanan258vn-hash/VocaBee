---
name: Daily Review Loading Logic
description: Hướng dẫn chi tiết cấu trúc thuật toán và logic để lấy (fetch) và phân bổ danh sách từ vựng/ngữ pháp cho thẻ ôn tập hàng ngày (Review Session).
---

# Logic Lấy Dữ Liệu Ôn Tập Hằng Ngày (Vocabulary & Grammar Daily Review)

VocaBee sử dụng hệ thống Spaced Repetition (SRS) kết hợp với các giới hạn về Hạn mức cá nhân để quản lý số lượng bài ôn tập mỗi ngày. File này tài liệu hóa chi tiết cách hệ thống fetch và trộn dữ liệu trong `app/review/page.tsx` và hiển thị trên Dashboard (`app/actions.ts`).

## 1. Mốc Thời Gian (Time Bound)
- **"Ngày hôm nay (Today)"** trong hệ thống không bắt đầu vào lúc 0:00 midnight mà được thiết lập bắt đầu từ **4:00 AM sáng**. 
- Nếu người dùng học lúc 3:00 AM, hệ thống vẫn tính đó là tiến trình của "ngày hôm qua".

## 2. Xác Định Hạn Mức Tối Đa (Daily Max Quota)
Bảng `User` trong CSDL chứa các tham số sau do người dùng tùy chỉnh ở Cài đặt:
- `dailyMaxVocabReview`: Số thẻ *Từ vựng cũ* tối đa được phép học mỗi ngày (VD: 100).
- `dailyMaxGrammarReview`: Số thẻ *Ngữ pháp cũ* tối đa được phép học mỗi ngày (VD: 50).
- Hệ thống truy vấn DB lấy số lượng các thẻ *cũ* (`repetition > 1`) **đã ôn tập trong ngày hôm nay**.
- **Quota còn lại** = `Giới hạn Max` trừ đi `Số lượng đã ôn trong ngày`.

## 3. Lấy Danh Sách Cũ Đến Hạn (Due Items - Priority 1)
Hệ thống ưu tiên số 1 cho các thẻ đã đến thời điểm cần ôn theo công thức SM-2:
- Điều kiện SQL: `interval > 0` VÀ `nextReview <= Thời điểm hiện tại` VÀ `isDeferred = false`.
- **Giới hạn Query**: Để phiên học không quá dài, hệ thống cắt danh sách (Session Limit) tối đa 25 từ vựng hoặc 15 thẻ ngữ pháp cho một chu kỳ bấm nút "Bắt đầu". Số lượng query này cũng bị chặn bởi **Quota còn lại** ở bước 2 để đảm bảo không vi phạm mức trần hằng ngày.

## 4. Mục Tiêu Thẻ Mới (Daily New Goals & Can Learn More)
Bên cạnh thẻ cũ, user có mục tiêu học thẻ mới:
- `dailyNewWordGoal` & `dailyNewGrammarGoal` (Mặc định 20 từ, 10 câu).
- **Hệ thống nợ bài**: Nếu hôm qua user có thêm bài mới vào danh sách mà chưa học (có `interval = 0` và `createdAt` nằm trong ngày hôm qua), số bài này sẽ được cộng dồn vào Mục tiêu thẻ mới của ngày hôm nay.
- Số lượng thẻ MỚI còn có thể nạp vào phiên = (Mục tiêu tổng) - (Số thẻ MỚI đã học hôm nay: `repetition = 1` & `updatedAt >= 4:00AM`).

## 5. Lấp Đầy Khoảng Trống (Fill The Session - Priority 2)
Sau khi lấy Thẻ Cũ đến hạn, hệ thống tính khoảng trống còn lại của vòng lặp 25 thẻ/phiên. Khoảng trống này sẽ được fill bằng Thẻ MỚI (chưa bao giờ học, `interval = 0`), theo thứ tự ưu tiên:
1. Thẻ có nguồn gốc từ bài test (`source = "TEST"`) và có độ quan trọng cao (`importanceScore >= 3`).
2. Thẻ thêm thủ công thông thường (`source = "COLLECTION"`).

## 6. Sắp Xếp Trộn Bài (Interleave Algorithm)
Để não bộ không bị chán và mệt mỏi, Thẻ Cũ và Thẻ Mới không được show tách biệt mà trộn lẫn theo công thức:
- Cứ **3 Thẻ Cũ (Due Items)** sẽ được chèn theo sau bởi **1 Thẻ Mới (New Items)**.
- Quá trình lặp đến khi hết sạch danh sách Thẻ Cũ, nếu còn dư Thẻ Mới thì đẩy nốt vào cuối mảng.
- Hàm trả về danh sách đã được Interleaved (`interleaved`) cho Client để component `<ReviewSession />` thực thi quy mô hiển thị flashcard.
