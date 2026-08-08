# 00 — THE LAW

This document is the final authority for The Strategy Stack build. It harmonizes three
inputs: the detailed source plan ([appendix](appendix-source-plan.md)), the Instinct system
of record (the essays, the design language, the honesty rules), and the visual bar set by
[MengTo/kage](https://github.com/MengTo/kage) and [MengTo/Skills](https://github.com/MengTo/Skills).
**Where any other document — including the appendix — disagrees with this one, this one wins.**
Changes to this document are versioned amendments with a reason, approved by Matt.

## Ruling 1 · What this site is

A **strategy simulator you can walk through**, not a blog with widgets. The visitor's arc:
*watch a framework run on a company that feels real → understand it → see its output feed
the next framework → realize the frameworks are one system → want that system running on
their own business → join the Instinct waitlist.* The site's single job is to make the
sentence "business frameworks, finally running" *visible* before it is ever argued.

The four inner products from the source plan survive intact as the long-term shape:
**Library** (framework pages), **Lab** (interactive builders), **Strategy Runs** (guided
sequences), **Workspace** (persistent company state). But see Ruling 3: they arrive in
stages, and v1 ships only what can be made exceptional.

## Ruling 2 · Design direction — the source plan's palette is overruled

The source plan prescribes "near-black + spring green + electric cyan, terminal precision."
**Rejected.** That palette is the default costume of a thousand dark SaaS sites — it cannot
win awards and it severs the site from the Instinct brand.

The direction instead — codified fully in [01-design-system](01-design-system.md):

1. **The site speaks Instinct's semantic color grammar.** Color *means* something everywhere:
   **amber is the constraint and only the constraint** (the site's most sacred rule, inherited
   from the product); **green is confirmed evidence**; **periwinkle/indigo is data movement
   and connection**; **red is contradiction, used rarely**; everything else is warm charcoal
   atmosphere and ivory text. A visitor who later opens Instinct already knows the language.
2. **kage's lessons govern the feel**: layered depth (background atmosphere → mid data layer
   → foreground editorial type), scroll-choreographed narrative acts, restraint (few effects,
   perfectly tuned), and full reduced-motion parity. The homepage is a *scrollytelling
   documentary of one company's diagnosis*, not a grid of feature cards.
3. **Skills' lesson governs the process**: *specs beat vibes*. Every visual and motion effect
   used anywhere on the site must exist as a named recipe in the design system doc before it
   ships. No agent invents an effect inline. If it isn't a recipe, it doesn't render.
4. **Typography is three voices**: an editorial display serif for narrative headlines (the
   human voice), a monospace for data/labels/scores/evidence refs (the system voice), and a
   clean sans for body (the teaching voice). The interplay of serif-over-data is the site's
   signature move.

## Ruling 3 · Scope stages — v1 is an authored experience, not a SaaS

The source plan describes a full product: auth, uploads, vector search, adaptive AI
interviews, multi-stakeholder mode. All of it is good and all of it is **later**. An
award-grade v1 and a live-AI v1 are incompatible goals on one timeline — live generation
means variable quality, and variable quality loses awards and trust simultaneously.

**v1 (this build) is a no-auth, no-login, zero-live-AI experience** in which every word,
number, and animation is *authored* — which is why it can be perfect:

- The **Library**: six frameworks at full depth (BMC, Five Forces, VRIO, SWOT/TOWS, Theory
  of Constraints, RACI) + eleven at "chapter card" depth (question, position in the graph,
  coming-soon lab).
- The **Framework Graph**: the living map of how outputs feed inputs — the site's centerpiece
  interactive.
- **Three example companies** (Beacon Mechanical, RelayDesk, Lantern AI) with hand-authored
  evidence packs.
- **One complete, scripted Strategy Run** — *Find What Matters Now* on Beacon Mechanical —
  deterministic, hand-authored at every step, interactive at every step (predictions, lens
  comparisons, event injection), honest about being a simulation.
- The **Instinct bridge + waitlist** (the essay's closing CTA made real).

"Run it on MY business" ships in Phase 2 (see [04-phases](04-phases.md)) behind the waitlist,
where the AI engine, evidence model, and workspace arrive together. The v1 UI *shows* that
door everywhere ("Your company here → join the first wave") without pretending it's open.

## Ruling 4 · The honesty engine is not a feature, it's the constitution

Inherited from Instinct's ADR-0009 and non-negotiable even in fiction:

- Every displayed claim carries a status: `fact` / `supported inference` / `assumption` /
  `hypothesis` / `recommendation` — rendered as the same lifecycle chips the product uses.
- **No invented numbers, even fictional ones, without a source object** — example-company
  figures trace to their authored evidence packs, and the UI can always answer "where did
  this number come from?" with a click.
- The Strategy Run labels itself a simulation, visibly, throughout. Nothing on this site
  fakes a live AI. When real generation arrives in Phase 2, it arrives with the evidence
  and approval discipline the source plan §7 describes — not before.
- Kano hypotheses from conversation data are labeled hypotheses (source plan's rule — kept).
- Fictional companies only, forever. No real business is ever used as an example.

## Ruling 5 · Registry-driven from day one

Even though v1 is authored content, the seventeen frameworks are **data, not pages**: one
registry (schema in [02-architecture](02-architecture.md)) drives routes, graph nodes,
reads-from/writes-to indicators, motion recipe bindings, and Strategy Run membership. This
is the source plan's best architectural idea and it costs little in v1 — and it is what
makes Phase 2's engines pluggable instead of a rebuild.

## Ruling 6 · Naming and the Instinct bridge

Public name **The Strategy Stack**, byline **powered by Instinct**, tagline **"Business
frameworks, finally running."** The conversion message is the source plan's, verbatim law:
never "buy more framework reports" — always **"You ran the framework once. Instinct keeps it
running."** The About-Instinct page and every post-run handoff use the essay's line: *"AI is
the processor. Instinct is the compiler and runtime."*

## Ruling 7 · Quality bars (numbers, not adjectives)

- Lighthouse ≥ 95 performance / 100 accessibility on every route, mid-tier hardware.
- LCP < 2.0s on the homepage with the hero animation present.
- Full keyboard operability of every interactive; `prefers-reduced-motion` yields a complete,
  designed experience (crossfades + final states), never a broken one.
- One optional WebGL/canvas moment maximum in v1 (the homepage hero), with a static designed
  fallback. Everything else is SVG/CSS/Framer Motion.
- Every motion recipe states duration, easing, and trigger; nothing animates "by feel."
- The site works with JavaScript disabled to the level of: all lesson content readable, all
  diagrams visible in final state.

## Ruling 8 · What the source plan gets right (adopted as-is)

To be explicit about inheritance, these appendix sections are law-by-reference: the framework
groups and their inputs/outputs/feeds-into (§3), the Strategy Run sequences (§5), the
seven-section page pattern (§6, amended by Ruling 3's v1 scoping of sections 4–7), the
generation-engine contract for Phase 2 (§7), the example companies (§8), the learning
mechanics (§9 — prediction, consequence, event injection, compare-lenses, replay), the
framework registry concept (§12), the quality controls (§13), the free/paid/Instinct ladder
(§14), and the success metrics (§17).
