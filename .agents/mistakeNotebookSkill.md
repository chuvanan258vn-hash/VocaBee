---
name: TOEIC Mistake Notebook Pattern
description: Quy trình và quy chuẩn cho việc capture và ôn tập lỗi sai (TOEIC Mistakes).
---

# TOEIC Mistake Notebook Pattern

Tính năng "Mistake Notebook" được thiết kế để tối ưu hóa việc học từ những sai lầm trong bài thi TOEIC (Part 5, 6, 7).

## 1. Capture Philosophy: Minimal Input, High Value
Luôn duy trì 2 chế độ nhập liệu trong `MistakeCaptureDialog.tsx`:
- **Minimal fields (Bắt buộc)**:
  - `prompt`: Câu hỏi gốc (English).
  - `answer`: Đáp án đúng.
  - `myError`: Lý do tại sao người dùng sai (Vietnamese).
- **Advanced fields (Tùy chọn)**:
  - `trap`: Mô tả cái bẫy của câu hỏi.
  - `goldenRule`: Quy tắc ngữ pháp rút ra.
  - `meaning`: Dịch nghĩa hoặc giải thích thêm.

## 2. Review UI Strategy
Khi hiển thị thẻ `NOTEBOOK` trong `GrammarFlashcard.tsx`, phải tuân thủ layout phân tích:
- **Lỗi của tôi**: Background Rose (Đỏ nhạt), icon ☹️. Nhấn mạnh vào việc tự phản chiếu.
- **Cái bẫy (Trap)**: Background Slate (Xám), icon 🪤. Giúp cảnh giác.
- **Quy tắc vàng (Golden Rule)**: Background Amber (Vàng), icon ✨. Điểm chốt kiến thức.

## 3. Data Structure & Tags
Mỗi thẻ Mistake Notebook phải:
- Có `type: 'NOTEBOOK'`.
- Có `source: 'NOTEBOOK'`.
- Các tags tự động: `toeic, mistake`. Người dùng có thể thêm tags cụ thể như `adverb, tense`.

## 4. SM-2 Mapping
Thẻ Mistake Notebook sử dụng logic SM-2 tương tự Grammar cards để đảm bảo tần suất ôn tập khoa học.

> [!TIP]
> Mục tiêu của Mistake Notebook không chỉ là nhớ đáp án, mà là nhớ **tại sao đã sai** và **quy tắc để không sai lại**. Giao diện review phải làm nổi bật điều này.
