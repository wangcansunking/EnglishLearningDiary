# English Learning Chrome Extension

A Chrome extension designed to help you learn English by selecting words on any webpage, viewing their definitions, and building your personal vocabulary diary.

## Features

### 🔍 Word Selection & Explanation
- Select any word on a webpage
- Click the "Explain" button that appears
- View detailed information including:
  - Part of speech (noun, verb, adjective, etc.)
  - Chinese translations
  - Multiple definitions with examples
  - Phonetic pronunciation

### 📚 Learning Diary
- Save words to your personal learning diary
- Automatic timestamping for each word
- Organized storage with Chrome's local storage
- Track recall statistics and accuracy

### 📝 Today's Words - Daily Recall Challenge
- **Smart word selection**: Algorithm selects 10 words based on:
  - Words you haven't reviewed recently
  - Words with lower accuracy rates
  - Words that need more practice
- **Interactive quiz**: Multiple-choice questions testing:
  - Word definitions
  - Parts of speech
  - Fill-in-the-blank examples
- **Progress tracking**: See your score and accuracy
- **Spaced repetition**: Words appear more frequently based on your performance
- **Daily challenges**: New set of words each day

### 📊 Dashboard
- Beautiful word cards showing all your saved words
- Filter by time period:
  - Today
  - This Week
  - This Month
  - This Year
  - All Time
- View statistics on your vocabulary growth

### 💾 Export & Import
- Export your diary as JSON for backup
- Import previously saved diaries
- Merge imported words with existing ones intelligently

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd EnglishLearning
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## Usage

### Learning New Words

1. Browse any webpage
2. Select a word by highlighting it with your mouse
3. Click the "Explain" button that appears
4. Read the definition, translations, and examples
5. Click "Add to Learning Diary" to save it

### Viewing Your Diary

1. Click the extension icon in your Chrome toolbar
2. Browse your saved words in the popup dashboard
3. Use filter buttons to view words from specific time periods
4. Delete words you no longer need

### Export/Import

**Export:**
1. Open the extension popup
2. Click "Export JSON"
3. Save the file to your computer

**Import:**
1. Open the extension popup
2. Click "Import JSON"
3. Select a previously exported JSON file
4. Your words will be merged with existing ones

## Development

### Project Structure

```
EnglishLearning/
├── src/
│   ├── types.ts           # TypeScript interfaces
│   ├── storage.ts         # Storage management
│   ├── api.ts             # Dictionary API integration
│   ├── content.ts         # Content script (word selection)
│   ├── popup.ts           # Popup dashboard logic
│   └── background.ts      # Background service worker
├── popup/
│   ├── popup.html         # Dashboard HTML
│   └── popup.css          # Dashboard styles
├── styles/
│   └── content.css        # Content script styles
├── icons/                 # Extension icons
├── manifest.json          # Chrome extension manifest
├── tsconfig.json          # TypeScript configuration
└── package.json           # NPM configuration
```

### Build Scripts

- `npm run build` - Build the extension
- `npm run watch` - Watch for changes and rebuild
- `npm run clean` - Clean the dist folder

### API

The extension uses the [Free Dictionary API](https://dictionaryapi.dev/) for word definitions.

## Technical Details

- **Manifest Version:** 3 (latest Chrome extension standard)
- **TypeScript:** For type-safe development
- **Storage:** Chrome Local Storage API
- **Permissions:**
  - `storage` - For saving words
  - `activeTab` - For word selection on webpages

## Future Enhancements

- [ ] Integration with translation APIs for better Chinese translations
- [ ] Spaced repetition system for reviewing words
- [ ] Word pronunciation audio
- [ ] Custom word lists and categories
- [ ] Study mode with flashcards
- [ ] Statistics and learning progress tracking
- [ ] Sync across devices using Chrome Sync Storage

## Notes

- Chinese translations are currently placeholders. For production use, integrate with a translation API like Google Translate or DeepL.
- The extension requires an internet connection to fetch word definitions.
- Words are stored locally in your browser.

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
