'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth, signOut } from '@/auth'
import { calculateSm2 } from '@/lib/sm2'

import { getAuthenticatedUser } from '@/lib/user'

export async function signOutAction() {
  await signOut();
}

export async function addWordAction(formData: any) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Bạn cần đăng nhập để thêm từ! 🐝" };

  const word = formData.word.trim()

  try {
    // 1. Kiểm tra xem từ này đã có trong "Tổ ong" của user này chưa
    const existingWord = await prisma.vocabulary.findFirst({
      where: {
        word: word,
        userId: user.id
      }
    })

    if (existingWord) {
      return { error: `Từ "${word}" đã có trong tổ ong rồi! 🐝` }
    }

    // 2. Nếu chưa có, tiến hành lưu mới
    await prisma.vocabulary.create({
      data: {
        word: word,
        wordType: formData.wordType,
        meaning: formData.meaning,
        pronunciation: formData.pronunciation,
        example: formData.example,
        synonyms: formData.synonyms,
        userId: user.id,
        // Các trường SRS sẽ tự động lấy giá trị default (0, 2.5, now)
      }
    })

    // Làm mới lại trang để hiển thị dữ liệu mới
    revalidatePath('/')
    return { success: true }

  } catch (error) {
    console.error("Error creating word:", error)
    return { error: "Lỗi kỹ thuật, không thể lưu từ." }
  }
}

export async function updateWordAction(id: string, formData: any) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Bạn cần đăng nhập để sửa từ! 🐝" };

  try {
    const existingWord = await prisma.vocabulary.findUnique({
      where: { id: id }
    });

    if (!existingWord || existingWord.userId !== user.id) {
      return { error: "Không tìm thấy từ hoặc bạn không có quyền sửa." };
    }

    await prisma.vocabulary.update({
      where: { id: id },
      data: {
        word: formData.word,
        wordType: formData.wordType,
        meaning: formData.meaning,
        pronunciation: formData.pronunciation,
        example: formData.example,
        synonyms: formData.synonyms,
      }
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error updating word:", error);
    return { error: "Lỗi kỹ thuật, không thể cập nhật từ." };
  }
}

export async function deleteWordAction(id: string) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Bạn cần đăng nhập để xóa từ! 🐝" };

  try {
    const existingWord = await prisma.vocabulary.findUnique({
      where: { id: id }
    });

    if (!existingWord || existingWord.userId !== user.id) {
      return { error: "Không tìm thấy từ hoặc bạn không có quyền xóa." };
    }

    await prisma.vocabulary.delete({
      where: { id: id }
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error deleting word:", error);
    return { error: "Lỗi kỹ thuật, không thể xóa từ." };
  }
}
export async function reviewWordAction(id: string, quality: number) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Bạn cần đăng nhập để ôn tập! 🐝" };

  try {
    const word = await prisma.vocabulary.findUnique({
      where: { id: id }
    });

    if (!word || word.userId !== user.id) {
      return { error: "Không tìm thấy từ hoặc bạn không có quyền." };
    }

    // Award points: 1 point for any review, +1 bonus for Good/Easy (quality >= 4)
    let pointsToAdd = 1;
    if (quality >= 4) pointsToAdd += 1;

    // Update points immediately
    await prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: pointsToAdd } }
    });

    // --- THUẬT TOÁN SM-2 ---
    const { interval: nextInterval, repetition: nextRepetition, efactor: nextEfactor, nextReview: nextReviewDate } = calculateSm2({
      interval: word.interval,
      repetition: word.repetition,
      efactor: word.efactor,
      quality: quality
    });

    await prisma.vocabulary.update({
      where: { id: id },
      data: {
        interval: nextInterval,
        repetition: nextRepetition,
        efactor: nextEfactor,
        nextReview: nextReviewDate
      }
    });

    // --- STREAK LOGIC ---
    const now = new Date();
    const todayStart = new Date(now);
    if (now.getHours() < 4) todayStart.setDate(todayStart.getDate() - 1);
    todayStart.setHours(4, 0, 0, 0);

    const goal = (user as any).dailyNewWordGoal || 20;
    const lastGoalMetDate = (user as any).lastGoalMetDate ? new Date((user as any).lastGoalMetDate) : null;

    // Check if goal already met "today"
    const alreadyMetToday = lastGoalMetDate && lastGoalMetDate >= todayStart;

    if (!alreadyMetToday) {
      const learnedToday = await prisma.vocabulary.count({
        where: {
          userId: user.id,
          repetition: { gte: 1 },
          updatedAt: { gte: todayStart }
        }
      });

      if (learnedToday >= goal) {
        let newStreak = 1;
        // Check for streak freeze usage if streak was broken
        let freezeUsed = false;

        if (lastGoalMetDate) {
          const yesterdayStart = new Date(todayStart);
          yesterdayStart.setDate(yesterdayStart.getDate() - 1);

          // If last met was exactly yesterday, increment
          if (lastGoalMetDate >= yesterdayStart && lastGoalMetDate < todayStart) {
            newStreak = ((user as any).streakCount || 0) + 1;
          } else if ((user as any).streakFreeze > 0) {
            // Logic: if they missed multiple days, but have a freeze, we could theoretically save them.
            // For simplicity, we only save if they missed *yesterday* but act as if they didn't?
            // Actually, improved logic: if they are breaking a streak (currentStreak > 0 but lastMet < yesterday), 
            // we check if they HAVE a freeze. If so, we consume it and KEEP the streak.
            // BUT here we are *setting* the new streak. 
            // Realistically, the "freeze" should happen *on the day they missed*. 
            // Since we can't run background jobs easily, we check "Did they miss yesterday?" when they log in today.
            // Let's handle simple "Repair" logic here: if streak IS 0 (reset by dashboard load or time gap), allows buying back?
            // Simplified Approach for MVP: If they finish goal today, and lastGoalMetDate was < yesterday, 
            // normally streak resets to 1. 
            // IF they have a freeze, we check if the gap is small enough (e.g. 1 day missed). 
            // If 1 day missed & freeze > 0 -> Consume freeze, streak = oldStreak + 1.
            const twoDaysAgo = new Date(yesterdayStart);
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);

            if (lastGoalMetDate >= twoDaysAgo && lastGoalMetDate < yesterdayStart) {
              // Missed exactly 1 day
              newStreak = ((user as any).streakCount || 0) + 1;
              freezeUsed = true;
            }
          }
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            streakCount: newStreak,
            lastGoalMetDate: now,
            streakFreeze: freezeUsed ? { decrement: 1 } : undefined,
            // Bonus points for hitting daily goal
            points: { increment: 5 }
          } as any
        });
      }
    }

    revalidatePath('/');
    revalidatePath('/review');
    return { success: true, nextReview: nextReviewDate };

  } catch (error) {
    console.error("Error reviewing word:", error);
    return { error: "Lỗi khi cập nhật tiến độ học tập." };
  }
}

export async function importWordsAction(words: any[]) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Bạn cần đăng nhập để nhập từ! 🐝" };

  let successCount = 0;
  let failCount = 0;

  try {
    // Process one by one to avoid stopping everything if one fails (e.g. duplicate)
    for (const item of words) {
      if (!item.word || !item.meaning) {
        failCount++;
        continue;
      }

      try {
        await prisma.vocabulary.upsert({
          where: {
            word_userId: {
              word: item.word.trim(),
              userId: user.id
            }
          },
          update: {
            wordType: item.wordType || undefined,
            meaning: item.meaning || undefined,
            pronunciation: item.pronunciation || undefined,
            example: item.example || undefined,
            synonyms: item.synonyms || undefined,
          },
          create: {
            word: item.word.trim(),
            wordType: item.wordType || undefined,
            meaning: item.meaning || undefined,
            pronunciation: item.pronunciation || undefined,
            example: item.example || undefined,
            synonyms: item.synonyms || undefined,
            userId: user.id,
          }
        });
        successCount++;
      } catch (e) {
        console.error("Error importing row:", e);
        failCount++;
      }
    }

    revalidatePath('/');
    return { success: true, successCount, failCount };
  } catch (error) {
    console.error("Error in bulk import:", error);
    return { error: "Lỗi kỹ thuật khi nhập dữ liệu." };
  }
}

export async function getDashboardStats() {
  const userBase = await getAuthenticatedUser();
  if (!userBase) return null;

  // Re-fetch with include
  const user = await prisma.user.findUnique({
    where: { id: userBase.id },
    include: {
      _count: {
        select: { words: true }
      }
    }
  });

  if (!user) return null;

  // Calculate "Today" starting from 4:00 AM
  const now = new Date();
  const todayStart = new Date(now);
  if (now.getHours() < 4) {
    todayStart.setDate(todayStart.getDate() - 1);
  }
  todayStart.setHours(4, 0, 0, 0);

  // Count words studied today (any review action)
  const learnedToday = await prisma.vocabulary.count({
    where: {
      userId: user.id,
      updatedAt: { gte: todayStart },
      OR: [
        { repetition: { gte: 1 } },
        { nextReview: { gt: now } } // Recently forgotten or scheduled for future
      ]
    } as any
  });

  // Count due reviews (already studied words, even if currently forgotten)
  const dueReviews = await prisma.vocabulary.count({
    where: {
      userId: user.id,
      interval: { gt: 0 },
      nextReview: { lte: now },
      isDeferred: false
    } as any
  });

  // Calculate "Yesterday" starting from 4:00 AM
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  let currentStreak = (user as any).streakCount || 0;
  const lastGoalMetDate = (user as any).lastGoalMetDate ? new Date((user as any).lastGoalMetDate) : null;

  // Reset streak if last goal met was before yesterday (and wasn't met today yet)
  // Check for Streak Freeze protection visually
  let streakFrozen = false;
  if (lastGoalMetDate && lastGoalMetDate < yesterdayStart) {
    // Missed yesterday. Check if missed ONLY yesterday?
    const twoDaysAgo = new Date(yesterdayStart);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);

    if (lastGoalMetDate >= twoDaysAgo && (user as any).streakFreeze > 0) {
      // Missed 1 day but has freeze -> Show streak as frozen (not 0)
      streakFrozen = true;
      // Don't reset currentStreak variable for display
    } else {
      currentStreak = 0;
    }
  }

  // Count "from_test_highprio" items added today
  let testVocabToday = 0;

  try {
    const vTest: any = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM Vocabulary WHERE userId = ? AND source = 'TEST' AND importanceScore >= 3 AND createdAt >= ?`,
      user.id,
      todayStart.toISOString()
    );
    testVocabToday = Number(vTest[0]?.count || 0);
  } catch (e) {
    console.log("Smart Capture columns not yet migrated, skipping test item count");
    testVocabToday = 0;
  }

  // Fetch all unique word types for the user (for filtering)
  const wordTypesData = await prisma.vocabulary.findMany({
    where: { userId: user.id },
    select: { wordType: true },
    distinct: ['wordType']
  });
  const allWordTypes = wordTypesData
    .map(w => w.wordType?.trim())
    .filter((w): w is string => !!w)
    .sort();

  const baseVocabGoal = (user as any).dailyNewWordGoal || 20;

  return {
    dailyGoal: baseVocabGoal,
    learnedToday: learnedToday,
    testVocabToday,
    totalWords: user._count.words,
    dueReviews: dueReviews,
    allWordTypes,
    streak: currentStreak,
    points: (user as any).points || 0,
    streakFreeze: (user as any).streakFreeze || 0,
    streakFrozen
  };
}


export async function updateUserSettingsAction(data: { dailyGoal: number }) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        dailyNewWordGoal: data.dailyGoal
      } as any
    });

    revalidatePath('/');
    return { success: true, dailyGoal: (updatedUser as any).dailyNewWordGoal };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { error: "Lỗi kỹ thuật khi lưu cài đặt." };
  }
}

// --- GRAMMAR ACTIONS ---

export async function addGrammarCardAction(data: {
  type: string;
  prompt: string;
  answer: string;
  options?: string | null;
  hint?: string | null;
  explanation?: string | null;
  tags?: string | null;
}) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Bạn cần đăng nhập để thêm thẻ ngữ pháp! 🐝" };

  try {
    // Use raw SQL to avoid Prisma client sync issues
    await prisma.$executeRawUnsafe(
      `INSERT INTO GrammarCard (id, userId, type, prompt, answer, options, hint, explanation, tags, interval, repetition, efactor, nextReview, createdAt, updatedAt, isDeferred, source, importanceScore) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 2.0, ?, ?, ?, 0, 'MANUAL', 0)`,
      crypto.randomUUID(),
      user.id,
      data.type,
      data.prompt,
      data.answer,
      data.options,
      data.hint,
      data.explanation,
      data.tags,
      new Date().toISOString(),
      new Date().toISOString(),
      new Date().toISOString()
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error adding grammar card:", error);
    return { error: "Lỗi khi thêm thẻ ngữ pháp." };
  }
}

export async function reviewGrammarCardAction(id: string, grade: number) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Cần đăng nhập" };

  try {
    const card = await (prisma as any).grammarCard.findUnique({ where: { id } });
    if (!card) return { error: "Card not found" };

    // Award points
    let pointsToAdd = 1;
    if (grade >= 2) pointsToAdd += 1; // Bonus for Good/Easy

    await prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: pointsToAdd } }
    });

    // --- SM-2 MODIFIED FOR GRAMMAR ---
    // Note: The grammar logic was slightly different (using grade 0-3 instead of 0-5).
    // Mapping grade to SM-2 quality (0-5):
    // Grade 0 (Again) -> 0
    // Grade 1 (Hard) -> 3
    // Grade 2 (Good) -> 4
    // Grade 3 (Easy) -> 5
    let quality = 0;
    if (grade === 1) quality = 3;
    if (grade === 2) quality = 4;
    if (grade === 3) quality = 5;

    const { interval: nextInterval, repetition: nextRepetition, efactor: nextEfactor, nextReview: nextReviewDate } = calculateSm2({
      interval: card.interval,
      repetition: card.repetition,
      efactor: card.efactor,
      quality: quality
    });

    await (prisma as any).grammarCard.update({
      where: { id },
      data: {
        interval: nextInterval,
        repetition: nextRepetition,
        efactor: nextEfactor,
        nextReview: nextReviewDate
      }
    });

    revalidatePath('/review');
    return { success: true };
  } catch (error) {
    console.error("Error reviewing grammar card:", error);
    return { error: "Lỗi cập nhật tiến độ." };
  }
}

export async function seedVocabularyAction() {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "User not found" };

  const sampleWords = [
    { word: "resilient", meaning: "kiên cường, có khả năng hồi phục nhanh", example: "She is resilient in the face of adversity.", wordType: "Adjective", pronunciation: "/rɪˈzɪl.jənt/" },
    { word: "innovative", meaning: "sáng tạo, đổi mới", example: "The company is known for its innovative designs.", wordType: "Adjective", pronunciation: "/ˈɪn.ə.veɪ.tɪv/" },
    { word: "colleague", meaning: "đồng nghiệp", example: "I had lunch with my colleagues.", wordType: "Noun", pronunciation: "/ˈkɒl.iːɡ/" },
    { word: "deadline", meaning: "hạn chót", example: "We list to meet the deadline.", wordType: "Noun", pronunciation: "/ˈded.laɪn/" },
    { word: "negotiate", meaning: "đàm phán, thương lượng", example: "They are negotiating a new contract.", wordType: "Verb", pronunciation: "/nəˈɡəʊ.ʃi.eɪt/" },
    { word: "strategy", meaning: "chiến lược", example: "We need a marketing strategy.", wordType: "Noun", pronunciation: "/ˈstræt.ə.dʒi/" },
    { word: "ambitious", meaning: "tham vọng", example: "He has ambitious plans for the future.", wordType: "Adjective", pronunciation: "/æmˈbɪʃ.əs/" },
    { word: "proposal", meaning: "đề xuất", example: "The committee approved the proposal.", wordType: "Noun", pronunciation: "/prəˈpəʊ.zəl/" },
    { word: "efficient", meaning: "hiệu quả (năng suất)", example: "This new machine is very efficient.", wordType: "Adjective", pronunciation: "/ɪˈfɪʃ.ənt/" },
    { word: "launch", meaning: "ra mắt, khai trương", example: "They plan to launch the product in May.", wordType: "Verb", pronunciation: "/lɔːntʃ/" },
    { word: "objective", meaning: "mục tiêu", example: "Our main objective is to improve quality.", wordType: "Noun", pronunciation: "/əbˈdʒek.tɪv/" },
    { word: "revenue", meaning: "doanh thu", example: "The company's revenue increased by 10%.", wordType: "Noun", pronunciation: "/ˈrev.ə.nuː/" },
    { word: "competitor", meaning: "đối thủ cạnh tranh", example: "We are cheaper than our main competitor.", wordType: "Noun", pronunciation: "/kəmˈpet.ɪ.tər/" },
    { word: "delegation", meaning: "phái đoàn / sự ủy quyền", example: "A delegation from Japan visited the factory.", wordType: "Noun", pronunciation: "/ˌdel.ɪˈɡeɪ.ʃən/" },
    { word: "incentive", meaning: "sự khích lệ, ưu đãi", example: "Bonus payments provide an incentive to work harder.", wordType: "Noun", pronunciation: "/ɪnˈsen.tɪv/" },
    { word: "momentum", meaning: "đà (phát triển)", example: "The campaign is gaining momentum.", wordType: "Noun", pronunciation: "/məˈmen.təm/" },
    { word: "niche", meaning: "thị trường ngách / vị trí thích hợp", example: "They found a niche in the organic food market.", wordType: "Noun", pronunciation: "/niːʃ/" },
    { word: "outsourcing", meaning: "thuê ngoài", example: "Outsourcing can reduce costs.", wordType: "Noun", pronunciation: "/ˈaʊtˌsɔː.sɪŋ/" },
    { word: "startup", meaning: "khởi nghiệp", example: "Working at a startup is exciting.", wordType: "Noun", pronunciation: "/ˈstɑːt.ʌp/" },
    { word: "venture", meaning: "dự án kinh doanh (mạo hiểm)", example: "Their new venture failed.", wordType: "Noun", pronunciation: "/ˈven.tʃər/" }
  ];

  try {
    let count = 0;
    for (const w of sampleWords) {
      // Check if word exists
      const exists = await prisma.vocabulary.findFirst({
        where: { userId: user.id, word: w.word }
      });

      if (!exists) {
        await prisma.vocabulary.create({
          data: {
            word: w.word,
            meaning: w.meaning,
            example: w.example,
            wordType: w.wordType,
            pronunciation: w.pronunciation,
            source: "COLLECTION", // Standard collection
            userId: user.id,
            importanceScore: 2 // Normal priority
          }
        });
        count++;
      }
    }

    revalidatePath('/');
    return { success: true, count };
  } catch (error) {
    console.error("Error seeding vocabulary:", error);
    return { error: "Lỗi khi nạp dữ liệu mẫu." };
  }
}

export async function seedGrammarCardsAction() {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "User not found" };

  const sampleCards = [
    {
      type: "CLOZE",
      prompt: "He has ___ (work) here for five years.",
      answer: "worked",
      hint: "Sử dụng Have/Has + V3/ed cho thì Hiện tại hoàn thành.",
      explanation: "Present perfect (have/has + V3) dùng cho hành động bắt đầu trong quá khứ và còn tiếp diễn.",
      tags: "Tenses"
    },
    {
      type: "PRODUCTION",
      prompt: "Write a polite email sentence offering help using 'would'.",
      answer: "I would be happy to assist you with that.",
      hint: "Gợi ý: I + would + be happy + to...",
      explanation: "Cấu trúc 'would be happy to' là cách đề nghị giúp đỡ lịch sự trong môi trường công sở.",
      tags: "Modal Verbs"
    },
    {
      type: "ERROR_CORRECTION",
      prompt: "I look forward to meet you. — Find & fix the mistake",
      answer: "I look forward to meeting you.",
      hint: "Gợi ý: Chú ý động từ sau 'to'.",
      explanation: "Cấu trúc 'look forward to' đi kèm với V-ing.",
      tags: "Gerund"
    },
    {
      type: "CLOZE",
      prompt: "The manager, ___ approved the budget, left early.",
      answer: "who",
      hint: "Dùng đại từ quan hệ thay cho người.",
      explanation: "Đại từ quan hệ 'who' dùng thay thế cho danh từ chỉ người đóng vai trò chủ ngữ.",
      tags: "Relative Clauses"
    },
    {
      type: "MCQ",
      prompt: "If I ___ more time, I would travel more.",
      answer: "had",
      options: JSON.stringify(["have", "had", "will have", "has"]),
      hint: "Đây là câu điều kiện loại 2 (giả định loại 1).",
      explanation: "Câu điều kiện loại 2 (V-ed) diễn tả giả định trái ngược với hiện tại.",
      tags: "Conditionals"
    },
    {
      type: "PRODUCTION",
      prompt: "Transform to passive voice: 'The team completed the report.'",
      answer: "The report was completed by the team.",
      hint: "Chuyển tân ngữ 'The report' lên đầu và dùng was/were + V3.",
      explanation: "Câu bị động quá khứ đơn: was/were + V3/ed.",
      tags: "Passive Voice"
    },
    {
      type: "CLOZE",
      prompt: "She insisted ___ (go) to the meeting.",
      answer: "on going",
      hint: "Insist đi kèm với giới từ gì?",
      explanation: "Insist + on + V-ing: khăng khăng làm gì đó.",
      tags: "Prepositions"
    },
    {
      type: "ERROR_CORRECTION",
      prompt: "There is less employees this month. — Find & fix the mistake",
      answer: "There are fewer employees this month.",
      hint: "Gợi ý: employees là danh từ đếm được.",
      explanation: "Dùng 'fewer' cho danh từ đếm được số nhiều (employees).",
      tags: "Comparisons"
    },
    {
      type: "PRODUCTION",
      prompt: "Write a polite email sentence requesting an extension using 'could'.",
      answer: "Could you please grant me an extension on the deadline?",
      hint: "Gợi ý: Could you please + (động từ)...?",
      explanation: "Dùng 'Could you please' để đưa ra yêu cầu lịch sự.",
      tags: "Modal Verbs"
    },
    {
      type: "MCQ",
      prompt: "We missed the train ___ the heavy traffic.",
      answer: "because of",
      options: JSON.stringify(["because", "because of", "although", "despite"]),
      hint: "Phía sau là một cụm danh từ (heavy traffic).",
      explanation: "Dùng 'because of' trước một cụm danh từ (heavy traffic).",
      tags: "Connectors"
    }
  ];

  try {
    const isModelSync = !!(prisma as any).grammarCard;
    let createdCount = 0;

    for (const card of sampleCards) {
      if (isModelSync) {
        const existing = await (prisma as any).grammarCard.findFirst({
          where: { prompt: card.prompt, userId: user.id }
        });
        if (!existing) {
          await (prisma as any).grammarCard.create({
            data: { ...card, userId: user.id }
          });
          createdCount++;
        } else {
          // Update hint for existing cards
          await (prisma as any).grammarCard.update({
            where: { id: existing.id },
            data: { hint: card.hint }
          });
        }
      } else {
        // Raw SQL fallback logic (update or insert)
        const existing: any = await prisma.$queryRawUnsafe(
          `SELECT id FROM GrammarCard WHERE prompt = ? AND userId = ? LIMIT 1`,
          card.prompt, user.id
        );

        if (existing && existing.length > 0) {
          await prisma.$executeRawUnsafe(
            `UPDATE GrammarCard SET hint = ? WHERE id = ?`,
            card.hint, existing[0].id
          );
        } else {
          await prisma.$executeRawUnsafe(
            `INSERT INTO GrammarCard (id, type, prompt, answer, options, hint, explanation, tags, userId, nextReview, interval, repetition, efactor) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            crypto.randomUUID(), card.type, card.prompt, card.answer, card.options || null, card.hint || "", card.explanation, card.tags, user.id,
            new Date().toISOString(), 0, 0, 2.0
          );
          createdCount++;
        }
      }
    }
    revalidatePath('/');
    return { success: true, count: createdCount };
  } catch (error) {
    console.error("Error seeding cards:", error);
    return { error: "Lỗi khi nạp dữ liệu mẫu." };
  }
}

export async function importGrammarCardsAction(cards: any[]) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "User not found" };

  let successCount = 0;
  let failCount = 0;

  try {
    const isModelSync = !!(prisma as any).grammarCard;

    for (const item of cards) {
      if (!item.prompt || !item.answer) {
        failCount++;
        continue;
      }

      const cardType = (item.type || "PRODUCTION").toUpperCase().trim();
      const promptTrim = item.prompt.trim();
      const answerTrim = item.answer.trim();
      const optionsStr = item.options ? String(item.options).trim() : null;
      const hintStr = item.hint ? String(item.hint).trim() : "";
      const explanationStr = item.explanation ? String(item.explanation).trim() : "";
      const tagsStr = item.tags ? String(item.tags).trim() : "";

      try {
        let existingId: string | null = null;

        if (isModelSync) {
          const existing = await (prisma as any).grammarCard.findFirst({
            where: { prompt: promptTrim, userId: user.id }
          });
          if (existing) existingId = existing.id;
        } else {
          // Fallback Raw Query to check existence
          const check: any = await prisma.$queryRawUnsafe(
            `SELECT id FROM GrammarCard WHERE prompt = ? AND userId = ? LIMIT 1`,
            promptTrim,
            user.id
          );
          if (check && check.length > 0) existingId = check[0].id;
        }

        if (existingId) {
          if (isModelSync) {
            await (prisma as any).grammarCard.update({
              where: { id: existingId },
              data: {
                type: cardType,
                answer: answerTrim,
                options: optionsStr,
                hint: hintStr,
                explanation: explanationStr,
                tags: tagsStr,
              }
            });
          } else {
            await prisma.$executeRawUnsafe(
              `UPDATE GrammarCard SET type = ?, answer = ?, options = ?, hint = ?, explanation = ?, tags = ? WHERE id = ?`,
              cardType, answerTrim, optionsStr, hintStr, explanationStr, tagsStr, existingId
            );
          }
        } else {
          if (isModelSync) {
            await (prisma as any).grammarCard.create({
              data: {
                type: cardType,
                prompt: promptTrim,
                answer: answerTrim,
                options: optionsStr,
                hint: hintStr,
                explanation: explanationStr,
                tags: tagsStr,
                userId: user.id
              }
            });
          } else {
            await prisma.$executeRawUnsafe(
              `INSERT INTO GrammarCard (id, type, prompt, answer, options, hint, explanation, tags, userId, nextReview, interval, repetition, efactor) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              crypto.randomUUID(), cardType, promptTrim, answerTrim, optionsStr, hintStr, explanationStr, tagsStr, user.id,
              new Date().toISOString(), 0, 0, 2.0
            );
          }
        }
        successCount++;
      } catch (e) {
        console.error("Error importing grammar row:", e);
        failCount++;
      }
    }

    revalidatePath('/');
    return { success: true, successCount, failCount };
  } catch (error) {
    console.error("Error in grammar bulk import:", error);
    return { error: "Lỗi dữ liệu hoặc cấu trúc bảng. Vui lòng kiểm tra lại file." };
  }
}

export async function generateGrammarHintsAction() {
  const session = await auth();
  if (!session?.user?.email) return { error: "Cần đăng nhập" };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "User not found" };

  try {
    const isModelSync = !!(prisma as any).grammarCard;
    let cards: any[] = [];

    if (isModelSync) {
      cards = await (prisma as any).grammarCard.findMany({
        where: { userId: user.id, OR: [{ hint: "" }, { hint: null }] }
      });
    } else {
      cards = await prisma.$queryRawUnsafe(
        `SELECT * FROM GrammarCard WHERE userId = ? AND (hint = '' OR hint IS NULL)`,
        user.id
      );
    }

    if (cards.length === 0) return { success: true, count: 0, message: "Tất cả các câu đã có gợi ý!" };

    let updatedCount = 0;
    for (const card of cards) {
      let smartHint = "";

      // Logic để tạo gợi ý thông minh từ Giải thích và Loại bài tập
      if (card.explanation && card.explanation.length > 5) {
        // Lấy 1 phần nội dung giải thích (ví dụ 10 từ đầu tiên)
        const words = card.explanation.split(" ");
        smartHint = "💡 Gợi ý: " + words.slice(0, 12).join(" ") + (words.length > 12 ? "..." : "");
      } else {
        // Gợi ý mặc định theo loại
        switch (card.type) {
          case "CLOZE": smartHint = "💡 Điền đúng dạng của từ/động từ vào chỗ trống."; break;
          case "ERROR_CORRECTION": smartHint = "💡 Tìm và sửa lỗi sai về ngữ pháp/từ vựng."; break;
          case "MCQ": smartHint = "💡 Chọn đáp án chính xác nhất trong các lựa chọn."; break;
          case "PRODUCTION": smartHint = "💡 Viết lại câu hoặc hoàn thành câu theo yêu cầu."; break;
          default: smartHint = "💡 Chú ý cấu trúc câu và ngữ cảnh.";
        }
      }

      if (isModelSync) {
        await (prisma as any).grammarCard.update({
          where: { id: card.id },
          data: { hint: smartHint }
        });
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE GrammarCard SET hint = ? WHERE id = ?`,
          smartHint, card.id
        );
      }
      updatedCount++;
    }

    revalidatePath('/');
    return { success: true, count: updatedCount };
  } catch (error) {
    console.error("Error generating hints:", error);
    return { error: "Lỗi tạo gợi ý." };
  }
}

export async function buyStreakFreezeAction() {
  const session = await auth();
  if (!session?.user?.email) return { error: "Cần đăng nhập" };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "User not found" };

  const PRICE = 50; // Cost 50 points

  if ((user as any).points < PRICE) {
    return { error: `Bạn không đủ mật ngọt! Cần ${PRICE} 🍯.` };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        points: { decrement: PRICE },
        streakFreeze: { increment: 1 }
      }
    });
    revalidatePath('/');
    return { success: true, message: "Đã mua Băng Vĩnh Cửu! 🧊" };
  } catch (error) {
    return { error: "Lỗi giao dịch." };
  }
}




export async function smartCaptureAction(data: {
  word?: string;
  wordType?: string;
  meaning?: string;
  example?: string;
  source: "TEST" | "COLLECTION";
  importanceScore: number;
  prompt?: string;
  answer?: string;
  type?: string;
  hint?: string;
  explanation?: string;
}) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Cần đăng nhập" };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "User not found" };

  const isDeferred = data.importanceScore < 3;
  const tagPrefix = data.importanceScore >= 3 ? "from_test_highprio" : "from_test_lowprio";

  try {
    if (data.word) {
      // Vocabulary capture - Using raw SQL fallback for new fields
      await prisma.$executeRawUnsafe(
        `INSERT INTO Vocabulary (id, word, wordType, meaning, example, importanceScore, source, isDeferred, userId, nextReview, interval, repetition, efactor, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        crypto.randomUUID(), data.word.trim(), data.wordType || null, data.meaning || "", data.example || null,
        data.importanceScore, data.source, isDeferred ? 1 : 0, user.id,
        new Date().toISOString(), 0, 0, 2.5, new Date().toISOString(), new Date().toISOString()
      );
    } else if (data.prompt) {
      // Grammar capture
      await prisma.$executeRawUnsafe(
        `INSERT INTO GrammarCard (id, type, prompt, answer, importanceScore, source, isDeferred, userId, tags, explanation, hint, nextReview, interval, repetition, efactor, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        crypto.randomUUID(), data.type || "PRODUCTION", data.prompt.trim(), data.answer || "",
        data.importanceScore, data.source, isDeferred ? 1 : 0, user.id, tagPrefix, data.explanation || "", data.hint || "",
        new Date().toISOString(), 0, 0, 2.0, new Date().toISOString(), new Date().toISOString()
      );
    }

    revalidatePath('/');
    return { success: true, deferred: isDeferred };
  } catch (error) {
    console.error("Error in smart capture:", error);
    return { error: "Lỗi lưu dữ liệu capture." };
  }
}

export async function getDeferredItemsAction() {
  const session = await auth();
  if (!session?.user?.email) return { error: "Cần đăng nhập" };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "User not found" };

  try {
    const vocab: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM Vocabulary WHERE userId = ? AND isDeferred = 1 ORDER BY createdAt DESC`,
      user.id
    );

    const grammar: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM GrammarCard WHERE userId = ? AND isDeferred = 1 ORDER BY createdAt DESC`,
      user.id
    );

    return { success: true, vocab, grammar };
  } catch (error) {
    console.error("Error fetching deferred items:", error);
    return { error: "Lỗi khi lấy dữ liệu Inbox." };
  }
}

export async function manageInboxItemAction(id: string, type: "VOCAB" | "GRAMMAR", action: "ADD" | "DELETE") {
  const session = await auth();
  if (!session?.user?.email) return { error: "Cần đăng nhập" };

  try {
    if (action === "DELETE") {
      const table = type === "VOCAB" ? "Vocabulary" : "GrammarCard";
      await prisma.$executeRawUnsafe(`DELETE FROM ${table} WHERE id = ?`, id);
    } else {
      const table = type === "VOCAB" ? "Vocabulary" : "GrammarCard";
      await prisma.$executeRawUnsafe(`UPDATE ${table} SET isDeferred = 0 WHERE id = ?`, id);
    }

    revalidatePath('/inbox');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error managing inbox item:", error);
    return { error: "Lỗi khi xử lý mục này." };
  }
}

// --- PASSWORD RESET ACTIONS ---

import { generatePasswordResetToken, getPasswordResetTokenByToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/mail';
import bcrypt from 'bcryptjs';


export async function getSecurityQuestionAction(email: string) {
  if (!email) return { error: "Vui lòng nhập email." };

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user) {
    // Return a dummy question to prevent email enumeration, or just error if security isn't paramount here
    // For better UX in this specific app context, we'll say email not found
    return { error: "Email không tồn tại trong hệ thống." };
  }

  if (!(user as any).securityQuestion) {
    return { error: "Tài khoản này chưa thiết lập câu hỏi bảo mật. Vui lòng liên hệ Admin." };
  }

  return { success: true, question: (user as any).securityQuestion };
}

export async function verifySecurityAnswerAction(email: string, answer: string) {
  if (!email || !answer) return { error: "Vui lòng nhập câu trả lời." };

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedAnswer = answer.trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user || !(user as any).securityAnswer) {
    return { error: "Thông tin không hợp lệ." };
  }

  // Simple string comparison (case-insensitive for better UX?)
  if ((user as any).securityAnswer.toLowerCase() !== normalizedAnswer.toLowerCase()) {
    return { error: "Câu trả lời chưa chính xác." };
  }

  // Answer is correct -> Generate Link
  const passwordResetToken = await generatePasswordResetToken(normalizedEmail);

  // In a real app, you might still email this. 
  // But per requirement: "hiện link trên UI"

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${passwordResetToken.token}`;

  return { success: true, link: resetLink };
}


export async function resetPasswordAction(token: string, formData: FormData) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || !confirmPassword) {
    return { error: "Vui lòng nhập đầy đủ thông tin." };
  }

  if (password !== confirmPassword) {
    return { error: "Mật khẩu không khớp." };
  }

  if (password.length < 6) {
    return { error: "Mật khẩu phải có ít nhất 6 ký tự." };
  }

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Token không hợp lệ hoặc đã hết hạn." };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { error: "Token đã hết hạn. Vui lòng yêu cầu lại." };
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: existingToken.email }
  });

  if (!existingUser) {
    return { error: "Email không tồn tại." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword }
  });

  await (prisma as any).passwordResetToken.delete({
    where: { id: existingToken.id }
  });

  return { success: "Mật khẩu đã được đặt lại thành công!" };
}

export async function getWordsPaginatedAction(skip: number, take: number, search?: string) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  try {
    const whereClause: any = { userId: user.id };

    if (search) {
      whereClause.OR = [
        { word: { contains: search } },
        { meaning: { contains: search } }
      ];
    }

    const words = await prisma.vocabulary.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    return { success: true, words };
  } catch (error) {
    console.error("Error fetching paginated words:", error);
    return { error: "Lỗi khi lấy dữ liệu từ vựng." };
  }
}

export async function checkDuplicateWordAction(word: string) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  try {
    const trimmedWord = word.trim().toLowerCase();

    // SQLite equals is case-sensitive, so we use contains which is case-insensitive for ASCII (LIKE)
    // then verify the exact match in JS
    const potentialDuplicates = await prisma.vocabulary.findMany({
      where: {
        word: {
          contains: word.trim()
        },
        userId: user.id
      },
      select: { word: true }
    });

    const exists = potentialDuplicates.some(p => p.word.toLowerCase() === trimmedWord);

    return { exists };
  } catch (error) {
    console.error("Error checking duplicate word:", error);
    return { error: "Lỗi kiểm tra từ trùng." };
  }
}
