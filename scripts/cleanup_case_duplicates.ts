import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Bắt đầu dọn dẹp các từ vựng trùng lặp (phân biệt hoa thường) ---');

  // Lấy tất cả user (vì duplicate được tính theo per user)
  const users = await prisma.user.findMany();

  let totalDeleted = 0;
  let totalUpdated = 0;

  for (const user of users) {
    console.log(`\nĐang kiểm tra user: ${user.email} (${user.id})`);

    // Lấy tất cả từ vựng của user này
    const allWords = await prisma.vocabulary.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    // Group theo từ ở dạng chữ thường
    const grouped = new Map<string, any[]>();
    for (const w of allWords) {
      const lowerWord = w.word.toLowerCase();
      if (!grouped.has(lowerWord)) {
        grouped.set(lowerWord, []);
      }
      grouped.get(lowerWord)!.push(w);
    }

    // Xử lý các nhóm có nhiều hơn 1 từ
    for (const [lowerWord, group] of grouped.entries()) {
      if (group.length > 1) {
        console.log(`\nPhát hiện từ trùng lặp: "${lowerWord}" (Số lượng: ${group.length})`);
        
        // Tìm bản ghi có tiến độ học tập tốt nhất (interval lơn nhất, hoặc repetition lớn nhất)
        let bestRecord = group[0];
        for (let i = 1; i < group.length; i++) {
          const current = group[i];
          if (
            current.interval > bestRecord.interval ||
            (current.interval === bestRecord.interval && current.repetition > bestRecord.repetition) ||
            (current.interval === bestRecord.interval && current.repetition === bestRecord.repetition && current.efactor > bestRecord.efactor)
          ) {
            bestRecord = current;
          }
        }

        console.log(`  -> Giữ lại bản ghi ID: ${bestRecord.id} (Word: ${bestRecord.word}, Interval: ${bestRecord.interval}, Rep: ${bestRecord.repetition})`);

        // Xóa các bản ghi còn lại và đảm bảo bản ghi tốt nhất được chữ thường
        const idsToDelete = group.filter(w => w.id !== bestRecord.id).map(w => w.id);
        
        if (idsToDelete.length > 0) {
           await prisma.vocabulary.deleteMany({
             where: { id: { in: idsToDelete } }
           });
           totalDeleted += idsToDelete.length;
           console.log(`  -> Đã xóa ${idsToDelete.length} bản ghi cũ.`);
        }

        // Đảm bảo bản ghi giữ lại được chuyển thành viết thường (toLowerCase)
        if (bestRecord.word !== lowerWord) {
           await prisma.vocabulary.update({
             where: { id: bestRecord.id },
             data: { word: lowerWord }
           });
           totalUpdated++;
           console.log(`  -> Đã cập nhật "${bestRecord.word}" thành "${lowerWord}".`);
        }
      } else {
        // Nhóm chỉ có 1 từ, kiểm tra xem nó đã viết thường chưa
        const singleRecord = group[0];
        if (singleRecord.word !== lowerWord) {
           await prisma.vocabulary.update({
             where: { id: singleRecord.id },
             data: { word: lowerWord }
           });
           totalUpdated++;
           console.log(`Đã cập nhật đơn lẻ: "${singleRecord.word}" thành "${lowerWord}"`);
        }
      }
    }
  }

  console.log(`\n--- Hoàn tất dọn dẹp ---`);
  console.log(`Tổng số bản ghi đã xóa (trùng lặp): ${totalDeleted}`);
  console.log(`Tổng số bản ghi đã cập nhật (viết thường lại): ${totalUpdated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
