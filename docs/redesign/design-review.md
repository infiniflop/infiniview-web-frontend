# Design review

Four self-review rounds and one independent critique. Every round's captures are outside git in
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

<!-- CRITIC -->
