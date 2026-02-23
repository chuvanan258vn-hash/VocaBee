-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "dailyNewWordGoal" INTEGER NOT NULL DEFAULT 20,
    "dailyNewGrammarGoal" INTEGER NOT NULL DEFAULT 10,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "lastGoalMetDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "word" TEXT NOT NULL,
    "wordType" TEXT,
    "meaning" TEXT NOT NULL,
    "pronunciation" TEXT,
    "example" TEXT,
    "synonyms" TEXT,
    "importanceScore" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'COLLECTION',
    "isDeferred" BOOLEAN NOT NULL DEFAULT false,
    "nextReview" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "repetition" INTEGER NOT NULL DEFAULT 0,
    "efactor" REAL NOT NULL DEFAULT 2.5,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vocabulary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrammarCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "options" TEXT,
    "hint" TEXT,
    "explanation" TEXT,
    "tags" TEXT,
    "importanceScore" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'COLLECTION',
    "isDeferred" BOOLEAN NOT NULL DEFAULT false,
    "nextReview" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "repetition" INTEGER NOT NULL DEFAULT 0,
    "efactor" REAL NOT NULL DEFAULT 2.0,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GrammarCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Vocabulary_userId_nextReview_idx" ON "Vocabulary"("userId", "nextReview");

-- CreateIndex
CREATE INDEX "Vocabulary_userId_repetition_idx" ON "Vocabulary"("userId", "repetition");

-- CreateIndex
CREATE INDEX "Vocabulary_userId_updatedAt_idx" ON "Vocabulary"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vocabulary_word_userId_key" ON "Vocabulary"("word", "userId");

-- CreateIndex
CREATE INDEX "GrammarCard_userId_nextReview_idx" ON "GrammarCard"("userId", "nextReview");
