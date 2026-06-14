export const smartMoneyTransition = {
  id: "smart_money",
  name: "Smart Money Concept",
  category: "Education",
  icon: "🧠",
  description: "Liquidity Sweep, Order Block, FVG, BOS/CHoCH",
  duration: 8000,
  color: "#EF9F27",
  tags: ["smart-money", "ict", "education", "concept"],
  params: [
    { id: "scene", label: "Escena", type: "select", default: 0, options: ["0", "1", "2", "3", "4"] },
    { id: "showGrid", label: "Mostrar Grid", type: "toggle", default: true },
  ],
};

// ── Utilities ──────────────────────────────────────
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function eOut(t) { return 1 - (1 - t) * (1 - t); }
function eElastic(t) { return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1; }
function iR(t, s, e) { return t < s ? 0 : t >= e ? 1 : (t - s) / (e - s); }

// ── Candle generator (seeded) ──────────────────────
function mkCandles(n, seed = 1, trend = 0) {
  const r = () => { seed = ((seed * 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  let p = 100, c = [];
  for (let i = 0; i < n; i++) {
    const move = (r() - 0.48 + trend * 0.04) * 3.5;
    const o = p, cl = p + move;
    const hi = Math.max(o, cl) + r() * 1.2, lo = Math.min(o, cl) - r() * 1.2;
    c.push({ o, c: cl, h: hi, l: lo }); p = cl;
  }
  return c;
}

// Cache candles
let cachedCandles = null;
function getCandles() {
  if (!cachedCandles) {
    cachedCandles = mkCandles(60, 42, 1);
    for (let i = 20; i < 28; i++) cachedCandles[i].c = cachedCandles[i].o + (cachedCandles[i].c - cachedCandles[i].o) * -0.8;
    cachedCandles[28].h = Math.max(...cachedCandles.slice(0, 28).map(c => c.h)) + 4;
    cachedCandles[28].c = cachedCandles[28].o - 3;
    for (let i = 30; i < 60; i++) { cachedCandles[i].o -= 0.3 * (i - 30); cachedCandles[i].c -= 0.3 * (i - 30) + 1.5; }
  }
  return cachedCandles;
}

// ── Draw helpers ───────────────────────────────────
function bg(ctx, W, H, col = '#040810') { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }

function drawGrid(ctx, W, H, a = 0.06, col = '#7F77DD') {
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 0.5;
  const gx = W / 16, gy = H / 10;
  for (let i = 0; i <= 16; i++) { ctx.beginPath(); ctx.moveTo(i * gx, 0); ctx.lineTo(i * gx, H); ctx.stroke(); }
  for (let j = 0; j <= 10; j++) { ctx.beginPath(); ctx.moveTo(0, j * gy); ctx.lineTo(W, j * gy); ctx.stroke(); }
  ctx.restore();
}

function drawCandles(ctx, W, H, arr, mx, mn, region, alpha = 1, cnt = arr.length) {
  const [rx, ry, rw, rh] = region;
  const rng = mx - mn || 1;
  const cw = rw / arr.length * 0.72;
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = 0; i < Math.min(cnt, arr.length); i++) {
    const cd = arr[i];
    const bull = cd.c >= cd.o;
    const col = bull ? '#1D9E75' : '#D4537E';
    const x = rx + rw * (i / (arr.length - 1));
    const oy = ry + rh * (1 - (cd.o - mn) / rng);
    const cy = ry + rh * (1 - (cd.c - mn) / rng);
    const hy = ry + rh * (1 - (cd.h - mn) / rng);
    const ly = ry + rh * (1 - (cd.l - mn) / rng);
    ctx.strokeStyle = col; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, hy); ctx.lineTo(x, ly); ctx.stroke();
    ctx.fillStyle = col;
    const by = Math.min(oy, cy), bh = Math.max(2, Math.abs(cy - oy));
    ctx.fillRect(x - cw / 2, by, cw, bh);
  }
  ctx.restore();
}

function hline(ctx, W, y, col, a, dash = [], lw = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = lw;
  ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
}

function lbl(ctx, txt, x, y, col, a, sz = 18, align = 'left') {
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.font = `bold ${sz}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = align; ctx.fillText(txt, x, y); ctx.restore();
}

function pill(ctx, txt, x, y, bg, tc, a, w = null, h = 30) {
  ctx.save(); ctx.globalAlpha = a;
  const sz = 16; ctx.font = `bold ${sz}px system-ui, -apple-system, sans-serif`;
  const tw = w || ctx.measureText(txt).width + 20;
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x, y - h * 0.7, tw, h, 5); ctx.fill();
  ctx.fillStyle = tc; ctx.textAlign = 'left'; ctx.fillText(txt, x + 10, y + 2);
  ctx.restore();
}

function arrow(ctx, x1, y1, x2, y2, col, a, lw = 1.5) {
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const ang = Math.atan2(y2 - y1, x2 - x1); const as = 8;
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - as * Math.cos(ang - Math.PI / 7), y2 - as * Math.sin(ang - Math.PI / 7));
  ctx.lineTo(x2 - as * Math.cos(ang + Math.PI / 7), y2 - as * Math.sin(ang + Math.PI / 7));
  ctx.closePath(); ctx.fill(); ctx.restore();
}

function glitch(ctx, W, H, a) {
  if (a < 0.01) return; ctx.save(); ctx.globalAlpha = a * 0.6;
  for (let i = 0; i < 4; i++) {
    const gy = Math.random() * H, gh = 1 + Math.random() * 4, gw = 30 + Math.random() * 80;
    ctx.fillStyle = Math.random() > 0.5 ? '#EF9F27' : '#7F77DD';
    ctx.fillRect(Math.random() * W, gy, gw, gh);
  }
  ctx.restore();
}

function scanline(ctx, W, H, y, a, col = '#7F77DD') {
  ctx.save(); ctx.globalAlpha = a * 0.7;
  const g = ctx.createLinearGradient(0, y - H * 0.05, 0, y + H * 0.05);
  g.addColorStop(0, 'transparent'); g.addColorStop(0.5, col + '44'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.fillRect(0, y - H * 0.05, W, H * 0.1);
  ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.globalAlpha = a * 0.8;
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  ctx.restore();
}

function flash(ctx, W, H, a, col = 'rgba(239,159,39,') {
  if (a < 0.01) return;
  ctx.save(); ctx.globalAlpha = a * 0.4; ctx.fillStyle = col + a + ')'; ctx.fillRect(0, 0, W, H); ctx.restore();
}

function getRegion(W, H) { return [W * 0.06, H * 0.1, W * 0.88, H * 0.72]; }
function getMapY(v, mn, mx, ry, rh) { return ry + rh * (1 - (v - mn) / (mx - mn || 1)); }

// ══════════════════════════════════════════════════
// SCENE 1 — LIQUIDITY SWEEP
// ══════════════════════════════════════════════════
function sceneLiqSweep(ctx, W, H, t, showGrid) {
  bg(ctx, W, H); if (showGrid) drawGrid(ctx, W, H, 0.06, '#1D9E75');
  const D = 8000;
  const [rx, ry, rw, rh] = getRegion(W, H);
  const arr = getCandles().slice(0, 50);
  const mn = Math.min(...arr.map(c => c.l)) - 2;
  const mx = Math.max(...arr.map(c => c.h)) + 2;

  const cRev = eOut(iR(t, 200, 2500));
  drawCandles(ctx, W, H, arr, mx, mn, [rx, ry, rw, rh], cRev * 0.85, Math.ceil(cRev * arr.length));

  const swingH = Math.max(...arr.slice(0, 28).map(c => c.h));
  const swingY = getMapY(swingH, mn, mx, ry, rh);
  const lineA = eOut(iR(t, 1500, 3000));
  hline(ctx, W, swingY, '#EF9F27', lineA, [8, 5], 1.5);
  if (lineA > 0.3) pill(ctx, 'Swing High  (Liquidity Pool)', rx + 8, swingY - 6, 'rgba(239,159,39,0.12)', '#EF9F27', lineA);

  const ehA = eOut(iR(t, 2000, 3500));
  if (ehA > 0.1) {
    for (let off = 0; off < 3; off++) hline(ctx, W, swingY + off * 1.5, 'rgba(239,159,39,0.3)', ehA * 0.6, [4, 4], 0.6);
    lbl(ctx, 'EQH — Equal Highs  (BSL Target)', rx + 8, swingY - 22, '#EF9F27', ehA * 0.7, 10);
  }

  const sweepA = eOut(iR(t, 3000, 4500));
  const sweepIdx = 28;
  if (sweepA > 0.05) {
    const cd = arr[sweepIdx];
    const x = rx + rw * (sweepIdx / (arr.length - 1));
    const hy = getMapY(cd.h, mn, mx, ry, rh);
    const ly = getMapY(cd.l, mn, mx, ry, rh);
    const oy = getMapY(cd.o, mn, mx, ry, rh);
    const cy2 = getMapY(cd.c, mn, mx, ry, rh);
    ctx.save(); ctx.globalAlpha = sweepA;
    ctx.strokeStyle = '#EF9F27'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, hy); ctx.lineTo(x, ly); ctx.stroke();
    ctx.fillStyle = '#EF9F27';
    const by = Math.min(oy, cy2), bh = Math.max(2, Math.abs(cy2 - oy));
    ctx.fillRect(x - 5, by, 10, bh);
    ctx.strokeStyle = '#EF9F27'; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x, hy); ctx.lineTo(x, swingY - 2); ctx.stroke();
    ctx.shadowColor = '#EF9F27'; ctx.shadowBlur = 20; ctx.globalAlpha = sweepA * 0.5;
    ctx.strokeStyle = '#EF9F27'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, hy); ctx.lineTo(x, swingY); ctx.stroke();
    ctx.restore();
    pill(ctx, '\u26A1 LIQUIDITY SWEPT', x - 60, swingY - 36, 'rgba(239,159,39,0.15)', '#EF9F27', sweepA);
  }

  const revA = eOut(iR(t, 4200, 5500));
  if (revA > 0.05) {
    const sx = rx + rw * (sweepIdx / (arr.length - 1));
    const sy = swingY + H * 0.04;
    arrow(ctx, sx, sy, sx, sy + H * 0.22, '#1D9E75', revA, 2.5);
    pill(ctx, 'REVERSAL \u2193  Smart Money Sell', sx + 12, sy + H * 0.1, 'rgba(29,158,117,0.12)', '#1D9E75', revA);
  }

  const infoA = eOut(iR(t, 4800, 6500)) * (1 - eOut(iR(t, 7300, 8000)));
  if (infoA > 0.05) {
    ctx.save(); ctx.globalAlpha = infoA;
    ctx.fillStyle = 'rgba(4,8,16,0.85)'; ctx.strokeStyle = 'rgba(239,159,39,0.3)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.roundRect(W * 0.65, H * 0.08, W * 0.31, H * 0.38, 6); ctx.fill(); ctx.stroke();
    ctx.restore();
    lbl(ctx, 'LIQUIDITY SWEEP', W * 0.67, H * 0.14, '#EF9F27', infoA, 18);
    lbl(ctx, 'Buyside Liquidity (BSL)', W * 0.67, H * 0.20, 'rgba(255,255,255,0.85)', infoA, 14);
    lbl(ctx, 'located above EQH', W * 0.67, H * 0.25, 'rgba(255,255,255,0.7)', infoA, 14);
    lbl(ctx, 'Smart money triggers', W * 0.67, H * 0.31, 'rgba(255,255,255,0.7)', infoA, 14);
    lbl(ctx, 'stops \u2192 grabs liq.', W * 0.67, H * 0.36, 'rgba(255,255,255,0.6)', infoA, 14);
  }

  scanline(ctx, W, H, H * (t / D) * 0.8 + H * 0.1, eOut(iR(t, 0, 7000)) * 0.6, '#EF9F27');
  flash(ctx, W, H, eOut(iR(t, 7600, 8000)), 'rgba(239,159,39,');
  glitch(ctx, W, H, eOut(iR(t, 7500, 7800)) * 0.7);
}

// ══════════════════════════════════════════════════
// SCENE 2 — ORDER BLOCK
// ══════════════════════════════════════════════════
function sceneOB(ctx, W, H, t, showGrid) {
  bg(ctx, W, H, '#040c08'); if (showGrid) drawGrid(ctx, W, H, 0.05, '#1D9E75');
  const D = 8000;
  const [rx, ry, rw, rh] = getRegion(W, H);
  const arr = getCandles().slice(10, 50);
  const mn = Math.min(...arr.map(c => c.l)) - 1.5;
  const mx = Math.max(...arr.map(c => c.h)) + 1.5;

  const cRev = eOut(iR(t, 0, 2000));
  drawCandles(ctx, W, H, arr, mx, mn, [rx, ry, rw, rh], cRev * 0.85, Math.ceil(cRev * arr.length));

  const obIdx = 8;
  const ob = arr[obIdx];
  const obTop = getMapY(ob.o, mn, mx, ry, rh);
  const obBot = getMapY(ob.c, mn, mx, ry, rh);
  const obX1 = rx + rw * (obIdx / (arr.length - 1)) - rw * 0.02;
  const obX2 = rx + rw * ((obIdx + 22) / (arr.length - 1));

  const obA = eOut(iR(t, 1800, 3200));
  if (obA > 0.05) {
    ctx.save(); ctx.globalAlpha = obA * 0.18;
    ctx.fillStyle = '#7F77DD';
    ctx.fillRect(obX1, obTop, obX2 - obX1, obBot - obTop);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = obA;
    ctx.strokeStyle = '#7F77DD'; ctx.lineWidth = 1.2; ctx.setLineDash([6, 4]);
    ctx.strokeRect(obX1, obTop, obX2 - obX1, obBot - obTop);
    ctx.setLineDash([]); ctx.restore();
    hline(ctx, W, obTop, '#7F77DD', obA * 0.6, [5, 4], 1);
    hline(ctx, W, obBot, '#7F77DD', obA * 0.6, [5, 4], 1);
    pill(ctx, 'ORDER BLOCK (OB)', obX1 + 6, obTop - 8, 'rgba(127,119,221,0.15)', '#7F77DD', obA);
    lbl(ctx, 'Bearish OB \u2192 now demand zone', obX1 + 4, obBot + 16, 'rgba(127,119,221,0.7)', obA, 10);
  }

  const mitA = eOut(iR(t, 3000, 4500));
  if (mitA > 0.05) {
    const midX = obX1 + (obX2 - obX1) * 0.5;
    const startY = getMapY(arr[arr.length - 1].c, mn, mx, ry, rh);
    arrow(ctx, midX + rw * 0.1, startY, midX, obBot - 4, '#EF9F27', mitA, 2);
    pill(ctx, 'MITIGATION \u2014 Price returns to OB', midX + rw * 0.1 + 8, startY - 10, 'rgba(239,159,39,0.1)', '#EF9F27', mitA * 0.8);
  }

  const rxA = eOut(iR(t, 4400, 6000)) * (1 - eOut(iR(t, 7300, 8000)));
  if (rxA > 0.05) {
    const midX = obX1 + (obX2 - obX1) * 0.5;
    arrow(ctx, midX, obBot, midX, obBot - H * 0.25, '#1D9E75', rxA, 2.5);
    pill(ctx, 'REACTION \u2191  \u2014 Institutional Buy', midX + 12, obBot - H * 0.14, 'rgba(29,158,117,0.12)', '#1D9E75', rxA);
    ctx.save(); ctx.globalAlpha = rxA;
    ctx.strokeStyle = 'rgba(127,119,221,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(midX, obBot, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
  }

  const infoA = eOut(iR(t, 4800, 6500)) * (1 - eOut(iR(t, 7200, 8000)));
  if (infoA > 0.05) {
    ctx.save(); ctx.globalAlpha = infoA;
    ctx.fillStyle = 'rgba(4,8,16,0.88)'; ctx.strokeStyle = 'rgba(127,119,221,0.3)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.roundRect(W * 0.02, H * 0.08, W * 0.28, H * 0.40, 6); ctx.fill(); ctx.stroke();
    ctx.restore();
    lbl(ctx, 'ORDER BLOCK', W * 0.03, H * 0.14, '#7F77DD', infoA, 18);
    lbl(ctx, 'Last candle before', W * 0.03, H * 0.20, 'rgba(255,255,255,0.85)', infoA, 14);
    lbl(ctx, 'strong institutional move.', W * 0.03, H * 0.25, 'rgba(255,255,255,0.85)', infoA, 14);
    lbl(ctx, 'Price returns to "fill"', W * 0.03, H * 0.31, 'rgba(255,255,255,0.7)', infoA, 14);
    lbl(ctx, 'the OB zone (mitigation).', W * 0.03, H * 0.36, 'rgba(255,255,255,0.6)', infoA, 14);
  }

  scanline(ctx, W, H, H * 0.1 + H * 0.7 * (t / D), eOut(iR(t, 0, 7000)) * 0.6, '#7F77DD');
  flash(ctx, W, H, eOut(iR(t, 7600, 8000)), 'rgba(127,119,221,');
  glitch(ctx, W, H, eOut(iR(t, 7500, 7800)) * 0.7);
}

// ══════════════════════════════════════════════════
// SCENE 3 — FAIR VALUE GAP
// ══════════════════════════════════════════════════
function sceneFVG(ctx, W, H, t, showGrid) {
  bg(ctx, W, H, '#04080c'); if (showGrid) drawGrid(ctx, W, H, 0.05, '#378ADD');
  const D = 8000;
  const [rx, ry, rw, rh] = getRegion(W, H);
  const arr = getCandles().slice(5, 45);
  const mn = Math.min(...arr.map(c => c.l)) - 1.5;
  const mx = Math.max(...arr.map(c => c.h)) + 2;

  const cRev = eOut(iR(t, 0, 2000));
  drawCandles(ctx, W, H, arr, mx, mn, [rx, ry, rw, rh], cRev * 0.85, Math.ceil(cRev * arr.length));

  const i1 = 12, i2 = 14;
  const c1 = arr[i1], c3 = arr[i2];
  const fvgTop = getMapY(c1.h, mn, mx, ry, rh);
  const fvgBot = getMapY(c3.l, mn, mx, ry, rh);
  const fvgX1 = rx + rw * (i1 / (arr.length - 1));
  const fvgX2 = rx + rw * (i2 / (arr.length - 1));

  const fvgA = eOut(iR(t, 1800, 3200));
  if (fvgA > 0.05) {
    ctx.save(); ctx.globalAlpha = fvgA * 0.2;
    ctx.fillStyle = '#378ADD';
    ctx.fillRect(fvgX1, fvgTop, rx + rw - fvgX1, fvgBot - fvgTop);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = fvgA;
    ctx.strokeStyle = '#378ADD'; ctx.lineWidth = 1;
    hline(ctx, W, fvgTop, '#378ADD', fvgA, [6, 4], 1);
    hline(ctx, W, fvgBot, '#378ADD', fvgA, [6, 4], 1);
    ctx.lineWidth = 1.5; ctx.strokeStyle = '#378ADD';
    ctx.beginPath(); ctx.moveTo(fvgX1 - 12, fvgTop); ctx.lineTo(fvgX1 - 6, fvgTop);
    ctx.moveTo(fvgX1 - 6, fvgTop); ctx.lineTo(fvgX1 - 6, fvgBot);
    ctx.moveTo(fvgX1 - 6, fvgBot); ctx.lineTo(fvgX1 - 12, fvgBot); ctx.stroke();
    ctx.restore();
    pill(ctx, 'FVG  (Imbalance / Gap)', fvgX1 + 8, fvgTop - 8, 'rgba(55,138,221,0.12)', '#378ADD', fvgA);
    lbl(ctx, 'Fair Value Gap', fvgX1 - 110, fvgTop + (fvgBot - fvgTop) / 2 + 4, '#378ADD', fvgA, 10, 'right');
    lbl(ctx, 'Price wants to', fvgX1 + 6, fvgTop + (fvgBot - fvgTop) / 2 - 4, 'rgba(255,255,255,0.4)', fvgA, 9);
    lbl(ctx, 'return & fill it', fvgX1 + 6, fvgTop + (fvgBot - fvgTop) / 2 + 10, 'rgba(255,255,255,0.4)', fvgA, 9);
  }

  const eqY = (fvgTop + fvgBot) / 2;
  const eqA = eOut(iR(t, 2500, 3800));
  hline(ctx, W, eqY, 'rgba(55,138,221,0.5)', eqA, [3, 3], 0.8);
  lbl(ctx, 'EQ (50%)', fvgX1 + 6, eqY - 4, 'rgba(55,138,221,0.7)', eqA, 10);

  const fillA = eOut(iR(t, 3500, 5000));
  if (fillA > 0.05) {
    const ex = rx + rw * (30 / (arr.length - 1));
    const startY = getMapY(arr[30].c, mn, mx, ry, rh);
    arrow(ctx, ex, startY, fvgX1 + (fvgX2 - fvgX1) / 2, fvgBot + 4, '#EF9F27', fillA, 2);
    pill(ctx, 'FILL \u2191  Price respects FVG', ex + 10, startY + 16, 'rgba(239,159,39,0.1)', '#EF9F27', fillA);
  }

  const bounceA = eOut(iR(t, 4700, 6200)) * (1 - eOut(iR(t, 7200, 8000)));
  if (bounceA > 0.05) {
    const bx = fvgX1 + (fvgX2 - fvgX1) / 2;
    arrow(ctx, bx, fvgBot, bx, fvgTop - H * 0.2, '#1D9E75', bounceA, 2.5);
    pill(ctx, 'REJECTION \u2191  Institutional Flow', bx + 12, fvgTop - H * 0.1, 'rgba(29,158,117,0.12)', '#1D9E75', bounceA);
  }

  const infoA = eOut(iR(t, 4800, 6500)) * (1 - eOut(iR(t, 7200, 8000)));
  if (infoA > 0.05) {
    ctx.save(); ctx.globalAlpha = infoA;
    ctx.fillStyle = 'rgba(4,8,16,0.88)'; ctx.strokeStyle = 'rgba(55,138,221,0.3)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.roundRect(W * 0.02, H * 0.08, W * 0.28, H * 0.42, 6); ctx.fill(); ctx.stroke();
    ctx.restore();
    lbl(ctx, 'FAIR VALUE GAP', W * 0.03, H * 0.14, '#378ADD', infoA, 18);
    lbl(ctx, '3-candle imbalance:', W * 0.03, H * 0.20, 'rgba(255,255,255,0.85)', infoA, 14);
    lbl(ctx, 'wick[n+2] < wick[n]', W * 0.03, H * 0.25, 'rgba(255,255,255,0.7)', infoA, 14);
    lbl(ctx, 'Institutions fill gaps', W * 0.03, H * 0.31, 'rgba(255,255,255,0.85)', infoA, 14);
    lbl(ctx, 'before continuing trend.', W * 0.03, H * 0.36, 'rgba(255,255,255,0.7)', infoA, 14);
    lbl(ctx, 'Best entry at 50% EQ.', W * 0.03, H * 0.41, 'rgba(255,255,255,0.6)', infoA, 12);
  }

  scanline(ctx, W, H, H * 0.1 + H * 0.7 * (t / D), eOut(iR(t, 0, 7000)) * 0.6, '#378ADD');
  flash(ctx, W, H, eOut(iR(t, 7600, 8000)), 'rgba(55,138,221,');
  glitch(ctx, W, H, eOut(iR(t, 7500, 7800)) * 0.7);
}

// ══════════════════════════════════════════════════
// SCENE 4 — BOS / CHoCH
// ══════════════════════════════════════════════════
function sceneBOS(ctx, W, H, t, showGrid) {
  bg(ctx, W, H, '#08040c'); if (showGrid) drawGrid(ctx, W, H, 0.05, '#D4537E');
  const D = 8000;
  const [rx, ry, rw, rh] = getRegion(W, H);
  const seqPts = [100, 98, 103, 101, 107, 104, 110, 107, 114, 110, 117, 114, 120, 117, 108, 112, 106, 110, 103, 107];
  const arr = [];
  const rng = () => Math.random();
  for (let i = 0; i < seqPts.length; i++) {
    const o = seqPts[i], cl2 = seqPts[i + 1] || o;
    arr.push({ o, c: cl2, h: Math.max(o, cl2) + rng(), l: Math.min(o, cl2) - rng() });
  }
  const mn = 95, mx = 126;

  const cRev = eOut(iR(t, 0, 2000));
  drawCandles(ctx, W, H, arr, mx, mn, [rx, ry, rw, rh], cRev * 0.85, Math.ceil(cRev * arr.length));

  const getX = (i) => rx + rw * (i / (arr.length - 1));
  const getY2 = (v) => getMapY(v, mn, mx, ry, rh);

  const hhA = eOut(iR(t, 1500, 3000));
  const hhPts = [[4, 110, 'HH'], [8, 117, 'HH'], [12, 120, 'HH \u2190BOS']];
  hhPts.forEach(([i, v, lbl2]) => {
    if (hhA > 0.05) {
      const x = getX(i), y = getY2(v) - 12;
      ctx.save(); ctx.globalAlpha = hhA;
      ctx.fillStyle = 'rgba(29,158,117,0.12)'; ctx.strokeStyle = 'rgba(29,158,117,0.5)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.roundRect(x - 16, y - 14, 80, 18, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1D9E75'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left';
      ctx.fillText(lbl2, x - 10, y); ctx.restore();
    }
  });

  const hlPts = [[3, 101, 'HL'], [7, 107, 'HL'], [11, 110, 'HL']];
  hlPts.forEach(([i, v, lbl2]) => {
    if (hhA > 0.05) {
      const x = getX(i), y = getY2(v) + 20;
      ctx.save(); ctx.globalAlpha = hhA;
      ctx.fillStyle = 'rgba(29,158,117,0.08)'; ctx.strokeStyle = 'rgba(29,158,117,0.3)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.roundRect(x - 10, y - 14, 48, 18, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(29,158,117,0.8)'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
      ctx.fillText(lbl2, x - 4, y); ctx.restore();
    }
  });

  const bosA = eOut(iR(t, 2500, 4000));
  const bosY = getY2(117);
  const bosX = getX(8);
  if (bosA > 0.05) {
    const extW = eOut(iR(t, 2800, 4500)) * (W * 0.4);
    ctx.save(); ctx.globalAlpha = bosA;
    ctx.strokeStyle = '#1D9E75'; ctx.lineWidth = 1.5; ctx.setLineDash([8, 4]);
    ctx.beginPath(); ctx.moveTo(bosX, bosY); ctx.lineTo(bosX + extW, bosY); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
    pill(ctx, 'BOS \u2713  Break of Structure', bosX + 8, bosY - 8, 'rgba(29,158,117,0.15)', '#1D9E75', bosA);
  }

  const chochA = eOut(iR(t, 3800, 5200));
  const chochY = getY2(107);
  const chochX = getX(13);
  if (chochA > 0.05) {
    const extW = eOut(iR(t, 4000, 5500)) * (W * 0.35);
    ctx.save(); ctx.globalAlpha = chochA;
    ctx.strokeStyle = '#D4537E'; ctx.lineWidth = 1.8; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(chochX, chochY); ctx.lineTo(chochX + extW, chochY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(212,83,126,0.15)';
    ctx.beginPath(); ctx.roundRect(chochX + 8, chochY + 6, 160, 22, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(212,83,126,0.5)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.fillStyle = '#D4537E'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';
    ctx.fillText('CHoCH \u26A0  Change of Character', chochX + 14, chochY + 21);
    ctx.restore();
    arrow(ctx, chochX + rw * 0.12, chochY, chochX + rw * 0.12, chochY + H * 0.2, '#D4537E', chochA, 2.5);
    pill(ctx, 'Bearish Reversal Signal', chochX + rw * 0.12 + 12, chochY + H * 0.1, 'rgba(212,83,126,0.12)', '#D4537E', chochA * 0.8);
  }

  const lhA = eOut(iR(t, 5000, 6500)) * (1 - eOut(iR(t, 7200, 8000)));
  if (lhA > 0.05) {
    [[15, 110, 'LH'], [17, 106, 'LH'], [19, 107, 'LL']].forEach(([i, v, lbl2]) => {
      const x = getX(i), y = getY2(v) + (lbl2 === 'LL' ? 22 : -14);
      ctx.save(); ctx.globalAlpha = lhA;
      ctx.fillStyle = 'rgba(212,83,126,0.1)'; ctx.strokeStyle = 'rgba(212,83,126,0.4)'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.roundRect(x - 10, y - 14, 48, 18, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#D4537E'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left';
      ctx.fillText(lbl2, x - 4, y); ctx.restore();
    });
  }

  const infoA = eOut(iR(t, 5000, 6500)) * (1 - eOut(iR(t, 7200, 8000)));
  if (infoA > 0.05) {
    ctx.save(); ctx.globalAlpha = infoA;
    ctx.fillStyle = 'rgba(8,4,12,0.9)'; ctx.strokeStyle = 'rgba(212,83,126,0.3)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.roundRect(W * 0.02, H * 0.08, W * 0.31, H * 0.42, 6); ctx.fill(); ctx.stroke();
    ctx.restore();
    lbl(ctx, 'BOS vs CHoCH', W * 0.03, H * 0.14, '#D4537E', infoA, 18);
    lbl(ctx, 'BOS = same-direction break.', W * 0.03, H * 0.20, 'rgba(29,158,117,0.95)', infoA, 14);
    lbl(ctx, 'Trend confirmed \u2191', W * 0.03, H * 0.25, 'rgba(29,158,117,0.8)', infoA, 13);
    lbl(ctx, 'CHoCH = opposite break.', W * 0.03, H * 0.31, 'rgba(212,83,126,0.95)', infoA, 14);
    lbl(ctx, 'Trend shift  \u2191 \u2192 \u2193', W * 0.03, H * 0.36, 'rgba(212,83,126,0.8)', infoA, 13);
    lbl(ctx, 'First CHoCH = early entry.', W * 0.03, H * 0.41, 'rgba(255,255,255,0.5)', infoA, 12);
  }

  scanline(ctx, W, H, H * 0.1 + H * 0.7 * (t / D), eOut(iR(t, 0, 7000)) * 0.6, '#D4537E');
  flash(ctx, W, H, eOut(iR(t, 7600, 8000)), 'rgba(212,83,126,');
  glitch(ctx, W, H, eOut(iR(t, 7500, 7800)) * 0.7);
}

// ══════════════════════════════════════════════════
// FULL SEQUENCE (scene index = 4)
// ══════════════════════════════════════════════════
function sceneFull(ctx, W, H, t, showGrid) {
  const D = 8000;
  const sceneIdx = Math.floor(t / D);
  const lt = t - sceneIdx * D;
  const titles = ['LIQUIDITY SWEEP', 'ORDER BLOCK', 'FAIR VALUE GAP', 'BOS / CHoCH'];
  const cols = ['#EF9F27', '#7F77DD', '#378ADD', '#D4537E'];
  const fns = [sceneLiqSweep, sceneOB, sceneFVG, sceneBOS];

  if (sceneIdx < 4) {
    fns[sceneIdx](ctx, W, H, lt, showGrid);
    const titleA = eOut(iR(lt, 0, 600)) * (1 - eOut(iR(lt, 7400, 8000)));
    pill(ctx, `${sceneIdx + 1}/4  ${titles[sceneIdx]}`, W * 0.5 - 90, H * 0.03, 'rgba(4,8,16,0.8)', cols[sceneIdx], titleA, 180, 22);
  } else {
    sceneBOS(ctx, W, H, Math.min(t - 24000, 8000), showGrid);
    const fd = clamp((t - 32000) / 500, 0, 1);
    ctx.fillStyle = `rgba(4,8,16,${fd})`; ctx.fillRect(0, 0, W, H);
  }
}

// ── Main draw function ─────────────────────────────
const SCENE_DUR = [8000, 8000, 8000, 8000, 32000];
const SCENE_FNS = [sceneLiqSweep, sceneOB, sceneFVG, sceneBOS, sceneFull];

export function drawSmartMoneyTransition(ctx, W, H, progress, p) {
  const sceneIdx = parseInt(p.scene) || 0;
  const t = progress * SCENE_DUR[sceneIdx];
  const D = SCENE_DUR[sceneIdx];
  const showGrid = p.showGrid !== false;

  SCENE_FNS[sceneIdx](ctx, W, H, t, showGrid);

  // Título superior "Smart Money Concept"
  const titleA = eOut(iR(t, 0, 700)) * (1 - eOut(iR(t, D * 0.88, D)));
  if (titleA > 0.01) {
    const title = 'Smart Money Concept';
    ctx.save();
    ctx.globalAlpha = titleA;
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const tw = ctx.measureText(title).width;
    const padX = 28, padY = 10;
    const bx = W / 2 - tw / 2 - padX;
    const by = H * 0.022;
    const bw = tw + padX * 2;
    const bh = 44;
    // Fondo con borde dorado
    ctx.fillStyle = 'rgba(4,8,16,0.88)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(239,159,39,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.stroke();
    // Texto con glow
    ctx.fillStyle = '#EF9F27';
    ctx.shadowColor = '#EF9F27';
    ctx.shadowBlur = 14;
    ctx.fillText(title, W / 2, by + bh * 0.68);
    ctx.restore();
  }
}
