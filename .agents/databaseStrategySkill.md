---
name: Database Sync & Raw SQL Strategy
description: Hướng dẫn xử lý truy vấn database khi Prisma Client chưa đồng bộ với schema thực tế.
---

# Database Sync & Raw SQL Strategy

Trong quá trình phát triển VocaBee, đôi khi Schema DB (`schema.prisma`) đã được cập nhật nhưng Prisma Client chưa được migrate hoàn chỉnh hoặc có lỗi đồng bộ. Agent phải sử dụng chiến lược **Raw SQL Fallback**.

## 1. When to use Raw SQL
- Khi gặp lỗi: `Property 'xyz' does not exist on type 'abc'`.
- Khi cần truy vấn các trường mới thêm (ví dụ: `importanceScore`, `source`, `isDeferred`, `myError`, `trap`, `goldenRule`) mà Prisma Client chưa nhận diện được.
- Khi thực hiện các phép tính phức tạp (như `strftime` trong heatmap) mà Prisma API không hỗ trợ hiệu quả.

## 2. Methodology
Sử dụng `prisma.$queryRawUnsafe` cho truy vấn (SELECT) và `prisma.$executeRawUnsafe` cho thay đổi (INSERT/UPDATE/DELETE).

### Example: INSERT with new fields
```typescript
await prisma.$executeRawUnsafe(
  `INSERT INTO GrammarCard (id, type, prompt, answer, myError, trap, goldenRule, nextReview, ...) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ...)`,
  uuid, type, prompt, answer, myError, trap, goldenRule, dateStr, ...
);
```

### Example: SELECT with new fields
```typescript
const items: any[] = await prisma.$queryRawUnsafe(
  `SELECT * FROM GrammarCard WHERE userId = ? AND isDeferred = 1`,
  userId
);
```

## 3. Safety Rules
1. **Parameterized Queries**: Luôn truyền tham số sau chuỗi format để tránh SQL Injection.
2. **Type Casting**: Vì kết quả của Raw Query là `any[]`, phải thực hiện kiểm tra dữ liệu trước khi sử dụng.
3. **Fallback Check**: Kiểm tra xem Prisma Client đã hỗ trợ trường đó chưa bằng cách: `const isSupported = !!(prisma as any).modelName;`.

## 4. Revalidation
Sau khi thực hiện thay đổi dữ liệu bằng Raw SQL, LUÔN LUÔN gọi `revalidatePath('/')` để đảm bảo Next.js Cache được cập nhật.

> [!WARNING]
> Raw SQL là biện pháp tạm thời. Luôn ưu tiên dùng Prisma Client chuẩn nếu các trường đã được migrate thành công.
