---
name: VocaBee Ethereal Flow Design System
description: Quy chuẩn thiết kế Premium cho ứng dụng VocaBee SRS. Agent phải tuân thủ để đảm bảo tính nhất quán giữa các màn hình và component.
---

# VocaBee Ethereal Flow Design System

Mọi thay đổi về UI, thêm mới component hoặc chỉnh sửa Layout phải tuân thủ tuyệt đối các quy tắc dưới đây để duy trì phong cách "Ethereal Flow" (Hiện đại, Cao cấp, Sống động).

## 1. Core Visual Principles
- **Aesthetic**: Glassmorphism, Soft Shadows, Vibrant Gradients, Micro-animations.
- **Tone**: Professional yet approachable, using a palette that feels "alive".
- **Semantic Color Coding**: 
  - **Amber/Gold**: Vocabulary, Rewards, Streaks.
  - **Blue/Purple**: Grammar, Mistake Notebook, Analysis.

## 2. Design Tokens (CSS Variables)
Sử dụng các biến CSS được định nghĩa trong `app/globals.css`:
- **Vocabulary Palette (Amber)**:
  - `var(--primary)` (#F59E0B): Golden Amber cho các hành động chính.
  - `.amber-glass-gradient`: Kính mờ + Amber gradient.
- **Grammar/Mistake Palette (Blue/Purple)**:
  - `.blue-purple-gradient`: Dùng cho Grammar cards.
  - `.shadow-glow-purple`: Hiệu ứng tỏa sáng tím cho Mistake Notebook.
- **General**:
  - `var(--background)` (#FDFBF7 / #0B0F19).
  - `var(--surface)` (#FFFFFF / #131B2F).
  - `.glass`: Blur 20px, border mờ, đổ bóng nhẹ.

## 3. Component Standards
- **Typography**: `font-family: var(--font-display)` (Plus Jakarta Sans).
- **Buttons**:
  - `.btn-amber`: Nút chính Amber.
  - `.btn-premium-purple`: Nút cho Grammar/Mistake (mới).
- **Inputs**:
  - `.input-premium`: Bo góc 16px, focus glow.
- **Cards**: Bo góc lớn (`rounded-3xl` hoặc `rounded-[2.5rem]`).

## 4. Animations & Interactions
- **Framework**: **Framer Motion**.
- **Micro-animations**: Scale hover, tap, AnimatePresence transitions.
- **Glow Effects**: Dùng shadow-glow để làm nổi bật thành phần quan trọng.

## 5. Agent Workflow Rules
1. **Context Check**: Xác định component thuộc mảng Từ vựng hay Ngữ pháp để chọn palette màu phù hợp.
2. **Vietnamese First**: Đảm bảo mọi nội dung hiển thị đều hỗ trợ tiếng Việt chuẩn, encoding UTF-8.
3. **Responsive**: Luôn thiết kế Mobile-first.
4. **Adaptive**: Hỗ trợ Dark mode hoàn chỉnh qua biến CSS.

> [!IMPORTANT]
> Tuyệt đối không sử dụng các màu cơ bản (plain red, plain blue). Mọi màu sắc phải được lấy từ Design Tokens hoặc được phối gradient hài hòa. Tránh lạm dụng inline styles.
