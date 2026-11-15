# Redesign progress log (branch `redesign/fable-20261115`)

Started 2026-11-15 from `origin/main` @ `066a7005b041e07a9e45b16d7b2f8ec610378ec1` (confirmed, tree clean,
SSH signing on, `user.email` aravhawk@gmail.com).

Captures, videos and tooling live outside git in `~/.t3/infiniview-redesign/`
(`audit/`, `references/`, `rounds/<n>/`, `final/`, `tools/`, `baseline-src/`).

## Checklist

- [x] 0. Git state verified, dependencies installed, baseline `lint` / `tsc` / `build` green
- [x] 2a. Audit of the current site (all routes, 4 widths, load-in, Lighthouse, CLS, frame rate on a real GPU)
- [x] 2a. `plan.md`
- [ ] 2b. First-hand reference study, `reference-study.md`
- [ ] 2c. Design skills loaded, `skills-evidence.md`
- [x] 2d. `concept.md`, `motion-system.md`
- [ ] 2d. Implementation
- [ ] 2e. Tests (3 browsers × 4 sizes + iPhone WebKit, reduced motion, Lighthouse, CLS, axe, keyboard)
- [ ] 2f. Four self-review rounds, independent critic, `design-review.md`, README rewrite
- [ ] 3. Signed commits verified and pushed
- [ ] 4. Final captures, production server on 3130, report

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
