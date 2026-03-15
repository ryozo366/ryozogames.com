(function() {
'use strict';

window.ArenaGames = window.ArenaGames || {};

window.ArenaGames.pong = {
  canvas: null,
  ctx: null,
  lastState: null,
  animFrame: null,
  inputDirection: 0,
  W: 800,
  H: 500,

  init() {
    this.canvas = window.ArenaClient.getCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.lastState = null;
    this.inputDirection = 0;
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
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { self.setDirection(-1); e.preventDefault(); }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { self.setDirection(1); e.preventDefault(); }
    };
    this._keyup = (e) => {
      if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(e.key)) {
        self.setDirection(0);
      }
    };
    document.addEventListener('keydown', this._keydown);
    document.addEventListener('keyup', this._keyup);

    // Touch controls
    this._touchstart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = self.canvas.getBoundingClientRect();
      const relY = (touch.clientY - rect.top) / rect.height;
      self.setDirection(relY < 0.5 ? -1 : 1);
    };
    this._touchend = (e) => {
      e.preventDefault();
      self.setDirection(0);
    };
    this.canvas.addEventListener('touchstart', this._touchstart, { passive: false });
    this.canvas.addEventListener('touchmove', this._touchstart, { passive: false });
    this.canvas.addEventListener('touchend', this._touchend, { passive: false });
  },

  setDirection(dir) {
    if (dir !== this.inputDirection) {
      this.inputDirection = dir;
      window.ArenaClient.sendInput({ direction: dir });
    }
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
    const isHost = window.ArenaClient.isHost();

    // Background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, W, H);

    // Center line
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    if (!this.lastState) {
      // Waiting for first state
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for game...', W / 2, H / 2);
      return;
    }

    const s = this.lastState;
    const ball = s.ball;
    const paddles = s.paddles;

    // Determine which side we are
    let selfPaddle, oppPaddle, selfX, oppX;
    if (isHost) {
      selfPaddle = paddles.left;
      oppPaddle = paddles.right;
      selfX = 24;
      oppX = W - 36;
    } else {
      selfPaddle = paddles.right;
      oppPaddle = paddles.left;
      selfX = W - 36;
      oppX = 24;
    }

    // Draw paddles
    const PADDLE_W = 12;
    const PADDLE_H = 80;

    // Self paddle - cyan
    ctx.fillStyle = '#22d3ee';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 12;
    ctx.fillRect(selfX, selfPaddle.y, PADDLE_W, PADDLE_H);
    ctx.shadowBlur = 0;

    // Opponent paddle - purple
    ctx.fillStyle = '#a855f7';
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 12;
    ctx.fillRect(oppX, oppPaddle.y, PADDLE_W, PADDLE_H);
    ctx.shadowBlur = 0;

    // Ball
    ctx.fillStyle = '#f4f4f5';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ball trail (subtle)
    ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
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
    document.removeEventListener('keydown', this._keydown);
    document.removeEventListener('keyup', this._keyup);
    this.canvas.removeEventListener('touchstart', this._touchstart);
    this.canvas.removeEventListener('touchmove', this._touchstart);
    this.canvas.removeEventListener('touchend', this._touchend);
    window.removeEventListener('resize', this._resizeHandler);
    this.lastState = null;
  }
};

})();
