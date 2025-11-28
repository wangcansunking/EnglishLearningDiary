# Development Guide

## Project Structure

```
EnglishLearning/
├── src/                    # TypeScript source files
│   ├── types.ts           # Type definitions
│   ├── storage.ts         # Storage management (CRUD operations)
│   ├── api.ts             # Dictionary API integration
│   ├── content.ts         # Content script (runs on webpages)
│   ├── popup.ts           # Popup dashboard logic
│   └── background.ts      # Background service worker
├── popup/                 # Popup UI files
│   ├── popup.html         # Dashboard HTML structure
│   └── popup.css          # Dashboard styles
├── styles/                # Content script styles
│   └── content.css        # Styles for explain button & dialog
├── icons/                 # Extension icons (SVG format)
├── dist/                  # Built extension (generated)
├── manifest.json          # Chrome extension manifest
├── tsconfig.json          # TypeScript configuration
├── package.json           # NPM dependencies and scripts
└── README.md             # Project documentation
```

## File Descriptions

### Core Logic Files (src/)

#### `types.ts`
- Defines all TypeScript interfaces
- `WordDefinition`: Structure for word meanings
- `WordEntry`: Complete word with metadata
- `LearningDiary`: Collection of words
- `TimeFilter`: Filter types (day/week/month/year/all)

#### `storage.ts`
- Manages Chrome local storage operations
- Key methods:
  - `getAllWords()`: Retrieve all saved words
  - `addWord(word)`: Add/update a word
  - `deleteWord(id)`: Remove a word
  - `filterWordsByTime(words, filter)`: Filter by time period
  - `exportDiary()`: Generate JSON export
  - `importDiary(json)`: Import and merge words

#### `api.ts`
- Integrates with Free Dictionary API
- `fetchWordDefinition(word)`: Gets word data from API
- Includes fallback Chinese translations
- Handles API errors gracefully

#### `content.ts`
- Runs on all webpages (`<all_urls>`)
- Handles text selection detection
- Shows/hides explain button
- Creates and manages explanation dialog
- Handles "Add to Diary" functionality

#### `popup.ts`
- Controls dashboard popup behavior
- Manages word filtering
- Handles export/import operations
- Renders word cards dynamically
- Delete operations with confirmation

#### `background.ts`
- Background service worker
- Can handle message passing if needed
- Currently minimal (future extensibility)

### UI Files

#### `popup/popup.html`
- Dashboard structure
- Filter buttons
- Word cards container
- Export/import controls

#### `popup/popup.css`
- Dashboard styling
- Card layout and animations
- Button styles
- Responsive design

#### `styles/content.css`
- Explain button styles
- Dialog overlay and content
- Word definition formatting
- Animations and transitions

## Development Workflow

### Initial Setup
```bash
npm install           # Install dependencies
npm run build         # Build extension
```

### Development
```bash
npm run watch         # Auto-rebuild on changes
```

Then reload extension in Chrome:
1. Go to `chrome://extensions/`
2. Click refresh icon on the extension

### Clean Build
```bash
npm run clean         # Remove dist folder
npm run build         # Fresh build
```

## Key Technologies

- **TypeScript**: Type-safe JavaScript
- **Chrome Extensions API**: Manifest V3
- **Chrome Storage API**: Local data persistence
- **Free Dictionary API**: Word definitions
- **Vanilla JS**: No frameworks (lightweight)

## Chrome Extension Components

### Manifest V3
- Modern extension standard
- Service worker instead of background page
- Enhanced security

### Content Scripts
- Run in webpage context
- Can access/modify DOM
- Isolated JavaScript environment
- CSS injection for styling

### Popup
- Opens when clicking extension icon
- Separate HTML/CSS/JS
- Limited window size
- Access to Chrome APIs

### Background Service Worker
- Runs in background
- Handles events and messages
- No DOM access
- Persistent or event-driven

## Storage Schema

```typescript
// Chrome local storage structure
{
  "englishLearningDiary": {
    "words": [
      {
        "id": "word-1234567890",
        "word": "example",
        "phonetic": "/ɪɡˈzæmpəl/",
        "meanings": [
          {
            "partOfSpeech": "noun",
            "definitions": [
              {
                "definition": "A thing characteristic of its kind...",
                "example": "This is an example sentence",
                "chineseTranslation": "例子"
              }
            ]
          }
        ],
        "timestamp": 1234567890123
      }
    ]
  }
}
```

## API Integration

### Dictionary API Endpoint
```
https://api.dictionaryapi.dev/api/v2/entries/en/{word}
```

### Response Structure
```json
[
  {
    "word": "example",
    "phonetic": "/ɪɡˈzæmpəl/",
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definitions": [
          {
            "definition": "...",
            "example": "..."
          }
        ]
      }
    ]
  }
]
```

## Common Development Tasks

### Adding a New Feature

1. **Update types** (`types.ts` if new data structures needed)
2. **Implement logic** (storage/api/content/popup files)
3. **Update UI** (HTML/CSS if visual changes)
4. **Build and test** (`npm run build`)
5. **Reload extension** in Chrome

### Modifying Styles

1. Edit `popup/popup.css` for dashboard
2. Edit `styles/content.css` for webpage elements
3. Run `npm run build` to copy to dist
4. Reload extension

### Changing Permissions

1. Edit `manifest.json`
2. Add/remove from `permissions` or `host_permissions`
3. Rebuild and reload extension
4. May need to re-accept permissions in Chrome

## Testing

### Manual Testing Checklist

- [ ] Word selection shows explain button
- [ ] Explain button fetches definition
- [ ] Dialog shows all word details
- [ ] Add to diary saves word
- [ ] Dashboard displays saved words
- [ ] Filters work correctly
- [ ] Export creates valid JSON
- [ ] Import merges correctly
- [ ] Delete removes words
- [ ] Timestamps are accurate

### Test on Different Websites
- News sites
- Wikipedia
- Blogs
- Documentation pages

## Debugging

### Content Script
- Open website
- Right-click → Inspect
- Console tab shows content script logs

### Popup
- Open popup
- Right-click on popup → Inspect
- Console tab shows popup logs

### Background Worker
- Go to `chrome://extensions/`
- Click "Service worker" under the extension
- Console tab shows background logs

### Storage Inspection
- Open popup
- Right-click → Inspect
- Application tab → Storage → Local Storage

## Future Enhancement Ideas

1. **Translation API Integration**
   - Replace placeholder Chinese translations
   - Support multiple languages

2. **Spaced Repetition**
   - Review system with scheduling
   - Flashcard mode

3. **Statistics**
   - Learning progress charts
   - Word frequency analysis

4. **Audio Pronunciation**
   - Integrate pronunciation API
   - Play button in dialog

5. **Categories/Tags**
   - Custom word lists
   - Topic-based organization

6. **Sync Across Devices**
   - Chrome Sync API
   - Cloud backup

7. **Context Menu**
   - Right-click to look up words
   - Alternative to selection

8. **Keyboard Shortcuts**
   - Quick access to features
   - Navigation shortcuts

## Resources

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Free Dictionary API](https://dictionaryapi.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Troubleshooting Development Issues

### TypeScript Errors
- Check `tsconfig.json` configuration
- Ensure `@types/chrome` is installed
- Run `npm install` to update dependencies

### Build Failures
- Clear `dist` folder: `npm run clean`
- Check for syntax errors in source files
- Verify all imports are correct

### Extension Not Loading
- Check manifest.json syntax (valid JSON)
- Ensure all referenced files exist in dist
- Check Chrome console for error messages

## Contributing

When contributing to this project:
1. Follow existing code style
2. Add comments for complex logic
3. Update documentation for new features
4. Test thoroughly before committing
5. Use meaningful commit messages

---

Happy coding! 🚀
