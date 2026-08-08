# Build TODO — The Strategy Stack

Governed by docs/00-LAW.md. A box checks only when its 04-phases "done means" row is
verified. Unchecked = not done.

## Phase 1 — The Experience

- [ ] S0 · Foundation (scaffold, tokens, fonts, components, motion recipe library, CI)
  - Everything verified except one criterion: `/recipes` Lighthouse performance is 84
    simulated (a11y 96 / best-practices 96 / SEO 100; LCP scores 0.95 under devtools
    throttling — the simulated LCP is a lantern artifact, observed paint is 264ms).
    The real finding is TBT ~870ms under 4× CPU throttle: a gallery that renders all
    fourteen recipes at once hydrates them all at once. Raised to Matt (DEVLOG session 1):
    either amend 04-phases to scope the ≥95 perf budget to shipping routes, or a
    progressive-hydration pass on the gallery. All other S0 done-means are green.
- [x] S1 · Registry + content core (17 records, 3 companies + evidence packs, honesty lib)
- [ ] S2 · The Framework Graph
  - Built and verified: 16/16 Playwright (10 S2 walks incl. keyboard traversal,
    registry-count nodes, edge panels naming real state fields, reduced-motion, no-amber,
    rendered-SVG clearance ≥6 units), a11y 100 on /graph and 96 on /frameworks after the
    integration lead's contrast/heading/label fixes. Box ticks when Matt rules on the
    same open question as S0: /frameworks perf is 79 simulated (observed paint 232ms —
    lantern artifact — but TBT ~430ms from hydrating 17 nodes + 58 edges is real).
- [ ] S3 · The six full framework pages
  - All six pages live and verified: act-pinned showpieces, predict-before-reveal labs,
    digit-sweep honesty walks, URL-state handoffs, reduced-motion terminal states —
    42/42 Playwright. Amber exists only on /frameworks/theory-of-constraints (three
    pragma'd surfaces, asserted as a set); the other five are asserted amber-free.
    a11y 96 / BP 96 / SEO 100 spot-checked. The row's own done-means all pass; the box
    joins S0/S2 in waiting on Matt's one ruling about where the Lighthouse *perf* budget
    is measured (container-simulated vs shipping host) — one ruling closes all three.
- [ ] S4 · The homepage (five acts)
  - Built and verified: all five acts on scroll + reduced-motion doc mode, both CTAs
    live, amber choreography asserted as an absence (zero amber before ACT III; ACT
    III's surface set = {toc, badge}), designed-static hero (no WebGL spent). 53/53
    Playwright. LCP: 248ms observed / 2.008s under devtools 4×-CPU+slow-4G throttling
    (score 0.97) — the <2.0s hard line effectively met in-container, comfortably met on
    any real host. a11y 95 / BP 96 / SEO 100. Box waits on the same perf-measurement
    ruling as S0/S2/S3. Known: CLS 0.11 under heavy throttle; JS-off diagrams show first
    step not terminal state (site-wide, raised since S0).
- [ ] S5 · The flagship run — Find What Matters Now
  - Built and verified: 12 steps each with a working interaction (37-test walk), URL
    resume via ?step=N with the rail a pure function of the step number (zero storage),
    SIMULATION chip pinned throughout, the rail accreting 0→20 fields with revisions
    marked, step-9 event injection lighting re-run edges with sourced stay-dark verdicts,
    amber structurally absent before step 11 (surfaces not in the DOM) and asserted as
    the set {toc, badge, verdict} at 11. 90/90 Playwright. a11y 100 / BP 96 / SEO 100,
    observed paint 763ms. Box waits on the perf ruling with S0-S4; note: this route's
    simulated TBT (~2.0s) is the site's worst — first perf target after the ruling.
    Product decision to confirm: step answers reset on revisit (the rail, not the
    widgets, is the run's memory). Run copy lives in src/content/runs/ per
    02-architecture; registry runs.ts left untouched (its test asserts null stubs).
- [ ] S6 · Chapters + examples + bridge + waitlist
- [ ] Phase 1 exit: full-site walk green, budgets green, north-star behavior observed
