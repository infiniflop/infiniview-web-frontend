# Audit of the current site, and the plan

Audited 2026-11-15 against `origin/main` @ `066a700`, built for production and served locally
(port 3140). Headless Chromium 156, WebKit 27.2 and Firefox 157 from Playwright, all three on the
real GPU (Apple M4 through Metal), so frame rates below are measured, not guessed.

Evidence lives outside git in `~/.t3/infiniview-redesign/audit/`:

| What | Path |
| --- | --- |
| Every section of `/`, `/pricing`, `/preview`, 404 at 390, 768, 1024, 1440 | `chromium/<page>-<width>.jpg` (contact sheets), `chromium/frames/*.png` (full frames) |
| Load-in filmstrips, normal and 4x CPU | `filmstrip-home-1x.jpg`, `filmstrip-home-4x.jpg`, `filmstrip-home-390-4x.jpg`, `filmstrip-pricing-1x.jpg` |
| Scroll video of home | `home-scroll-1440.webm` |
| Mobile menu and every waitlist state | `states/*.png` |
| Lighthouse (3 runs each) | `lighthouse/` |
| CLS, frame times | `metrics-*.json` |

## Baseline numbers

| | Home desktop | Home mobile | Pricing desktop | Pricing mobile |
| --- | --- | --- | --- | --- |
| Lighthouse performance | 100 | 87 | 100 | 90 |
| Accessibility / Best practices / SEO | 100 / 100 / 100 | 100 / 100 / 100 | 100 / 100 / 100 | 100 / 100 / 100 |
| LCP | 0.80 s | 3.88 s | 0.72 s | 3.60 s |
| CLS (Lighthouse) | 0.035 | 0.006 | 0.002 | 0.002 |
| Total blocking time | 4 ms | 114 ms | 0 ms | 27 ms |

- CLS over load plus a full scroll (own trace): home 0.050 at 1440, 0.007 at 390; pricing 0.002.
- Scroll frame rate, home at 1440×900: Chromium 59.4 fps, WebKit 60 fps, **Firefox 35.9 fps**
  (95th-percentile frame 50 ms, 42 frames over 33 ms).

## Findings

### P0: what makes it read as "quite good" and not as the best

1. **One look, every screen.** The corridor tunnel is behind the hero, the statement, the pipeline,
   the console, the layers, the bento and the FAQ. Section after section is glass cards over the
   same rings. (`chromium/home-1440.jpg`, `chromium/home-768.jpg`: compare frames 00, 02, 05, 08,
   12, 14.) This is the critique the two v2 critics gave ("one look eight times").
2. **Stray artifacts through the copy.** The nearest frame of the tunnel draws a red-green-blue
   fringe as a vertical stripe at about x = 280, straight through the hero lede, the pipeline step
   titles and the layer rows (`frames/home-1440-00.png`, `home-1440-08.png`, `home-1440-14.png`).
   Bright rings also sit under the headline's last words. Type and scene collide by construction.
3. **The product is not on the page.** The hero's product is a five-line log card; the pipeline is a
   small CSS-3D diagram of overlapping panes that needs the caption "Illustration with sample data"
   (twice on phones); the layers are an abstract red disc. Nothing can be touched except the
   console, which is two screens down.
4. **Glass everywhere, so glass nowhere.** Every card, plate, tile and list is a frosted pane in the
   content layer. Apple's guidance (read first-hand, see `reference-study.md`) is the opposite:
   Liquid Glass is a functional layer for navigation and controls, floating over content; content
   sits on standard materials. None of it refracts; it is blur and a border.

### P1: glitches and things that are not fluid

5. **Wrong numbers for about a second.** The count-up shows "24 scanners", "25 static scanners",
   "11 runtime attack agents" and "94%" before settling (`frames/home-1440-14.png`,
   `chromium/home-768.jpg` frame 03, `chromium/home-390.jpg` frames 04 and 14). On a site whose
   claims are numbers, a wrong number on screen is the worst kind of "text stuck while loading".
6. **The first half second is empty, then a tunnel with no text.** The whole first screen is hidden
   until script, font and the first canvas frame are in: blank at 80 ms, tunnel alone at 300 ms,
   headline at about 500 to 950 ms on a fast machine; on a throttled phone the headline is still
   mid-mask at 960 ms and the screen completes around 1.7 s (`filmstrip-home-1x.jpg`,
   `filmstrip-home-390-4x.jpg`). That gate is also why mobile LCP is 3.9 s.
7. **The headline's entrance shifts layout.** It animates the font's width axis, so the letters
   re-flow every frame: a run of layout shifts on `#text` between 280 and 450 ms, and a CLS of 0.04
   to 0.05 on desktop (`metrics-filmstrip_cls.json`).
8. **Firefox drops to 36 fps** while scrolling the home page: a full-screen shader plus many blurred
   panes.
9. **Phone pipeline has dead space and tiny content.** The stage is a small diagram in the upper
   half, the caption floats mid-screen, the copy sits at the bottom (`chromium/home-390.jpg` frames
   05 to 10; `home-768.jpg` frames 05 to 09).
10. **Cut-off content on phones.** The findings rail ends in a half-cut card with no cue that it
    scrolls; the layer panel's body is clipped mid-sentence in its box (`chromium/home-390.jpg`
    frames 12 to 15).
11. **Tilt and magnets.** The hero card and the pipeline tilt with the pointer and buttons lean
    toward it. It is motion without meaning, and it is the first thing that reads as a template.
12. **One transition, repeated.** Outside the pinned pipeline, every section arrives the same way:
    fade and rise 40 px, with masked heading lines.

### P2: smaller things

13. A bento of six tiles, each repeating something shown better elsewhere on the page.
14. Text-heavy: 793 readable words in `<main>` on home; captions explain illustrations.
15. Large empty bands between sections at 768 and 1440 (`home-768.jpg` frame 10).
16. The marketing ground (`#03040a`, blue-black, round glass) and the product demo at `/preview`
    (`#07080b`, square, mono labels) look like two different companies.
17. `/privacy` and `/terms` are linked and 404 (unchanged: their content is the owner's to write).

### What is good and stays

- The engineering under the page: one clock (Lenis from GSAP's ticker), the reveal failsafe, scroll
  restoration through layout rebuilds, focus handling, the menu's modal behaviour, the waitlist
  form's states and its API contract, safe areas, forced-colours and print styles, the 404 and error
  documents. All kept; where a piece is replaced it is by something at least as careful.
- Lighthouse on desktop (100 across the board) and accessibility everywhere (100). These are a
  constraint on the redesign, not something to trade away.
- The lime and vermilion signals, Mona Sans with JetBrains Mono, the mark.
- The lime finale and the full-width wordmark footer, as ideas.
- The findings console's structure and its keyboard model.

## The plan

Concept: **hard product, liquid glass** (the "Viewfinder" direction; `concept.md` has the three
directions and why this one). Decisions and the reference each learns from:

| # | Decision | Fixes | Learns from |
| --- | --- | --- | --- |
| 1 | The hero is a sample app under a draggable glass lens that shows it as an attacker sees it; findings lock into a tray; a keyboard twin for every hotspot | P0-3, P1-11 | Lando Norris (one hero interaction, content-specific hover with a keyboard twin); Raycast, Pangram (touch the real artifact) |
| 2 | Real refraction: an SVG displacement map computed from the glass's shape, applied to a registered copy of what is behind it (every engine), and as a backdrop filter on the nav (Chromium) | P0-4 | kube.io's liquid-glass write-up (map from Snell's law, three-pass colour split is ours); Apple Liquid Glass |
| 3 | Glass only for the nav, the lens, the slab and selection pills; all content on solid, square product surfaces | P0-4, P2-16 | Apple HIG Materials; Linear (the product UI is the protagonist) |
| 4 | Replace the corridor with one quiet wall of fluted glass and a light that moves and changes colour per chapter; copy never sits on the light | P0-1, P0-2, P1-8 | Igloo (one world, rooms differ by light and fog; palette discipline; aberration only while moving); Lusion (quiet frame around the loud thing) |
| 5 | The first screen is server-rendered and enters with CSS at first paint; nothing waits for script, font or canvas | P1-6, P1-7 | web.dev CLS guidance; Emil Kowalski (CSS beats JS while the page is busy) |
| 6 | Numbers are static or rise into place already correct | P1-5 | — |
| 7 | The pipeline is one large stage with the same sample app: sealed in a glass chamber, attacked, proven; scrubbed by scroll or by dragging its timeline with momentum | P0-3, P1-9 | Igloo (the subject assembles itself; data pinned to the object); Apple fluid-interface rules (1:1 drag, velocity handoff, projection) |
| 8 | The console replays its HTTP proof; selection is a spring pill; the hero hands a found finding to it | P0-3 | Raycast (a miniature of the product you can use); Rauno Freiberg (interruptible, spatially consistent) |
| 9 | "Every layer, covered" lists the real things behind each number, including all 26 scanners by name from the docs | P0-3, P2-14 | Vercel and Linear (specifics over adjectives) |
| 10 | The bento goes; what was unique in it becomes a four-line ledger | P2-13, P2-14 | Lando (dense and quiet beats alternate) |
| 11 | A different choreography per chapter (`motion-system.md`), springs for everything touched, no tilt, no magnets | P1-11, P1-12 | Emil Kowalski, Rauno Freiberg, Apple |
| 12 | Ground and product surfaces match `/preview` | P2-16 | — |

### Order of work

1. Design system and tokens (`site.css`), motion tokens and the spring solver.
2. The wall shader; the glass maths; the lens prototype in three engines.
3. Hero, then threat band, statement, pipeline, console, coverage, ledger, FAQ, finale, footer.
4. Pricing, 404, error.
5. Tests in three engines and four sizes, Lighthouse, CLS, axe; four review rounds; an independent
   critic; README, social cards.

### Product claims: what the audit of the docs repo found

Checked against `/Users/aravhawk/Code/infiniview-docs` (last commit 2026-11-04). Nothing on the site
is changed silently; these are for Arav to decide and are repeated in the final report.

- **Scanners: 26 stays.** The docs' prose says 25 twice (`app/(docs)/page.tsx:103`,
  `scanners/page.tsx:169`), but the docs' own list (`scanners/page.tsx:15-100`) has 26: ten static
  analysis, eight dependency audit, three secrets, five configuration and IaC. Six are opt-in. The
  site now shows all 26 by name with the opt-in ones marked.
- **Access model: waitlist stays.** The docs say "currently in public beta" and describe a
  self-serve sign-in at app.infiniview.dev with working checkout; the site says waitlist, invites
  and "finalized before launch". Not changed.
- **Other differences found** (site copy kept as is): "10-minute timeout per phase" (docs: timeouts
  are per run and per agent); "any language or framework … any web application" (docs:
  browser-based web apps; API-only repos skip runtime testing); "4 parallel code review agents",
  "12 runtime attack agents", "7 interaction test types", SOC 2 / ISO 27001 reports, "self-learning"
  and "we never store your source code" are not stated in the docs either way; the docs' three
  plan keys are free / team / enterprise where the site says Starter / Pro / Enterprise.
