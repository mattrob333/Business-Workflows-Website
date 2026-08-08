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
  - S3-A landed: the seven-section page pattern (registry-driven, per-framework config
    modules), MDX lesson wiring, URL-state handoff contract, and two complete pages —
    /frameworks/bmc and /frameworks/theory-of-constraints (the site's one amber surface,
    pragma'd). 26/26 Playwright incl. the digit-sweep honesty walk. S3-B (five-forces,
    vrio, swot-tows, raci) in flight.
- [ ] S4 · The homepage (five acts)
- [ ] S5 · The flagship run — Find What Matters Now
- [ ] S6 · Chapters + examples + bridge + waitlist
- [ ] Phase 1 exit: full-site walk green, budgets green, north-star behavior observed
