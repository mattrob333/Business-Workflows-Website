# Developer log — The Strategy Stack

## 2026-08-09 · Session 6 — S5, the flagship run

*Find What Matters Now* is live at /runs/find-what-matters-now: twelve steps, Beacon
from canvas to routed interventions in an authored 17 minutes. The mechanics worth
recording:

- **Resume is honest**: ?step=N parsed client-side, pushState + popstate (browser-back
  walks the run backwards), and the state rail is a pure function of the step number —
  ?step=7 shows exactly steps 1–6's writes for every visitor. The walk asserts
  localStorage and sessionStorage stay empty.
- **The rail is the thesis**: 22 rows over the run's stateOut fields — committed /
  pending (empty slots with field names, so you see what the step is about to earn) /
  landed (arrives with motion/ingest when the interaction completes). Re-written fields
  are marked revisions, not overwrites. Grows monotonically 0→20.
- **Amber is earned, structurally**: step 10 identifies the narrow stage in ink; step 11
  paints it. The constraint surfaces are not in the DOM before step 11 (one step mounts
  at a time — display:none would still leak to getComputedStyle), and step 11's set is
  asserted {toc, badge, verdict}, all pre-pragma'd files, no new amber-bearing file.
- **Step 9's event injection** teaches re-scoping: inject "a competitor raises capital",
  edges into Five Forces/SWOT/TOWS light with route dots, and BMC/VRIO/ToC/RACI stay
  dark with sourced verdicts — VRIO the deliberate near-miss (94-day hiring lead time
  means capital doesn't move inimitability this quarter).

Two decisions made by the integration lead on the agent's raised items: (1) run copy
stays in src/content/runs/ per 02-architecture's content model — registry runs.ts keeps
its null stubs and its test unmodified; the registry stays structural, content stays in
content (the brief's instruction to fill the registry stubs was wrong, the agent was
right to refuse). (2) The DOM-weight interpretation stands: the server emits all twelve
steps' editorial content but only the current step's diagram, halving the DOM; the
instruments render in final state on /frameworks, which the page says with JS off.

To confirm with Matt: step answers reset on revisit (the rail, not the widgets, is the
run's memory — deliberate, but a product call). Numbers: 90/90 Playwright, 195 kB first
load (no new bundle weight vs S3 pages), a11y 100 / BP 96 / SEO 100, observed paint
763ms, exported HTML 79.5 kB gzipped. Simulated TBT ~2.0s is the site's worst — the
first perf target once the measurement ruling lands. GraphMiniMap label clipping near
canvas edges suppressed locally in RunShell; S2 owes a real fix.

## 2026-08-08 · Session 5 — S4, the homepage

Beacon gets diagnosed while you scroll. ACT I: a nine-block portrait canvas assembles
(not the working canvas — a portrait), key resources wearing the contradiction grade so
the block the revenue line leans on pulses once; evidence chips land under it. ACT II:
an authored crop of the graph — the flagship run's seven frameworks, eight real registry
edges via edgesFor() so a rewired registry fails the build; the full 17/58 graph was
deliberately not embedded (S2's hydration cost, one sentence to teach). ACT III: the
page's first amber, computed from capacity, in exactly two already-pragma'd surfaces —
no new amber-bearing file was written, and the test asserts absence everywhere else,
then presence inside the declared set. ACT IV: the change-order packet stops at the
accountable human. ACT V: the hand-built loop ring, waitlist, quiet footer.

LCP was designed, then measured. The hero is plain server markup — no motion wrapper,
no opacity gate — and the walk fetches the RAW exported HTML and fails on any opacity
gating in the hero region (a rendered check would miss it; hydration has happened by
then). Measured: observed paint 248ms (FCP = LCP); under devtools 4×-CPU + slow-4G
throttling, 2.008s, score 0.97 — the Ruling 7 hard line effectively met inside this
container and comfortably met on real hosting. First Load 180 kB — level with
/frameworks despite running four recipes, because the registry and pack never cross the
client boundary. No WebGL: the designed-static hero carries a case-file of three pack
metrics with evidence chips — the honesty engine above the fold.

Known and raised: CLS 0.11 under heavy throttle (watch it); JS-off diagrams render
their first step, not their terminal state — site-wide since S0, needs a CSS-reachable
terminal state in src/motion/ (S4 improved the noscript rule but useStage is React
state); ActMarker clips ~8px at exactly 1280px viewport width (acts.tsx rail property);
ACT II's seven node positions are a second authored layout (edges are registry-checked,
coordinates are not shared with graph-layout).

53/53 Playwright, 49/49 vitest, a11y 95 / BP 96 / SEO 100 on /.

## 2026-08-08 · Session 4 — S3-B, the other four pages; S3 functionally complete

five-forces, vrio, swot-tows, raci — built mechanically against the S3-A pattern, which
is the pattern working as designed. Four interaction islands worth knowing about:
ForcePressureFlip re-scores the forces when a pack fact flips and an invariant claim
panel says none of it moves the delivery rate; VrioGateWalk stops at the first failed
gate and says the remaining gates are never asked; TowsCrossPicker mints moves from only
four of sixteen pairings — the other twelve saying "nothing minted" IS the lesson;
PacketRouting fires the accountability rule when a visitor routes A to an agent, and its
second packet is deliberately human-on-both-letters (the honest answer to a queue at one
approver is a second approver, not an agent).

Decisions inherited from the pack, not invented: the retrofit crews pass all four VRIO
gates (story.ts says so; the recipes fixture that disagrees is a stand-in, not evidence);
single-approver control fails the VALUE gate while being perfectly organised — which is
the gate-order argument. The WO move rests on an assumption the pack cannot settle
(service-tech qualifications) and is labelled as the page's named open question.

For later slices: the `tows` chapter record's "three of them make the backlog worse"
doesn't match the four authored crossings (re-balance when S6 builds the TOWS chapter);
swot-tows and raci handoff tests should tighten to [data-recommended] once S6 makes
their bestBefore targets linkable; the claim-status rules (recommendations may cite
nothing in the lib, but a rendered claim block must cite something in the walk) need a
doc note before S5 authors run steps. The recipes act-pin test flaked once under
first-full-run load — passed in isolation and on every later run; watch it.

42/42 Playwright, 49/49 vitest, six exported pages, a11y 96 / BP 96 / SEO 100
spot-checked on toc + five-forces. S3's row done-means all pass; its box waits on the
same single perf-measurement ruling as S0/S2.

## 2026-08-08 · Session 3 — S3-A, the framework page pattern + the first two pages

The pattern is a per-framework config module (`framework-page/configs/`) feeding a
registry-checked template: `assertConfigMatchesRegistry` fails the build if a config's
recipe or lesson path drifts from the record. Two conventions the reference configs
establish: figures come from the company packs through accessors that throw (never
literals), and interaction islands are dumb — they receive server-rendered claim nodes
and decide visibility only, which keeps the registry and evidence off the client
(3.73 kB page, 181 kB first load, down from a 208 kB first draft).

Two pages shipped complete. `/frameworks/bmc`: BmcAssemble act-pinned on Beacon,
stale-propagation explorer, predict-before-reveal. `/frameworks/theory-of-constraints`:
the site's first amber — exactly three constraint surfaces (recipe stage, badge, verdict),
asserted as a set with a non-vacuous guard; the narrowing interaction eliminates four true
findings (each rebutted by the pack's own claim) before the verdict unlocks. Ruling 4 is
mechanised in the walk: any digit outside a `[data-claim]` block in the explore body fails
the test — which is why the islands spell UI counts as words. ToC's three modelled stage
capacities are labelled `assumption` and printed with their basis (flagged for Matt's
read: it is the one place numbers were authored rather than lifted).

The handoff contract: `?company=<company-id>&from=<framework-id>&carries=<field,...>`;
`IncomingState` drops anything that isn't a real registry edge or a field that doesn't
travel it. Chapter handoff targets are named, not linked, until S6 builds those pages.
The four unconfigured full pages render honestly (hero, signature, locked door, "being
authored" placeholder) so nothing 404s while S3-B is in flight.

Integration pass: fixed S3-A's raised defect at source — `fw-bmc-assemble`'s sweep
gradient lost its `animate` prop on backward scrub and Framer wrote `undefined` into
x1/x2 (console error on every page that scrubs a BMC act). Keeping `animate` mounted
wasn't enough; the durable fix is an explicit `initial={{x1, x2}}`. The test exemption
S3-A carried (`KNOWN_BMC_SWEEP_DEFECT`) is deleted — every walk now asserts a fully
clean console. `src/mdx-components.tsx` exists now (App Router MDX requires it) and owns
lesson typography; S5/S6 inherit it. 26/26 Playwright, 49/49 vitest, exports exactly six
framework routes.

## 2026-08-08 · Session 2 — S2, the Framework Graph

One agent, one slice. The graph is authored, not simulated (02-architecture): hand-placed
coordinates in `graph-layout.ts` — two horizontal bands (outward analysis across the top:
terrain → advantage → direction; inward across the bottom: customer → alignment) with the
`bmc → theory-of-constraints → raci` spine dead level between them at y=410. The
conductor's 13 in-edges bundle through two "throats" and rest at higher opacity than the
other 45 — the pivot is what the eye finds first, and the emphasis is opacity only, never
hue. No amber on the page (the graph has no constraint surface); a test asserts zero.
Edge arcs use a deterministic clearance search over authored candidates; worst rendered
clearance across all 58 edges is asserted in Playwright (>6 user units), so coordinate
drift fails the build. Edges are not tab stops — 17 node links + a skip link; the 58
handoffs are keyboard/AT-reachable through `/graph`'s edge-index rail and the list below
the graph. New: `FrameworkGraph`, `GraphMiniMap` (S3 drops it onto framework pages),
`GraphLegend`, `GraphInspector`, `/graph` route; `/frameworks` rebuilt from S1's minimal
index into the full-bleed experience with the list as the screen-reader-first path.

Integration pass (lead): axe fixes — `--faint` lifted #73726B → #82817A (was 3.99:1 on
void, small mono text needs 4.5:1; muted still ~7:1 so the voice hierarchy holds), node
labels moved outside the SVG links (AT concatenates multi-line `<text>` without spaces,
failing visible-text ⊆ accessible-name on every two-line name), inspector heading
hierarchy made sequential. Result: a11y 100 on /graph, 96 elsewhere — Ruling 7's ≥95
holds on every route. Remaining sub-95 items are contrast on `opacity-70`-dimmed faint
labels; noted for the design system, not chased. Perf on /frameworks: 79 simulated —
same lantern artifact as session 1 (observed paint 232ms), same real TBT question
(~430ms hydrating 17 nodes + 58 edges), same pending ruling.

16/16 Playwright, 49/49 vitest, tsc and tokens clean, static export green.

## 2026-08-08 · Session 1 — S0 + S1 land

Two agents built in parallel with file-exclusive ownership; the integration lead verified,
measured and pushed.

**S0 — foundation** (components + motion): the full 01 §6 component set, all fourteen
motion recipes including the six framework showpieces in scroll-act form, the grain/atmo/
glass depth layers, and `/recipes` — the acceptance gallery where every recipe renders
beside its stated contract (duration, easing, trigger, reduced-motion terminal state).
Playwright walks: 6/6 green, including reduced-motion-as-second-theme and the amber-law
scan (amber only inside ToC constraint surfaces). The build agent was severed by a
container recycle at 18:22 UTC during final polish; the work had already landed and
verified clean — salvage cost was zero.

**S1 — registry + content core**: 43 typed state fields, the 17-framework registry with
edge validation (**every graph edge must share at least one typed state field** — a
prose-only edge fails the build), 9 strategy runs with `find-what-matters-now` flagship
(12 typed steps), the Claim/Evidence/Metric honesty lib (a display number cannot be
constructed without an evidence ref), and three companies whose evidence packs do real
arithmetic — Beacon's utilisation is computed (93% install vs 73% service), its queue
closes twice, revenue reconciles by line and by segment, and the rival constraints are
sized so "capacity, not demand" genuinely beats them. 49 vitest tests green.

**Conflict raised, not resolved** (team rule 1): appendix §3 counts SWOT and TOWS as two
engines; 03-content-spec merges them onto one page. S1 kept both true — `swot` full
(owns `/swot-tows`), `tows` chapter, so the "SWOT collects, TOWS generates" edge is a
real graph edge. 17 records / 6 full / 11 chapter holds. Matt may prefer to collapse.

**Performance work + a second conflict raised**: the `/recipes` Lighthouse budget
(04-phases S0: ≥95) came in at 58. Three fixes: (1) `tests/serve.mjs` now serves gzip —
real hosts compress, an uncompressed measurement server lies slow (58 → 85); (2) fonts
moved from fontsource CSS imports to `next/font/local` over the same fontsource files —
inlined @font-face + preload, FCP 1.8s → 1.0s; (3) code-splitting the showpieces was
tried and **reverted** — it destabilised act-pinning (reflow on chunk arrival broke the
pin test) and saved ~6KB. Where it settled: perf 84 simulated, but observed paint is
264ms and LCP scores 0.95 under devtools throttling — the simulated LCP is a known
lantern artifact when hydration completes inside the first frame. The genuine cost is
TBT (~870ms at 4× CPU): a gallery whose *job* is rendering all fourteen recipes at once
also hydrates them at once, which no shipping route does. Conflict: the ≥95 budget on a
render-everything gallery fights the gallery's purpose. Options for Matt: scope the perf
budget to shipping routes (a11y/BP/SEO stay ≥95 everywhere — currently 96/96/100), or
fund a progressive-hydration pass. S0's box stays unticked until he rules.

Also tried and reverted: `content-visibility:auto` on gallery sections (TBT 300ms →
9,300ms — hydration measurement forces synchronous layout of every skipped subtree; the
lever is CSS-only pages, not hydrated ones).

Next: S2, the Framework Graph — renders from the registry alone.

## 2026-08-08 · Session 0 — the LAW lands

Repo initialized with the harmonized build spec: docs/00-LAW (supreme), 01-design-system
("The Observatory": Instinct semantic color grammar, three type voices, motion recipes with
the amber law), 02-architecture (registry-driven, static-export v1), 03-content-spec (five-
act homepage, page pattern, three companies, the scripted flagship run), 04-phases (v1 =
authored experience, no live AI — Ruling 3), 05-team-rules, and the source plan preserved
as an overruled appendix. Authored by the Instinct build orchestrator from: the OpenAI
source plan, the two Instinct essays, the Instinct design system, and the kage/Skills
references. Build team starts at S0.
