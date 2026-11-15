"use client";

/**
 * Liquid glass, for real: a displacement map computed from the shape of the glass.
 *
 * The glass is a rounded rectangle with a convex bezel. For every pixel we know how far it is from
 * the edge; inside the bezel the surface is curved, so a ray coming straight down is bent (Snell's
 * law, n = 1.5) and lands somewhere else on what is behind the glass. That offset, per pixel, is the
 * map. An SVG feDisplacementMap then moves the pixels (technique after kube.io's "Liquid Glass in
 * the Browser"; the maths and code here are our own).
 *
 * Two ways to use the map:
 *   - `filter: url(#id)` on an element that holds a registered copy of what is behind it: works in
 *     Chromium, WebKit and Firefox (the lens, the threat slab).
 *   - `backdrop-filter: url(#id)`: bends whatever really is behind the element, Chromium only (the
 *     nav). Other engines get the designed fallback in site.css.
 */

export type GlassShape = {
  width: number;
  height: number;
  /** corner radius, px */
  radius: number;
  /** width of the curved rim, px */
  bezel: number;
  /** thickness of the glass at the flat part, px (taller = stronger bend) */
  depth: number;
  /** magnification of the flat interior (1 = none) */
  zoom?: number;
};

export type GlassMap = {
  /** PNG data URL: R = x offset, G = y offset, 128 = none */
  url: string;
  /** the feDisplacementMap `scale` that turns the map back into pixels */
  scale: number;
  width: number;
  height: number;
};

const INDEX = 1.5;

/** how far a vertical ray is displaced at distance t (0 edge, 1 end of bezel) across the rim */
function bezelCurve(bezel: number, depth: number, samples = 96): Float32Array {
  // convex squircle profile: flat on top, falling away steeply at the very edge
  const h = (t: number) => Math.pow(1 - Math.pow(1 - t, 4), 0.25);
  const out = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    const e = 1e-3;
    const slope = ((h(Math.min(1, t + e)) - h(Math.max(0, t - e))) / (2 * e)) * (depth / bezel);
    const incident = Math.atan(slope);
    const refracted = Math.asin(Math.sin(incident) / INDEX);
    out[i] = (h(t) * depth + depth * 0.35) * Math.tan(incident - refracted);
  }
  return out;
}

export function buildGlassMap(shape: GlassShape, maxDisplacement?: number): GlassMap | null {
  if (typeof document === "undefined") return null;
  const W = Math.max(2, Math.round(shape.width));
  const H = Math.max(2, Math.round(shape.height));
  const R = Math.min(shape.radius, W / 2, H / 2);
  const bezel = Math.max(1, Math.min(shape.bezel, W / 2, H / 2));
  const zoom = shape.zoom ?? 1;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const curve = bezelCurve(bezel, shape.depth);
  let peak = 0;
  for (let i = 0; i < curve.length; i++) peak = Math.max(peak, curve[i]);
  // the physical curve has a spike at the very edge; cap it so the rim stays a rim
  const cap = maxDisplacement ?? bezel * 0.9;
  const gain = peak > cap ? cap / peak : 1;

  const vx = new Float32Array(W * H);
  const vy = new Float32Array(W * H);
  let maxMag = 0.0001;
  const hx = W / 2 - R;
  const hy = H / 2 - R;
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const px = i + 0.5 - W / 2;
      const py = j + 0.5 - H / 2;
      const qx = Math.abs(px) - hx;
      const qy = Math.abs(py) - hy;
      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const inside = -(Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - R); // > 0 inside the glass
      let dx = 0;
      let dy = 0;
      if (inside >= 0) {
        if (inside < bezel) {
          const m = curve[Math.min(curve.length - 1, Math.floor((inside / bezel) * (curve.length - 1)))] * gain;
          // inward normal of the rounded rectangle
          let nx: number;
          let ny: number;
          if (qx > 0 && qy > 0) {
            const l = Math.hypot(ox, oy) || 1;
            nx = (-Math.sign(px) * ox) / l;
            ny = (-Math.sign(py) * oy) / l;
          } else if (qx > qy) {
            nx = -Math.sign(px);
            ny = 0;
          } else {
            nx = 0;
            ny = -Math.sign(py);
          }
          dx += nx * m;
          dy += ny * m;
        }
        if (zoom !== 1) {
          dx += px * (1 / zoom - 1);
          dy += py * (1 / zoom - 1);
        }
      }
      const k = j * W + i;
      vx[k] = dx;
      vy[k] = dy;
      const mag = Math.max(Math.abs(dx), Math.abs(dy));
      if (mag > maxMag) maxMag = mag;
    }
  }

  const img = ctx.createImageData(W, H);
  for (let k = 0; k < W * H; k++) {
    img.data[k * 4] = Math.round(128 + (vx[k] / maxMag) * 127);
    img.data[k * 4 + 1] = Math.round(128 + (vy[k] / maxMag) * 127);
    img.data[k * 4 + 2] = 128;
    img.data[k * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return { url: canvas.toDataURL("image/png"), scale: maxMag * 2, width: W, height: H };
}

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";

/**
 * Point an existing <filter> (rendered by <GlassFilter>) at a freshly built map. The filter keeps
 * its three displacement passes; red, green and blue are bent by slightly different amounts, which
 * is the colour fringe at the rim (`dispersion` is the spread, 0.06 = 6 %).
 */
export function applyGlassMap(filter: SVGFilterElement | null, map: GlassMap | null, dispersion = 0.06) {
  if (!filter || !map) return false;
  const image = filter.querySelector("feImage");
  if (!image) return false;
  image.setAttribute("href", map.url);
  image.setAttributeNS(XLINK_NS, "xlink:href", map.url);
  image.setAttribute("width", String(map.width));
  image.setAttribute("height", String(map.height));
  const passes = filter.querySelectorAll("feDisplacementMap");
  passes.forEach((p, i) => {
    const spread = passes.length === 3 ? 1 + (i - 1) * dispersion : 1;
    p.setAttribute("scale", (map.scale * spread).toFixed(2));
  });
  filter.dataset.ready = "true";
  return true;
}

/** Does this engine apply an SVG filter as a backdrop-filter? (Chromium does; WebKit and Firefox do not.) */
export function supportsBackdropUrl(): boolean {
  if (typeof CSS === "undefined" || !CSS.supports) return false;
  // WebKit parses the value and then ignores it, so support is decided by engine, not by parsing
  const ua = navigator.userAgent;
  const chromium = /Chrome\/|Chromium\/|Edg\//.test(ua) && !/OPR\/.*Mini/.test(ua);
  return chromium && CSS.supports("backdrop-filter", "url(#x)");
}

export { SVG_NS };
