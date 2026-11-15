# Reference study (first-hand, 2026-11-15)

Every site below was opened in a real browser by `refstudy.mjs` (Playwright): **Chromium 156 and
WebKit 27.2**, 1440×900, real GPU. For each one the script records what the first five seconds look
like (frames at 0.3, 1.2, 2.5 and 5 s), sweeps the pointer across the first screen, scrolls one
screen at a time with the wheel (or keeps wheeling when the page does not scroll natively), and
fingerprints the page: canvases and their context types, engine strings, libraries requested,
loaded font faces, heading sizes and tracking, `backdrop-filter` usage, SVG filter chains, sticky
and fixed elements, word count. Captures and the JSON fingerprints are outside git in
`~/.t3/infiniview-redesign/references/<site>/` (`chromium-sheet.jpg`, `webkit-sheet.jpg`,
`fingerprint.json`).

What "first-hand" does not cover: pages behind a click-to-start gate, real-device behaviour, and
anything that needs sound. Where a claim below comes from an article and not from the capture, it
says so.

## The three pinnacle references

### Igloo Inc. (igloo.inc)

- **Stack seen:** three.js r165; Draco, KTX2/Basis and EXR requests; **zero DOM words** and no
  canvas in the light DOM (the text is drawn in WebGL). The document is one screen tall and does not
  scroll: the wheel drives a timeline.
- **Loading:** 5 s of a flat `rgb(160,165,177)` ground with a small dotted progress line in the
  middle. Nothing else. The world then simply is there.
- **Technique:** one palette for everything (cold grey-blue; light only from inside objects).
  The subject assembles itself: the igloo's ice blocks lift and glow as the pointer passes. Between
  rooms the camera pushes into fog and the fog is the cut. Text is a four-corner mono HUD; labels are
  pinned to the object with hairlines ("PORTFOLIO_CO_01", a temperature read-out). Colour fringing
  appears only on frames where the camera is moving.
- **Taken:** one world whose rooms differ by light, not by a new background (our wall and its
  moving, colour-changing light); data pinned to the object (the flags on the sample app's weak
  points, the findings landing on the pipeline's app); the subject assembling itself (the sandbox
  sealing around the app); fringing only in motion (the wall's dispersion grows with scroll speed).
- **Not taken:** the scroll lock (ours is a normal page with native scroll), a textless canvas
  (ours is real HTML), ice, terrain, the grey-blue palette.

### Lando Norris (landonorris.com)

- **Stack seen:** Webflow, three.js r174 (one full-screen WebGL2 canvas, `.gl`), Rive (19 small 2D
  canvases), Lenis, `.glb` and `.hdr` requests. Fonts: Brier 700 and Mona Sans Variable. Ground
  `rgb(40,44,32)`. 542 words over 15 screens.
- **Loading:** a full lime field with the mark in the middle for about 2.5 s, then the portrait.
- **Technique:** the hero is one interaction: the pointer paints a soft mask that swaps the
  portrait for a helmet render (visible in the four pointer-sweep frames). Type tension: a high
  contrast serif against a heavy grotesk in the same line; 38 px headings beside 10 px labels.
  Dense and quiet screens alternate (a wall of helmets, then one sentence). The footer is a poster.
- **Taken:** one hero interaction that is understood at once and reveals a second layer under the
  pointer (ours is a physical lens with refraction and a game on top, not a paint mask); a keyboard
  twin for it (the tray buttons); scale contrast; dense and quiet rhythm (pipeline, then ledger);
  a footer that is a poster.
- **Not taken:** the lime-and-olive palette as a look (our lime is the existing brand colour and
  means "verified"), contour lines, the signature, the colour-block wipe, racing motifs.

### Lusion (lusion.co)

- **Stack seen:** three.js r158 (one WebGL2 canvas), EXR and MP4 requests, Aeonik with IBM Plex Mono.
  The document does not scroll natively (wheel-driven).
- **Loading:** black, a three-digit counter bottom left and a bar that fills in the middle; the
  first scene opens with a diagonal wipe.
- **Technique:** a quiet white DOM frame around one loud canvas in a rounded frame; rigid glossy
  forms that the pointer pushes around; each scroll chapter is a different scene with its own
  material (white studio, astronaut in black, prismatic tunnel, blue room). Controls are visibly
  stateful.
- **Taken:** the quiet frame around the loud thing (our page is quiet; the loud things are the lens,
  the chamber, the finale); a different material and motion per chapter; stateful controls (the
  menu button's bars turn into a cross, the timeline handle).
- **Not taken:** the virtual scroll, the forms, the white studio.

## Product and devtool sites

| Site | What the capture shows | What we took |
| --- | --- | --- |
| **Linear** (linear.app) | Next.js; no canvas at all; ground `rgb(8,9,10)`; Inter Variable 510 at 64 px, tracking −1.4 px, with Berkeley Mono; the hero is the real app window, bleeding off the fold; sections are "title left, two lines right"; 3 uses of backdrop blur on the whole page | The product UI is the protagonist; near-black with one accent that means something; restraint about glass; section heads as title left, lede right |
| **Vercel** (vercel.com) | Next.js; Geist Sans and Geist Mono; 124 words on the first load; one 2D canvas; H1 64 px at −3.84 px tracking | Mono only for real data; very tight tracking on display type; few words |
| **Stripe** (stripe.com) | three.js r178, two WebGL2 canvases (the gradient wave); Söhne variable, H1 weight 300; a strict column grid | One ambient WebGL layer behind a strict DOM grid (the wall, whose flutes are the column rhythm) |
| **Raycast** (raycast.com) | three.js r186 for the red light behind the headline (one effect); 39 backdrop-blur elements; the hero type arrives blurred and sharpens; product windows on every screen; a keyboard at the end that lights the keys you press | One effect; let the visitor use a miniature of the product (the console, the lens game); type that materialises instead of only fading (the lens arrives with blur and scale together) |
| **Arc** (arc.net) | Next.js; no canvas; four display faces; WebKit rendered 721 words where Chromium rendered 1,548 (content gated by engine) | Character in small interactions; a reminder to check both engines for missing content |
| **Resend** (resend.com) | three.js r149 and a Spline scene for the cube; Favorit with Domaine; H1 96 px weight 400 | A glass object can carry a hero, which is exactly why our glass is not a cube |
| **XBOW** (xbow.com), AI pentesting | three.js r182, three WebGL2 canvases; ground `rgb(0,8,11)` with a lime accent; Geist Mono headline "Every finding is a working exploit."; the hero is a real finding document; closes with "Can XBOW break into your app?" and a full-width wordmark | The closest competitor look. Confirms that a real finding should lead; told us what to avoid so we do not read as a copy: no mono headline, no static finding document as the hero (ours is an interaction), glass and the wall as our material |
| **Aikido** (aikido.dev) | Webflow with GSAP 3.15 and ScrollTrigger; white ground; no canvas | Nothing visual; a check that security buyers accept a calm page |
| **Semgrep** (semgrep.dev) | Rive animations; white ground; Inter with JetBrains Mono | The scanner we list is a real product with its own identity: names, not logos |
| **Greptile**, **Cursor**, **Warp**, **Clerk**, **Framer**, **Railway**, **Wiz** | Fingerprints and sheets captured; mostly Next.js with video or a single canvas | Baselines for how devtool pages order their sections; no technique taken |
| **Family** (family.co) | Next.js with Motion; no canvas; MP4 demos of spring-driven UI | The bar for spring feel in ordinary UI (pills, trays) |

## Glass, and the craft writers

### kube.io, "Liquid Glass in the Browser" (read in full, and its live demos inspected)

- The article's method: model the glass as a height profile across its bezel (convex circle, convex
  squircle, concave, lip), take the surface normal from the profile's derivative, bend a vertical ray
  with Snell's law (n = 1.5), and store the resulting offset per pixel in the red and green channels
  of an image (128 = none); `feDisplacementMap`'s `scale` turns it back into pixels.
- Their live filter chain, read from the DOM in Chromium: `feGaussianBlur → feImage →
  feDisplacementMap → feColorMatrix(saturate) → feImage(specular) → feComposite(in) →
  feComponentTransfer → feBlend → feBlend`. The maps are static PNGs. On glass controls it is applied
  as `backdrop-filter: url(#…)` (6 elements), which the article states works in Chromium only; their
  own non-backdrop demos use plain `filter`.
- **Taken:** the displacement-map method. **Our own:** the map is computed at run time for each
  element's exact size (rounded rectangle, squircle bezel, optional magnification); red, green and
  blue are displaced in three passes with slightly different scales and added back, which is the
  colour fringe at the rim (the article does not do chromatic aberration); and, to get real
  refraction outside Chromium, the filter is applied with plain `filter` to a *registered copy* of
  what is behind the glass (the lens holds a second copy of the sample app; the slab holds a second
  copy of the rows). That renders the same in Chromium, WebKit and Firefox.
- **Found the hard way:** WebKit draws nothing when a filtered element contains very wide content
  (the threat rows), whatever clips it, so Safari gets the slab without the bend. An ancestor with an
  opacity or transform animation becomes the backdrop root and silently empties a backdrop filter.
  Playwright's headless WebKit and Firefox do not render `backdrop-filter: blur()` at all, so the
  nav's blur fallback cannot be captured there; it was designed to be legible with no blur.

### Apple: Liquid Glass overview and HIG Materials (read in a browser; the pages are client-rendered)

- "Liquid Glass forms a distinct functional layer for controls and navigation elements … that floats
  above the content layer." "Don't use Liquid Glass in the content layer." "Use Liquid Glass effects
  sparingly." The clear variant is only for visually rich backgrounds and may need a 35 % dimming
  layer; the regular variant blurs and adjusts luminosity for legibility. Reduced transparency and
  increased contrast change its appearance.
- **Taken:** glass for the nav, the lens, the slab, the timeline handle and selection pills, and
  nowhere else; content on solid surfaces; a body tint dense enough for text; solid surfaces under
  `prefers-reduced-transparency` and `prefers-contrast`.
- The WWDC session video (219) was not watched; its ideas are taken from the two pages above and
  from the installed `apple-design` skill, which summarises Apple's fluid-interface talks.

### Rauno Freiberg (rauno.me, "Invisible Details of Interaction Design", Web Interface Guidelines)

- Interruptibility, gestures that commit on intent, no animation on high-frequency actions, spatial
  consistency; the checklist items on hit areas, `tabular-nums`, hover only on hover-capable
  devices, 16 px inputs on iOS, pausing loops off screen.
- **Taken:** every spring can be redirected in flight; lightweight actions fire during the gesture
  (a finding locks while the lens is over it), nothing destructive exists; the timeline handle's
  44 px hit area; tabular numerals; loops pause off screen. (Second half of the essay reached us
  only as a summary; the principles used are from the part read verbatim.)

### Emil Kowalski (emilkowal.ski, "Great Animations", and his installed skills)

- UI motion under 300 ms; ease-out for arrivals; never animate from `scale(0)`; `:active` at 0.97;
  CSS or WAAPI when the main thread is busy; springs for what is dragged.
- **Taken:** all of it; see `motion-system.md` and `skills-evidence.md`.

### Linear's redesign write-up and Stripe's Connect front-end post (read as articles)

- Linear: themes generated from three variables in LCH; neutral surfaces; alignment. Stripe:
  transitions first, then keyframes, then WAAPI, then rAF; `transform` and `opacity` only; one-shot
  IntersectionObserver reveals.
- **Taken:** a small neutral surface scale (`--iv-s1..s3`) instead of many tints; the order of
  animation tools.

## Decision map

| Decision in the build | Reference it learns from |
| --- | --- |
| One interaction owns the hero (the lens) and has a keyboard twin | Lando Norris |
| The glass really refracts, from a computed displacement map | kube.io |
| Glass only on controls and navigation; content on solid surfaces | Apple HIG Materials |
| The product UI, square and exact, is what every chapter shows | Linear, Raycast, XBOW |
| One world, rooms differ by light; fringing only in motion | Igloo |
| Quiet page, a few loud things; a new material and motion per chapter | Lusion |
| One ambient WebGL layer behind a strict grid | Stripe |
| The first screen needs no script, canvas or font to appear | Linear (no canvas), Emil Kowalski |
| Springs with velocity handoff and momentum projection for everything touched | Apple (via `apple-design`), Family, Rauno Freiberg |
| Findings and numbers pinned to the thing they describe | Igloo |
| A real list behind every number (26 scanners by name) | Vercel, Linear |
| A closing question in full-bleed brand colour, then a wordmark poster | Lando Norris (and seen again on XBOW) |

## Not accessed, or only partly

- Igloo and Lusion past what the wheel reaches in 16 steps; Bruno Simon and other gated sites were
  not part of this study.
- Awwwards Sites of the Day and landdding's dev-tool category were not browsed in this session; the
  five-plus additional sites (XBOW, Aikido, Semgrep, Greptile, Family, Railway, Wiz, Clerk, Cursor,
  Warp, Framer) were chosen for being security or devtool products or for spring-driven UI.
- Real Safari, real Firefox and real phones: not available here. Everything above is Playwright's
  Chromium and WebKit builds on one Mac.
