import { questions } from './questions.js';
import { gameData } from './data.js';

// State
const state = {
  student: {
    name: '',
    rollNumber: '',
    schoolName: '',
    class: '8'
  },
  currentScreen: 'loading',
  currentQuestionIndex: 0,
  shuffledQuestions: [],
  userAnswers: [],
  bookmarked: [],
  timeLeft: 30 * 60, // 30 minutes in seconds
  timerInterval: null,
  xp: 0,
  coins: 0,
  streak: 0,
  badgesEarned: []
};

// DOM Elements
const app = document.getElementById('app');

// Audio setup (using simple beeps as placeholders for actual files, though in a real app we'd load files)
const createAudio = (freq, type, duration, vol = 0.1) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
    }, duration);
  } catch (e) {
    console.log("Audio not supported or interaction needed");
  }
};

const sounds = {
  click: () => createAudio(400, 'sine', 100),
  correct: () => { createAudio(600, 'sine', 100); setTimeout(() => createAudio(800, 'sine', 150), 100); },
  wrong: () => { createAudio(300, 'sawtooth', 200); },
  levelUp: () => { createAudio(500, 'square', 100); setTimeout(() => createAudio(600, 'square', 100), 100); setTimeout(() => createAudio(800, 'square', 300), 200); }
};

// Initialize App
function init() {
  createBackgroundParticles();
  renderLoadingScreen();
  
  setTimeout(() => {
    switchScreen('welcome');
  }, 2000);
}

function createBackgroundParticles() {
  const bg = document.createElement('div');
  bg.id = 'particles-bg';
  app.parentNode.insertBefore(bg, app);
  
  for(let i=0; i<30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 5 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
    particle.style.animationDelay = `${Math.random() * 5}s`;
    bg.appendChild(particle);
  }
}

// Screen Rendering
function switchScreen(screenName) {
  state.currentScreen = screenName;
  app.innerHTML = '';
  
  const screenDiv = document.createElement('div');
  screenDiv.className = 'screen active';
  screenDiv.id = `${screenName}-screen`;
  
  app.appendChild(screenDiv);
  
  switch(screenName) {
    case 'loading':
      renderLoadingScreen(screenDiv);
      break;
    case 'welcome':
      renderWelcomeScreen(screenDiv);
      break;
    case 'instructions':
      renderInstructionsScreen(screenDiv);
      break;
    case 'quiz':
      renderQuizScreen(screenDiv);
      break;
    case 'result':
      renderResultScreen(screenDiv);
      break;
  }
}

function renderLoadingScreen(container) {
  if(!container) return;
  container.innerHTML = `
    <div class="loader"></div>
    <h2 class="text-gradient">Initializing AI Systems...</h2>
    <p style="margin-top: 10px; color: var(--text-muted)">Loading Missions...</p>
  `;
}

function renderWelcomeScreen(container) {
  container.innerHTML = `
    <div class="glass welcome-box">
      <h1 class="text-gradient" style="text-align: center; margin-bottom: 30px; font-size: 32px;">AI & Robotics<br>Class 8</h1>
      
      <form id="welcome-form">
        <div class="form-group">
          <label>Student Name</label>
          <input type="text" id="student-name" class="form-control" required autocomplete="off">
        </div>
        <div class="form-group">
          <label>Roll Number</label>
          <input type="text" id="roll-number" class="form-control" required autocomplete="off">
        </div>
        <div class="form-group">
          <label>School Name</label>
          <input type="text" id="school-name" class="form-control" required autocomplete="off">
        </div>
        
        <button type="submit" class="btn" style="width: 100%; margin-top: 20px;">Initialize Profile</button>
      </form>
    </div>
  `;
  
  document.getElementById('welcome-form').addEventListener('submit', (e) => {
    e.preventDefault();
    sounds.click();
    state.student.name = document.getElementById('student-name').value;
    state.student.rollNumber = document.getElementById('roll-number').value;
    state.student.schoolName = document.getElementById('school-name').value;
    switchScreen('instructions');
  });
}

function renderInstructionsScreen(container) {
  container.innerHTML = `
    <div class="glass" style="padding: 40px;">
      <h2 class="text-gradient" style="text-align: center; margin-bottom: 30px;">Mission Briefing</h2>
      
      <p style="font-size: 18px; margin-bottom: 20px;">Welcome, Agent <strong>${state.student.name}</strong>. Your mission encompasses 3 chapters of AI & Robotics.</p>
      
      <ul class="rules-list">
        <li><strong>Time Limit:</strong> 30 Minutes</li>
        <li><strong>Total Missions:</strong> 60 Questions</li>
        <li><strong>Rules of Engagement:</strong> No Negative Marking</li>
        <li><strong>Rewards:</strong> Earn XP and Coins for correct answers. Earn Badges for chapter mastery.</li>
        <li><strong>Streaks:</strong> Answer 3 in a row correctly for Bonus XP.</li>
      </ul>
      
      <div style="display: flex; gap: 20px; justify-content: center; margin-top: 40px;">
        <button id="btn-back" class="btn btn-secondary">Back</button>
        <button id="btn-start" class="btn">Accept Mission</button>
      </div>
    </div>
  `;
  
  document.getElementById('btn-back').addEventListener('click', () => {
    sounds.click();
    switchScreen('welcome');
  });
  
  document.getElementById('btn-start').addEventListener('click', () => {
    sounds.click();
    startQuiz();
  });
}

function startQuiz() {
  // Shuffle questions
  state.shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
  state.userAnswers = new Array(state.shuffledQuestions.length).fill(null);
  state.bookmarked = new Array(state.shuffledQuestions.length).fill(false);
  state.currentQuestionIndex = 0;
  state.xp = 0;
  state.coins = 0;
  state.streak = 0;
  state.timeLeft = 30 * 60;
  
  // Start Timer
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(updateTimer, 1000);
  
  switchScreen('quiz');
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimer() {
  state.timeLeft--;
  const timerEl = document.getElementById('quiz-timer');
  if (timerEl) {
    timerEl.textContent = formatTime(state.timeLeft);
    if (state.timeLeft <= 300) { // 5 minutes warning
      timerEl.classList.add('warning');
    }
  }
  
  if (state.timeLeft <= 0) {
    clearInterval(state.timerInterval);
    submitQuiz();
  }
}

function renderQuizScreen(container) {
  const q = state.shuffledQuestions[state.currentQuestionIndex];
  
  container.innerHTML = `
    <div class="glass header-bar">
      <div class="stats-container">
        <div class="stat-box">⭐ <span>XP: ${state.xp}</span></div>
        <div class="stat-box">🪙 <span>Coins: ${state.coins}</span></div>
      </div>
      <div id="quiz-timer" class="timer ${state.timeLeft <= 300 ? 'warning' : ''}">${formatTime(state.timeLeft)}</div>
    </div>
    
    <div class="progress-bar-container">
      <div class="progress-bar" style="width: ${((state.currentQuestionIndex) / state.shuffledQuestions.length) * 100}%"></div>
    </div>
    
    <div class="glass question-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <span style="color: var(--neon-cyan); font-family: var(--font-display);">Question ${state.currentQuestionIndex + 1} of ${state.shuffledQuestions.length}</span>
        <button id="btn-bookmark" class="btn btn-secondary" style="padding: 8px 15px; font-size: 14px;">
          ${state.bookmarked[state.currentQuestionIndex] ? '★ Bookmarked' : '☆ Bookmark'}
        </button>
      </div>
      
      <p style="color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">Mission: ${q.chapter}</p>
      
      <div class="question-text">${q.question}</div>
      
      <div class="options-grid" id="options-grid">
        ${q.options.map((opt, i) => `
          <div class="option-card ${state.userAnswers[state.currentQuestionIndex] === i ? 'selected' : ''}" data-index="${i}">
            <div class="option-marker">${String.fromCharCode(65 + i)}</div>
            <span>${opt}</span>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="quiz-controls">
      <button id="btn-prev" class="btn btn-secondary" ${state.currentQuestionIndex === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>Previous</button>
      <button id="btn-next" class="btn">${state.currentQuestionIndex === state.shuffledQuestions.length - 1 ? 'Review' : 'Next Mission'}</button>
    </div>
    
    <div class="glass palette-container">
      <h3 style="font-size: 14px; color: var(--text-muted); text-align: center;">Mission Map</h3>
      <div class="palette-grid" id="palette-grid">
        ${state.shuffledQuestions.map((_, i) => `
          <button class="palette-btn 
            ${state.userAnswers[i] !== null ? 'answered' : ''} 
            ${state.bookmarked[i] ? 'bookmarked' : ''}
            ${i === state.currentQuestionIndex ? 'current' : ''}" 
            data-index="${i}" 
            style="${i === state.currentQuestionIndex ? 'border-color: var(--neon-blue); box-shadow: 0 0 10px rgba(0, 240, 255, 0.5); transform: scale(1.1);' : ''}">
            ${i + 1}
          </button>
        `).join('')}
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <button id="btn-submit" class="btn" style="background: linear-gradient(45deg, var(--danger), #ff8a00);">Submit All Missions</button>
      </div>
    </div>
  `;
  
  // Attach Event Listeners
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', (e) => {
      sounds.click();
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      state.userAnswers[state.currentQuestionIndex] = idx;
      renderQuizScreen(container);
    });
  });
  
  document.getElementById('btn-prev').addEventListener('click', () => {
    if(state.currentQuestionIndex > 0) {
      sounds.click();
      state.currentQuestionIndex--;
      renderQuizScreen(container);
    }
  });
  
  document.getElementById('btn-next').addEventListener('click', () => {
    sounds.click();
    if(state.currentQuestionIndex < state.shuffledQuestions.length - 1) {
      state.currentQuestionIndex++;
      renderQuizScreen(container);
    } else {
      // Scroll to submit
      document.getElementById('btn-submit').scrollIntoView({ behavior: 'smooth' });
    }
  });
  
  document.getElementById('btn-bookmark').addEventListener('click', () => {
    sounds.click();
    state.bookmarked[state.currentQuestionIndex] = !state.bookmarked[state.currentQuestionIndex];
    renderQuizScreen(container);
  });
  
  document.querySelectorAll('.palette-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      sounds.click();
      state.currentQuestionIndex = parseInt(e.currentTarget.getAttribute('data-index'));
      renderQuizScreen(container);
    });
  });
  
  document.getElementById('btn-submit').addEventListener('click', () => {
    sounds.click();
    const unanswered = state.userAnswers.filter(a => a === null).length;
    if(unanswered > 0) {
      if(confirm(`You have ${unanswered} unanswered missions. Are you sure you want to submit?`)) {
        submitQuiz();
      }
    } else {
      submitQuiz();
    }
  });
}

function submitQuiz() {
  clearInterval(state.timerInterval);
  
  // Calculate Score
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  
  const chapterStats = {
    "Customising Google Sites": { correct: 0, total: 0 },
    "AI Project Cycle": { correct: 0, total: 0 },
    "AI Ethics": { correct: 0, total: 0 }
  };
  
  state.shuffledQuestions.forEach((q, i) => {
    const userAns = state.userAnswers[i];
    chapterStats[q.chapter].total++;
    
    if (userAns === null) {
      skipped++;
      state.streak = 0;
    } else if (userAns === q.correct) {
      correct++;
      chapterStats[q.chapter].correct++;
      state.xp += 10;
      state.coins += 5;
      state.streak++;
      if(state.streak >= 3) state.xp += 20; // Bonus
    } else {
      wrong++;
      state.streak = 0;
    }
  });
  
  // Chapter Bonuses and Badges
  state.badgesEarned = [];
  Object.keys(chapterStats).forEach(ch => {
    if(chapterStats[ch].correct === chapterStats[ch].total) {
      state.xp += 50; // Perfect chapter
    }
    
    // Check chapter specific badges
    const badgeDef = gameData.badges.find(b => b.chapter === ch);
    if(badgeDef && chapterStats[ch].correct >= badgeDef.threshold) {
      state.badgesEarned.push(badgeDef);
    }
  });
  
  const accuracy = ((correct / state.shuffledQuestions.length) * 100).toFixed(1);
  if (accuracy >= 80) state.badgesEarned.push(gameData.badges.find(b => b.id === 'quiz_wizard'));
  if (accuracy == 100) {
    state.badgesEarned.push(gameData.badges.find(b => b.id === 'perfect_score'));
    state.xp += 100;
  }
  
  const timeTaken = (30 * 60) - state.timeLeft;
  if(timeTaken < 15 * 60) state.badgesEarned.push(gameData.badges.find(b => b.id === 'fast_learner'));

  // Save to leaderboard
  const newResult = {
    name: state.student.name,
    score: correct,
    accuracy: parseFloat(accuracy),
    timeTaken: timeTaken,
    date: new Date().toISOString()
  };
  let leaderboard = JSON.parse(localStorage.getItem('ai_quiz_leaderboard') || '[]');
  leaderboard.push(newResult);
  leaderboard.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem('ai_quiz_leaderboard', JSON.stringify(leaderboard));

  state.finalStats = {
    correct, wrong, skipped, accuracy, timeTaken, chapterStats
  };
  
  sounds.levelUp();
  switchScreen('result');
}

function renderResultScreen(container) {
  const stats = state.finalStats;
  
  let performanceLevel = "Beginner";
  let color = "var(--danger)";
  if (stats.accuracy >= 80) { performanceLevel = "Expert"; color = "var(--success)"; }
  else if (stats.accuracy >= 50) { performanceLevel = "Intermediate"; color = "#ffaa00"; }
  
  container.innerHTML = `
    <div class="glass result-container">
      <h1 class="text-gradient">Mission Accomplished</h1>
      <p style="margin-bottom: 30px; color: var(--text-muted)">Agent ${state.student.name}</p>
      
      <div class="score-circle" style="border-color: ${color}; box-shadow: 0 0 30px ${color}33;">
        <h2 style="color: ${color}">${stats.accuracy}%</h2>
        <span style="font-family: var(--font-display); font-size: 14px;">ACCURACY</span>
      </div>
      
      <h3 style="color: ${color}; margin-bottom: 20px; font-family: var(--font-display);">${performanceLevel} Level Achieved</h3>
      
      <div class="stats-container" style="justify-content: center; margin-bottom: 30px;">
        <div class="stat-box" style="background: rgba(255,255,255,0.05); padding: 10px 20px; border-radius: 10px;">⭐ <span>+${state.xp} XP</span></div>
        <div class="stat-box" style="background: rgba(255,255,255,0.05); padding: 10px 20px; border-radius: 10px;">🪙 <span>+${state.coins} Coins</span></div>
        <div class="stat-box" style="background: rgba(255,255,255,0.05); padding: 10px 20px; border-radius: 10px;">⏱️ <span>${formatTime(stats.timeTaken)}s</span></div>
      </div>
      
      <div class="analysis-grid">
        <div class="analysis-card">
          <div style="font-size: 24px; color: var(--success); font-weight: bold;">${stats.correct}</div>
          <div style="font-size: 14px; color: var(--text-muted); text-transform: uppercase;">Correct</div>
        </div>
        <div class="analysis-card">
          <div style="font-size: 24px; color: var(--danger); font-weight: bold;">${stats.wrong}</div>
          <div style="font-size: 14px; color: var(--text-muted); text-transform: uppercase;">Wrong</div>
        </div>
        <div class="analysis-card">
          <div style="font-size: 24px; color: #ffaa00; font-weight: bold;">${stats.skipped}</div>
          <div style="font-size: 14px; color: var(--text-muted); text-transform: uppercase;">Skipped</div>
        </div>
      </div>
      
      ${state.badgesEarned.length > 0 ? `
        <h3 style="margin-top: 30px; font-family: var(--font-display);">Badges Unlocked</h3>
        <div class="badges-container">
          ${state.badgesEarned.map(b => `
            <div class="badge">
              <div class="badge-icon">${b.icon}</div>
              <div class="badge-name">${b.name}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div style="margin-top: 40px; display: flex; gap: 20px; justify-content: center;">
        <button id="btn-restart" class="btn btn-secondary">Restart Mission</button>
        <button id="btn-certificate" class="btn" style="background: linear-gradient(45deg, var(--success), #00c3ff);">Generate Certificate</button>
      </div>
    </div>
  `;
  
  document.getElementById('btn-restart').addEventListener('click', () => {
    sounds.click();
    switchScreen('welcome');
  });
  
  document.getElementById('btn-certificate').addEventListener('click', async () => {
    sounds.click();
    // Dynamic import to handle certificate generation to separate concerns
    const { generateCertificate } = await import('./certificate.js');
    generateCertificate(state);
  });
}

// Start application
window.addEventListener('DOMContentLoaded', init);
