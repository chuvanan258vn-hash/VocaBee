---
name: VocaBee Ethereal Flow Design System
description: Quy chuẩn thiết kế Premium cho ứng dụng VocaBee SRS. Agent phải tuân thủ để đảm bảo tính nhất quán giữa các màn hình và component.
---

# VocaBee Ethereal Flow Design System

Mọi thay đổi về UI, thêm mới component hoặc chỉnh sửa Layout phải tuân thủ tuyệt đối các quy tắc dưới đây để duy trì phong cách "Ethereal Flow" (Hiện đại, Cao cấp, Sống động).

## 1. Core Visual Principles
- **Aesthetic**: Glassmorphism, Soft Shadows, Vibrant Gradients, Micro-animations.
- **Tone**: Professional yet approachable, using a palette that feels "alive".

## 2. Design Tokens (CSS Variables)
Sử dụng các biến CSS được định nghĩa trong `app/globals.css`:
- **Colors**:
  - `var(--primary)` (#F59E0B): Golden Amber cho các hành động chính.
  - `var(--secondary)` (#B45309): Màu bổ trợ cho Amber.
  - `var(--background)` (#FDFBF7 / #0B0F19): Nền nhẹ nhàng/sâu lắng.
  - `var(--surface)` (#FFFFFF / #131B2F): Nền card/panel.
  - `var(--progress)` (#10B981): Màu thành công/tiến độ.
- **Glassmorphism**:
  - `.glass`: Blur 20px, border mờ, đổ bóng nhẹ.
  - `.glass-panel`: Thường dùng cho các panel nội dung lớn.
  - `.amber-glass-gradient`: Kết hợp giữa kính mờ và gradient Amber nhẹ.

## 3. Component Standards
- **Typography**: Sử dụng `font-family: var(--font-display)` (Lexend/Plus Jakarta Sans). Ưu tiên `.font-plus` cho các tiêu đề quan trọng.
- **Buttons**:
  - `.btn-amber`: Nút chính với hiệu ứng hover nâng cao và shadow glow.
- **Inputs**:
  - `.input-premium`: Bo góc 16px, transition mượt mà, focus có hiệu ứng glow primary.
- **Cards**: Bo góc lớn (`rounded-3xl` hoặc `rounded-[2.5rem]`).

## 4. Animations & Interactions
- **Framework**: Sử dụng **Framer Motion** (`framer-motion`).
- **Micro-animations**:
  - `whileHover={{ scale: 1.02 }}`
  - `whileTap={{ scale: 0.98 }}`
  - Sử dụng `AnimatePresence` cho các trạng thái xuất hiện/biến mất.
- **Glow Effects**: Dùng `.shadow-glow-primary` hoặc `drop-shadow` để làm nổi bật các thành phần quan trọng.

## 5. Agent Workflow Rules
1. **Analyze First**: Trước khi sửa UI, đọc `app/globals.css` để xem các utility class có sẵn.
2. **Reuse Classes**: Ưu tiên dùng các class `.glass`, `.btn-amber`, `.input-premium` thay vì viết inline styles.
3. **Adaptive Design**: Luôn hỗ trợ Dark mode thông qua class `.dark` và biến CSS.
4. **Consistency**: Đảm bảo các khoảng cách (`gap`, `padding`) tuân thủ hệ thống grid của Tailwind (thường là bội số của 4).

> [!IMPORTANT]
> Tuyệt đối không sử dụng các màu cơ bản (plain red, plain blue). Mọi màu sắc phải được lấy từ Design Tokens hoặc được phối gradient hài hòa.
