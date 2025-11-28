# Installation & Usage Guide

## Installation Steps

### 1. Build the Extension

The extension has been built successfully. The `dist` folder contains all the necessary files.

### 2. Load Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** by toggling the switch in the top-right corner
4. Click **Load unpacked**
5. Navigate to and select: `C:\Users\canwa\WebstormProjects\EnglishLearning\dist`
6. The extension should now appear in your extensions list

### 3. Pin the Extension (Optional)

1. Click the puzzle icon in Chrome's toolbar (extensions menu)
2. Find "English Learning Assistant"
3. Click the pin icon to keep it visible in your toolbar

## How to Use

### Learning New Words

1. **Browse any webpage**
   - Visit any website (news, blogs, articles, etc.)

2. **Select a word**
   - Highlight any single word with your mouse
   - A green "Explain" button will appear near the selected text

3. **View the definition**
   - Click the "Explain" button
   - A dialog will appear showing:
     - The word and its pronunciation
     - Part of speech (noun, verb, adjective, etc.)
     - Definitions with Chinese translations
     - Example sentences

4. **Save to your diary**
   - Click the "Add to Learning Diary" button
   - The word will be saved with a timestamp
   - You'll see a success message

### Viewing Your Learning Diary

1. **Open the dashboard**
   - Click the extension icon in your Chrome toolbar
   - A popup window will open showing your word collection

2. **Filter by time period**
   - Click any filter button:
     - **All** - Show all words
     - **Today** - Words added in the last 24 hours
     - **This Week** - Words from the past 7 days
     - **This Month** - Words from the past 30 days
     - **This Year** - Words from the past 365 days

3. **Review word cards**
   - Each card shows:
     - The word and pronunciation
     - When it was added
     - All definitions and examples
     - Chinese translations

4. **Delete words**
   - Click the trash icon (🗑️) on any word card
   - Confirm the deletion
   - The word will be removed from your diary

### Export Your Diary

**To backup your vocabulary:**

1. Open the extension popup
2. Click **Export JSON**
3. A JSON file will be downloaded to your Downloads folder
4. The filename includes a timestamp: `english-learning-diary-[timestamp].json`

**Use cases:**
- Backup your progress
- Transfer to another device
- Share with friends
- Keep a record of your learning journey

### Import a Diary

**To restore or merge vocabulary:**

1. Open the extension popup
2. Click **Import JSON**
3. Select a previously exported JSON file
4. The system will:
   - Add new words that don't exist in your current diary
   - Update existing words if the imported version is newer
   - Keep all existing words that aren't in the import file

**Import features:**
- Smart merging (no duplicates)
- Preserves the most recent version of each word
- Success message shows how many words were imported

## Tips for Best Results

### Word Selection
- Select **single words only** (the explain button won't appear for phrases)
- Works on any text content on any webpage
- Internet connection required to fetch definitions

### Building Your Vocabulary
- Add words as you encounter them while reading
- Review your diary regularly using time filters
- Export your diary weekly as a backup

### Dashboard Usage
- The popup remembers your last filter selection
- Word cards are sorted by date (newest first)
- Total word count is shown in the header

## Troubleshooting

### "Could not find definition" Error
- The word might be misspelled
- Very rare or specialized terms might not be in the dictionary
- Try selecting just the base form of the word

### Extension Not Working
1. Refresh the webpage after installing the extension
2. Check that the extension is enabled in `chrome://extensions/`
3. Make sure you have an internet connection

### Explain Button Not Appearing
- Make sure you selected only one word
- Try clicking elsewhere and selecting again
- Check that the extension has permission for the current site

### Dashboard Not Opening
- Click the extension icon directly
- If still not working, try reloading the extension:
  1. Go to `chrome://extensions/`
  2. Click the refresh icon on the extension card

## Data Privacy

- All words are stored **locally** in your browser
- No data is sent to any server (except the dictionary API for definitions)
- Your learning diary is completely private
- Export functionality lets you control your data

## Technical Notes

- **Storage**: Uses Chrome's local storage API
- **API**: Free Dictionary API (https://dictionaryapi.dev)
- **Permissions**:
  - `storage` - To save words locally
  - `activeTab` - To detect word selection on webpages
  - API access for fetching definitions

## Next Steps

1. Start browsing English websites
2. Select interesting words you want to learn
3. Build your vocabulary diary
4. Review words regularly using time filters
5. Export your progress periodically

Happy learning! 📚
