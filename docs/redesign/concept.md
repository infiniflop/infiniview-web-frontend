# Concept

The audit (see `plan.md`) found that the old site's idea, a corridor of glass frames, was sound as a
brand thought and weak as a page: one tunnel sat behind every section, its bright rings and colour
fringes ran through the copy, the "glass" was frosted cards in the content layer, and the product
itself appeared only as small illustrations. That justified a new concept, not a polish pass. Three
directions were written up and judged against the references before one was built.

## The three directions

### A. Corridor 2.0: the same tunnel, a different chamber per chapter

Keep the frame corridor as the world and give each section its own chamber (material, light, camera).

- For: continuity with the current build; "one world, many rooms" (Igloo).
- Against: the tunnel is abstract. It says "science fiction", not "we attack your app and prove it".
  It occupies the whole viewport, so type and scene collide by construction (what both v2 critics
  marked down). Linear, Raycast and Stripe all make the product the protagonist; this direction keeps
  it a guest. Igloo gets away with a pure 3D world because it has zero DOM text; a product site cannot.
- Verdict: rejected. It fixes the sameness and leaves the bigger problem (nothing real on screen).

### B. Viewfinder: one piece of liquid glass you look through, over the real work

The mark is a viewfinder: a frame, a frame inside it, a point of focus. Make that literal. The page
is the product, drawn hard and square like the dashboard at `/preview`. The only soft thing on it is
glass, and the glass is an instrument: in the hero it is a lens you drag over a sample app to see it
the way an attacker does.

- For: one hero interaction that is understood in a second and is about the product (Lando's single
  hero interaction, without his mask or motifs). The visitor touches real findings before reading a
  feature list (Raycast, Pangram). Glass is used where Apple says it belongs (controls and
  navigation, floating above content), so it stays special. The refraction is real and cross-browser:
  the prototype bends live DOM text through an SVG displacement map in Chromium, WebKit and Firefox.
- Against: less of a "world" than Igloo; the immersion has to come from interaction, light and
  motion, not from a 3D scene. It leans on DOM and filter performance, which had to be measured
  first (it was: 60 fps in all three engines on the lens prototype).
- Verdict: chosen.

### C. The chamber: a single 3D glass sandbox that the whole page orbits

A three.js scene with one transmission-material glass box holding a miniature app. Scroll moves the
camera around it while probes hit it.

- For: the most literal "real glass" (physically based transmission, dispersion), and a strong
  Igloo/Lusion flavour.
- Against: the app inside the box becomes a texture, so it is no longer touchable, crisp product UI.
  A glass cube is already Resend's hero. It adds roughly 170 KB of library and a heavy first frame,
  which fights the Lighthouse targets on mobile. And it is one object carrying the whole page (the
  critique of "one look eight times").
- Verdict: rejected, but its best idea survives inside B: in the pipeline chapter the glass becomes
  a sealed chamber around the sample app.

## The chosen concept, in full

**Hard product, liquid glass.** Everything that is Infiniview's work (the sample app, the run, the
findings, the proof, the pull-request check) is drawn like the product: square corners, hairlines,
mono labels, lime for verified proof and vermilion for an exploit. Everything soft is glass, and
there are only a few pieces of it. Each chapter gives the glass one job, so no two chapters move the
same way.

| Chapter | What the glass does | Choreography |
| --- | --- | --- |
| Hero | A lens (the mark's outer frame) that shows the sample app as an attacker sees it | Spring-followed drag, velocity squash, findings lock into a tray |
| Threat band | A slab the attack classes are pulled through; inside it they are caught and lit | Scroll-velocity marquee, refraction in the slab |
| Statement | None. A quiet beat of type, with four numbers beside it | Words are read by the scroll (not pinned) |
| Pipeline | A sealed chamber around the app: the sandbox | Pinned, scrubbed by scroll or by dragging the timeline |
| Findings | The selection pill that slides between findings and evidence tabs | Liquid pill with spring, replayable HTTP exchange |
| Coverage | The selection pill on the stack picker | Numerals rise out of masks, lane lines draw; a picked stack lights its scanners |
| After | None. A terminal | A sample run is logged line by line |
| Finale | The mark opens like an aperture and floods the screen with lime | Scrubbed aperture |
| Navigation | A floating glass capsule over the page | Refracts what scrolls under it (Chromium), designed fallback elsewhere |

Behind all of it is one quiet world: a wall of fluted glass with a light far behind it. The wall is
structure (its flutes are the column rhythm of the page), the light is the mood. The light moves and
changes colour with the chapter (cool white, vermilion while the agents attack, lime for proof), so
the page has one world and several rooms without one loud object on every screen.

## What was kept

- The mark, the lime and vermilion signals, Mona Sans with JetBrains Mono for real code and traces.
- One clock (Lenis driven from GSAP's ticker), the reveal failsafe, scroll restoration, focus
  handling, the waitlist form's behaviour and API contract, the 404 and error documents, safe areas,
  forced-colours and print styles.
- The lime finale and the wordmark footer as ideas (rebuilt).

## What was replaced, and why

- The corridor shader as a full-page background: it collided with copy and was the same in every
  frame.
- Glass cards in the content layer: Apple's guidance is explicit that glass is for controls and
  navigation; content sits on standard, solid materials.
- The bento: every tile repeated something shown better elsewhere on the page.
- The CSS-3D pipeline diagram: small, muddy where panes overlapped, and explained by a caption.
- JavaScript-gated first paint: the hero now renders and animates from CSS at first paint.
- Count-up numerals: they showed wrong numbers (24, 25, 94%) for about a second.

## Type and palette decisions

- **Type.** Mona Sans stays (it is the brand face and has a width axis). Display type uses the
  narrower end of the axis at a heavier weight so headlines can be much larger in the same measure;
  labels are 11 to 12 px JetBrains Mono, uppercase, and only on real data. Nothing in between: scale
  contrast carries the hierarchy.
- **Palette.** The ground moves from blue-black `#03040a` to a neutral ink `#07080b`, the same ground
  as the product dashboard, so the marketing pages and `/preview` read as one company. Lime
  `#d2fb5a` still means verified proof and the primary action; vermilion `#ff5a47` still means an
  exploit. No other accent carries meaning.
