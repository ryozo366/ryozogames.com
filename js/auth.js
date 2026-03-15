// ===== RyozoGames Auth System =====
// Pure localStorage - no external services needed
// Accounts + game saves stored locally per user

(function() {
'use strict';

const ACCOUNTS_KEY = 'ryozogames_accounts';
const SESSION_KEY = 'ryozogames_session';

let currentUser = null;

// ===== PASSWORD HASHING (SHA-256) =====
async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(salt + ':' + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===== ACCOUNT STORAGE =====
function getAccounts() {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || {}; }
  catch { return {}; }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// ===== AUTH ACTIONS =====
async function register(username, password) {
  username = username.trim().toLowerCase();

  if (username.length < 3) return { error: 'Username must be at least 3 characters' };
  if (username.length > 20) return { error: 'Username must be 20 characters or less' };
  if (!/^[a-z0-9_]+$/.test(username)) return { error: 'Only letters, numbers, underscore allowed' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters' };

  const accounts = getAccounts();
  if (accounts[username]) return { error: 'Username already taken' };

  const salt = generateSalt();
  const hash = await hashPassword(password, salt);

  accounts[username] = {
    salt: salt,
    hash: hash,
    createdAt: Date.now(),
  };
  saveAccounts(accounts);

  // Auto-login after register
  setSession(username);
  onLogin(username);
  return { ok: true };
}

async function login(username, password) {
  username = username.trim().toLowerCase();

  const accounts = getAccounts();
  const account = accounts[username];
  if (!account) return { error: 'Wrong username or password' };

  const hash = await hashPassword(password, account.salt);
  if (hash !== account.hash) return { error: 'Wrong username or password' };

  setSession(username);
  onLogin(username);
  return { ok: true };
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  currentUser = null;
  updateAuthDisplay();
  // Reload page to reset game state to default/anonymous
  location.reload();
}

function setSession(username) {
  localStorage.setItem(SESSION_KEY, username);
}

function getSession() {
  return localStorage.getItem(SESSION_KEY) || null;
}

// ===== LOGIN / LOGOUT HANDLERS =====
function onLogin(username) {
  currentUser = username;
  updateAuthDisplay();
  loadUserSaves();
}

// ===== GAME SAVE SYSTEM =====
// When logged in: saves go to user-specific keys
// When not logged in: saves go to default keys (backwards compatible)

function getSaveKey(gameId) {
  if (currentUser) {
    return 'ryozogames_' + currentUser + '_' + gameId;
  }
  // Default keys for anonymous play (backwards compatible)
  if (gameId === 'ryozoclicker') return 'ryozoclicker_save';
  if (gameId === 'ryozodash_easy') return 'ryozodash_best_easy';
  if (gameId === 'ryozodash_normal') return 'ryozodash_best_normal';
  if (gameId === 'ryozodash_hard') return 'ryozodash_best_hard';
  return 'ryozogames_anon_' + gameId;
}

function saveGameData(gameId, data) {
  const key = getSaveKey(gameId);
  if (typeof data === 'object') {
    localStorage.setItem(key, JSON.stringify(data));
  } else {
    localStorage.setItem(key, String(data));
  }
}

function loadGameData(gameId) {
  const key = getSaveKey(gameId);
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch { return raw; }
}

function loadUserSaves() {
  // Tell RyozoClicker to reload from user save
  if (window.loadClickerFromCloud) {
    const save = loadGameData('ryozoclicker');
    if (save) window.loadClickerFromCloud(save);
  }
  // Tell RyozoDash to reload scores
  if (window.loadDashFromCloud) {
    window.loadDashFromCloud({
      easy: loadGameData('ryozodash_easy'),
      normal: loadGameData('ryozodash_normal'),
      hard: loadGameData('ryozodash_hard'),
    });
  }
}

// ===== UI =====
function renderAuthUI() {
  const nav = document.querySelector('.nav-links');
  if (!nav) return;

  const li = document.createElement('li');
  li.id = 'authNavItem';
  li.innerHTML = '<a href="#" id="authNavBtn" class="auth-nav-btn">Login</a>';
  nav.appendChild(li);

  document.getElementById('authNavBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser) {
      showUserMenu();
    } else {
      showAuthModal();
    }
  });

  // Modal
  const modal = document.createElement('div');
  modal.id = 'authModal';
  modal.className = 'auth-modal';
  modal.innerHTML = `
    <div class="auth-modal-bg"></div>
    <div class="auth-modal-box">
      <button class="auth-close" id="authClose">&times;</button>
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login">Login</button>
        <button class="auth-tab" data-tab="register">Register</button>
      </div>
      <form id="authForm" autocomplete="off">
        <div class="auth-field">
          <label for="authUser">Username</label>
          <input type="text" id="authUser" placeholder="your username" autocomplete="username" maxlength="20" required>
        </div>
        <div class="auth-field">
          <label for="authPass">Password</label>
          <input type="password" id="authPass" placeholder="min. 6 characters" autocomplete="current-password" minlength="6" required>
        </div>
        <p class="auth-error" id="authError"></p>
        <button type="submit" class="auth-submit" id="authSubmit">Login</button>
      </form>
      <p class="auth-info">Your game saves are stored locally per account.</p>
    </div>
  `;
  document.body.appendChild(modal);

  let authMode = 'login';

  document.getElementById('authClose').addEventListener('click', hideAuthModal);
  modal.querySelector('.auth-modal-bg').addEventListener('click', hideAuthModal);

  modal.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      authMode = tab.dataset.tab;
      modal.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t === tab));
      document.getElementById('authSubmit').textContent = authMode === 'login' ? 'Login' : 'Register';
      document.getElementById('authError').textContent = '';
    });
  });

  document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('authUser').value;
    const password = document.getElementById('authPass').value;
    const errorEl = document.getElementById('authError');
    const submitBtn = document.getElementById('authSubmit');

    errorEl.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Loading...';

    const result = authMode === 'login'
      ? await login(username, password)
      : await register(username, password);

    submitBtn.disabled = false;
    submitBtn.textContent = authMode === 'login' ? 'Login' : 'Register';

    if (result.error) {
      errorEl.textContent = result.error;
    } else {
      hideAuthModal();
      document.getElementById('authUser').value = '';
      document.getElementById('authPass').value = '';
    }
  });
}

function showAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('show');
}

function hideAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('show');
}

function updateAuthDisplay() {
  const btn = document.getElementById('authNavBtn');
  if (!btn) return;
  if (currentUser) {
    btn.textContent = currentUser;
    btn.classList.add('logged-in');
  } else {
    btn.textContent = 'Login';
    btn.classList.remove('logged-in');
  }
}

function showUserMenu() {
  if (confirm('Logged in as: ' + currentUser + '\n\nLog out?')) {
    logout();
  }
}

// ===== EXPOSE API =====
window.RyozoAuth = {
  saveGameData: saveGameData,
  loadGameData: loadGameData,
  getUser: () => currentUser,
  getSaveKey: getSaveKey,
};

// ===== INIT =====
function init() {
  renderAuthUI();
  // Restore session
  const session = getSession();
  if (session) {
    const accounts = getAccounts();
    if (accounts[session]) {
      onLogin(session);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
