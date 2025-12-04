import { StorageManager } from '../src/storage';
import { WordEntry, TimeFilter } from '../src/types';
import { DictionaryAPI } from '../src/api';

class PopupController {
  private currentFilter: TimeFilter = 'all';
  private allWords: WordEntry[] = [];
  private lookupDialog: HTMLElement | null = null;
  private currentLookupWord: WordEntry | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    await this.loadWords();
    this.attachEventListeners();
  }

  private async loadWords() {
    console.log('Popup: Loading words from storage...');
    this.allWords = await StorageManager.getAllWords();
    console.log('Popup: Loaded words:', this.allWords);
    console.log('Popup: Total word count:', this.allWords.length);
    this.renderWords();
    this.updateStats();
  }

  private attachEventListeners() {
    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    settingsBtn?.addEventListener('click', () => this.openSettings());

    // Recall button
    const recallBtn = document.getElementById('recallBtn');
    recallBtn?.addEventListener('click', () => this.openRecallPage());

    // Lookup button
    const lookupBtn = document.getElementById('lookupBtn');
    lookupBtn?.addEventListener('click', () => this.lookupWord());

    // Word input - allow Enter key to trigger lookup
    const wordInput = document.getElementById('wordInput') as HTMLInputElement;
    wordInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.lookupWord();
      }
    });

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const filter = target.dataset.filter as TimeFilter;
        this.setFilter(filter);
      });
    });
  }

  private setFilter(filter: TimeFilter) {
    this.currentFilter = filter;

    // Update active button
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      const buttonElement = button as HTMLElement;
      if (buttonElement.dataset.filter === filter) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    this.renderWords();
  }

  private renderWords() {
    console.log('Popup: Rendering words with filter:', this.currentFilter);
    const filteredWords = StorageManager.filterWordsByTime(this.allWords, this.currentFilter);
    console.log('Popup: Filtered words:', filteredWords);
    console.log('Popup: Filtered word count:', filteredWords.length);

    const wordsList = document.getElementById('wordsList');
    const emptyState = document.getElementById('emptyState');

    console.log('Popup: wordsList element:', wordsList);
    console.log('Popup: emptyState element:', emptyState);

    if (!wordsList || !emptyState) return;

    if (filteredWords.length === 0) {
      console.log('Popup: No words to display, showing empty state');
      wordsList.innerHTML = '';
      emptyState.classList.add('visible');
      return;
    }

    console.log('Popup: Rendering', filteredWords.length, 'word cards');
    emptyState.classList.remove('visible');
    wordsList.innerHTML = filteredWords.map(word => this.createWordCard(word)).join('');

    // Attach delete listeners
    wordsList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const wordId = (e.target as HTMLElement).dataset.wordId;
        if (wordId) {
          this.deleteWord(wordId);
        }
      });
    });
  }

  private createWordCard(word: WordEntry): string {
    const date = new Date(word.timestamp);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const meaningsHtml = word.meanings.map((meaning, meaningIdx) => `
      <div class="meaning-section">
        <div class="part-of-speech">${meaning.partOfSpeech}</div>
        ${meaning.definitions.map((def, defIdx) => `
          <div class="definition-item">
            <div class="definition-number">${defIdx + 1}.</div>
            <div class="definition-content">
              <div class="definition-text">${def.definition}</div>
              ${def.chineseTranslation ? `<div class="chinese-translation">${def.chineseTranslation}</div>` : ''}
              ${def.example ? `<div class="example"><em>${def.example}</em></div>` : '<div class="example no-example"><em>No example available</em></div>'}
              ${def.exampleChineseTranslation ? `<div class="chinese-translation">${def.exampleChineseTranslation}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');

    return `
      <div class="word-card">
        <div class="word-card-header">
          <div class="word-title-section">
            <h3>${word.word}</h3>
            ${word.phonetic ? `<div class="phonetic">${word.phonetic}</div>` : ''}
          </div>
          <button class="delete-btn" data-word-id="${word.id}" title="Delete">🗑️</button>
        </div>
        ${meaningsHtml}
        <div class="timestamp">${formattedDate}</div>
      </div>
    `;
  }

  private async deleteWord(wordId: string) {
    if (!confirm('Are you sure you want to delete this word?')) {
      return;
    }

    await StorageManager.deleteWord(wordId);
    await this.loadWords();
    this.showToast('Word deleted');
  }

  private updateStats() {
    const wordCount = document.getElementById('wordCount');
    if (wordCount) {
      const count = this.allWords.length;
      wordCount.textContent = `${count} word${count !== 1 ? 's' : ''}`;
    }
  }

  private showToast(message: string) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  private openRecallPage() {
    window.location.href = 'recall.html';
  }

  private openSettings() {
    window.location.href = 'settings.html';
  }

  private async lookupWord() {
    const wordInput = document.getElementById('wordInput') as HTMLInputElement;
    const word = wordInput?.value.trim();

    if (!word) {
      this.showToast('Please enter a word');
      return;
    }

    // Only lookup single words
    if (word.split(' ').length > 1) {
      this.showToast('Please enter only one word');
      return;
    }

    // Show loading dialog
    this.showLookupDialogWithLoading(word);

    try {
      // Fetch word definition
      const wordEntry = await DictionaryAPI.fetchWordDefinition(word);

      if (!wordEntry) {
        this.showErrorInLookupDialog(`Could not find definition for "${word}"`);
        return;
      }

      this.currentLookupWord = wordEntry;
      this.updateLookupDialogWithWordData(wordEntry);

      // Clear input after successful lookup
      wordInput.value = '';
    } catch (error) {
      this.showErrorInLookupDialog(`Failed to fetch definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private showLookupDialogWithLoading(word: string) {
    // Create dialog if it doesn't exist
    if (!this.lookupDialog) {
      this.lookupDialog = document.createElement('div');
      this.lookupDialog.className = 'lookup-dialog';
      this.lookupDialog.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background: rgba(0, 0, 0, 0.5) !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 10000 !important;';
      document.body.appendChild(this.lookupDialog);
    }

    this.lookupDialog.innerHTML = `
      <div class="dialog-content" style="background: white; border-radius: 12px; padding: 24px; max-width: 600px; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
        <div class="dialog-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e0e0e0;">
          <div class="word-title">
            <h3 style="margin: 0; font-size: 24px; color: #333;">${word}</h3>
          </div>
          <button class="close-btn" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #999; line-height: 1; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="loading" style="text-align: center; padding: 40px 20px; color: #666;">Loading definition and translation...</div>
        </div>
      </div>
    `;

    this.attachLookupDialogEvents();
  }

  private showErrorInLookupDialog(errorMessage: string) {
    if (!this.lookupDialog) return;

    const dialogBody = this.lookupDialog.querySelector('.dialog-body');
    if (dialogBody) {
      dialogBody.innerHTML = `<p class="error-message" style="color: #c62828; text-align: center; padding: 20px;">${errorMessage}</p>`;
    }
  }

  private updateLookupDialogWithWordData(wordEntry: WordEntry) {
    if (!this.lookupDialog) return;

    const meaningsHtml = wordEntry.meanings.map(meaning => `
      <div class="meaning-section" style="margin-bottom: 24px;">
        <h4 class="part-of-speech" style="color: #667eea; font-size: 14px; font-weight: 600; margin-bottom: 12px; text-transform: uppercase;">${meaning.partOfSpeech}</h4>
        <div class="definitions">
          ${meaning.definitions.map((def, idx) => `
            <div class="definition-item" style="margin-bottom: 16px; padding-left: 8px;">
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <div class="definition-number" style="color: #999; font-weight: 600; min-width: 20px;">${idx + 1}.</div>
                <div class="definition-content" style="flex: 1;">
                  <p class="definition-text" style="margin: 0 0 8px 0; color: #333; line-height: 1.6;">${def.definition}</p>
                  ${def.chineseTranslation ? `<p class="chinese-translation" style="margin: 0 0 8px 0; color: #666; font-size: 14px; line-height: 1.6;">${def.chineseTranslation}</p>` : ''}
                  ${def.example ? `<p class="example" style="margin: 0 0 8px 0; color: #555; font-style: italic; line-height: 1.6;"><em>Example: ${def.example}</em></p>` : ''}
                  ${def.exampleChineseTranslation ? `<p class="chinese-translation" style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">${def.exampleChineseTranslation}</p>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    this.lookupDialog.innerHTML = `
      <div class="dialog-content" style="background: white; border-radius: 12px; padding: 24px; max-width: 600px; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
        <div class="dialog-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e0e0e0;">
          <div class="word-title">
            <h3 style="margin: 0 0 4px 0; font-size: 24px; color: #333;">${wordEntry.word}</h3>
            ${wordEntry.phonetic ? `<span class="phonetic" style="color: #667eea; font-size: 14px;">${wordEntry.phonetic}</span>` : ''}
          </div>
          <button class="close-btn" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #999; line-height: 1; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">&times;</button>
        </div>
        <div class="dialog-body">
          ${meaningsHtml}
        </div>
        <div class="dialog-footer" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0;">
          <button class="add-to-diary-btn" style="background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; width: 100%; transition: all 0.2s;">Add to Learning Diary</button>
        </div>
      </div>
    `;

    this.attachLookupDialogEvents();
  }

  private attachLookupDialogEvents() {
    if (!this.lookupDialog) return;

    const closeBtn = this.lookupDialog.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => this.closeLookupDialog());

    const addBtn = this.lookupDialog.querySelector('.add-to-diary-btn');
    addBtn?.addEventListener('click', async () => {
      await this.addLookupWordToDiary();
    });

    // Close on background click
    this.lookupDialog.addEventListener('click', (e) => {
      if (e.target === this.lookupDialog) {
        this.closeLookupDialog();
      }
    });
  }

  private async addLookupWordToDiary() {
    if (!this.currentLookupWord) return;

    try {
      await StorageManager.addWord(this.currentLookupWord);
      this.showSuccessInLookupDialog();

      // Reload words to show the new word
      await this.loadWords();

      // Close dialog after a delay
      setTimeout(() => this.closeLookupDialog(), 1500);
    } catch (error) {
      console.error('Error adding word to diary:', error);
      this.showToast('Failed to add word to diary');
    }
  }

  private showSuccessInLookupDialog() {
    if (!this.lookupDialog) return;

    const footer = this.lookupDialog.querySelector('.dialog-footer');
    if (footer) {
      footer.innerHTML = '<div class="success-message" style="text-align: center; color: #2e7d32; font-weight: 600; padding: 12px;">✓ Added to diary!</div>';
    }
  }

  private closeLookupDialog() {
    if (this.lookupDialog) {
      this.lookupDialog.remove();
      this.lookupDialog = null;
    }
    this.currentLookupWord = null;
  }
}

// Initialize popup
new PopupController();
