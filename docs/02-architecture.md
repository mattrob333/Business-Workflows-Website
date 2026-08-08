# 02 — Architecture

## Stack (v1)

- **Next.js 15** (App Router) + **TypeScript strict** — static export (`output: 'export'`)
  for v1; no server required until Phase 2.
- **Tailwind v4** bound to the design tokens (tokens are the single source; no raw hex in
  components — lint rule enforces).
- **Framer Motion** + **Lenis** (the only motion deps). **MDX** for lesson prose.
- Diagrams: hand-built **SVG components** (no chart libs). The Framework Graph: custom SVG
  force-free layout (hand-positioned nodes — 17 nodes don't need a physics engine; authored
  layout beats simulated layout for an award site).
- Optional single WebGL moment (homepage hero) — plain WebGL or OGL, ≤ 60KB, lazy, with
  designed static fallback. Nothing else may import it.
- Testing: **Playwright** (the walkthroughs below) + **vitest** for registry/lib logic.
  Deployment: Vercel (or any static host) — decided at ship time, nothing may assume one.

Phase 2 adds: Supabase (auth, state, evidence, RLS), the AI engine service (reuses
advisor-os patterns: typed outputs, evidence-gated claims, approval before state writes).
Nothing in v1 may preclude that — which is what the registry is for.

## The registry (the load-bearing decision)

`src/registry/` — one typed record per framework; everything renders from it:

```ts
interface Framework {
  id: FrameworkId;                     // 'bmc' | 'five-forces' | ...
  group: 'map'|'terrain'|'advantage'|'direction'|'customer'|'alignment'|'conductor'|'delegation';
  name: string; slug: string;
  coreQuestion: string;                // the one-sentence question it answers
  depth: 'full' | 'chapter';           // v1: six full, eleven chapter
  readsFrom: StateField[];             // typed state fields, not prose
  writesTo: StateField[];
  feedsInto: FrameworkId[];            // graph edges
  bestBefore: FrameworkId[];           // ordering guidance
  motionRecipe: string;                // binds to a recipe in 01-design-system §5
  runs: StrategyRunId[];               // memberships
  lesson: MDXRef;                      // the Learn section content
  example: ExampleBinding[];           // which example companies demo it
}
```

`StateField` is the shared-business-state vocabulary (segments, value props, capabilities,
forces, jobs, constraints, objectives, assignments… — the appendix §1D list, typed). In v1
the "state" is the authored example-company data flowing between pages; in Phase 2 the same
fields become the user workspace. **Frameworks never pass prose to each other — they pass
these fields** (the source plan's central principle, kept as a type constraint).

## Content model

- `src/content/frameworks/<id>/lesson.mdx` — the Learn section.
- `src/content/companies/<slug>/` — profile.ts (typed state), `evidence/*.ts` (evidence
  objects: id, source, date, type, excerpt, reliability), narrative.mdx.
- `src/content/runs/find-what-matters-now/` — the scripted Strategy Run: an ordered list of
  `RunStep`s ({framework, stateIn, interaction, stateOut, reveal copy, prediction prompt}).
  Deterministic: same walk, same story, every time.

## Routes (v1)

```
/                       the scrollytelling homepage (five acts, see 03-content-spec)
/frameworks             index — the Framework Graph, full-bleed, interactive
/frameworks/[slug]      17 pages (6 full, 11 chapter)
/examples/[slug]        3 company pages (profile, evidence pack, which frameworks to try)
/runs/find-what-matters-now   the flagship scripted run (act-based, resumable via URL step)
/graph                  the graph, expanded, with edge inspection
/about-instinct         the bridge: essay excerpts, product frames, waitlist
```

## Honesty engine (v1 implementation)

A tiny lib, used everywhere: `Claim { text, status, evidenceRefs[], date }` rendered only
through `StatusChip` + `EvidenceRef`. Build fails (lint) if a page renders a numeric literal
inside prose sections without a `Claim` wrapper — crude but effective enforcement of Ruling 4.

## File structure

```
src/
  app/               routes (thin — everything composes from registry + content)
  registry/          frameworks.ts, runs.ts, state-fields.ts
  content/           mdx + typed company/evidence/run data
  components/        the 01-design-system §6 set + diagram components per framework
  motion/            the recipe implementations (one file per recipe name)
  lib/               claim/evidence, scroll-act orchestration, reduced-motion utils
public/fonts, grain  self-hosted Newsreader/Plex Mono/Inter (no external font requests)
```
