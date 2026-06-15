export const wakar1Lower = {
  id: "wakar1_lower",
  name: "Intro Inferior",
  category: "Branding",
  icon: "🚀",
  description: "Lower-third de marca con slogan animado",
  duration: 4000,
  color: "#7f77dd",
  tags: ["brand", "lower-third", "intro"],
  params: [
    { id: "title", label: "Título", type: "text", default: "WAKAR1 TRADING" },
    { id: "subtitle", label: "Subtítulo", type: "text", default: "Plataforma de IA para traders" },
    { id: "accent", label: "Color acento", type: "color", default: "#7f77dd" },
  ],
};

export function drawWakar1Lower(ctx, W, H, progress, p) {
  const accent = p.accent || "#7f77dd";
  const slideIn = Math.min(progress * 3, 1);
  const fadeOut = progress > 0.85 ? 1 - (progress - 0.85) * 6.6 : 1;
  
  ctx.globalAlpha = fadeOut;
  
  // Animación de abajo hacia arriba
  const boxHeight = 150;
  const boxY = H - boxHeight - 40;
  const offsetY = (1 - slideIn) * (boxHeight + 60);
  
  // Caja contenedora
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.beginPath(); 
  ctx.roundRect(20, boxY + offsetY, W - 40, boxHeight, 12); 
  ctx.fill();
  
  // Barra lateral de acento
  ctx.fillStyle = accent;
  ctx.fillRect(20, boxY + offsetY, 8, boxHeight);
  
  // Título - fuentes más grandes
  ctx.fillStyle = accent;
  ctx.font = "bold 44px system-ui, -apple-system, sans-serif";
  ctx.fillText(p.title || "WAKAR1 TRADING", 45, boxY + 68 + offsetY);
  
  // Subtítulo - fuentes más grandes
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "600 32px system-ui, -apple-system, sans-serif";
  ctx.fillText(p.subtitle || "Plataforma de IA para traders", 45, boxY + 118 + offsetY);
  
  ctx.globalAlpha = 1;
}
