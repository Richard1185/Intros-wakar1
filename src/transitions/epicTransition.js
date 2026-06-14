export const epicTransition = {
  id: "epic_transition",
  name: "Epic Transition",
  category: "Market",
  icon: "🔥",
  description: "Transición épica con precios reales de Binance",
  duration: 7000,
  color: "#00ff88",
  tags: ["binance", "live", "epic", "fullscreen"],
  params: [
    { id: "symbol", label: "Par", type: "select", default: "BTCUSDT", options: ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "DOGEUSDT"] },
    { id: "showHUD", label: "Mostrar HUD", type: "toggle", default: false },
    { id: "showGrid", label: "Mostrar Grid", type: "toggle", default: true },
    { id: "glitchIntensity", label: "Glitch", type: "range", default: 50, min: 0, max: 100 },
  ],
};

// Fetch real prices from Binance API
async function fetchBinancePrices(symbol = "BTCUSDT") {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    );
    const data = await response.json();
    return {
      symbol: data.symbol,
      price: parseFloat(data.lastPrice),
      change: parseFloat(data.priceChangePercent),
      high: parseFloat(data.highPrice),
      low: parseFloat(data.lowPrice),
      volume: parseFloat(data.volume),
    };
  } catch (error) {
    console.error("Error fetching Binance data:", error);
    return null;
  }
}

// Cache for generated data
let cachedCandles = null;
let cachedPriceLine = null;
let cachedParticles = null;
let cachedBasePrice = null;

// Generate candle data based on real price
function generateCandles(basePrice, count = 40) {
  const candles = [];
  let price = basePrice * 0.95;
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.44) * (basePrice * 0.015);
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.005);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.005);
    candles.push({ open, close, high, low });
    price = close;
  }
  return candles;
}

// Generate price line based on real price
function generatePriceLine(basePrice, count = 200) {
  const line = [];
  let price = basePrice * 0.98;
  for (let i = 0; i < count; i++) {
    price += (Math.random() - 0.42) * (basePrice * 0.002);
    line.push(price);
  }
  return line;
}

// Generate particles (cached)
function generateParticles() {
  return Array.from({ length: 80 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0003,
    vy: (Math.random() - 0.5) * 0.0003,
    size: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.3 + 0.05,
    color:
      Math.random() > 0.6
        ? "#00ff88"
        : Math.random() > 0.5
        ? "#7f77dd"
        : "#ffffff",
  }));
}

// Get or generate cached data
function getCachedData(basePrice) {
  if (cachedBasePrice !== basePrice) {
    cachedBasePrice = basePrice;
    cachedCandles = generateCandles(basePrice);
    cachedPriceLine = generatePriceLine(basePrice);
    cachedParticles = generateParticles();
  }
  return {
    candles: cachedCandles,
    priceLine: cachedPriceLine,
    particles: cachedParticles,
  };
}

// Utility functions
function ease(t, type = "easeOut") {
  if (type === "easeOut") return 1 - (1 - t) * (1 - t);
  if (type === "easeIn") return t * t;
  if (type === "elastic")
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  if (type === "bounce")
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  return t;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function inRange(t, s, e) {
  return t >= s && t < e ? (t - s) / (e - s) : t < s ? 0 : 1;
}

function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// Draw functions
function drawGrid(ctx, W, H, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.12;
  ctx.strokeStyle = "#00ff88";
  ctx.lineWidth = 0.5;
  const gx = W / 12,
    gy = H / 8;
  for (let i = 0; i <= 12; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gx, 0);
    ctx.lineTo(i * gx, H);
    ctx.stroke();
  }
  for (let j = 0; j <= 8; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * gy);
    ctx.lineTo(W, j * gy);
    ctx.stroke();
  }
  ctx.restore();
}

function drawParticles(ctx, W, H, particles, alpha) {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x = (p.x + p.vx + 1) % 1;
    p.y = (p.y + p.vy + 1) % 1;
    ctx.beginPath();
    ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha * alpha;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPriceLine(ctx, W, H, pts, alpha, revealPct = 1, glowColor = "#00ff88") {
  const minP = Math.min(...pts),
    maxP = Math.max(...pts);
  const pad = { l: W * 0.08, r: W * 0.08, t: H * 0.25, b: H * 0.25 };
  const mapX = (i) => pad.l + (i / (pts.length - 1)) * (W - pad.l - pad.r);
  const mapY = (v) =>
    H - pad.b - ((v - minP) / (maxP - minP)) * (H - pad.t - pad.b);
  const maxIdx = Math.floor(revealPct * (pts.length - 1));

  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 18;
  ctx.globalAlpha = alpha * 0.9;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= maxIdx; i++) {
    i === 0
      ? ctx.moveTo(mapX(i), mapY(pts[i]))
      : ctx.lineTo(mapX(i), mapY(pts[i]));
  }
  ctx.stroke();

  ctx.globalAlpha = alpha * 0.08;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, glowColor);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.beginPath();
  for (let i = 0; i <= maxIdx; i++) {
    i === 0
      ? ctx.moveTo(mapX(i), mapY(pts[i]))
      : ctx.lineTo(mapX(i), mapY(pts[i]));
  }
  ctx.lineTo(mapX(maxIdx), H);
  ctx.lineTo(mapX(0), H);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCandles(ctx, W, H, candles, alpha, revealPct = 1) {
  const cw = (W * 0.84) / candles.length;
  const lx = W * 0.08;
  const maxIdx = Math.floor(revealPct * candles.length);
  const minP = Math.min(...candles.map((c) => c.low));
  const maxP = Math.max(...candles.map((c) => c.high));
  const mapY = (v) =>
    H * 0.75 - ((v - minP) / (maxP - minP)) * H * 0.5;
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < maxIdx; i++) {
    const { open, close, high, low } = candles[i];
    const bullish = close >= open;
    const col = bullish ? "#00ff88" : "#ff4466";
    const x = lx + i * cw + cw / 2;
    ctx.strokeStyle = col + "88";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, mapY(high));
    ctx.lineTo(x, mapY(low));
    ctx.stroke();
    ctx.fillStyle = col;
    const y1 = mapY(Math.max(open, close));
    const y2 = mapY(Math.min(open, close));
    ctx.fillRect(x - cw * 0.3, y1, cw * 0.6, Math.max(1, y2 - y1));
  }
  ctx.restore();
}

function drawText(ctx, txt, x, y, size, color, alpha, weight = "bold", align = "left") {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px 'Courier New', monospace`;
  ctx.textAlign = align;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillText(txt, x, y);
  ctx.restore();
}

function drawScanLine(ctx, W, H, y, alpha, color = "#00ff88") {
  ctx.save();
  const grad = ctx.createLinearGradient(0, y - H * 0.04, 0, y + H * 0.04);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.5, hexAlpha(color, alpha * 0.35));
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, y - H * 0.04, W, H * 0.08);
  ctx.strokeStyle = hexAlpha(color, alpha * 0.7);
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(W, y);
  ctx.stroke();
  ctx.restore();
}

function drawHUD(ctx, W, H, prices, alpha) {
  if (!prices || prices.length === 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  prices.forEach((item, i) => {
    const x = W * 0.03;
    const y = H * 0.12 + i * H * 0.07;
    const isPositive = item.change >= 0;
    const col = isPositive ? "#00ff88" : "#ff4466";
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.roundRect(x, y - 18, 180, 30, 3);
    ctx.fill();
    ctx.strokeStyle = col + "44";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "10px monospace";
    ctx.fillText(item.symbol, x + 8, y);
    ctx.fillStyle = col;
    ctx.font = "bold 13px monospace";
    ctx.fillText("$" + item.price.toLocaleString(), x + 8, y + 14);
  });
  ctx.restore();
}

function drawGlitch(ctx, W, H, alpha) {
  if (alpha < 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha * 0.5;
  for (let i = 0; i < 3; i++) {
    const gy = Math.random() * H;
    const gh = 2 + Math.random() * 6;
    const gw = 20 + Math.random() * 120;
    const gx = Math.random() * W;
    ctx.fillStyle = Math.random() > 0.5 ? "#00ff88" : "#7f77dd";
    ctx.fillRect(gx, gy, gw, gh);
  }
  ctx.restore();
}

function drawWakar1Logo(ctx, cx, cy, scale, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  ctx.beginPath();
  ctx.arc(0, 0, 60, 0, Math.PI * 2);
  ctx.strokeStyle = "#7f77dd";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#7f77dd";
  ctx.shadowBlur = 20;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.strokeStyle = "#00ff8855";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-20, 15);
  ctx.lineTo(-5, -8);
  ctx.lineTo(8, 4);
  ctx.lineTo(20, -15);
  ctx.strokeStyle = "#00ff88";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#00ff88";
  ctx.shadowBlur = 15;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(20, -15, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#00ff88";
  ctx.fill();

  ctx.restore();
}

export function drawEpicTransition(ctx, W, H, progress, p, liveData) {
  const t = progress * 7000;

  const basePrice = liveData?.price || 67420;
  const { candles, priceLine, particles } = getCachedData(basePrice);

  // Scene: Price Surge (0-7s)
  ctx.fillStyle = "#020a05";
  ctx.fillRect(0, 0, W, H);

  if (p.showGrid) {
    drawGrid(ctx, W, H, ease(inRange(t, 0, 800), "easeOut"));
  }
  drawParticles(ctx, W, H, particles, 0.6);

  // Candles appear
  const candleReveal = ease(inRange(t, 200, 2500), "easeOut");
  drawCandles(ctx, W, H, candles, candleReveal * 0.7, candleReveal);

  // Price line surges
  const lineReveal = ease(inRange(t, 1500, 5000), "easeOut");
  drawPriceLine(ctx, W, H, priceLine, lineReveal, lineReveal, "#00ff88");

  // HUD
  if (p.showHUD && liveData) {
    const hudA =
      ease(inRange(t, 2000, 3500), "easeOut") *
      (1 - ease(inRange(t, 6200, 7000), "easeOut"));
    drawHUD(
      ctx,
      W,
      H,
      [
        { symbol: liveData.symbol, price: liveData.price, change: liveData.change },
        { symbol: "ETH/USDT", price: 3241.88, change: 2.1 },
        { symbol: "BNB/USDT", price: 584.22, change: -1.3 },
        { symbol: "SOL/USDT", price: 142.07, change: 3.8 },
      ],
      hudA
    );
  }

  // Scan line
  const scanY = H * 0.1 + (t / 7000) * H * 0.8;
  drawScanLine(
    ctx,
    W,
    H,
    scanY,
    ease(inRange(t, 0, 6500), "easeOut") * 0.8
  );

  // Big price display
  const priceA =
    ease(inRange(t, 2500, 4000), "easeOut") *
    (1 - ease(inRange(t, 6000, 7000), "easeOut"));
  if (priceA > 0) {
    const glow = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.7);
    glow.addColorStop(0, "rgba(0,255,136,0.04)");
    glow.addColorStop(0.5, "rgba(0,255,136,0.12)");
    glow.addColorStop(1, "rgba(0,255,136,0.04)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, H * 0.3, W, H * 0.4);

    const changeSign = liveData?.change >= 0 ? "+" : "";
    const changeStr = liveData
      ? `${changeSign}${liveData.change.toFixed(2)}%`
      : "+4.28%";

    drawText(
      ctx,
      "$" + basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      W / 2,
      H * 0.43,
      H * 0.095,
      "#00ff88",
      priceA,
      "bold",
      "center"
    );
    drawText(
      ctx,
      (liveData?.symbol || "BTC") + " / USDT",
      W / 2,
      H * 0.52,
      H * 0.040, // Aumentado de 0.022 a 0.040 para máxima legibilidad
      "rgba(255,255,255,0.85)", // Opacidad de fuente aumentada
      priceA,
      "bold", // Cambiado de normal a bold
      "center"
    );
    drawText(
      ctx,
      `▲ ${changeStr}`,
      W / 2,
      H * 0.60,
      H * 0.042, // Aumentado de 0.028 a 0.042
      "#00ff88",
      priceA,
      "bold",
      "center"
    );
  }

  // Marca de agua superior izquierda fija www.wakar1.com
  const watermarkA = ease(inRange(t, 200, 1500), "easeOut") * (1 - ease(inRange(t, 6500, 7000), "easeOut"));
  if (watermarkA > 0) {
    ctx.save();
    ctx.globalAlpha = watermarkA * 0.85;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px 'Space Grotesk', 'Inter', system-ui, sans-serif";
    ctx.shadowColor = "#7f77dd";
    ctx.shadowBlur = 10;
    ctx.fillText("www.wakar1.com", 25, 45);
    ctx.restore();
  }

  // Flash at end
  const flashA = ease(inRange(t, 6700, 7000), "easeIn");
  if (flashA > 0) {
    ctx.fillStyle = `rgba(0,255,136,${flashA * 0.3})`;
    ctx.fillRect(0, 0, W, H);
  }

  const glitchIntensity = (p.glitchIntensity || 50) / 100;
  drawGlitch(
    ctx,
    W,
    H,
    ease(inRange(t, 6500, 6800), "easeIn") * glitchIntensity
  );
}
