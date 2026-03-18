import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const word = await prisma.vocabulary.findFirst({
        where: {
            word: {
                contains: "pay" // Or just meaning: "kỳ trả lương"
            }
        }
    });
    console.log("Tìm theo payslip / payroll / paycheck:");
    console.dir(word, {depth: null});

    const meaning = await prisma.vocabulary.findFirst({
        where: {
            meaning: {
                contains: "trả lương"
            }
        }
    });

    console.log("Tìm theo nghĩa:");
    console.dir(meaning, {depth: null});
}
main();
