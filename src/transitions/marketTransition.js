export const marketTransition = {
  id: "market_transition",
  name: "Market Wipe",
  category: "Transition",
  icon: "⚡",
  description: "Transición tipo wipe con gráfica de precio",
  duration: 2500,
  color: "#ef9f27",
  tags: ["wipe", "transition", "graph"],
  params: [
    { id: "label", label: "Texto", type: "text", default: "ANÁLISIS EN VIVO" },
    { id: "wipeColor", label: "Color wipe", type: "color", default: "#ef9f27" },
    { id: "speed", label: "Velocidad", type: "select", default: "normal", options: ["slow", "normal", "fast"] },
  ],
};

export function drawMarketTransition(ctx, W, H, progress, p) {
  ctx.fillStyle = "#050c14";
  ctx.fillRect(0, 0, W, H);
  
  const wC = p.wipeColor || "#ef9f27";
  const spd = p.speed === "fast" ? 1.5 : p.speed === "slow" ? 0.6 : 1;
  const wipeP = Math.min(progress * spd * 2, 1);
  
  const pts = [40, 50, 55, 42, 60, 45, 70, 52, 63, 48, 75, 38, 80, 55, 85, 35];
  ctx.beginPath();
  ctx.strokeStyle = wC + "88";
  ctx.lineWidth = 2;
  pts.forEach((v, i) => {
    const x = (i / (pts.length - 1)) * W * wipeP;
    const y = H / 2 + (v - 60) * 2;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
  
  const wipeX = wipeP * W;
  const wipeGrad = ctx.createLinearGradient(wipeX - 30, 0, wipeX, 0);
  wipeGrad.addColorStop(0, "transparent");
  wipeGrad.addColorStop(1, wC);
  ctx.fillStyle = wipeGrad;
  ctx.fillRect(wipeX - 30, 0, 30, H);
  
  ctx.strokeStyle = wC;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(wipeX, 0); ctx.lineTo(wipeX, H); ctx.stroke();
  
  if (wipeP > 0.5) {
    const ta = Math.min((wipeP - 0.5) * 2, 1);
    ctx.globalAlpha = ta;
    
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.beginPath(); ctx.roundRect(W / 2 - 120, H / 2 - 30, 240, 60, 6); ctx.fill();
    
    ctx.fillStyle = wC;
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.label || "ANÁLISIS EN VIVO", W / 2, H / 2 + 8);
    
    ctx.textAlign = "left";
    ctx.globalAlpha = 1;
  }
}
