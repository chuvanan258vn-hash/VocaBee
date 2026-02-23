-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "dailyNewWordGoal" INTEGER NOT NULL DEFAULT 20,
    "dailyNewGrammarGoal" INTEGER NOT NULL DEFAULT 10,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "lastGoalMetDate" DATETIME,
    "points" INTEGER NOT NULL DEFAULT 0,
    "streakFreeze" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "dailyNewGrammarGoal", "dailyNewWordGoal", "email", "id", "lastGoalMetDate", "name", "password", "streakCount") SELECT "createdAt", "dailyNewGrammarGoal", "dailyNewWordGoal", "email", "id", "lastGoalMetDate", "name", "password", "streakCount" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
