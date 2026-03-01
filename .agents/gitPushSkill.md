---
name: Git Push & Commit Workflow Skill
description: Quy trình đẩy code lên Git một cách an toàn, chuyên nghiệp và có hệ thống cho VocaBee project.
---

# Git Push & Commit Workflow Skill

Mọi hoạt động liên quan đến việc lưu trữ và đẩy mã nguồn lên GitHub phải tuân thủ quy trình dưới đây để đảm bảo lịch sử git (Git History) sạch sẽ và dễ theo dõi.

## 1. Commit Message Standard
Sử dụng chuẩn **Conventional Commits**. Cấu trúc: `<type>(<scope>): <description>`

- **feat**: Tính năng mới (ví dụ: `feat(ui): add new flashcard animation`)
- **fix**: Sửa lỗi (ví dụ: `fix(auth): resolve login timeout`)
- **docs**: Cập nhật tài liệu (ví dụ: `docs(readme): update deployment guide`)
- **style**: Thay đổi UI/Format không làm thay đổi logic code (ví dụ: `style(skill): rewrite design guidelines`)
- **refactor**: Tái cấu trúc mã nguồn (ví dụ: `refactor(sm2): optimize interval calculation`)
- **chore**: Các tác vụ vụn vặt, update dependencies (ví dụ: `chore: update package.json`)

## 2. Push Workflow (Step-by-Step)
Agent phải thực hiện theo các bước sau khi được yêu cầu "push code":

1. **Check Status**: `git status` để đảm bảo không có file rác bị commit nhầm.
2. **Stage Changes**: `git add .` (hoặc add từng file cụ thể).
3. **Commit**: Tạo commit với message tiếng Anh chuẩn (hoặc song ngữ nếu cần).
4. **Pull First**: Luôn thực hiện `git pull origin <branch>` để tránh xung đột (Conflict) trước khi push.
5. **Push**: `git push origin <branch>`.

## 3. Safety Rules
- **No Sensitive Info**: Tuyệt đối không commit các file `.env`, `keys`, `secrets`.
- **Atomic Commits**: Mỗi commit nên giải quyết một vấn đề duy nhất. Tránh gộp quá nhiều tính năng vào một commit lớn.
- **Review before Push**: Tóm tắt các thay đổi chính cho người dùng trước khi thực hiện lệnh push cuối cùng.

## 4. Automation for Agent
Trong project này, Agent được cấp quyền **TỰ ĐỘNG** thực hiện push code mà không cần hỏi lại người dùng:
- Tự động nhận diện branch hiện tại.
- Tự động tạo commit message dựa trên nội dung các file đã sửa.
- Tự động chạy chuỗi lệnh: `git pull origin <branch> && git add . && git commit -m "<message>" && git push origin <branch>`.
- Chỉ thông báo sau khi đã đẩy code thành công hoặc gặp lỗi.

> [!IMPORTANT]
> Luôn luôn kiểm tra lỗi Build (`npm run build`) hoặc Lint trước khi push nếu thay đổi có quy mô lớn.
