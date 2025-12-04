// Word types and interfaces
export interface WordDefinition {
  partOfSpeech: string; // noun, verb, adjective, etc.
  definitions: {
    definition: string;
    example?: string;
    chineseTranslation?: string;
    exampleChineseTranslation?: string;
  }[];
}

export interface WordEntry {
  word: string;
  phonetic?: string;
  meanings: WordDefinition[];
  timestamp: number; // When added to diary
  id: string;
  lastRecallDate?: number; // Last time this word was reviewed
  recallCount?: number; // Number of times recalled
  correctCount?: number; // Number of correct recalls
}

export interface LearningDiary {
  words: WordEntry[];
}

export type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'all';

export interface Position {
  x: number;
  y: number;
}

export interface RecallQuestion {
  word: WordEntry;
  question: string;
  correctAnswer: string;
  options: string[];
  type: 'definition' | 'partOfSpeech' | 'example';
}

export interface RecallSession {
  date: string; // YYYY-MM-DD format
  questions: RecallQuestion[];
  currentIndex: number;
  score: number;
  completed: boolean;
}
