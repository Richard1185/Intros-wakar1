export const aiScan = {
  id: "ai_scan",
  name: "AI Scanner",
  category: "Tech",
  icon: "🤖",
  description: "Efecto de escaneo de IA con datos de mercado",
  duration: 4500,
  color: "#1d9e75",
  tags: ["ai", "scan", "tech", "fullscreen"],
  params: [
    { id: "asset", label: "Activo", type: "text", default: "ETHEREUM" },
    { id: "signal", label: "Señal IA", type: "select", default: "BUY", options: ["BUY", "SELL", "HOLD", "WATCH"] },
    { id: "confidence", label: "Confianza %", type: "range", default: 94, min: 50, max: 99 },
    { id: "scanColor", label: "Color scan", type: "color", default: "#1d9e75" },
  ],
};

export function drawAiScan(ctx, W, H, progress, p) {
  ctx.fillStyle = "#020a05";
  ctx.fillRect(0, 0, W, H);
  
  const scanC = p.scanColor || "#1d9e75";
  const scanY = (progress * 1.2 % 1) * H;
  
  const grad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.5, scanC + "55");
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, scanY - 40, W, 80);
  
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 10; c++) {
      const cx = 20 + c * (W / 10), cy = 20 + r * (H / 6);
      const lit = Math.random() > 0.7;
      ctx.fillStyle = lit ? scanC + "44" : "#111111";
      ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  
  if (progress > 0.2) {
    const a = Math.min((progress - 0.2) * 2, 1);
    ctx.globalAlpha = a;
    
    ctx.strokeStyle = scanC;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(W / 2 - 100, H / 2 - 50, 200, 100);
    
    ctx.strokeStyle = scanC + "66";
    ctx.strokeRect(W / 2 - 110, H / 2 - 60, 220, 120);
    
    const corners = [[W/2-100,H/2-50],[W/2+100,H/2-50],[W/2-100,H/2+50],[W/2+100,H/2+50]];
    corners.forEach(([cx,cy]) => {
      ctx.strokeStyle = scanC; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+10*(cx<W/2?1:-1),cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx,cy+10*(cy<H/2?1:-1)); ctx.stroke();
    });
    
    ctx.fillStyle = scanC;
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.fillText(p.asset || "ETHEREUM", W / 2, H / 2 - 10);
    
    const sig = p.signal || "BUY";
    ctx.fillStyle = sig === "BUY" ? "#00ff88" : sig === "SELL" ? "#ff4466" : "#ef9f27";
    ctx.font = "bold 24px monospace";
    ctx.fillText(sig, W / 2, H / 2 + 20);
    
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "11px monospace";
    ctx.fillText(`CONFIDENCE: ${p.confidence || 94}%`, W / 2, H / 2 + 42);
    
    ctx.textAlign = "left";
    ctx.globalAlpha = 1;
  }
  
  ctx.fillStyle = scanC + "22";
  ctx.font = "10px monospace";
  for (let i = 0; i < 4; i++) {
    ctx.fillText(`0x${Math.floor(Math.random()*9999).toString(16).padStart(4,"0")} ${(Math.random()*999).toFixed(2)}`, 10, 20 + i * 14);
    ctx.fillText(`0x${Math.floor(Math.random()*9999).toString(16).padStart(4,"0")} ${(Math.random()*999).toFixed(2)}`, W - 80, 20 + i * 14);
  }
}
