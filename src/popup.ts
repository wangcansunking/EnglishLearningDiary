import { StorageManager } from '../src/storage';
import { WordEntry, TimeFilter } from '../src/types';

class PopupController {
  private currentFilter: TimeFilter = 'all';
  private allWords: WordEntry[] = [];

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
}

// Initialize popup
new PopupController();
