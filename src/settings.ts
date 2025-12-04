import { ConfigManager, LLMConfig, ExportSettings } from './config';
import { DictionaryAPI } from './api';
import { StorageManager } from './storage';
import { DiaryMigration } from './migration';

class SettingsController {
  private config: LLMConfig | null = null;
  private exportSettings: ExportSettings | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    await this.loadConfig();
    await this.checkMigrationStatus();
    this.attachEventListeners();
  }

  private async loadConfig() {
    this.config = await ConfigManager.getLLMConfig();
    this.exportSettings = await ConfigManager.getExportSettings();

    // Update UI with loaded config
    const enabledCheckbox = document.getElementById('llmEnabled') as HTMLInputElement;
    const endpointInput = document.getElementById('llmEndpoint') as HTMLInputElement;
    const apiKeyInput = document.getElementById('llmApiKey') as HTMLInputElement;
    const modelInput = document.getElementById('llmModel') as HTMLInputElement;
    const temperatureInput = document.getElementById('llmTemperature') as HTMLInputElement;
    const includeConfigCheckbox = document.getElementById('includeConfigInExport') as HTMLInputElement;
    const llmConfigDiv = document.getElementById('llmConfig');

    if (enabledCheckbox) {
      enabledCheckbox.checked = this.config.enabled;
    }

    if (endpointInput) {
      endpointInput.value = this.config.endpoint || '';
    }

    if (apiKeyInput) {
      apiKeyInput.value = this.config.apiKey || '';
    }

    if (modelInput) {
      modelInput.value = this.config.model || 'gpt-3.5-turbo';
    }

    if (temperatureInput) {
      temperatureInput.value = (this.config.temperature ?? 0.3).toString();
    }

    if (includeConfigCheckbox) {
      includeConfigCheckbox.checked = this.exportSettings.includeConfig;
    }

    // Show/hide config based on enabled state
    if (llmConfigDiv) {
      if (this.config.enabled) {
        llmConfigDiv.classList.remove('hidden');
      } else {
        llmConfigDiv.classList.add('hidden');
      }
    }
  }

  private attachEventListeners() {
    // Back button
    const backBtn = document.getElementById('backBtn');
    backBtn?.addEventListener('click', () => {
      window.location.href = 'popup.html';
    });

    // Migration button
    const migrationBtn = document.getElementById('migrationBtn');
    migrationBtn?.addEventListener('click', () => this.runMigration());

    // Enable toggle
    const enabledCheckbox = document.getElementById('llmEnabled') as HTMLInputElement;
    enabledCheckbox?.addEventListener('change', async () => {
      const llmConfigDiv = document.getElementById('llmConfig');
      if (enabledCheckbox.checked) {
        llmConfigDiv?.classList.remove('hidden');
      } else {
        llmConfigDiv?.classList.add('hidden');
      }

      // Auto-save the enabled state
      if (this.config) {
        this.config.enabled = enabledCheckbox.checked;
        await ConfigManager.saveLLMConfig(this.config);
        console.log('LLM enabled state saved:', enabledCheckbox.checked);
      }
    });

    // Export config checkbox
    const includeConfigCheckbox = document.getElementById('includeConfigInExport') as HTMLInputElement;
    includeConfigCheckbox?.addEventListener('change', async () => {
      const settings: ExportSettings = {
        includeConfig: includeConfigCheckbox.checked
      };
      await ConfigManager.saveExportSettings(settings);
    });

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    exportBtn?.addEventListener('click', () => this.exportDiary());

    // Import button
    const importBtn = document.getElementById('importBtn');
    importBtn?.addEventListener('click', () => this.triggerImport());

    // Import file input
    const importFile = document.getElementById('importFile') as HTMLInputElement;
    importFile?.addEventListener('change', (e) => this.handleImport(e));

    // Test button
    const testBtn = document.getElementById('testBtn');
    testBtn?.addEventListener('click', () => this.testConnection());

    // Save button
    const saveBtn = document.getElementById('saveBtn');
    saveBtn?.addEventListener('click', () => this.saveConfig());
  }

  private async testConnection() {
    const testResult = document.getElementById('testResult');
    const endpointInput = document.getElementById('llmEndpoint') as HTMLInputElement;
    const apiKeyInput = document.getElementById('llmApiKey') as HTMLInputElement;
    const modelInput = document.getElementById('llmModel') as HTMLInputElement;
    const temperatureInput = document.getElementById('llmTemperature') as HTMLInputElement;

    if (!testResult) return;

    // Show loading
    testResult.className = 'test-result';
    testResult.textContent = 'Testing connection...';
    testResult.classList.remove('hidden');

    // Temporarily save config for testing
    const temperature = parseFloat(temperatureInput.value) || 0.3;
    const testConfig: LLMConfig = {
      enabled: true,
      endpoint: endpointInput.value.trim(),
      apiKey: apiKeyInput.value.trim(),
      model: modelInput.value.trim() || 'gpt-3.5-turbo',
      temperature: Math.max(0, Math.min(2, temperature)) // Clamp between 0 and 2
    };

    await ConfigManager.saveLLMConfig(testConfig);

    try {
      // Test with a simple word
      const result = await DictionaryAPI.fetchWordDefinition('test');

      if (result && result.meanings.length > 0) {
        testResult.className = 'test-result success';
        testResult.textContent = '✓ Connection successful! LLM API is working correctly.';
      } else {
        testResult.className = 'test-result error';
        testResult.textContent = '✗ Connection failed: No valid response received from LLM API.';
      }
    } catch (error) {
      testResult.className = 'test-result error';
      testResult.textContent = `✗ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Hide result after 5 seconds
    setTimeout(() => {
      testResult.classList.add('hidden');
    }, 5000);
  }

  private async saveConfig() {
    const endpointInput = document.getElementById('llmEndpoint') as HTMLInputElement;
    const apiKeyInput = document.getElementById('llmApiKey') as HTMLInputElement;
    const modelInput = document.getElementById('llmModel') as HTMLInputElement;
    const temperatureInput = document.getElementById('llmTemperature') as HTMLInputElement;
    const enabledCheckbox = document.getElementById('llmEnabled') as HTMLInputElement;

    const temperature = parseFloat(temperatureInput.value) || 0.3;
    const config: LLMConfig = {
      enabled: enabledCheckbox.checked,
      endpoint: endpointInput.value.trim(),
      apiKey: apiKeyInput.value.trim(),
      model: modelInput.value.trim() || 'gpt-3.5-turbo',
      temperature: Math.max(0, Math.min(2, temperature)) // Clamp between 0 and 2
    };

    // Validate
    if (config.enabled) {
      if (!config.endpoint) {
        alert('Please enter an API endpoint');
        return;
      }
      if (!config.apiKey) {
        alert('Please enter an API key');
        return;
      }
    }

    await ConfigManager.saveLLMConfig(config);

    // Show success message
    const testResult = document.getElementById('testResult');
    if (testResult) {
      testResult.className = 'test-result success';
      testResult.textContent = '✓ Configuration saved successfully!';
      testResult.classList.remove('hidden');

      setTimeout(() => {
        testResult.classList.add('hidden');
      }, 3000);
    }
  }

  private async exportDiary() {
    const exportResult = document.getElementById('exportResult');

    if (exportResult) {
      exportResult.className = 'test-result';
      exportResult.textContent = 'Preparing export...';
      exportResult.classList.remove('hidden');
    }

    try {
      // Get export settings
      const includeConfig = this.exportSettings?.includeConfig || false;

      const jsonData = await StorageManager.exportDiary(includeConfig);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `english-learning-diary-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const message = includeConfig
        ? 'Diary and configuration exported successfully (API key excluded)'
        : 'Diary exported successfully';

      if (exportResult) {
        exportResult.className = 'test-result success';
        exportResult.textContent = `✓ ${message}`;

        setTimeout(() => {
          exportResult.classList.add('hidden');
        }, 3000);
      }
    } catch (error) {
      if (exportResult) {
        exportResult.className = 'test-result error';
        exportResult.textContent = `✗ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`;

        setTimeout(() => {
          exportResult.classList.add('hidden');
        }, 5000);
      }
    }
  }

  private triggerImport() {
    const importFile = document.getElementById('importFile') as HTMLInputElement;
    importFile?.click();
  }

  private async handleImport(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const exportResult = document.getElementById('exportResult');

    if (!file) return;

    if (exportResult) {
      exportResult.className = 'test-result';
      exportResult.textContent = 'Importing...';
      exportResult.classList.remove('hidden');
    }

    try {
      const text = await file.text();
      const result = await StorageManager.importDiary(text);

      if (result.success) {
        if (exportResult) {
          exportResult.className = 'test-result success';
          exportResult.textContent = `✓ ${result.message}`;

          setTimeout(() => {
            exportResult.classList.add('hidden');
          }, 3000);
        }
      } else {
        if (exportResult) {
          exportResult.className = 'test-result error';
          exportResult.textContent = `✗ Import failed: ${result.message}`;

          setTimeout(() => {
            exportResult.classList.add('hidden');
          }, 5000);
        }
      }
    } catch (error) {
      if (exportResult) {
        exportResult.className = 'test-result error';
        exportResult.textContent = `✗ Failed to read file: ${(error as Error).message}`;

        setTimeout(() => {
          exportResult.classList.add('hidden');
        }, 5000);
      }
    }

    // Reset input
    input.value = '';
  }

  private async checkMigrationStatus() {
    const migrationInfo = document.getElementById('migrationInfo');
    const migrationBtn = document.getElementById('migrationBtn') as HTMLButtonElement;

    if (!migrationInfo || !migrationBtn) return;

    try {
      const wordsNeedingMigration = await DiaryMigration.checkMigrationNeeded();
      const totalWords = (await StorageManager.getAllWords()).length;

      if (wordsNeedingMigration === 0) {
        migrationInfo.textContent = `✓ All ${totalWords} words are up to date!`;
        migrationInfo.className = 'migration-info success';
        migrationBtn.disabled = true;
      } else {
        migrationInfo.textContent = `${wordsNeedingMigration} out of ${totalWords} words need Chinese translations for definitions and/or examples.`;
        migrationInfo.className = 'migration-info';
        migrationBtn.disabled = false;
      }
    } catch (error) {
      migrationInfo.textContent = `Error checking migration status: ${error instanceof Error ? error.message : 'Unknown error'}`;
      migrationInfo.className = 'migration-info error';
    }
  }

  private async runMigration() {
    const migrationBtn = document.getElementById('migrationBtn') as HTMLButtonElement;
    const migrationProgress = document.getElementById('migrationProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const migrationResult = document.getElementById('migrationResult');

    if (!migrationBtn || !migrationProgress || !progressFill || !progressText || !migrationResult) return;

    // Confirm with user
    const wordsNeedingMigration = await DiaryMigration.checkMigrationNeeded();
    if (!confirm(`This will add Chinese translations for definitions and example sentences for ${wordsNeedingMigration} words. This may take several minutes. Continue?`)) {
      return;
    }

    // Disable button and show progress
    migrationBtn.disabled = true;
    migrationProgress.classList.remove('hidden');
    migrationResult.classList.add('hidden');

    try {
      const stats = await DiaryMigration.migrateAllWords((current, total, word) => {
        // Update progress
        const percentage = Math.round((current / total) * 100);
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${current} / ${total} - ${word}`;
      });

      // Show success result
      migrationResult.className = 'test-result success';
      migrationResult.textContent = `✓ Migration complete! Updated ${stats.updated} words, skipped ${stats.skipped} (already up to date)${stats.errors > 0 ? `, ${stats.errors} errors` : ''}.`;
      migrationResult.classList.remove('hidden');

      // Update migration status
      await this.checkMigrationStatus();

      // Hide progress after a delay
      setTimeout(() => {
        migrationProgress.classList.add('hidden');
      }, 2000);
    } catch (error) {
      migrationResult.className = 'test-result error';
      migrationResult.textContent = `✗ Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      migrationResult.classList.remove('hidden');

      migrationBtn.disabled = false;
    }
  }
}

// Initialize settings controller
new SettingsController();
