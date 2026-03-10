import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log("Simulating ReviewPage fetch logic for due and new cards...");
    const userId = "c1c504bd-c9db-482a-bc3e-0248f764a856"; // We don't have user ID directly, let's just use the query logic without user filter if possible, or grab a user.

    const user = await prisma.user.findFirst();
    if (!user) return console.log("No user found");

    const now = new Date();
    const todayStart = new Date(now);
    if (now.getHours() < 4) {
        todayStart.setDate(todayStart.getDate() - 1);
    }
    todayStart.setHours(4, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const GRAMMAR_SESSION_LIMIT = 10;

    const dueGrammar: any[] = await prisma.$queryRawUnsafe(`
        SELECT * FROM GrammarCard 
        WHERE userId = ? 
          AND interval > 0 
          AND nextReview <= ? 
          AND isDeferred = 0
        ORDER BY nextReview ASC 
        LIMIT ?
    `, user.id, now.toISOString(), GRAMMAR_SESSION_LIMIT);

    const grammarSlotsLeft = Math.max(0, GRAMMAR_SESSION_LIMIT - dueGrammar.length);
    console.log(`Due grammar count: ${dueGrammar.length}`);

    // Since canLearnMoreCount relies on logic, let's just fetch all new grammar for this user
    let newGrammar: any[] = await prisma.$queryRawUnsafe(`
        SELECT * FROM GrammarCard 
        WHERE userId = ? 
          AND interval = 0 
          AND isDeferred = 0
        ORDER BY createdAt ASC 
        LIMIT ?
    `, user.id, 10);

    console.log(`New grammar count: ${newGrammar.length}`);

    const combinedDue = [...dueGrammar];
    const combinedNew = [...newGrammar];

    const interleaved: any[] = [];
    let reviewIdx = 0;
    let newIdx = 0;

    // Pattern: 3-4 Reviews followed by 1 New item
    while (reviewIdx < combinedDue.length || newIdx < combinedNew.length) {
        for (let i = 0; i < 3 && reviewIdx < combinedDue.length; i++) {
            interleaved.push(combinedDue[reviewIdx++]);
        }
        if (newIdx < combinedNew.length) {
            interleaved.push(combinedNew[newIdx++]);
        }
        if (reviewIdx >= combinedDue.length && newIdx < combinedNew.length) {
            interleaved.push(combinedNew[newIdx++]);
        }
    }

    let output = "INTERLEAVED ARRAY:\n";
    interleaved.forEach((c, idx) => {
        output += `${idx}: [${c.id}] (interval: ${c.interval}) ${c.prompt.substring(0, 50)}\n`;
    });

    // Check for duplicates in interleaved
    const seen = new Set();
    let hasDups = false;
    interleaved.forEach(c => {
        if (seen.has(c.id)) {
            hasDups = true;
            output += `\nDUPLICATE FOUND IN INTERLEAVED: ${c.id}\n`;
        }
        seen.add(c.id);
    });

    if (!hasDups) output += "\nNO DUPLICATES IN INTERLEAVED.\n";

    fs.writeFileSync('simulation_log.txt', output);
    console.log("Wrote to simulation_log.txt");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
