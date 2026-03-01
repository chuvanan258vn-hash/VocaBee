---
name: SM-2 Spaced Repetition Logic Skill
description: Quy chuẩn thuật toán SM-2 và logic vận hành Flashcard Mode cho VocaBee project.
---

# SM-2 Spaced Repetition Logic Skill

Mọi thay đổi liên quan đến thuật toán ôn tập, giao diện Flashcard (Flip & Input) phải tuân thủ các quy tắc logic này.

## 1. Core Algorithm (SM-2)
Dựa trên `lib/sm2.ts`, thuật toán tính toán `interval`, `repetition`, và `efactor` mới:

- **Quality Score (q)**: 
  - `0`: Quên hoàn toàn (Forgot).
  - `3`: Nhớ nhưng rất khó khăn.
  - `4`: Nhớ được sau một chút suy nghĩ.
  - `5`: Nhớ ngay lập tức (Perfect).
- **Logic Repetition**:
  - Nếu `q >= 3`: `repetition = repetition + 1`.
    - `n=1`: `interval = 1` ngày.
    - `n=2`: `interval = 6` ngày.
    - `n>2`: `interval = Round(previous_interval * efactor)`.
  - Nếu `q < 3`: `repetition = 0`, `interval = 1` ngày.
- **Ease Factor (EF)**: 
  - Công thức: `EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))`.
  - Giới hạn: `Minimum EF = 1.3`.
- **Fuzz Logic**: Thêm 5% biến động ngẫu nhiên cho `interval > 4` để tránh việc quá nhiều thẻ dồn vào cùng một ngày.
- **Review Time**: Mọi lịch ôn tập đều được quy chuẩn về **4:00 AM** của ngày đến hạn.

## 2. Flashcard Mode Interactions
### Flip Mode (Standard)
- Hiển thị: Word -> Flip -> Meaning + Example + TTS.
- Người dùng tự đánh giá chất lượng (q = 0, 3, 4, 5).

### Input Mode (Active Recall)
- Hiển thị: Meaning (+ Example masked word) -> User types Word.
- **Typing Bonus**: Nếu gõ đúng hoàn toàn mà **không dùng Hint** + chọn chất lượng >= 4 -> Tặng điểm thưởng và tăng EF nhẹ.
- **Smart Hint**: Revealing pattern (vd: `A _ _ _ e` cho `Apple`). Sử dụng hint sẽ mất quyền nhận Typing Bonus.

## 3. Agent Development Rules
1. **Never modify Core Math**: Không thay đổi các hằng số trong `calculateSm2` trừ khi có yêu cầu đặc biệt về cân chỉnh thuật toán.
2. **Context Awareness**: Khi sửa `Flashcard.tsx` hoặc `FlashcardInput.tsx`, phải đảm bảo các hàm `onNext` và `handleReview` được gọi với đúng tham số quality.
3. **Consistency**: Đảm bảo trải nghiệm giữa Flip mode và Input mode đồng nhất về mặt dữ liệu (đều cập nhật qua Server Action `reviewWordAction`).

> [!TIP]
> Luôn kiểm tra file `lib/sm2.ts` để cập nhật skill này nếu có thay đổi về logic toán học.
