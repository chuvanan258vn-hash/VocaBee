import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu quá trình đồng bộ dữ liệu từ SQLite sang PostgreSQL (Supabase)...');
  
  // Xác định đường dẫn tương đối tới file db
  const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
  console.log('Đang đọc SQLite file tại:', dbPath);
  
  let sqliteDb;
  try {
    sqliteDb = new Database(dbPath, { fileMustExist: true });
  } catch (error) {
    console.error('Không tìm thấy file dev.db của SQLite. Đảm bảo bạn đang chạy script ở thư mục gốc của dự án.');
    process.exit(1);
  }

  // >>> Đọc và map bảng User
  console.log('Đang đồng bộ bảng User...');
  const users = sqliteDb.prepare('SELECT * FROM User').all() as any[];
  for (const user of users) {
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          dailyNewWordGoal: user.dailyNewWordGoal,
          dailyNewGrammarGoal: user.dailyNewGrammarGoal,
          dailyMaxVocabReview: user.dailyMaxVocabReview,
          dailyMaxGrammarReview: user.dailyMaxGrammarReview,
          streakCount: user.streakCount,
          lastGoalMetDate: user.lastGoalMetDate ? new Date(user.lastGoalMetDate) : null,
          points: user.points,
          streakFreeze: user.streakFreeze,
          createdAt: new Date(user.createdAt),
          securityQuestion: user.securityQuestion,
          securityAnswer: user.securityAnswer,
        }
      });
    } catch (e) {
      console.error(`Lỗi Migrate User ${user.email}:`, e);
    }
  }
  console.log(`✅ Đã đồng bộ ${users.length} Users.`);

  // >>> Đọc và map bảng Vocabulary
  console.log('Đang đồng bộ bảng Vocabulary...');
  const words = sqliteDb.prepare('SELECT * FROM Vocabulary').all() as any[];
  for (const word of words) {
    try {
      await prisma.vocabulary.upsert({
        where: { id: word.id },
        update: {},
        create: {
          id: word.id,
          word: word.word,
          wordType: word.wordType,
          meaning: word.meaning,
          pronunciation: word.pronunciation,
          example: word.example,
          synonyms: word.synonyms,
          context: word.context,
          importanceScore: word.importanceScore,
          source: word.source,
          isDeferred: Boolean(word.isDeferred), // SQLite lưu boolean là 0/1
          nextReview: new Date(word.nextReview),
          interval: word.interval,
          repetition: word.repetition,
          efactor: word.efactor,
          userId: word.userId,
          createdAt: new Date(word.createdAt),
          updatedAt: new Date(word.updatedAt),
        }
      });
    } catch (e) {
      console.error(`Lỗi Migrate Vocabulary ${word.word}:`, e);
    }
  }
  console.log(`✅ Đã đồng bộ ${words.length} Vocabulary words.`);

  // >>> Đọc và map bảng GrammarCard
  console.log('Đang đồng bộ bảng GrammarCard...');
  const grammarCards = sqliteDb.prepare('SELECT * FROM GrammarCard').all() as any[];
  for (const card of grammarCards) {
    try {
      await prisma.grammarCard.upsert({
        where: { id: card.id },
        update: {},
        create: {
          id: card.id,
          type: card.type,
          prompt: card.prompt,
          answer: card.answer,
          meaning: card.meaning,
          options: card.options,
          hint: card.hint,
          explanation: card.explanation,
          myError: card.myError,
          trap: card.trap,
          goldenRule: card.goldenRule,
          tags: card.tags,
          toeicPart: card.toeicPart,
          grammarCategory: card.grammarCategory,
          signalKeywords: card.signalKeywords,
          formula: card.formula,
          importanceScore: card.importanceScore,
          source: card.source,
          isDeferred: Boolean(card.isDeferred), // SQLite lưu boolean là 0/1
          nextReview: new Date(card.nextReview),
          interval: card.interval,
          repetition: card.repetition,
          efactor: card.efactor,
          userId: card.userId,
          createdAt: new Date(card.createdAt),
          updatedAt: new Date(card.updatedAt),
        }
      });
    } catch (e) {
      console.error(`Lỗi Migrate GrammarCard ${card.id}:`, e);
    }
  }
  console.log(`✅ Đã đồng bộ ${grammarCards.length} Grammar cards.`);

  console.log('🎉 Đã hoàn tất di chuyển dữ liệu thành công!');
}

main()
  .catch((e) => {
    console.error('Có lỗi xảy ra trong quá trình sync:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
