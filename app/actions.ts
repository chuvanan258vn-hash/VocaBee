'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth, signOut } from '@/auth'

export async function signOutAction() {
  await signOut();
}

export async function addWordAction(formData: any) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "Bạn cần đăng nhập để thêm từ! 🐝" };
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "Không tìm thấy thông tin người dùng." };

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
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "Bạn cần đăng nhập để sửa từ! 🐝" };
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "Không tìm thấy thông tin người dùng." };

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
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "Bạn cần đăng nhập để xóa từ! 🐝" };
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "Không tìm thấy thông tin người dùng." };

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
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "Bạn cần đăng nhập để ôn tập! 🐝" };
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "Không tìm thấy thông tin người dùng." };

  try {
    const word = await prisma.vocabulary.findUnique({
      where: { id: id }
    });

    if (!word || word.userId !== user.id) {
      return { error: "Không tìm thấy từ hoặc bạn không có quyền." };
    }

    // --- THUẬT TOÁN SM-2 ---
    let { interval, repetition, efactor } = word;
    let nextInterval = 0;
    let nextRepetition = 0;
    let nextEfactor = efactor;

    if (quality >= 3) {
      if (repetition === 0) {
        nextInterval = 1;
      } else if (repetition === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.round(interval * efactor);
      }
      nextRepetition = repetition + 1;
    } else {
      nextInterval = 1;
      nextRepetition = 0;
    }

    // Tính toán Ease Factor mới: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
    nextEfactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (nextEfactor < 1.3) nextEfactor = 1.3;

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);
    // Đặt giờ về 4:00 sáng - chuẩn chung của các app SRS (như Anki) 
    // để tránh xung đột múi giờ và giúp người dùng ôn tập vào sáng sớm
    nextReviewDate.setHours(4, 0, 0, 0);

    await prisma.vocabulary.update({
      where: { id: id },
      data: {
        interval: nextInterval,
        repetition: nextRepetition,
        efactor: nextEfactor,
        nextReview: nextReviewDate
      }
    });

    revalidatePath('/');
    revalidatePath('/review');
    return { success: true, nextReview: nextReviewDate };

  } catch (error) {
    console.error("Error reviewing word:", error);
    return { error: "Lỗi khi cập nhật tiến độ học tập." };
  }
}
