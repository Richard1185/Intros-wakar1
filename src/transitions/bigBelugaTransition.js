export const bigBelugaTransition = {
  id: "big_beluga",
  name: "BigBeluga SMC",
  category: "Education",
  icon: "🐋",
  description: "Smart Money Concepts — BigBeluga style",
  duration: 9000,
  color: "#00ffff",
  tags: ["smc", "bigbeluga", "education", "ict"],
  params: [
    { id: "scene", label: "Escena", type: "select", default: 0, options: ["0", "1", "2", "3", "4"] },
    { id: "showGrid", label: "Grid", type: "toggle", default: true },
  ],
};

// ── Deterministic RNG ──────────────────────────
function mkRng(seed) { let s = seed; return () => { s = ((s * 1664525) + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; }; }

// ── Generate candles ───────────────────────────
function mkCandles(n, seed, trendBias = 0) {
  const rng = mkRng(seed);
  let p = 100, cs = [];
  for (let i = 0; i < n; i++) {
    const chg = (rng() - 0.48 + trendBias * 0.03) * 2.8;
    const o = p, cl = p + chg;
    const wick1 = rng() * 1.4, wick2 = rng() * 1.4;
    const hi = Math.max(o, cl) + wick1, lo = Math.min(o, cl) - wick2;
    const vol = 3000 + rng() * 12000;
    cs.push({ o, c: cl, h: hi, l: lo, v: vol });
    p = cl;
  }
  return cs;
}

// ── ATR ────────────────────────────────────────
function getATR(cs, per = 14) {
  const a = new Array(cs.length).fill(0);
  for (let i = 0; i < cs.length; i++) {
    const c = cs[i];
    const tr = i === 0 ? c.h - c.l : Math.max(c.h - c.l, Math.abs(c.h - cs[i - 1].c), Math.abs(c.l - cs[i - 1].c));
    a[i] = i === 0 ? tr : (a[i - 1] * (per - 1) + tr) / per;
  }
  return a;
}

// ── Utilities ──────────────────────────────────
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function eOut(t) { return 1 - (1 - clamp(t, 0, 1)) * (1 - clamp(t, 0, 1)); }
function iR(t, s, e) { return t < s ? 0 : t >= e ? 1 : (t - s) / (e - s); }

function reg(W, H) { return { rx: W * 0.07, ry: H * 0.1, rw: W * 0.86, rh: H * 0.72 }; }
function mapX(i, n, rx, rw) { return rx + rw * (i / (n - 1)); }
function mapY(v, mn, mx, ry, rh) { return ry + rh * (1 - (v - mn) / (mx - mn || 1)); }
function minmax(cs) { return { mn: Math.min(...cs.map(c => c.l)), mx: Math.max(...cs.map(c => c.h)) }; }

// ── Draw: candles ──────────────────────────────
function drawCandles(ctx, cs, mn, mx, { rx, ry, rw, rh }, alpha = 1, upTo = null, highlightIdx = -1) {
  const n = cs.length;
  const cnt = upTo !== null ? upTo : n;
  const bw = Math.max(2, (rw / n) * 0.65);
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = 0; i < cnt; i++) {
    const c = cs[i];
    const bull = c.c >= c.o;
    const col = bull ? '#089981' : '#f23645';
    const x = mapX(i, n, rx, rw);
    const hy = mapY(c.h, mn, mx, ry, rh), ly = mapY(c.l, mn, mx, ry, rh);
    const oy = mapY(c.o, mn, mx, ry, rh), cy = mapY(c.c, mn, mx, ry, rh);
    ctx.strokeStyle = col; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(x, hy); ctx.lineTo(x, ly); ctx.stroke();
    ctx.fillStyle = col;
    const by = Math.min(oy, cy), bh = Math.max(1.5, Math.abs(cy - oy));
    ctx.fillRect(x - bw / 2, by, bw, bh);
    if (i === highlightIdx) {
      ctx.strokeStyle = 'rgba(0,255,255,0.9)'; ctx.lineWidth = 1.5;
      ctx.strokeRect(x - bw / 2 - 2, by - 2, bw + 4, bh + 4);
    }
  }
  ctx.restore();
}

// ── Grid ───────────────────────────────────────
function drawGrid(ctx, W, H, a = 0.06) {
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.5;
  for (let i = 0; i <= 12; i++) { const x = W * i / 12; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let j = 0; j <= 8; j++) { const y = H * j / 8; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();
}

function hline(ctx, W, y, col, a, dash = [], lw = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = lw;
  ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
}

function drawStructureLabel(ctx, txt, x1, x2, y, col, a, sz = 16) {
  const mx = (x1 + x2) / 2;
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = col; ctx.lineWidth = 2.0;
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
  ctx.fillStyle = col; ctx.font = `bold ${sz}px system-ui, -apple-system, sans-serif`; ctx.textAlign = 'center';
  ctx.fillText(txt, mx, y - 8);
  ctx.beginPath(); ctx.arc(x2, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = col; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.0; ctx.stroke();
  ctx.restore();
}

function drawOB(ctx, x1, x2, yTop, yBot, col, alpha) {
  const h = Math.abs(yBot - yTop), yt = Math.min(yTop, yBot);
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = col; ctx.globalAlpha = alpha * 0.12;
  ctx.fillRect(x1, yt, x2 - x1, h);
  ctx.globalAlpha = alpha * 0.55; ctx.strokeStyle = col; ctx.lineWidth = 1;
  ctx.strokeRect(x1, yt, x2 - x1, h);
  const mid = yt + h / 2;
  ctx.globalAlpha = alpha * 0.07;
  ctx.fillStyle = col; ctx.fillRect(x1, yt, x2 - x1, h / 2);
  ctx.fillStyle = col === '#089981' ? '#f23645' : '#089981';
  ctx.fillRect(x1, mid, x2 - x1, h / 2);
  ctx.globalAlpha = alpha * 0.4; ctx.strokeStyle = col; ctx.lineWidth = 0.8;
  ctx.setLineDash([3, 4]);
  ctx.beginPath(); ctx.moveTo(x1, mid); ctx.lineTo(x2, mid); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
}

function obLabel(ctx, txt, x, y, col, a) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = 'bold 9px Arial'; ctx.textAlign = 'left';
  const tw = ctx.measureText(txt).width;
  ctx.fillStyle = 'rgba(4,13,26,0.82)';
  ctx.strokeStyle = col; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.roundRect(x, y - 13, tw + 12, 16, 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, x + 6, y);
  ctx.restore();
}

function volBadge(ctx, txt, x, y, col, a) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = 'bold 8px Arial'; ctx.fillStyle = col; ctx.textAlign = 'left';
  ctx.fillText(txt, x + 4, y + 11);
  ctx.restore();
}

function drawVolBars(ctx, cs, mn, mx, { rx, ry, rw, rh }, a, cnt) {
  const n = cs.length, bw = Math.max(2, (rw / n) * 0.65);
  const maxV = Math.max(...cs.slice(0, cnt).map(c => c.v));
  ctx.save(); ctx.globalAlpha = a * 0.35;
  for (let i = 0; i < cnt; i++) {
    const c = cs[i];
    const x = mapX(i, n, rx, rw);
    const barH = (c.v / maxV) * rh * 0.12;
    ctx.fillStyle = c.c >= c.o ? '#089981' : '#f23645';
    ctx.fillRect(x - bw / 2, ry + rh - barH, bw, barH);
  }
  ctx.restore();
}

function drawFVG(ctx, x1, x2, yTop, yBot, col, a) {
  const yt = Math.min(yTop, yBot), h = Math.abs(yBot - yTop);
  ctx.save();
  ctx.fillStyle = col; ctx.globalAlpha = a * 0.1;
  ctx.fillRect(x1, yt, x2 - x1, h);
  ctx.strokeStyle = col; ctx.globalAlpha = a * 0.45; ctx.lineWidth = 0.5;
  ctx.strokeRect(x1, yt, x2 - x1, h);
  const my = yt + h / 2;
  ctx.globalAlpha = a * 0.3; ctx.strokeStyle = col; ctx.lineWidth = 0.7;
  ctx.setLineDash([1, 3]);
  ctx.beginPath(); ctx.moveTo(x1, my); ctx.lineTo(x2, my); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function fvgLabel(ctx, txt, x, y, col, a) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = 'bold 8px Arial'; ctx.textAlign = 'left';
  const tw = ctx.measureText(txt).width;
  ctx.fillStyle = 'rgba(4,13,26,0.8)'; ctx.strokeStyle = col; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.roundRect(x, y - 11, tw + 10, 14, 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, x + 5, y);
  ctx.restore();
}

function drawSweep(ctx, x, wickY, lineY, col, a) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = col; ctx.lineWidth = 2;
  ctx.shadowColor = col; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.moveTo(x, lineY); ctx.lineTo(x, wickY); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = a * 0.6; ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(x - 40, lineY); ctx.lineTo(x + 40, lineY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawMapping(ctx, pts, col, a) {
  if (pts.length < 2) return;
  ctx.save(); ctx.globalAlpha = a * 0.6; ctx.strokeStyle = col; ctx.lineWidth = 1;
  ctx.setLineDash([6, 3]); ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke(); ctx.setLineDash([]);
  ctx.globalAlpha = a * 0.5;
  pts.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); });
  ctx.restore();
}

function scanLine(ctx, W, H, y, a, col = '#00ffff') {
  ctx.save(); ctx.globalAlpha = a * 0.6;
  const g = ctx.createLinearGradient(0, y - H * 0.04, 0, y + H * 0.04);
  g.addColorStop(0, 'transparent'); g.addColorStop(0.5, col + '55'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.fillRect(0, y - H * 0.04, W, H * 0.08);
  ctx.globalAlpha = a * 0.7; ctx.strokeStyle = col; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  ctx.restore();
}

function glitch(ctx, W, H, a) {
  if (a < 0.01) return; ctx.save(); ctx.globalAlpha = a * 0.5;
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#00ffff' : '#f23645';
    ctx.fillRect(Math.random() * W, Math.random() * H, 20 + Math.random() * 100, 1 + Math.random() * 3);
  }
  ctx.restore();
}

function flashWipe(ctx, W, H, a, col = 'rgba(0,255,255,') {
  if (a < 0.01) return;
  ctx.fillStyle = col + a * 0.22 + ')'; ctx.fillRect(0, 0, W, H);
}

function infoPanel(ctx, lines, x, y, w, h, a) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(14,21,36,0.92)'; ctx.strokeStyle = 'rgba(0,255,255,0.22)'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.roundRect(x, y, w, h + 30, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(8,153,129,0.12)';
  ctx.beginPath(); ctx.roundRect(x, y, w, 32, 6); ctx.fill();
  lines.forEach((l, i) => {
    ctx.fillStyle = l.col || 'rgba(220,229,255,0.75)';
    // Escalamos las fuentes que antes eran muy pequeñas (de 9px a 14px, de 10px a 16px)
    const size = l.sz ? (l.sz === 10 ? 16 : 13) : 14;
    ctx.font = (l.bold ? 'bold ' : '') + `${size}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'left'; ctx.fillText(l.t, x + 14, y + 24 + i * 22);
  });
  ctx.restore();
}

// ═══════════════════════════════════════════════════
// SCENE 1 — ORDER BLOCK
// ═══════════════════════════════════════════════════
function sceneOB(ctx, W, H, t, showGrid) {
  ctx.fillStyle = '#040d1a'; ctx.fillRect(0, 0, W, H);
  if (showGrid) drawGrid(ctx, W, H);
  const D = 9000, R = reg(W, H);
  const cs = mkCandles(50, 7, 0.3);
  const atr = getATR(cs);
  const { mn, mx } = minmax(cs);
  const PAD = 3; const mn2 = mn - PAD, mx2 = mx + PAD;
  const n = cs.length;
  const bw = R.rw / n;

  const cA = eOut(iR(t, 0, 2200));
  const cnt = Math.ceil(cA * n);
  drawCandles(ctx, cs, mn2, mx2, R, Math.min(cA * 1.4, 0.88), cnt);
  drawVolBars(ctx, cs, mn2, mx2, R, cA, cnt);

  const obIdx = 12;
  const ob = cs[obIdx];
  const obAtr = atr[obIdx];
  const sizeLimit = obAtr;
  const obTop = Math.min(ob.h, ob.l + sizeLimit);
  const obBtm = ob.l;
  const ox1 = mapX(obIdx, n, R.rx, R.rw) - bw * 0.35;
  const ox2 = mapX(n - 1, n, R.rx, R.rw) + bw * 0.5;
  const oy1 = mapY(obTop, mn2, mx2, R.ry, R.rh);
  const oy2 = mapY(obBtm, mn2, mx2, R.ry, R.rh);
  const oyMid = mapY((obTop + obBtm) / 2, mn2, mx2, R.ry, R.rh);

  const obA = eOut(iR(t, 1800, 3200));
  if (obA > 0.02) {
    drawOB(ctx, ox1, ox2, oy1, oy2, '#089981', obA);
    obLabel(ctx, 'OB  ·  Bullish', ox1 + 4, oy1 + 14, '#089981', obA);
    volBadge(ctx, `V: ${Math.round(ob.v / 1000)}K`, ox1, oy2 - 18, '#089981', obA * 0.7);
  }

  const mitX = mapX(n - 4, n, R.rx, R.rw);
  const startY = mapY(cs[n - 4].c, mn2, mx2, R.ry, R.rh);
  const mitA = eOut(iR(t, 3200, 5000));
  if (mitA > 0.02) {
    ctx.save(); ctx.globalAlpha = mitA; ctx.strokeStyle = 'rgba(239,159,39,0.8)'; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(mitX, startY - H * 0.06); ctx.lineTo(mitX, oy2 + 4); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#EF9F27';
    ctx.beginPath(); ctx.moveTo(mitX, oy2 + 4); ctx.lineTo(mitX - 5, oy2 - 8); ctx.lineTo(mitX + 5, oy2 - 8); ctx.closePath(); ctx.fill();
    ctx.restore();
    obLabel(ctx, 'MITIGATION  →  OB', mitX - 80, oy2 - 22, '#EF9F27', mitA * 0.9);
  }

  const rxA = eOut(iR(t, 5000, 7000)) * (1 - eOut(iR(t, 8000, 9000)));
  if (rxA > 0.02) {
    ctx.save(); ctx.globalAlpha = rxA; ctx.strokeStyle = '#089981'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(mitX, oy2); ctx.lineTo(mitX, oy2 - H * 0.28); ctx.stroke();
    ctx.fillStyle = '#089981';
    ctx.beginPath(); ctx.moveTo(mitX, oy2 - H * 0.28); ctx.lineTo(mitX - 6, oy2 - H * 0.28 + 10); ctx.lineTo(mitX + 6, oy2 - H * 0.28 + 10); ctx.closePath(); ctx.fill();
    ctx.restore();
    obLabel(ctx, 'REACTION  ↑  Institutional', mitX + 12, oy2 - H * 0.18, '#089981', rxA);
  }

  const ipA = eOut(iR(t, 4500, 6500)) * (1 - eOut(iR(t, 8000, 9000)));
  infoPanel(ctx, [
    { t: 'ORDER BLOCK  (Bullish)', col: '#00ffff', bold: true, sz: 10 },
    { t: 'Última vela bajista antes del', col: 'rgba(220,229,255,0.6)' },
    { t: 'impulso institucional alcista.', col: 'rgba(220,229,255,0.6)' },
    { t: 'Mitigation: precio regresa al OB', col: 'rgba(220,229,255,0.45)', sz: 8 },
    { t: 'y rebota. Zona de demanda activa.', col: 'rgba(220,229,255,0.45)', sz: 8 },
  ], W * 0.68, H * 0.12, W * 0.28, H * 0.3, ipA);

  scanLine(ctx, W, H, H * 0.1 + H * 0.7 * (t / D), eOut(iR(t, 0, 8500)) * 0.5);
  flashWipe(ctx, W, H, eOut(iR(t, 8600, 9000)));
  glitch(ctx, W, H, eOut(iR(t, 8400, 8800)) * 0.8);
}

// ═══════════════════════════════════════════════════
// SCENE 2 — FVG
// ═══════════════════════════════════════════════════
function sceneFVG(ctx, W, H, t, showGrid) {
  ctx.fillStyle = '#040d1a'; ctx.fillRect(0, 0, W, H);
  if (showGrid) drawGrid(ctx, W, H, 0.05);
  const D = 9000, R = reg(W, H);
  const cs = mkCandles(55, 13, 0.2);
  const atr = getATR(cs);
  const { mn, mx } = minmax(cs);
  const mn2 = mn - 3, mx2 = mx + 3, n = cs.length;
  const bw = R.rw / n;

  const cA = eOut(iR(t, 0, 2000));
  const cnt = Math.ceil(cA * n);
  drawCandles(ctx, cs, mn2, mx2, R, Math.min(cA * 1.4, 0.88), cnt);
  drawVolBars(ctx, cs, mn2, mx2, R, cA, cnt);

  let fvgIdx = -1;
  for (let i = 4; i < n; i++) {
    if (cs[i].l > cs[i - 2].h + atr[i] * 0.05) { fvgIdx = i; break; }
  }
  if (fvgIdx < 0) {
    fvgIdx = 18;
    cs[fvgIdx].l = cs[fvgIdx - 2].h + atr[fvgIdx] * 0.4;
    cs[fvgIdx].c = Math.max(cs[fvgIdx].c, cs[fvgIdx].l + 0.5);
    cs[fvgIdx].h = Math.max(cs[fvgIdx].h, cs[fvgIdx].c + 0.3);
  }

  let fvgBearIdx = -1;
  for (let i = fvgIdx + 6; i < n; i++) {
    if (cs[i].h < cs[i - 2].l - atr[i] * 0.05) { fvgBearIdx = i; break; }
  }
  if (fvgBearIdx < 0) {
    fvgBearIdx = Math.min(fvgIdx + 12, n - 4);
    cs[fvgBearIdx].h = cs[fvgBearIdx - 2].l - atr[fvgBearIdx] * 0.35;
    cs[fvgBearIdx].c = Math.min(cs[fvgBearIdx].c, cs[fvgBearIdx].h - 0.4);
    cs[fvgBearIdx].l = Math.min(cs[fvgBearIdx].l, cs[fvgBearIdx].c - 0.3);
  }

  const fvgLoc = fvgIdx - 1;
  const x1b = mapX(fvgLoc, n, R.rx, R.rw) - bw * 0.5;
  const x2b = mapX(n - 1, n, R.rx, R.rw) + bw * 0.5;
  const yt1 = mapY(cs[fvgIdx].l, mn2, mx2, R.ry, R.rh);
  const yb1 = mapY(cs[fvgIdx - 2].h, mn2, mx2, R.ry, R.rh);

  const fvgBullA = eOut(iR(t, 1700, 3200));
  if (fvgBullA > 0.02) {
    drawFVG(ctx, x1b, x2b, yt1, yb1, '#089981', fvgBullA);
    fvgLabel(ctx, 'FVG  ·  Bullish', x1b + 4, yt1 - 4, '#089981', fvgBullA);
    const eqY = (yt1 + yb1) / 2;
    ctx.save(); ctx.globalAlpha = fvgBullA * 0.5; ctx.strokeStyle = 'rgba(8,153,129,0.6)'; ctx.lineWidth = 0.7; ctx.setLineDash([1, 2]);
    ctx.beginPath(); ctx.moveTo(x1b, eqY); ctx.lineTo(x2b, eqY); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(8,153,129,0.6)'; ctx.font = '7px Arial'; ctx.textAlign = 'left'; ctx.fillText('EQ 50%', x1b + 4, eqY - 2);
    ctx.restore();
  }

  const fvgBearTop = cs[fvgBearIdx - 2].l;
  const fvgBearBtm = cs[fvgBearIdx].h;
  const x1br = mapX(fvgBearIdx - 1, n, R.rx, R.rw) - bw * 0.5;
  const x2br = mapX(n - 1, n, R.rx, R.rw) + bw * 0.5;
  const yt2 = mapY(fvgBearTop, mn2, mx2, R.ry, R.rh);
  const yb2 = mapY(fvgBearBtm, mn2, mx2, R.ry, R.rh);

  const fvgBearA = eOut(iR(t, 2800, 4500));
  if (fvgBearA > 0.02) {
    drawFVG(ctx, x1br, x2br, yt2, yb2, '#f23645', fvgBearA);
    fvgLabel(ctx, 'FVG  ·  Bearish', x1br + 4, yt2 + 16, '#f23645', fvgBearA);
  }

  const fillA = eOut(iR(t, 4200, 6000)) * (1 - eOut(iR(t, 8000, 9000)));
  if (fillA > 0.02) {
    const fx = mapX(Math.min(fvgLoc + 8, n - 2), n, R.rx, R.rw);
    const fy = mapY(cs[Math.min(fvgLoc + 8, n - 2)].c, mn2, mx2, R.ry, R.rh);
    ctx.save(); ctx.globalAlpha = fillA; ctx.strokeStyle = 'rgba(8,153,129,0.7)'; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, (yt1 + yb1) / 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#089981'; ctx.beginPath(); ctx.moveTo(fx, (yt1 + yb1) / 2); ctx.lineTo(fx - 4, (yt1 + yb1) / 2 + 8); ctx.lineTo(fx + 4, (yt1 + yb1) / 2 + 8); ctx.closePath(); ctx.fill();
    ctx.restore();
    fvgLabel(ctx, 'PRICE FILLS FVG', fx + 8, (yt1 + yb1) / 2 + 4, '#089981', fillA * 0.9);
  }

  const ipA = eOut(iR(t, 5000, 7000)) * (1 - eOut(iR(t, 8200, 9000)));
  infoPanel(ctx, [
    { t: 'FAIR VALUE GAP  (FVG)', col: '#00ffff', bold: true, sz: 10 },
    { t: 'Desequilibrio de 3 velas:', col: 'rgba(220,229,255,0.65)' },
    { t: 'FVG Bull: low[i] > high[i-2]', col: '#089981', sz: 8 },
    { t: 'FVG Bear: high[i] < low[i-2]', col: '#f23645', sz: 8 },
    { t: 'Precio vuelve a cubrir el gap.', col: 'rgba(220,229,255,0.45)', sz: 8 },
    { t: 'Mejor entrada: zona EQ (50%).', col: 'rgba(220,229,255,0.4)', sz: 8 },
  ], W * 0.68, H * 0.12, W * 0.28, H * 0.34, ipA);

  scanLine(ctx, W, H, H * 0.1 + H * 0.7 * (t / D), eOut(iR(t, 0, 8500)) * 0.5, '#f23645');
  flashWipe(ctx, W, H, eOut(iR(t, 8600, 9000)), 'rgba(242,54,69,');
  glitch(ctx, W, H, eOut(iR(t, 8400, 8800)) * 0.8);
}

// ═══════════════════════════════════════════════════
// SCENE 3 — BOS / CHoCH
// ═══════════════════════════════════════════════════
function sceneBOS(ctx, W, H, t, showGrid) {
  ctx.fillStyle = '#040d1a'; ctx.fillRect(0, 0, W, H);
  if (showGrid) drawGrid(ctx, W, H, 0.05);
  const D = 9000, R = reg(W, H);
  const n = 56;

  const pts = [100, 101.5, 99.8, 103.2, 101, 105.8, 103, 108.4, 106, 111.2, 108, 113.5,
    111, 115.8, 113.8, 117.2, 115, 112.8, 116, 114, 110.5, 112.8, 109, 106.8,
    108, 105, 102.5, 104, 101, 98.8, 100.2, 97.5, 99.2, 96, 97.8, 94.5];
  const cs = [];
  for (let i = 0; i < pts.length; i++) {
    const o = pts[i], c2 = pts[i + 1] || o;
    const rng = mkRng(i + 99);
    cs.push({ o, c: c2, h: Math.max(o, c2) + rng() * 0.8, l: Math.min(o, c2) - rng() * 0.8, v: 5000 + rng() * 8000 });
  }
  const mn2 = 92, mx2 = 120;
  const bw = R.rw / n;

  const cA = eOut(iR(t, 0, 2200));
  drawCandles(ctx, cs, mn2, mx2, R, Math.min(cA * 1.4, 0.88), Math.ceil(cA * cs.length));

  const pH = [{ i: 7, v: 108.4 }, { i: 11, v: 113.5 }, { i: 15, v: 117.2 }];
  const pL = [{ i: 6, v: 103 }, { i: 10, v: 108 }, { i: 14, v: 113.8 }];

  const swingA = eOut(iR(t, 1500, 3200));
  if (swingA > 0.05) {
    pH.forEach(p => {
      const x = mapX(p.i, cs.length, R.rx, R.rw);
      const y = mapY(p.v, mn2, mx2, R.ry, R.rh) - 14;
      ctx.save(); ctx.globalAlpha = swingA;
      ctx.fillStyle = 'rgba(8,153,129,0.1)'; ctx.strokeStyle = 'rgba(8,153,129,0.4)'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.roundRect(x - 18, y - 13, 44, 15, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#089981'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center';
      ctx.fillText('HH', x, y); ctx.restore();
    });
    pL.forEach(p => {
      const x = mapX(p.i, cs.length, R.rx, R.rw);
      const y = mapY(p.v, mn2, mx2, R.ry, R.rh) + 22;
      ctx.save(); ctx.globalAlpha = swingA;
      ctx.fillStyle = 'rgba(8,153,129,0.07)'; ctx.strokeStyle = 'rgba(8,153,129,0.25)'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.roundRect(x - 14, y - 13, 32, 15, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(8,153,129,0.7)'; ctx.font = '8px Arial'; ctx.textAlign = 'center';
      ctx.fillText('HL', x, y); ctx.restore();
    });
  }

  const mapA = eOut(iR(t, 2000, 4000));
  if (mapA > 0.05) {
    const pivots = [...pH, ...pL].sort((a, b) => a.i - b.i);
    const mpts = pivots.map(p => ({
      x: mapX(p.i, cs.length, R.rx, R.rw),
      y: mapY(p.v, mn2, mx2, R.ry, R.rh)
    }));
    drawMapping(ctx, mpts, '#c0c0c0', mapA);
  }

  const structures = [
    { type: 'BOS', dir: 'bullish', startI: 7, breakI: 9, price: 108.4 },
    { type: 'BOS', dir: 'bullish', startI: 11, breakI: 13, price: 113.5 },
    { type: 'CHoCH', dir: 'bearish', startI: 15, breakI: 21, price: 113.8 },
  ];

  structures.forEach((s, si) => {
    const sA = eOut(iR(t, 2500 + si * 1200, 4000 + si * 1200)) * (1 - eOut(iR(t, 8000, 9000)));
    if (sA < 0.02) return;
    const x1 = mapX(s.startI, cs.length, R.rx, R.rw);
    const x2 = mapX(s.breakI, cs.length, R.rx, R.rw);
    const y = mapY(s.price, mn2, mx2, R.ry, R.rh);
    const col = s.dir === 'bullish' ? '#089981' : '#f23645';
    drawStructureLabel(ctx, s.type, x1, x2, y, col, sA, 9);
  });

  const chochA = eOut(iR(t, 5500, 7500)) * (1 - eOut(iR(t, 8000, 9000)));
  if (chochA > 0.05) {
    [{ i: 22, v: 114.2, lbl: 'LH' }, { i: 24, v: 111, lbl: 'LH' }, { i: 28, v: 107, lbl: 'LL' }].forEach(p => {
      if (p.i >= cs.length) return;
      const x = mapX(p.i, cs.length, R.rx, R.rw);
      const y = mapY(p.v, mn2, mx2, R.ry, R.rh) + (p.lbl === 'LL' ? 20 : -14);
      ctx.save(); ctx.globalAlpha = chochA;
      ctx.fillStyle = 'rgba(242,54,69,0.1)'; ctx.strokeStyle = 'rgba(242,54,69,0.35)'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.roundRect(x - 14, y - 13, 36, 15, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f23645'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center'; ctx.fillText(p.lbl, x, y);
      ctx.restore();
    });
  }

  const ipA = eOut(iR(t, 5000, 7000)) * (1 - eOut(iR(t, 8000, 9000)));
  infoPanel(ctx, [
    { t: 'BOS  vs  CHoCH', col: '#00ffff', bold: true, sz: 10 },
    { t: 'BOS = rompe en dir. del trend.', col: '#089981', sz: 9 },
    { t: '      confirma continuación.', col: 'rgba(220,229,255,0.5)', sz: 8 },
    { t: 'CHoCH = rompe en sentido opuesto.', col: '#f23645', sz: 9 },
    { t: '         señal de cambio de trend.', col: 'rgba(220,229,255,0.5)', sz: 8 },
    { t: 'Primer CHoCH = entrada temprana.', col: 'rgba(220,229,255,0.4)', sz: 8 },
  ], W * 0.68, H * 0.11, W * 0.28, H * 0.36, ipA);

  scanLine(ctx, W, H, H * 0.1 + H * 0.7 * (t / D), eOut(iR(t, 0, 8500)) * 0.5, '#f23645');
  flashWipe(ctx, W, H, eOut(iR(t, 8600, 9000)), 'rgba(242,54,69,');
  glitch(ctx, W, H, eOut(iR(t, 8400, 8800)) * 0.8);
}

// ═══════════════════════════════════════════════════
// SCENE 4 — SWEEP
// ═══════════════════════════════════════════════════
function sceneSweep(ctx, W, H, t, showGrid) {
  ctx.fillStyle = '#040d1a'; ctx.fillRect(0, 0, W, H);
  if (showGrid) drawGrid(ctx, W, H, 0.05);
  const D = 9000, R = reg(W, H);
  const cs = mkCandles(52, 31, 0.15);
  const mn2 = Math.min(...cs.map(c => c.l)) - 3;
  const mx2 = Math.max(...cs.map(c => c.h)) + 3;
  const n = cs.length;

  const pivotHighPrice = cs[18].h;
  cs[24].h = pivotHighPrice + 1.8;
  cs[24].c = pivotHighPrice - 0.5;
  cs[24].o = pivotHighPrice - 0.2;
  const pivotLowPrice = cs[30].l;
  cs[36].l = pivotLowPrice - 1.5;
  cs[36].c = pivotLowPrice + 0.4;
  cs[36].o = pivotLowPrice + 0.2;

  const cA = eOut(iR(t, 0, 2200));
  const cnt = Math.ceil(cA * n);
  drawCandles(ctx, cs, mn2, mx2, R, Math.min(cA * 1.4, 0.88), cnt);
  drawVolBars(ctx, cs, mn2, mx2, R, cA, cnt);

  const phY = mapY(pivotHighPrice, mn2, mx2, R.ry, R.rh);
  const phA = eOut(iR(t, 1500, 3000));
  if (phA > 0.02) {
    hline(ctx, W, phY, 'rgba(239,159,39,0.7)', phA, [8, 5], 1);
    obLabel(ctx, 'EQH  ·  Buyside Liquidity', R.rx + 8, phY - 6, '#EF9F27', phA);
  }

  const swpBullA = eOut(iR(t, 2800, 4500));
  if (swpBullA > 0.02) {
    const sx = mapX(24, n, R.rx, R.rw);
    const sweepWickY = mapY(cs[24].h, mn2, mx2, R.ry, R.rh);
    drawSweep(ctx, sx, sweepWickY, phY, '#EF9F27', swpBullA);
    ctx.save(); ctx.globalAlpha = swpBullA; ctx.strokeStyle = 'rgba(239,159,39,0.7)'; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(mapX(18, n, R.rx, R.rw), phY); ctx.lineTo(sx, phY); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    obLabel(ctx, '\u26A1 SWEEP  ·  BSL Grabbed', sx + 8, sweepWickY - 8, '#EF9F27', swpBullA);
  }

  const plY = mapY(pivotLowPrice, mn2, mx2, R.ry, R.rh);
  const plA = eOut(iR(t, 4500, 6000));
  if (plA > 0.02) {
    hline(ctx, W, plY, 'rgba(242,54,69,0.7)', plA, [8, 5], 1);
    obLabel(ctx, 'EQL  ·  Sellside Liquidity', R.rx + 8, plY + 14, '#f23645', plA);
  }

  const swpBearA = eOut(iR(t, 5500, 7200));
  if (swpBearA > 0.02) {
    const sx2 = mapX(36, n, R.rx, R.rw);
    const sweepWickY2 = mapY(cs[36].l, mn2, mx2, R.ry, R.rh);
    ctx.save(); ctx.globalAlpha = swpBearA; ctx.strokeStyle = '#f23645'; ctx.lineWidth = 2;
    ctx.shadowColor = '#f23645'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(sx2, plY); ctx.lineTo(sx2, sweepWickY2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(242,54,69,0.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx2 - 40, plY); ctx.lineTo(sx2 + 40, plY); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    obLabel(ctx, '\u26A1 SWEEP  ·  SSL Grabbed', sx2 + 8, sweepWickY2 + 12, '#f23645', swpBearA);
  }

  const revA = eOut(iR(t, 6000, 8000)) * (1 - eOut(iR(t, 8300, 9000)));
  if (revA > 0.02) {
    const sx = mapX(24, n, R.rx, R.rw);
    const sy = mapY(cs[24].c, mn2, mx2, R.ry, R.rh);
    ctx.save(); ctx.globalAlpha = revA; ctx.strokeStyle = 'rgba(242,54,69,0.8)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy + H * 0.2); ctx.stroke();
    ctx.fillStyle = '#f23645'; ctx.beginPath(); ctx.moveTo(sx, sy + H * 0.2); ctx.lineTo(sx - 5, sy + H * 0.2 - 9); ctx.lineTo(sx + 5, sy + H * 0.2 - 9); ctx.closePath(); ctx.fill();
    ctx.restore();
    obLabel(ctx, 'REVERSAL  ↓  Smart Money', sx + 10, sy + H * 0.12, '#f23645', revA);
  }

  const ipA = eOut(iR(t, 5500, 7500)) * (1 - eOut(iR(t, 8200, 9000)));
  infoPanel(ctx, [
    { t: 'SWEEP  (Liquidity Grab)', col: '#00ffff', bold: true, sz: 10 },
    { t: 'Mecha cruza nivel (EQH/EQL)', col: 'rgba(220,229,255,0.6)' },
    { t: 'pero el cierre NO confirma.', col: 'rgba(220,229,255,0.6)' },
    { t: 'Smart money "barre" stops', col: 'rgba(220,229,255,0.45)', sz: 8 },
    { t: 'antes de revertir el movimiento.', col: 'rgba(220,229,255,0.45)', sz: 8 },
  ], W * 0.68, H * 0.12, W * 0.28, H * 0.3, ipA);

  scanLine(ctx, W, H, H * 0.1 + H * 0.7 * (t / D), eOut(iR(t, 0, 8500)) * 0.5, '#EF9F27');
  flashWipe(ctx, W, H, eOut(iR(t, 8600, 9000)), 'rgba(239,159,39,');
  glitch(ctx, W, H, eOut(iR(t, 8400, 8800)) * 0.8);
}

// ═══════════════════════════════════════════════════
// SCENE 5 — FULL SMC
// ═══════════════════════════════════════════════════
function sceneFull(ctx, W, H, t, showGrid) {
  const seg = 9000, si = Math.floor(t / seg), lt = t - si * seg;
  const fns = [sceneOB, sceneFVG, sceneBOS, sceneSweep];
  const titles = ['ORDER BLOCK VOLUMÉTRICO', 'FAIR VALUE GAP', 'BOS / CHoCH', 'LIQUIDITY SWEEP'];
  const cols = ['#089981', '#f23645', '#f23645', '#EF9F27'];

  if (si < 4) {
    fns[si](ctx, W, H, lt, showGrid);
    const tA = eOut(iR(lt, 0, 700)) * (1 - eOut(iR(lt, 8000, 9000)));
    if (tA > 0.02) {
      const lbl = `${si + 1}/4  ·  ${titles[si]}`;
      ctx.save(); ctx.globalAlpha = tA;
      ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
      const tw = ctx.measureText(lbl).width;
      ctx.fillStyle = 'rgba(4,13,26,0.88)'; ctx.strokeStyle = cols[si] + '88'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.roundRect(W / 2 - tw / 2 - 14, H * 0.025, tw + 28, 20, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = cols[si]; ctx.fillText(lbl, W / 2, H * 0.025 + 14);
      ctx.restore();
    }
  } else {
    const fd = clamp((t - 36000) / 400, 0, 1);
    sceneSweep(ctx, W, H, Math.min(t - 27000, 9000), showGrid);
    ctx.fillStyle = `rgba(4,13,26,${fd})`; ctx.fillRect(0, 0, W, H);
  }
}

// ── Main draw function ─────────────────────────
const SCENE_DUR = [9000, 9000, 9000, 9000, 36000];
const SCENE_FNS = [sceneOB, sceneFVG, sceneBOS, sceneSweep, sceneFull];

export function drawBigBelugaTransition(ctx, W, H, progress, p) {
  const sceneIdx = parseInt(p.scene) || 0;
  const t = progress * SCENE_DUR[sceneIdx];
  const D = SCENE_DUR[sceneIdx];
  const showGrid = p.showGrid !== false;

  SCENE_FNS[sceneIdx](ctx, W, H, t, showGrid);

  // Título superior "BigBeluga SMC"
  const titleA = eOut(iR(t, 0, 700)) * (1 - eOut(iR(t, D * 0.88, D)));
  if (titleA > 0.01) {
    const title = 'Smart Money';
    ctx.save();
    ctx.globalAlpha = titleA;
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const tw = ctx.measureText(title).width;
    const padX = 28;
    const bx = W / 2 - tw / 2 - padX;
    const by = H * 0.022;
    const bw = tw + padX * 2;
    const bh = 44;
    // Fondo con borde cian (color de la transición)
    ctx.fillStyle = 'rgba(4,13,26,0.88)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(0,255,255,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.stroke();
    // Texto con glow cian
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 14;
    ctx.fillText(title, W / 2, by + bh * 0.68);
    ctx.restore();
  }
}
