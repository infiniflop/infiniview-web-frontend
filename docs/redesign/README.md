# Infiniview marketing site — redesign notes

This branch replaces the marketing site's whole presentation layer (`/` and `/pricing`).
The product demo at `/preview` is untouched. Content, product claims, the waitlist API
contract and external links are preserved; nothing new is claimed.

## The idea

Infiniview's mark is a frame inside a frame. Its name is an *infinite view*. So the site is
that mark extruded forever: **a corridor of glass frames receding to a vanishing point, and
you travel down it by scrolling.** Every section is a chamber you cross into.

Glass is not decoration here, it is the product's vocabulary:

- a **sandbox** is a sealed, transparent chamber;
- **forensic proof** is evidence you can see through;
- a **view** is a lens.

Colour carries meaning, nothing else does:

| Colour | Means |
| --- | --- |
| cool white light | the world around the work |
| lime `#d2fb5a` (the existing brand + product colour) | verified, proof, defence |
| vermilion `#ff5a47` | exploit, breach |

Type is **Mona Sans** (variable, width + weight axes) for everything, with **JetBrains Mono**
reserved for real traces and code. Headlines are set tight and large; the width axis is used
on the threat marquee and the footer wordmark, and animates open on the hero headline.

### Sections as an argument

1. **Hero** — "Attack your code before anyone else does." A live sample scan streams in a glass card.
2. **Threat marquee** — the attack classes, pulled through the glass by scroll velocity.
3. **Statement** — "The only security review you need before production," read out word by word by the scroll, then four proof plates.
4. **From pull request to proof** — a pinned, scroll-scrubbed 3D exploded view of the real pipeline: PR → isolated sandbox → parallel agents firing probes into the app → deduplicated, correlated findings → proof bundle posted back to the PR, with the sandbox torn down.
5. **Forensic findings** — an interactive proof console (three sample findings × HTTP proof / attack path / code / fix). Auto-plays until you touch it.
6. **Every layer, covered** — an exploded stack of four glass layers; each layer's pattern literally contains its count (4 · 26 · 12 · 7). Selecting a layer lifts the ones above it away.
7. **Built around proof** — a bento where each tile has its own illustration (evidence cards, a receding-then-deleted sandbox, an attack chain, noise resolving into the mark, a compliance report, a zero-config terminal).
8. **FAQ** — sticky title, glass accordion.
9. **Finale** — the vanishing point opens like an aperture and floods the page with lime.
10. **Footer** — the wordmark at full width, in glass.

`/pricing` uses the same system with the same plans, notes and FAQ, and an in-page waitlist.

## Motion system

One clock, one scroll engine, no competing animators.

- **GSAP 3.15** (ScrollTrigger, SplitText) owns all choreography. **Lenis** owns smooth scroll and is driven *from GSAP's ticker*, so scroll, the WebGL scene and every tween share a frame.
- `components/site/shell.tsx` is the single owner of time: Lenis, damping of scroll → corridor depth, pointer → light, the pointer-lit glass rims, and the global scroll-reveal / split-heading system.
- **The corridor** (`corridor-shader.ts`) is a from-scratch fragment shader, not a library: a rounded-square tube solved analytically (superellipse radius → depth, no ray-marching), glass frames with constant z-thickness so perspective is exact, prismatic dispersion in *pixel* terms, ribbed secondary frames, agent "probes" running down the walls, and a portal at the vanishing point. Scroll sets camera depth; velocity adds roll and dispersion; each chapter nudges a shared `mood` (alert, energy, portal, width).
- Easing is `expo.out` / `power4.out` for arrivals and `power3.inOut` for transitions; feedback on controls is ≤ 0.3 s.
- **Performance**: the canvas renders at a fraction of device resolution with a frame-time governor that sheds pixels first and, only if that is not enough, sets `html[data-perf="low"]` which removes backdrop blur. Large, mostly-opaque panes do not blur at all. The loop pauses with the tab.
- **Progressive enhancement**: collapsing (pipeline steps, FAQ, arsenal layers) only happens when script is running, so with no script everything stays readable; collapsed copy is also removed from the accessibility tree rather than just clipped. A failsafe in the root layout reveals all marketing content if the app bundle never boots.
- **Reduced motion**: Lenis is off, the corridor renders one still frame, pinned scrub sequences become static layouts, everything is visible. Content is only hidden when script is present *and* will reveal it; a failsafe un-hides after 5 s.
- **Touch**: pointer effects (tilt, magnetic buttons, rim light) are disabled on coarse pointers; the pinned pipeline restages for phones.

## Engineering notes

- Next 16 App Router + Tailwind 4 retained. Route groups: `(site)` for the marketing pages (own fonts, shell, nav, footer); `/preview` keeps its original fonts, tokens and theme toggle.
- Design tokens and the glass material live in `src/app/(site)/site.css` inside `@layer components`, so Tailwind utilities can still override.
- The page is server-rendered; only the interactive pieces are client components. Everything is real HTML (nav, headings, FAQ buttons with `aria-expanded`, tablists with arrow-key support, a skip link, visible focus). Decorative 3D stages are `aria-hidden` and the copy beside them carries the content.
- Two hydration traps found and fixed: trig-derived SVG coordinates differ between Node and browsers in the last float digits (rounded), and ScrollTriggers created *before* pinned sections measure wrong unless the pins refresh first (`refreshPriority`).
- Illustrative content is labelled ("Sample run", "Sample data", "Illustration with sample data") and derived from the existing `/preview` fixtures. No customers, quotes, logos or new metrics.
- Social images and favicon were regenerated from the new hero.
- `package.json` gains three dependencies (`gsap`, `@gsap/react`, `lenis`), and every dependency is at its latest release (Next 16.4.3, React 19.3.1, ESLint 10.13, lucide-react 1.61, `@neondatabase/serverless` 1.2, `tailwind-merge` 3.7, `@types/*`). The lockfile is regenerated with pnpm 10. ESLint 10 prints unmet-peer warnings from `eslint-config-next`'s bundled `jsx-a11y` and `react` plugins (they have not declared ESLint 10 yet); all rule families still run (verified against a deliberately broken file).

### Weight (production build, gzip)

JS ≈ 263 KB · CSS ≈ 22 KB · fonts ≈ 126 KB (Mona Sans 96 KB, JetBrains Mono 31 KB) · HTML ≈ 18 KB.

## Source register

| Item | Use | License | Notes |
| --- | --- | --- | --- |
| [GSAP](https://gsap.com) 3.15 + ScrollTrigger, SplitText | choreography, scroll, text reveals | GreenSock Standard "no charge" license (free incl. commercial, all plugins) | installed from npm; not vendored |
| [`@gsap/react`](https://www.npmjs.com/package/@gsap/react) 2.1 | `useGSAP` | same GreenSock license | |
| [Lenis](https://github.com/darkroomengineering/lenis) 1.3 | smooth scroll | MIT | recommended CSS rules inlined; GSAP integration per its README |
| [Mona Sans](https://fonts.google.com/specimen/Mona+Sans) | typeface | SIL OFL 1.1 | self-hosted by `next/font` |
| [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | code/trace face | SIL OFL 1.1 | existing dependency |
| [lucide-react](https://lucide.dev) | a few UI glyphs | ISC | existing dependency |
| Corridor shader, glass material, 3D stages, console, all patterns | — | original to this repo | |

**Evaluated and not used** (or used as reference only — no third-party source is copied):

- [Magic UI](https://magicui.design) (MIT) — Border Beam's masked-border technique informed the glass rim; re-implemented in plain CSS. Animated Beam / Number Ticker inspected; not needed.
- [React Bits](https://reactbits.dev) (MIT + Commons Clause) — `GlassSurface`'s SVG-displacement refraction inspected. Not shipped: it only works for `backdrop-filter` in Chromium, and the corridor already supplies the refraction cue everywhere.
- [Paper Shaders](https://github.com/paper-design/shaders) (Apache-2.0) and [OGL](https://github.com/oframe/ogl) (Unlicense) — evaluated for the background; a bespoke shader fit the "frame inside a frame" idea better and avoids a dependency.
- [Aceternity UI](https://ui.aceternity.com), [21st.dev](https://21st.dev), [Osmo Supply](https://osmo.supply) — benchmarks and inspiration only. Their licence terms for free components were not stated where we could read them, so nothing was copied.
- Codrops (3D scroll tutorials) and the kube.io liquid-glass write-up — technique references.
- Official GSAP agent skills — read for correct `useGSAP` / ScrollTrigger / SplitText usage; not installed into the repo.

## Honest status

Finished: both marketing routes, mobile / tablet / laptop / large-desktop layouts, reduced-motion path, keyboard-operable controls, working waitlist form (client side), regenerated social images.

Not done / worth knowing:

- **Dark only.** The old light theme is dropped on the marketing pages (the glass-over-light-field look needs its own design pass). `/preview` keeps its theme toggle.
- **Frame rate was not measured on real GPUs.** Visual QA ran in headless Chromium (software GL). The adaptive governor and the `data-perf="low"` fallback exist for that reason; they should be checked on a mid-range laptop and a phone.
- **Chromium only.** Safari and Firefox were not tested. `backdrop-filter`, `mask-composite` and `text-wrap` all have fallbacks, but they are unverified.
- The waitlist API was not exercised end to end (no `DATABASE_URL` locally); the client states (invalid, optimistic success, rollback on error) were.
- `/privacy` and `/terms` are linked as before but do not exist in this repo.
- Pricing figures remain "Free / TBD / Custom", as before.

## Screenshots

| | |
| --- | --- |
| ![hero](screenshots/01-hero.jpg) | ![statement](screenshots/02-statement.jpg) |
| ![pipeline](screenshots/03-pipeline-agents.jpg) | ![proof](screenshots/04-pipeline-proof.jpg) |
| ![findings](screenshots/05-findings.jpg) | ![arsenal](screenshots/06-arsenal.jpg) |
| ![bento](screenshots/07-bento.jpg) | ![faq](screenshots/08-faq.jpg) |
| ![finale](screenshots/09-finale.jpg) | ![pricing](screenshots/10-pricing.jpg) |
| ![mobile hero](screenshots/11-mobile-hero.jpg) | ![mobile pipeline](screenshots/12-mobile-pipeline.jpg) |
