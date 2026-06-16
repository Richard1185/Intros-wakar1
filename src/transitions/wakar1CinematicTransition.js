import wakaLogo from './wakaLogo_256x256.png';

const logoImg = new Image();
logoImg.src = wakaLogo;

export const wakar1CinematicTransition = {
  id: "wakar1_cinematic",
  name: "WAKAR1 Cinematic",
  category: "Branding",
  icon: "🎬",
  description: "Intro cinematográfica de 7 escenas",
  duration: 24500,
  color: "#0066ff",
  tags: ["intro", "cinematic", "wakar1", "branding"],
  params: [],
};

function mkRng(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

const SCENES = [
  { name: 'EL CAOS', start: 0, end: 3500 },
  { name: 'ZOOM IA', start: 3500, end: 6000 },
  { name: 'APP LOCAL', start: 6000, end: 9000 },
  { name: 'EL DESPERTAR', start: 9000, end: 12500 },
  { name: 'DASHBOARD', start: 12500, end: 17000 },
  { name: 'TOKEN WAKA', start: 17000, end: 20500 },
  { name: 'LOGO FINAL', start: 20500, end: 24500 },
];

function eOut(t) { return 1 - Math.pow(1 - t, 3); }
function eIn(t) { return t * t * t; }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

function drawGrid(ctx, W, H, a = 0.04) {
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#00c864'; ctx.lineWidth = 0.5;
  const gx = W / 32, gy = H / 18;
  for (let i = 0; i <= 32; i++) { ctx.beginPath(); ctx.moveTo(i * gx, 0); ctx.lineTo(i * gx, H); ctx.stroke(); }
  for (let j = 0; j <= 18; j++) { ctx.beginPath(); ctx.moveTo(0, j * gy); ctx.lineTo(W, j * gy); ctx.stroke(); }
  ctx.restore();
}

function drawScanline(ctx, W, H, a = 0.12) {
  ctx.save(); ctx.globalAlpha = a;
  for (let y = 0; y < H; y += 4) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, y, W, 1);
  }
  ctx.restore();
}

function drawVignette(ctx, W, H) {
  const grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.25, W / 2, H / 2, W * 0.7);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawLine(ctx, x1, y1, x2, y2, col, a, lw = 1, dash = []) {
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = lw;
  ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
}

// ── ESCENA 1: EL CAOS ──────────────────────────────
function drawScene1(ctx, W, H, progress, rng) {
  // Fondo
  ctx.fillStyle = '#050c14';
  ctx.fillRect(0, 0, W, H);

  // Chaotic radial gradients
  const grad1 = ctx.createRadialGradient(W * 0.3, H * 0.5, 0, W * 0.3, H * 0.5, W * 0.4);
  grad1.addColorStop(0, 'rgba(180,0,0,0.25)');
  grad1.addColorStop(1, 'transparent');
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, W, H);

  const grad2 = ctx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, W * 0.3);
  grad2.addColorStop(0, 'rgba(180,50,0,0.15)');
  grad2.addColorStop(1, 'transparent');
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, W, H);

  // Error boxes
  const errors = [
    { text: '⚠ API KEY ERROR — INVALID TOKEN', x: W * 0.09, y: H * 0.25, w: W * 0.22 },
    { text: '✕ CONNECTION TIMEOUT', x: W * 0.39, y: H * 0.36, w: W * 0.17 },
    { text: '⚠ KPI KEY ERROR — CODE 403', x: W * 0.62, y: H * 0.21, w: W * 0.19 },
    { text: '✕ MARKET DATA FAILED', x: W * 0.23, y: H * 0.58, w: W * 0.16 },
    { text: '⚠ EXECUTION ERROR — RETRY?', x: W * 0.55, y: H * 0.54, w: W * 0.2 },
  ];

  errors.forEach((e, i) => {
    const flicker = 0.6 + 0.4 * Math.abs(Math.sin(progress * 20 + i * 2));
    ctx.globalAlpha = flicker;
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(255,0,0,0.12)';
    ctx.beginPath();
    ctx.roundRect(e.x, e.y, e.w, H * 0.05, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ff5555';
    ctx.font = `bold ${H * 0.018}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(e.text, e.x + 12, e.y + H * 0.033);
  });
  ctx.globalAlpha = 1;

  // Chaotic chart lines
  const rng1 = mkRng(42);
  const pts1 = [];
  for (let i = 0; i < 15; i++) pts1.push({ x: W * 0.06 + (i / 14) * W * 0.38, y: H * 0.36 + (rng1() - 0.5) * H * 0.18 });
  ctx.strokeStyle = '#cc2222';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  pts1.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();
  ctx.globalAlpha = 1;

  const rng2 = mkRng(99);
  const pts2 = [];
  for (let i = 0; i < 11; i++) pts2.push({ x: W * 0.64 + (i / 10) * W * 0.3, y: H * 0.3 + (rng2() - 0.5) * H * 0.2 });
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  pts2.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Logo superior izquierdo
  if (logoImg.complete) {
    const logoSize = H * 0.08;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.shadowColor = 'rgba(255,0,0,0.3)';
    ctx.shadowBlur = 12;
    ctx.drawImage(logoImg, W * 0.03, H * 0.04, logoSize, logoSize);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Title
  const pulse = 1 + 0.02 * Math.sin(progress * 40);
  ctx.save();
  ctx.translate(W / 2, H * 0.83);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#cc2222';
  ctx.font = `900 ${H * 0.07}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(255,0,0,0.5)';
  ctx.shadowBlur = 30;
  ctx.fillText('EL CAOS', 0, 0);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#aa3333';
  ctx.font = `400 ${H * 0.025}px system-ui, sans-serif`;
  ctx.fillText('MERCADO SATURADO · ERRORES · ESTRÉS', 0, H * 0.05);
  ctx.restore();
}

// ── ESCENA 2: ZOOM IA ──────────────────────────────
function drawScene2(ctx, W, H, progress) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // Burst lines
  const burstScale = eOut(Math.min(progress * 3, 1));
  const burstAlpha = progress > 0.6 ? 1 - (progress - 0.6) * 2.5 : 1;
  ctx.save();
  ctx.globalAlpha = burstAlpha;
  ctx.translate(W / 2, H / 2);
  ctx.scale(burstScale, burstScale);
  const lineCount = 8;
  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const r1 = W * 0.08;
    const r2 = W * 0.4;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = i % 2 === 0 ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
    ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
    ctx.stroke();
  }
  ctx.restore();

  // AI names
  const names = [
    { text: 'Gemma', x: W * 0.23, y: H * 0.28, col: '#00ff88', delay: 0.15 },
    { text: 'DeepSeek', x: W * 0.72, y: H * 0.39, col: '#0088ff', delay: 0.3 },
    { text: 'Qwen', x: W * 0.27, y: H * 0.69, col: '#ff44ff', delay: 0.45 },
    { text: 'Claude', x: W * 0.74, y: H * 0.61, col: '#ffaa00', delay: 0.6 },
  ];
  names.forEach(n => {
    const t = clamp((progress - n.delay) * 4, 0, 1);
    const scale = eOut(t);
    const alpha = t;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(n.x, n.y);
    ctx.scale(scale, scale);
    ctx.fillStyle = n.col;
    ctx.font = `900 ${H * 0.04}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.shadowColor = n.col;
    ctx.shadowBlur = 20;
    ctx.fillText(n.text, 0, 0);
    ctx.shadowBlur = 0;
    ctx.restore();
  });

  // IA word
  const iaT = clamp((progress - 0.1) * 3, 0, 1);
  const iaScale = iaT < 0.4 ? eOut(iaT / 0.4) * 3 : 3 - (iaT - 0.4) * 2;
  const iaAlpha = iaT < 0.4 ? 1 : clamp(1 - (iaT - 0.4) * 3, 0, 1);
  ctx.save();
  ctx.globalAlpha = iaAlpha;
  ctx.translate(W / 2, H / 2);
  const finalScale = Math.max(0, iaScale);
  ctx.scale(finalScale, finalScale);
  ctx.fillStyle = '#fff';
  ctx.font = `900 ${H * 0.16}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255,255,255,0.5)';
  ctx.shadowBlur = 60;
  ctx.fillText('IA', 0, 0);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ── ESCENA 3: APP LOCAL ──────────────────────────────
function drawScene3(ctx, W, H, progress) {
  ctx.fillStyle = '#020810';
  ctx.fillRect(0, 0, W, H);

  // Terminal
  const termX = W * 0.06, termY = H * 0.11, termW = W * 0.39, termH = H * 0.47;
  ctx.fillStyle = 'rgba(0,20,10,0.9)';
  ctx.strokeStyle = '#0f3a1a';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(termX, termY, termW, termH, 4); ctx.fill(); ctx.stroke();

  // Terminal header
  ctx.fillStyle = '#005522';
  ctx.font = `bold ${H * 0.015}px monospace`;
  ctx.textAlign = 'left';
  ctx.fillText('WAKAR1 // MODO OSCURO // LOCAL_ENV', termX + 12, termY + H * 0.03);

  // Terminal lines
  const termLines = [
    '> INICIANDO WAKAR1 LOCAL...',
    '> MODO OSCURO ACTIVADO',
    '> CARGANDO AGENTES IA...',
    '> GEMMA CONECTADA ✓',
    '> DEEPSEEK CONECTADO ✓',
    '> QWEN CONECTADO ✓',
    '> BINANCE API: LECTURA ACTIVA',
    '> RAG FINANCIERO: ONLINE',
    '> TURBO QUANT: READY',
    '> SISTEMA LISTO ■'
  ];
  const linesPerSec = 3.5;
  const visibleLines = Math.floor(progress * 3 * linesPerSec);

  ctx.font = `${H * 0.018}px 'Courier New', monospace`;
  termLines.forEach((line, i) => {
    if (i > visibleLines) return;
    const ly = termY + H * 0.055 + i * H * 0.038;
    ctx.fillStyle = line.includes('✓') ? '#00ff88' : '#00aa44';
    ctx.fillText(line, termX + 12, ly);
  });

  // Cursor blink
  if (visibleLines < termLines.length) {
    const curY = termY + H * 0.055 + visibleLines * H * 0.038;
    const blink = Math.sin(progress * 60) > 0;
    if (blink) {
      ctx.fillStyle = '#00ff66';
      ctx.fillText('█', termX + 12, curY);
    }
  }

  // Privacy badge
  const privX = W * 0.62, privY = H * 0.11, privW = W * 0.34, privH = H * 0.25;
  ctx.fillStyle = 'rgba(0,10,5,0.95)';
  ctx.strokeStyle = '#003322';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(privX, privY, privW, privH, 4); ctx.fill(); ctx.stroke();

  // Lock icon
  ctx.fillStyle = '#00aa44';
  ctx.font = `${H * 0.06}px serif`;
  ctx.textAlign = 'center';
  ctx.fillText('🔒', privX + privW / 2, privY + privH * 0.4);

  ctx.fillStyle = '#00aa44';
  ctx.font = `bold ${H * 0.022}px system-ui, sans-serif`;
  ctx.fillText('PRIVADO', privX + privW / 2, privY + privH * 0.65);

  ctx.fillStyle = '#005522';
  ctx.font = `${H * 0.016}px system-ui, sans-serif`;
  ctx.fillText('MODO LOCAL · SIN NUBE · SEGURO', privX + privW / 2, privY + privH * 0.82);

  // Bottom text
  ctx.fillStyle = '#00aa44';
  ctx.font = `900 ${H * 0.05}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,200,80,0.5)';
  ctx.shadowBlur = 20;
  ctx.fillText('MODO OSCURO · PRIVADO', W / 2, H * 0.88);
  ctx.shadowBlur = 0;

  // Monitor
  const monX = W * 0.62, monY = H * 0.14, monW = W * 0.37, monH = H * 0.42;
  ctx.strokeStyle = '#003322';
  ctx.lineWidth = 2;
  ctx.fillStyle = '#010a05';
  ctx.beginPath(); ctx.roundRect(monX, monY, monW, monH, 0); ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#004422';
  ctx.font = `${H * 0.016}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('WAKAR1 · APP LOCAL', monX + monW / 2, monY + monH * 0.2);

  ctx.fillStyle = '#00ff88';
  ctx.font = `900 ${H * 0.065}px system-ui, sans-serif`;
  ctx.shadowColor = 'rgba(0,255,136,0.5)';
  ctx.shadowBlur = 30;
  ctx.fillText('W', monX + monW / 2, monY + monH * 0.55);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#003322';
  ctx.font = `${H * 0.014}px system-ui, sans-serif`;
  ctx.fillText('INICIALIZANDO AGENTES...', monX + monW / 2, monY + monH * 0.78);
}

// ── ESCENA 4: EL DESPERTAR ──────────────────────────
function drawScene4(ctx, W, H, progress) {
  ctx.fillStyle = '#020810';
  ctx.fillRect(0, 0, W, H);

  // Pulse rings
  for (let i = 0; i < 3; i++) {
    const ringProgress = ((progress * 2 + i * 0.33) % 1);
    const ringR = 30 + ringProgress * W * 0.4;
    const ringA = (1 - ringProgress) * 0.5;
    ctx.save();
    ctx.globalAlpha = ringA;
    ctx.strokeStyle = ['#0044ff', '#0088ff', '#00aaff'][i];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Logo circle
  const logoR = W * 0.08;
  const glow = 30 + 30 * Math.sin(progress * 8);
  ctx.save();
  ctx.shadowColor = 'rgba(0,100,255,0.8)';
  ctx.shadowBlur = glow;
  const logoGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, logoR);
  logoGrad.addColorStop(0, '#0066ff');
  logoGrad.addColorStop(1, '#003399');
  ctx.fillStyle = logoGrad;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, logoR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Logo image
  if (logoImg.complete) {
    const imgSize = logoR * 1.6;
    ctx.save();
    ctx.shadowColor = 'rgba(0,100,255,0.8)';
    ctx.shadowBlur = glow;
    ctx.drawImage(logoImg, W / 2 - imgSize / 2, H / 2 - imgSize / 2, imgSize, imgSize);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Agent nodes
  const agents = [
    { x: W * 0.19, y: H * 0.46, col: '#0066ff', ico: '🤖', label: 'IA 1', delay: 0.15 },
    { x: W * 0.45, y: H * 0.25, col: '#00ff88', ico: '⚡', label: 'IA 2', delay: 0.3 },
    { x: W * 0.81, y: H * 0.46, col: '#ff44ff', ico: '🧠', label: 'IA 3', delay: 0.45 },
  ];

  // Connection lines
  agents.forEach(a => {
    const t = clamp((progress - a.delay) * 3, 0, 1);
    if (t > 0) {
      const lineA = t * 0.4;
      drawLine(ctx, W / 2, H / 2, a.x, a.y, a.col, lineA, 1, [4, 4]);
    }
  });

  agents.forEach(a => {
    const t = clamp((progress - a.delay) * 3, 0, 1);
    if (t <= 0) return;
    const scale = t < 0.8 ? eOut(t / 0.8) : 1 + 0.15 * Math.sin((t - 0.8) * 20);
    const nodeR = W * 0.05;
    ctx.save();
    ctx.globalAlpha = t;
    ctx.translate(a.x, a.y);
    ctx.scale(scale, scale);

    ctx.fillStyle = 'rgba(0,20,50,0.9)';
    ctx.strokeStyle = a.col;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, nodeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = `${H * 0.03}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(a.ico, 0, -H * 0.01);

    ctx.fillStyle = a.col;
    ctx.font = `bold ${H * 0.013}px system-ui, sans-serif`;
    ctx.fillText(a.label, 0, H * 0.03);

    ctx.restore();
  });

  // Awaken text
  const textA = clamp((progress - 0.6) * 3, 0, 1);
  if (textA > 0) {
    const glow2 = 30 + 30 * Math.sin(progress * 6);
    ctx.save();
    ctx.globalAlpha = textA;
    ctx.fillStyle = '#0099ff';
    ctx.font = `900 ${H * 0.058}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,150,255,0.7)';
    ctx.shadowBlur = glow2;
    ctx.fillText('EL DESPERTAR', W / 2, H * 0.86);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

// ── ESCENA 5: DASHBOARD ──────────────────────────────
function drawScene5(ctx, W, H, progress) {
  ctx.fillStyle = '#020810';
  ctx.fillRect(0, 0, W, H);

  const dashX = W * 0.03, dashY = H * 0.05, dashW = W * 0.94, dashH = H * 0.9;
  ctx.strokeStyle = '#0a2a1a';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#030f08';
  ctx.beginPath(); ctx.roundRect(dashX, dashY, dashW, dashH, 4); ctx.fill(); ctx.stroke();

  // Header
  const hdrY = dashY;
  ctx.fillStyle = '#050c14';
  ctx.fillRect(dashX, hdrY, dashW, H * 0.07);
  ctx.strokeStyle = '#0a2a1a';
  ctx.beginPath(); ctx.moveTo(dashX, hdrY + H * 0.07); ctx.lineTo(dashX + dashW, hdrY + H * 0.07); ctx.stroke();

  ctx.fillStyle = '#00ff88';
  ctx.font = `900 ${H * 0.025}px system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('WAKAR1', dashX + W * 0.015, hdrY + H * 0.048);

  // Badge
  const badgeX = dashX + W * 0.09;
  ctx.fillStyle = 'rgba(0,255,136,0.15)';
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(badgeX, hdrY + H * 0.015, W * 0.08, H * 0.038, 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#00ff88';
  ctx.font = `bold ${H * 0.015}px system-ui, sans-serif`;
  ctx.fillText('IA ACTIVA', badgeX + W * 0.008, hdrY + H * 0.042);

  // LIVE
  const liveBlink = Math.sin(progress * 30) > 0;
  ctx.fillStyle = liveBlink ? '#ff4444' : 'transparent';
  ctx.font = `bold ${H * 0.015}px system-ui, sans-serif`;
  ctx.fillText('● LIVE', dashX + W * 0.19, hdrY + H * 0.042);

  ctx.fillStyle = '#003322';
  ctx.font = `${H * 0.014}px system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText('MAIN DASHBOARD · D3.js STYLE', dashX + dashW - W * 0.015, hdrY + H * 0.042);
  ctx.textAlign = 'left';

  // Sidebar
  const sbX = dashX, sbY = dashY + H * 0.072, sbW = W * 0.16, sbH = dashH - H * 0.072;
  ctx.fillStyle = '#030f08';
  ctx.fillRect(sbX, sbY, sbW, sbH);
  ctx.strokeStyle = '#0a2a1a';
  ctx.beginPath(); ctx.moveTo(sbX + sbW, sbY); ctx.lineTo(sbX + sbW, sbY + sbH); ctx.stroke();

  const menuItems = ['◎ Dashboard', '▸ Gráficos', '◎ Agentes', '◎ Scanner', '◎ Logs'];
  menuItems.forEach((item, i) => {
    const isActive = i === 1;
    const iy = sbY + H * 0.04 + i * H * 0.045;
    ctx.fillStyle = isActive ? '#00ff88' : '#005522';
    ctx.font = `${H * 0.016}px system-ui, sans-serif`;
    ctx.fillText(item, sbX + W * 0.012, iy);
    if (isActive) {
      ctx.fillStyle = 'rgba(0,255,136,0.05)';
      ctx.fillRect(sbX, iy - H * 0.028, sbW, H * 0.038);
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(sbX, iy - H * 0.028, 3, H * 0.038);
    }
  });

  // Agents section
  const agentsY = sbY + H * 0.3;
  ctx.fillStyle = '#003322';
  ctx.font = `${H * 0.013}px system-ui, sans-serif`;
  ctx.fillText('AGENTES ACTIVOS', sbX + W * 0.012, agentsY);
  ctx.fillStyle = '#00ff88'; ctx.font = `${H * 0.015}px system-ui, sans-serif`;
  ctx.fillText('● AG-1 SOLANA', sbX + W * 0.012, agentsY + H * 0.03);
  ctx.fillStyle = '#0088ff';
  ctx.fillText('● AG-2 BTC', sbX + W * 0.012, agentsY + H * 0.06);
  ctx.fillStyle = '#ff44ff';
  ctx.fillText('● AG-3 ETH', sbX + W * 0.012, agentsY + H * 0.09);

  // Chart area
  const chX = sbX + sbW + W * 0.003, chY = sbY, chW = dashW - sbW - W * 0.22, chH = sbH;
  ctx.fillStyle = '#030f08';
  ctx.fillRect(chX, chY, chW, chH);
  ctx.fillStyle = '#00aa44';
  ctx.font = `${H * 0.014}px system-ui, sans-serif`;
  ctx.fillText('BTC/USDT · ANÁLISIS EN TIEMPO REAL', chX + W * 0.012, chY + H * 0.035);

  // Grid lines in chart
  for (let i = 0; i < 3; i++) {
    const gy = chY + chH * (0.15 + i * 0.25);
    drawLine(ctx, chX, gy, chX + chW, gy, '#0a2a1a', 0.5);
    ctx.fillStyle = '#005522';
    ctx.font = `${H * 0.013}px monospace`;
    ctx.fillText(`${29000 - i * 500}`, chX + W * 0.012, gy - 4);
  }

  // Candles
  const rng = mkRng(777);
  const candleCount = Math.min(25, Math.floor(progress * 4 * 25));
  let price = 140;
  for (let i = 0; i < candleCount; i++) {
    const cx = chX + W * 0.04 + i * (chW * 0.035);
    const open = price;
    const close = price + (rng() - 0.45) * 25;
    const high = Math.max(open, close) + rng() * 12;
    const low = Math.min(open, close) - rng() * 12;
    price = close;
    const up = close >= open;
    const col = up ? '#00aa44' : '#cc2222';
    const bodyTop = chY + chH * 0.15 + (Math.min(open, close) / 300) * chH * 0.6;
    const bodyH = Math.max(2, Math.abs(close - open) / 300 * chH * 0.6);
    const wickTop = chY + chH * 0.15 + (high / 300) * chH * 0.6;
    const wickBot = chY + chH * 0.15 + (low / 300) * chH * 0.6;

    ctx.strokeStyle = col;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, wickTop); ctx.lineTo(cx, wickBot); ctx.stroke();
    ctx.fillStyle = col;
    ctx.fillRect(cx - 4, bodyTop, 8, bodyH);
  }

  // Signals panel
  const sigX = dashX + dashW - W * 0.2, sigY = sbY, sigW = W * 0.2, sigH = sbH;
  ctx.fillStyle = '#030f08';
  ctx.fillRect(sigX, sigY, sigW, sigH);
  ctx.strokeStyle = '#0a2a1a';
  ctx.beginPath(); ctx.moveTo(sigX, sigY); ctx.lineTo(sigX, sigY + sigH); ctx.stroke();

  ctx.fillStyle = '#005522';
  ctx.font = `${H * 0.014}px system-ui, sans-serif`;
  ctx.fillText('FLASH SIGNALS', sigX + W * 0.012, sigY + H * 0.04);

  // Buy/Sell buttons
  ctx.fillStyle = '#00aa44';
  ctx.beginPath(); ctx.roundRect(sigX + W * 0.012, sigY + H * 0.06, W * 0.07, H * 0.045, 2); ctx.fill();
  ctx.fillStyle = '#001100';
  ctx.font = `bold ${H * 0.018}px system-ui, sans-serif`;
  ctx.fillText('COMPRA', sigX + W * 0.025, sigY + H * 0.092);

  const sellBlink = Math.sin(progress * 15) > 0;
  ctx.fillStyle = sellBlink ? '#cc2222' : 'transparent';
  ctx.beginPath(); ctx.roundRect(sigX + W * 0.085, sigY + H * 0.06, W * 0.07, H * 0.045, 2); ctx.fill();
  ctx.strokeStyle = '#cc2222';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(sigX + W * 0.085, sigY + H * 0.06, W * 0.07, H * 0.045, 2); ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${H * 0.018}px system-ui, sans-serif`;
  ctx.fillText('VENTA', sigX + W * 0.1, sigY + H * 0.092);

  // Price feeds
  ctx.fillStyle = '#005522';
  ctx.font = `${H * 0.014}px system-ui, sans-serif`;
  ctx.fillText('LIVE PRICE FEEDS', sigX + W * 0.012, sigY + H * 0.14);

  const prices = [
    { label: '● AG-1', val: '18,370', chg: '+1.20%', up: true },
    { label: '● AG-2', val: '10,208', chg: '-8.05%', up: false },
    { label: '● AG-3', val: '10,794', chg: '-8.85%', up: false },
  ];
  prices.forEach((p, i) => {
    const py = sigY + H * (0.17 + i * 0.055);
    ctx.fillStyle = '#005522';
    ctx.font = `${H * 0.015}px system-ui, sans-serif`;
    ctx.fillText(p.label, sigX + W * 0.012, py);
    ctx.fillStyle = '#00cc55';
    ctx.font = `${H * 0.015}px monospace`;
    ctx.fillText(p.val, sigX + W * 0.06, py);
    ctx.fillStyle = p.up ? '#00ff88' : '#ff4444';
    ctx.font = `${H * 0.014}px system-ui, sans-serif`;
    ctx.fillText(p.chg, sigX + W * 0.13, py);
  });

  // Agent log
  const logY = sigY + H * 0.36;
  ctx.fillStyle = 'rgba(0,255,136,0.05)';
  ctx.strokeStyle = '#0a3a1a';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(sigX + W * 0.01, logY, sigW - W * 0.02, H * 0.18, 3); ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#00aa44';
  ctx.font = `${H * 0.014}px monospace`;
  ctx.fillText('▸ AG-1: SOLANA TREND ANALYSIS', sigX + W * 0.02, logY + H * 0.04);
  ctx.fillStyle = '#00ff88';
  ctx.fillText('✓ HIGH CONFIDENCE SIGNAL', sigX + W * 0.02, logY + H * 0.08);

  const logMsgs = ['▸ AG-1: SOLANA TREND — HIGH CONF', '▸ AG-2: BTC BREAKOUT DETECTED', '▸ AG-3: ETH CONSOLIDATION', '▸ SCANNER: NEW SIGNAL WAKA/SOL'];
  const logIdx = Math.floor(progress * 4 * logMsgs.length) % logMsgs.length;
  ctx.fillStyle = '#005522';
  ctx.fillText(logMsgs[logIdx], sigX + W * 0.02, logY + H * 0.13);
}

// ── ESCENA 6: TOKEN WAKA ──────────────────────────────
function drawScene6(ctx, W, H, progress) {
  ctx.fillStyle = '#020810';
  ctx.fillRect(0, 0, W, H);

  // Radial glow
  const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5);
  grad.addColorStop(0, 'rgba(0,80,255,0.15)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Solana badge
  const solX = W * 0.08, solY = H * 0.5;
  const solR = W * 0.12;
  const solGlow = 40 + 30 * Math.sin(progress * 6);
  ctx.save();
  ctx.shadowColor = 'rgba(153,69,255,0.6)';
  ctx.shadowBlur = solGlow;
  const solGrad = ctx.createRadialGradient(solX, solY, 0, solX, solY, solR);
  solGrad.addColorStop(0, '#9945ff');
  solGrad.addColorStop(1, '#6611cc');
  ctx.fillStyle = solGrad;
  ctx.beginPath(); ctx.arc(solX, solY, solR, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#fff';
  ctx.font = `${H * 0.05}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('◎', solX, solY - H * 0.03);
  ctx.font = `900 ${H * 0.038}px system-ui, sans-serif`;
  ctx.fillText('SOLANA', solX, solY + H * 0.03);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = `${H * 0.018}px system-ui, sans-serif`;
  ctx.fillText('SOL', solX, solY + H * 0.065);

  // Token reveal
  const tokenX = W / 2, tokenY = H * 0.4;
  const tokenR = W * 0.15;
  const tokenGlow = 60 + 40 * Math.sin(progress * 4);
  ctx.save();
  ctx.shadowColor = 'rgba(0,85,255,0.5)';
  ctx.shadowBlur = tokenGlow;
  ctx.strokeStyle = '#0055ff';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(tokenX, tokenY, tokenR, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = tokenGlow * 0.5;
  ctx.strokeStyle = 'rgba(0,85,255,0.2)';
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(tokenX, tokenY, tokenR, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  // Logo image
  if (logoImg.complete) {
    const imgSize = tokenR * 1.6;
    ctx.save();
    ctx.shadowColor = 'rgba(0,136,255,0.8)';
    ctx.shadowBlur = 40;
    ctx.drawImage(logoImg, tokenX - imgSize / 2, tokenY - imgSize / 2, imgSize, imgSize);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  ctx.fillStyle = '#fff';
  ctx.font = `900 ${H * 0.085}px system-ui, sans-serif`;
  ctx.fillText('WAKA', tokenX, tokenY + tokenR + H * 0.06);

  ctx.fillStyle = '#0066cc';
  ctx.font = `${H * 0.024}px system-ui, sans-serif`;
  ctx.fillText('TOKEN · WAKA/SOL · OPORTUNIDAD', tokenX, tokenY + tokenR + H * 0.11);

  // Bar chart
  const rng = mkRng(333);
  const barCount = Math.min(16, Math.floor(progress * 3 * 16));
  const barContX = W * 0.76, barContY = H * 0.85;
  for (let i = 0; i < barCount; i++) {
    const bh = (20 + i * 11) * eOut(clamp((progress * 3 - i * 0.05), 0, 1));
    const bx = barContX + i * (W * 0.018);
    const alpha = 0.5 + (i / 16) * 0.5;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#00aa44';
    ctx.fillRect(bx, barContY - bh, W * 0.015, bh);
  }
  ctx.globalAlpha = 1;

  // Bottom text
  ctx.fillStyle = '#003366';
  ctx.font = `${H * 0.017}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('ANÁLISIS IA COMPLETO → OPORTUNIDAD DETECTADA', W / 2, H * 0.92);
}

// ── ESCENA 7: LOGO FINAL ──────────────────────────────
function drawScene7(ctx, W, H, progress, rng) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // Radial bg
  const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5);
  grad.addColorStop(0, 'rgba(0,50,150,0.3)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Particles
  const rng2 = mkRng(123);
  for (let i = 0; i < 40; i++) {
    const angle = rng2() * Math.PI * 2;
    const dist = rng2() * W * 0.4;
    const life = (progress * 2 + rng2()) % 1;
    const px = W / 2 + Math.cos(angle) * dist * life;
    const py = H / 2 + Math.sin(angle) * dist * life;
    const alpha = (1 - life) * 0.6;
    const cols = ['#00ff88', '#0088ff', '#ff44ff', '#ffaa00'];
    ctx.fillStyle = cols[i % 4];
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Logo
  const glow2 = 80 + 70 * Math.sin(progress * 6);
  ctx.save();
  ctx.shadowColor = 'rgba(0,100,255,0.8)';
  ctx.shadowBlur = glow2;
  ctx.fillStyle = '#0066ff';
  ctx.font = `900 ${H * 0.2}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WAKAR1', W / 2, H * 0.42);
  ctx.shadowBlur = 0;
  ctx.restore();

  ctx.fillStyle = '#fff';
  ctx.font = `300 ${H * 0.05}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('TRADING CON IA', W / 2, H * 0.55);

  ctx.fillStyle = '#005599';
  ctx.font = `${H * 0.022}px system-ui, sans-serif`;
  ctx.fillText('wakar1.com', W / 2, H * 0.6);

  // Tagline
  ctx.fillStyle = '#003366';
  ctx.font = `700 ${H * 0.02}px system-ui, sans-serif`;
  ctx.letterSpacing = '8px';
  ctx.fillText('CAOS → CONTROL · IA EN TIEMPO REAL', W / 2, H * 0.88);
}

// ── MAIN DRAW ──────────────────────────────────────
export function drawWakar1CinematicTransition(ctx, W, H, progress, p) {
  const elapsed = progress * 24500;
  const rng = mkRng(Math.floor(elapsed / 100));

  // Background grid (all scenes)
  drawGrid(ctx, W, H, 0.04);

  // Determine which scene
  for (let i = 0; i < SCENES.length; i++) {
    const s = SCENES[i];
    if (elapsed >= s.start && elapsed < s.end) {
      const sceneProgress = (elapsed - s.start) / (s.end - s.start);

      switch (i) {
        case 0: drawScene1(ctx, W, H, sceneProgress, rng); break;
        case 1: drawScene2(ctx, W, H, sceneProgress); break;
        case 2: drawScene3(ctx, W, H, sceneProgress); break;
        case 3: drawScene4(ctx, W, H, sceneProgress); break;
        case 4: drawScene5(ctx, W, H, sceneProgress); break;
        case 5: drawScene6(ctx, W, H, sceneProgress); break;
        case 6: drawScene7(ctx, W, H, sceneProgress, rng); break;
      }
      break;
    }
  }

  // Overlays (all scenes)
  drawScanline(ctx, W, H, 0.12);
  drawVignette(ctx, W, H);
}
