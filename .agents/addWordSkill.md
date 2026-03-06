---
name: Add Word & Vocabulary Management Skill
description: Quy chuẩn phát triển và chỉnh sửa tính năng Thêm Từ vựng (Add Word) cho VocaBee project.
---

# Add Word & Vocabulary Management Skill

Mọi thay đổi liên quan đến Form thêm từ, logic xử lý dữ liệu đầu vào và các Server Actions tương ứng phải tuân thủ các quy tắc này.

## 1. Form Structure & Validation
File: `components/AddWordForm.tsx`

- **Trường bắt buộc**:
  - `word` (Từ vựng): Trình duyệt và Server đều phải trim() dữ liệu.
  - `wordType` (Phân loại): Sử dụng các hằng số (N, V, ADJ, ADV, PHR, IDM).
  - `meaning` (Nghĩa tiếng Việt): Nội dung cốt lõi của Flashcard.
- **Trường tùy chọn**: `pronunciation`, `example`, `synonyms`.
- **Validation**:
  - Phải có thông báo Toast rõ ràng nếu thiếu dữ liệu.
  - Vô hiệu hóa nút Lưu (`disabled`) khi đang `loading` hoặc khi từ bị trùng.

## 2. Duplicate Check Logic
Quy trình kiểm tra từ đã tồn tại:
1. **Client-side**: Sử dụng `useEffect` với `debounce` (600ms) để gọi `checkDuplicateWordAction` ngay khi người dùng nhập từ (`term`).
2. **Visual Feedback**: Hiển thị cảnh báo màu đỏ (`rose-500`) và icon Alert ngay trên Input nếu phát hiện trùng.
3. **Server-side**: `addWordAction` phải kiểm tra lại một lần nữa trước khi thực hiện `prisma.vocabulary.create` để đảm bảo tính toàn vẹn dữ liệu cho từng người dùng (`userId`).

## 3. Server Actions Integration
File: `app/actions.ts`

- **Authentication**: Luôn gọi `getAuthenticatedUser()` đầu tiên. Nếu không có user, trả về lỗi "Cần đăng nhập".
- **Database**: Sử dụng `prisma.vocabulary` để thao tác.
- **Cache**: Luôn gọi `revalidatePath('/')` sau khi thêm/sửa/xóa thành công để cập nhật Dashboard.
- **Data Integrity**: Đảm bảo `word` được lưu dưới dạng lowercase hoặc trim() tùy theo yêu cầu tìm kiếm, nhưng hiển thị phải giữ nguyên định dạng của người dùng.

## 4. Design Consistency
- **Layout**: Sử dụng `.glass-panel` với bo góc `rounded-3xl`.
- **Interactions**: 
  - Loading state phải có `Loader2` (lucide-react) hoặc hiệu ứng xoay.
  - Hover hiệu ứng shadow glow (`shadow-[var(--shadow-glow)]`).
  - Sử dụng `getWordTypeStyles` từ `lib/utils` để đồng bộ màu sắc theo loại từ.

> [!IMPORTANT]
> Khi thêm trường mới vào Form, hãy nhớ cập nhật cả `prisma/schema.prisma` và các hàm `addWordAction`, `updateWordAction` tương ứng.
