'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth, signOut } from '@/auth'
import { calculateSm2 } from '@/lib/sm2'

import { getAuthenticatedUser, VocaBeeUser } from '@/lib/user'

export async function signOutAction() {
  await signOut();
}

export async function addWordAction(formData: Record<string, any>) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Báº¡n cáº§n Ä‘Äƒng nháº­p Ä‘á»ƒ thÃªm tá»«! ðŸ" };

  const { wordType, meaning } = formData;
  const word = formData.word?.trim().toLowerCase();

  if (!word || !wordType || !meaning?.trim()) {
    return { error: "Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ cÃ¡c thÃ´ng tin báº¯t buá»™c! ðŸ" };
  }

  try {
    // 1. Kiá»ƒm tra xem tá»« nÃ y Ä‘Ã£ cÃ³ trong "Tá»• ong" cá»§a user nÃ y chÆ°a
    const existingWord = await prisma.vocabulary.findFirst({
      where: {
        word: word,
        userId: user.id
      }
    })

    if (existingWord) {
      return { error: `Tá»« "${word}" Ä‘Ã£ cÃ³ trong tá»• ong rá»“i! ðŸ` }
    }

    // 2. Náº¿u chÆ°a cÃ³, tiáº¿n hÃ nh lÆ°u má»›i
    await prisma.vocabulary.create({
      data: {
        word: word,
        wordType: formData.wordType,
        meaning: formData.meaning,
        pronunciation: formData.pronunciation,
        example: formData.example,
        synonyms: formData.synonyms,
        context: formData.context,
        userId: user.id,
        // CÃ¡c trÆ°á»ng SRS sáº½ tá»± Ä‘á»™ng láº¥y giÃ¡ trá»‹ default (0, 2.5, now)
      }
    })

    // LÃ m má»›i láº¡i trang Ä‘á»ƒ hiá»ƒn thá»‹ dá»¯ liá»‡u má»›i
    revalidatePath('/')
    return { success: true }

  } catch (_error) {
    console.error("Error creating word:", _error)
    return { error: "Lá»—i ká»¹ thuáº­t, khÃ´ng thá»ƒ lÆ°u tá»«." }
  }
}

export async function updateWordAction(id: string, formData: any) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Báº¡n cáº§n Ä‘Äƒng nháº­p Ä‘á»ƒ sá»­a tá»«! ðŸ" };

  try {
    const existingWord = await prisma.vocabulary.findUnique({
      where: { id: id }
    });

    if (!existingWord || existingWord.userId !== user.id) {
      return { error: "KhÃ´ng tÃ¬m tháº¥y tá»« hoáº·c báº¡n khÃ´ng cÃ³ quyá»n sá»­a." };
    }

    const newWordText = formData.word?.trim().toLowerCase();
    
    if (newWordText && newWordText !== existingWord.word) {
      const duplicateWord = await prisma.vocabulary.findFirst({
        where: {
          word: newWordText,
          userId: user.id
        }
      });
      if (duplicateWord) {
        return { error: `Tá»« "${newWordText}" Ä‘Ã£ cÃ³ trong tá»• ong rá»“i! ðŸ` };
      }
    }

    await prisma.vocabulary.update({
      where: { id: id },
      data: {
        word: newWordText,
        wordType: formData.wordType,
        meaning: formData.meaning,
        pronunciation: formData.pronunciation,
        example: formData.example,
        synonyms: formData.synonyms,
        context: formData.context,
      }
    });

    revalidatePath('/');
    return { success: true };
  } catch (_error) {
    console.error("Error updating word:", _error);
    return { error: "Lá»—i ká»¹ thuáº­t, khÃ´ng thá»ƒ cáº­p nháº­t tá»«." };
  }
}

export async function deleteWordAction(id: string) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Báº¡n cáº§n Ä‘Äƒng nháº­p Ä‘á»ƒ xÃ³a tá»«! ðŸ" };

  try {
    const existingWord = await prisma.vocabulary.findUnique({
      where: { id: id }
    });

    if (!existingWord || existingWord.userId !== user.id) {
      return { error: "KhÃ´ng tÃ¬m tháº¥y tá»« hoáº·c báº¡n khÃ´ng cÃ³ quyá»n xÃ³a." };
    }

    await prisma.vocabulary.delete({
      where: { id: id }
    });

    revalidatePath('/');
    return { success: true };
  } catch (_error) {
    console.error("Error deleting word:", _error);
    return { error: "Lá»—i ká»¹ thuáº­t, khÃ´ng thá»ƒ xÃ³a tá»«." };
  }
}
export async function reviewWordAction(id: string, quality: number, isTypingBonus: boolean = false) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Báº¡n cáº§n Ä‘Äƒng nháº­p Ä‘á»ƒ Ã´n táº­p! ðŸ" };

  try {
    const word = await prisma.vocabulary.findUnique({
      where: { id: id }
    });

    if (!word || word.userId !== user.id) {
      return { error: "KhÃ´ng tÃ¬m tháº¥y tá»« hoáº·c báº¡n khÃ´ng cÃ³ quyá»n." };
    }

    // Award points: 1 point for any review, +1 bonus for Good/Easy (quality >= 4)
    let pointsToAdd = 1;
    if (quality >= 4) pointsToAdd += 1;
    if (isTypingBonus && quality >= 4) pointsToAdd += 1; // Extra +1 for perfect typing without hints

    // Update points immediately
    await prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: pointsToAdd } }
    });

    // --- THUáº¬T TOÃN SM-2 ---
    let { interval: nextInterval, repetition: nextRepetition, efactor: nextEfactor, nextReview: nextReviewDate } = calculateSm2({
      interval: word.interval,
      repetition: word.repetition,
      efactor: word.efactor,
      quality: quality
    });

    // Extra SM-2 bonus for typing correctly without hints
    if (isTypingBonus && quality >= 4) {
      nextEfactor = Math.min(nextEfactor + 0.1, 2.8); // Slight boost to ease factor, cap at 2.8
    }

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

    const vUser = user as unknown as VocaBeeUser;
    const goal = vUser.dailyNewWordGoal || 20;
    const lastGoalMetDate = vUser.lastGoalMetDate ? new Date(vUser.lastGoalMetDate) : null;

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
            newStreak = (vUser.streakCount || 0) + 1;
          } else if (vUser.streakFreeze > 0) {
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

    // REMOVED: revalidatePath revalidation for performance during session
    return { success: true, nextReview: nextReviewDate };

  } catch (_error) {
    console.error("Error reviewing word:", _error);
    return { error: "Lá»—i khi cáº­p nháº­t tiáº¿n Ä‘á»™ há»c táº­p." };
  }
}

export async function batchReviewAction(results: { id: string; quality: number; type: 'vocab' | 'grammar'; isTypingBonus?: boolean }[]) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Bạn cần đăng nhập để ôn tập! 🐝" };

  try {
    let totalPoints = 0;
    const now = new Date();
    const todayStart = new Date(now);
    if (now.getHours() < 4) todayStart.setDate(todayStart.getDate() - 1);
    todayStart.setHours(4, 0, 0, 0);
    
    // Separate by type to process them
    const vocabResults = results.filter(r => r.type === 'vocab');
    const grammarResults = results.filter(r => r.type === 'grammar');

    // 1. Process Vocabularies
    if (vocabResults.length > 0) {
      const vocabIds = vocabResults.map(r => r.id);
      const vocabItems = await prisma.vocabulary.findMany({
        where: { id: { in: vocabIds }, userId: user.id }
      });

      // Parallelize all vocab updates — one round-trip instead of N sequential
      await Promise.all(vocabItems.map(async (item) => {
        const result = vocabResults.find(r => r.id === item.id);
        if (!result) return;

        let pointsToAdd = 1;
        if (result.quality >= 4) pointsToAdd += 1;
        if (result.isTypingBonus && result.quality >= 4) pointsToAdd += 1;
        totalPoints += pointsToAdd;

        let { interval: nextInterval, repetition: nextRepetition, efactor: nextEfactor, nextReview: nextReviewDate } = calculateSm2({
          interval: item.interval,
          repetition: item.repetition,
          efactor: item.efactor,
          quality: result.quality
        });

        if (result.isTypingBonus && result.quality >= 4) {
          nextEfactor = Math.min(nextEfactor + 0.1, 2.8);
        }

        await prisma.vocabulary.update({
          where: { id: item.id },
          data: {
            interval: nextInterval,
            repetition: nextRepetition,
            efactor: nextEfactor,
            nextReview: nextReviewDate
          }
        });
      }));
    }

    // 2. Process Grammar
    if (grammarResults.length > 0) {
      const grammarIds = grammarResults.map(r => r.id);
      const grammarItems = await (prisma as any).grammarCard.findMany({
        where: { id: { in: grammarIds }, userId: user.id }
      });

      // Parallelize all grammar updates
      await Promise.all(grammarItems.map(async (item: any) => {
        const result = grammarResults.find(r => r.id === item.id);
        if (!result) return;

        let pointsToAdd = 1;
        // grade mapping: 1->3, 2->4, 3->5
        let quality = 0;
        if (result.quality === 1) quality = 3;
        if (result.quality === 2) quality = 4;
        if (result.quality === 3) quality = 5;

        if (result.quality >= 2) pointsToAdd += 1;
        totalPoints += pointsToAdd;

        const { interval: nextInterval, repetition: nextRepetition, efactor: nextEfactor, nextReview: nextReviewDate } = calculateSm2({
          interval: item.interval,
          repetition: item.repetition,
          efactor: item.efactor,
          quality: quality
        });

        await prisma.$executeRawUnsafe(
          `UPDATE "GrammarCard" SET interval = $1, repetition = $2, efactor = $3, "nextReview" = $4, "updatedAt" = $5 WHERE id = $6`,
          nextInterval,
          nextRepetition,
          nextEfactor,
          nextReviewDate,
          new Date(),
          item.id
        );
      }));
    }

    // 3. Update Points and Streak Logic
    if (totalPoints > 0) {
      // Use standard User fetch since points manipulation requires real user properties
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      const vUser = dbUser as unknown as VocaBeeUser;
      const goal = vUser.dailyNewWordGoal || 20;
      const lastGoalMetDate = vUser.lastGoalMetDate ? new Date(vUser.lastGoalMetDate) : null;
      const alreadyMetToday = lastGoalMetDate && lastGoalMetDate >= todayStart;

      let streakUpdateArgs: any = { points: { increment: totalPoints } };

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
          let freezeUsed = false;

          if (lastGoalMetDate) {
            const yesterdayStart = new Date(todayStart);
            yesterdayStart.setDate(yesterdayStart.getDate() - 1);

            if (lastGoalMetDate >= yesterdayStart && lastGoalMetDate < todayStart) {
              newStreak = (vUser.streakCount || 0) + 1;
            } else if (vUser.streakFreeze > 0) {
              const twoDaysAgo = new Date(yesterdayStart);
              twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);
              if (lastGoalMetDate >= twoDaysAgo && lastGoalMetDate < yesterdayStart) {
                newStreak = ((dbUser as any).streakCount || 0) + 1;
                freezeUsed = true;
              }
            }
          }

          streakUpdateArgs = {
            ...streakUpdateArgs,
            streakCount: newStreak,
            lastGoalMetDate: now,
            points: { increment: totalPoints + 5 }, // +5 daily goal bonus
            streakFreeze: freezeUsed ? { decrement: 1 } : undefined,
          };
        }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: streakUpdateArgs
      });
    }

    return { success: true };
  } catch (_error) {
    console.error("Error doing batch review:", _error);
    return { error: "Lỗi lưu kết quả, vui lòng thử lại sau." };
  }
}

export async function importWordsAction(words: any[]) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Ban can dang nhap de nhap tu! 🐝" };

  let successCount = 0;
  let failCount = 0;

  try {
    const validItems = words
      .filter(item => item.word && item.meaning)
      .map(item => ({ ...item, word: item.word.trim().toLowerCase() }));
    failCount = words.length - validItems.length;

    if (validItems.length === 0) return { success: true, successCount: 0, failCount };

    const wordKeys = validItems.map(i => i.word);
    const existingRows: { id: string; word: string }[] = await prisma.$queryRawUnsafe(
      `SELECT id, word FROM "Vocabulary" WHERE "userId" = $1 AND word = ANY($2::text[])`,
      user.id, wordKeys
    );
    const existingMap = new Map(existingRows.map(r => [r.word, r.id]));

    const toInsert = validItems.filter(i => !existingMap.has(i.word));
    const toUpdate = validItems.filter(i => existingMap.has(i.word));

    if (toInsert.length > 0) {
      await prisma.vocabulary.createMany({
        data: toInsert.map(i => ({
          word: i.word,
          wordType: i.wordType || undefined,
          meaning: i.meaning,
          pronunciation: i.pronunciation || undefined,
          example: i.example || undefined,
          synonyms: i.synonyms || undefined,
          context: i.context || undefined,
          userId: user.id,
        })),
        skipDuplicates: true,
      });
      successCount += toInsert.length;
    }

    if (toUpdate.length > 0) {
      const results = await Promise.allSettled(
        toUpdate.map(i =>
          prisma.vocabulary.update({
            where: { word_userId: { word: i.word, userId: user.id } },
            data: {
              wordType: i.wordType || undefined,
              meaning: i.meaning || undefined,
              pronunciation: i.pronunciation || undefined,
              example: i.example || undefined,
              synonyms: i.synonyms || undefined,
              context: i.context || undefined,
            },
          })
        )
      );
      results.forEach(r => {
        if (r.status === 'fulfilled') successCount++;
        else { console.error('Error updating word:', r.reason); failCount++; }
      });
    }

    revalidatePath('/');
    return { success: true, successCount, failCount };
  } catch (_error) {
    console.error("Error in bulk import:", _error);
    return { error: "Lỗi kỹ thuật khi nhập dữ liệu." };
  }
}


/**
 * Lightweight header stats for /vocabulary page.
 * Returns only streak, points, totalWords, and wordTypes — avoids the full
 * getDashboardStats() computation (~2-4s) for data that isn't needed here.
 */
export async function getVocabPageHeaderStats() {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const [userData, wordTypesData] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { _count: { select: { words: true } } },
    }),
    prisma.vocabulary.findMany({
      where: { userId: user.id },
      select: { wordType: true },
      distinct: ['wordType'],
    }),
  ]);

  if (!userData) return null;

  const vUser = user as unknown as VocaBeeUser;
  const wordTypes = wordTypesData
    .map(w => w.wordType?.trim())
    .filter((w): w is string => !!w)
    .sort();

  return {
    streak:      vUser.streakCount || 0,
    points:      vUser.points      || 0,
    totalWords:  userData._count.words,
    wordTypes,
  };
}

export async function getDashboardStats() {
  const userBase = await getAuthenticatedUser();
  if (!userBase) return null;

  // Calculate "Today" starting from 4:00 AM
  const now = new Date();
  const todayStart = new Date(now);
  if (now.getHours() < 4) todayStart.setDate(todayStart.getDate() - 1);
  todayStart.setHours(4, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  // ─── OPTIMIZATION: Option A + B combined ───────────────────────────────────
  // OLD CODE: 15 sequential DB round-trips × ~1.5s each ≈ 22s just for counts
  // NEW CODE: 4 parallel queries in Promise.all, 2 of which use PostgreSQL FILTER
  //           aggregation to compute ALL counts in a single SQL statement each.
  //           Effective round-trips: 1 (parallel) + 1 (testVocab with catch) ≈ 2-4s total
  // ────────────────────────────────────────────────────────────────────────────
  const [vocabStats, grammarStats, wordTypesData, userWithCount] = await Promise.all([

    // ① Single SQL → ALL Vocabulary counts (replaces 5 sequential queries)
    prisma.$queryRawUnsafe<any[]>(`
      SELECT
        COUNT(*) FILTER (WHERE "updatedAt" >= $2 AND repetition = 1)                                             AS "learnedToday",
        COUNT(*) FILTER (WHERE interval = 0 AND "isDeferred" = false
                               AND "createdAt" >= $3 AND "createdAt" < $2)                                       AS "unlearnedYesterdayVocab",
        COUNT(*) FILTER (WHERE interval = 0 AND "isDeferred" = false)                                            AS "availableNewVocabCount",
        COUNT(*) FILTER (WHERE "updatedAt" >= $2 AND repetition > 1)                                             AS "alreadyReviewedVocabToday",
        COUNT(*) FILTER (WHERE interval > 0 AND "nextReview" <= $1 AND "isDeferred" = false)                     AS "rawVocabDueCount"
      FROM "Vocabulary"
      WHERE "userId" = $4
    `, now, todayStart, yesterdayStart, userBase.id),

    // ② Single SQL → ALL GrammarCard counts + type breakdowns (replaces 7 sequential queries)
    prisma.$queryRawUnsafe<any[]>(`
      SELECT
        COUNT(*) FILTER (WHERE "updatedAt" >= $2 AND repetition = 1)                                             AS "learnedGrammarToday",
        COUNT(*) FILTER (WHERE interval = 0 AND "isDeferred" = false
                               AND "createdAt" >= $3 AND "createdAt" < $2)                                       AS "unlearnedYesterdayGrammar",
        COUNT(*) FILTER (WHERE interval = 0 AND "isDeferred" = false)                                            AS "availableNewGrammarCount",
        COUNT(*) FILTER (WHERE "updatedAt" >= $2 AND repetition > 1)                                             AS "alreadyReviewedGrammarToday",
        COUNT(*) FILTER (WHERE interval > 0 AND "nextReview" <= $1 AND "isDeferred" = false
                               AND NOT (repetition = 1 AND "updatedAt" >= $3 AND "updatedAt" < $2))              AS "rawGrammarDueCount",
        -- Due counts by TOEIC part
        COUNT(*) FILTER (WHERE interval > 0 AND "nextReview" <= $1 AND "isDeferred" = false
                               AND NOT (repetition = 1 AND "updatedAt" >= $3 AND "updatedAt" < $2)
                               AND type = 'TOEIC_P5')                                                            AS "dueP5",
        COUNT(*) FILTER (WHERE interval > 0 AND "nextReview" <= $1 AND "isDeferred" = false
                               AND NOT (repetition = 1 AND "updatedAt" >= $3 AND "updatedAt" < $2)
                               AND type = 'TOEIC_P6')                                                            AS "dueP6",
        COUNT(*) FILTER (WHERE interval > 0 AND "nextReview" <= $1 AND "isDeferred" = false
                               AND NOT (repetition = 1 AND "updatedAt" >= $3 AND "updatedAt" < $2)
                               AND type = 'TOEIC_P7')                                                            AS "dueP7",
        COUNT(*) FILTER (WHERE interval > 0 AND "nextReview" <= $1 AND "isDeferred" = false
                               AND NOT (repetition = 1 AND "updatedAt" >= $3 AND "updatedAt" < $2)
                               AND type NOT IN ('TOEIC_P5','TOEIC_P6','TOEIC_P7'))                               AS "dueOther",
        -- New counts by TOEIC part
        COUNT(*) FILTER (WHERE interval = 0 AND "isDeferred" = false AND type = 'TOEIC_P5')                      AS "newP5",
        COUNT(*) FILTER (WHERE interval = 0 AND "isDeferred" = false AND type = 'TOEIC_P6')                      AS "newP6",
        COUNT(*) FILTER (WHERE interval = 0 AND "isDeferred" = false AND type = 'TOEIC_P7')                      AS "newP7",
        COUNT(*) FILTER (WHERE interval = 0 AND "isDeferred" = false
                               AND type NOT IN ('TOEIC_P5','TOEIC_P6','TOEIC_P7'))                               AS "newOther"
      FROM "GrammarCard"
      WHERE "userId" = $4
    `, now, todayStart, yesterdayStart, userBase.id),

    // ③ Word types for filter UI (distinct query, lightweight)
    prisma.vocabulary.findMany({
      where: { userId: userBase.id },
      select: { wordType: true },
      distinct: ['wordType']
    }),

    // ④ User with word _count (needed for totalWords stat)
    prisma.user.findUnique({
      where: { id: userBase.id },
      include: { _count: { select: { words: true } } }
    })
  ]);

  // ⑤ testVocabToday — kept separate with .catch() since columns may not be migrated yet
  const vTest = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) as count FROM "Vocabulary" WHERE "userId" = $1 AND source = 'TEST' AND "importanceScore" >= 3 AND "createdAt" >= $2`,
    userBase.id, todayStart
  ).catch(() => {
    console.log("Smart Capture columns not yet migrated, skipping test item count");
    return [{ count: 0 }];
  }) as any[];

  if (!userWithCount) return null;

  // ─── Extract & cast values (PostgreSQL COUNT returns bigint) ────────────────
  const v = vocabStats[0] || {};
  const g = grammarStats[0] || {};

  const learnedToday               = Number(v.learnedToday               || 0);
  const unlearnedYesterdayVocab    = Number(v.unlearnedYesterdayVocab    || 0);
  const availableNewVocabCount     = Number(v.availableNewVocabCount     || 0);
  const alreadyReviewedVocabToday  = Number(v.alreadyReviewedVocabToday  || 0);
  const rawVocabDueCount           = Number(v.rawVocabDueCount           || 0);
  const testVocabTodayCount        = Number(vTest[0]?.count              || 0);

  const learnedGrammarToday            = Number(g.learnedGrammarToday            || 0);
  const unlearnedYesterdayGrammar      = Number(g.unlearnedYesterdayGrammar      || 0);
  const availableNewGrammarCount       = Number(g.availableNewGrammarCount       || 0);
  const alreadyReviewedGrammarToday    = Number(g.alreadyReviewedGrammarToday    || 0);
  const rawGrammarDueCountResolved     = Number(g.rawGrammarDueCount             || 0);

  const grammarBreakdown = {
    part5: { due: Number(g.dueP5    || 0), new: Number(g.newP5    || 0) },
    part6: { due: Number(g.dueP6    || 0), new: Number(g.newP6    || 0) },
    part7: { due: Number(g.dueP7    || 0), new: Number(g.newP7    || 0) },
    other: { due: Number(g.dueOther || 0), new: Number(g.newOther || 0) },
  };

  // ─── Calculate Goals ────────────────────────────────────────────────────────
  const vUser = { ...userWithCount, ...userBase } as VocaBeeUser;
  const baseVocabGoal = vUser.dailyNewWordGoal || 30;
  const totalVocabGoal = baseVocabGoal + unlearnedYesterdayVocab;

  const baseGrammarGoal = vUser.dailyNewGrammarGoal || 30;
  const totalGrammarGoal = baseGrammarGoal + unlearnedYesterdayGrammar;

  // Calculate "Can Learn More" (Dynamic Goal Progress limited by available DB items)
  const canLearnMoreCount = Math.min(
    Math.max(0, totalVocabGoal - learnedToday),
    availableNewVocabCount
  );
  const canLearnMoreGrammarCount = Math.min(
    Math.max(0, totalGrammarGoal - learnedGrammarToday),
    availableNewGrammarCount
  );

  // ─── Banner quotas ─────────────────────────────────────────────────────────
  const MAX_DAILY_VOCAB_REVIEWS = vUser.dailyMaxVocabReview || 100;
  const remainingVocabReviewQuota = Math.max(0, MAX_DAILY_VOCAB_REVIEWS - alreadyReviewedVocabToday);
  const vocabDueCount = Math.min(rawVocabDueCount, remainingVocabReviewQuota);
  const totalDueVocab = Math.min(remainingVocabReviewQuota, vocabDueCount + canLearnMoreCount);

  const MAX_DAILY_GRAMMAR_REVIEWS = vUser.dailyMaxGrammarReview || 50;
  const remainingGrammarReviewQuota = Math.max(0, MAX_DAILY_GRAMMAR_REVIEWS - alreadyReviewedGrammarToday);
  const grammarDueCount = Math.min(rawGrammarDueCountResolved, remainingGrammarReviewQuota);
  const totalDueGrammar = Math.min(remainingGrammarReviewQuota, grammarDueCount + canLearnMoreGrammarCount);

  // ─── Streak logic ──────────────────────────────────────────────────────────
  let currentStreak = vUser.streakCount || 0;
  const lastGoalMetDate = vUser.lastGoalMetDate ? new Date(vUser.lastGoalMetDate) : null;
  let streakFrozen = false;
  if (lastGoalMetDate && lastGoalMetDate < yesterdayStart) {
    const twoDaysAgo = new Date(yesterdayStart);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);
    if (lastGoalMetDate >= twoDaysAgo && vUser.streakFreeze > 0) {
      streakFrozen = true;
    } else {
      currentStreak = 0;
    }
  }

  const allWordTypes = wordTypesData
    .map(w => w.wordType?.trim())
    .filter(w => !!w)
    .sort();

  return {
    dailyGoal: totalVocabGoal + totalGrammarGoal,
    learnedToday,
    learnedGrammarToday,
    testVocabToday: testVocabTodayCount,
    totalWords: userWithCount._count.words,
    dueReviews: totalDueVocab,
    dueGrammarCount: totalDueGrammar,
    rawVocabDueCount,
    rawGrammarDueCount: rawGrammarDueCountResolved,
    wordTypes: allWordTypes,
    streak: currentStreak,
    points: vUser.points || 0,
    streakFrozen,
    grammarBreakdown
  };
}

export async function checkWordsExistenceAction(words: string[]) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Báº¡n cáº§n Ä‘Äƒng nháº­p." };

  const trimmedWords = words.map(w => w.trim().replace(/\s+/g, ' ')).filter(w => w.length > 0);
  console.log(`[ExistenceCheck] Checking ${trimmedWords.length} words for user ${user.id}:`, trimmedWords);

  try {
    // Use raw query for case-insensitive matching - PostgreSQL style
    const placeholders = trimmedWords.map((_, i) => `$${i + 2}`).join(',');
    const query = `SELECT * FROM "Vocabulary" WHERE "userId" = $1 AND LOWER(word) IN (${placeholders})`;
    
    const existingWords: any[] = await prisma.$queryRawUnsafe(
      query,
      user.id,
      ...trimmedWords.map(w => w.toLowerCase())
    );

    console.log(`[ExistenceCheck] Found ${existingWords.length} existing items.`);
    return { success: true, existingWords };
  } catch (_error) {
    console.error("Error checking words existence:", _error);
    return { error: "Lá»—i ká»¹ thuáº­t khi kiá»ƒm tra dá»¯ liá»‡u." };
  }
}



export async function updateUserSettingsAction(data: { 
  dailyGoal: number; 
  dailyGrammarGoal?: number; 
  dailyMaxVocabReview?: number; 
  dailyMaxGrammarReview?: number; 
}) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Báº¡n cáº§n Ä‘Äƒng nháº­p." };

  try {
    const nextDailyGrammarGoal = typeof data.dailyGrammarGoal === 'number'
      ? data.dailyGrammarGoal
      : user.dailyNewGrammarGoal;
    const nextDailyMaxVocabReview = typeof data.dailyMaxVocabReview === 'number'
      ? data.dailyMaxVocabReview
      : (user.dailyMaxVocabReview ?? 100);
    const nextDailyMaxGrammarReview = typeof data.dailyMaxGrammarReview === 'number'
      ? data.dailyMaxGrammarReview
      : (user.dailyMaxGrammarReview ?? 50);

    // Use raw SQL to avoid Prisma client/schema mismatch for newer columns.
    await prisma.$executeRawUnsafe(
      `UPDATE "User"
       SET "dailyNewWordGoal" = $1,
           "dailyNewGrammarGoal" = $2,
           "dailyMaxVocabReview" = $3,
           "dailyMaxGrammarReview" = $4
       WHERE id = $5`,
      data.dailyGoal,
      nextDailyGrammarGoal,
      nextDailyMaxVocabReview,
      nextDailyMaxGrammarReview,
      user.id
    );

    const updatedRows = await prisma.$queryRawUnsafe<Array<{
      dailyNewWordGoal: number;
      dailyNewGrammarGoal: number;
      dailyMaxVocabReview: number;
      dailyMaxGrammarReview: number;
    }>>(
      `SELECT "dailyNewWordGoal", "dailyNewGrammarGoal", "dailyMaxVocabReview", "dailyMaxGrammarReview"
       FROM "User"
       WHERE id = $1
       LIMIT 1`,
      user.id
    );

    const updatedUser = updatedRows?.[0];
    if (!updatedUser) {
      return { error: "Could not reload settings after update." };
    }

    revalidatePath('/');
    return {
      success: true,
      dailyGoal: updatedUser.dailyNewWordGoal,
      dailyGrammarGoal: updatedUser.dailyNewGrammarGoal,
      dailyMaxVocabReview: updatedUser.dailyMaxVocabReview,
      dailyMaxGrammarReview: updatedUser.dailyMaxGrammarReview
    };
  } catch (_error) {
    console.error("Error updating settings:", _error);
    return { error: "Lá»—i ká»¹ thuáº­t khi lÆ°u cÃ i Ä‘áº·t." };
  }
}

// --- GRAMMAR ACTIONS ---

export async function addGrammarCardAction(data: {
  type: string;
  prompt: string;
  answer: string;
  meaning?: string | null;
  options?: string | null;
  hint?: string | null;
  explanation?: string | null;
  myError?: string | null;
  trap?: string | null;
  goldenRule?: string | null;
  tags?: string | null;
}) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Báº¡n cáº§n Ä‘Äƒng nháº­p Ä‘á»ƒ thÃªm tháº» ngá»¯ phÃ¡p! ðŸ" };

  try {
    // Use raw SQL to avoid Prisma client sync issues
    await prisma.$executeRawUnsafe(
      `INSERT INTO "GrammarCard" (id, "userId", type, prompt, answer, meaning, options, hint, explanation, "myError", trap, "goldenRule", tags, interval, repetition, efactor, "nextReview", "createdAt", "updatedAt", "isDeferred", source, "importanceScore") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 0, 0, 2.0, $14, $15, $16, false, 'MANUAL', 0)`,
      crypto.randomUUID(),
      user.id,
      data.type,
      data.prompt,
      data.answer,
      data.meaning || null,
      data.options || null,
      data.hint || null,
      data.explanation || null,
      data.myError || null,
      data.trap || null,
      data.goldenRule || null,
      data.tags || null,
      new Date(),
      new Date(),
      new Date()
    );

    revalidatePath('/');
    return { success: true };
  } catch (_error) {
    console.error("Error adding grammar card:", _error);
    return { error: "Lá»—i khi thÃªm tháº» ngá»¯ phÃ¡p." };
  }
}

export async function reviewGrammarCardAction(id: string, grade: number) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Cáº§n Ä‘Äƒng nháº­p" };

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

    // NOTE: Use raw SQL with .toISOString() to ensure consistent date format in SQLite.
    // Using Prisma ORM with `(prisma as any)` causes Date objects to be stored as
    // locale strings (e.g. "Mon Jul 06 2026 04:00:00 GMT+0700") which breaks
    // SQLite date comparisons (they become lexicographic string comparisons).
    await prisma.$executeRawUnsafe(
      `UPDATE "GrammarCard" SET interval = $1, repetition = $2, efactor = $3, "nextReview" = $4, "updatedAt" = $5 WHERE id = $6`,
      nextInterval,
      nextRepetition,
      nextEfactor,
      nextReviewDate,
      new Date(),
      id
    );

    // REMOVED: revalidatePath('/review') for performance
    return { success: true };
  } catch (_error) {
    console.error("Error reviewing grammar card:", _error);
    return { error: "Lá»—i khi lÆ°u káº¿t quáº£." };
  }
}

export async function getGrammarPaginatedAction(skip: number, take: number, search?: string) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Báº¡n cáº§n Ä‘Äƒng nháº­p." };

  try {
    const whereClause: any = { userId: user.id };

    if (search) {
      whereClause.OR = [
        { prompt: { contains: search } },
        { answer: { contains: search } },
        { meaning: { contains: search } },
        { tags: { contains: search } }
      ];
    }

    const cards = await (prisma as any).grammarCard.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    return { success: true, cards };
  } catch (_error) {
    console.error("Error fetching paginated grammar:", _error);
    return { error: "Lá»—i khi láº¥y dá»¯ liá»‡u ngá»¯ phÃ¡p." };
  }
}

export async function updateGrammarCardAction(id: string, data: any) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Báº¡n cáº§n Ä‘Äƒng nháº­p." };

  try {
    await (prisma as any).grammarCard.update({
      where: { id, userId: user.id },
      data: {
        type: data.type,
        prompt: data.prompt,
        answer: data.answer,
        meaning: data.meaning,
        options: data.options,
        hint: data.hint,
        explanation: data.explanation,
        myError: data.myError,
        trap: data.trap,
        goldenRule: data.goldenRule,
        tags: data.tags,
      }
    });

    revalidatePath('/grammar');
    return { success: true };
  } catch (_error) {
    console.error("Error updating grammar card:", _error);
    return { error: "Lá»—i khi cáº­p nháº­t tháº» ngá»¯ phÃ¡p." };
  }
}

export async function deleteGrammarCardAction(id: string) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Báº¡n cáº§n Ä‘Äƒng nháº­p." };

  try {
    await (prisma as any).grammarCard.delete({
      where: { id, userId: user.id }
    });

    revalidatePath('/grammar');
    return { success: true };
  } catch (_error) {
    console.error("Error deleting grammar card:", _error);
    return { error: "Lá»—i khi xÃ³a tháº» ngá»¯ phÃ¡p." };
  }
}

export async function seedVocabularyAction() {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "User not found" };

  const sampleWords = [
    { word: "resilient", meaning: "kiÃªn cÆ°á»ng, cÃ³ kháº£ nÄƒng há»“i phá»¥c nhanh", example: "She is resilient in the face of adversity.", wordType: "Adjective", pronunciation: "/rÉªËˆzÉªl.jÉ™nt/" },
    { word: "innovative", meaning: "sÃ¡ng táº¡o, Ä‘á»•i má»›i", example: "The company is known for its innovative designs.", wordType: "Adjective", pronunciation: "/ËˆÉªn.É™.veÉª.tÉªv/" },
    { word: "colleague", meaning: "Ä‘á»“ng nghiá»‡p", example: "I had lunch with my colleagues.", wordType: "Noun", pronunciation: "/ËˆkÉ’l.iËÉ¡/" },
    { word: "deadline", meaning: "háº¡n chÃ³t", example: "We list to meet the deadline.", wordType: "Noun", pronunciation: "/Ëˆded.laÉªn/" },
    { word: "negotiate", meaning: "Ä‘Ã m phÃ¡n, thÆ°Æ¡ng lÆ°á»£ng", example: "They are negotiating a new contract.", wordType: "Verb", pronunciation: "/nÉ™ËˆÉ¡É™ÊŠ.Êƒi.eÉªt/" },
    { word: "strategy", meaning: "chiáº¿n lÆ°á»£c", example: "We need a marketing strategy.", wordType: "Noun", pronunciation: "/ËˆstrÃ¦t.É™.dÊ’i/" },
    { word: "ambitious", meaning: "tham vá»ng", example: "He has ambitious plans for the future.", wordType: "Adjective", pronunciation: "/Ã¦mËˆbÉªÊƒ.É™s/" },
    { word: "proposal", meaning: "Ä‘á» xuáº¥t", example: "The committee approved the proposal.", wordType: "Noun", pronunciation: "/prÉ™ËˆpÉ™ÊŠ.zÉ™l/" },
    { word: "efficient", meaning: "hiá»‡u quáº£ (nÄƒng suáº¥t)", example: "This new machine is very efficient.", wordType: "Adjective", pronunciation: "/ÉªËˆfÉªÊƒ.É™nt/" },
    { word: "launch", meaning: "ra máº¯t, khai trÆ°Æ¡ng", example: "They plan to launch the product in May.", wordType: "Verb", pronunciation: "/lÉ”ËntÊƒ/" },
    { word: "objective", meaning: "má»¥c tiÃªu", example: "Our main objective is to improve quality.", wordType: "Noun", pronunciation: "/É™bËˆdÊ’ek.tÉªv/" },
    { word: "revenue", meaning: "doanh thu", example: "The company's revenue increased by 10%.", wordType: "Noun", pronunciation: "/Ëˆrev.É™.nuË/" },
    { word: "competitor", meaning: "Ä‘á»‘i thá»§ cáº¡nh tranh", example: "We are cheaper than our main competitor.", wordType: "Noun", pronunciation: "/kÉ™mËˆpet.Éª.tÉ™r/" },
    { word: "delegation", meaning: "phÃ¡i Ä‘oÃ n / sá»± á»§y quyá»n", example: "A delegation from Japan visited the factory.", wordType: "Noun", pronunciation: "/ËŒdel.ÉªËˆÉ¡eÉª.ÊƒÉ™n/" },
    { word: "incentive", meaning: "sá»± khÃ­ch lá»‡, Æ°u Ä‘Ã£i", example: "Bonus payments provide an incentive to work harder.", wordType: "Noun", pronunciation: "/ÉªnËˆsen.tÉªv/" },
    { word: "momentum", meaning: "Ä‘Ã  (phÃ¡t triá»ƒn)", example: "The campaign is gaining momentum.", wordType: "Noun", pronunciation: "/mÉ™Ëˆmen.tÉ™m/" },
    { word: "niche", meaning: "thá»‹ trÆ°á»ng ngÃ¡ch / vá»‹ trÃ­ thÃ­ch há»£p", example: "They found a niche in the organic food market.", wordType: "Noun", pronunciation: "/niËÊƒ/" },
    { word: "outsourcing", meaning: "thuÃª ngoÃ i", example: "Outsourcing can reduce costs.", wordType: "Noun", pronunciation: "/ËˆaÊŠtËŒsÉ”Ë.sÉªÅ‹/" },
    { word: "startup", meaning: "khá»Ÿi nghiá»‡p", example: "Working at a startup is exciting.", wordType: "Noun", pronunciation: "/ËˆstÉ‘Ët.ÊŒp/" },
    { word: "venture", meaning: "dá»± Ã¡n kinh doanh (máº¡o hiá»ƒm)", example: "Their new venture failed.", wordType: "Noun", pronunciation: "/Ëˆven.tÊƒÉ™r/" }
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
    return { error: "Lá»—i khi náº¡p dá»¯ liá»‡u máº«u." };
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
      hint: "Sá»­ dá»¥ng Have/Has + V3/ed cho thÃ¬ Hiá»‡n táº¡i hoÃ n thÃ nh.",
      explanation: "Present perfect (have/has + V3) dÃ¹ng cho hÃ nh Ä‘á»™ng báº¯t Ä‘áº§u trong quÃ¡ khá»© vÃ  cÃ²n tiáº¿p diá»…n.",
      tags: "Tenses"
    },
    {
      type: "PRODUCTION",
      prompt: "Write a polite email sentence offering help using 'would'.",
      answer: "I would be happy to assist you with that.",
      hint: "Gá»£i Ã½: I + would + be happy + to...",
      explanation: "Cáº¥u trÃºc 'would be happy to' lÃ  cÃ¡ch Ä‘á» nghá»‹ giÃºp Ä‘á»¡ lá»‹ch sá»± trong mÃ´i trÆ°á»ng cÃ´ng sá»Ÿ.",
      tags: "Modal Verbs"
    },
    {
      type: "ERROR_CORRECTION",
      prompt: "I look forward to meet you. â€” Find & fix the mistake",
      answer: "I look forward to meeting you.",
      hint: "Gá»£i Ã½: ChÃº Ã½ Ä‘á»™ng tá»« sau 'to'.",
      explanation: "Cáº¥u trÃºc 'look forward to' Ä‘i kÃ¨m vá»›i V-ing.",
      tags: "Gerund"
    },
    {
      type: "CLOZE",
      prompt: "The manager, ___ approved the budget, left early.",
      answer: "who",
      hint: "DÃ¹ng Ä‘áº¡i tá»« quan há»‡ thay cho ngÆ°á»i.",
      explanation: "Äáº¡i tá»« quan há»‡ 'who' dÃ¹ng thay tháº¿ cho danh tá»« chá»‰ ngÆ°á»i Ä‘Ã³ng vai trÃ² chá»§ ngá»¯.",
      tags: "Relative Clauses"
    },
    {
      type: "MCQ",
      prompt: "If I ___ more time, I would travel more.",
      answer: "had",
      options: JSON.stringify(["have", "had", "will have", "has"]),
      hint: "ÄÃ¢y lÃ  cÃ¢u Ä‘iá»u kiá»‡n loáº¡i 2 (giáº£ Ä‘á»‹nh loáº¡i 1).",
      explanation: "CÃ¢u Ä‘iá»u kiá»‡n loáº¡i 2 (V-ed) diá»…n táº£ giáº£ Ä‘á»‹nh trÃ¡i ngÆ°á»£c vá»›i hiá»‡n táº¡i.",
      tags: "Conditionals"
    },
    {
      type: "PRODUCTION",
      prompt: "Transform to passive voice: 'The team completed the report.'",
      answer: "The report was completed by the team.",
      hint: "Chuyá»ƒn tÃ¢n ngá»¯ 'The report' lÃªn Ä‘áº§u vÃ  dÃ¹ng was/were + V3.",
      explanation: "CÃ¢u bá»‹ Ä‘á»™ng quÃ¡ khá»© Ä‘Æ¡n: was/were + V3/ed.",
      tags: "Passive Voice"
    },
    {
      type: "CLOZE",
      prompt: "She insisted ___ (go) to the meeting.",
      answer: "on going",
      hint: "Insist Ä‘i kÃ¨m vá»›i giá»›i tá»« gÃ¬?",
      explanation: "Insist + on + V-ing: khÄƒng khÄƒng lÃ m gÃ¬ Ä‘Ã³.",
      tags: "Prepositions"
    },
    {
      type: "ERROR_CORRECTION",
      prompt: "There is less employees this month. â€” Find & fix the mistake",
      answer: "There are fewer employees this month.",
      hint: "Gá»£i Ã½: employees lÃ  danh tá»« Ä‘áº¿m Ä‘Æ°á»£c.",
      explanation: "DÃ¹ng 'fewer' cho danh tá»« Ä‘áº¿m Ä‘Æ°á»£c sá»‘ nhiá»u (employees).",
      tags: "Comparisons"
    },
    {
      type: "PRODUCTION",
      prompt: "Write a polite email sentence requesting an extension using 'could'.",
      answer: "Could you please grant me an extension on the deadline?",
      hint: "Gá»£i Ã½: Could you please + (Ä‘á»™ng tá»«)...?",
      explanation: "DÃ¹ng 'Could you please' Ä‘á»ƒ Ä‘Æ°a ra yÃªu cáº§u lá»‹ch sá»±.",
      tags: "Modal Verbs"
    },
    {
      type: "MCQ",
      prompt: "We missed the train ___ the heavy traffic.",
      answer: "because of",
      options: JSON.stringify(["because", "because of", "although", "despite"]),
      hint: "PhÃ­a sau lÃ  má»™t cá»¥m danh tá»« (heavy traffic).",
      explanation: "DÃ¹ng 'because of' trÆ°á»›c má»™t cá»¥m danh tá»« (heavy traffic).",
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
          `SELECT id FROM "GrammarCard" WHERE prompt = $1 AND "userId" = $2 LIMIT 1`,
          card.prompt, user.id
        );

        if (existing && existing.length > 0) {
          await prisma.$executeRawUnsafe(
            `UPDATE "GrammarCard" SET hint = $1 WHERE id = $2`,
            card.hint, existing[0].id
          );
        } else {
          await prisma.$executeRawUnsafe(
            `INSERT INTO "GrammarCard" (id, type, prompt, answer, options, hint, explanation, tags, "userId", "nextReview", interval, repetition, efactor) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, 0, 2.0)`,
            crypto.randomUUID(), card.type, card.prompt, card.answer, card.options || null, card.hint || "", card.explanation, card.tags, user.id,
            new Date()
          );
          createdCount++;
        }
      }
    }
    revalidatePath('/');
    return { success: true, count: createdCount };
  } catch (error) {
    console.error("Error seeding cards:", error);
    return { error: "Lá»—i khi náº¡p dá»¯ liá»‡u máº«u." };
  }
}

export async function importGrammarCardsAction(cards: any[]) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "User not found" };

  let successCount = 0;
  let failCount = 0;

  try {
    // 1. Filter valid items & normalize
    const validItems = cards
      .filter(item => item.prompt && item.answer)
      .map(item => ({
        type: (item.type || "PRODUCTION").toUpperCase().trim(),
        prompt: item.prompt.trim(),
        answer: item.answer.trim(),
        options: item.options ? String(item.options).trim() : null,
        hint: item.hint ? String(item.hint).trim() : "",
        explanation: item.explanation ? String(item.explanation).trim() : "",
        tags: item.tags ? String(item.tags).trim() : "",
      }));
    failCount = cards.length - validItems.length;

    if (validItems.length === 0) {
      return { success: true, successCount: 0, failCount };
    }

    // 2. Bulk-check which prompts already EXIST (1 query instead of N)
    const promptKeys = validItems.map(i => i.prompt);
    const existingRows: { id: string; prompt: string }[] = await prisma.$queryRawUnsafe(
      `SELECT id, prompt FROM "GrammarCard" WHERE "userId" = $1 AND prompt = ANY($2::text[])`,
      user.id,
      promptKeys
    );
    const existingMap = new Map(existingRows.map(r => [r.prompt, r.id]));

    // 3. Split into inserts vs updates
    const toInsert = validItems.filter(i => !existingMap.has(i.prompt));
    const toUpdate = validItems.filter(i => existingMap.has(i.prompt));

    // 4. Parallel inserts for new cards
    if (toInsert.length > 0) {
      const insertResults = await Promise.allSettled(
        toInsert.map(i =>
          prisma.$executeRawUnsafe(
            `INSERT INTO "GrammarCard" (id, "userId", type, prompt, answer, meaning, options, hint, explanation, "myError", trap, "goldenRule", tags, interval, repetition, efactor, "nextReview", "createdAt", "updatedAt", "isDeferred", source, "importanceScore")
             VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $8, NULL, NULL, NULL, $9, 0, 0, 2.0, $10, $11, $12, false, 'MANUAL', 0)`,
            crypto.randomUUID(), user.id, i.type, i.prompt, i.answer,
            i.options, i.hint, i.explanation, i.tags,
            new Date(), new Date(), new Date()
          )
        )
      );
      insertResults.forEach(r => {
        if (r.status === 'fulfilled') successCount++;
        else { console.error('Error inserting grammar card:', r.reason); failCount++; }
      });
    }

    // 5. Parallel updates for existing cards
    if (toUpdate.length > 0) {
      const updateResults = await Promise.allSettled(
        toUpdate.map(i => {
          const existingId = existingMap.get(i.prompt)!;
          return (prisma as any).grammarCard.update({
            where: { id: existingId },
            data: {
              type: i.type,
              answer: i.answer,
              options: i.options,
              hint: i.hint,
              explanation: i.explanation,
              tags: i.tags,
            },
          });
        })
      );
      updateResults.forEach(r => {
        if (r.status === 'fulfilled') successCount++;
        else { console.error('Error updating grammar card:', r.reason); failCount++; }
      });
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
  if (!session?.user?.email) return { error: "Cáº§n Ä‘Äƒng nháº­p" };

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
        `SELECT * FROM "GrammarCard" WHERE "userId" = $1 AND (hint = '' OR hint IS NULL)`,
        user.id
      );
    }

    if (cards.length === 0) return { success: true, count: 0, message: "Táº¥t cáº£ cÃ¡c cÃ¢u Ä‘Ã£ cÃ³ gá»£i Ã½!" };

    let updatedCount = 0;
    for (const card of cards) {
      let smartHint = "";

      // Logic Ä‘á»ƒ táº¡o gá»£i Ã½ thÃ´ng minh tá»« Giáº£i thÃ­ch vÃ  Loáº¡i bÃ i táº­p
      if (card.explanation && card.explanation.length > 5) {
        // Láº¥y 1 pháº§n ná»™i dung giáº£i thÃ­ch (vÃ­ dá»¥ 10 tá»« Ä‘áº§u tiÃªn)
        const words = card.explanation.split(" ");
        smartHint = "ðŸ’¡ Gá»£i Ã½: " + words.slice(0, 12).join(" ") + (words.length > 12 ? "..." : "");
      } else {
        // Gá»£i Ã½ máº·c Ä‘á»‹nh theo loáº¡i
        switch (card.type) {
          case "CLOZE": smartHint = "ðŸ’¡ Äiá»n Ä‘Ãºng dáº¡ng cá»§a tá»«/Ä‘á»™ng tá»« vÃ o chá»— trá»‘ng."; break;
          case "ERROR_CORRECTION": smartHint = "ðŸ’¡ TÃ¬m vÃ  sá»­a lá»—i sai vá» ngá»¯ phÃ¡p/tá»« vá»±ng."; break;
          case "MCQ": smartHint = "ðŸ’¡ Chá»n Ä‘Ã¡p Ã¡n chÃ­nh xÃ¡c nháº¥t trong cÃ¡c lá»±a chá»n."; break;
          case "PRODUCTION": smartHint = "ðŸ’¡ Viáº¿t láº¡i cÃ¢u hoáº·c hoÃ n thÃ nh cÃ¢u theo yÃªu cáº§u."; break;
          default: smartHint = "ðŸ’¡ ChÃº Ã½ cáº¥u trÃºc cÃ¢u vÃ  ngá»¯ cáº£nh.";
        }
      }

      if (isModelSync) {
        await (prisma as any).grammarCard.update({
          where: { id: card.id },
          data: { hint: smartHint }
        });
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE "GrammarCard" SET hint = $1 WHERE id = $2`,
          smartHint, card.id
        );
      }
      updatedCount++;
    }

    revalidatePath('/');
    return { success: true, count: updatedCount };
  } catch (error) {
    console.error("Error generating hints:", error);
    return { error: "Lá»—i táº¡o gá»£i Ã½." };
  }
}

export async function buyStreakFreezeAction() {
  const session = await auth();
  if (!session?.user?.email) return { error: "Cáº§n Ä‘Äƒng nháº­p" };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "User not found" };

  const PRICE = 50; // Cost 50 points

  if ((user as any).points < PRICE) {
    return { error: `Báº¡n khÃ´ng Ä‘á»§ máº­t ngá»t! Cáº§n ${PRICE} ðŸ¯.` };
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
    return { success: true, message: "ÄÃ£ mua BÄƒng VÄ©nh Cá»­u! ðŸ§Š" };
  } catch (error) {
    return { error: "Lá»—i giao dá»‹ch." };
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
  if (!session?.user?.email) return { error: "Cáº§n Ä‘Äƒng nháº­p" };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "User not found" };

  const isDeferred = data.importanceScore < 3;
  const tagPrefix = data.importanceScore >= 3 ? "from_test_highprio" : "from_test_lowprio";

  try {
    if (data.word) {
      // Vocabulary capture - Using raw SQL fallback for new fields
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Vocabulary" (id, word, "wordType", meaning, example, "importanceScore", source, "isDeferred", "userId", "nextReview", interval, repetition, efactor, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, 0, 2.5, $11, $12)`,
        crypto.randomUUID(), data.word.trim(), data.wordType || null, data.meaning || "", data.example || null,
        data.importanceScore, data.source, isDeferred, user.id,
        new Date(), new Date(), new Date()
      );
    } else if (data.prompt) {
      // Grammar capture
      await prisma.$executeRawUnsafe(
        `INSERT INTO "GrammarCard" (id, type, prompt, answer, "importanceScore", source, "isDeferred", "userId", tags, explanation, hint, "nextReview", interval, repetition, efactor, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 0, 0, 2.0, $13, $14)`,
        crypto.randomUUID(), data.type || "PRODUCTION", data.prompt.trim(), data.answer || "",
        data.importanceScore, data.source, isDeferred, user.id, tagPrefix, data.explanation || "", data.hint || "",
        new Date(), new Date(), new Date()
      );
    }

    revalidatePath('/');
    return { success: true, deferred: isDeferred };
  } catch (error) {
    console.error("Error in smart capture:", error);
    return { error: "Lá»—i lÆ°u dá»¯ liá»‡u capture." };
  }
}

export async function getDeferredItemsAction() {
  const session = await auth();
  if (!session?.user?.email) return { error: "Cáº§n Ä‘Äƒng nháº­p" };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "User not found" };

  try {
    const vocab: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Vocabulary" WHERE "userId" = $1 AND "isDeferred" = true ORDER BY "createdAt" DESC`,
      user.id
    );

    const grammar: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "GrammarCard" WHERE "userId" = $1 AND "isDeferred" = true ORDER BY "createdAt" DESC`,
      user.id
    );

    return { success: true, vocab, grammar };
  } catch (error) {
    console.error("Error fetching deferred items:", error);
    return { error: "Lá»—i khi láº¥y dá»¯ liá»‡u Inbox." };
  }
}

export async function manageInboxItemAction(id: string, type: "VOCAB" | "GRAMMAR", action: "ADD" | "DELETE") {
  const session = await auth();
  if (!session?.user?.email) return { error: "Cáº§n Ä‘Äƒng nháº­p" };

  try {
    if (action === "DELETE") {
      const table = type === "VOCAB" ? '"Vocabulary"' : '"GrammarCard"';
      await prisma.$executeRawUnsafe(`DELETE FROM ${table} WHERE id = $1`, id);
    } else {
      const table = type === "VOCAB" ? '"Vocabulary"' : '"GrammarCard"';
      await prisma.$executeRawUnsafe(`UPDATE ${table} SET "isDeferred" = false WHERE id = $1`, id);
    }

    revalidatePath('/inbox');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error managing inbox item:", error);
    return { error: "Lá»—i khi xá»­ lÃ½ má»¥c nÃ y." };
  }
}

// --- PASSWORD RESET ACTIONS ---

import { generatePasswordResetToken, getPasswordResetTokenByToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/mail';
import bcrypt from 'bcryptjs';


export async function getSecurityQuestionAction(email: string) {
  if (!email) return { error: "Vui lÃ²ng nháº­p email." };

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user) {
    // Return a dummy question to prevent email enumeration, or just error if security isn't paramount here
    // For better UX in this specific app context, we'll say email not found
    return { error: "Email khÃ´ng tá»“n táº¡i trong há»‡ thá»‘ng." };
  }

  if (!(user as any).securityQuestion) {
    return { error: "TÃ i khoáº£n nÃ y chÆ°a thiáº¿t láº­p cÃ¢u há»i báº£o máº­t. Vui lÃ²ng liÃªn há»‡ Admin." };
  }

  return { success: true, question: (user as any).securityQuestion };
}

export async function verifySecurityAnswerAction(email: string, answer: string) {
  if (!email || !answer) return { error: "Vui lÃ²ng nháº­p cÃ¢u tráº£ lá»i." };

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedAnswer = answer.trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user || !(user as any).securityAnswer) {
    return { error: "ThÃ´ng tin khÃ´ng há»£p lá»‡." };
  }

  // Simple string comparison (case-insensitive for better UX?)
  if ((user as any).securityAnswer.toLowerCase() !== normalizedAnswer.toLowerCase()) {
    return { error: "CÃ¢u tráº£ lá»i chÆ°a chÃ­nh xÃ¡c." };
  }

  // Answer is correct -> Generate Link
  const passwordResetToken = await generatePasswordResetToken(normalizedEmail);

  // In a real app, you might still email this. 
  // But per requirement: "hiá»‡n link trÃªn UI"

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${passwordResetToken.token}`;

  return { success: true, link: resetLink };
}


export async function resetPasswordAction(token: string, formData: FormData) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || !confirmPassword) {
    return { error: "Vui lÃ²ng nháº­p Ä‘áº§y Ä‘á»§ thÃ´ng tin." };
  }

  if (password !== confirmPassword) {
    return { error: "Máº­t kháº©u khÃ´ng khá»›p." };
  }

  if (password.length < 6) {
    return { error: "Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±." };
  }

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Token khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n." };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { error: "Token Ä‘Ã£ háº¿t háº¡n. Vui lÃ²ng yÃªu cáº§u láº¡i." };
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: existingToken.email }
  });

  if (!existingUser) {
    return { error: "Email khÃ´ng tá»“n táº¡i." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword }
  });

  await (prisma as any).passwordResetToken.delete({
    where: { id: existingToken.id }
  });

  return { success: "Máº­t kháº©u Ä‘Ã£ Ä‘Æ°á»£c Ä‘áº·t láº¡i thÃ nh cÃ´ng!" };
}

export async function getWordsPaginatedAction(skip: number, take: number, search?: string) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Báº¡n cáº§n Ä‘Äƒng nháº­p." };

  try {
    const trimmedSearch = search?.trim();
    const baseSelect = `SELECT id, word, "wordType", meaning, pronunciation, example, synonyms, context, "importanceScore", source, "isDeferred", "nextReview", interval, repetition, efactor, "userId", "createdAt", "updatedAt" FROM "Vocabulary"`;
    let words: unknown[] = [];

    if (trimmedSearch) {
      const like = `%${trimmedSearch}%`;
      words = await prisma.$queryRawUnsafe(
        `${baseSelect}
         WHERE "userId" = $1
           AND (
             LOWER(word) LIKE LOWER($2)
             OR LOWER(meaning) LIKE LOWER($2)
             OR LOWER(COALESCE(context, '')) LIKE LOWER($2)
           )
         ORDER BY "createdAt" DESC
         LIMIT $3 OFFSET $4`,
        user.id,
        like,
        take,
        skip
      );
    } else {
      words = await prisma.$queryRawUnsafe(
        `${baseSelect}
         WHERE "userId" = $1
         ORDER BY "createdAt" DESC
         LIMIT $2 OFFSET $3`,
        user.id,
        take,
        skip
      );
    }

    return { success: true, words };
  } catch (error) {
    console.error("Error fetching paginated words:", error);
    return { error: "Lá»—i khi láº¥y dá»¯ liá»‡u tá»« vá»±ng." };
  }
}

export async function checkDuplicateWordAction(word: string) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Báº¡n cáº§n Ä‘Äƒng nháº­p." };

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
    return { error: "Lá»—i kiá»ƒm tra tá»« trÃ¹ng." };
  }
}

export async function getDetailedStatsAction() {
  const userBase = await getAuthenticatedUser();
  if (!userBase) return null;

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    // 1. Mastery Stats
    const vocabMastery = await prisma.vocabulary.groupBy({
      by: ['interval'],
      where: { userId: userBase.id },
      _count: true
    });

    const grammarMastery = await prisma.grammarCard.groupBy({
      by: ['interval'],
      where: { userId: userBase.id },
      _count: true
    });

    let mastered = 0;
    let learning = 0;
    let newItems = 0;

    [...vocabMastery, ...grammarMastery].forEach(item => {
      if (item.interval >= 21) mastered += item._count;
      else if (item.interval > 0) learning += item._count;
      else newItems += item._count;
    });

    // 2. Activity Heatmap (Last 365 days)
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    // PostgreSQL raw query to group by day
    const heatmapData: any[] = await prisma.$queryRawUnsafe(`
      SELECT date, COUNT(*) as count FROM (
        SELECT TO_CHAR("updatedAt", 'YYYY-MM-DD') as date FROM "Vocabulary" WHERE "userId" = $1 AND "updatedAt" >= $2
        UNION ALL
        SELECT TO_CHAR("updatedAt", 'YYYY-MM-DD') as date FROM "GrammarCard" WHERE "userId" = $3 AND "updatedAt" >= $4
      ) sub GROUP BY date ORDER BY date ASC
    `, userBase.id, oneYearAgo, userBase.id, oneYearAgo);

    // 3. Retention Rate (Mocked or % of EF > 2.0)
    const stableItems = mastered + learning;
    const totalItems = mastered + learning + newItems;
    const retentionRate = totalItems > 0 ? Math.round(((mastered + (learning * 0.7)) / totalItems) * 100) : 0;

    // 4. Time Spent (Estimated: 1 min per 5 items studied today)
    const todayStart = new Date(now);
    if (now.getHours() < 4) todayStart.setDate(todayStart.getDate() - 1);
    todayStart.setHours(4, 0, 0, 0);

    const studiedToday = await prisma.vocabulary.count({
      where: { userId: userBase.id, updatedAt: { gte: todayStart } }
    }) + await prisma.grammarCard.count({
      where: { userId: userBase.id, updatedAt: { gte: todayStart } }
    });

    const estimatedMinutes = Math.round(studiedToday * 0.5); // 30 seconds per card

    return {
      mastery: { mastered, learning, newItems, total: totalItems },
      heatmap: heatmapData,
      retentionRate,
      timeSpentToday: estimatedMinutes,
      studiedToday
    };
  } catch (error) {
    console.error("Error fetching detailed stats:", error);
    return null;
  }
}

export async function getLeaderboardAction() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { points: 'desc' },
      select: {
        id: true,
        name: true,
        points: true,
        streakCount: true
      },
      take: 50 // Get top 50 users
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return { error: "Lá»—i khi láº¥y dá»¯ liá»‡u báº£ng xáº¿p háº¡ng." };
  }
}

// --- TOEIC PRACTICE ACTIONS ---

export async function saveToeicQuestionAction(data: {
  toeicPart: number;
  prompt: string;
  answer: string;
  options: string; // JSON string of {A, B, C, D}
  explanation?: string;
  grammarCategory?: string;
  signalKeywords?: string;
  formula?: string;
  hint?: string; // contextClue for Part 6
  questionAtGap?: string; // Part 6 specific
  complexSentence?: string; // Part 7 specific - stored in prompt
  sentenceStructure?: string; // Part 7 - JSON string of {subject, relativeClause, mainVerb}
}) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Báº¡n cáº§n Ä‘Äƒng nháº­p! ðŸ" };

  const typeMap: Record<number, string> = { 5: "TOEIC_P5", 6: "TOEIC_P6", 7: "TOEIC_P7" };
  const cardType = typeMap[data.toeicPart] || "TOEIC_P5";

  // For Part 6: combine contextPassage + questionAtGap in prompt
  let promptContent = data.prompt;
  if (data.toeicPart === 6 && data.questionAtGap) {
    promptContent = data.prompt + "\n---GAP---\n" + data.questionAtGap;
  }
  // For Part 7: store sentenceStructure in goldenRule field for reuse
  const goldenRule = data.sentenceStructure || null;

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "GrammarCard" (id, "userId", type, prompt, answer, options, hint, explanation, tags, "toeicPart", "grammarCategory", "signalKeywords", formula, "goldenRule", interval, repetition, efactor, "nextReview", "createdAt", "updatedAt", "isDeferred", source, "importanceScore")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 0, 0, 2.0, $15, $16, $17, false, 'TOEIC', 0)`,
      crypto.randomUUID(),
      user.id,
      cardType,
      promptContent,
      data.answer,
      data.options,
      data.hint || data.signalKeywords || null,
      data.explanation || null,
      `toeic, part${data.toeicPart}`,
      data.toeicPart,
      data.grammarCategory || null,
      data.signalKeywords || null,
      data.formula || null,
      goldenRule,
      new Date(),
      new Date(),
      new Date()
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error saving TOEIC question:", error);
    return { error: "Lá»—i khi lÆ°u cÃ¢u há»i TOEIC." };
  }
}

export async function getWeakCategoriesAction() {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Cáº§n Ä‘Äƒng nháº­p" };

  try {
    const results: any[] = await prisma.$queryRawUnsafe(`
      WITH CategoryStats AS (
        SELECT 
          "grammarCategory",
          "toeicPart",
          COUNT(CASE WHEN repetition = 0 AND interval > 0 THEN 1 END) AS "failureCount",
          COUNT(*) AS "totalCards",
          AVG(efactor) AS "avgEF",
          MAX("updatedAt") AS "lastActive"
        FROM "GrammarCard"
        WHERE "userId" = $1 
          AND "toeicPart" IS NOT NULL 
          AND "grammarCategory" IS NOT NULL
          AND "grammarCategory" != ''
        GROUP BY "grammarCategory", "toeicPart"
        HAVING COUNT(*) >= 2
      )
      SELECT 
        "grammarCategory",
        "toeicPart",
        "failureCount",
        "totalCards",
        ROUND(CAST("avgEF" AS NUMERIC), 2) AS "avgEF",
        "lastActive",
        ROUND(
          CAST(
            (CAST("failureCount" AS FLOAT) / ("failureCount" + ("totalCards" - "failureCount") + 1))
            * (1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - "lastActive")) / 86400 * 0.1))
            * (1.0 / NULLIF("avgEF", 0))
          AS NUMERIC), 4
        ) AS "weaknessScore"
      FROM CategoryStats
      ORDER BY "weaknessScore" DESC
      LIMIT 3
    `, user.id);

    return {
      success: true,
      categories: results.map(r => ({
        category: r.grammarCategory,
        part: r.toeicPart,
        weaknessScore: r.weaknessScore,
        failureCount: r.failureCount,
        totalCards: r.totalCards,
        avgEF: r.avgEF,
      }))
    };
  } catch (error) {
    console.error("Error fetching weak categories:", error);
    return { error: "Lá»—i khi phÃ¢n tÃ­ch Ä‘iá»ƒm yáº¿u." };
  }
}
