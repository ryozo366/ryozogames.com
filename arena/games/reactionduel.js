(function() {
'use strict';

window.ArenaGames = window.ArenaGames || {};

window.ArenaGames.reactionduel = {
  canvas: null,
  ctx: null,
  lastState: null,
  animFrame: null,
  W: 600,
  H: 600,

  init() {
    this.canvas = window.ArenaClient.getCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.lastState = null;
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
    let w = maxW;
    let h = w / aspect;
    if (h > maxH) { h = maxH; w = h * aspect; }
    this.canvas.style.width = Math.floor(w) + 'px';
    this.canvas.style.height = Math.floor(h) + 'px';
  },

  bindInput() {
    const self = this;

    // Click/tap anywhere = reaction input
    this._click = (e) => {
      e.preventDefault();
      window.ArenaClient.sendInput({ action: 'click' });
    };

    this._keydown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        window.ArenaClient.sendInput({ action: 'click' });
      }
    };

    this.canvas.addEventListener('click', this._click);
    this.canvas.addEventListener('touchstart', this._click, { passive: false });
    document.addEventListener('keydown', this._keydown);
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

    // Background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, W, H);

    if (!this.lastState) {
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for game...', W / 2, H / 2);
      return;
    }

    const s = this.lastState;

    // Draw crosshair grid lines (subtle background)
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const x = (W / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const y = (H / 6) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    if (s.phase === 'waiting') {
      // Waiting for target
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.font = '600 20px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Wait for the target...', W / 2, H / 2 - 20);

      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('Click / Tap / Space when it appears', W / 2, H / 2 + 20);

      // Pulsing border to show "waiting"
      const pulse = 0.3 + Math.sin(Date.now() / 500) * 0.15;
      ctx.strokeStyle = `rgba(255, 200, 50, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, W - 8, H - 8);
    }

    if (s.phase === 'target' && s.target) {
      // Draw target - neon crosshair
      const t = s.target;
      const r = s.targetR || 40;
      const pulse = 1 + Math.sin(Date.now() / 100) * 0.15;

      // Outer glow ring
      ctx.strokeStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(t.x, t.y, r * pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Inner ring
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(t.x, t.y, r * 0.5 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Crosshair lines
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      const ext = r * 1.5;
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(t.x - ext, t.y);
      ctx.lineTo(t.x - r * 0.7, t.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(t.x + r * 0.7, t.y);
      ctx.lineTo(t.x + ext, t.y);
      ctx.stroke();
      // Vertical
      ctx.beginPath();
      ctx.moveTo(t.x, t.y - ext);
      ctx.lineTo(t.x, t.y - r * 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(t.x, t.y + r * 0.7);
      ctx.lineTo(t.x, t.y + ext);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = '#ff3366';
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // "CLICK!" text
      ctx.fillStyle = '#22d3ee';
      ctx.font = '900 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CLICK!', W / 2, H - 40);
    }

    if (s.phase === 'scored') {
      // Show who scored
      const isSelf = s.lastScorer === 'self';
      const color = isSelf ? '#22d3ee' : '#a855f7';
      const text = s.falseStart
        ? (isSelf ? 'Opponent false start! +1' : 'False start! -1')
        : (isSelf ? 'You got it! +1' : 'Opponent was faster!');

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.font = '900 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, W / 2, H / 2);
      ctx.shadowBlur = 0;

      // Show target position if it existed
      if (s.target && !s.falseStart) {
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.target.x, s.target.y, (s.targetR || 40), 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Round indicator
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '600 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Round ' + s.round, W / 2, 30);

    // Score display at top
    if (s.scores) {
      ctx.font = '900 18px Inter, sans-serif';
      // Self score (left)
      ctx.fillStyle = '#22d3ee';
      ctx.textAlign = 'left';
      ctx.fillText(s.scores.self, 20, 30);
      // Opponent score (right)
      ctx.fillStyle = '#a855f7';
      ctx.textAlign = 'right';
      ctx.fillText(s.scores.opponent, W - 20, 30);
    }
  },

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.canvas.removeEventListener('click', this._click);
    this.canvas.removeEventListener('touchstart', this._click);
    document.removeEventListener('keydown', this._keydown);
    window.removeEventListener('resize', this._resizeHandler);
    this.lastState = null;
  }
};

})();
