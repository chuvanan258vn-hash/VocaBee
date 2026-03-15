
import { GrammarCard as PrismaGrammarCard, Vocabulary as PrismaVocabulary } from "@prisma/client";

export type GrammarCard = PrismaGrammarCard & {
    meaning?: string | null;
    myError?: string | null;
    trap?: string | null;
    goldenRule?: string | null;
};

export type Vocabulary = PrismaVocabulary;

export interface GrammarCardUpdateData {
    type: string;
    prompt: string;
    answer: string;
    meaning?: string;
    options?: string;
    hint?: string;
    explanation?: string;
    myError?: string;
    trap?: string;
    goldenRule?: string;
    tags?: string;
}

export interface VocabularyUpdateData {
    word: string;
    wordType?: string;
    meaning: string;
    pronunciation?: string;
    example?: string;
    synonyms?: string;
    context?: string;
}
