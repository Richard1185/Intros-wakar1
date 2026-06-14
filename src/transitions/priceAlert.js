export const priceAlert = {
  id: "price_alert",
  name: "Price Alert",
  category: "Market",
  icon: "📈",
  description: "Alerta de precio con ticker y variación",
  duration: 3000,
  color: "#00ff88",
  tags: ["crypto", "alert", "lower-third"],
  params: [
    { id: "symbol", label: "Par", type: "text", default: "BTC/USDT" },
    { id: "price", label: "Precio", type: "text", default: "$67,420.50" },
    { id: "change", label: "Variación", type: "text", default: "+4.2%" },
    { id: "positive", label: "Positivo", type: "toggle", default: true },
    { id: "bg", label: "Fondo", type: "color", default: "#050c14" },
  ],
};

export function drawPriceAlert(ctx, W, H, progress, p) {
  const bg = p.bg || "#050c14";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  
  const barH = 80;
  const barY = H - barH - 20;
  const barW = Math.min(progress * 2, 1) * (W - 40);
  const isPos = p.positive;
  const accent = isPos ? "#00ff88" : "#ff4466";
  
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.beginPath(); ctx.roundRect(20, barY, W - 40, barH, 8); ctx.fill();
  
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(20, barY, W - 40, barH, 8); ctx.stroke();
  
  ctx.fillStyle = accent;
  ctx.fillRect(20, barY + barH - 3, barW, 3);
  
  if (progress > 0.3) {
    const alpha = Math.min((progress - 0.3) * 3, 1);
    ctx.globalAlpha = alpha;
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px monospace";
    ctx.fillText(p.symbol || "BTC/USDT", 36, barY + 28);
    
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "11px monospace";
    ctx.fillText("WAKAR1 LIVE", 36, barY + 44);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px monospace";
    ctx.fillText(p.price || "$67,420", W / 2, barY + 34);
    
    ctx.fillStyle = accent;
    ctx.font = "bold 16px monospace";
    const chg = p.change || "+4.2%";
    ctx.fillText(isPos ? "▲ " + chg : "▼ " + chg, W - 100, barY + 34);
    
    ctx.globalAlpha = 1;
  }
}
