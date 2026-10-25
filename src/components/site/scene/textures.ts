import * as THREE from "three";
import type { CodeLayer } from "./code";

const INK = "rgba(237, 235, 230, 0.78)";
const DIM = "rgba(237, 235, 230, 0.36)";
const KEY = "rgba(166, 205, 214, 0.9)";
const FLARE = "#ff5a1f";

const KEYWORDS = /\b(export|async|function|const|await|return|import|from|if|throw|new)\b/g;

/** Draws one source file onto a square canvas, used as a layer inside the glass. */
export function codeTexture(layer: CodeLayer, size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const pad = size * 0.07;
  const lh = size * 0.047;
  const fs = size * 0.026;

  ctx.clearRect(0, 0, size, size);

  // File tab
  ctx.font = `600 ${fs * 1.05}px ui-monospace, Menlo, monospace`;
  ctx.fillStyle = DIM;
  ctx.fillText(layer.file, pad, pad + fs);

  ctx.font = `400 ${fs}px ui-monospace, Menlo, monospace`;
  layer.lines.forEach((line, i) => {
    const y = pad + lh * 2.2 + i * lh;
    // gutter
    ctx.fillStyle = DIM;
    ctx.fillText(String(i + 1).padStart(2, " "), pad, y);
    const x = pad + fs * 2.6;
    if (i === layer.hot) {
      ctx.fillStyle = "rgba(255, 90, 31, 0.16)";
      ctx.fillRect(x - fs * 0.5, y - fs * 1.05, size - x - pad + fs * 0.5, lh * 0.98);
      ctx.fillStyle = FLARE;
      ctx.fillText(line, x, y);
      return;
    }
    // naive keyword colouring, left to right
    let cursor = x;
    let last = 0;
    for (const m of line.matchAll(KEYWORDS)) {
      const before = line.slice(last, m.index);
      ctx.fillStyle = INK;
      ctx.fillText(before, cursor, y);
      cursor += ctx.measureText(before).width;
      ctx.fillStyle = KEY;
      ctx.fillText(m[0], cursor, y);
      cursor += ctx.measureText(m[0]).width;
      last = (m.index ?? 0) + m[0].length;
    }
    ctx.fillStyle = INK;
    ctx.fillText(line.slice(last), cursor, y);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Soft round sprite for glows, drawn once. */
export function glowTexture(size = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(255,255,255,0.65)");
  g.addColorStop(0.45, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** The scanning sheet: a hard bright leading edge with a short falloff. */
export function scanTexture(w = 512, h = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.82, "rgba(190,230,240,0.18)");
  g.addColorStop(0.97, "rgba(235,250,255,0.95)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
