import { StorageManager } from './storage';
import { WordEntry } from './types';
import { DictionaryAPI } from './api';

/**
 * Migration script to add Chinese translations to example sentences
 * for all existing words in the learning diary
 */
export class DiaryMigration {
  /**
   * Translate text to Chinese using Google Translate API (free, no API key needed)
   */
  private static async translateToChineseWithGoogle(text: string): Promise<string> {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();

      // Google Translate API returns array format: [[[translated_text, original_text, ...]]]
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      }

      return '翻译失败'; // "Translation failed"
    } catch (error) {
      console.error('Error translating with Google:', error);
      // Fallback to Baidu if Google fails
      return await this.translateToChineseWithBaidu(text);
    }
  }

  /**
   * Fallback: Translate using Baidu Translate API
   */
  private static async translateToChineseWithBaidu(text: string): Promise<string> {
    try {
      const url = `https://fanyi.baidu.com/sug?kw=${encodeURIComponent(text)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Baidu translation failed');
      }

      const data = await response.json();

      if (data && data.data && data.data[0] && data.data[0].v) {
        return data.data[0].v;
      }

      return '暂无翻译'; // "No translation available"
    } catch (error) {
      console.error('Error translating with Baidu:', error);
      return '暂无翻译'; // "No translation available"
    }
  }

  /**
   * Add a delay to avoid rate limiting
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Migrate a single word entry to add Chinese translations for definitions and examples
   */
  private static async migrateWord(word: WordEntry): Promise<WordEntry> {
    console.log(`Migrating word: ${word.word}`);

    let hasChanges = false;

    for (const meaning of word.meanings) {
      for (const definition of meaning.definitions) {
        // Translate definition if Chinese translation doesn't exist
        if (definition.definition && !definition.chineseTranslation) {
          console.log(`  Translating definition: ${definition.definition}`);

          // Add delay to avoid rate limiting (500ms between translations)
          await this.delay(500);

          const translation = await this.translateToChineseWithGoogle(definition.definition);
          definition.chineseTranslation = translation;

          console.log(`  Translation: ${translation}`);
          hasChanges = true;
        }

        // Translate example if it exists and Chinese translation doesn't
        if (definition.example && !definition.exampleChineseTranslation) {
          console.log(`  Translating example: ${definition.example}`);

          // Add delay to avoid rate limiting (500ms between translations)
          await this.delay(500);

          const translation = await this.translateToChineseWithGoogle(definition.example);
          definition.exampleChineseTranslation = translation;

          console.log(`  Translation: ${translation}`);
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      console.log(`  ✓ Updated ${word.word}`);
    } else {
      console.log(`  - No changes needed for ${word.word}`);
    }

    return word;
  }

  /**
   * Migrate all words in the diary
   * @param onProgress Optional callback to report progress
   * @returns Object containing migration statistics
   */
  static async migrateAllWords(
    onProgress?: (current: number, total: number, word: string) => void
  ): Promise<{ total: number; updated: number; skipped: number; errors: number }> {
    console.log('Starting diary migration...');

    const words = await StorageManager.getAllWords();
    const total = words.length;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    console.log(`Found ${total} words to process`);

    const migratedWords: WordEntry[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      if (onProgress) {
        onProgress(i + 1, total, word.word);
      }

      try {
        // Check if word needs migration
        let needsMigration = false;
        for (const meaning of word.meanings) {
          for (const definition of meaning.definitions) {
            // Check if definition needs translation OR example needs translation
            if ((definition.definition && !definition.chineseTranslation) ||
                (definition.example && !definition.exampleChineseTranslation)) {
              needsMigration = true;
              break;
            }
          }
          if (needsMigration) break;
        }

        if (needsMigration) {
          const migratedWord = await this.migrateWord(word);
          migratedWords.push(migratedWord);
          updated++;
        } else {
          migratedWords.push(word);
          skipped++;
        }
      } catch (error) {
        console.error(`Error migrating word ${word.word}:`, error);
        migratedWords.push(word); // Keep original word
        errors++;
      }
    }

    // Save all migrated words back to storage
    if (updated > 0) {
      console.log('Saving migrated words to storage...');
      await StorageManager.saveWords(migratedWords);
      console.log('✓ Migration complete!');
    }

    const stats = { total, updated, skipped, errors };
    console.log('Migration statistics:', stats);

    return stats;
  }

  /**
   * Check how many words need migration
   */
  static async checkMigrationNeeded(): Promise<number> {
    const words = await StorageManager.getAllWords();
    let count = 0;

    for (const word of words) {
      for (const meaning of word.meanings) {
        for (const definition of meaning.definitions) {
          // Check if definition needs translation OR example needs translation
          if ((definition.definition && !definition.chineseTranslation) ||
              (definition.example && !definition.exampleChineseTranslation)) {
            count++;
            break;
          }
        }
      }
    }

    return count;
  }
}
