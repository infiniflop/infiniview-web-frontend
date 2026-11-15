# Design review

Four self-review rounds and one independent critique, scored three times: 7.0 on the first complete
build, 7.4 after its findings were fixed, 7.7 after the defects it found in those fixes were fixed
(the old site: 5.5). Every round's captures are outside git in
`~/.t3/infiniview-redesign/rounds/<n>/`: `chromium/`, `webkit/`, `firefox/` and `iphone/` hold a
scroll contact sheet for every page (`home`, `pricing`, `preview`, `404`) at 390, 768, 1024 and 1440
(`*-rm.jpg` are the reduced-motion runs); `sec/` holds one full frame per section; `probe/` holds 2x
close-ups of the glass in each engine; `interact/` holds frames from the scripted interactions.
Reference frames are in `~/.t3/infiniview-redesign/references/<site>/`.

The questions asked in every round: would it win Awwwards Site of the Day; would a developer say
"holy shit"; is anything glitchy, slop-like, text-heavy or not fluid; how does each screen hold up
next to Igloo, Lando Norris, Lusion, Linear and Raycast.

## Round 1: first complete build

Captures: `rounds/0` (first passes while building) and `rounds/1` (the full matrix, three engines).

Judged against the references: the composition was right (a huge headline, a real product window,
one glass instrument) and already closer to Linear and Raycast than the old site, but it was not
finished work. Next to Igloo's palette discipline the wall was loud and blue; next to kube.io's
glass the lens rim was mud; several things were plain bugs.

| # | Found | Fixed by |
| --- | --- | --- |
| 1 | The wall's light was bright and sat behind copy on most screens (statement, coverage, FAQ; unreadable on a phone) | Dimmer field, smaller halo; later replaced by the anchored backlight (round 2) |
| 2 | Lens: text at the rim turned to coloured speckle; a full inner frame crossed what was being read; the highlight was milky | Narrower bezel, lower displacement and dispersion, a 0.3 px pre-blur; the frame became four corner brackets; highlight halved |
| 3 | Phone headline read "Attack your codebefore" (a break element with no space) | A space before the break |
| 4 | Threat band: outlined type showed the font's internal contours (lines through A, f, z); the slab magnified into noise; WebKit drew an empty slab | Outlines drawn as silhouette shadows; no magnification; Safari gets the slab without the bend (WebKit will not filter content that wide) |
| 5 | The nav's real refraction was not rendering at all in Chromium: its entrance animation was on an ancestor, which becomes the backdrop root | Entrance moved onto the bar itself; the filter now blurs, bends and dims the backdrop |
| 6 | Headless WebKit and Firefox draw no backdrop blur, so page text showed sharply through the bar | Fallback tint made dense enough to read with no blur at all |
| 7 | Pipeline: an empty stage at the first beat; the sandbox chip clipped; stage off-centre on phones; finding chips ran off the stage | The pull request is on stage from the start; chip moved outside the clipped shell; stage centred by percentage; chips read leftward from their point |
| 8 | Phone tray labels truncated to "WEA…" | Short labels in a three-column row |
| 9 | At 1024 the finale's form was 75 px wider than its column | The form measures its own column (container query) and stacks when narrow |
| 10 | Finale copy could be read through the aperture's closing edge | The aperture is fully open before the copy is in view |
| 11 | Footer wordmark showed contour lines inside its letters | No text-stroke; gradient fill only |
| 12 | axe: one contrast failure (a label inside the dimmed production plate) | Label moved out of the dimmed element |

## Round 2: numbers, contrast, layout shift

Captures: `rounds/2` (matrix in three engines plus the iPhone profile and reduced motion, 76
combinations; Lighthouse; load filmstrips; frame rates).

Judged against the references: the page now had Linear's calm, but the measurements showed where it
was not yet honest work.

| # | Found | Fixed by |
| --- | --- | --- |
| 1 | Pixel contrast audit: 12 of 1,408 text boxes below AA, all small grey text near the wall's light, plus nav links over a passing headline | The light became a backlight anchored behind each chapter's product surface; type-only chapters get a dim light at the foot of the screen; the quietest text colour was raised; the nav glass dims its backdrop (Apple's "regular" variant). Result: 0 below AA |
| 2 | CLS 0.038 while scrolling the pinned pipeline on desktop: the step list expanded and pushed its siblings | Step descriptions cross-fade in one reserved place; nothing is pushed |
| 3 | Pricing on mobile: LCP 3.6 s, because the headline faded in from opacity 0 | Same masked words as the hero (transform only, painted in the first frame) |
| 4 | Lighthouse flagged 3.47:1 on dim text inside the lens copy on one run | Raised to AA |
| 5 | The light's anchor rect was read every frame | Read only when the page has scrolled or resized |
| 6 | Report beat: with the sandbox gone the lime light stood in the open, far too strong at 1024 | Turned down for that beat |
| 7 | Pipeline finding chips overlapped each other and repeated the attack view's own flags | Chips placed apart; flags hidden in that chapter |
| 8 | Small laptops: the tray wrapped onto two rows | Short labels up to 1180 px |

## Round 3: interactions and the still version

Captures: `rounds/3` (matrix again, 76 combinations, all clean; interaction scripts in three
engines; per-section frames).

| # | Found | Fixed by |
| --- | --- | --- |
| 1 | **The third weak point could not be found.** The sample app's footer (the rate-limit meter) had been pushed out of the window by a taller table, so the lens game could never be completed. Caught by the interaction script, not by eye | The app's body grid gives up table rows first; the footer never leaves |
| 2 | Reduced motion: the wall's one still frame kept the hero's light fixed on screen, so every later section scrolled its copy across it | A quiet still frame with a dim light at the foot of the screen |
| 3 | Reduced motion: the pipeline's still showed the last beat, an empty stage ("sandbox torn down") | The still shows the sandbox sealed, in attack view, with its findings |
| 4 | Found tray slot on a phone read "BUSIN…" | Short names (SQLi, Replay, No limit) |
| 5 | Synthetic touch input raised `NotFoundError` from pointer capture in WebKit | Capture is guarded |

Interaction results, identical in Chromium, WebKit and Firefox: the lens follows the pointer and
locks all three weak points; the tray opens the matching finding in the console; tabs and arrow keys
work; the proof replays (1 line visible mid-way, 4 at the end); dragging the timeline scrubs the run
(1,586 px of scroll for half the track) and settles on a beat; a step button jumps to its beat; the
merge check reads blocked at the end; the slider's arrow keys step; anchors land; the FAQ opens one
item at a time; Home to Pricing and back is a client-side transition with no reload; no console
errors.

## Independent critique

A separate agent, given no account of what was built or why, was asked to act as a senior jury
member: browse the old site (port 3140) and the new build in Chromium, WebKit and Firefox at desktop
and phone sizes, use every interaction, compare against the reference captures, score both out of
ten, and list findings by severity. Its captures are in `~/.t3/infiniview-redesign/critic/`.

**Scores, first pass: old site 5.5, new build 7.0.**

| Dimension | Score | Its reason, in short |
| --- | --- | --- |
| Concept and originality | 7.5 | The lens is on-product; nothing after the pipeline had an idea |
| Craft and polish | 7 | Clean load, no layout shift, no console errors; breaks at the lens's edges and in phone labels |
| Liquid-glass realism | 6 | Rim and edge refraction are real at 2x, but the lens was an opaque dark window |
| Motion and fluidity | 7 | No dropped frames; a small vocabulary |
| Interactivity | 6.5 | The lens game was fun for 20 seconds, then its payoff was hidden |
| Typography and hierarchy | 7.5 | The condensed display face has character; the smallest mono labels were faint |
| Clarity and conversion | 7.5 | Clear promise, waitlist top and bottom |
| Mobile | 6.5 | Good menu, no scroll traps; truncated labels, an illegible pipeline stage |
| Restraint | 7.5 | No slop gradients; stat row, feature row, FAQ and pricing were "the old skeleton repainted" |

Its verdict: "a clear step up from the old one, but it is not Site of the Day material yet" (an
Honorable Mention plausible). It said to keep the hero concept and the hard-edged sample app, the
masked headline load, the pipeline's backlight shifts and particles, the console's typed replay, the
waitlist validation, the phone menu, the 404 and the lime finale.

Its seventeen findings and what was done:

| # | Sev | Finding | Done |
| --- | --- | --- | --- |
| 1 | P0 | After 3 of 3, moving to "Replay the proof" put the lens over the button | When the pointer leaves the stage the glass parks clear of the tray, and the tray sits in front of the glass |
| 2 | P0 (verify) | A valid waitlist submit returned 500 | Confirmed as the local environment: this branch was built without a database by instruction. The API and its contract are unchanged; the success, duplicate, rate-limit and error states are tested against stubbed responses. Not exercised end to end here |
| 3 | P1 | The lens was not glass: past the app's edge it showed flat black with a hard clip line | The glass stays inside the stage, so it only ever shows the app; the attack view is the same app (same layout, same colours, a shade warmer) with only the breakable things changed |
| 4 | P1 | Edge refraction shredded text into coloured fragments | A wider, shallower bezel (14 % of the lens), displacement capped at 3.8 % and dispersion at 3.5 % |
| 5 | P1 | Cut-off text: phone timeline ticks, a phone tray chip, lens tags | Ticks sized to their labels; tray chips have fixed short names on narrow screens; tags sit inline in the app; x-ray cells shortened. A script that looks for any clipped cell finds none at 1440, 1180, 1024, 768 and 390 |
| 6 | P1 | The tray grew as findings arrived and reflowed the sample app | The tray is one size from the first paint: three slots and the way on are always in place |
| 7 | P1 | Dead scroll: 1,500 px to brighten one sentence; a 5,280 px pin; a 14.6k page | The statement is no longer pinned and carries the four numbers beside it; the pipeline pins for about three screens. The home page is 12,127 px at 1440 (the old site: 16,183) |
| 8 | P1 | The phone's pipeline stage was the desktop stage scaled to 5 px text | A stage composed for phones (its own 420 × 548 layout) with a compact app |
| 9 | P1 | The touch lens escaped the stage and sat above the finger; slots were labelled 1 2 3 | Clamped to the stage; slots are named, and tapping one sends the lens to that weak point |
| 10 | P1 | The second half was a template: 40 chips, four feature columns, FAQ | Coverage has "Pick your stack": a spring pill, the scanners written for that stack light up, the count is announced. The feature row and ledger became one sample run log |
| 11 | P1 | `/preview` looks like a different brand | Out of scope by the brief (the product demo is kept as is). Reported |
| 12 | P2 | The lens's autopilot parked on findings while the counter said 0 of 3 | It drifts over the middle of the table and never counts as a find |
| 13 | P2 | The route crossfade double-exposed two headlines | Out, then in |
| 14 | P2 | The pipeline opened and closed weakly (an empty dashed box at each end) | The production plate is the real sample app, kept at AA contrast; the pull request is on stage from the first beat |
| 15 | P2 | The timeline handle looked like a pause button | Chevrons |
| 16 | P2 | The footer wordmark was sliced at x-height | Uncropped |
| 17 | P2 | Without blur, nav links collided with the headline behind | Denser fallback tint |

### Second pass, on the fixed build: 7.4

The same critic, asked to verify every claimed fix itself and to look for anything the fixes broke
(captures in `critic/round2/`).

| Dimension | First | Second | Its reason |
| --- | --- | --- | --- |
| Concept and originality | 7.5 | 7.5 | Same idea; the second half still has none of its own |
| Craft and polish | 7 | 7 | Many fixes, offset by two new defects (below) |
| Liquid-glass realism | 6 | 7 | The lens is transmissive and stays on the app; still a dark tint with edge curls |
| Motion and fluidity | 7 | 7 | Route change is clean; the teardown's ghost frame cost it |
| Interactivity | 6.5 | 7.5 | The game completes, the reward is reachable, slots and the stack picker respond |
| Typography and hierarchy | 7.5 | 7.5 | Unchanged |
| Clarity and conversion | 7.5 | 8 | The statement carries the four numbers; the page is 12.1k px |
| Mobile | 6.5 | 7.5 | Legible phone pipeline, no truncated ticks or chips, clamped lens |
| Restraint | 7.5 | 7.5 | Feature row gone; chip wall, FAQ and pricing cards remain |

Of the seventeen: ten fixed, five partly, two excluded by instruction. It also found problems the
fixes had introduced or that nobody had tested before:

| Sev | Found | Done |
| --- | --- | --- |
| P0 | A link pressed within about a second of scrolling opened the next page part-way down, or at its footer (all three engines): the smooth scroller carried its in-flight target across the route change | The scroller is reset on every route change; Back and Forward keep the position the browser restores. A script clicks Pricing and the logo 60 to 1,300 ms after a wheel scroll in three engines: always y = 0 |
| P1 | The pipeline's teardown dissolved the sandbox over the identical production app a few pixels away, so every row read twice (this came from making the production plate a real app) | The sandbox is wiped away, never dissolved; its "torn down" label sits on the plate's upper edge |
| P1 | In WebKit at 2x the inside of the lens was soft | WebKit rasterises filtered content at one pixel per CSS pixel. The filtered copy is drawn at twice the size, with a map built to match, and shown at half scale: sharp to the rim |
| P2 | "12 runtime attack agents" over 11 names; "7 interaction test types" over 5 | The lists are a selection and now say "Including". The full lists are not published anywhere, so none were invented (reported to Arav) |
| P2 | Phone pipeline: finding chips half-covered words | Each chip is a whole row of the app beside its weak point |
| P2 | The "Move the lens" pill covered the app's heading | The hint is in the tray's own cell until the lens is first moved |
| P2 | Tapping the three tray slots completes the game without moving the lens | Kept: it is the keyboard and assistive path |

### Third check, on the build with those fixes: 7.7

A narrow check of the items above (captures in `critic/round3/`). Navigation: fixed in all three
engines. Teardown: no double exposure at any size. Phone chips, counts, footer switch: fixed. Craft
7 → 7.5, motion 7 → 7.5, mobile 7.5 → 8. It also caught that my first fix for the WebKit lens (a
sharp, unfiltered middle laid over the soft filtered copy) left a hard seam where words crossed from
sharp to soft; that approach was thrown away for the supersampled one described above, which has no
seam because it is one picture. Its other residues were fixed too: phone chips now close where they
are instead of flying across the table at teardown; the hint shows on wide screens; the torn-down
label clears the pull-request card. Those last three fixes were made after the third check and have
been verified by me, not by the critic.

What the critic says still caps the score below 8, all of them decisions rather than defects: the
tray cuts the lens flat where it dips behind it; the pipeline ends without handing its proof bundle
into the console below; coverage is a filter, not an idea of its own; FAQ and pricing are
conventional. It would not give this Site of the Day; an Honorable Mention is plausible.


## Round 4: after the critique

Captures: `rounds/4` (matrix in three engines, the iPhone profile and reduced motion; Lighthouse;
filmstrips; interaction scripts; pixel contrast in three engines).

Things the critic's pass exposed that it had not listed, found while fixing and checking:

| # | Found | Fixed by |
| --- | --- | --- |
| 1 | With the glass held inside the stage, its focus brackets missed weak points near the stage's edge (up to 90 px away from the Refund button) | The brackets travel inside the glass to the weak point; the lock always lands on what was found |
| 2 | The lens's hint ("Move the lens") was cut in half by the tray when the lens was low | The hint sits above the glass |
| 3 | The production plate, now a real app, dimmed to 2.7:1 on its smallest text (Lighthouse accessibility fell to 97) | It never dims below the level where its smallest grey text reads at AA; it is set apart by desaturation, a dashed outline and having no light behind it |
| 4 | Inside the lens "5 refunds · $210.00" and the password hash were cut to an ellipsis | Shortened so they fit their columns |
| 5 | Stack picker: unselected chips did not dim (an entrance tween had left inline opacity), and the strip was cut off at the right on phones | The tween clears what it set; the strip wraps |
| 6 | axe, with all three findings found: two tray buttons had a label that did not contain their visible text | The accessible name is the visible label followed by the detail |

Results on the final build (`rounds/4`):

- 76 browser and size combinations, none with a problem (three engines × four sizes × four pages,
  the iPhone profile, reduced motion).
- 18 scripted interaction checks pass identically in Chromium, WebKit and Firefox.
- 53 haptics checks pass (phone profile in Chromium, iPhone profile in WebKit, reduced motion, the
  setting off, three desktop engines). They prove wiring, not feel.
- 21 navigation checks pass (a route change mid-scroll, three engines).
- axe-core: no violations on the marketing pages and their states; keyboard walk clean.
- Lighthouse: home 100 desktop / 98 mobile, pricing 100 / 100; accessibility, best practices and
  SEO 100 on all four. CLS 0 on every route and size, with and without CPU throttling.


