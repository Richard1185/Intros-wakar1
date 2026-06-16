import wakaLogo from './wakaLogo_256x256.png';

const logoImg = new Image();
logoImg.src = wakaLogo;

export const wakar1TokenTransition = {
  id: "wakar1_token",
  name: "WAKAR1 Token",
  category: "Branding",
  icon: "🪙",
  description: "Intro del token WAKA con partículas y hex grid",
  duration: 8000,
  color: "#378add",
  tags: ["token", "waka", "branding", "crypto"],
  params: [],
};

function mkRng(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function eOut(t) { return 1 - Math.pow(1 - t, 3); }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── PARTICLES ──
const PARTICLE_COUNT = 120;
let particles = null;

function initParticles(W, H) {
  const rng = mkRng(42);
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: rng() * W,
      y: rng() * H,
      vx: (rng() - 0.5) * 0.6,
      vy: -(rng() * 0.5 + 0.1),
      radius: rng() * 1.7 + 0.5,
      alpha: rng() * 0.6 + 0.1,
      color: rng() > 0.6 ? '#378add' : rng() > 0.5 ? '#60a5fa' : '#ffffff',
      pulse: rng() * Math.PI * 2,
      pulseSpeed: rng() * 0.02 + 0.01,
    });
  }
}

function updateParticles(W, H) {
  if (!particles) initParticles(W, H);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.pulse += p.pulseSpeed;
    if (p.y < -5 || p.x < -5 || p.x > W + 5) {
      p.x = Math.random() * W;
      p.y = H + 5;
      p.vy = -(Math.random() * 0.5 + 0.1);
    }
  }
}

function drawParticles(ctx, W, H, time) {
  if (!particles) return;
  for (const p of particles) {
    const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(p.color, a);
    ctx.fill();
  }

  // Connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = hexToRgba('#378add', 0.08 * (1 - dist / 80));
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    }
  }
}

function drawHexGrid(ctx, W, H, time) {
  const cx = W / 2, cy = H / 2;
  const angle = time * 0.0008;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  for (let r = 80; r <= 260; r += 70) {
    ctx.beginPath();
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2 - Math.PI / 6;
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = hexToRgba('#378add', 0.04 + 0.02 * Math.sin(time * 0.02 + r * 0.01));
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawCenterGlow(ctx, W, H, time) {
  const pulse = 0.3 + 0.15 * Math.sin(time * 0.025);
  const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 200);
  grad.addColorStop(0, hexToRgba('#185fa5', pulse));
  grad.addColorStop(0.5, hexToRgba('#0a1628', pulse * 0.4));
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawScanLine(ctx, W, H, time) {
  const y = (time * 1.2) % H;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(W, y);
  ctx.strokeStyle = hexToRgba('#378add', 0.04);
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ── MAIN DRAW ──
export function drawWakar1TokenTransition(ctx, W, H, progress, p) {
  const elapsed = progress * 8000;
  const time = elapsed * 0.06;

  // Black background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // Particles trail
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, 0, W, H);

  // Background effects
  drawHexGrid(ctx, W, H, time);
  drawCenterGlow(ctx, W, H, time);
  drawParticles(ctx, W, H, time);
  drawScanLine(ctx, W, H, time);
  updateParticles(W, H);

  // Progressive text reveal
  const logoA = eOut(clamp((elapsed - 300) / 600, 0, 1));
  const tagA = eOut(clamp((elapsed - 900) / 600, 0, 1));
  const titleA = eOut(clamp((elapsed - 1600) / 600, 0, 1));
  const subA = eOut(clamp((elapsed - 2400) / 600, 0, 1));
  const badgeA = eOut(clamp((elapsed - 3100) / 600, 0, 1));

  // Logo ring
  if (logoA > 0) {
    const ringR = W * 0.07;
    const spinAngle = time * 0.03;
    ctx.save();
    ctx.globalAlpha = logoA;

    // Spinning dashed circle
    ctx.translate(W / 2, H * 0.32);
    ctx.rotate(spinAngle);
    ctx.strokeStyle = '#378add';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, ringR + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.rotate(-spinAngle);

    // Ring bg
    ctx.fillStyle = '#0a1628';
    ctx.strokeStyle = '#378add';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Logo image
    if (logoImg.complete) {
      const imgSize = ringR * 1.4;
      ctx.drawImage(logoImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
    }

    ctx.restore();
  }

  // Tag line
  if (tagA > 0) {
    ctx.save();
    ctx.globalAlpha = tagA;
    const ty = H * 0.32 + W * 0.07 + H * 0.05 + H * 0.02;
    ctx.fillStyle = '#378add';
    ctx.font = `${H * 0.022}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '6px';
    ctx.fillText('NUEVA ERA CRIPTO · 2026', W / 2, ty);
    ctx.restore();
  }

  // Main title
  if (titleA > 0) {
    ctx.save();
    ctx.globalAlpha = titleA;
    const ty = H * 0.32 + W * 0.07 + H * 0.05 + H * 0.08;
    ctx.font = `900 ${H * 0.07}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(55,138,221,0.6)';
    ctx.shadowBlur = 40;
    ctx.fillText('Agente ', W / 2 - W * 0.1, ty);
    ctx.fillStyle = '#378add';
    ctx.fillText('Wakar1', W / 2 + W * 0.08, ty);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Sub title
  if (subA > 0) {
    ctx.save();
    ctx.globalAlpha = subA;
    const ty = H * 0.32 + W * 0.07 + H * 0.05 + H * 0.14;
    ctx.fillStyle = '#90caf9';
    ctx.font = `700 ${H * 0.038}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('TOKEN OFICIAL · (WAKA)', W / 2, ty);
    ctx.restore();
  }

  // Badge
  if (badgeA > 0) {
    ctx.save();
    ctx.globalAlpha = badgeA;
    const ty = H * 0.32 + W * 0.07 + H * 0.05 + H * 0.21;
    const badgeText = 'DESCENTRALIZADO · FUTURO';
    ctx.font = `${H * 0.022}px system-ui, sans-serif`;
    const tw = ctx.measureText(badgeText).width;
    ctx.strokeStyle = '#378add';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(W / 2 - tw / 2 - 20, ty - H * 0.018, tw + 40, H * 0.044, 30);
    ctx.stroke();
    ctx.fillStyle = '#60a5fa';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, W / 2, ty + H * 0.005);
    ctx.restore();
  }
}
