# Developer log — The Strategy Stack

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
