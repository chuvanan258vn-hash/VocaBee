import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Deleting duplicate grammar card...");
    const idToDelete = "a0886ce2-4752-446a-bee9-0a6ea5d63f25";

    // Fallback to raw SQL with quotes just in case
    await prisma.$executeRawUnsafe(`DELETE FROM "GrammarCard" WHERE id = ?`, idToDelete);
    console.log(`Deleted card via raw SQL.`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
