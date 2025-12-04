import { Position, WordEntry } from './types';
import { DictionaryAPI } from './api';
import { StorageManager } from './storage';

class WordSelector {
  private explainButton: HTMLElement | null = null;
  private dialog: HTMLElement | null = null;
  private currentWord: string = '';
  private currentWordEntry: WordEntry | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Use mouseup with a small delay to ensure selection is captured
    document.addEventListener('mouseup', (event) => {
      // Small delay to ensure selection is finalized
      setTimeout(() => this.handleTextSelection(event), 10);
    });
    document.addEventListener('mousedown', this.handleClickOutside.bind(this));
  }

  private handleTextSelection(event: MouseEvent) {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    // Remove existing button
    this.removeExplainButton();

    if (selectedText && selectedText.split(' ').length === 1) {
      // Only show button for single word selection
      this.currentWord = selectedText;
      this.showExplainButton({ x: event.pageX, y: event.pageY });
    }
  }

  private showExplainButton(position: Position) {
    this.explainButton = document.createElement('div');
    this.explainButton.className = 'english-learning-explain-btn';
    this.explainButton.textContent = 'Explain';
    this.explainButton.style.left = `${position.x}px`;
    this.explainButton.style.top = `${position.y + 10}px`;

    // Store the word on the button element to preserve it
    this.explainButton.dataset.word = this.currentWord;

    this.explainButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      // Retrieve word from the button
      const word = (e.currentTarget as HTMLElement).dataset.word || this.currentWord;
      await this.showExplanationDialog(word);
    });

    document.body.appendChild(this.explainButton);
  }

  private removeExplainButton() {
    if (this.explainButton) {
      this.explainButton.remove();
      this.explainButton = null;
    }
  }

  private async showExplanationDialog(word: string) {
    this.removeExplainButton();

    if (!word || word.trim() === '') {
      this.showErrorInDialog('Word is empty');
      return;
    }

    // Show dialog with loading state first
    this.showDialogWithLoading(word);

    try {
      // Fetch word definition
      const wordEntry = await DictionaryAPI.fetchWordDefinition(word);

      if (!wordEntry) {
        this.showErrorInDialog(`Could not find definition for "${word}"`);
        return;
      }

      this.currentWordEntry = wordEntry;
      this.updateDialogWithWordData(wordEntry);
    } catch (error) {
      this.showErrorInDialog(`Failed to fetch definition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private showDialogWithLoading(word: string) {
    // Create dialog if it doesn't exist
    if (!this.dialog) {
      this.dialog = document.createElement('div');
      this.dialog.className = 'english-learning-dialog';
      // Add inline styles to ensure visibility
      this.dialog.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background: rgba(0, 0, 0, 0.5) !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 2147483647 !important;';
      document.body.appendChild(this.dialog);
    }

    this.dialog.innerHTML = `
      <div class="dialog-content">
        <div class="dialog-header">
          <div class="word-title">
            <h3>${word}</h3>
          </div>
          <button class="close-btn">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="loading">Loading definition and translation...</div>
        </div>
      </div>
    `;

    this.attachDialogEvents();
  }

  private showErrorInDialog(errorMessage: string) {
    if (!this.dialog) {
      this.dialog = document.createElement('div');
      this.dialog.className = 'english-learning-dialog';
      this.dialog.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background: rgba(0, 0, 0, 0.5) !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 2147483647 !important;';
      document.body.appendChild(this.dialog);
    }

    this.dialog.innerHTML = `
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>Error</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="dialog-body">
          <p class="error-message">${errorMessage}</p>
        </div>
      </div>
    `;

    this.attachDialogEvents();
  }

  private updateDialogWithWordData(wordEntry: WordEntry) {
    if (!this.dialog) return;

    const meaningsHtml = wordEntry.meanings.map(meaning => `
      <div class="meaning-section">
        <h4 class="part-of-speech">${meaning.partOfSpeech}</h4>
        <div class="definitions">
          ${meaning.definitions.map((def, idx) => `
            <div class="definition-item">
              <div class="definition-number">${idx + 1}.</div>
              <div class="definition-content">
                <p class="definition-text">${def.definition}</p>
                ${def.chineseTranslation ? `<p class="chinese-translation">${def.chineseTranslation}</p>` : ''}
                ${def.example ? `<p class="example"><em>Example: ${def.example}</em></p>` : ''}
                ${def.exampleChineseTranslation ? `<p class="chinese-translation">${def.exampleChineseTranslation}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    this.dialog.innerHTML = `
      <div class="dialog-content">
        <div class="dialog-header">
          <div class="word-title">
            <h3>${wordEntry.word}</h3>
            ${wordEntry.phonetic ? `<span class="phonetic">${wordEntry.phonetic}</span>` : ''}
          </div>
          <button class="close-btn">&times;</button>
        </div>
        <div class="dialog-body">
          ${meaningsHtml}
        </div>
        <div class="dialog-footer">
          <button class="add-to-diary-btn">Add to Learning Diary</button>
        </div>
      </div>
    `;

    this.attachDialogEvents();
  }

  private attachDialogEvents() {
    if (!this.dialog) return;

    const closeBtn = this.dialog.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => this.closeDialog());

    const addBtn = this.dialog.querySelector('.add-to-diary-btn');
    addBtn?.addEventListener('click', async () => {
      await this.addToDiary();
    });
  }

  private async addToDiary() {
    if (!this.currentWordEntry) return;

    try {
      console.log('Adding word to diary:', this.currentWordEntry);
      await StorageManager.addWord(this.currentWordEntry);
      console.log('Word added successfully');

      // Verify it was saved
      const allWords = await StorageManager.getAllWords();
      console.log('All words in storage:', allWords);

      this.showSuccessMessage();
      setTimeout(() => this.closeDialog(), 1500);
    } catch (error) {
      console.error('Error adding word to diary:', error);
      alert('Failed to add word to diary');
    }
  }

  private showSuccessMessage() {
    if (!this.dialog) return;

    const footer = this.dialog.querySelector('.dialog-footer');
    if (footer) {
      footer.innerHTML = '<div class="success-message">✓ Added to diary!</div>';
    }
  }

  private closeDialog() {
    if (this.dialog) {
      this.dialog.remove();
      this.dialog = null;
    }
    this.currentWordEntry = null;
  }

  private handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Close dialog if clicking outside
    if (this.dialog && !target.closest('.dialog-content')) {
      this.closeDialog();
    }

    // Remove explain button if clicking elsewhere
    if (this.explainButton && !target.closest('.english-learning-explain-btn')) {
      this.removeExplainButton();
    }
  }
}

// Initialize the word selector
new WordSelector();
