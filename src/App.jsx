import { useState, useEffect, useRef, useCallback } from "react";
import { TRANSITIONS, getDrawFunction } from "./transitions";

const SAVE_DIR = "C:\\Users\\richa\\Videos\\Transitions-wakar1";

function exportCanvasVideo(canvas, transition, params, liveData, onProgress) {
  return new Promise(async (resolve, reject) => {
    const fps = 60;
    const stream = canvas.captureStream(fps);
    const mimeType = "video/webm;codecs=vp9";
    const chunks = [];

    let recorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType });
    } catch {
      recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    }

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const filename = `${transition.id}_${ts}.webm`;

      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{ description: "WebM Video", accept: { "video/webm": [".webm"] } }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          resolve(filename);
          return;
        } catch (err) {
          if (err.name === "AbortError") { resolve(null); return; }
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve(filename);
    };

    recorder.start(100);

    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const drawFn = getDrawFunction(transition.id);
    const duration = transition.duration;
    const frameMs = 1000 / fps;
    const totalFrames = Math.ceil(duration / frameMs);
    let frame = 0;

    const drawNext = () => {
      const elapsed = frame * frameMs;
      const progress = Math.min(elapsed / duration, 1);
      ctx.clearRect(0, 0, W, H);
      if (drawFn) {
        if (transition.id === "epic_transition") {
          drawFn(ctx, W, H, progress, params, liveData);
        } else {
          drawFn(ctx, W, H, progress, params);
        }
      }
      frame++;
      onProgress?.(frame / totalFrames);
      if (elapsed < duration) {
        setTimeout(drawNext, frameMs);
      } else {
        recorder.stop();
      }
    };

    drawNext();
  });
}

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

function PreviewCanvas({ transition, params, playing, onEnd, canvasRef: externalRef }) {
  const internalRef = useRef(null);
  const canvasRef = externalRef || internalRef;
  const animRef = useRef(null);
  const startRef = useRef(null);
  const liveDataRef = useRef(null);

  // Fetch live data when epic transition is selected
  useEffect(() => {
    if (transition.id === "epic_transition" && params.symbol) {
      fetchBinancePrices(params.symbol).then((data) => {
        liveDataRef.current = data;
      });
    }
  }, [transition.id, params.symbol]);

  const drawFrame = useCallback((canvas, ctx, t, p) => {
    const dpr = window.devicePixelRatio || 1;
    const W = 1920;
    const H = 1080;
    const progress = t / transition.duration;

    // Reaplica transform por frame para mantener escala limpia en pantallas HiDPI.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.clearRect(0, 0, W, H);

    const drawFn = getDrawFunction(transition.id);
    if (drawFn) {
      if (transition.id === "epic_transition") {
        drawFn(ctx, W, H, progress, p, liveDataRef.current);
      } else {
        drawFn(ctx, W, H, progress, p);
      }
    }
  }, [transition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    // Renderizamos nativamente en Full HD (1920x1080) para máxima nitidez
    const rectWidth = 1920;
    const rectHeight = 1080;
    
    canvas.width = rectWidth * dpr;
    canvas.height = rectHeight * dpr;
  }, [canvasRef]);

  useEffect(() => {
    if (!playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    startRef.current = null;
    let done = false;

    const loop = (now) => {
      if (done) return;
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      drawFrame(canvas, ctx, elapsed, params);
      if (elapsed >= transition.duration) {
        done = true;
        onEnd?.();
        return;
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { done = true; cancelAnimationFrame(animRef.current); };
  }, [playing, params, drawFrame, transition, onEnd]);

  useEffect(() => {
    if (playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawFrame(canvas, ctx, transition.duration * 0.4, params);
  }, [params, playing, drawFrame, transition]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 8,
        background: "#050c14",
        display: "block",
        margin: 0,
        imageRendering: "auto",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    />
  );
}

function ParamControl({ param, value, onChange }) {
  const s = { fontSize: 11, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 };
  if (param.type === "text") return (
    <div style={{ marginBottom: 6 }}>
      <label style={s}>{param.label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", fontFamily: "monospace", fontSize: 11 }} />
    </div>
  );
  if (param.type === "color") return (
    <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
      <label style={{ ...s, marginBottom: 0 }}>{param.label}</label>
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        style={{ width: 28, height: 22, border: "none", cursor: "pointer", background: "none" }} />
      <span style={{ fontSize: 9, fontFamily: "monospace", color: "var(--color-text-secondary)" }}>{value}</span>
    </div>
  );
  if (param.type === "range") return (
    <div style={{ marginBottom: 6 }}>
      <label style={s}>{param.label}: <strong style={{ color: "var(--color-text-primary)" }}>{value}%</strong></label>
      <input type="range" min={param.min} max={param.max} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))} style={{ width: "100%" }} />
    </div>
  );
  if (param.type === "toggle") return (
    <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
      <label style={{ ...s, marginBottom: 0 }}>{param.label}</label>
      <button onClick={() => onChange(!value)}
        style={{
          padding: "1px 8px", fontSize: 9, borderRadius: 12,
          background: value ? "#00ff8822" : "transparent",
          color: value ? "#00ff88" : "var(--color-text-secondary)",
          border: `1px solid ${value ? "#00ff88" : "var(--color-border-tertiary)"}`,
          cursor: "pointer"
        }}>
        {value ? "SÍ" : "NO"}
      </button>
    </div>
  );
  if (param.type === "select") return (
    <div style={{ marginBottom: 6 }}>
      <label style={s}>{param.label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", fontSize: 11 }}>
        {param.options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
  return null;
}

export default function App() {
  const [selected, setSelected] = useState(TRANSITIONS[0]);
  const [playing, setPlaying] = useState(false);
  const [filter, setFilter] = useState("All");
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const canvasRef = useRef(null);
  const [params, setParams] = useState(() => {
    const init = {};
    TRANSITIONS.forEach(t => {
      init[t.id] = {};
      t.params.forEach(p => { init[t.id][p.id] = p.default; });
    });
    return init;
  });

  const currentParams = params[selected.id];
  const setParam = (key, val) => setParams(prev => ({ ...prev, [selected.id]: { ...prev[selected.id], [key]: val } }));

  const categories = ["All", ...new Set(TRANSITIONS.map(t => t.category))];
  const visible = filter === "All" ? TRANSITIONS : TRANSITIONS.filter(t => t.category === filter);

  const handlePlay = () => {
    setPlaying(false);
    setTimeout(() => setPlaying(true), 50);
  };

  const handleExport = async () => {
    if (exporting || !canvasRef.current) return;
    setExporting(true);
    setExportProgress(0);
    try {
      const liveData = selected.id === "epic_transition"
        ? await fetchBinancePrices(currentParams.symbol || "BTCUSDT")
        : null;
      const filename = await exportCanvasVideo(
        canvasRef.current, selected, currentParams, liveData,
        (p) => setExportProgress(p)
      );
      if (filename) alert(`Guardado en:\n${SAVE_DIR}\\${filename}`);
    } catch (err) {
      alert("Error al exportar: " + err.message);
    }
    setExporting(false);
    setExportProgress(0);
  };

  return (
    <div style={{ display: "flex", gap: 0, height: "100vh", fontFamily: "var(--font-sans)", background: "var(--color-background-primary)", overflow: "hidden", fontSize: 14 }}>

      {/* Left panel — library (scrollable) */}
      <div style={{ width: "clamp(360px, 24vw, 460px)", borderRight: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "10px 12px 8px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-secondary)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>WAKAR1 Composer</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                style={{
                  fontSize: 13, padding: "4px 10px", borderRadius: 12, cursor: "pointer",
                  background: filter === c ? "#7f77dd22" : "transparent",
                  color: filter === c ? "#7f77dd" : "var(--color-text-secondary)",
                  border: `0.5px solid ${filter === c ? "#7f77dd" : "var(--color-border-tertiary)"}`,
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {visible.map(t => (
            <div key={t.id}
              onClick={() => { setSelected(t); setPlaying(false); }}
              style={{
                padding: "12px", cursor: "pointer", borderBottom: "0.5px solid var(--color-border-tertiary)",
                background: selected.id === t.id ? "var(--color-background-secondary)" : "transparent",
                borderLeft: selected.id === t.id ? `3px solid ${t.color}` : "3px solid transparent",
                transition: "background 0.15s",
              }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.25 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 3 }}>{t.category} · {(t.duration / 1000).toFixed(1)}s</div>
              <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                {t.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 11, background: "var(--color-background-tertiary)", color: "var(--color-text-tertiary)", padding: "1px 7px", borderRadius: 3 }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 12px", borderTop: "0.5px solid var(--color-border-tertiary)", fontSize: 12, color: "var(--color-text-tertiary)" }}>
          {TRANSITIONS.length} transiciones · v1.0
        </div>
      </div>

      {/* Center panel — preview */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "5px 12px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{selected.icon} {selected.name}</span>
            <span style={{ marginLeft: 8, fontSize: 13, color: "var(--color-text-secondary)" }}>{selected.description}</span>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontFamily: "monospace" }}>{(selected.duration / 1000).toFixed(1)}s · 16:9</span>
            <button onClick={handlePlay}
              style={{ padding: "6px 14px", fontSize: 13, borderRadius: 4, cursor: "pointer", background: selected.color + "22", color: selected.color, border: `1px solid ${selected.color}55`, fontWeight: 600 }}>
              ▶ Preview
            </button>
          </div>
        </div>

        <div style={{ flex: 1, padding: 10, display: "flex", flexDirection: "column", gap: 8, overflow: "hidden" }}>
          <div
            style={{
              position: "relative",
              flex: 1,
              minHeight: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
              borderRadius: 8,
              background: "var(--color-background-secondary)",
            }}
          >
            <div style={{ width: "100%", maxWidth: "none", aspectRatio: "16 / 9" }}>
              <PreviewCanvas
                transition={selected}
                params={currentParams}
                playing={playing}
                onEnd={() => setPlaying(false)}
                canvasRef={canvasRef}
              />
            </div>
            {playing && (
              <div style={{
                position: "absolute", top: 6, right: 6,
                background: "rgba(0,0,0,0.7)", color: "#ff4444",
                fontSize: 9, fontFamily: "monospace", padding: "1px 6px", borderRadius: 3,
                display: "flex", alignItems: "center", gap: 3
              }}>
                <span style={{ width: 5, height: 5, borderRadius: 3, background: "#ff4444", display: "inline-block", animation: "blink 1s infinite" }} />
                REC
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {[
              { label: "Resolución", val: "1920×1080" },
              { label: "FPS", val: "60" },
              { label: "Formato", val: "WebM" },
              { label: "Duración", val: `${(selected.duration / 1000).toFixed(1)}s` },
            ].map(item => (
              <div key={item.label} style={{ flex: 1, background: "var(--color-background-secondary)", borderRadius: 4, padding: "6px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace" }}>{item.val}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: "6px 8px" }}>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 3, fontWeight: 600 }}>CÓMO USAR EN YOUTUBE</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.45 }}>
              1. Ajusta → 2. Preview → 3. Exporta WebM → 4. Importa en Premiere/DaVinci/CapCut
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — params */}
      <div style={{ width: "clamp(300px, 20vw, 380px)", borderLeft: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "5px 10px 4px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: 1 }}>PARÁMETROS</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
          {selected.params.map(p => (
            <ParamControl key={p.id} param={p} value={currentParams[p.id]} onChange={v => setParam(p.id, v)} />
          ))}
        </div>
        <div style={{ padding: "6px 10px", borderTop: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", gap: 4 }}>
          <button onClick={handlePlay}
            style={{ width: "100%", padding: "6px", fontWeight: 500, fontSize: 12, cursor: "pointer", background: selected.color + "22", color: selected.color, border: `1px solid ${selected.color}66`, borderRadius: 4 }}>
            ▶ Reproducir
          </button>
          <button onClick={handleExport} disabled={exporting}
            style={{
              width: "100%", padding: "6px", fontWeight: 500, fontSize: 12, borderRadius: 4,
              cursor: exporting ? "wait" : "pointer",
              background: exporting ? "#ff880033" : "#ff880022",
              color: exporting ? "#ff8800" : "#ff8800",
              border: `1px solid ${exporting ? "#ff8800" : "#ff880066"}`,
              opacity: exporting ? 0.8 : 1,
            }}>
            {exporting ? `Grabando ${Math.round(exportProgress * 100)}%...` : "⬇ Exportar WebM"}
          </button>
          <button onClick={() => {
            const init = {};
            selected.params.forEach(p => { init[p.id] = p.default; });
            setParams(prev => ({ ...prev, [selected.id]: init }));
          }} style={{ width: "100%", padding: "5px", fontSize: 11, cursor: "pointer" }}>
            ↺ Restaurar
          </button>
        </div>
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}
