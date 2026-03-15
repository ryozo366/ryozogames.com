(function() {
'use strict';

window.ArenaGames = window.ArenaGames || {};

window.ArenaGames.airhockey = {
  canvas: null,
  ctx: null,
  lastState: null,
  animFrame: null,
  W: 400,
  H: 600,
  MALLET_R: 25,
  PUCK_R: 15,
  GOAL_W: 120,
  lastInputTime: 0,

  init() {
    this.canvas = window.ArenaClient.getCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.lastState = null;
    this.lastInputTime = 0;
    this.resize();
    this._resizeHandler = () => this.resize();
    window.addEventListener('resize', this._resizeHandler);
    this.bindInput();
    this.renderLoop();
  },

  resize() {
    const wrapper = window.ArenaClient.getCanvasWrapper();
    const maxW = wrapper.clientWidth - 24;
    const maxH = wrapper.clientHeight - 24;
    const aspect = this.W / this.H;
    let h = maxH;
    let w = h * aspect;
    if (w > maxW) { w = maxW; h = w / aspect; }
    this.canvas.style.width = Math.floor(w) + 'px';
    this.canvas.style.height = Math.floor(h) + 'px';
    this.displayW = w;
    this.displayH = h;
  },

  bindInput() {
    const self = this;

    this._mousemove = (e) => {
      const rect = self.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * self.W;
      const y = (e.clientY - rect.top) / rect.height * self.H;
      self.sendThrottled(x, y);
    };

    this._touchmove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = self.canvas.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width * self.W;
      const y = (touch.clientY - rect.top) / rect.height * self.H;
      self.sendThrottled(x, y);
    };

    this.canvas.addEventListener('mousemove', this._mousemove);
    this.canvas.addEventListener('touchstart', this._touchmove, { passive: false });
    this.canvas.addEventListener('touchmove', this._touchmove, { passive: false });
  },

  sendThrottled(x, y) {
    const now = Date.now();
    if (now - this.lastInputTime < 16) return; // ~60fps throttle
    this.lastInputTime = now;
    window.ArenaClient.sendInput({ tx: x, ty: y });
  },

  updateState(state) {
    this.lastState = state;
  },

  renderLoop() {
    this.render();
    this.animFrame = requestAnimationFrame(() => this.renderLoop());
  },

  render() {
    const ctx = this.ctx;
    const W = this.W;
    const H = this.H;

    // Background - dark table
    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, W, H);

    // Table border
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // Center line
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center circle
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 50, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Goals
    const goalLeft = (W - this.GOAL_W) / 2;
    const goalRight = (W + this.GOAL_W) / 2;

    // Top goal (opponent)
    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.fillRect(goalLeft, 0, this.GOAL_W, 4);
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 10;
    ctx.fillRect(goalLeft, 0, this.GOAL_W, 2);
    ctx.shadowBlur = 0;

    // Bottom goal (self)
    ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
    ctx.fillRect(goalLeft, H - 4, this.GOAL_W, 4);
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 10;
    ctx.fillRect(goalLeft, H - 2, this.GOAL_W, 2);
    ctx.shadowBlur = 0;

    if (!this.lastState) {
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for game...', W / 2, H / 2);
      return;
    }

    const s = this.lastState;

    // Draw puck
    ctx.fillStyle = '#f4f4f5';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(s.puck.x, s.puck.y, this.PUCK_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Puck inner ring
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.puck.x, s.puck.y, this.PUCK_R * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // Self mallet (bottom) - cyan
    ctx.fillStyle = '#22d3ee';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(s.mallets.self.x, s.mallets.self.y, this.MALLET_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Self mallet inner ring
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.arc(s.mallets.self.x, s.mallets.self.y, this.MALLET_R * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Opponent mallet (top) - purple
    ctx.fillStyle = '#a855f7';
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(s.mallets.opponent.x, s.mallets.opponent.y, this.MALLET_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Opponent mallet inner ring
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.arc(s.mallets.opponent.x, s.mallets.opponent.y, this.MALLET_R * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Paused indicator
    if (s.paused) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '600 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Get Ready', W / 2, H / 2);
    }
  },

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.canvas.removeEventListener('mousemove', this._mousemove);
    this.canvas.removeEventListener('touchstart', this._touchmove);
    this.canvas.removeEventListener('touchmove', this._touchmove);
    window.removeEventListener('resize', this._resizeHandler);
    this.lastState = null;
  }
};

})();
