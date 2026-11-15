# Design skills: what was loaded and what each one shaped

Skill directories found on this machine: `~/.agents/skills` and `~/.claude/skills` (the same set,
24 and 25 entries); `~/.codex/skills` is empty; the repo has no `.claude/skills`. Nothing was
installed or modified. Impeccable was not used (it is not installed). Vercel's UI SDK was not adopted.

All four required skills loaded. Where a skill's rule conflicts with the brief or with the product's
own identity, the brief wins and the deviation is listed, not hidden.

## Required

### `design-taste-frontend` (tasteskill 2.5.1): `~/.claude/skills/design-taste-frontend`

Shaped:

- **Kind: software.** "The client's own subject leads at true size. Software: its own UI as live
  HTML showing what it works on." The hero, pipeline and console are live HTML of the product and of
  the app it attacks; nothing is an image of a UI.
- **House rule 1, no caption under a visual.** The old "Illustration with sample data" captions are
  gone. "Sample" is a tag inside the window chrome, where a product would put an environment label.
- **Nothing tilts; no carousels or timed tabs.** The hero card tilt, the pipeline tilt and the
  magnetic buttons were removed.
- **Hover micro-animations** on every control (buttons step on hover and press on click, the arrow
  nudges, underlines draw, the mark tightens), gated to fine pointers.
- **Every hero enters once on load.**
- **Never:** "a card, row or tile that fades in on scroll; a fade-in on every section". Reveals are
  now specific to each chapter (`motion-system.md`), and most blocks of the first screen and the
  pricing page do not reveal on scroll at all.
- **Never violet; no invented reviews, quotes, customers or figures; no copied signature effect.**
- **One system:** one button family, one surface (`.pane`), one chip, one radius rule.
- **Copy:** headings name things, buttons are a verb and an object ("Get early access", "Read the
  docs", "Replay the proof").

Deviations, and why:

- The skill's dealers, starter kit and gate scripts (`gate.mjs`, `consistency.mjs`, `deal.mjs`) were
  not run: they build and check a static page from the skill's own kit. This is an existing Next.js
  product site with its own brand, palette and typeface, and the brief asks for an audit-led redesign
  with its own test matrix. The rules were applied by hand and checked with Playwright instead.
- "One section per screen, each one or two screens tall" is followed loosely: the pinned pipeline
  runs for about five screens of scroll because it is the page's one long moment.
- "Nothing moves because the page scrolled except a dealt moment": the statement, the pipeline and
  the finale are scroll-linked (three moments, not two), and scroll is smoothed with Lenis. The brief
  asks for extreme fluidity; the count is kept low and each is a different kind of motion.
- A dark page with a shader ground is allowed by the skill for software ("tech only").

### `emil-design-eng`: `~/.claude/skills/emil-design-eng`

Shaped:

- Custom curves only: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` and
  `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` are his values.
- `:active` at `scale(0.97)` on every button, press at 120 ms; nothing enters from `scale(0)`.
- Springs for anything dragged or decorative mouse-tracking (the lens), and "springs maintain
  velocity when interrupted" is the reason the lens, pills and timeline use a solver instead of
  tweens.
- "Use blur to mask imperfect transitions": the lens arrives with blur and scale together; the route
  change blurs the leaving page slightly.
- Stagger 30 to 80 ms: 60 ms, capped.
- Asymmetric timing: opening 420 ms, closing 240 ms; press slow-to-deliberate does not apply (no
  hold gestures).
- "CSS animations beat JS under load": the first screen's entrance is CSS, because it plays while
  the page is still hydrating.
- No inherited custom property on the frame path (the nav's `--glint` is set on the bar itself).
- Hover gated behind `(hover: hover) and (pointer: fine)`.

Deviation: he says never use ease-in for UI. The brief's motion rules say leaving eases in and is
faster than the entrance, so exits here use a short ease-in (200 to 260 ms). Nothing the visitor is
waiting on eases in.

### `landing-page-design`: `~/.claude/skills/landing-page-design`

Shaped:

- **One offer, one audience, one primary action.** The waitlist is the only primary action; docs and
  the live demo are secondary and styled as such. No competing lime buttons above the fold except
  the nav's "Early access", which goes to the same form.
- **A2 structure:** headline, one-sentence subhead, CTA and the hero visual above the fold; argument
  in the middle (how it works, proof, coverage); FAQ and a final CTA identical to the top.
- **B11, the mandatory tagline reveal:** "The only security review you need before production.",
  each word lit by the scroll, with a reduced-motion version that is simply the sentence.
- **B8, never invent facts:** every number is from the existing copy or the docs; samples are
  labelled.
- **B9, every state:** hover, active, focus, loading ("Joining…"), error, success for the form.
- **B10:** custom 404, legal links kept, validation, skip link, favicon, meta and social tags.
- **B7 navigation:** a compact floating bar with a translucent surface; a menu button whose icon
  transforms; a full-height menu; links arriving in reading order (45 ms steps, under 400 ms).
- No hyphens were added inside sentences in new copy; headings use `text-wrap: balance`, body
  `pretty`.

Deviations, and why:

- **B1 fonts (Geist, Manrope, Poppins) and the 60 px Heading 1.** Mona Sans is the product's brand
  face and the brief asks for scale contrast; display type goes to 124 px.
- **B1 Tailwind type scale and B2 spacing table.** Sizes are fluid `clamp()` values in one token
  file; spacing follows a 4 px grid but is not limited to the table.
- **B4 flat backgrounds only, B5 gradient on the hero heading.** The page has one shader wall (the
  brief asks for something worth refracting); the heading is solid ink.
- **B6 icon sets:** `lucide-react` was already the dependency; a handful of glyphs.
- **B7 "reveal each section with rise and fade":** replaced by per-chapter choreography.

### `ui-ux-pro-max`: `~/.claude/skills/ui-ux-pro-max`

- The `--design-system` query ("developer tool security SaaS dark glass immersive", variance 8,
  motion 9, density 3) returned "FAQ/Documentation Landing" with a Brutalism style and IBM Plex
  Sans. That is not a fit for this product and was not used; saying so is the skill's own rule
  ("verify the returned … fit … do not persist unverified output"). Nothing was persisted.
- Used as a checklist instead (its priority table): contrast 4.5:1 measured from pixels; 44 px touch
  targets (the timeline handle, pause, replay and menu buttons carry enlarged hit areas); reserved
  space so CLS stays near zero; no hover-only paths (the tray is the keyboard and touch path for the
  lens); visible labels and errors next to the field; `prefers-reduced-motion`.

## Emil Kowalski's animation set, and Apple

| Skill | Path | What it shaped |
| --- | --- | --- |
| `animate` | `~/.claude/skills/animate` | The build sequence (should it animate, purpose, cheapest tool, properties, curve, exit). The cheapest-tool rule is why the hero entrance, FAQ, buttons and the menu button are CSS, and only gestures and scroll scenes use script. The "never ship" table was used as the self-check |
| `choreograph` | `~/.claude/skills/choreograph` | Cast and relationships: one entrance per container (the stage arrives as one piece; its rows do not stagger), no stagger on high-frequency UI (tabs and findings switch at once, only the evidence lines arrive), exits simultaneous and shorter, non-uniform timing (leading edge of a pill stiffer than its trailing edge), sync to the cause (the tray slot pops when the lens locks, not on hover) |
| `gestures` | `~/.claude/skills/gestures` | The two phases: 1:1 while the pointer is down (`set`, no spring), a spring seeded with the release velocity after; grab offset respected; pointer capture; second finger ignored; rubber-band past the stage edge; dismiss/commit on distance or velocity (the timeline snaps to the beat a throw would reach); `touch-action` per axis |
| `animation-performance` | `~/.claude/skills/animation-performance` | `transform` and `opacity` (and `clip-path` for the aperture and typed lines); no `transition: all`; no React state per frame; no inherited CSS variable per frame; animated blur under 20 px (the lens entrance is 14 px, once); the nav entrance moved off an ancestor after it was found to empty the backdrop |
| `apple-design` | `~/.claude/skills/apple-design` | Damping-ratio thinking for the spring tokens (1.0 by default, about 0.8 only after a throw), velocity handoff, the momentum projection formula, rubber-banding, "materialize, don't just fade", translucent chrome with a bright upper edge, reduced-transparency and contrast variants |
| `mobile-native` | `~/.claude/skills/mobile-native` | `svh` for heroes, 16 px inputs, tap highlight off with real `:active` states, `touch-action: manipulation` on controls and `pan-y` on the stage and timeline, `user-select: none` on controls only, `viewport-fit=cover` with safe-area padding, `interactive-widget=resizes-content`. Its "never sniff the user agent" rule is broken twice, on purpose: Chromium's SVG backdrop filter and WebKit's refusal to filter very wide content have no feature query |

Read but not needed as loaded skills: `review-animations` and `improve-animations` (their checklists
overlap `animate`'s "never ship" table, which was used in the review rounds), `remove-animations`
(the removals it would ask for, tilt and magnets and count-ups, were already in the plan),
`find-animation-opportunities`, `animation-vocabulary`, `break-ui`.

Not relevant: `animate-expo`, `write-swift`, `cinetic`, `ask-sonner`, `security-audit`,
`find-skills`, `pick-ui-library`, `prototype`.
