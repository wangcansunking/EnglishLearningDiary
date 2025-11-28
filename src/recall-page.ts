import { RecallManager } from './recall';
import { RecallSession } from './types';

class RecallPageController {
  private session: RecallSession | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    this.attachEventListeners();
    await this.checkAndLoadSession();
  }

  private attachEventListeners() {
    // Start button
    document.getElementById('startBtn')?.addEventListener('click', () => this.startChallenge());

    // Back buttons
    document.getElementById('backBtn')?.addEventListener('click', () => this.goBack());
    document.getElementById('backToHomeBtn')?.addEventListener('click', () => this.goBack());

    // Next button
    document.getElementById('nextBtn')?.addEventListener('click', () => this.nextQuestion());

    // Results buttons
    document.getElementById('reviewBtn')?.addEventListener('click', () => this.reviewWords());
    document.getElementById('doneBtn')?.addEventListener('click', () => this.goBack());
  }

  private async checkAndLoadSession() {
    try {
      this.session = await RecallManager.getTodaysSession();

      if (!this.session) {
        this.showNoWordsScreen();
      } else if (this.session.completed) {
        this.showResultsScreen();
      } else {
        this.showStartScreen();
      }
    } catch (error) {
      console.error('Error loading session:', error);
      this.showNoWordsScreen();
    }
  }

  private showStartScreen() {
    this.hideAllScreens();
    document.getElementById('startScreen')?.classList.remove('hidden');
  }

  private showNoWordsScreen() {
    this.hideAllScreens();
    document.getElementById('noWordsScreen')?.classList.remove('hidden');
  }

  private showQuizScreen() {
    this.hideAllScreens();
    document.getElementById('quizScreen')?.classList.remove('hidden');
    this.renderCurrentQuestion();
  }

  private showResultsScreen() {
    if (!this.session) return;

    this.hideAllScreens();
    document.getElementById('resultsScreen')?.classList.remove('hidden');

    const score = this.session.score;
    const total = this.session.questions.length;
    const percentage = Math.round((score / total) * 100);

    // Update score display
    const finalScoreEl = document.getElementById('finalScore');
    const finalTotalEl = document.getElementById('finalTotal');
    const scorePercentageEl = document.getElementById('scorePercentage');

    if (finalScoreEl) finalScoreEl.textContent = score.toString();
    if (finalTotalEl) finalTotalEl.textContent = total.toString();
    if (scorePercentageEl) scorePercentageEl.textContent = `${percentage}%`;

    // Update icon and message based on performance
    const resultsIcon = document.getElementById('resultsIcon');
    const resultMessage = document.getElementById('resultMessage');

    let icon = '🎉';
    let message = '';

    if (percentage === 100) {
      icon = '🏆';
      message = 'Perfect score! You have excellent mastery of these words!';
    } else if (percentage >= 80) {
      icon = '🎉';
      message = 'Great job! You\'re doing really well with your vocabulary!';
    } else if (percentage >= 60) {
      icon = '👍';
      message = 'Good effort! Keep practicing to improve your recall.';
    } else {
      icon = '📚';
      message = 'Keep learning! Review these words and try again tomorrow.';
    }

    if (resultsIcon) resultsIcon.textContent = icon;
    if (resultMessage) resultMessage.textContent = message;
  }

  private hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });
  }

  private async startChallenge() {
    if (!this.session) {
      this.session = await RecallManager.getTodaysSession();
    }

    if (!this.session) {
      this.showNoWordsScreen();
      return;
    }

    this.showQuizScreen();
  }

  private renderCurrentQuestion() {
    if (!this.session) return;

    const question = this.session.questions[this.session.currentIndex];
    if (!question) {
      this.showResultsScreen();
      return;
    }

    // Update progress
    const currentNum = this.session.currentIndex + 1;
    const total = this.session.questions.length;
    const progressPercent = (this.session.currentIndex / total) * 100;

    const progressText = document.getElementById('progressText');
    const progressFill = document.getElementById('progressFill');
    const questionNumber = document.getElementById('questionNumber');
    const scoreText = document.getElementById('scoreText');
    const totalQuestions = document.getElementById('totalQuestions');

    if (progressText) progressText.textContent = `${currentNum}/${total}`;
    if (progressFill) (progressFill as HTMLElement).style.width = `${progressPercent}%`;
    if (questionNumber) questionNumber.textContent = currentNum.toString();
    if (scoreText) scoreText.textContent = this.session.score.toString();
    if (totalQuestions) totalQuestions.textContent = total.toString();

    // Update question
    const questionText = document.getElementById('questionText');
    if (questionText) questionText.textContent = question.question;

    // Update word info (show word for certain question types)
    const wordInfo = document.getElementById('wordInfo');
    const wordText = document.getElementById('wordText');
    const phoneticText = document.getElementById('phoneticText');

    if (question.type === 'partOfSpeech' || question.type === 'definition') {
      if (wordInfo) wordInfo.style.display = 'block';
      if (wordText) wordText.textContent = question.word.word;
      if (phoneticText) {
        phoneticText.textContent = question.word.phonetic || '';
      }
    } else {
      if (wordInfo) wordInfo.style.display = 'none';
    }

    // Render options
    this.renderOptions(question.options);

    // Hide feedback
    const feedback = document.getElementById('feedback');
    if (feedback) feedback.classList.add('hidden');
  }

  private renderOptions(options: string[]) {
    const optionsContainer = document.getElementById('optionsContainer');
    if (!optionsContainer) return;

    optionsContainer.innerHTML = '';

    options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'option-btn';
      button.textContent = option;
      button.addEventListener('click', () => this.selectOption(option, button));
      optionsContainer.appendChild(button);
    });
  }

  private async selectOption(answer: string, button: HTMLElement) {
    if (!this.session) return;

    // Disable all option buttons
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
      (btn as HTMLButtonElement).disabled = true;
    });

    // Submit answer
    const currentIndex = this.session.currentIndex;
    const result = await RecallManager.answerQuestion(currentIndex, answer);
    this.session = result.session;

    // Show feedback
    this.showFeedback(result.correct, answer);
  }

  private showFeedback(correct: boolean, userAnswer: string) {
    if (!this.session) return;

    const question = this.session.questions[this.session.currentIndex - 1]; // Already moved to next
    const feedback = document.getElementById('feedback');
    const feedbackIcon = document.getElementById('feedbackIcon');
    const feedbackText = document.getElementById('feedbackText');
    const feedbackDetail = document.getElementById('feedbackDetail');

    if (!feedback || !feedbackIcon || !feedbackText || !feedbackDetail) return;

    // Highlight correct/incorrect options
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
      const buttonText = btn.textContent || '';
      if (buttonText === question.correctAnswer) {
        btn.classList.add('correct');
      } else if (buttonText === userAnswer && !correct) {
        btn.classList.add('incorrect');
      }
    });

    // Show feedback
    feedback.classList.remove('hidden');

    if (correct) {
      feedbackIcon.textContent = '✅';
      feedbackText.textContent = 'Correct!';
      feedbackText.className = 'feedback-text correct';
      feedbackDetail.textContent = 'Great job! You got it right.';
    } else {
      feedbackIcon.textContent = '❌';
      feedbackText.textContent = 'Incorrect';
      feedbackText.className = 'feedback-text incorrect';
      feedbackDetail.innerHTML = `The correct answer is: <strong>${question.correctAnswer}</strong>`;
    }

    // Show word definition for context
    if (question.type === 'partOfSpeech' || question.type === 'example') {
      const firstDef = question.word.meanings[0]?.definitions[0]?.definition;
      if (firstDef) {
        feedbackDetail.innerHTML += `<br><br><em>"${question.word.word}" means: ${firstDef}</em>`;
      }
    }
  }

  private nextQuestion() {
    if (!this.session) return;

    if (this.session.currentIndex >= this.session.questions.length) {
      this.showResultsScreen();
    } else {
      this.renderCurrentQuestion();
    }
  }

  private reviewWords() {
    // Navigate to main popup to review the words
    window.location.href = 'popup.html';
  }

  private goBack() {
    window.location.href = 'popup.html';
  }
}

// Initialize the recall page
new RecallPageController();
