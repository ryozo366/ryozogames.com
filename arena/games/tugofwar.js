(function() {
'use strict';

window.ArenaGames = window.ArenaGames || {};

window.ArenaGames.tugofwar = {
  canvas: null,
  ctx: null,
  lastState: null,
  animFrame: null,
  W: 700,
  H: 400,
  lastTapTime: 0,

  init() {
    this.canvas = window.ArenaClient.getCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.lastState = null;
    this.lastTapTime = 0;
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

    this._keydown = (e) => {
      if (e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
          e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        self.sendTap();
      }
    };

    this._click = (e) => {
      e.preventDefault();
      self.sendTap();
    };

    document.addEventListener('keydown', this._keydown);
    this.canvas.addEventListener('click', this._click);
    this.canvas.addEventListener('touchstart', this._click, { passive: false });
  },

  sendTap() {
    const now = Date.now();
    if (now - this.lastTapTime < 50) return; // 20 taps/s max
    this.lastTapTime = now;
    window.ArenaClient.sendInput({ action: 'tap' });
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
    const pos = s.position; // 0 = you winning, 1 = opponent winning

    // Bar track
    const barY = H / 2;
    const barH = 40;
    const trackLeft = 60;
    const trackRight = W - 60;
    const trackW = trackRight - trackLeft;

    // Track background
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    this.roundRect(ctx, trackLeft, barY - barH / 2, trackW, barH, 8);
    ctx.fill();

    // Track border
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, trackLeft, barY - barH / 2, trackW, barH, 8);
    ctx.stroke();

    // Win zones
    const zoneW = trackW * 0.05;
    // Left zone (your win zone) - cyan
    ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
    ctx.fillRect(trackLeft, barY - barH / 2, zoneW, barH);
    // Right zone (opponent win zone) - purple
    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.fillRect(trackRight - zoneW, barY - barH / 2, zoneW, barH);

    // Center marker
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(trackLeft + trackW / 2, barY - barH / 2 - 10);
    ctx.lineTo(trackLeft + trackW / 2, barY + barH / 2 + 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Filled bar - left side (your progress = cyan)
    const markerX = trackLeft + pos * trackW;
    const filledW = markerX - trackLeft;

    // Cyan fill (your side)
    if (filledW > 0) {
      const grad = ctx.createLinearGradient(trackLeft, 0, markerX, 0);
      grad.addColorStop(0, 'rgba(34, 211, 238, 0.6)');
      grad.addColorStop(1, 'rgba(34, 211, 238, 0.2)');
      ctx.fillStyle = grad;
      ctx.fillRect(trackLeft, barY - barH / 2 + 1, filledW, barH - 2);
    }

    // Purple fill (opponent side)
    const rightW = trackRight - markerX;
    if (rightW > 0) {
      const grad = ctx.createLinearGradient(markerX, 0, trackRight, 0);
      grad.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
      grad.addColorStop(1, 'rgba(168, 85, 247, 0.6)');
      ctx.fillStyle = grad;
      ctx.fillRect(markerX, barY - barH / 2 + 1, rightW, barH - 2);
    }

    // Marker/handle
    const markerW = 12;
    const markerH = barH + 16;
    ctx.fillStyle = '#f4f4f5';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    this.roundRect(ctx, markerX - markerW / 2, barY - markerH / 2, markerW, markerH, 4);
    ctx.fill();
    ctx.shadowBlur = 0;

    // "MASH!" instruction
    if (s.phase === 'playing') {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.font = '600 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MASH Space / Click / Tap!', W / 2, H - 40);

      // Tap intensity indicators
      // Self (left)
      const selfIntensity = Math.min(1, (s.selfTaps || 0) / 8);
      if (selfIntensity > 0) {
        ctx.fillStyle = `rgba(34, 211, 238, ${selfIntensity * 0.4})`;
        ctx.font = '900 24px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('>>>', 14, barY + 4);
      }
      // Opponent (right)
      const oppIntensity = Math.min(1, (s.oppTaps || 0) / 8);
      if (oppIntensity > 0) {
        ctx.fillStyle = `rgba(168, 85, 247, ${oppIntensity * 0.4})`;
        ctx.font = '900 24px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('<<<', W - 14, barY + 4);
      }
    }

    if (s.phase === 'scored') {
      const isSelf = s.lastScorer === 'self';
      const color = isSelf ? '#22d3ee' : '#a855f7';
      const text = isSelf ? 'You scored!' : 'Opponent scored!';

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.font = '900 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, W / 2, barY - 60);
      ctx.shadowBlur = 0;
    }

    // Side labels
    ctx.font = '700 14px Inter, sans-serif';
    ctx.fillStyle = '#22d3ee';
    ctx.textAlign = 'left';
    ctx.fillText('YOU', trackLeft, barY - barH / 2 - 14);
    ctx.fillStyle = '#a855f7';
    ctx.textAlign = 'right';
    ctx.fillText('OPP', trackRight, barY - barH / 2 - 14);

    // Round indicator
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '600 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Round ' + s.round, W / 2, 30);
  },

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  },

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    document.removeEventListener('keydown', this._keydown);
    this.canvas.removeEventListener('click', this._click);
    this.canvas.removeEventListener('touchstart', this._click);
    window.removeEventListener('resize', this._resizeHandler);
    this.lastState = null;
  }
};

})();
