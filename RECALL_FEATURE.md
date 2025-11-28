# Today's Words - Recall Feature Guide

## Overview

The "Today's Words" feature helps you actively recall and reinforce vocabulary through daily practice challenges.

## How It Works

### Smart Word Selection

The extension uses an intelligent algorithm to select 10 words for your daily challenge based on:

1. **Priority Factors**:
   - Words you've never reviewed (highest priority)
   - Words not reviewed recently
   - Words with lower accuracy rates
   - Older words that need reinforcement

2. **Scoring System**:
   - Never recalled words: +1000 points
   - Days since last recall: +10 points per day
   - Low accuracy: +50 points (lower accuracy = higher priority)
   - Word age: Up to +30 points for older words

### Question Types

The quiz includes three types of questions:

#### 1. Definition Questions
- **Format**: "What is the meaning of [word]?"
- **Shows**: The word and its pronunciation
- **Tests**: Your understanding of the word's definition

#### 2. Part of Speech Questions
- **Format**: "What part of speech is [word]?"
- **Shows**: The word and its pronunciation
- **Options**: noun, verb, adjective, adverb, pronoun, preposition, conjunction
- **Tests**: Your grammatical understanding

#### 3. Fill-in-the-Blank Questions
- **Format**: "Fill in the blank: [sentence with blank]"
- **Shows**: Example sentence with the word replaced by _____
- **Tests**: Contextual understanding and usage

### Daily Challenge Flow

1. **Start Screen**
   - Overview of the challenge
   - Click "Start Challenge" to begin

2. **Quiz Questions** (10 questions)
   - Multiple choice format
   - Immediate feedback after each answer
   - Progress bar showing completion
   - Current score display

3. **Feedback After Each Question**
   - ✅ Correct: Positive feedback
   - ❌ Incorrect: Shows correct answer and additional context
   - Brief definition reminder for context

4. **Results Screen**
   - Final score (X/10)
   - Percentage score
   - Performance-based message:
     - 100%: "Perfect score! Excellent mastery!"
     - 80-99%: "Great job! Really well done!"
     - 60-79%: "Good effort! Keep practicing!"
     - <60%: "Keep learning! Review and try tomorrow!"
   - Options to review words or return to dashboard

## Statistics Tracking

For each word, the system tracks:

- **lastRecallDate**: Timestamp of last review
- **recallCount**: Total number of times reviewed
- **correctCount**: Number of correct answers

This data influences future word selection, implementing a basic spaced repetition system.

## Usage Tips

### Best Practices

1. **Daily Routine**: Complete the challenge every day
2. **Consistency**: Regular practice is more effective than cramming
3. **Review Mistakes**: Check wrong answers carefully
4. **Add More Words**: Keep adding new words to keep challenges fresh

### Optimal Learning Strategy

1. **Morning Practice**: Start your day with the recall challenge
2. **Focus**: Give full attention to each question
3. **Learn from Errors**: Review definitions of words you miss
4. **Build Streak**: Try to maintain daily practice

### When to Use

- **Daily**: Once per day for optimal retention
- **After Adding Words**: Wait a day or two before words appear in challenges
- **Regular Reviews**: Words will reappear based on your performance

## Technical Details

### Session Management

- **One session per day**: Based on YYYY-MM-DD date
- **Persistent**: Can pause and resume the same session
- **Resets daily**: New word selection each day

### Algorithm Details

The word selection algorithm prioritizes:

```
Score Calculation:
- Base: 0
- Never recalled: +1000
- Days since recall: +10 per day (or +100 if never recalled)
- Lower accuracy: +(1 - accuracy) * 50
- Word age: +min(days since added, 30)

Top 10 highest-scoring words are selected and shuffled.
```

### Storage

Session data stored in Chrome local storage:
```json
{
  "recallSession": {
    "date": "2025-11-28",
    "questions": [...],
    "currentIndex": 0,
    "score": 0,
    "completed": false
  }
}
```

## Accessing the Feature

1. Open the extension popup
2. Click **"📝 Today's Words"** button in the header
3. Follow the on-screen instructions

## Benefits

### Learning Benefits

- **Active Recall**: More effective than passive review
- **Spaced Repetition**: Words appear at optimal intervals
- **Immediate Feedback**: Learn from mistakes right away
- **Progress Tracking**: See improvement over time

### Motivation

- **Daily Goals**: Clear objective each day
- **Gamification**: Score and accuracy metrics
- **Achievement**: Track your growing vocabulary

## Troubleshooting

### "No Words Yet" Message

**Cause**: Need at least 1 word in your diary

**Solution**: Add words by selecting them on webpages

### Same Words Every Day

**Cause**: Limited word pool or not completing challenges

**Solution**:
- Add more words to your diary
- Complete daily challenges to update statistics
- Wait for time to pass (older words get priority)

### Questions Too Easy/Hard

The algorithm adapts to your performance. If questions are:
- **Too Easy**: You'll see harder words or different question types
- **Too Hard**: Words will reappear until mastered

## Future Enhancements

Potential improvements:
- Configurable daily word count (5, 10, 15, 20)
- Difficulty levels
- Streak tracking
- Weekly/monthly performance reports
- Study mode with flashcards
- Audio pronunciation in questions

---

**Pro Tip**: Combine "Today's Words" with regular browsing and word collection for the best learning results!
