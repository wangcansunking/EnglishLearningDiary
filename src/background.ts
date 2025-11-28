// Background service worker for Chrome extension
// Handle API calls and other background tasks

chrome.runtime.onInstalled.addListener(() => {
  console.log('English Learning Assistant installed');
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchDefinition') {
    fetchDefinition(request.word).then(sendResponse);
    return true; // Will respond asynchronously
  }
});

async function fetchDefinition(word: string) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!response.ok) {
      return { success: false, error: 'Word not found' };
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

export {};
