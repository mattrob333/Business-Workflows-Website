# 01 — Design system

The named mood: **“The Observatory”** — a dark, warm instrument room where a business is on
the table and the frameworks are the instruments reading it. Depth and atmosphere from kage;
recipe discipline from Skills; semantic color from Instinct. Everything below is a spec, not
a suggestion. If a needed effect has no recipe here, add the recipe first (PR to this doc),
then build it.

## 1 · Tokens

```css
:root {
  /* Atmosphere (warm near-black — Instinct's charcoal family, deepened for marketing) */
  --void:      #0E0E0D;   /* page canvas */
  --paper:     #151514;   /* section grounds */
  --surface:   #1D1D1B;   /* cards, panels */
  --raised:    #262624;   /* elevated panels, hover grounds */
  --line:      #2F2F2C;   /* hairlines */
  --line-strong:#43423C;

  /* Text */
  --ink:       #ECEBE6;   /* primary */
  --muted:     #A6A49B;
  --faint:     #73726B;

  /* SEMANTIC COLOR — the grammar. Meaning is exclusive; never decorative. */
  --constraint:      #E8A845;  /* amber. THE constraint, and nothing else. Ever. */
  --constraint-soft: #2C2314;
  --evidence:        #4CBD86;  /* green. confirmed/verified/supported. */
  --evidence-soft:   #17271E;
  --flow:            #8FA5E8;  /* periwinkle. data movement, connections, links, active. */
  --flow-deep:       #5F76C4;  /* darker stop for flow gradients */
  --contradiction:   #DE705C;  /* red. contradictions & risk. rare by design. */
  --contradiction-soft:#2C1915;

  --shadow: 0 1px 2px rgba(0,0,0,.45), 0 12px 40px rgba(0,0,0,.55);
}
```

Light mode: **none in v1.** The Observatory is a committed dark experience (kage precedent).
The product console has themes; the marketing site has a mood. Revisit post-v1 only.

**The amber law**: amber appears when and only when the content is the binding constraint —
the ToC pages, the constraint moment of the Strategy Run, the bottleneck stage of a flow
diagram. An agent putting amber on a button, a highlight, or a decoration has broken the
build. This single restraint is the site's visual thesis: when you see amber, you've found
what matters.

## 2 · Depth model (the kage collage)

Every major section composes three layers:

1. **Atmosphere** (z-0): mesh-gradient fields built ONLY from `--flow-deep`, `--constraint`
   (constraint sections only), and warm neutrals at 4–10% opacity over `--void`, plus a
   static film-grain overlay (tiling PNG or SVG turbulence, `opacity: .04`, `mix-blend:
   overlay`). Gradients drift at ≤ 8px amplitude over ≥ 20s — felt, not seen. Recipe name:
   `atmo/mesh-drift`.
2. **Data layer** (z-10): the framework diagrams — SVG, stroke-first (1.5px lines in
   `--line-strong`→`--flow` when active), glass panels (`background: rgba(29,29,27,.66);
   backdrop-filter: blur(14px); border: 1px solid var(--line)`). Recipe: `panel/glass`.
3. **Editorial layer** (z-20): display type overlapping the data layer by design (negative
   margins), generous whitespace, thin mono kickers above headlines.

## 3 · Typography — three voices

| Voice | Face | Usage | Spec |
|---|---|---|---|
| **Narrative** | `Newsreader` (variable, Google) — italic axis used | Display headlines, pull quotes, act titles | 40–96px fluid (`clamp`), weight 400–500, tight leading (1.05), occasional italic word for emphasis |
| **System** | `IBM Plex Mono` | Kickers, labels, scores, statuses, evidence refs, graph node names | 11–13px, uppercase kickers with `letter-spacing: .14em`, tabular numbers |
| **Teaching** | `Inter` (variable) | Body, lessons, UI | 16–18px body, 1.6 leading, max 68ch |

Signature move (`type/serif-over-data`): a large Newsreader headline overlaps the top of a
glass data panel by ~0.5em. Used at most once per screenful.

## 4 · Motion language

Foundation: **Lenis** smooth scroll + **Framer Motion**. Only four legal meanings, one shared
easing vocabulary:

| Meaning | Recipe name | Spec |
|---|---|---|
| Data enters the system | `motion/ingest` | Element fades/rises 12px, `[0.16, 1, 0.3, 1]` (expo-out), 600ms, stagger 60ms per item |
| State changes | `motion/state` | Color/border crossfade 300ms + a single 1.02 scale pulse 250ms; chips flip with a 180° rotateX 400ms |
| A framework transforms information | `motion/transform` | Input elements travel along SVG paths (stroke-dashoffset draw 800ms) into an output slot; the output lands with `motion/ingest` |
| Work/attention moves elsewhere | `motion/route` | A 6px `--flow` dot travels the connecting path, 900ms, easing linear; the destination panel lifts (shadow + 2px rise) |

Scroll choreography (`motion/acts`): the homepage and Strategy Run are divided into named
acts; each act pins (`position: sticky`) for 1.5–2.5 viewport heights while its diagram
performs, then releases. Copy kage: chapter markers in the margin (mono, small), section
fade+blur transitions (`filter: blur(8px)→0` over the handoff).

**Reduced motion** (`@media (prefers-reduced-motion)`): every recipe has a defined static
terminal state + 200ms opacity crossfades. Acts un-pin and read as a normal document. This
is designed, not disabled — reviewers check it like a second theme.

## 5 · Per-framework motion recipes (v1's six, full spec)

- **BMC — `fw/bmc-assemble`**: nine empty cells drawn as stroke rectangles; as the narrative
  introduces each block, its card `motion/ingest`s into place; then connection lines draw
  between related cells (`motion/transform` paths: segment→VP→channel→revenue). Weak claims
  render with `--faint` dashed borders; confirmed with `--evidence` left bar; a contradiction
  pulses `--contradiction` once. Final state: the canvas breathing as one connected organism
  (paths shimmer subtly with a 12s `--flow` gradient sweep).
- **Five Forces — `fw/forces-gauges`**: the company as a glass panel center; five arrows
  as tapered SVG wedges pointing inward, length+opacity bound to force score (0–10). Scrubbing
  an assumption slider re-tweens lengths (500ms spring, `stiffness 120, damping 20`). PESTLE
  variant: slow orbiting weather glyphs at the perimeter (`atmo` layer, 40s orbit).
- **VRIO — `fw/vrio-gates`**: capabilities as mono-labeled tokens queued left; four gates as
  vertical light-lines (V·R·I·O). Each token travels `motion/route` through gates; passing a
  gate = gate flashes `--evidence`; failing = token drops with gravity ease into its
  category shelf below (parity / temporary / uncaptured / sustained). Sustained tokens dock
  right with a soft `--evidence` glow. Click any token: evidence popover.
- **SWOT/TOWS — `fw/tows-cross`**: four quadrant stacks; on scroll, S-cards and O-cards
  physically slide toward each other and *cross* — at the intersection a new strategy-option
  card is minted (`motion/transform`), stamped SO/ST/WO/WT in mono. The mint moment is the
  teaching moment: SWOT gathers, TOWS generates.
- **Theory of Constraints — `fw/toc-flow`**: the business as a horizontal pipe of stages;
  throughput as a continuous particle stream (`--flow` dots, density = volume). The
  constrained stage: pipe narrows, particles queue and back up, and the stage alone wears
  `--constraint` — the page's only amber. Intervention buttons re-simulate: improving a
  non-constraint visibly does nothing to downstream flow (the lesson, animated). 
- **RACI — `fw/raci-route`**: a work packet (glass card) travels a routing diagram between
  human and agent nodes; at an approval checkpoint the packet *stops*, a mono `AWAITING
  HUMAN JUDGMENT` chip appears, the human node pulses, then signs (a stroke-drawn signature
  flourish, 600ms) and the packet continues. Agents render as square nodes, humans as round —
  accountability is always a round node.

Remaining eleven (chapter-card depth in v1): one-line motion concepts per the appendix §10
table; full recipes authored when each is promoted in later phases.

## 6 · Components (build once, reuse everywhere)

`StatusChip` (the five honesty states — exact product grammar), `EvidenceRef` (mono chip
`ev_103` → popover with source/date/excerpt), `Kicker`, `ActMarker`, `GlassPanel`,
`GraphNode`/`GraphEdge`, `PredictionPrompt` (challenge-mode widget), `LensSwitch`
(compare-lenses tabs), `ConstraintBadge` (the only amber component), `WaitlistBar`.

## 7 · Art direction guardrails

No stock imagery, no 3D character mascots, no emoji in UI, no confetti. Iconography is
stroke-only, 1.5px, from one custom set. Screenshots of Instinct appear only in the bridge
section, framed in `panel/glass`. Every page ends with the same quiet mono footer line:
`THE STRATEGY STACK · POWERED BY INSTINCT · BUSINESS FRAMEWORKS, FINALLY RUNNING.`
