import { WordEntry, LearningDiary, TimeFilter } from './types';
import { ConfigManager, LLMConfig } from './config';

const STORAGE_KEY = 'englishLearningDiary';

export class StorageManager {
  // Get all words from storage
  static async getAllWords(): Promise<WordEntry[]> {
    return new Promise((resolve) => {
      console.log('StorageManager: Getting all words from storage...');
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        console.log('StorageManager: Raw storage result:', result);
        const diary: LearningDiary = result[STORAGE_KEY] || { words: [] };
        console.log('StorageManager: Diary:', diary);
        console.log('StorageManager: Returning', diary.words.length, 'words');
        resolve(diary.words);
      });
    });
  }

  // Add a word to the diary
  static async addWord(word: WordEntry): Promise<void> {
    const words = await this.getAllWords();

    // Check if word already exists
    const existingIndex = words.findIndex(w => w.word.toLowerCase() === word.word.toLowerCase());

    if (existingIndex >= 0) {
      // Update existing word with new timestamp
      words[existingIndex] = { ...word, timestamp: Date.now() };
    } else {
      // Add new word
      words.unshift(word);
    }

    await this.saveWords(words);
  }

  // Save words to storage
  static async saveWords(words: WordEntry[]): Promise<void> {
    return new Promise((resolve) => {
      const diary: LearningDiary = { words };
      chrome.storage.local.set({ [STORAGE_KEY]: diary }, () => {
        resolve();
      });
    });
  }

  // Filter words by time period
  static filterWordsByTime(words: WordEntry[], filter: TimeFilter): WordEntry[] {
    if (filter === 'all') return words;

    const now = Date.now();
    const periods: Record<TimeFilter, number> = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
      all: Infinity
    };

    const periodMs = periods[filter];
    return words.filter(word => (now - word.timestamp) <= periodMs);
  }

  // Export diary as JSON
  static async exportDiary(includeConfig: boolean = false): Promise<string> {
    const words = await this.getAllWords();
    const exportData: any = {
      words,
      exportDate: Date.now()
    };

    if (includeConfig) {
      const config = await ConfigManager.getLLMConfig();
      // Exclude API key for security
      exportData.config = {
        enabled: config.enabled,
        endpoint: config.endpoint,
        model: config.model,
        temperature: config.temperature
        // apiKey is intentionally excluded
      };
    }

    return JSON.stringify(exportData, null, 2);
  }

  // Import diary from JSON
  static async importDiary(jsonData: string): Promise<{ success: boolean; message: string }> {
    try {
      const data = JSON.parse(jsonData);

      if (!data.words || !Array.isArray(data.words)) {
        return { success: false, message: 'Invalid diary format' };
      }

      const existingWords = await this.getAllWords();
      const importedWords = data.words as WordEntry[];

      // Merge words, avoiding duplicates
      const wordMap = new Map<string, WordEntry>();

      existingWords.forEach(word => {
        wordMap.set(word.word.toLowerCase(), word);
      });

      importedWords.forEach(word => {
        const key = word.word.toLowerCase();
        if (!wordMap.has(key) || wordMap.get(key)!.timestamp < word.timestamp) {
          wordMap.set(key, word);
        }
      });

      const mergedWords = Array.from(wordMap.values()).sort((a, b) => b.timestamp - a.timestamp);
      await this.saveWords(mergedWords);

      // Import config if present (but preserve existing API key)
      let configImported = false;
      if (data.config) {
        const existingConfig = await ConfigManager.getLLMConfig();
        const importedConfig: LLMConfig = {
          enabled: data.config.enabled ?? existingConfig.enabled,
          endpoint: data.config.endpoint ?? existingConfig.endpoint,
          apiKey: existingConfig.apiKey, // Keep existing API key
          model: data.config.model ?? existingConfig.model,
          temperature: data.config.temperature ?? existingConfig.temperature
        };
        await ConfigManager.saveLLMConfig(importedConfig);
        configImported = true;
      }

      const message = configImported
        ? `Successfully imported ${importedWords.length} words and configuration (API key preserved)`
        : `Successfully imported ${importedWords.length} words`;

      return { success: true, message };
    } catch (error) {
      return { success: false, message: 'Failed to parse JSON: ' + (error as Error).message };
    }
  }

  // Delete a word
  static async deleteWord(wordId: string): Promise<void> {
    const words = await this.getAllWords();
    const filteredWords = words.filter(w => w.id !== wordId);
    await this.saveWords(filteredWords);
  }
}
