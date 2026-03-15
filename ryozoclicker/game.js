// ===== RYOZOCLICKER - Neon Idle Clicker =====
(function() {
'use strict';

// ===== BUILDINGS (12) =====
const BUILDING_DATA = [
  { id: 'cursor',     name: 'Cursor',           icon: '\u{1F5B1}\uFE0F', baseCps: 0.5,        basePrice: 10,              desc: 'Auto-Clicker' },
  { id: 'server',     name: 'Server',           icon: '\u{1F5A5}\uFE0F', baseCps: 3,          basePrice: 75,              desc: 'Mining Server' },
  { id: 'gpu',        name: 'GPU Farm',         icon: '\u26A1',          baseCps: 15,         basePrice: 800,             desc: 'Graphics Card Farm' },
  { id: 'botnet',     name: 'Bot Network',      icon: '\u{1F916}',       baseCps: 80,         basePrice: 9000,            desc: 'Automated Bots' },
  { id: 'ai',         name: 'AI Module',        icon: '\u{1F9E0}',       baseCps: 400,        basePrice: 100000,          desc: 'Artificial Intelligence' },
  { id: 'quantum',    name: 'Quantum Computer', icon: '\u269B\uFE0F',    baseCps: 2500,       basePrice: 1100000,         desc: 'Quantum Processor' },
  { id: 'dimension',  name: 'Dimension Gate',   icon: '\u{1F300}',       baseCps: 15000,      basePrice: 12000000,        desc: 'Interdimensional Portal' },
  { id: 'timemachine',name: 'Time Machine',     icon: '\u231B',          baseCps: 90000,      basePrice: 130000000,       desc: 'Temporal Harvester' },
  { id: 'dyson',      name: 'Dyson Sphere',     icon: '\u2600\uFE0F',    baseCps: 550000,     basePrice: 1400000000,      desc: 'Star-Powered Generator' },
  { id: 'galaxy',     name: 'Galaxy Brain',     icon: '\u{1F30C}',       baseCps: 3500000,    basePrice: 15000000000,     desc: 'Galactic Neural Network' },
  { id: 'reality',    name: 'Reality Engine',   icon: '\u{1F529}',       baseCps: 22000000,   basePrice: 170000000000,    desc: 'Fabric of Reality Manipulator' },
  { id: 'multiverse', name: 'Multiverse Core',  icon: '\u{1F4A0}',       baseCps: 140000000,  basePrice: 2000000000000,   desc: 'Infinite Universe Generator' },
];

// ===== UPGRADES (25) =====
const UPGRADE_DATA = [
  // Click power
  { id: 'click2',      name: 'Click Power x2',     price: 100,            desc: 'Double coins per click',          type: 'click', multiplier: 2 },
  { id: 'click5',      name: 'Click Power x5',     price: 5000,           desc: '5x coins per click',              type: 'click', multiplier: 5 },
  { id: 'click10',     name: 'Click Power x10',    price: 50000,          desc: '10x coins per click',             type: 'click', multiplier: 10 },
  { id: 'click25',     name: 'Click Power x25',    price: 5000000,        desc: '25x coins per click',             type: 'click', multiplier: 25 },
  { id: 'click100',    name: 'Click Power x100',   price: 500000000,      desc: '100x coins per click',            type: 'click', multiplier: 100 },
  // Building boosts
  { id: 'cursor_2x',   name: 'Cursor Turbo',       price: 300,            desc: 'Cursor CPS x2',                  type: 'building', building: 'cursor', multiplier: 2 },
  { id: 'server_2x',   name: 'Server Boost',       price: 3000,           desc: 'Server CPS x2',                  type: 'building', building: 'server', multiplier: 2 },
  { id: 'gpu_2x',      name: 'GPU Overclock',      price: 30000,          desc: 'GPU Farm CPS x2',                type: 'building', building: 'gpu', multiplier: 2 },
  { id: 'botnet_2x',   name: 'Bot Swarm',          price: 300000,         desc: 'Bot Network CPS x2',             type: 'building', building: 'botnet', multiplier: 2 },
  { id: 'ai_2x',       name: 'Deep Learning',      price: 3000000,        desc: 'AI Module CPS x2',               type: 'building', building: 'ai', multiplier: 2 },
  { id: 'quantum_2x',  name: 'Qubit Boost',        price: 30000000,       desc: 'Quantum Computer CPS x2',        type: 'building', building: 'quantum', multiplier: 2 },
  { id: 'dim_2x',      name: 'Portal Amplifier',   price: 300000000,      desc: 'Dimension Gate CPS x2',          type: 'building', building: 'dimension', multiplier: 2 },
  { id: 'time_2x',     name: 'Temporal Flux',      price: 3000000000,     desc: 'Time Machine CPS x2',            type: 'building', building: 'timemachine', multiplier: 2 },
  { id: 'dyson_2x',    name: 'Solar Overdrive',    price: 30000000000,    desc: 'Dyson Sphere CPS x2',            type: 'building', building: 'dyson', multiplier: 2 },
  { id: 'galaxy_2x',   name: 'Cosmic Expansion',   price: 300000000000,   desc: 'Galaxy Brain CPS x2',            type: 'building', building: 'galaxy', multiplier: 2 },
  { id: 'reality_2x',  name: 'Reality Warp',       price: 3000000000000,  desc: 'Reality Engine CPS x2',          type: 'building', building: 'reality', multiplier: 2 },
  { id: 'multi_2x',    name: 'Infinite Loop',      price: 30000000000000, desc: 'Multiverse Core CPS x2',         type: 'building', building: 'multiverse', multiplier: 2 },
  // Global multipliers
  { id: 'global_2x',   name: 'Neon Overdrive',     price: 10000000,       desc: 'All CPS x2',                     type: 'global', multiplier: 2 },
  { id: 'global_5x',   name: 'Hyper Neon',         price: 1000000000,     desc: 'All CPS x5',                     type: 'global', multiplier: 5 },
  { id: 'global_10x',  name: 'Ultra Neon',         price: 100000000000,   desc: 'All CPS x10',                    type: 'global', multiplier: 10 },
  // Special
  { id: 'golden',      name: 'Golden Touch',       price: 50000000,       desc: 'Clicks also give 1% of CPS',     type: 'golden' },
  { id: 'golden5',     name: 'Diamond Touch',      price: 50000000000,    desc: 'Clicks give 5% of CPS',          type: 'golden5' },
];

// ===== ACHIEVEMENTS (22) =====
const ACHIEVEMENT_DATA = [
  { id: 'click1',       name: 'First Click',       desc: '1 coin clicked',              icon: '\u{1F446}', check: s => s.totalClicks >= 1 },
  { id: 'click100',     name: 'Click Beginner',    desc: '100 clicks',                  icon: '\u270A',    check: s => s.totalClicks >= 100 },
  { id: 'click1000',    name: 'Click Pro',         desc: '1,000 clicks',                icon: '\u{1F4AA}', check: s => s.totalClicks >= 1000 },
  { id: 'click10000',   name: 'Click King',        desc: '10,000 clicks',               icon: '\u{1F451}', check: s => s.totalClicks >= 10000 },
  { id: 'click100k',    name: 'Click God',         desc: '100,000 clicks',              icon: '\u{1F31F}', check: s => s.totalClicks >= 100000 },
  { id: 'coins100',     name: 'Hundred',           desc: '100 coins earned',            icon: '\u{1FA99}', check: s => s.totalCoins >= 100 },
  { id: 'coins1k',      name: 'Thousand',          desc: '1,000 coins earned',          icon: '\u{1F4B0}', check: s => s.totalCoins >= 1000 },
  { id: 'coins100k',    name: 'Rich Gamer',        desc: '100,000 coins earned',        icon: '\u{1F48E}', check: s => s.totalCoins >= 100000 },
  { id: 'coins1m',      name: 'Millionaire',       desc: '1 million coins earned',      icon: '\u{1F3C6}', check: s => s.totalCoins >= 1000000 },
  { id: 'coins1b',      name: 'Billionaire',       desc: '1 billion coins earned',      icon: '\u{1F4B8}', check: s => s.totalCoins >= 1000000000 },
  { id: 'coins1t',      name: 'Trillionaire',      desc: '1 trillion coins earned',     icon: '\u{1F525}', check: s => s.totalCoins >= 1000000000000 },
  { id: 'coins1qa',     name: 'Beyond Wealth',     desc: '1 quadrillion coins earned',  icon: '\u{1F4AB}', check: s => s.totalCoins >= 1e15 },
  { id: 'build1',       name: 'Automated',         desc: 'First building bought',       icon: '\u{1F3D7}\uFE0F', check: s => Object.values(s.buildings).some(b => b > 0) },
  { id: 'build10',      name: 'Factory Owner',     desc: '10 buildings total',          icon: '\u{1F3ED}', check: s => Object.values(s.buildings).reduce((a,b) => a+b, 0) >= 10 },
  { id: 'build50',      name: 'Empire',            desc: '50 buildings total',          icon: '\u{1F3F0}', check: s => Object.values(s.buildings).reduce((a,b) => a+b, 0) >= 50 },
  { id: 'build100',     name: 'Tycoon',            desc: '100 buildings total',         icon: '\u{1F3DB}\uFE0F', check: s => Object.values(s.buildings).reduce((a,b) => a+b, 0) >= 100 },
  { id: 'build200',     name: 'Megacorp',          desc: '200 buildings total',         icon: '\u{1F310}', check: s => Object.values(s.buildings).reduce((a,b) => a+b, 0) >= 200 },
  { id: 'cps100',       name: 'Passive Power',     desc: '100 CPS reached',             icon: '\u26A1',    check: s => getCPS(s) >= 100 },
  { id: 'cps10k',       name: 'Money Machine',     desc: '10,000 CPS reached',          icon: '\u{1F4A5}', check: s => getCPS(s) >= 10000 },
  { id: 'cps1m',        name: 'Coin Factory',      desc: '1M CPS reached',              icon: '\u{1F680}', check: s => getCPS(s) >= 1000000 },
  { id: 'cps1b',        name: 'Infinite Flow',     desc: '1B CPS reached',              icon: '\u267E\uFE0F', check: s => getCPS(s) >= 1000000000 },
  { id: 'prestige1',    name: 'Fresh Start',       desc: 'First prestige',              icon: '\u267B\uFE0F', check: s => s.totalPrestiges >= 1 },
];

// ===== GAME STATE =====
let state = getDefaultState();
let shopDirty = true;

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
    goldenClickPercent: 0,
    lastSave: Date.now(),
  };
}

// ===== NUMBER FORMATTING =====
const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd'];

function formatNum(n) {
  if (n < 0) return '-' + formatNum(-n);
  if (n < 1) return n === 0 ? '0' : n.toFixed(1);
  if (n < 1000) return Math.floor(n).toLocaleString('en-US');
  const tier = Math.floor(Math.log10(Math.abs(n)) / 3);
  if (tier === 0) return Math.floor(n).toLocaleString('en-US');
  const suffix = SUFFIXES[tier] || 'e' + (tier * 3);
  const scale = Math.pow(10, tier * 3);
  const scaled = n / scale;
  return scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0) + ' ' + suffix;
}

// ===== GAME LOGIC =====
function getBuildingPrice(building, count) {
  return Math.floor(building.basePrice * Math.pow(1.15, count));
}

function getBuildingCPS(building, count, s) {
  const mult = s.buildingMultipliers[building.id] || 1;
  return building.baseCps * count * mult * s.globalMultiplier * s.prestigeMultiplier;
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
  let cpc = s.cpc * s.prestigeMultiplier;
  if (s.goldenClickPercent > 0) {
    cpc += getCPS(s) * s.goldenClickPercent;
  }
  return cpc;
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
  shopDirty = true;
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
    shopDirty = true;
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
  } else if (upgrade.type === 'golden') {
    state.goldenClickPercent = 0.01;
  } else if (upgrade.type === 'golden5') {
    state.goldenClickPercent = 0.05;
  }

  checkAchievements();
  shopDirty = true;
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
  state.goldenClickPercent = 0;
  checkAchievements();
  shopDirty = true;
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
  popup.innerHTML = `<span>${achievement.icon}</span> <b>${achievement.name}</b> unlocked!`;
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
  const data = JSON.stringify(state);
  localStorage.setItem(SAVE_KEY, data);
  // Cloud save if logged in
  if (window.RyozoAuth && window.RyozoAuth.saveToCloud) {
    window.RyozoAuth.saveToCloud('ryozoclicker', state);
  }
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const saved = JSON.parse(raw);
    state = { ...getDefaultState(), ...saved };
    const elapsed = (Date.now() - state.lastSave) / 1000;
    if (elapsed > 5) {
      const offlineEarnings = getCPS(state) * Math.min(elapsed, 86400);
      if (offlineEarnings > 0) {
        state.coins += offlineEarnings;
        state.totalCoins += offlineEarnings;
        setTimeout(() => {
          showAchievementPopup({ icon: '\u{1F4A4}', name: 'Offline: +' + formatNum(offlineEarnings) + ' coins' });
        }, 500);
      }
    }
    return true;
  } catch (e) { return false; }
}

// Called by auth system when cloud save is loaded
window.loadClickerFromCloud = function(saveData) {
  if (!saveData) return;
  state = { ...getDefaultState(), ...saveData };
  shopDirty = true;
  updateCounters();
  updateShop();
};

function exportSave() {
  saveGame();
  const data = btoa(localStorage.getItem(SAVE_KEY));
  navigator.clipboard.writeText(data).then(() => {
    showAchievementPopup({ icon: '\u{1F4CB}', name: 'Save copied!' });
  });
}

function importSave() {
  const data = prompt('Paste save code:');
  if (!data) return;
  try {
    const json = atob(data);
    JSON.parse(json);
    localStorage.setItem(SAVE_KEY, json);
    loadGame();
    shopDirty = true;
    showAchievementPopup({ icon: '\u2705', name: 'Save loaded!' });
  } catch (e) {
    alert('Invalid save code!');
  }
}

function resetGame() {
  if (!confirm('Really reset EVERYTHING? This cannot be undone!')) return;
  localStorage.removeItem(SAVE_KEY);
  state = getDefaultState();
  shopDirty = true;
}

// ===== UI: COUNTERS (runs every frame) =====
function updateCounters() {
  const cps = getCPS(state);
  document.getElementById('coinCount').textContent = formatNum(state.coins);
  document.getElementById('cpsCount').textContent = formatNum(cps) + '/sec';
  document.getElementById('cpcCount').textContent = formatNum(getEffectiveCPC(state)) + '/click';
}

// ===== UI: SHOP (runs only when shopDirty) =====
function updateShop() {
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
          <div class="shop-desc">${b.desc} \u00B7 +${formatNum(bCps)} CPS</div>
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
        <span class="shop-icon">\u2B06\uFE0F</span>
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
    upgradeList.innerHTML = '<p class="shop-empty">All upgrades purchased!</p>';
  }

  // Achievements
  const achList = document.getElementById('achievementList');
  achList.innerHTML = '';
  for (const a of ACHIEVEMENT_DATA) {
    const unlocked = state.achievements.includes(a.id);
    const el = document.createElement('div');
    el.className = 'ach-badge' + (unlocked ? ' unlocked' : '');
    el.title = unlocked ? a.name + ': ' + a.desc : '???';
    el.textContent = unlocked ? a.icon : '\u{1F512}';
    achList.appendChild(el);
  }

  // Prestige
  const prestigeBonus = getPrestigeBonus();
  const prestigeBtn = document.getElementById('prestigeBtn');
  if (prestigeBonus > 0) {
    prestigeBtn.style.display = 'block';
    prestigeBtn.textContent = '\u267B\uFE0F Prestige (+' + prestigeBonus + 'x multiplier)';
  } else {
    prestigeBtn.style.display = 'none';
  }
  document.getElementById('prestigeInfo').textContent =
    state.prestigeMultiplier > 1 ? 'Prestige: x' + state.prestigeMultiplier : '';
}

// ===== TABS =====
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('buildingPanel').style.display = tab === 'buildings' ? 'block' : 'none';
  document.getElementById('upgradePanel').style.display = tab === 'upgrades' ? 'block' : 'none';
}

// ===== GAME LOOP =====
let lastTick = performance.now();
let lastShopUpdate = 0;

function gameLoop(now) {
  const dt = (now - lastTick) / 1000;
  lastTick = now;

  const earned = getCPS(state) * dt;
  if (earned > 0) {
    state.coins += earned;
    state.totalCoins += earned;
  }

  updateCounters();

  if (shopDirty || now - lastShopUpdate > 500) {
    updateShop();
    shopDirty = false;
    lastShopUpdate = now;
  }

  checkAchievements();
  requestAnimationFrame(gameLoop);
}

// ===== INIT =====
function init() {
  loadGame();

  const coinBtn = document.getElementById('coinBtn');
  coinBtn.addEventListener('click', (e) => { ensureAudio(); playClickSound(); doClick(e); });
  coinBtn.addEventListener('touchstart', (e) => { e.preventDefault(); ensureAudio(); playClickSound(); doClick(e); }, { passive: false });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('prestigeBtn').addEventListener('click', doPrestige);

  document.getElementById('saveBtn').addEventListener('click', () => { saveGame(); showAchievementPopup({ icon: '\u{1F4BE}', name: 'Saved!' }); });
  document.getElementById('exportBtn').addEventListener('click', exportSave);
  document.getElementById('importBtn').addEventListener('click', importSave);
  document.getElementById('resetBtn').addEventListener('click', resetGame);

  setInterval(saveGame, 30000);

  shopDirty = true;
  updateCounters();
  updateShop();
  requestAnimationFrame(gameLoop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
