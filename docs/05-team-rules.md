# 05 — Team rules

Binding for every human and agent building this site. Proven on the advisor-os build; the
LAW inherits them here.

1. **The LAW governs.** Read `00-LAW` → `01-design-system` → your slice's row in `04-phases`
   before writing anything. Where any instruction conflicts with the LAW, the LAW wins;
   where the appendix conflicts, the LAW wins; raise conflicts, don't resolve them silently.
2. **Specs beat vibes.** No visual or motion effect ships that isn't a named recipe in
   `01-design-system`. Need a new one? PR the recipe to the doc first (with duration/easing/
   trigger/reduced-motion state), get it approved, then implement.
3. **The amber law is absolute.** Amber = the binding constraint, nowhere else. Reviewers
   grep for the token; violations are reverted without discussion.
4. **File-exclusive ownership.** One agent per directory per work session. The seam files
   (`registry/*`, tokens) are owned by the integration lead; everyone else consumes.
5. **Honesty engine everywhere** (Ruling 4): claims through `Claim`, numbers trace to
   evidence objects, simulations labeled, no fake AI, fictional companies only — a test
   asserts no real-company names appear in content.
6. **Verified means verified.** A slice is done when its `04-phases` "done means" row passes:
   typecheck, lint, vitest, the slice's Playwright walk, Lighthouse budget (≥95/100), and
   reduced-motion parity — checked, not assumed. TODO boxes tick only after verification.
7. **Track the work**: append to `DEVLOG.md` every session; keep `TODO.md` honest (checked =
   done and verified, nothing else). Plan folders for anything that grows judgment-heavy.
8. **Dependency discipline**: the stack in `02-architecture` is the allowlist. A new
   dependency needs a one-line written justification and approval. No UI kits, no chart
   libraries, no animation libraries beyond Framer Motion + Lenis.
9. **Performance is a feature of the design.** Fonts self-hosted and subset; images
   AVIF/WebP with dimensions; the WebGL budget (≤60KB, lazy, fallback) is a ceiling, not a
   target; every route stays inside the Lighthouse budget or the feature shrinks until it
   does.
10. **Branches**: build on `dev`; `main` merges are Matt's call.

## Verification commands

```bash
npm run verify        # typecheck + lint + vitest
npm run walk          # Playwright: full-site crawl + per-slice walks
npm run budget        # Lighthouse CI against the routes, budgets from 00-LAW Ruling 7
```
