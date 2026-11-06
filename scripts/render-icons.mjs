/**
 * Regenerates every raster icon from the one canonical mark, src/app/icon.svg (a byte-for-byte copy
 * of the Infiniview product's app/icon.svg), so the site, the product and the installed app share a
 * single mark and the rasters cannot drift from it.
 *
 *   pnpm icons
 *
 * Writes:
 *   src/app/favicon.ico        16, 32 and 48 px, PNG frames with alpha (the SVG's rounded tile)
 *   src/app/icon1.png          96 px, alpha (the second <link rel="icon">)
 *   src/app/apple-icon.png     180 px, opaque: iOS masks its own corners, so the tile fills the square
 *   public/icon-192.png        manifest "any", alpha
 *   public/icon-512.png        manifest "any", alpha
 *   public/icon-maskable-512.png  manifest "maskable", opaque; the glyph is inset to stay in the
 *                              80% safe circle that platform masks may crop to
 *
 * The SVG itself is never rewritten here: update it by copying the product file.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const path = (p) => fileURLToPath(new URL(p, root));
const svg = readFileSync(path("src/app/icon.svg"));
const GROUND = "#03040a"; // the tile colour in the SVG, used wherever a square must be opaque

/** The mark rendered from vector at exactly `size` px (alpha preserved, corners transparent). */
const render = (size) => sharp(svg, { density: (72 * size) / 32 }).resize(size, size).png().toBuffer();

/** The mark flattened on the tile colour, optionally inset (scale < 1) on a full-bleed square. */
async function opaque(size, scale = 1) {
  const inner = Math.round(size * scale);
  const mark = await render(inner);
  const off = Math.round((size - inner) / 2);
  return sharp({ create: { width: size, height: size, channels: 3, background: GROUND } })
    .composite([{ input: mark, left: off, top: off }])
    .removeAlpha()
    .png()
    .toBuffer();
}

/** A multi-size .ico whose frames are PNGs (supported by every current browser). */
function ico(frames) {
  const head = Buffer.alloc(6 + 16 * frames.length);
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(frames.length, 4);
  let offset = head.length;
  frames.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    head[e] = size === 256 ? 0 : size;
    head[e + 1] = size === 256 ? 0 : size;
    head.writeUInt16LE(1, e + 4); // colour planes
    head.writeUInt16LE(32, e + 6); // bits per pixel
    head.writeUInt32LE(data.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...frames.map((f) => f.data)]);
}

writeFileSync(path("src/app/favicon.ico"), ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await render(size) })))));
writeFileSync(path("src/app/icon1.png"), await render(96));
writeFileSync(path("src/app/apple-icon.png"), await opaque(180));
writeFileSync(path("public/icon-192.png"), await render(192));
writeFileSync(path("public/icon-512.png"), await render(512));
// the frame's far corner sits 46% of the width from the centre; 0.84 puts it inside the 40% safe radius
writeFileSync(path("public/icon-maskable-512.png"), await opaque(512, 0.84));
console.log("icons written from src/app/icon.svg");
