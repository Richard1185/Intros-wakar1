export const introTransition = {
  id: "intro",
  name: "WAKAR1 Intro",
  category: "Branding",
  icon: "🎬",
  description: "Intro profesional WAKAR1 con ticker, neural network y carousel",
  duration: 18000,
  color: "#E55A14",
  tags: ["intro", "branding", "live", "neural"],
  params: [
    { id: "primaryColor", label: "Color Principal", type: "color", default: "#E55A14" },
    { id: "accentColor", label: "Color Acento", type: "color", default: "#00C176" },
    { id: "bgColor", label: "Fondo", type: "color", default: "#06090F" },
    { id: "showNeural", label: "Neural Network", type: "toggle", default: true },
    { id: "showTicker", label: "Ticker", type: "toggle", default: true },
  ],
};

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function eOut(t) { return 1 - (1 - clamp(t, 0, 1)) * (1 - clamp(t, 0, 1)); }
function iR(t, s, e) { return t < s ? 0 : t >= e ? 1 : (t - s) / (e - s); }

// ── Deterministic RNG ──
function mkRng(seed) { let s = seed; return () => { s = ((s * 1664525) + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; }; }

// ── Cached neural network data ──
let cachedNeural = null;
function getNeural(H) {
  if (cachedNeural && cachedNeural.H === H) return cachedNeural;
  const LD = [
    { x: 35, n: 5, lbl: ['VOL', 'RSI', 'MA', 'BB', 'MOM'] },
    { x: 112, n: 7 },
    { x: 198, n: 6 },
    { x: 275, n: 3, lbl: ['BUY', 'HOLD', 'SELL'] }
  ];
  const TOP = 38, BOT = 90;
  const usableH = H - TOP - BOT;
  const NP = LD.map(l => {
    const sp = usableH / (l.n + 1);
    return Array.from({ length: l.n }, (_, i) => ({ x: l.x, y: TOP + sp * (i + 1) }));
  });
  const CONNS = [];
  for (let l = 0; l < LD.length - 1; l++)
    NP[l].forEach((f, fi) => NP[l + 1].forEach((t, ti) => CONNS.push({ l, fi, ti, x1: f.x, y1: f.y, x2: t.x, y2: t.y })));
  cachedNeural = { LD, NP, CONNS, TOP, BOT, H };
  return cachedNeural;
}

// ── Draw helpers ──
function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Neural Network Drawing ──
function drawNeuralNetwork(ctx, W, H, primary, t, frame) {
  const panelH = H - 147;
  const neural = getNeural(panelH);
  const { LD, NP, CONNS, TOP, BOT } = neural;
  const usableH = panelH - TOP - BOT;

  // Glow layers
  const glows = [
    { x: 35, c: 'rgba(27,80,200,0.06)' },
    { x: 112, c: hexAlpha(primary, 0.04) },
    { x: 198, c: hexAlpha(primary, 0.04) },
    { x: 275, c: 'rgba(0,193,118,0.07)' }
  ];
  glows.forEach(g => {
    const grd = ctx.createLinearGradient(g.x - 28, 67, g.x + 28, 67);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(0.5, g.c);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(g.x - 28, 67, 56, usableH);
  });

  // Connections
  ctx.lineWidth = 0.5;
  CONNS.forEach(c => {
    ctx.strokeStyle = '#0D1E30';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(c.x1, c.y1 + 67);
    const cx = (c.x1 + c.x2) / 2;
    ctx.bezierCurveTo(cx, c.y1 + 67, cx, c.y2 + 67, c.x2, c.y2 + 67);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // Particles (simplified - use deterministic positions based on frame)
  const particleCount = 8;
  for (let i = 0; i < particleCount; i++) {
    const seed = (frame * 7 + i * 131) % 1000;
    const connIdx = seed % CONNS.length;
    const c = CONNS[connIdx];
    const pt = ((frame * 0.01 + i * 0.12) % 1);
    const mt = 1 - pt;
    const cx = (c.x1 + c.x2) / 2;
    const px = mt * mt * mt * c.x1 + 3 * mt * mt * pt * cx + 3 * mt * pt * pt * cx + pt * pt * pt * c.x2;
    const py = mt * mt * mt * (c.y1 + 67) + 3 * mt * mt * pt * (c.y1 + 67) + 3 * mt * pt * pt * (c.y2 + 67) + pt * pt * pt * (c.y2 + 67);
    const prevPt = Math.max(0, pt - 0.07);
    const mt2 = 1 - prevPt;
    const prevX = mt2 * mt2 * mt2 * c.x1 + 3 * mt2 * mt2 * prevPt * cx + 3 * mt2 * prevPt * prevPt * cx + prevPt * prevPt * prevPt * c.x2;
    const prevY = mt2 * mt2 * mt2 * (c.y1 + 67) + 3 * mt2 * mt2 * prevPt * (c.y1 + 67) + 3 * mt2 * prevPt * prevPt * (c.y2 + 67) + prevPt * prevPt * prevPt * (c.y2 + 67);
    const cols = [primary, '#4FC3F7', '#00C176', '#AB47BC'];
    const col = cols[i % cols.length];
    const sz = 2.2 + (i % 3) * 0.6;
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(prevX, prevY, sz * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = col;
    ctx.shadowBlur = 6; ctx.shadowColor = col;
    ctx.beginPath(); ctx.arc(px, py, sz, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // Nodes
  NP.forEach((layer, li) => {
    layer.forEach((node, ni) => {
      const breathe = 0.25 + 0.15 * Math.sin(frame * 0.035 + li * 1.4 + ni * 0.9);
      const isActive = Math.sin(frame * 0.02 + li * 2 + ni) > 0.3;
      const outCol = li === 3 ? (ni === 0 ? '#00C176' : ni === 1 ? '#FFA040' : '#FF4136') : null;
      const activeCol = outCol || primary;
      const r = 6;
      const ny = node.y + 67;

      if (isActive) {
        ctx.shadowBlur = 16; ctx.shadowColor = activeCol;
        ctx.fillStyle = hexAlpha(activeCol, 0.15);
        ctx.beginPath(); ctx.arc(node.x, ny, r + 6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.strokeStyle = isActive ? activeCol : `rgba(30,60,100,${0.35 + breathe})`;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.fillStyle = isActive ? hexAlpha(activeCol, 0.1) : 'rgba(8,14,22,0.95)';
      ctx.beginPath(); ctx.arc(node.x, ny, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      ctx.fillStyle = isActive ? activeCol : `rgba(40,80,130,${0.25 + breathe})`;
      ctx.beginPath(); ctx.arc(node.x, ny, 2, 0, Math.PI * 2); ctx.fill();

      // Labels
      if (li === 0 && LD[0].lbl) {
        ctx.fillStyle = 'rgba(50,90,120,0.8)'; ctx.font = '9px Arial'; ctx.textAlign = 'right';
        ctx.fillText(LD[0].lbl[ni], node.x - r - 4, ny + 3);
      }
      if (li === 3 && LD[3].lbl) {
        ctx.fillStyle = isActive ? activeCol : `rgba(40,80,130,0.45)`;
        ctx.font = 'bold 10px Arial'; ctx.textAlign = 'left';
        ctx.fillText(LD[3].lbl[ni], node.x + r + 4, ny + 3);
      }
    });
  });

  // Layer dividers
  ctx.setLineDash([3, 5]);
  ctx.strokeStyle = 'rgba(20,50,80,0.4)';
  ctx.lineWidth = 0.5;
  [73, 155, 237].forEach(x => {
    ctx.beginPath(); ctx.moveTo(x, 67 + TOP + 6); ctx.lineTo(x, 67 + panelH - BOT - 6); ctx.stroke();
  });
  ctx.setLineDash([]);
}

function drawGrid(ctx, W, H, col, a) {
  ctx.save(); ctx.globalAlpha = a * 0.06; ctx.strokeStyle = col; ctx.lineWidth = 0.5;
  for (let x = 0; x <= W; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();
}

function drawHeader(ctx, W, primary, t, btcPrice) {
  const a = eOut(iR(t, 0, 600));
  ctx.save(); ctx.globalAlpha = a;
  // Header bar
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, W, 64);
  ctx.fillStyle = hexAlpha(primary, 0.5);
  ctx.fillRect(0, 64, W, 3);
  // Dot
  const pulseA = 0.5 + 0.5 * Math.sin(t * 0.006);
  ctx.fillStyle = '#FF3333';
  ctx.beginPath(); ctx.arc(28, 32, 6, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = a * pulseA;
  ctx.fillStyle = '#FF3333';
  ctx.beginPath(); ctx.arc(28, 32, 6, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = a;
  // WAKAR1
  ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Arial'; ctx.textAlign = 'left';
  ctx.fillText('WAKAR1', 48, 40);
  // Divider
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(155, 17, 1, 30);
  // Subtitle
  ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.font = '17px Arial';
  ctx.fillText('INTELIGENCIA ARTIFICIAL · TRADING EN VIVO', 172, 40);
  // BTC price
  ctx.fillStyle = '#FFF59D'; ctx.font = 'bold 19px Arial'; ctx.textAlign = 'right';
  ctx.fillText('BTC $' + btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }), W - 30, 38);
  // Divider
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(W - 200, 17, 1, 30);
  ctx.restore();
}

function drawLeftPanel(ctx, W, H, primary, t, showNeural) {
  const a = eOut(iR(t, 300, 1200));
  const panelW = 320;
  ctx.save(); ctx.globalAlpha = a;
  // Panel bg
  ctx.fillStyle = 'rgba(6,9,15,0.95)';
  ctx.fillRect(0, 67, panelW, H - 147);
  ctx.strokeStyle = '#152030'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(panelW, 67); ctx.lineTo(panelW, H - 80); ctx.stroke();
  // Neural network
  if (showNeural) {
    drawNeuralNetwork(ctx, W, H, primary, t, Math.floor(t / 16));
  }
  // Title overlay
  ctx.fillStyle = primary; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'left';
  ctx.fillText('\u25C8 RED NEURONAL IA', 16, 92);
  ctx.fillStyle = '#2A4060'; ctx.font = '10px Arial';
  ctx.fillText('4 CAPAS · TIEMPO REAL', 16, 106);
  // Bottom scores
  ctx.fillStyle = 'rgba(6,9,15,0.85)';
  ctx.fillRect(0, H - 148, panelW, 68);
  ctx.strokeStyle = '#152030'; ctx.beginPath(); ctx.moveTo(0, H - 148); ctx.lineTo(panelW, H - 148); ctx.stroke();
  // Processing indicator
  const pA = 0.5 + 0.5 * Math.sin(t * 0.005);
  ctx.fillStyle = primary; ctx.globalAlpha = a * pA;
  ctx.beginPath(); ctx.arc(24, H - 130, 4, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = a;
  ctx.fillStyle = primary; ctx.font = 'bold 11px Arial';
  ctx.fillText('PROCESANDO SEÑAL', 34, H - 126);
  // Scores
  const scores = [
    { label: 'BUY', val: '72%', col: '#00C176', x: panelW * 0.17 },
    { label: 'HOLD', val: '18%', col: '#FFA040', x: panelW * 0.5 },
    { label: 'SELL', val: '10%', col: '#FF4136', x: panelW * 0.83 }
  ];
  scores.forEach((s, i) => {
    ctx.fillStyle = 'rgba(21,32,48,0.5)';
    if (i < 2) { ctx.strokeStyle = '#152030'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(s.x + 50, H - 118); ctx.lineTo(s.x + 50, H - 86); ctx.stroke(); }
    ctx.fillStyle = s.col; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
    ctx.fillText(s.val, s.x, H - 100);
    ctx.fillStyle = hexAlpha(s.col, 0.5); ctx.font = '10px Arial';
    ctx.fillText(s.label, s.x, H - 86);
  });
  ctx.restore();
}

function drawCenterCard(ctx, W, H, primary, accent, t, slideIdx) {
  const panelX = 320, panelW = W - 671;
  const slideDur = 4500;
  const slideT = t % slideDur;
  const slideA = slideIdx === 0 ? eOut(iR(slideT, 0, 600)) : 1;

  ctx.save();
  // Background for center panel
  ctx.fillStyle = '#06090F';
  ctx.fillRect(panelX, 67, panelW, H - 147);
  ctx.beginPath(); ctx.rect(panelX, 67, panelW, H - 147); ctx.clip();

  const cx = panelX + panelW / 2;
  const cy = 67 + (H - 147) / 2;

  // Slide 0: WAKAR1 title
  if (slideIdx === 0) {
    const a = slideA;
    ctx.globalAlpha = a;
    // Badge
    ctx.fillStyle = primary; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
    const badgeW = 260;
    ctx.fillRect(cx - badgeW / 2, cy - 120, badgeW, 28);
    ctx.fillStyle = '#fff'; ctx.fillText('\u2B1B EN VIVO · IA TRADING', cx, cy - 101);
    // Title
    ctx.fillStyle = '#fff'; ctx.font = 'bold 82px Arial';
    ctx.fillText('WAKAR1', cx, cy - 10);
    // Subtitle
    ctx.fillStyle = primary; ctx.font = 'bold 20px Arial';
    ctx.fillText('EL BROKER CON INTELIGENCIA ARTIFICIAL', cx, cy + 24);
    // Divider
    ctx.fillStyle = primary;
    ctx.fillRect(cx - 30, cy + 38, 60, 3);
    // Description
    ctx.fillStyle = '#7A9AB8'; ctx.font = '17px Arial';
    ctx.fillText('Agentes IA · Mercados en Tiempo Real', cx, cy + 68);
    ctx.fillText('Bitcoin · Ethereum · Altcoins · Futuros', cx, cy + 94);
  }

  // Slide 1: Market
  if (slideIdx === 1) {
    ctx.globalAlpha = slideA;
    ctx.fillStyle = '#152030'; ctx.font = '14px Arial'; ctx.textAlign = 'center';
    ctx.fillText('\u2B1B MERCADO EN VIVO', cx, cy - 100);
    ctx.fillStyle = '#7A9AB8'; ctx.font = '15px Arial';
    ctx.fillText('BTC / USDT · FUTUROS', cx, cy - 76);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 82px Arial';
    ctx.fillText('77,565.01', cx, cy + 10);
    ctx.fillStyle = '#00C176'; ctx.font = 'bold 22px Arial';
    ctx.fillText('\u25B2 +250.53 · +0.32%', cx, cy + 42);
    // Chart line
    const chartA = eOut(iR(slideT, 200, 2000));
    if (chartA > 0.01) {
      ctx.save(); ctx.globalAlpha = chartA;
      ctx.strokeStyle = '#00C176'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      const pts = [72, 67, 58, 48, 55, 42, 32, 44, 34, 24, 34, 44, 32, 22, 28, 42, 34, 44, 34, 42, 32, 22, 16, 10];
      const cw = 520, ch = 80, ox = cx - cw / 2, oy = cy + 60;
      const maxP = Math.max(...pts), minP = Math.min(...pts);
      const reveal = Math.floor(chartA * pts.length);
      for (let i = 0; i < reveal; i++) {
        const x = ox + (i / (pts.length - 1)) * cw;
        const y = oy + ch - ((pts[i] - minP) / (maxP - minP)) * ch;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      if (reveal > 0) {
        const lastX = ox + ((reveal - 1) / (pts.length - 1)) * cw;
        const lastY = oy + ch - ((pts[reveal - 1] - minP) / (maxP - minP)) * ch;
        ctx.fillStyle = '#00C176';
        ctx.beginPath(); ctx.arc(lastX, lastY, 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    // Stats
    ctx.fillStyle = '#7A9AB8'; ctx.font = '14px Arial';
    ctx.fillText('MAX 24H: 77,885 · MIN 24H: 77,140 · VOL: 425.17M USDT', cx, cy + 160);
  }

  // Slide 2: AI Agent
  if (slideIdx === 2) {
    ctx.globalAlpha = slideA;
    ctx.fillStyle = hexAlpha('#AB47BC', 0.12); ctx.font = '14px Arial'; ctx.textAlign = 'center';
    const tagW = 200;
    ctx.fillRect(cx - tagW / 2, cy - 108, tagW, 28);
    ctx.strokeStyle = hexAlpha('#AB47BC', 0.25); ctx.lineWidth = 1;
    ctx.strokeRect(cx - tagW / 2, cy - 108, tagW, 28);
    ctx.fillStyle = '#CE93D8';
    ctx.fillText('\u25C8 AGENTE IA ACTIVO', cx, cy - 89);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 54px Arial';
    ctx.fillText('WAKAIA', cx, cy - 30);
    ctx.fillStyle = '#7A9AB8'; ctx.font = '17px Arial';
    ctx.fillText('Tu Asistente de Trading con Inteligencia Artificial', cx, cy - 2);
    // Chat box
    ctx.fillStyle = '#0C1520';
    ctx.fillRect(cx - 260, cy + 18, 520, 56);
    ctx.strokeStyle = '#1B2A3A'; ctx.lineWidth = 1;
    ctx.strokeRect(cx - 260, cy + 18, 520, 56);
    ctx.fillStyle = primary; ctx.fillRect(cx - 260, cy + 18, 3, 56);
    ctx.fillStyle = primary; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'left';
    ctx.fillText('\u25C8 WAKAIA', cx - 246, cy + 38);
    // Typing effect
    const msgs = [
      'Analizando BTC/USDT... señal BULLISH detectada.',
      'Resistencia clave en 90,600 USDT identificada.',
      'SuperTrend confirma tendencia alcista 1D.',
      'Buy Zone activa: 65,419 – 68,220 USDT.'
    ];
    const msgIdx = Math.floor((t / 1800) % msgs.length);
    const msg = msgs[msgIdx];
    const charIdx = Math.min(Math.floor((t % 1800) / 52), msg.length);
    ctx.fillStyle = '#B0C8E0'; ctx.font = '17px Arial';
    ctx.fillText(msg.substring(0, charIdx), cx - 246, cy + 60);
    // Status badge
    ctx.fillStyle = '#0C1520';
    ctx.fillRect(cx - 80, cy + 82, 160, 28);
    ctx.strokeStyle = hexAlpha(accent, 0.22); ctx.lineWidth = 1;
    ctx.strokeRect(cx - 80, cy + 82, 160, 28);
    ctx.fillStyle = accent; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
    ctx.fillText('\u25CF ANÁLISIS ACTIVO', cx, cy + 100);
  }

  // Slide 3: Subscribe
  if (slideIdx === 3) {
    ctx.globalAlpha = slideA;
    // Badge
    ctx.fillStyle = primary; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
    ctx.fillRect(cx - 130, cy - 120, 260, 28);
    ctx.fillStyle = '#fff'; ctx.fillText('\u2B1B SUSCRIBETE AHORA', cx, cy - 101);
    ctx.fillStyle = '#7A9AB8'; ctx.font = '16px Arial';
    ctx.fillText('ACTIVA LA CAMPANITA Y NO TE PIERDAS NINGUNA SEÑAL', cx, cy - 76);
    // Card
    ctx.fillStyle = hexAlpha('#0C1520', 0.96);
    ctx.strokeStyle = hexAlpha(primary, 0.3); ctx.lineWidth = 1;
    const cardW = 480, cardH = 140;
    ctx.beginPath(); ctx.roundRect(cx - cardW / 2, cy - 56, cardW, cardH, 24); ctx.fill(); ctx.stroke();
    // Bell
    ctx.font = '68px Arial'; ctx.textAlign = 'center';
    ctx.fillText('\uD83D\uDD14', cx - 160, cy + 30);
    // Text
    ctx.fillStyle = '#FFD2B6'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'left';
    ctx.fillText('YOUTUBE CHANNEL', cx - 80, cy - 30);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 44px Arial';
    ctx.fillText('SUSCRIBETE A', cx - 80, cy + 14);
    ctx.fillStyle = primary; ctx.fillText('WAKAR1', cx - 80, cy + 58);
    ctx.fillStyle = '#93ACC7'; ctx.font = '16px Arial';
    ctx.fillText('Analisis en vivo, inteligencia artificial y', cx - 80, cy + 80);
    ctx.fillText('alertas del mercado cripto.', cx - 80, cy + 98);
    // Button
    const btnW = 320, btnH = 50;
    const grad = ctx.createLinearGradient(cx - btnW / 2, 0, cx + btnW / 2, 0);
    grad.addColorStop(0, primary); grad.addColorStop(1, '#FF7B33');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.roundRect(cx - btnW / 2, cy + 100, btnW, btnH, 25); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center';
    ctx.fillText('SUBSCRIBE', cx - 30, cy + 131);
    ctx.fillStyle = '#FFF0E5'; ctx.font = '16px Arial';
    ctx.fillText('Activa notificaciones', cx + 80, cy + 131);
  }

  // Dots
  const dots = [0, 1, 2, 3];
  dots.forEach((d, i) => {
    const dx = cx - 50 + i * 34;
    const dy = H - 100;
    ctx.fillStyle = i === slideIdx ? primary : '#7A9AB8';
    ctx.beginPath(); ctx.roundRect(dx, dy, i === slideIdx ? 30 : 8, 3, 2); ctx.fill();
  });

  // Progress bar
  ctx.fillStyle = '#152030'; ctx.fillRect(panelX, H - 83, panelW, 3);
  const progress = (slideT / slideDur) * panelW;
  ctx.fillStyle = primary; ctx.fillRect(panelX, H - 83, progress, 3);

  ctx.restore();
}

function drawRightPanel(ctx, W, H, primary, accent, t) {
  const a = eOut(iR(t, 400, 1400));
  const panelW = 350;
  const px = W - panelW;
  ctx.save(); ctx.globalAlpha = a;
  // Panel bg
  ctx.fillStyle = 'rgba(6,9,15,0.95)';
  ctx.fillRect(px, 67, panelW, H - 147);
  ctx.strokeStyle = '#152030'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px, 67); ctx.lineTo(px, H - 80); ctx.stroke();
  // Website card
  const cardA = eOut(iR(t, 500, 1000));
  ctx.globalAlpha = a * cardA;
  const grad = ctx.createLinearGradient(px + 14, 82, px + panelW - 14, 132);
  grad.addColorStop(0, primary); grad.addColorStop(1, '#FF7B33');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.roundRect(px + 14, 82, panelW - 28, 52, 8); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
  ctx.fillText('VISITA EL SITIO OFICIAL', px + panelW / 2, 102);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 22px Arial';
  ctx.fillText('www.wakar1.com', px + panelW / 2, 124);
  ctx.globalAlpha = a;
  // Price
  const priceA = eOut(iR(t, 700, 1200));
  ctx.globalAlpha = a * priceA;
  ctx.fillStyle = primary; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'left';
  ctx.fillText('BTC / USDT', px + 18, 162);
  ctx.fillStyle = '#4FC3F7'; ctx.font = '12px Arial';
  ctx.fillText('10x', px + 120, 162);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 36px Arial';
  ctx.fillText('77,565.01', px + 18, 200);
  ctx.fillStyle = accent; ctx.font = 'bold 16px Arial';
  ctx.fillText('\u25B2 +250.53 · +0.32%', px + 18, 220);
  ctx.globalAlpha = a;
  // Divider
  ctx.fillStyle = '#152030'; ctx.fillRect(px + 18, 232, panelW - 36, 1);
  // Stats
  const statsA = eOut(iR(t, 900, 1400));
  ctx.globalAlpha = a * statsA;
  const stats = [
    { label: 'MAX 24H', val: '77,885', x: px + 18, y: 244 },
    { label: 'MIN 24H', val: '77,140', x: px + panelW / 2 + 2, y: 244 },
    { label: 'VOL BTC', val: '5,485', x: px + 18, y: 300 },
    { label: 'VOL USDT', val: '425M', x: px + panelW / 2 + 2, y: 300 }
  ];
  stats.forEach(s => {
    ctx.fillStyle = 'rgba(12,21,32,0.85)';
    ctx.fillRect(s.x, s.y, panelW / 2 - 22, 48);
    ctx.strokeStyle = 'rgba(21,32,48,0.6)'; ctx.lineWidth = 1;
    ctx.strokeRect(s.x, s.y, panelW / 2 - 22, 48);
    ctx.fillStyle = '#7A9AB8'; ctx.font = '12px Arial'; ctx.textAlign = 'left';
    ctx.fillText(s.label, s.x + 12, s.y + 16);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial';
    ctx.fillText(s.val, s.x + 12, s.y + 40);
  });
  ctx.globalAlpha = a;
  // Depth chart
  const depthA = eOut(iR(t, 1100, 1600));
  ctx.globalAlpha = a * depthA;
  ctx.fillStyle = '#7A9AB8'; ctx.font = '14px Arial'; ctx.textAlign = 'left';
  ctx.fillText('PROFUNDIDAD', px + 18, 372);
  const bars = [
    { h: 0.55, col: accent },
    { h: 0.78, col: accent },
    { h: 1.0, col: accent },
    { h: 0.95, col: '#FF4136' },
    { h: 0.70, col: '#FF4136' },
    { h: 0.45, col: '#FF4136' }
  ];
  const barW = (panelW - 44) / bars.length;
  bars.forEach((b, i) => {
    const bx = px + 18 + i * barW;
    const bh = b.h * 60;
    ctx.fillStyle = hexAlpha(b.col, 0.3);
    ctx.fillRect(bx, 440 - bh, barW - 3, bh);
    ctx.fillStyle = b.col;
    ctx.fillRect(bx, 440 - bh, barW - 3, 2);
  });
  ctx.fillStyle = accent; ctx.font = 'bold 15px Arial'; ctx.textAlign = 'left';
  ctx.fillText('C 62.5%', px + 18, 456);
  ctx.fillStyle = '#FF4136'; ctx.textAlign = 'right';
  ctx.fillText('V 37.5%', px + panelW - 18, 456);
  ctx.globalAlpha = a;
  // Support/Resistance
  const srA = eOut(iR(t, 1300, 1800));
  ctx.globalAlpha = a * srA;
  ctx.fillStyle = 'rgba(12,21,32,0.85)'; ctx.fillRect(px + 18, H - 140, panelW / 2 - 22, 50);
  ctx.strokeStyle = 'rgba(21,32,48,0.6)'; ctx.lineWidth = 1; ctx.strokeRect(px + 18, H - 140, panelW / 2 - 22, 50);
  ctx.fillStyle = primary; ctx.fillRect(px + 18, H - 140, panelW / 2 - 22, 3);
  ctx.fillStyle = '#7A9AB8'; ctx.font = '12px Arial'; ctx.textAlign = 'left';
  ctx.fillText('Sup', px + 28, H - 122);
  ctx.fillStyle = '#FFA040'; ctx.font = 'bold 20px Arial';
  ctx.fillText('65,419', px + 28, H - 100);
  ctx.fillStyle = 'rgba(12,21,32,0.85)'; ctx.fillRect(px + panelW / 2 + 2, H - 140, panelW / 2 - 22, 50);
  ctx.strokeStyle = 'rgba(21,32,48,0.6)'; ctx.strokeRect(px + panelW / 2 + 2, H - 140, panelW / 2 - 22, 50);
  ctx.fillStyle = '#FF4136'; ctx.fillRect(px + panelW / 2 + 2, H - 140, panelW / 2 - 22, 3);
  ctx.fillStyle = '#7A9AB8'; ctx.font = '12px Arial';
  ctx.fillText('Res', px + panelW / 2 + 12, H - 122);
  ctx.fillStyle = '#FF6B6B'; ctx.font = 'bold 20px Arial';
  ctx.fillText('90,600', px + panelW / 2 + 12, H - 100);
  ctx.restore();
}

function drawTicker(ctx, W, H, primary, accent, t) {
  const a = eOut(iR(t, 0, 400));
  const tickerH = 80;
  const ty = H - tickerH;
  ctx.save(); ctx.globalAlpha = a;
  // Ticker bg
  ctx.fillStyle = '#0A1220';
  ctx.fillRect(0, ty, W, tickerH);
  ctx.strokeStyle = '#182436'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(W, ty); ctx.stroke();
  // CRIPTO badge
  ctx.fillStyle = primary;
  ctx.fillRect(0, ty, 120, tickerH);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
  ctx.fillText('CRIPTO', 60, ty + 50);
  // Coins data
  const coins = [
    { sym: 'BTC/USDT', price: '77,565', chg: '+0.32%', up: true },
    { sym: 'ETH/USDT', price: '3,240', chg: '+1.10%', up: true },
    { sym: 'DOGE/USDT', price: '0.09816', chg: '+0.21%', up: true },
    { sym: 'SOL/USDT', price: '86.11', chg: '-0.06%', up: false },
    { sym: 'DOT/USDT', price: '1.25', chg: '-0.32%', up: false },
    { sym: 'UNI/USDT', price: '3.25', chg: '+0.25%', up: true },
    { sym: 'AVAX/USDT', price: '9.35', chg: '-0.43%', up: false },
    { sym: 'NEAR/USDT', price: '1.40', chg: '-0.14%', up: false },
    { sym: 'BNB/USDT', price: '598.40', chg: '+0.55%', up: true },
    { sym: 'XRP/USDT', price: '0.512', chg: '-0.18%', up: false }
  ];
  // Duplicate for seamless loop
  const allCoins = [...coins, ...coins];
  const itemW = 280;
  const totalW = coins.length * itemW;
  const scrollX = -(t * 0.06) % totalW;
  const startX = 130;
  ctx.font = '20px Arial'; ctx.textAlign = 'left';
  allCoins.forEach((c, i) => {
    const x = startX + i * itemW + scrollX;
    if (x < startX - itemW || x > W + 50) return;
    // Symbol
    ctx.fillStyle = '#7A9AB8';
    ctx.fillText(c.sym, x, ty + 50);
    // Price + change
    const priceX = x + 130;
    ctx.fillStyle = c.up ? accent : '#FF4136';
    const arrow = c.up ? '\u25B2' : '\u25BC';
    ctx.fillText(c.price + ' ' + arrow + c.chg, priceX, ty + 50);
  });
  ctx.restore();
}

function drawScanline(ctx, W, H, t, primary) {
  const y = (t * 0.05) % (H + 40) - 20;
  ctx.save(); ctx.globalAlpha = 0.15;
  const g = ctx.createLinearGradient(0, y - 20, 0, y + 20);
  g.addColorStop(0, 'transparent');
  g.addColorStop(0.5, hexAlpha(primary, 0.3));
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(0, y - 20, W, 40);
  ctx.strokeStyle = primary; ctx.lineWidth = 1; ctx.globalAlpha = 0.3;
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  ctx.restore();
}

function drawFlash(ctx, W, H, primary, t) {
  const a = 0.06 + 0.08 * Math.sin(t * 0.0016);
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ═══════════════════════════════════════════════════
// MAIN DRAW
// ═══════════════════════════════════════════════════
export function drawIntroTransition(ctx, W, H, progress, p) {
  const t = progress * 18000;
  const primary = p.primaryColor || '#E55A14';
  const accent = p.accentColor || '#00C176';
  const bgColor = p.bgColor || '#06090F';
  const showNeural = p.showNeural !== false;
  const showTicker = p.showTicker !== false;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  // Grid
  drawGrid(ctx, W, H, '#4488FF', 1);

  // Flash
  drawFlash(ctx, W, H, primary, t);

  // Scanline
  drawScanline(ctx, W, H, t, primary);

  // Header
  drawHeader(ctx, W, primary, t, 77565.01);

  // Left panel
  if (showNeural) drawLeftPanel(ctx, W, H, primary, t, showNeural);

  // Center cards (carousel)
  const slideDur = 4500;
  const slideIdx = Math.floor(t / slideDur) % 4;
  drawCenterCard(ctx, W, H, primary, accent, t, slideIdx);

  // Right panel
  drawRightPanel(ctx, W, H, primary, accent, t);

  // Ticker
  if (showTicker) drawTicker(ctx, W, H, primary, accent, t);
}
