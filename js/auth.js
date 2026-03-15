// ===== RyozoGames Auth + Cloud Save System =====
// Uses Supabase for authentication and cloud saves
// Falls back to localStorage-only when Supabase is not configured

(function() {
'use strict';

// ===== CONFIG =====
// IMPORTANT: Replace these with your Supabase project credentials
const SUPABASE_URL = '';  // e.g. 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = ''; // your anon/public key

let supabase = null;
let currentUser = null;
let authReady = false;

// ===== INIT =====
function initAuth() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('[Auth] No Supabase config - running in offline mode');
    authReady = true;
    return;
  }

  if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
    console.warn('[Auth] Supabase JS not loaded');
    authReady = true;
    return;
  }

  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  renderAuthUI();

  // Check existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      onLogin(session.user);
    }
    authReady = true;
  });

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      onLogin(session.user);
    } else if (event === 'SIGNED_OUT') {
      onLogout();
    }
  });
}

// ===== AUTH ACTIONS =====
async function register(username, password) {
  if (!supabase) return { error: 'Not configured' };
  username = username.trim().toLowerCase();

  if (username.length < 3) return { error: 'Username must be at least 3 characters' };
  if (username.length > 20) return { error: 'Username must be 20 characters or less' };
  if (!/^[a-z0-9_]+$/.test(username)) return { error: 'Username: only letters, numbers, underscore' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters' };

  const email = username + '@ryozogames.local';

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: { data: { username: username } }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Username already taken' };
    }
    return { error: error.message };
  }

  // Create profile
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      username: username,
    });
  }

  return { data };
}

async function login(username, password) {
  if (!supabase) return { error: 'Not configured' };
  username = username.trim().toLowerCase();
  const email = username + '@ryozogames.local';

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    if (error.message.includes('Invalid login')) {
      return { error: 'Wrong username or password' };
    }
    return { error: error.message };
  }

  return { data };
}

async function logout() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

function onLogin(user) {
  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
  currentUser = { id: user.id, username: username };
  updateAuthDisplay();
  // Load cloud saves
  loadAllCloudSaves();
}

function onLogout() {
  currentUser = null;
  updateAuthDisplay();
}

// ===== CLOUD SAVES =====
async function saveToCloud(gameId, saveData) {
  if (!supabase || !currentUser) return;
  try {
    await supabase.from('game_saves').upsert({
      user_id: currentUser.id,
      game_id: gameId,
      save_data: saveData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,game_id' });
  } catch (e) {
    console.warn('[Auth] Cloud save failed:', e);
  }
}

async function loadFromCloud(gameId) {
  if (!supabase || !currentUser) return null;
  try {
    const { data, error } = await supabase
      .from('game_saves')
      .select('save_data')
      .eq('user_id', currentUser.id)
      .eq('game_id', gameId)
      .single();
    if (error || !data) return null;
    return data.save_data;
  } catch (e) {
    return null;
  }
}

async function loadAllCloudSaves() {
  // Load RyozoClicker save
  const clickerSave = await loadFromCloud('ryozoclicker');
  if (clickerSave && window.loadClickerFromCloud) {
    window.loadClickerFromCloud(clickerSave);
  }

  // Load RyozoDash saves
  const dashSave = await loadFromCloud('ryozodash');
  if (dashSave && window.loadDashFromCloud) {
    window.loadDashFromCloud(dashSave);
  }
}

// ===== UI =====
function renderAuthUI() {
  // Add login button or username to nav
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

  // Create modal
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
      <p class="auth-info">Your game saves will be synced to the cloud.</p>
    </div>
  `;
  document.body.appendChild(modal);

  // Event listeners
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

    let result;
    if (authMode === 'login') {
      result = await login(username, password);
    } else {
      result = await register(username, password);
    }

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
    btn.textContent = currentUser.username;
    btn.classList.add('logged-in');
  } else {
    btn.textContent = 'Login';
    btn.classList.remove('logged-in');
  }
}

function showUserMenu() {
  if (confirm('Logged in as ' + currentUser.username + '\n\nLog out?')) {
    logout();
  }
}

// ===== EXPOSE API =====
window.RyozoAuth = {
  saveToCloud: saveToCloud,
  loadFromCloud: loadFromCloud,
  getUser: () => currentUser,
  isReady: () => authReady,
};

// ===== INIT ON DOM READY =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}

})();
