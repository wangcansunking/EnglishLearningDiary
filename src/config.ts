export interface LLMConfig {
  enabled: boolean;
  endpoint: string;
  apiKey: string;
  model?: string;
  temperature?: number;
}

export interface ExportSettings {
  includeConfig: boolean;
}

const CONFIG_KEY = 'llmApiConfig';
const EXPORT_SETTINGS_KEY = 'exportSettings';

export class ConfigManager {
  // Get LLM configuration
  static async getLLMConfig(): Promise<LLMConfig> {
    return new Promise((resolve) => {
      chrome.storage.local.get([CONFIG_KEY], (result) => {
        const config: LLMConfig = result[CONFIG_KEY] || {
          enabled: false,
          endpoint: '',
          apiKey: '',
          model: 'gpt-3.5-turbo',
          temperature: 0.3
        };
        resolve(config);
      });
    });
  }

  // Save LLM configuration
  static async saveLLMConfig(config: LLMConfig): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [CONFIG_KEY]: config }, () => {
        resolve();
      });
    });
  }

  // Check if LLM API is configured and enabled
  static async isLLMEnabled(): Promise<boolean> {
    const config = await this.getLLMConfig();
    return config.enabled && !!config.endpoint && !!config.apiKey;
  }

  // Get export settings
  static async getExportSettings(): Promise<ExportSettings> {
    return new Promise((resolve) => {
      chrome.storage.local.get([EXPORT_SETTINGS_KEY], (result) => {
        const settings: ExportSettings = result[EXPORT_SETTINGS_KEY] || {
          includeConfig: false
        };
        resolve(settings);
      });
    });
  }

  // Save export settings
  static async saveExportSettings(settings: ExportSettings): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [EXPORT_SETTINGS_KEY]: settings }, () => {
        resolve();
      });
    });
  }
}
