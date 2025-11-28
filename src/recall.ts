import { WordEntry, RecallQuestion, RecallSession } from './types';
import { StorageManager } from './storage';

export class RecallManager {
  private static readonly DAILY_RECALL_COUNT = 10;
  private static readonly SESSION_STORAGE_KEY = 'recallSession';

  // Get today's date as YYYY-MM-DD string
  private static getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Select words for today's recall session
  static async selectWordsForToday(): Promise<WordEntry[]> {
    const allWords = await StorageManager.getAllWords();

    if (allWords.length === 0) {
      return [];
    }

    const today = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Score words based on:
    // 1. Words never reviewed (priority)
    // 2. Words not reviewed recently
    // 3. Words with lower accuracy
    // 4. Older words (need more review)
    const scoredWords = allWords.map(word => {
      let score = 0;

      // Never recalled - highest priority
      if (!word.recallCount || word.recallCount === 0) {
        score += 1000;
      }

      // Days since last recall
      if (word.lastRecallDate) {
        const daysSinceRecall = (today - word.lastRecallDate) / oneDayMs;
        score += daysSinceRecall * 10; // More points for longer time
      } else {
        score += 100; // Never recalled
      }

      // Accuracy score (words with lower accuracy need more practice)
      if (word.recallCount && word.correctCount !== undefined) {
        const accuracy = word.correctCount / word.recallCount;
        score += (1 - accuracy) * 50; // Lower accuracy = higher score
      }

      // Age of word (older words need review)
      const daysSinceAdded = (today - word.timestamp) / oneDayMs;
      if (daysSinceAdded > 7) {
        score += Math.min(daysSinceAdded, 30); // Cap at 30 days
      }

      return { word, score };
    });

    // Sort by score (descending) and take top 10
    scoredWords.sort((a, b) => b.score - a.score);
    const selectedWords = scoredWords
      .slice(0, Math.min(this.DAILY_RECALL_COUNT, allWords.length))
      .map(item => item.word);

    // Shuffle for variety
    return this.shuffleArray(selectedWords);
  }

  // Generate questions for selected words
  static generateQuestions(words: WordEntry[]): RecallQuestion[] {
    const questions: RecallQuestion[] = [];

    for (const word of words) {
      const questionType = this.selectQuestionType(word);
      const question = this.createQuestion(word, questionType);
      if (question) {
        questions.push(question);
      }
    }

    return questions;
  }

  // Select question type based on word data
  private static selectQuestionType(word: WordEntry): 'definition' | 'partOfSpeech' | 'example' {
    const types: ('definition' | 'partOfSpeech' | 'example')[] = ['definition', 'partOfSpeech'];

    // Add 'example' type if word has examples
    const hasExample = word.meanings.some(m =>
      m.definitions.some(d => d.example)
    );
    if (hasExample) {
      types.push('example');
    }

    // Randomly select a type
    return types[Math.floor(Math.random() * types.length)];
  }

  // Create a question based on word and type
  private static createQuestion(
    word: WordEntry,
    type: 'definition' | 'partOfSpeech' | 'example'
  ): RecallQuestion | null {
    switch (type) {
      case 'definition':
        return this.createDefinitionQuestion(word);
      case 'partOfSpeech':
        return this.createPartOfSpeechQuestion(word);
      case 'example':
        return this.createExampleQuestion(word);
      default:
        return null;
    }
  }

  // Create a question asking for the definition
  private static createDefinitionQuestion(word: WordEntry): RecallQuestion | null {
    if (word.meanings.length === 0 || word.meanings[0].definitions.length === 0) {
      return null;
    }

    const firstMeaning = word.meanings[0];
    const correctAnswer = firstMeaning.definitions[0].definition;

    return {
      word,
      question: `What is the meaning of "${word.word}"?`,
      correctAnswer,
      options: [correctAnswer], // Options will be filled with other words' definitions
      type: 'definition'
    };
  }

  // Create a question asking for the part of speech
  private static createPartOfSpeechQuestion(word: WordEntry): RecallQuestion | null {
    if (word.meanings.length === 0) {
      return null;
    }

    const correctAnswer = word.meanings[0].partOfSpeech;
    const allPOS = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction'];

    // Select 3 other options
    const options = [correctAnswer];
    const otherOptions = allPOS.filter(pos => pos !== correctAnswer);
    this.shuffleArray(otherOptions);
    options.push(...otherOptions.slice(0, 3));

    return {
      word,
      question: `What part of speech is "${word.word}"?`,
      correctAnswer,
      options: this.shuffleArray(options),
      type: 'partOfSpeech'
    };
  }

  // Create a question with a fill-in-the-blank example
  private static createExampleQuestion(word: WordEntry): RecallQuestion | null {
    // Find a meaning with an example
    for (const meaning of word.meanings) {
      for (const def of meaning.definitions) {
        if (def.example) {
          // Replace the word in example with a blank
          const example = def.example;
          const wordRegex = new RegExp(`\\b${word.word}\\b`, 'gi');
          const blankedExample = example.replace(wordRegex, '_____');

          if (blankedExample !== example) {
            return {
              word,
              question: `Fill in the blank: ${blankedExample}`,
              correctAnswer: word.word,
              options: [word.word], // Options will be filled with other words
              type: 'example'
            };
          }
        }
      }
    }

    return null;
  }

  // Add distractor options to questions
  static async enrichQuestionsWithOptions(questions: RecallQuestion[]): Promise<RecallQuestion[]> {
    const allWords = await StorageManager.getAllWords();

    return questions.map(question => {
      if (question.type === 'partOfSpeech') {
        // Already has options
        return question;
      }

      // For definition and example questions, add 3 other words as options
      const otherWords = allWords
        .filter(w => w.id !== question.word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.word);

      const options = this.shuffleArray([question.correctAnswer, ...otherWords]);

      return {
        ...question,
        options
      };
    });
  }

  // Get or create today's recall session
  static async getTodaysSession(): Promise<RecallSession | null> {
    const todayString = this.getTodayString();

    // Check if session already exists
    const existingSession = await this.loadSession();
    if (existingSession && existingSession.date === todayString) {
      return existingSession;
    }

    // Create new session
    const words = await this.selectWordsForToday();
    if (words.length === 0) {
      return null;
    }

    let questions = this.generateQuestions(words);
    questions = await this.enrichQuestionsWithOptions(questions);

    const session: RecallSession = {
      date: todayString,
      questions,
      currentIndex: 0,
      score: 0,
      completed: false
    };

    await this.saveSession(session);
    return session;
  }

  // Save session to storage
  static async saveSession(session: RecallSession): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.SESSION_STORAGE_KEY]: session }, () => {
        resolve();
      });
    });
  }

  // Load session from storage
  static async loadSession(): Promise<RecallSession | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.SESSION_STORAGE_KEY], (result) => {
        resolve(result[this.SESSION_STORAGE_KEY] || null);
      });
    });
  }

  // Update word recall statistics
  static async updateWordRecallStats(wordId: string, correct: boolean): Promise<void> {
    const words = await StorageManager.getAllWords();
    const wordIndex = words.findIndex(w => w.id === wordId);

    if (wordIndex >= 0) {
      const word = words[wordIndex];
      word.lastRecallDate = Date.now();
      word.recallCount = (word.recallCount || 0) + 1;
      word.correctCount = (word.correctCount || 0) + (correct ? 1 : 0);

      await StorageManager.saveWords(words);
    }
  }

  // Answer a question
  static async answerQuestion(sessionIndex: number, answer: string): Promise<{ correct: boolean; session: RecallSession }> {
    const session = await this.loadSession();
    if (!session || session.currentIndex !== sessionIndex) {
      throw new Error('Invalid session state');
    }

    const question = session.questions[sessionIndex];
    const correct = answer === question.correctAnswer;

    if (correct) {
      session.score++;
    }

    // Update word stats
    await this.updateWordRecallStats(question.word.id, correct);

    // Move to next question
    session.currentIndex++;
    if (session.currentIndex >= session.questions.length) {
      session.completed = true;
    }

    await this.saveSession(session);
    return { correct, session };
  }

  // Utility: Shuffle array
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
