# Motion system

One language, written once, used everywhere. The tokens live in two places that mirror each other:
CSS custom properties in `src/app/(site)/site.css` (`:root .site-root`) and constants in
`src/lib/site/motion.ts`. If a value is needed that is not here, it is added here first.

## One clock

GSAP's ticker is the only frame loop. It drives Lenis (smooth scroll), every spring
(`lib/site/spring.ts`), the wall shader and ScrollTrigger. Nothing else calls
`requestAnimationFrame` for animation. The loop's work pauses with the tab and when the canvas is
covered.

## Three kinds of motion

| Role | Used for | Curve |
| --- | --- | --- |
| **Arriving** | content entering, panels opening | ease-out: `--ease-out` `cubic-bezier(0.23, 1, 0.32, 1)` (GSAP `expo.out` for long moves) |
| **Moving on screen** | something already visible changing place or size on its own | ease-in-out: `--ease-in-out` `cubic-bezier(0.77, 0, 0.175, 1)` |
| **Leaving** | menus closing, panels collapsing, the old page on a route change | ease-in: `--ease-in` `cubic-bezier(0.55, 0, 0.9, 0.3)`, and always shorter than the arrival |
| **Touched** | anything the visitor drags, flicks or selects | a spring (below). Never a duration |

Nothing in the interface uses `linear` or a browser default curve, except constant motion: the
threat band's drift, the console's autoplay bar, and typed lines (a request in the proof replay, the
command in the terminal), which appear at the constant rate of a hand on a keyboard.

## Springs

All springs are solved by `lib/site/spring.ts` (semi-implicit Euler in fixed 4 ms sub-steps, so the
result does not depend on frame rate). A spring keeps its velocity when it is given a new target, so
every one of these can be interrupted and reversed in flight.

| Token | Stiffness | Damping | Damping ratio | Feel | Used by |
| --- | --- | --- | --- | --- | --- |
| `SPRING.follow` | 260 | 28 | 0.87 | follows a hand closely, settles without wobble | the lens tracking the pointer |
| `SPRING.release` | 170 | 20 | 0.77 | a flick lands with a small overshoot | the lens after a drag ends |
| `SPRING.ui` | 420 | 41 | 1.0 | placed, no overshoot | selection pills (nav, findings, evidence tabs), the lens sent to a weak point from the tray, the lens's focus brackets |
| `SPRING.soft` | 90 | 19 | 1.0 | slow and heavy | the lens drifting by itself |

Rules:

- **1:1 while the pointer is down.** A drag writes the position directly. The spring only takes over
  on release, seeded with the release velocity.
- **Bounce only after a throw.** `SPRING.release` is the only under-damped spring, and it is used
  only when a gesture supplied momentum.
- **Momentum projection.** A flick's resting point is projected with Apple's exponential decay
  (`v / 1000 * d / (1 - d)`, `d = 0.994`) and clamped to the stage before the spring is aimed at it.
  The pipeline's timeline handle uses the same projection to choose which beat a throw lands on; the
  page then scrolls there (the handle is the scroll position, so it has one source of truth).
- **Pills stretch.** A selection pill's leading edge is stiffer than its trailing edge, so it
  reaches toward where it is going and gathers itself on arrival.
- **Damped followers.** The wall's light and the scroll-driven values are frame-rate independent
  exponential followers (`x += (target - x) * (1 - exp(-k * dt))`), not springs: they never overshoot.
- **Velocity shows.** The lens stretches along its direction of travel in proportion to speed
  (at most 6 %) and relaxes as it stops; its highlight slides against the direction of travel.
- The CSS twin of `SPRING.ui` is `--spring` (a `linear()` curve with an `--ease-out` fallback) for
  state changes that CSS alone handles, such as a button returning from a press.

## Durations

| Token | Value | Used for |
| --- | --- | --- |
| `--d-press` | 120 ms | press down (`scale(0.97)`) |
| `--d-hover` | 180 ms | hover colour and small moves (fine pointers only) |
| `--d-ui` | 240 ms | tabs, accordions closing, tooltips |
| `--d-open` | 420 ms | accordions and the menu opening |
| `--d-enter` | 700 ms | content arriving |
| `--d-hero` | 900 ms | the first screen's entrance |
| stagger | 60 ms | between siblings arriving together (capped at 5 steps) |

## Distances

| Token | Value | Used for |
| --- | --- | --- |
| `--rise` | 24 px | content arriving from below |
| mask rise | 110 % of the line, plus descender padding | headline lines |
| press | `scale(0.97)` | every button |

Nothing starts from `scale(0)`; the smallest start is `scale(0.94)` with opacity.

## Loading and entrances

- The first screen is server-rendered and visible in the first paint. Its entrance is a CSS
  animation that starts with that paint; it does not wait for JavaScript, the font or the canvas.
  The canvas fades in over a CSS ground when its first frame is ready.
- Content is never shown and then hidden again. Below-the-fold content is hidden only while script
  is present to reveal it, is revealed once, and never replays. A failsafe shows everything if the
  motion layer never boots.
- Numbers are never counted up from a wrong value. A numeral either stands still or rises into place
  already correct.

## Choreography by chapter

No two chapters share a transition.

| Chapter | Lead | How it moves |
| --- | --- | --- |
| Hero | headline, then the lens | words rise from masks (CSS, from the first paint); the stage arrives as one piece; the lens materialises (blur and scale together) and starts to drift |
| Threat band | the slab | rows drift, scroll velocity pushes them; what passes through the slab is lit |
| Statement | the sentence | each word lights as the scroll passes it |
| Pipeline | the chamber | pinned; five beats scrubbed both ways with exact rest poses; the timeline handle can be dragged |
| Findings | the console | the window arrives once; the pills slide on springs; the proof is replayed (typed requests, arriving responses) |
| Coverage | the numerals | numerals rise from masks, lane lines draw across |
| Finale | the aperture | a frame opens to full bleed, scrubbed |
| Route change | the page | the old page leaves with ease-in, the new arrives with ease-out; the nav and the wall persist |

## Reduced motion

A designed still version, not a broken one. Smooth scroll is off; the wall is one still frame; the
pinned pipeline becomes a static, fully readable layout; entrances are replaced by nothing (content
is simply there); the lens stays draggable (direct manipulation is the visitor's own motion) but does
not drift, stretch or bounce. Changes to the preference while the page is open are honoured.

## Performance rules

- Animate `transform`, `opacity` and (sparingly) `clip-path`. Never layout properties.
- No React state on the frame path: springs write to refs and styles.
- No inherited custom properties on the frame path.
- Hover effects only under `(hover: hover) and (pointer: fine)`.
- The canvas renders below device resolution with a frame-time governor; `html[data-perf="low"]`
  drops the refraction filters and blur.
