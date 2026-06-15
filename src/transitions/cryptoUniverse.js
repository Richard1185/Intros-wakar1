// ─── Crypto Universe Transition ────────────────────────────────────────────
// Adaptado del HTML original al sistema de canvas de WAKAR1

export const cryptoUniverseTransition = {
  id: 'crypto_universe',
  name: 'Crypto Universe',
  category: 'Market',
  icon: '🌌',
  description: 'BTC, ETH, SOL, DeFi y Universe — visualización blockchain',
  duration: 12000,
  color: '#00d4ff',
  tags: ['crypto', 'bitcoin', 'ethereum', 'defi', 'universe'],
  params: [
    {
      id: 'scene',
      label: 'Escena',
      type: 'select',
      default: '0',
      options: ['0', '1', '2', '3', '4'],
    },
    {
      id: 'showTitle',
      label: 'Mostrar Título',
      type: 'toggle',
      default: true,
    },
  ],
};

// ── Seeded RNG ──────────────────────────────────────────────────────────────
function mkRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(1664525, s) + 1013904223 >>> 0;
    return s / 0xffffffff;
  };
}

// ── Deterministic Price Data ────────────────────────────────────────────────
function genPrice(seed, points, start, vol) {
  const rng = mkRng(seed);
  const data = [];
  let price = start;
  for (let i = 0; i < points; i++) {
    price += (rng() - 0.5) * vol;
    data.push(Math.max(price, 1));
  }
  return data;
}

// ── Particle & Node Cache ───────────────────────────────────────────────────
let _particles = null;
let _nodes = null;
let _lastScene = -1;

function drawCryptopCenter(ctx, x, y, size, t) {
  const pulse = 1 + Math.sin(t * 0.0018) * 0.05;
  const s = size * pulse;

  ctx.save();
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = size * 0.18;

  ctx.beginPath();
  ctx.arc(x, y, s * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,212,255,0.2)';
  ctx.fill();
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = s * 0.03;
  ctx.stroke();
  ctx.fillStyle = '#00d4ff';
  ctx.font = `bold ${s * 0.22}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CRIPTOP', x, y);

  ctx.restore();
}

function initCache(scene, W, H) {
  if (_lastScene === scene && _particles && _nodes) return;
  _lastScene = scene;

  const rng = mkRng(scene * 31337 + 7);
  const count = [100, 80, 150, 100, 120][scene] || 100;
  _particles = Array.from({ length: count }, (_, i) => ({
    x: rng() * W,
    y: rng() * H,
    vx: (rng() - 0.5) * 0.8,
    vy: -(rng() * 2 + 0.5),
    size: rng() * 3 + 1,
    life: rng(),
    decay: rng() * 0.003 + 0.002,
    angle: rng() * Math.PI * 2,
    spin: (rng() - 0.5) * 0.05,
    shape: i % 3, // 0=square, 1=circle, 2=triangle
  }));

  const nodeCount = [20, 25, 15, 20, 30][scene] || 20;
  const nrng = mkRng(scene * 9999 + 1);
  _nodes = Array.from({ length: nodeCount }, () => ({
    x: nrng() * W,
    y: nrng() * H,
    vx: (nrng() - 0.5) * 0.4,
    vy: (nrng() - 0.5) * 0.4,
    size: nrng() * 4 + 3,
  }));
}

function updateParticles(W, H) {
  if (!_particles) return;
  const rng = mkRng(Date.now() & 0xffff); // slight randomness for life resets
  for (const p of _particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.angle += p.spin;
    p.life -= p.decay;
    if (p.life <= 0 || p.y < -10) {
      p.x = rng() * W;
      p.y = H + 10;
      p.life = 0.8 + rng() * 0.2;
    }
  }
}

function updateNodes(W, H) {
  if (!_nodes) return;
  for (const n of _nodes) {
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > W) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;
  }
}

// ── Draw Helpers ────────────────────────────────────────────────────────────
function drawParticles(ctx, color) {
  if (!_particles) return;
  for (const p of _particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life * 0.55);
    ctx.fillStyle = color;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    if (p.shape === 0) {
      ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
    } else if (p.shape === 1) {
      ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size, p.size);
      ctx.lineTo(-p.size, p.size);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
}

function drawNodes(ctx, color) {
  if (!_nodes) return;
  for (const n of _nodes) {
    ctx.save();
    ctx.beginPath(); ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowBlur = 10; ctx.shadowColor = color;
    ctx.fill(); ctx.restore();
  }
}

function drawNetwork(ctx, color, alpha) {
  if (!_nodes) return;
  ctx.save(); ctx.globalAlpha = alpha * 0.25; ctx.strokeStyle = color; ctx.lineWidth = 0.8;
  for (let i = 0; i < _nodes.length; i++) {
    for (let j = i + 1; j < _nodes.length; j++) {
      const dx = _nodes[i].x - _nodes[j].x, dy = _nodes[i].y - _nodes[j].y;
      if (dx * dx + dy * dy < 22500) {
        ctx.beginPath();
        ctx.moveTo(_nodes[i].x, _nodes[i].y);
        ctx.lineTo(_nodes[j].x, _nodes[j].y);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function drawChart(ctx, data, x, y, w, h, color, fill = true) {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 2.5;
  ctx.shadowColor = color; ctx.shadowBlur = 8;
  ctx.beginPath();
  data.forEach((v, i) => {
    const px = x + (i / (data.length - 1)) * w;
    const py = y + h - ((v - min) / range) * h;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  });
  ctx.stroke();
  if (fill) {
    const last = data.length - 1;
    ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath();
    ctx.fillStyle = color + '25'; ctx.fill();
  }
  ctx.restore();
}

// ── Crypto Logos ────────────────────────────────────────────────────────────
function logoBTC(ctx, x, y, s) {
  ctx.save();
  const grad = ctx.createRadialGradient(x, y, 0, x, y, s * 1.8);
  grad.addColorStop(0, 'rgba(247,147,26,0.25)'); grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, s * 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(247,147,26,0.12)'; ctx.fill();
  ctx.strokeStyle = '#f7931a'; ctx.lineWidth = s * 0.05; ctx.stroke();
  ctx.fillStyle = '#f7931a';
  ctx.font = `bold ${s * 0.85}px system-ui, Arial`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = '#f7931a'; ctx.shadowBlur = 12;
  ctx.fillText('₿', x, y);
  ctx.restore();
}

function logoETH(ctx, x, y, s) {
  ctx.save();
  ctx.strokeStyle = '#627eea'; ctx.lineWidth = s * 0.04;
  ctx.shadowColor = '#627eea'; ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.6, y - s * 0.35);
  ctx.lineTo(x, y + s * 0.6); ctx.lineTo(x - s * 0.6, y - s * 0.35);
  ctx.closePath();
  ctx.fillStyle = 'rgba(98,126,234,0.15)'; ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.15); ctx.lineTo(x + s * 0.6, y - s * 0.55);
  ctx.lineTo(x, y + s * 0.05); ctx.lineTo(x - s * 0.6, y - s * 0.55);
  ctx.closePath();
  ctx.fillStyle = 'rgba(98,126,234,0.35)'; ctx.fill();
  ctx.restore();
}

function logoSOL(ctx, x, y, s) {
  ctx.save();
  ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 15;
  for (let i = 0; i < 3; i++) {
    const oy = y - s * 0.7 + i * s * 0.7;
    const slant = s * 0.3;
    const grad = ctx.createLinearGradient(x - s, oy, x + s, oy);
    grad.addColorStop(0, '#00ff88'); grad.addColorStop(1, '#00d4ff');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x - s + slant, oy); ctx.lineTo(x + s, oy);
    ctx.lineTo(x + s - slant, oy + s * 0.4);
    ctx.lineTo(x - s, oy + s * 0.4); ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function logoDEFI(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(t * 0.0008);
  ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = s * 0.05;
  ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 20;
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = 0.4 + i * 0.2;
    ctx.beginPath(); ctx.arc(0, 0, s * (0.5 + i * 0.25), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ff00ff';
  ctx.font = `bold ${s * 0.5}px system-ui`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('⬡', 0, 0);
  ctx.restore();
}

// ── Scene Title Overlay ─────────────────────────────────────────────────────
function drawTitle(ctx, W, H, progress, mainText, subText, color) {
  const D = 12000;
  const t = progress * D;
  const a = Math.min((t - 2000) / 800, 1) * (1 - Math.min((t - D * 0.78) / 800, 1));
  if (a <= 0) return;

  ctx.save();
  ctx.globalAlpha = a;

  // Main large title
  const fontSize = Math.min(W, H) * 0.085;
  ctx.font = `100 ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;
  ctx.letterSpacing = `${fontSize * 0.25}px`;
  ctx.fillText(mainText, W / 2, H / 2);

  // Subtitle
  const subSize = Math.min(W, H) * 0.020;
  ctx.font = `400 ${subSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.shadowBlur = 10;
  ctx.fillText(subText, W / 2, H / 2 + fontSize * 0.85);

  ctx.restore();
}

// ── HUD Overlay ─────────────────────────────────────────────────────────────
function drawHUD(ctx, W, H, progress, sceneLabel, priceText, color, badgeText) {
  const D = 12000;
  const t = progress * D;
  const a = Math.min(t / 600, 1) * (1 - Math.min((t - D * 0.95) / 300, 1));
  if (a <= 0) return;

  ctx.save();
  ctx.globalAlpha = a;
  const sz = Math.min(W, H) * 0.018;
  ctx.font = `500 ${sz}px system-ui, -apple-system, monospace`;
  ctx.fillStyle = `rgba(${hexToRgb(color)},0.5)`;
  ctx.textAlign = 'left';

  const lh = sz * 1.85;
  ctx.fillText('CRYPTO UNIVERSE · WAKAR1', W * 0.025, H * 0.055);
  ctx.fillText('BLOCKCHAIN VISUALIZATION', W * 0.025, H * 0.055 + lh);

  ctx.fillStyle = color;
  ctx.fillText(priceText, W * 0.025, H * 0.055 + lh * 2);

  // Scene label and progress bar
  const barW = W * 0.35, barH = sz * 0.3;
  const barX = W * 0.025, barY = H - H * 0.06;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, barH / 2); ctx.fill();
  const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  grad.addColorStop(0, color); grad.addColorStop(1, '#00d4ff');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.roundRect(barX, barY, barW * progress, barH, barH / 2); ctx.fill();

  // Badge top right
  const badge = badgeText;
  ctx.font = `600 ${sz * 0.9}px system-ui`;
  const badgeW = ctx.measureText(badge).width + sz * 1.5;
  const badgeH = sz * 1.8;
  const bx = W - badgeW - W * 0.025, by = H * 0.025;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.beginPath(); ctx.roundRect(bx, by, badgeW, badgeH, badgeH / 2); ctx.fill();
  ctx.strokeStyle = color + '88'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(bx, by, badgeW, badgeH, badgeH / 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.textAlign = 'center';
  ctx.fillText(badge, bx + badgeW / 2, by + badgeH * 0.68);

  ctx.restore();
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ── SCENE 0: Bitcoin ────────────────────────────────────────────────────────
function sceneBitcoin(ctx, W, H, progress) {
  const t = progress * 12000;
  ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, W, H);

  updateParticles(W, H); updateNodes(W, H);
  drawParticles(ctx, '#f7931a');

  // Central BTC logo with pulse
  const cx = W / 2, cy = H * 0.45;
  const s = Math.min(W, H) * 0.13;
  const pulse = 1 + Math.sin(t * 0.003) * 0.04;
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(pulse, pulse);
  logoBTC(ctx, 0, 0, s);
  ctx.restore();

  // Orbiting rings
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < 3; i++) {
    ctx.rotate(t * (0.0003 + i * 0.0001));
    ctx.strokeStyle = `rgba(247,147,26,${0.15 - i * 0.04})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, s * (1.6 + i * 0.5), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();

  drawNodes(ctx, '#f7931a');
  drawNetwork(ctx, '#f7931a', Math.sin(progress * Math.PI));

  // Price chart
  const chart = genPrice(1, 60, 45000, 500);
  drawChart(ctx, chart, W * 0.08, H * 0.75, W * 0.84, H * 0.13, '#f7931a');

  drawTitle(ctx, W, H, progress, 'BITCOIN', 'Digital Gold · BTC', '#f7931a');
  drawHUD(ctx, W, H, progress, 'BITCOIN', `BTC: $${(45000 + Math.sin(t * 0.001) * 1000).toFixed(2)}`, '#f7931a', 'MAINNET');
}

// ── SCENE 1: Ethereum ───────────────────────────────────────────────────────
function sceneEthereum(ctx, W, H, progress) {
  const t = progress * 12000;
  ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, W, H);

  updateParticles(W, H); updateNodes(W, H);
  drawParticles(ctx, '#627eea');

  // Hexagons orbiting center
  const cx = W / 2, cy = H * 0.42;
  const orbitR = Math.min(W, H) * 0.26;
  for (let i = 0; i < 5; i++) {
    const angle = t * 0.0005 + (i * Math.PI * 2) / 5;
    const hx = cx + Math.cos(angle) * orbitR, hy = cy + Math.sin(angle) * orbitR;
    ctx.save();
    ctx.translate(hx, hy); ctx.rotate(angle + t * 0.001);
    ctx.strokeStyle = '#627eea'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (let j = 0; j < 6; j++) {
      const a = (j / 6) * Math.PI * 2;
      const sz = Math.min(W, H) * 0.02;
      j === 0 ? ctx.moveTo(Math.cos(a) * sz, Math.sin(a) * sz) : ctx.lineTo(Math.cos(a) * sz, Math.sin(a) * sz);
    }
    ctx.closePath(); ctx.stroke();
    ctx.restore();
  }

  // Central ETH logo
  ctx.save();
  ctx.shadowBlur = 30; ctx.shadowColor = '#627eea';
  logoETH(ctx, cx, cy, Math.min(W, H) * 0.12);
  ctx.restore();

  // Smart contract lines
  ctx.save(); ctx.strokeStyle = '#627eea'; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.2;
  for (let i = 0; i < 5; i++) {
    const angle = t * 0.0005 + (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * orbitR, cy + Math.sin(angle) * orbitR);
    ctx.stroke();
  }
  ctx.restore();

  drawNodes(ctx, '#627eea');
  drawNetwork(ctx, '#627eea', Math.sin(progress * Math.PI));

  const chart = genPrice(2, 60, 3200, 80);
  drawChart(ctx, chart, W * 0.08, H * 0.75, W * 0.84, H * 0.13, '#627eea');

  drawTitle(ctx, W, H, progress, 'ETHEREUM', 'Smart Contracts · ETH', '#627eea');
  drawHUD(ctx, W, H, progress, 'ETHEREUM', `ETH: $${(3200 + Math.sin(t * 0.001) * 150).toFixed(2)}`, '#627eea', 'ERC-20');
}

// ── SCENE 2: Solana ─────────────────────────────────────────────────────────
function sceneSolana(ctx, W, H, progress) {
  const t = progress * 12000;
  ctx.fillStyle = '#000a05'; ctx.fillRect(0, 0, W, H);

  // Speed lines
  ctx.save(); ctx.strokeStyle = 'rgba(0,255,136,0.06)'; ctx.lineWidth = 1;
  const lineCount = 18;
  for (let i = 0; i < lineCount; i++) {
    const y = (i / lineCount) * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();

  updateParticles(W, H); updateNodes(W, H);
  // Boost horizontal speed for Solana speed effect
  if (_particles) for (const p of _particles) p.vx = 3;
  drawParticles(ctx, '#00ff88');

  // SOL logos in wave
  const cx = W / 2, cy = H * 0.42;
  for (let i = 0; i < 7; i++) {
    const x = (i / 6) * W;
    const y = H * 0.4 + Math.sin(i + t * 0.003) * H * 0.08;
    const sc = 0.4 + Math.sin(t * 0.002 + i) * 0.2;
    ctx.save();
    ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.globalAlpha = 0.25 + Math.abs(Math.sin(t * 0.004 + i)) * 0.35;
    logoSOL(ctx, 0, 0, Math.min(W, H) * 0.04);
    ctx.restore();
  }

  // Central SOL with glow blur
  ctx.save();
  ctx.shadowBlur = 40; ctx.shadowColor = '#00ff88';
  logoSOL(ctx, cx, cy, Math.min(W, H) * 0.12);
  ctx.restore();

  // Transaction speed lines diagonal
  ctx.save(); ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.4;
  for (let i = 0; i < 6; i++) {
    const x = ((t * 0.25 + i * W / 6) % W);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 60, H); ctx.stroke();
  }
  ctx.restore();

  drawNodes(ctx, '#00ff88');
  drawNetwork(ctx, '#00ff88', Math.sin(progress * Math.PI));

  const base = genPrice(3, 60, 150, 12);
  const chart = base.map((v, i) => v + i * 2.5);
  drawChart(ctx, chart, W * 0.08, H * 0.75, W * 0.84, H * 0.13, '#00ff88');

  drawTitle(ctx, W, H, progress, 'SOLANA', 'High Speed · SOL', '#00ff88');
  drawHUD(ctx, W, H, progress, 'SOLANA', `SOL: $${(150 + Math.sin(t * 0.002) * 20).toFixed(2)}`, '#00ff88', 'SPL');
}

// ── SCENE 3: DeFi ───────────────────────────────────────────────────────────
function sceneDeFi(ctx, W, H, progress) {
  const t = progress * 12000;
  ctx.fillStyle = '#0a0010'; ctx.fillRect(0, 0, W, H);

  // Radial glow background
  const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, H * 0.75);
  grad.addColorStop(0, 'rgba(255,0,255,0.08)'); grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  updateParticles(W, H); updateNodes(W, H);
  drawParticles(ctx, '#ff00ff');

  const cx = W / 2, cy = H * 0.43;
  const orbitR = Math.min(W, H) * 0.24;

  // Token logos orbiting
  const tokens = [
    { fn: logoBTC, color: '#f7931a', name: 'BTC' },
    { fn: logoETH, color: '#627eea', name: 'ETH' },
    { fn: logoSOL, color: '#00ff88', name: 'SOL' },
    { fn: (x, y, s) => {
        ctx.save();
        const g = ctx.createRadialGradient(x, y, 0, x, y, s);
        g.addColorStop(0, 'rgba(0,212,255,0.3)'); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = s * 0.05; ctx.stroke();
        ctx.fillStyle = '#00d4ff'; ctx.font = `bold ${s * 0.65}px system-ui`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('U', x, y);
        ctx.restore();
      }, color: '#00d4ff', name: 'USDC' },
  ];

  tokens.forEach((token, i) => {
    const angle = t * 0.001 + (i * Math.PI * 2) / 4;
    const x = cx + Math.cos(angle) * orbitR;
    const y = cy + Math.sin(angle) * orbitR;
    ctx.save();
    ctx.shadowBlur = 20; ctx.shadowColor = token.color;
    token.fn(x, y, Math.min(W, H) * 0.038);
    ctx.restore();
    // Name tag
    ctx.save(); ctx.globalAlpha = 0.7;
    ctx.font = `bold ${Math.min(W, H) * 0.014}px system-ui`;
    ctx.fillStyle = token.color;
    ctx.textAlign = 'center';
    ctx.fillText(token.name, x, y + Math.min(W, H) * 0.06);
    ctx.restore();
    // Connection line to center
    ctx.save(); ctx.strokeStyle = token.color; ctx.lineWidth = 1; ctx.globalAlpha = 0.2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
    ctx.restore();
  });

  // Central DeFi hub
  logoDEFI(ctx, cx, cy, Math.min(W, H) * 0.1, t);

  drawNodes(ctx, '#ff00ff');
  drawNetwork(ctx, '#ff00ff', Math.sin(progress * Math.PI));

  const chart = genPrice(4, 60, 80, 18).map((v, i) => v + Math.sin(i * 0.5) * 12);
  drawChart(ctx, chart, W * 0.08, H * 0.75, W * 0.84, H * 0.13, '#ff00ff');

  drawTitle(ctx, W, H, progress, 'DeFi', 'Decentralized Finance', '#ff00ff');
  drawHUD(ctx, W, H, progress, 'DEFI', `TVL: $${(80 + Math.sin(t * 0.001) * 8).toFixed(1)}B`, '#ff00ff', 'DEX');
}

// ── SCENE 4: Universe ───────────────────────────────────────────────────────
function sceneUniverse(ctx, W, H, progress) {
  const t = progress * 12000;
  ctx.fillStyle = '#000010'; ctx.fillRect(0, 0, W, H);

  // Starfield (deterministic)
  const srng = mkRng(42);
  for (let i = 0; i < 220; i++) {
    const sx = srng() * W, sy = srng() * H;
    const brightness = 0.2 + Math.sin(t * 0.002 + i * 0.8) * 0.35;
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0, brightness)})`;
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  updateParticles(W, H); updateNodes(W, H);
  drawParticles(ctx, '#00d4ff');

  const cx = W / 2, cy = H * 0.42;
  const universe = [
    { fn: logoBTC, color: '#f7931a', px: 0.22, py: 0.28 },
    { fn: logoETH, color: '#627eea', px: 0.50, py: 0.23 },
    { fn: logoSOL, color: '#00ff88', px: 0.78, py: 0.32 },
    { fn: logoDEFI, color: '#ff00ff', px: 0.30, py: 0.60 },
    { fn: (x, y, s) => {
        ctx.save(); ctx.shadowBlur = 15; ctx.shadowColor = '#0033ad';
        ctx.beginPath(); ctx.arc(x, y, s * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,51,173,0.15)'; ctx.fill();
        ctx.strokeStyle = '#0033ad'; ctx.lineWidth = s * 0.05; ctx.stroke();
        ctx.fillStyle = '#4a9ff5'; ctx.font = `bold ${s * 0.65}px system-ui`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('A', x, y);
        ctx.restore();
      }, color: '#4a9ff5', px: 0.72, py: 0.63 },
  ];

  // Cross-connections
  universe.forEach((a, i) => {
    universe.forEach((b, j) => {
      if (i >= j) return;
      ctx.save(); ctx.strokeStyle = a.color; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.moveTo(W * a.px, H * a.py);
      ctx.lineTo(W * b.px, H * b.py);
      ctx.stroke(); ctx.restore();
    });
  });

  // Draw each logo
  universe.forEach((crypto, i) => {
    const pulse = 1 + Math.sin(t * 0.003 + i) * 0.07;
    ctx.save();
    ctx.translate(W * crypto.px, H * crypto.py);
    ctx.scale(pulse, pulse);
    ctx.shadowBlur = 25; ctx.shadowColor = crypto.color;
    crypto.fn(0, 0, Math.min(W, H) * 0.058, t);
    ctx.restore();
  });

  // Logo central reemplazando la marca crypto de texto en la escena.
  drawCryptopCenter(ctx, cx, cy, Math.min(W, H) * 0.22, t);

  // Large outer orbit ring
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(t * 0.0002);
  ctx.strokeStyle = 'rgba(0,212,255,0.25)'; ctx.lineWidth = 1.5;
  ctx.setLineDash([12, 10]);
  ctx.beginPath(); ctx.arc(0, 0, Math.min(W, H) * 0.42, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  drawNodes(ctx, '#00d4ff');
  drawNetwork(ctx, '#00d4ff', Math.sin(progress * Math.PI) * 0.8);

  const chart = genPrice(5, 60, 100, 25);
  drawChart(ctx, chart, W * 0.08, H * 0.75, W * 0.84, H * 0.13, '#00d4ff');

  drawTitle(ctx, W, H, progress, 'CRIPTOP', 'The Future of Finance', '#00d4ff');
  drawHUD(ctx, W, H, progress, 'UNIVERSE', `MARKET CAP: $${(2.5 + Math.sin(t * 0.0005) * 0.2).toFixed(2)}T`, '#00d4ff', 'GLOBAL');
}

// ── Scene map ───────────────────────────────────────────────────────────────
const SCENES = [sceneBitcoin, sceneEthereum, sceneSolana, sceneDeFi, sceneUniverse];

// ── Main draw export ────────────────────────────────────────────────────────
export function drawCryptoUniverse(ctx, W, H, progress, p) {
  const sceneIdx = Math.min(parseInt(p.scene) || 0, 4);
  initCache(sceneIdx, W, H);
  SCENES[sceneIdx](ctx, W, H, progress, p);
}
