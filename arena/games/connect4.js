(function() {
'use strict';

window.ArenaGames = window.ArenaGames || {};

window.ArenaGames.connect4 = {
  canvas: null,
  ctx: null,
  lastState: null,
  animFrame: null,
  W: 560,
  H: 560,
  CELL: 80,
  COLS: 7,
  ROWS: 6,
  HEADER: 80, // space above board for turn indicator
  hoverCol: -1,

  init() {
    this.canvas = window.ArenaClient.getCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.W = this.COLS * this.CELL;
    this.H = this.ROWS * this.CELL + this.HEADER;
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.lastState = null;
    this.hoverCol = -1;
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
    this.displayW = w;
    this.displayH = h;
  },

  bindInput() {
    const self = this;

    this._mousemove = (e) => {
      const rect = self.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * self.W;
      self.hoverCol = Math.floor(x / self.CELL);
      if (self.hoverCol < 0 || self.hoverCol >= self.COLS) self.hoverCol = -1;
    };

    this._click = (e) => {
      e.preventDefault();
      const rect = self.canvas.getBoundingClientRect();
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const x = (clientX - rect.left) / rect.width * self.W;
      const col = Math.floor(x / self.CELL);
      if (col >= 0 && col < self.COLS) {
        window.ArenaClient.sendInput({ column: col });
      }
    };

    this._mouseleave = () => {
      self.hoverCol = -1;
    };

    this.canvas.addEventListener('mousemove', this._mousemove);
    this.canvas.addEventListener('click', this._click);
    this.canvas.addEventListener('touchstart', this._click, { passive: false });
    this.canvas.addEventListener('mouseleave', this._mouseleave);
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
    const CELL = this.CELL;
    const HEADER = this.HEADER;
    const COLS = this.COLS;
    const ROWS = this.ROWS;

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
    const board = s.board;
    const myPiece = s.myPiece;

    // Board background
    ctx.fillStyle = '#0f1729';
    this.roundRect(ctx, 0, HEADER, W, H - HEADER, 12);
    ctx.fill();

    // Board border
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    this.roundRect(ctx, 0, HEADER, W, H - HEADER, 12);
    ctx.stroke();

    // Hover column highlight
    if (this.hoverCol >= 0 && s.phase === 'playing' && s.isMyTurn) {
      ctx.fillStyle = 'rgba(34, 211, 238, 0.06)';
      ctx.fillRect(this.hoverCol * CELL, HEADER, CELL, H - HEADER);

      // Preview piece at top
      const previewX = this.hoverCol * CELL + CELL / 2;
      ctx.fillStyle = 'rgba(34, 211, 238, 0.3)';
      ctx.beginPath();
      ctx.arc(previewX, HEADER / 2, CELL * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw grid and pieces
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const cx = c * CELL + CELL / 2;
        const cy = r * CELL + CELL / 2 + HEADER;
        const piece = board[c][r];

        // Cell hole
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(cx, cy, CELL * 0.38, 0, Math.PI * 2);
        ctx.fill();

        if (piece !== 0) {
          const isMine = piece === myPiece;
          const color = isMine ? '#22d3ee' : '#a855f7';

          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(cx, cy, CELL * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Inner highlight
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.beginPath();
          ctx.arc(cx - CELL * 0.08, cy - CELL * 0.08, CELL * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let c = 1; c < COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL, HEADER);
      ctx.lineTo(c * CELL, H);
      ctx.stroke();
    }
    for (let r = 1; r < ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL + HEADER);
      ctx.lineTo(W, r * CELL + HEADER);
      ctx.stroke();
    }

    // Win line highlight
    if (s.winLine && s.phase === 'won') {
      ctx.strokeStyle = '#f4f4f5';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      // Sort win line for consistent drawing
      const sorted = [...s.winLine].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      ctx.beginPath();
      ctx.moveTo(first[0] * CELL + CELL / 2, first[1] * CELL + CELL / 2 + HEADER);
      ctx.lineTo(last[0] * CELL + CELL / 2, last[1] * CELL + CELL / 2 + HEADER);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.lineCap = 'butt';
    }

    // Turn indicator / status at top
    ctx.textAlign = 'center';
    if (s.phase === 'playing') {
      if (s.isMyTurn) {
        ctx.fillStyle = '#22d3ee';
        ctx.font = '700 18px Inter, sans-serif';
        ctx.fillText('Your turn', W / 2, HEADER / 2 + 6);
      } else {
        ctx.fillStyle = '#a855f7';
        ctx.font = '700 18px Inter, sans-serif';
        ctx.fillText("Opponent's turn", W / 2, HEADER / 2 + 6);
      }
    } else if (s.phase === 'won') {
      const isSelf = s.lastWinner === 'self';
      ctx.fillStyle = isSelf ? '#22d3ee' : '#a855f7';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 12;
      ctx.font = '900 22px Inter, sans-serif';
      ctx.fillText(isSelf ? 'You win this round!' : 'Opponent wins!', W / 2, HEADER / 2 + 6);
      ctx.shadowBlur = 0;
    } else if (s.phase === 'draw') {
      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 22px Inter, sans-serif';
      ctx.fillText('Draw!', W / 2, HEADER / 2 + 6);
    }

    // Round number (small, top-left)
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '600 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Round ' + s.round, 12, 20);
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
    this.canvas.removeEventListener('mousemove', this._mousemove);
    this.canvas.removeEventListener('click', this._click);
    this.canvas.removeEventListener('touchstart', this._click);
    this.canvas.removeEventListener('mouseleave', this._mouseleave);
    window.removeEventListener('resize', this._resizeHandler);
    this.lastState = null;
  }
};

})();
