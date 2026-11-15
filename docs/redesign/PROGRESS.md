# Redesign progress log (branch `redesign/fable-20261115`)

Started 2026-11-15 from `origin/main` @ `066a7005b041e07a9e45b16d7b2f8ec610378ec1` (confirmed, tree clean,
SSH signing on, `user.email` aravhawk@gmail.com).

Captures, videos and tooling live outside git in `~/.t3/infiniview-redesign/`
(`audit/`, `references/`, `rounds/<n>/`, `final/`, `tools/`, `baseline-src/`).

## Checklist

- [x] 0. Git state verified, dependencies installed, baseline `lint` / `tsc` / `build` green
- [x] 2a. Audit of the current site (all routes, 4 widths, load-in, Lighthouse, CLS, frame rate on a real GPU)
- [x] 2a. `plan.md`
- [x] 2b. First-hand reference study, `reference-study.md`
- [x] 2c. Design skills loaded, `skills-evidence.md`
- [x] 2d. `concept.md`, `motion-system.md`
- [x] 2d. Implementation
- [x] 2e. Tests (3 browsers × 4 sizes + iPhone WebKit, reduced motion, Lighthouse, CLS, axe, keyboard)
- [x] 2f. Four self-review rounds, independent critic (5.5 old; 7.0, 7.4, 7.7 new), `design-review.md`, README rewrite
- [x] Add-on: WebHaptics integrated, tested in emulation, documented
- [x] 3. Signed commits verified and pushed
- [x] 4. Final captures, production server on 3130, report

## Log

### 2026-11-15

- Baseline: `pnpm install --frozen-lockfile` exits non-zero on pnpm 12 only because the optional
  `unrs-resolver` postinstall is not on the allow-list; everything it guards works
  (`pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` all pass, `sharp` loads). Left as is.
- An untouched export of `origin/main` is built at `~/.t3/infiniview-redesign/baseline-src` and served
  on port 3140, so every before/after number is measured on the same machine in the same session.
- Audit done. Baseline Lighthouse: home 100 desktop / 87 mobile, pricing 100 / 90; accessibility,
  best practices and SEO 100 everywhere. CLS 0.05 on home desktop (the headline animates the font's
  width axis). Firefox scrolls home at 36 fps. Findings and evidence paths are in `plan.md`.
- Docs repo checked for claims: its own scanner list has 26 entries (its prose says 25), so the
  site's 26 stays; access model (waitlist) left alone. Details in `plan.md`.
- Reference captures: 24 sites in Chromium and WebKit under `~/.t3/infiniview-redesign/references/`.
- Prototype: a lens that refracts live DOM (a registered copy bent by an SVG displacement map, with
  a three-pass colour split) renders the same and holds 60 fps in Chromium, WebKit and Firefox. That
  decided the concept: "hard product, liquid glass" (`concept.md`).
- Built: design system, motion tokens and spring solver, the wall shader, glass maths and filters,
  hero with the lens and tray, threat band with the slab, statement, pinned pipeline with a
  draggable timeline, findings console with replay, coverage, ledger, FAQ, finale, footer, pricing,
  404 and error. `lint`, `tsc`, `build` pass.
- Found and fixed along the way: an animated ancestor was silently emptying the nav's backdrop
  filter; WebKit draws nothing when a filtered element holds very wide content (the slab gets a
  designed fallback there); variable-font contour overlaps show through text-stroke (outlines are
  now silhouette shadows); the waitlist form overflowed its column at 1024 (now a container query).
- Headless WebKit and Firefox in Playwright do not render `backdrop-filter: blur()` at all, so the
  nav's fallback blur cannot be captured there. The fallback tint was made dense enough to pass AA
  with no blur.
- The wall's light became a backlight anchored behind each chapter's product surface. A pixel
  contrast audit (text and background both read from frame differences) measures 1,408 text boxes
  at 1440 and 390 on both routes: none below AA.
- axe-core: clean on `/`, `/pricing`, the 404 and every designed state (menu open, form error, all
  findings found). `/preview` has violations that are on `main` too (not touched).
- Review rounds 1 to 3 (`design-review.md`): 25 problems found and fixed, among them an unreachable
  third weak point in the lens game (found by the interaction script, not by eye), a nav whose real
  refraction was silently not rendering, and layout shift inside the pinned pipeline.
- Independent critic, first pass: old site 5.5, new build 7.0, seventeen findings. Fifteen fixed;
  two left by instruction (`/preview`'s look; the waitlist API, which has no database here).
  What changed: the lens stays in the stage, parks clear of the tray and no longer plays the game by
  itself; the tray is one size; the statement is not pinned; the pipeline pin is about three
  screens with a stage composed for phones; coverage has a stack picker; the ledger became a sample
  run log; routes change out-then-in; the home page went from 16,183 px to 12,127 px.
- Round 4 on the fixed build: 76 browser and size combinations with no problems, 18 interaction
  checks passing in three engines, axe clean on the marketing pages and their states, CLS 0 on every
  route and size, Lighthouse 100 / 95 (home) and 100 / 100 (pricing). Numbers are in `README.md`.
- The twelve README screenshots were replaced one for one (47 to 130 KB each). Social cards did not
  need another pass: they show the wall, the mark and the headline, none of which changed after
  they were regenerated.
- Add-on brief (Arav, same day): WebHaptics integrated natively. `web-haptics` 0.0.6 through its
  official hook in one client component; one typed door (`lib/site/haptics.ts`) that fails closed
  (reduced motion, the visitor's footer switch, no touch screen, page not yet touched); mapped to
  moments rather than taps; the iOS fallback switch kept out of the accessibility tree and tab
  order. 53 emulation checks pass. Not felt on a real device: Android Chrome is the expected working
  path, iOS is best effort and may be a no-op on 26.5 and later. Details in `README.md`.
- Critic, second pass on the fixed build: 7.4. It found a real navigation bug (a link pressed within
  a second of scrolling opened the next page part-way down) and a double-exposed frame in the
  pipeline's teardown. Both fixed, with the WebKit lens softness, the phone pipeline's chips, the
  floating hint and the count labels. Third, narrow check: 7.7. Its remaining residues were fixed
  after that check (see `design-review.md`).
- Final build: lint, typecheck and build pass; 76 browser and size combinations clean; interactions
  18/18 in three engines; haptics 53/53; navigation 21/21; axe clean; CLS 0 everywhere; Lighthouse
  home 100 / 98, pricing 100 / 100. README screenshots regenerated from this build.

