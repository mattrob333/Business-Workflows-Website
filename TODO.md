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
- [ ] S3 · The six full framework pages
- [ ] S4 · The homepage (five acts)
- [ ] S5 · The flagship run — Find What Matters Now
- [ ] S6 · Chapters + examples + bridge + waitlist
- [ ] Phase 1 exit: full-site walk green, budgets green, north-star behavior observed
