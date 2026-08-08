# 04 — Phases

**v1's scope is law (Ruling 3).** Anything not listed in Phase 1 is not in Phase 1; "while
I'm here" additions are reverted in review.

## Phase 1 — The Experience (this build)

Everything authored, zero live AI, no auth. Slices, in order, each with acceptance criteria:

| Slice | Contents | Done means |
|---|---|---|
| **S0 · Foundation** | Repo scaffold (Next 15, TS strict, Tailwind on tokens, Lenis+Framer, MDX), design tokens + fonts self-hosted, the component set (01 §6), motion recipe library (`src/motion/`, all recipes from 01 §4–5 implemented against dummy data), grain/atmo layers, CI (typecheck+lint+vitest+Playwright) | Storybook-style recipe demo route renders every recipe; reduced-motion parity verified; Lighthouse ≥95/100 on the demo route |
| **S1 · Registry + content core** | The 17-framework registry, state-field types, 3 company profiles + evidence packs, honesty lib (Claim/StatusChip/EvidenceRef + lint rule) | Registry drives a generated index page; every Beacon number resolves to an evidence object |
| **S2 · The Graph** | /frameworks graph page + mini-map component; edges walkable; hover = edge explanation; click = route | Keyboard-navigable; the graph renders from registry alone (delete a record, node vanishes) |
| **S3 · The six full framework pages** | Page pattern sections 1–3, 5–7 per 03; six motion showpieces on their example companies | Each page: act-pinned animation performs; prediction widget works; handoff carries state via URL; per-page Playwright walk |
| **S4 · The homepage** | The five acts; the one optional WebGL hero (or designed static — team's call against the performance budget) | LCP <2.0s; all five acts on scroll + reduced-motion doc mode; both CTAs live |
| **S5 · The flagship run** | *Find What Matters Now*, 12 scripted steps, state rail, SIMULATION chip, event injection, replay | A first-time visitor completes it in 12–18 min; every step interactive; resumable by URL |
| **S6 · Chapters + examples + bridge** | 11 chapter pages, 3 example-company pages, /about-instinct + waitlist (form → simple endpoint or provider, decided at ship), og-images, footer | Full-site Playwright crawl green; Lighthouse budget on every route |

**Phase 1 exit criteria:** the north-star behavior is observable in testing — a visitor
finishes one framework and starts the next because the handoff made it obvious; the run
completion path works end to end; the waitlist captures.

## Phase 2 — The Lab opens ("run it on my business")

Supabase (auth, workspace state = the StateField vocabulary, evidence uploads, RLS), the AI
engine per appendix §7 (decision-first intake, adaptive gap questions, typed outputs,
evaluation pass, approval-gated state writes), Quick Run + Evidence Run on the six full
frameworks, report exports, private share links. The engine reuses advisor-os's proven
patterns (closed-set enforcement, evidence-gated claims, confidence discipline).

## Phase 3 — The stacks fill in

Customer stack (JTBD/VPC/Kano + RelayDesk full), growth stack (PESTLE/Ansoff/Three
Horizons/Blue Ocean + Lantern AI, Atlas Industrial), remaining Strategy Runs from appendix
§5, multi-stakeholder consensus mode (appendix §13 — the alignment-score feature).

## Phase 4 — The Instinct bridge becomes a door

Execution stack (7S/BSC/OKRs full), workspace → Instinct handoff (the save file exports into
the product's Company Model), continuous functions per appendix §15 Phase 6 — which are, by
then, literally Instinct features surfaced, not site features rebuilt.

## Success metrics

Appendix §17 adopted whole. Instrument from day one (privacy-respecting, no third-party
ad-tech): interaction-start rate, act completion, run completion, framework→framework
continuation, prediction participation, waitlist conversion, Instinct click-through.
