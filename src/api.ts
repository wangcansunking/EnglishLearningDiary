import { WordDefinition, WordEntry } from './types';
import { ConfigManager, LLMConfig } from './config';

export class DictionaryAPI {
  private static readonly API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
  private static readonly GOOGLE_TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';

  static async fetchWordDefinition(word: string): Promise<WordEntry | null> {
    // Try LLM API first if configured
    const isLLMEnabled = await ConfigManager.isLLMEnabled();
    if (isLLMEnabled) {
      try {
        console.log('Attempting to fetch definition from LLM API...');
        const llmResult = await this.fetchFromLLM(word);
        if (llmResult) {
          console.log('Successfully fetched from LLM API');
          return llmResult;
        }
      } catch (error) {
        console.warn('LLM API failed, falling back to dictionary API:', error);
      }
    }

    // Fallback to dictionary API
    return await this.fetchFromDictionaryAPI(word);
  }

  private static async fetchFromLLM(word: string): Promise<WordEntry | null> {
    const config = await ConfigManager.getLLMConfig();

    const prompt = `Please provide a detailed dictionary entry for the word "${word}" in the following JSON format:
{
  "word": "${word}",
  "phonetic": "pronunciation in IPA format",
  "meanings": [
    {
      "partOfSpeech": "noun/verb/adjective/etc",
      "definitions": [
        {
          "definition": "English definition",
          "example": "Example sentence using the word",
          "chineseTranslation": "Chinese translation of the definition",
          "exampleChineseTranslation": "Chinese translation of the example sentence"
        }
      ]
    }
  ]
}

Please provide up to 3 definitions per part of speech, with examples and Chinese translations for both the definition and the example sentence.`;

    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful English dictionary assistant. Always respond with valid JSON only, no additional text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: config.temperature ?? 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`LLM API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Parse LLM response (assuming OpenAI-compatible format)
      let content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Invalid LLM response format');
      }

      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        content = jsonMatch[1];
      }

      const wordData = JSON.parse(content.trim());

      return {
        word: wordData.word || word,
        phonetic: wordData.phonetic,
        meanings: wordData.meanings || [],
        timestamp: Date.now(),
        id: `${word}-${Date.now()}`
      };
    } catch (error) {
      console.error('Error fetching from LLM:', error);
      return null;
    }
  }

  private static async fetchFromDictionaryAPI(word: string): Promise<WordEntry | null> {
    try {
      const response = await fetch(`${this.API_URL}/${encodeURIComponent(word)}`);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        return null;
      }

      const wordData = data[0];
      const meanings: WordDefinition[] = [];

      // Process meanings with translation
      for (const meaning of wordData.meanings || []) {
        const definitions = [];

        for (const def of (meaning.definitions || []).slice(0, 3)) {
          // Get Chinese translation for the definition
          const chineseTranslation = await this.translateToChineseWithGoogle(def.definition);

          // Get Chinese translation for the example if it exists
          const exampleChineseTranslation = def.example
            ? await this.translateToChineseWithGoogle(def.example)
            : undefined;

          definitions.push({
            definition: def.definition,
            example: def.example,
            chineseTranslation: chineseTranslation,
            exampleChineseTranslation: exampleChineseTranslation
          });
        }

        if (definitions.length > 0) {
          meanings.push({
            partOfSpeech: meaning.partOfSpeech,
            definitions: definitions
          });
        }
      }

      return {
        word: wordData.word,
        phonetic: wordData.phonetic || wordData.phonetics?.[0]?.text,
        meanings,
        timestamp: Date.now(),
        id: `${word}-${Date.now()}`
      };
    } catch (error) {
      console.error('Error fetching word definition:', error);
      return null;
    }
  }

  // Translate text to Chinese using Google Translate API (free, no API key needed)
  private static async translateToChineseWithGoogle(text: string): Promise<string> {
    try {
      const url = `${this.GOOGLE_TRANSLATE_API}?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`;
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

  // Fallback: Translate using Baidu Translate API (also free, no API key for basic usage)
  private static async translateToChineseWithBaidu(text: string): Promise<string> {
    try {
      // Using Baidu's public API endpoint (no auth required for small usage)
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
}
