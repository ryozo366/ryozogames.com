(function() {
'use strict';

const SERVER_URL = 'https://ryozogames-server.onrender.com';

let socket = null;
let roomCode = null;
let isHost = false;
let username = 'Guest';
let currentGame = null;
let currentGameId = null;

// ===== SCREENS =====
const screens = {
  lobby: document.getElementById('lobbyScreen'),
  room: document.getElementById('roomScreen'),
  game: document.getElementById('gameScreen'),
  postgame: document.getElementById('postGameScreen')
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.style.display = 'none');
  screens[name].style.display = '';
  document.getElementById('countdownOverlay').style.display = 'none';
}

function showToast(msg, duration) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration || 3000);
}

// ===== USERNAME =====
function getUsername() {
  if (window.RyozoAuth && window.RyozoAuth.getUser()) {
    return window.RyozoAuth.getUser();
  }
  return 'Guest_' + Math.floor(Math.random() * 9999);
}

// ===== CONNECT =====
function connect() {
  username = getUsername();

  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  statusDot.className = 'status-dot connecting';
  statusText.textContent = 'Connecting to server...';

  socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 2000,
    timeout: 30000
  });

  socket.on('connect', () => {
    statusDot.className = 'status-dot connected';
    statusText.textContent = 'Connected';
    document.getElementById('createRoomBtn').disabled = false;
    document.getElementById('joinRoomBtn').disabled = false;
  });

  socket.on('disconnect', () => {
    statusDot.className = 'status-dot connecting';
    statusText.textContent = 'Reconnecting...';
  });

  socket.on('connect_error', () => {
    statusDot.className = 'status-dot connecting';
    statusText.textContent = 'Server starting up... (can take ~30s)';
  });

  socket.on('room_update', handleRoomUpdate);
  socket.on('countdown', handleCountdown);
  socket.on('game_state', handleGameState);
  socket.on('game_over', handleGameOver);
  socket.on('player_left', handlePlayerLeft);

  // Ping measurement
  setInterval(() => {
    if (!socket || !socket.connected) return;
    const start = Date.now();
    socket.emit('ping_check', () => {
      const ping = Date.now() - start;
      document.getElementById('pingDisplay').textContent = ping + 'ms';
    });
  }, 3000);
}

// ===== ROOM HANDLERS =====
function handleRoomUpdate(data) {
  roomCode = data.code;

  if (data.state === 'lobby' || data.state === 'countdown') {
    if (screens.game.style.display !== 'none' || screens.postgame.style.display !== 'none') {
      showScreen('room');
    }
    if (screens.lobby.style.display !== 'none') {
      showScreen('room');
    }

    // Update room display
    document.getElementById('roomCodeDisplay').textContent = data.code;
    document.getElementById('p1Name').textContent = data.host ? data.host.username : '---';

    const p2Slot = document.getElementById('p2Slot');
    const p2Name = document.getElementById('p2Name');
    if (data.guest) {
      p2Name.textContent = data.guest.username;
      p2Slot.classList.remove('waiting');
    } else {
      p2Name.textContent = 'Waiting...';
      p2Slot.classList.add('waiting');
    }

    // Show game select for host when guest joined
    const waitingArea = document.getElementById('waitingArea');
    const gameSelectArea = document.getElementById('gameSelectArea');
    const guestWaitArea = document.getElementById('guestWaitArea');

    if (data.guest && isHost) {
      waitingArea.style.display = 'none';
      gameSelectArea.style.display = '';
      guestWaitArea.style.display = 'none';
    } else if (data.guest && !isHost) {
      waitingArea.style.display = 'none';
      gameSelectArea.style.display = 'none';
      guestWaitArea.style.display = '';
    } else {
      waitingArea.style.display = '';
      gameSelectArea.style.display = 'none';
      guestWaitArea.style.display = 'none';
    }
  }

  if (data.state === 'playing') {
    showScreen('game');
    // Set HUD names
    const selfName = isHost ? (data.host ? data.host.username : 'You') : (data.guest ? data.guest.username : 'You');
    const oppName = isHost ? (data.guest ? data.guest.username : 'Opponent') : (data.host ? data.host.username : 'Opponent');
    document.getElementById('hudP1Name').textContent = selfName;
    document.getElementById('hudP2Name').textContent = oppName;
  }
}

function handleCountdown(data) {
  const overlay = document.getElementById('countdownOverlay');
  const num = document.getElementById('countdownNum');
  overlay.style.display = '';
  num.textContent = data.count;
  // Retrigger animation
  num.style.animation = 'none';
  num.offsetHeight; // force reflow
  num.style.animation = '';

  if (data.count <= 0) {
    overlay.style.display = 'none';
  }
}

function handleGameState(state) {
  if (currentGame && currentGame.updateState) {
    currentGame.updateState(state);
  }

  // Update HUD scores
  if (state.scores) {
    if (state.scores.self !== undefined) {
      document.getElementById('hudP1Score').textContent = state.scores.self;
      document.getElementById('hudP2Score').textContent = state.scores.opponent;
    } else if (state.scores.left !== undefined) {
      // Pong uses left/right
      if (isHost) {
        document.getElementById('hudP1Score').textContent = state.scores.left;
        document.getElementById('hudP2Score').textContent = state.scores.right;
      } else {
        document.getElementById('hudP1Score').textContent = state.scores.right;
        document.getElementById('hudP2Score').textContent = state.scores.left;
      }
    }
  }
}

function handleGameOver(data) {
  if (currentGame && currentGame.destroy) currentGame.destroy();
  currentGame = null;

  showScreen('postgame');

  const isWinner = data.winner === username;
  document.getElementById('winnerText').textContent = isWinner ? 'You Win!' : data.winner + ' Wins!';
  document.getElementById('winnerSub').textContent = isWinner ? 'Well played!' : 'Better luck next time!';

  if (data.scores.self !== undefined) {
    document.getElementById('finalP1Score').textContent = data.scores.self;
    document.getElementById('finalP2Score').textContent = data.scores.opponent;
  } else if (data.scores.host !== undefined) {
    if (isHost) {
      document.getElementById('finalP1Score').textContent = data.scores.host;
      document.getElementById('finalP2Score').textContent = data.scores.guest;
    } else {
      document.getElementById('finalP1Score').textContent = data.scores.guest;
      document.getElementById('finalP2Score').textContent = data.scores.host;
    }
  } else if (data.scores.left !== undefined) {
    if (isHost) {
      document.getElementById('finalP1Score').textContent = data.scores.left;
      document.getElementById('finalP2Score').textContent = data.scores.right;
    } else {
      document.getElementById('finalP1Score').textContent = data.scores.right;
      document.getElementById('finalP2Score').textContent = data.scores.left;
    }
  }

  // Only host can play again
  document.getElementById('playAgainBtn').style.display = isHost ? '' : 'none';
  document.getElementById('newGameBtn').style.display = isHost ? '' : 'none';
}

function handlePlayerLeft(data) {
  showToast(data.message || 'Opponent left the room.');
  if (currentGame && currentGame.destroy) currentGame.destroy();
  currentGame = null;
  showScreen('room');
}

// ===== GAME LOADING =====
const loadedGames = {};

function loadGame(gameId) {
  return new Promise((resolve, reject) => {
    if (loadedGames[gameId]) return resolve(loadedGames[gameId]);
    const script = document.createElement('script');
    script.src = 'games/' + gameId + '.js';
    script.onload = () => {
      if (window.ArenaGames && window.ArenaGames[gameId]) {
        loadedGames[gameId] = window.ArenaGames[gameId];
        resolve(loadedGames[gameId]);
      } else {
        reject(new Error('Game module not found: ' + gameId));
      }
    };
    script.onerror = () => reject(new Error('Failed to load: ' + gameId));
    document.head.appendChild(script);
  });
}

function startGameClient(gameId) {
  currentGameId = gameId;
  showScreen('game');

  loadGame(gameId).then((gameMod) => {
    currentGame = Object.create(gameMod);
    currentGame.init();
  }).catch((err) => {
    showToast('Failed to load game: ' + err.message);
  });
}

// Watch for game_starting (from countdown → game)
// The game screen shows when room_update state=playing, game starts after countdown
socket && socket.on('room_update', (data) => {
  if (data.state === 'playing' && data.game && !currentGame) {
    startGameClient(data.game);
  }
});

// ===== BUTTON HANDLERS =====
document.getElementById('createRoomBtn').addEventListener('click', () => {
  if (!socket || !socket.connected) return showToast('Not connected to server yet.');
  socket.emit('create_room', { username }, (response) => {
    if (response.error) return showToast(response.error);
    roomCode = response.code;
    isHost = true;
    showScreen('room');
  });
});

document.getElementById('joinRoomBtn').addEventListener('click', () => {
  if (!socket || !socket.connected) return showToast('Not connected to server yet.');
  const code = document.getElementById('roomCodeInput').value.toUpperCase().trim();
  if (code.length !== 4) return showToast('Enter a 4-letter room code.');
  socket.emit('join_room', { code, username }, (response) => {
    if (response.error) return showToast(response.error);
    roomCode = code;
    isHost = false;
    showScreen('room');
  });
});

// Enter key on code input
document.getElementById('roomCodeInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('joinRoomBtn').click();
});

document.getElementById('copyCodeBtn').addEventListener('click', () => {
  const code = document.getElementById('roomCodeDisplay').textContent;
  navigator.clipboard.writeText(code).then(() => {
    document.getElementById('copyCodeBtn').textContent = 'Copied!';
    setTimeout(() => {
      document.getElementById('copyCodeBtn').textContent = 'Copy Code';
    }, 2000);
  });
});

// Game selection buttons
document.querySelectorAll('.game-option').forEach(btn => {
  btn.addEventListener('click', () => {
    const gameId = btn.dataset.game;
    socket.emit('select_game', { gameId });
  });
});

// Leave room
document.getElementById('leaveRoomBtn').addEventListener('click', () => {
  socket.emit('leave_room');
  if (currentGame && currentGame.destroy) currentGame.destroy();
  currentGame = null;
  roomCode = null;
  showScreen('lobby');
});

// PostGame buttons
document.getElementById('playAgainBtn').addEventListener('click', () => {
  socket.emit('play_again');
});

document.getElementById('newGameBtn').addEventListener('click', () => {
  socket.emit('new_game');
  showScreen('room');
});

document.getElementById('postLeaveBtn').addEventListener('click', () => {
  socket.emit('leave_room');
  currentGame = null;
  roomCode = null;
  showScreen('lobby');
});

// ===== EXPOSED API FOR GAME MODULES =====
window.ArenaClient = {
  sendInput: (input) => { if (socket) socket.emit('game_input', input); },
  getCanvas: () => document.getElementById('arenaCanvas'),
  getCanvasWrapper: () => document.querySelector('.canvas-wrapper'),
  isHost: () => isHost
};

window.ArenaGames = window.ArenaGames || {};

// ===== INIT =====
document.getElementById('createRoomBtn').disabled = true;
document.getElementById('joinRoomBtn').disabled = true;
connect();

// Re-add listener that needs socket (after connect)
// The room_update → startGameClient bridge
const origRoomUpdate = handleRoomUpdate;
socket.on('room_update', (data) => {
  if (data.state === 'playing' && data.game && !currentGame) {
    startGameClient(data.game);
  }
});

})();
