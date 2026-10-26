/**
 * Renders the 1200x630 social cards (Open Graph and Twitter) from the running site.
 *
 *   pnpm dev          # in one terminal: the site on :3100
 *   pnpm og           # in another: rewrites the four card files under src/app
 *   pnpm og --url http://localhost:3000   # another origin
 *
 * Each card is the live corridor (a screenshot of the real WebGL canvas, drawn once, with reduced
 * motion), then the mark, the headline and the wordmark set as ordinary page text in the site's own
 * typeface. Nothing is masked, so the cards cannot lose the tails of g, j, p, q and y the way a
 * split-text headline once did. The corridor looks whatever the shader says it does today.
 *
 * The headlines below are checked against each page's <h1>: change the copy on a page and this
 * script refuses to run until the card says the same thing (and its alt text, next to the image,
 * is updated by hand).
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const APP_DIR = fileURLToPath(new URL("../src/app/", import.meta.url));

const CARDS = [
  { route: "/", dir: "", lines: ["Attack your code", "before anyone else does."] },
  { route: "/pricing", dir: "(site)/pricing/", lines: ["Security that", "scales with you."] },
];

const WIDTH = 1200;
const HEIGHT = 630;
// render at 1.5x and resample down: crisper rim lines and type than a 1x screenshot
const SCALE = 1.5;
// WhatsApp and iMessage skip heavier previews; take the best quality that fits
const MAX_BYTES = 122_000;

const argUrl = process.argv.indexOf("--url");
const BASE = (argUrl > -1 ? process.argv[argUrl + 1] : process.env.OG_BASE_URL) ?? "http://localhost:3100";

// the corridor is drawn in software GL so a card looks the same on every machine
const GL_ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];

const browser = await chromium.launch({ args: GL_ARGS }).catch((err) => {
  console.error(`${err.message}\n\nIf the browser is missing: pnpm exec playwright install chromium`);
  process.exit(1);
});

try {
  for (const card of CARDS) {
    const context = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: SCALE,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(BASE + card.route, { waitUntil: "networkidle" }).catch(() => {
      throw new Error(`Could not load ${BASE + card.route}. Is the site running (pnpm dev)?`);
    });

    const heading = (await page.locator("h1").first().textContent())?.replace(/\s+/g, " ").trim();
    const wanted = card.lines.join(" ");
    if (heading !== wanted) {
      throw new Error(`${card.route}: the page says "${heading}" but the card says "${wanted}". Update CARDS in scripts/render-og.mjs.`);
    }

    // the headline's own font stack, loaded before anything is measured or drawn
    await page.evaluate(() => document.fonts.load('620 92px "Mona Sans"'));
    await page.waitForFunction(() => [...document.fonts].some((f) => f.family.includes("Mona Sans") && f.status === "loaded"));
    await page.waitForSelector("canvas.corridor");
    await page.waitForTimeout(2500); // the opening mood has settled and the corridor has been drawn

    await page.evaluate((lines) => {
      // leave only the corridor: the page content and the dev overlay go
      for (const sel of [".site-content", ".skip-link", "nextjs-portal"]) {
        document.querySelectorAll(sel).forEach((el) => el.style.setProperty("display", "none", "important"));
      }
      const font = getComputedStyle(document.querySelector("h1")).fontFamily;
      const layer = document.createElement("div");
      layer.style.cssText = `position:fixed;inset:0;z-index:2147483000;font-family:${font};color:#f3f5fa`;
      layer.innerHTML = `
        <svg style="position:absolute;left:52px;top:186px;color:#d2fb5a" width="54" height="54" viewBox="0 0 32 32" fill="none">
          <rect x="2" y="2" width="28" height="28" rx="9" stroke="currentColor" stroke-width="2.2"/>
          <rect x="8.5" y="8.5" width="15" height="15" rx="4.5" stroke="currentColor" stroke-width="2.2" opacity="0.8"/>
          <rect x="13" y="13" width="6" height="6" rx="1.8" fill="currentColor"/>
        </svg>
        <p style="position:absolute;left:52px;top:262px;margin:0;font-size:92px;font-weight:620;letter-spacing:-0.05em;line-height:1;font-variation-settings:'wdth' 100;white-space:nowrap">${lines.map((l) => `<span style="display:block">${l}</span>`).join("")}</p>
        <p style="position:absolute;right:58px;bottom:44px;margin:0;font-size:15px;font-weight:500;letter-spacing:-0.01em;color:#bec4d4">infiniview</p>`;
      document.body.appendChild(layer);
    }, card.lines);
    await page.waitForTimeout(400);

    const shot = await page.screenshot({ type: "png" });
    await context.close();

    const card1x = await sharp(shot).resize(WIDTH, HEIGHT, { kernel: "lanczos3" }).png().toBuffer();
    let jpeg;
    for (let quality = 96; quality >= 70; quality--) {
      jpeg = await sharp(card1x).jpeg({ quality, progressive: true, mozjpeg: true, chromaSubsampling: "4:2:0" }).toBuffer();
      if (jpeg.length <= MAX_BYTES) break;
    }
    if (jpeg.length > MAX_BYTES) throw new Error(`${card.route}: ${jpeg.length} bytes even at quality 70`);

    for (const name of ["opengraph-image.jpg", "twitter-image.jpg"]) {
      writeFileSync(APP_DIR + card.dir + name, jpeg);
    }
    console.log(`${card.route.padEnd(9)} ${WIDTH}x${HEIGHT}  ${(jpeg.length / 1000).toFixed(1)} KB  -> src/app/${card.dir}{opengraph,twitter}-image.jpg`);
  }
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
