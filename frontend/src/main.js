// Merke das zuletzt fokussierte Eingabefeld für die Bildschirmtastatur
let letzterFokus = null;

function loadStats() {
  const match = document.cookie.match(/(?:^|;\s*)wordleStats=([^;]*)/);
  if (!match) return { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0, guessDistribution: [0,0,0,0,0,0] };
  try { return JSON.parse(decodeURIComponent(match[1])); }
  catch { return { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0, guessDistribution: [0,0,0,0,0,0] }; }
}

function saveStats(stats) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `wordleStats=${encodeURIComponent(JSON.stringify(stats))};expires=${expires.toUTCString()};path=/`;
}

function updateStats(won) {
  const stats = loadStats();
  stats.gamesPlayed++;
  if (won) {
    stats.gamesWon++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
    stats.guessDistribution[guesses.length - 1]++;
  } else {
    stats.currentStreak = 0;
  }
  saveStats(stats);
  return stats;
}

function showStatsPopup(stats, lastGuessCount) {
  const existing = document.getElementById('stats-popup');
  if (existing) existing.remove();

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const maxDist = Math.max(...stats.guessDistribution, 1);

  const overlay = document.createElement('div');
  overlay.id = 'stats-popup';
  overlay.innerHTML = `
    <div class="stats-modal">
      <h2>Statistik</h2>
      <div class="stats-numbers">
        <div class="stat-item"><span class="stat-value">${stats.gamesPlayed}</span><span class="stat-label">Gespielt</span></div>
        <div class="stat-item"><span class="stat-value">${winRate}%</span><span class="stat-label">Gewonnen</span></div>
        <div class="stat-item"><span class="stat-value">${stats.currentStreak}</span><span class="stat-label">Serie</span></div>
        <div class="stat-item"><span class="stat-value">${stats.maxStreak}</span><span class="stat-label">Beste Serie</span></div>
      </div>
      <div class="stats-dist">
        <h3>Ratenverteilung</h3>
        ${stats.guessDistribution.map((count, i) => `
          <div class="dist-row">
            <span class="dist-label">${i + 1}</span>
            <div class="dist-bar-wrap">
              <div class="dist-bar${lastGuessCount === i + 1 ? ' dist-bar-highlight' : ''}" style="width:${Math.max(count / maxDist * 100, count > 0 ? 8 : 0)}%">${count}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <button class="stats-ok" id="stats-ok">OK</button>
    </div>
  `;
  document.body.appendChild(overlay);
  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') close();
  };
  document.getElementById('stats-ok').onclick = close;
  document.addEventListener('keydown', onKey);
}
const app = document.getElementById('app');

let secretWord = '';
let guesses = [];
let currentGuess = '';
let gameOver = false;
let validWords = null;
let animatingRowIndex = -1;

// Lade words.lst synchron beim Start (nur im lokalen Kontext möglich)
fetch('/words.lst')
  .then(r => r.text())
  .then(text => {
    validWords = new Set(text.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(w => w.length === 5));
  });


function showToast(msg, duration = 1500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

function pickRandomWord() {
  if (!validWords) return '';
  const arr = Array.from(validWords);
  return arr[Math.floor(Math.random() * arr.length)];
}

function renderGame() {
  app.innerHTML = `
    <h1>Wortspiel</h1>
    <div id="board"></div>
    <form class="guess-input" autocomplete="off">
      <button type="submit" style="display:none;" ${gameOver ? 'disabled' : ''}>Raten</button>
    </form>
  <div id="keyboard" style="margin-top:-10px;"></div>
    <button id="restart">Neues Spiel</button>
  `;
  renderKeyboard();
  renderBoard();
  document.querySelector('.guess-input').onsubmit = (e) => {
    e.preventDefault();
    if (gameOver) return;
    let guess = '';
    for (let i = 0; i < 5; i++) {
      const val = document.getElementById(`guess${i}`).value.trim().toLowerCase();
      guess += val;
    }
    if (guess.length !== 5 || !/^[a-z]{5}$/i.test(guess)) {
//      document.getElementById('status').textContent = 'Das Wort muss 5 Buchstaben haben.';
      return;
    }
    if (!validWords || !validWords.has(guess)) {
      showToast('Nicht im Wörterbuch.', 1000);
      return;
    }
    guesses.push(guess);
    currentGuess = guess;
    animatingRowIndex = guesses.length - 1;
    checkGuess(guess);
    renderGame();
  };
  document.getElementById('restart').onclick = () => {
    secretWord = pickRandomWord();
    guesses = [];
    currentGuess = '';
    gameOver = false;
    animatingRowIndex = -1;
    renderGame();
  };
}

function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const row = document.createElement('div');
    row.className = 'guess-row';
    // Aktuelle Zeile für Eingabe?
    if (i === guesses.length && secretWord && !gameOver) {
      // Eingabefelder in die aktuelle Zeile
      for (let j = 0; j < 5; j++) {
        const cell = document.createElement('div');
        cell.className = 'letter-cell';
        cell.style.position = 'relative';
        const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 1;
  input.pattern = '[A-Za-z]';
  input.autocomplete = 'off';
  input.style.width = '100%';
  input.style.height = '100%';
  input.style.fontSize = '2rem';
  input.style.textAlign = 'center';
  input.style.textTransform = 'uppercase';
  input.style.fontWeight = 'bold';
  input.style.border = 'none';
  input.style.background = 'transparent';
  input.style.outline = 'none';
  input.style.position = 'absolute';
  input.style.top = '0';
  input.style.left = '0';
  input.style.right = '0';
  input.style.bottom = '0';
  input.style.padding = '0';
  input.style.margin = '0';
  input.style.caretColor = 'transparent';
  input.readOnly = true;
  input.id = `guess${j}`;
  input.disabled = gameOver;
        // Eingabe komplett über keydown, damit kein Cursor blinkt
        input.addEventListener('keydown', (e) => {
          if (e.key.length === 1 && /^[A-Za-z]$/.test(e.key)) {
            // Überschreibe immer das Feld mit dem neuen Buchstaben
            e.preventDefault();
            e.target.value = e.key.toUpperCase();
            if (j < 4) {
              document.getElementById(`guess${j+1}`).focus();
            }
          } else if (e.key === 'Backspace') {
            e.preventDefault();
            if (e.target.value) {
              e.target.value = '';
            } else if (j > 0) {
              document.getElementById(`guess${j-1}`).focus();
            }
          } else if (e.key === 'ArrowLeft' && j > 0) {
            e.preventDefault();
            document.getElementById(`guess${j-1}`).focus();
          } else if (e.key === 'ArrowRight' && j < 4) {
            e.preventDefault();
            document.getElementById(`guess${j+1}`).focus();
          } else if (e.key === 'Enter') {
            e.preventDefault();
            document.querySelector('.guess-input').requestSubmit();
          }
        });
        // Fokus-Hervorhebung
        input.addEventListener('focus', (e) => {
          cell.style.background = '#e0eaff';
          letzterFokus = e.target;
        });
        input.addEventListener('blur', (e) => {
          cell.style.background = '';
        });
        cell.appendChild(input);
        row.appendChild(cell);
      }
      // Autofokus auf erstes Feld
      setTimeout(() => document.getElementById('guess0').focus(), 0);
      // Kein globaler document.onkeydown-Handler mehr, um Doppeleingaben zu verhindern
    } else {
      const guess = guesses[i] || '';
      // Feedback-Logik wie im Backend: grün vor gelb, Buchstaben nur so oft markieren wie im Zielwort vorhanden
      let feedback = Array(5).fill('gray');
      if (guess && secretWord && guess.length === 5 && secretWord.length === 5) {
        const secretArr = secretWord.split('');
        const guessArr = guess.split('');
        const letterCount = {};
        for (const c of secretArr) letterCount[c] = (letterCount[c] || 0) + 1;
        // Grün zuerst
        for (let k = 0; k < 5; k++) {
          if (guessArr[k] === secretArr[k]) {
            feedback[k] = 'green';
            letterCount[guessArr[k]]--;
          }
        }
        // Gelb dann (Wordle-Logik)
        for (let k = 0; k < 5; k++) {
          if (feedback[k] === 'gray') {
            const ch = guessArr[k];
            if (letterCount[ch] > 0) {
              feedback[k] = 'yellow';
              letterCount[ch]--;
            }
          }
        }
      }
      const hasColor = guess && secretWord && guess.length === 5 && secretWord.length === 5;
      for (let j = 0; j < 5; j++) {
        const cell = document.createElement('div');
        cell.className = 'letter-cell';
        cell.textContent = guess[j] ? guess[j].toUpperCase() : '';
        const colorClass = hasColor
          ? (feedback[j] === 'green' ? 'green' : feedback[j] === 'yellow' ? 'yellow' : guess[j] ? 'gray' : '')
          : '';
        if (i === animatingRowIndex) {
          cell.classList.add('flip');
          cell.style.animationDelay = `${j * 300}ms`;
          if (colorClass) {
            setTimeout(() => cell.classList.add(colorClass), j * 300 + 250);
          }
        } else {
          if (colorClass) cell.classList.add(colorClass);
        }
        row.appendChild(cell);
      }
    }
    board.appendChild(row);
  }
}

function renderKeyboard() {
  const keyboard = document.getElementById('keyboard');
  if (!keyboard) return;
  // QWERTZ-Layout (deutsch)
  const rows = [
    ['Q','W','E','R','T','Z','U','I','O','P',],
    ['A','S','D','F','G','H','J','K','L','ENTER'],
    ['Y','X','C','V','B','N','M','←']
  ];
  keyboard.innerHTML = '';
  keyboard.style.transform = 'scale(0.7)';
  keyboard.style.transformOrigin = 'top center';
  // Buchstaben-Status auswerten
  const letterStatus = {};
  guesses.forEach((guess) => {
    if (!secretWord || guess.length !== 5) return;
    const secretArr = secretWord.split('');
    const guessArr = guess.split('');
    const feedback = Array(5).fill('gray');
    const letterCount = {};
    for (const c of secretArr) letterCount[c] = (letterCount[c] || 0) + 1;
    // Grün zuerst
    for (let k = 0; k < 5; k++) {
      if (guessArr[k] === secretArr[k]) {
        feedback[k] = 'green';
        letterCount[guessArr[k]]--;
      }
    }
    // Gelb dann
    for (let k = 0; k < 5; k++) {
      if (feedback[k] === 'gray') {
        const ch = guessArr[k];
        let used = 0;
        for (let m = 0; m < 5; m++) {
          if (guessArr[m] === ch && (feedback[m] === 'green' || (feedback[m] === 'yellow' && m < k))) {
            used++;
          }
        }
        if (letterCount[ch] - used >= 1 && secretArr.includes(ch)) {
          feedback[k] = 'yellow';
        }
      }
    }
    // Status für jeden Buchstaben setzen (grün > gelb > grau)
    for (let k = 0; k < 5; k++) {
      const ch = guessArr[k].toUpperCase();
      if (feedback[k] === 'green') {
        letterStatus[ch] = 'green';
      } else if (feedback[k] === 'yellow' && letterStatus[ch] !== 'green') {
        letterStatus[ch] = 'yellow';
      } else if (feedback[k] === 'gray' && !letterStatus[ch]) {
        letterStatus[ch] = 'gray';
      }
    }
  });

  rows.forEach((row) => {
    const rowDiv = document.createElement('div');
    rowDiv.style.display = 'flex';
    rowDiv.style.justifyContent = 'center';
    rowDiv.style.margin = '4px 0';
    row.forEach((key) => {
      const btn = document.createElement('button');
      btn.textContent = key;
      btn.type = 'button';
      btn.style.margin = '2px';
      btn.style.width = key === 'ENTER' ? '72px' : '48px';
      btn.style.height = '48px';
      btn.style.fontSize = '1.2rem';
      btn.style.fontWeight = 'bold';
      btn.style.borderRadius = '6px';
      btn.style.border = '2px solid #ccc';
      btn.style.background = '#f6f7fb';
      btn.style.cursor = 'pointer';
  //    btn.style.textTransform = 'uppercase';
      // Farbe setzen
      if (letterStatus[key]) {
        if (letterStatus[key] === 'green') {
          btn.style.background = '#6aaa64';
          btn.style.color = 'white';
          btn.style.border = '2px solid #6aaa64';
        } else if (letterStatus[key] === 'yellow') {
          btn.style.background = '#c9b458';
          btn.style.color = 'white';
          btn.style.border = '2px solid #c9b458';
        } else if (letterStatus[key] === 'gray') {
          btn.style.background = '#787c7e';
          btn.style.color = 'white';
          btn.style.border = '2px solid #787c7e';
        }
      }
      btn.onclick = () => {
        if (key === '←') {
          for (let k = 4; k >= 0; k--) {
            const inp = document.getElementById(`guess${k}`);
            if (inp && inp.value) {
              inp.value = '';
              inp.focus();
              break;
            }
          }
        } else if (key === 'ENTER') {
          document.querySelector('.guess-input').requestSubmit();
        } else {
          // Schreibe ins aktuell fokussierte Feld, falls vorhanden und editierbar
          // Schreibe ins zuletzt fokussierte Feld, falls vorhanden und editierbar
          const target = letzterFokus;
          if (target && target.id && target.id.startsWith('guess') && !target.disabled) {
            target.value = key;
            if (target.value.length > 1) target.value = key;
            const idx = parseInt(target.id.replace('guess',''), 10);
            if (idx < 4) {
              document.getElementById(`guess${idx+1}`).focus();
            } else {
              target.focus();
            }
          } else {
            // Fallback: schreibe ins nächste leere Feld
            for (let k = 0; k < 5; k++) {
              const inp = document.getElementById(`guess${k}`);
              if (inp && !inp.value) {
                inp.value = key;
                if (k < 4) document.getElementById(`guess${k+1}`).focus();
                break;
              }
            }
          }
        }
      };
      rowDiv.appendChild(btn);
    });
    keyboard.appendChild(rowDiv);
  });
// ...existing code...
}

function checkGuess(guess) {
  const delay = 5 * 300 + 500;
  if (guess === secretWord) {
    gameOver = true;
    setTimeout(() => showToast('Richtig! Du hast das Wort erraten!', 4000), delay);
    setTimeout(() => showStatsPopup(updateStats(true), guesses.length), delay + 1000);
  } else if (guesses.length >= 6) {
    gameOver = true;
    setTimeout(() => showToast(`Leider verloren! Das Wort war: ${secretWord.toUpperCase()}`, 5000), delay);
    setTimeout(() => showStatsPopup(updateStats(false), null), delay + 1000);
  }
}

// Starte das Spiel automatisch mit Zufallswort, sobald Wörter geladen sind
function startGameWhenReady() {
  if (validWords && validWords.size > 0) {
    secretWord = pickRandomWord();
    guesses = [];
    currentGuess = '';
    gameOver = false;
    renderGame();
  } else {
    setTimeout(startGameWhenReady, 50);
  }
}
startGameWhenReady();
