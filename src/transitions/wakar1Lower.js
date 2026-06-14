export const wakar1Lower = {
  id: "wakar1_lower",
  name: "WAKAR1 Intro",
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
  // Removido el fondo opaco y la cuadrícula para permitir transparencia total (alfa = 0 en el fondo)
  
  const accent = p.accent || "#7f77dd";
  const slideIn = Math.min(progress * 3, 1);
  const fadeOut = progress > 0.85 ? 1 - (progress - 0.85) * 6.6 : 1;
  
  ctx.globalAlpha = fadeOut;
  const offsetX = (1 - slideIn) * -120;
  
  // Caja contenedora más gruesa (alto de 150px en vez de 90px)
  const boxHeight = 150;
  const boxY = H - boxHeight - 40;
  
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.beginPath(); 
  ctx.roundRect(20 + offsetX, boxY, W - 40, boxHeight, 12); 
  ctx.fill();
  
  // Barra lateral de acento (más ancha y adaptada a la nueva altura)
  ctx.fillStyle = accent;
  ctx.fillRect(20 + offsetX, boxY, 8, boxHeight);
  
  // Título con tamaño aumentado para alta legibilidad (38px bold con tipografía sans-serif elegante)
  ctx.fillStyle = accent;
  ctx.font = "bold 38px system-ui, -apple-system, sans-serif";
  ctx.fillText(p.title || "WAKAR1 TRADING", 45 + offsetX, boxY + 62);
  
  // Subtítulo con tamaño aumentado para alta legibilidad (27px semibold)
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "600 27px system-ui, -apple-system, sans-serif";
  ctx.fillText(p.subtitle || "Plataforma de IA para traders", 45 + offsetX, boxY + 112);
  
  ctx.globalAlpha = 1;
}
