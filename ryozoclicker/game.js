// ===== RYOZOCLICKER - Neon Idle Clicker =====
(function() {
'use strict';

// ===== BUILDINGS =====
const BUILDING_DATA = [
  { id: 'cursor',    name: 'Cursor',          icon: '🖱️', baseCps: 0.1,   basePrice: 15,         desc: 'Auto-Klicker' },
  { id: 'server',    name: 'Server',          icon: '🖥️', baseCps: 1,     basePrice: 100,        desc: 'Mining-Server' },
  { id: 'gpu',       name: 'GPU Farm',        icon: '⚡', baseCps: 8,     basePrice: 1100,       desc: 'Grafikkarten-Farm' },
  { id: 'botnet',    name: 'Bot-Netzwerk',    icon: '🤖', baseCps: 47,    basePrice: 12000,      desc: 'Automatisierte Bots' },
  { id: 'ai',        name: 'KI-Modul',        icon: '🧠', baseCps: 260,   basePrice: 130000,     desc: 'Künstliche Intelligenz' },
  { id: 'quantum',   name: 'Quantenrechner',  icon: '⚛️', baseCps: 1400,  basePrice: 1400000,    desc: 'Quantencomputer' },
  { id: 'dimension', name: 'Dimensions-Tor',  icon: '🌀', baseCps: 7800,  basePrice: 20000000,   desc: 'Interdimensionales Portal' },
];

// ===== UPGRADES =====
const UPGRADE_DATA = [
  { id: 'click2',     name: 'Click Power x2',     price: 100,       desc: 'Verdoppelt Coins pro Klick',    type: 'click', multiplier: 2 },
  { id: 'click5',     name: 'Click Power x5',     price: 5000,      desc: '5x Coins pro Klick',            type: 'click', multiplier: 5 },
  { id: 'click10',    name: 'Click Power x10',    price: 50000,     desc: '10x Coins pro Klick',           type: 'click', multiplier: 10 },
  { id: 'cursor_2x',  name: 'Cursor Turbo',       price: 500,       desc: 'Cursor CPS x2',                 type: 'building', building: 'cursor', multiplier: 2 },
  { id: 'server_2x',  name: 'Server Boost',       price: 5000,      desc: 'Server CPS x2',                 type: 'building', building: 'server', multiplier: 2 },
  { id: 'gpu_2x',     name: 'GPU Overclock',      price: 50000,     desc: 'GPU Farm CPS x2',               type: 'building', building: 'gpu', multiplier: 2 },
  { id: 'botnet_2x',  name: 'Bot Schwarm',        price: 500000,    desc: 'Bot-Netzwerk CPS x2',           type: 'building', building: 'botnet', multiplier: 2 },
  { id: 'ai_2x',      name: 'Deep Learning',      price: 5000000,   desc: 'KI-Modul CPS x2',              type: 'building', building: 'ai', multiplier: 2 },
  { id: 'quantum_2x', name: 'Qubit Boost',        price: 50000000,  desc: 'Quantenrechner CPS x2',         type: 'building', building: 'quantum', multiplier: 2 },
  { id: 'dim_2x',     name: 'Multiversum',        price: 500000000, desc: 'Dimensions-Tor CPS x2',         type: 'building', building: 'dimension', multiplier: 2 },
  { id: 'global_2x',  name: 'Neon Overdrive',     price: 10000000,  desc: 'Alle CPS x2',                   type: 'global', multiplier: 2 },
  { id: 'global_5x',  name: 'Hyper Neon',         price: 1000000000,desc: 'Alle CPS x5',                   type: 'global', multiplier: 5 },
];

// ===== ACHIEVEMENTS =====
const ACHIEVEMENT_DATA = [
  { id: 'click1',      name: 'Erster Klick',       desc: '1 Coin geklickt',                icon: '👆', check: s => s.totalClicks >= 1 },
  { id: 'click100',    name: 'Klick-Anfänger',     desc: '100 Klicks',                     icon: '✊', check: s => s.totalClicks >= 100 },
  { id: 'click1000',   name: 'Klick-Profi',        desc: '1.000 Klicks',                   icon: '💪', check: s => s.totalClicks >= 1000 },
  { id: 'click10000',  name: 'Klick-König',        desc: '10.000 Klicks',                  icon: '👑', check: s => s.totalClicks >= 10000 },
  { id: 'coins100',    name: 'Hundert',            desc: '100 Coins verdient',             icon: '🪙', check: s => s.totalCoins >= 100 },
  { id: 'coins1k',     name: 'Tausender',          desc: '1.000 Coins verdient',           icon: '💰', check: s => s.totalCoins >= 1000 },
  { id: 'coins100k',   name: 'Reicher Gamer',      desc: '100.000 Coins verdient',         icon: '💎', check: s => s.totalCoins >= 100000 },
  { id: 'coins1m',     name: 'Millionär',          desc: '1 Million Coins verdient',       icon: '🏆', check: s => s.totalCoins >= 1000000 },
  { id: 'coins1b',     name: 'Milliardär',         desc: '1 Milliarde Coins verdient',     icon: '🌟', check: s => s.totalCoins >= 1000000000 },
  { id: 'build1',      name: 'Automatisiert',      desc: 'Erstes Gebäude gekauft',         icon: '🏗️', check: s => Object.values(s.buildings).some(b => b > 0) },
  { id: 'build10',     name: 'Fabrikant',          desc: '10 Gebäude insgesamt',           icon: '🏭', check: s => Object.values(s.buildings).reduce((a,b) => a+b, 0) >= 10 },
  { id: 'build50',     name: 'Imperium',           desc: '50 Gebäude insgesamt',           icon: '🏰', check: s => Object.values(s.buildings).reduce((a,b) => a+b, 0) >= 50 },
  { id: 'cps100',      name: 'Passive Power',      desc: '100 CPS erreicht',               icon: '⚡', check: s => getCPS(s) >= 100 },
  { id: 'cps10k',      name: 'Geld-Maschine',      desc: '10.000 CPS erreicht',            icon: '🔥', check: s => getCPS(s) >= 10000 },
  { id: 'prestige1',   name: 'Neustart',           desc: 'Erstes Prestige',                icon: '♻️', check: s => s.totalPrestiges >= 1 },
];

// ===== GAME STATE =====
let state = getDefaultState();

function getDefaultState() {
  return {
    coins: 0,
    totalCoins: 0,
    totalClicks: 0,
    cpc: 1,
    buildings: {},
    buildingMultipliers: {},
    upgrades: [],
    achievements: [],
    prestigeMultiplier: 1,
    totalPrestiges: 0,
    globalMultiplier: 1,
    lastSave: Date.now(),
  };
}

// ===== NUMBER FORMATTING =====
function formatNum(n) {
  if (n < 1000) return Math.floor(n).toLocaleString('de-DE');
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx'];
  const tier = Math.floor(Math.log10(Math.abs(n)) / 3);
  if (tier === 0) return Math.floor(n).toLocaleString('de-DE');
  const suffix = suffixes[tier] || 'e' + (tier * 3);
  const scale = Math.pow(10, tier * 3);
  const scaled = n / scale;
  return scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0) + ' ' + suffix;
}

// ===== GAME LOGIC =====
function getBuildingPrice(building, count) {
  return Math.floor(building.basePrice * Math.pow(1.15, count));
}

function getBuildingCPS(building, count, state) {
  const mult = state.buildingMultipliers[building.id] || 1;
  return building.baseCps * count * mult * state.globalMultiplier * state.prestigeMultiplier;
}

function getCPS(s) {
  let total = 0;
  for (const b of BUILDING_DATA) {
    const count = s.buildings[b.id] || 0;
    if (count > 0) total += getBuildingCPS(b, count, s);
  }
  return total;
}

function getEffectiveCPC(s) {
  return s.cpc * s.prestigeMultiplier;
}

// ===== CLICK =====
function doClick(e) {
  const earned = getEffectiveCPC(state);
  state.coins += earned;
  state.totalCoins += earned;
  state.totalClicks++;
  spawnClickParticle(e, earned);
  animateCoin();
  checkAchievements();
  updateUI();
}

// ===== BUY BUILDING =====
function buyBuilding(id) {
  const building = BUILDING_DATA.find(b => b.id === id);
  const count = state.buildings[id] || 0;
  const price = getBuildingPrice(building, count);
  if (state.coins >= price) {
    state.coins -= price;
    state.buildings[id] = count + 1;
    checkAchievements();
    updateUI();
    playBuySound();
  }
}

// ===== BUY UPGRADE =====
function buyUpgrade(id) {
  const upgrade = UPGRADE_DATA.find(u => u.id === id);
  if (state.upgrades.includes(id) || state.coins < upgrade.price) return;
  state.coins -= upgrade.price;
  state.upgrades.push(id);

  if (upgrade.type === 'click') {
    state.cpc *= upgrade.multiplier;
  } else if (upgrade.type === 'building') {
    state.buildingMultipliers[upgrade.building] = (state.buildingMultipliers[upgrade.building] || 1) * upgrade.multiplier;
  } else if (upgrade.type === 'global') {
    state.globalMultiplier *= upgrade.multiplier;
  }

  checkAchievements();
  updateUI();
  playBuySound();
}

// ===== PRESTIGE =====
function getPrestigeBonus() {
  if (state.totalCoins < 1000000) return 0;
  return Math.floor(Math.pow(state.totalCoins / 1000000, 0.5));
}

function doPrestige() {
  const bonus = getPrestigeBonus();
  if (bonus <= 0) return;
  state.totalPrestiges++;
  state.prestigeMultiplier += bonus;
  state.coins = 0;
  state.cpc = 1;
  state.buildings = {};
  state.buildingMultipliers = {};
  state.upgrades = [];
  state.globalMultiplier = 1;
  // totalCoins, totalClicks, achievements persist
  checkAchievements();
  updateUI();
}

// ===== ACHIEVEMENTS =====
function checkAchievements() {
  for (const a of ACHIEVEMENT_DATA) {
    if (!state.achievements.includes(a.id) && a.check(state)) {
      state.achievements.push(a.id);
      showAchievementPopup(a);
    }
  }
}

function showAchievementPopup(achievement) {
  const popup = document.createElement('div');
  popup.className = 'achievement-popup';
  popup.innerHTML = `<span>${achievement.icon}</span> <b>${achievement.name}</b> freigeschaltet!`;
  document.body.appendChild(popup);
  setTimeout(() => popup.classList.add('show'), 10);
  setTimeout(() => { popup.classList.remove('show'); setTimeout(() => popup.remove(), 300); }, 3000);
}

// ===== PARTICLES =====
function spawnClickParticle(e, amount) {
  const container = document.getElementById('clickArea');
  const rect = container.getBoundingClientRect();
  const x = (e.clientX || e.touches?.[0]?.clientX || rect.left + rect.width / 2) - rect.left;
  const y = (e.clientY || e.touches?.[0]?.clientY || rect.top + rect.height / 2) - rect.top;

  const particle = document.createElement('div');
  particle.className = 'click-particle';
  particle.textContent = '+' + formatNum(amount);
  particle.style.left = x + 'px';
  particle.style.top = y + 'px';
  particle.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
  container.appendChild(particle);
  setTimeout(() => particle.remove(), 1000);
}

function animateCoin() {
  const coin = document.getElementById('coinBtn');
  coin.classList.add('clicked');
  setTimeout(() => coin.classList.remove('clicked'), 100);
}

// ===== AUDIO =====
let audioCtx;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playClickSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

function playBuySound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.type = 'square';
  osc.frequency.setValueAtTime(400, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
  osc.start(); osc.stop(audioCtx.currentTime + 0.15);
}

// ===== SAVE / LOAD =====
const SAVE_KEY = 'ryozoclicker_save';

function saveGame() {
  state.lastSave = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const saved = JSON.parse(raw);
    state = { ...getDefaultState(), ...saved };
    // Calculate offline earnings
    const elapsed = (Date.now() - state.lastSave) / 1000;
    if (elapsed > 5) {
      const offlineEarnings = getCPS(state) * Math.min(elapsed, 86400); // max 24h
      if (offlineEarnings > 0) {
        state.coins += offlineEarnings;
        state.totalCoins += offlineEarnings;
        setTimeout(() => {
          showAchievementPopup({ icon: '💤', name: 'Offline-Verdienst: ' + formatNum(offlineEarnings) + ' Coins' });
        }, 500);
      }
    }
    return true;
  } catch (e) { return false; }
}

function exportSave() {
  saveGame();
  const data = btoa(localStorage.getItem(SAVE_KEY));
  navigator.clipboard.writeText(data).then(() => {
    showAchievementPopup({ icon: '📋', name: 'Savegame kopiert!' });
  });
}

function importSave() {
  const data = prompt('Savegame-Code einfügen:');
  if (!data) return;
  try {
    const json = atob(data);
    JSON.parse(json); // validate
    localStorage.setItem(SAVE_KEY, json);
    loadGame();
    updateUI();
    showAchievementPopup({ icon: '✅', name: 'Savegame geladen!' });
  } catch (e) {
    alert('Ungültiger Savegame-Code!');
  }
}

function resetGame() {
  if (!confirm('Wirklich ALLES zurücksetzen? Das kann nicht rückgängig gemacht werden!')) return;
  localStorage.removeItem(SAVE_KEY);
  state = getDefaultState();
  updateUI();
}

// ===== UI =====
function updateUI() {
  const cps = getCPS(state);
  document.getElementById('coinCount').textContent = formatNum(state.coins);
  document.getElementById('cpsCount').textContent = formatNum(cps) + '/Sek';
  document.getElementById('cpcCount').textContent = formatNum(getEffectiveCPC(state)) + '/Klick';

  // Buildings
  const buildList = document.getElementById('buildingList');
  buildList.innerHTML = '';
  for (const b of BUILDING_DATA) {
    const count = state.buildings[b.id] || 0;
    const price = getBuildingPrice(b, count);
    const canBuy = state.coins >= price;
    const bCps = getBuildingCPS(b, 1, state);

    const el = document.createElement('button');
    el.className = 'shop-item' + (canBuy ? '' : ' locked');
    el.innerHTML = `
      <div class="shop-item-left">
        <span class="shop-icon">${b.icon}</span>
        <div>
          <div class="shop-name">${b.name} <span class="shop-count">${count > 0 ? 'x' + count : ''}</span></div>
          <div class="shop-desc">${b.desc} · +${formatNum(bCps)} CPS</div>
        </div>
      </div>
      <div class="shop-price ${canBuy ? 'affordable' : ''}">${formatNum(price)}</div>
    `;
    el.addEventListener('click', () => { ensureAudio(); buyBuilding(b.id); });
    buildList.appendChild(el);
  }

  // Upgrades
  const upgradeList = document.getElementById('upgradeList');
  upgradeList.innerHTML = '';
  let hasUpgrades = false;
  for (const u of UPGRADE_DATA) {
    if (state.upgrades.includes(u.id)) continue;
    hasUpgrades = true;
    const canBuy = state.coins >= u.price;
    const el = document.createElement('button');
    el.className = 'shop-item upgrade-item' + (canBuy ? '' : ' locked');
    el.innerHTML = `
      <div class="shop-item-left">
        <span class="shop-icon">⬆️</span>
        <div>
          <div class="shop-name">${u.name}</div>
          <div class="shop-desc">${u.desc}</div>
        </div>
      </div>
      <div class="shop-price ${canBuy ? 'affordable' : ''}">${formatNum(u.price)}</div>
    `;
    el.addEventListener('click', () => { ensureAudio(); buyUpgrade(u.id); });
    upgradeList.appendChild(el);
  }
  if (!hasUpgrades) {
    upgradeList.innerHTML = '<p class="shop-empty">Alle Upgrades gekauft!</p>';
  }

  // Achievements
  const achList = document.getElementById('achievementList');
  achList.innerHTML = '';
  for (const a of ACHIEVEMENT_DATA) {
    const unlocked = state.achievements.includes(a.id);
    const el = document.createElement('div');
    el.className = 'ach-badge' + (unlocked ? ' unlocked' : '');
    el.title = unlocked ? a.name + ': ' + a.desc : '???';
    el.textContent = unlocked ? a.icon : '🔒';
    achList.appendChild(el);
  }

  // Prestige
  const prestigeBonus = getPrestigeBonus();
  const prestigeBtn = document.getElementById('prestigeBtn');
  if (prestigeBonus > 0) {
    prestigeBtn.style.display = 'block';
    prestigeBtn.textContent = `♻️ Prestige (+${prestigeBonus}x Multiplikator)`;
  } else {
    prestigeBtn.style.display = 'none';
  }
  document.getElementById('prestigeInfo').textContent =
    state.prestigeMultiplier > 1 ? `Prestige: x${state.prestigeMultiplier}` : '';
}

// ===== TABS =====
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('buildingPanel').style.display = tab === 'buildings' ? 'block' : 'none';
  document.getElementById('upgradePanel').style.display = tab === 'upgrades' ? 'block' : 'none';
}

// ===== GAME LOOP =====
let lastTick = performance.now();

function gameLoop(now) {
  const dt = (now - lastTick) / 1000;
  lastTick = now;

  const earned = getCPS(state) * dt;
  if (earned > 0) {
    state.coins += earned;
    state.totalCoins += earned;
  }

  updateUI();
  checkAchievements();
  requestAnimationFrame(gameLoop);
}

// ===== INIT =====
function init() {
  loadGame();

  // Coin click
  const coinBtn = document.getElementById('coinBtn');
  coinBtn.addEventListener('click', (e) => { ensureAudio(); playClickSound(); doClick(e); });
  coinBtn.addEventListener('touchstart', (e) => { e.preventDefault(); ensureAudio(); playClickSound(); doClick(e); }, { passive: false });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Prestige
  document.getElementById('prestigeBtn').addEventListener('click', doPrestige);

  // Save buttons
  document.getElementById('saveBtn').addEventListener('click', () => { saveGame(); showAchievementPopup({ icon: '💾', name: 'Gespeichert!' }); });
  document.getElementById('exportBtn').addEventListener('click', exportSave);
  document.getElementById('importBtn').addEventListener('click', importSave);
  document.getElementById('resetBtn').addEventListener('click', resetGame);

  // Auto-save every 30s
  setInterval(saveGame, 30000);

  updateUI();
  requestAnimationFrame(gameLoop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
