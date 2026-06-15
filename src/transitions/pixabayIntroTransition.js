import pixabayVideo from './pixabay.mp4';

export const pixabayIntroTransition = {
  id: 'pixabay_intro',
  name: 'Pixabay Video Intro',
  category: 'Branding',
  icon: '🎞️',
  description: 'Intro cinematica usando pixabay.mp4 con logo central',
  duration: 12000,
  color: '#00d4ff',
  tags: ['intro', 'video', 'pixabay', 'branding'],
  params: [
    {
      id: 'overlayOpacity',
      label: 'Oscurecer Fondo',
      type: 'range',
      min: 0,
      max: 80,
      default: 28,
    },
    {
      id: 'logoScale',
      label: 'Tamano Logo',
      type: 'range',
      min: 30,
      max: 140,
      default: 100,
    },
    {
      id: 'title',
      label: 'Titulo',
      type: 'text',
      default: 'WAKAR1 CRIPTOP',
    },
  ],
};

let cachedVideo = null;

function getVideoElement() {
  if (cachedVideo) return cachedVideo;
  const video = document.createElement('video');
  video.src = pixabayVideo;
  video.preload = 'auto';
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';
  video.load();
  cachedVideo = video;
  return video;
}

function drawVideoCover(ctx, video, W, H) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) {
    return false;
  }

  const videoRatio = vw / vh;
  const canvasRatio = W / H;

  let drawW;
  let drawH;
  if (videoRatio > canvasRatio) {
    drawH = H;
    drawW = H * videoRatio;
  } else {
    drawW = W;
    drawH = W / videoRatio;
  }

  const dx = (W - drawW) / 2;
  const dy = (H - drawH) / 2;
  ctx.drawImage(video, dx, dy, drawW, drawH);
  return true;
}

function syncVideoFrame(video, progress) {
  if (!Number.isFinite(video.duration) || video.duration <= 0) {
    return;
  }

  const target = Math.min(progress * video.duration, Math.max(video.duration - 0.001, 0));
  const drift = Math.abs(video.currentTime - target);
  if (!video.seeking && drift > 0.05) {
    try {
      video.currentTime = target;
    } catch {
      // Ignora errores de seek temporales en algunos navegadores.
    }
  }
}

export function drawPixabayIntroTransition(ctx, W, H, progress, p) {
  const overlay = Math.max(0, Math.min(0.8, (Number(p.overlayOpacity) || 0) / 100));
  const logoScale = Math.max(0.3, Math.min(1.4, (Number(p.logoScale) || 100) / 100));
  const title = p.title || 'WAKAR1 CRIPTOP';

  const video = getVideoElement();

  syncVideoFrame(video, progress);

  ctx.fillStyle = '#03070f';
  ctx.fillRect(0, 0, W, H);

  const drewVideo = video.readyState >= 2 && drawVideoCover(ctx, video, W, H);
  if (!drewVideo) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#041018');
    g.addColorStop(1, '#081b2a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.fillStyle = `rgba(2, 6, 12, ${overlay})`;
  ctx.fillRect(0, 0, W, H);

  const pulse = 1 + Math.sin(progress * Math.PI * 8) * 0.03;
  const logoSize = Math.min(W, H) * 0.26 * logoScale * pulse;
  const cx = W / 2;
  const cy = H / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 212, 255, 0.45)';
  ctx.shadowBlur = Math.min(W, H) * 0.04;

  ctx.beginPath();
  ctx.arc(cx, cy, logoSize * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 212, 255, 0.25)';
  ctx.fill();
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = logoSize * 0.02;
  ctx.stroke();
  ctx.fillStyle = '#00d4ff';
  ctx.font = `700 ${Math.min(W, H) * 0.032}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CRIPTOP', cx, cy);
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = `700 ${Math.min(W, H) * 0.06}px Arial`;
  ctx.fillText(title, cx, H * 0.17);

  const barW = W * 0.42;
  const barH = Math.max(4, H * 0.008);
  const barX = (W - barW) / 2;
  const barY = H * 0.86;

  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, barH / 2);
  ctx.fill();

  const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
  grad.addColorStop(0, '#00d4ff');
  grad.addColorStop(1, '#00ff88');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW * progress, barH, barH / 2);
  ctx.fill();
}
