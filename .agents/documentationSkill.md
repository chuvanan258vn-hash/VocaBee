---
name: Documentation & Progress Tracking Skill
description: Quy chuẩn bắt buộc về việc cập nhật README.md, task.md và các artifacts trong quá trình làm việc.
---

# Documentation & Progress Tracking Skill

Tại VocaBee, việc duy trì tài liệu chính xác và cập nhật là ưu tiên hàng đầu. Agent phải tuân thủ quy trình này trong mọi phiên làm việc.

## 1. README.md - The Source of Truth
- **Cập nhật ngay lập tức**: Khi một tính năng mới được triển khai thành công (ví dụ: Mistake Notebook, Grammar Redesign), Agent phải cập nhật phần tính năng trong `README.md`.
- **Cấu trúc**: Giữ cho `README.md` luôn gọn gàng, sử dụng GitHub Alerts (`> [!TIP]`, `> [!IMPORTANT]`) để làm nổi bật thông tin.
- **Visuals**: Đề cập đến các hiệu ứng UI (Glassmorphism, Animations) để người đọc nắm bắt được "vibe" của ứng dụng.

## 2. task.md - Real-time Progress
- **Vị trí**: Nằm trong thư mục `.gemini/antigravity/brain/<id>/task.md`.
- **Cập nhật**: Sử dụng dấu `[ ]` (chưa làm), `[/]` (đang làm), và `[x]` (đã xong).
- **Tính granular**: Chia nhỏ task thành các sub-tasks có thể thực thi được trong 1-3 bước.

## 3. Workflow Artifacts
- **Implementation Plan**: Luôn tạo plan trước khi thực hiện các task phức tạp (như thay đổi database, redesign UI diện rộng).
- **Walkthrough**: Sau khi hoàn thành và verify, tạo walkthrough kèm theo link tới file và mô tả thay đổi để người dùng checklist.

## 4. Language Standard
- **Bắt buộc**: Hỗ trợ tiếng Việt chính xác trong mọi tài liệu hướng dẫn cho người dùng.
- **Encoding**: Luôn đảm bảo UTF-8 để tránh lỗi font tiếng Việt.

> [!IMPORTANT]
> Tài liệu không chỉ là để lưu trữ, mà là để "bàn giao" giữa các Agent hoặc giữa Agent và User. Hãy viết sao cho một người mới vào project có thể nắm bắt được ngay.
