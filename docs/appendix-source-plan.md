# Appendix — The source product plan

> Status: **reference material, not authority.** This is the original detailed plan
> (authored externally, 2026-08) that the LAW harmonizes. Sections adopted law-by-reference
> are listed in `00-LAW` Ruling 8. Where anything here conflicts with `00-LAW` or
> `01-design-system` — notably §10's palette and the single-timeline scope — **the LAW
> wins.** Preserved verbatim below.

---

# The Strategy Stack by Instinct

Product and build blueprint

## Core idea

This should not feel like a website that happens to contain business-framework articles.

It should feel like a strategy simulator.

A user should be able to:

1. Learn a framework in plain language.
2. Watch it operate on an example company.
3. Run it on their own business.
4. Inspect the evidence and assumptions behind the output.
5. Feed that output into the next appropriate framework.
6. Combine several frameworks into a guided strategic analysis.
7. Save the resulting company model as structured business state.
8. Upgrade to Instinct when they want the system connected to live data and continuously running.

The central promise:

> Learn the frameworks. Run them on your business. Connect them into a system.

The public product could be called: **The Strategy Stack — Powered by Instinct.**
Tagline: *Business frameworks, finally running.*

## 1. What the site actually is

Four connected products: **A. The Library** (definitive framework pages: what question it
answers, when to use / not use, required information, how it works, what good output looks
like, what comes before and after). **B. The Lab** (interactive builder per page: fictional
company, own context, evidence upload, guided questions, generate, edit and challenge, save
to workspace). **C. Strategy Runs** (guided framework combinations organized by business
problem — the user selects a problem, the site builds the sequence). **D. The Company
Workspace** (persistent structured business state: profile, segments, value props, products,
revenue, capabilities, resources, competitors, forces, jobs, assumptions, risks, options,
metrics, current constraint, objectives, work assignments, evidence). The BMC is the initial
save file.

## 2. Product architecture

Shared-state model, not disconnected AI chats: EVIDENCE → SHARED BUSINESS STATE → FRAMEWORK
ENGINES (Map / Terrain / Advantage / Customer / Direction / Alignment / Performance) →
FINDINGS AND OPTIONS → THEORY OF CONSTRAINTS (what matters most right now) → OBJECTIVES AND
ACTIONS → RACI AND DELEGATION → EXECUTION RESULTS → UPDATE BUSINESS STATE ↺.

Key principle: **frameworks do not pass paragraphs to each other; they write typed
information into a shared business model.** VRIO writes resource, capability, V/R/I/O
scores, evidence, confidence, implication — Ansoff reads those fields.

## 3. Framework groups (inputs / outputs / feeds-into)

**Group 1 — Map: Business Model Canvas.** Q: what is this business and how does it create,
deliver, capture value? Inputs: segments, value propositions, channels, relationships,
revenue streams, key resources, key activities, key partners, cost structure. Outputs:
structured model, ambiguities and contradictions, missing information, dependencies, risks,
core assumptions. Feeds: Five Forces, VRIO, SWOT, JTBD, VPC, TOC, 7S. Visualization: nine
boxes assemble; connections appear (segment→VP, VP→channel, revenue→segment, activity→
resource, resource→cost, partner→activity); weak connections glow amber, contradictions red,
confirmed evidence green. *(LAW note: the site's amber rule reassigns amber to constraint
only; weak/unsupported renders as faint-dashed instead.)*

**Group 2 — Terrain: Five Forces.** Q: where does power sit, what pressures determine
profitability? Inputs: competitors, market growth, customer concentration, supplier
concentration, switching costs, substitutes, capital requirements, differentiation,
regulatory barriers, pricing pressure. Outputs: five force scores, primary economic
pressure, implications, evidence and confidence. Feeds: SWOT O/T, TOWS, Ansoff, Blue Ocean,
pricing, TOC. **PESTLE.** Q: which large external forces may materially affect the company?
Inputs: political, economic, social, technological, legal, environmental. Outputs: signals
with likelihood, impact, horizon, direction, affected components, early-warning indicators.
Feeds: Five Forces, SWOT, Ansoff, Three Horizons, risk, BSC. Visualization: company center,
PESTLE as weather systems, forces as pressure arrows; users change assumptions and watch
scores move.

**Group 3 — Advantage: SWOT** (inputs: capabilities, resources, performance, market signals,
competitors, customer evidence, weaknesses; outputs: S/W/O/T with evidence strength,
importance, controllability) → **TOWS** (crossing quadrants → SO/ST/WO/WT strategies, ranked
options, assumptions, risks; feeds Ansoff, Blue Ocean, Three Horizons, OKRs, TOC). SWOT
collects; TOWS generates. **VRIO.** Q: which resources are genuine advantages? Inputs: key
resources/activities from BMC, skills, data, processes, relationships, IP, brand,
distribution, competitor comparisons. Outputs: V/R/I/O assessments → parity / temporary /
potential / sustained classifications, capability gaps. Feeds: SWOT S/W, TOWS, Ansoff, Blue
Ocean, investment, positioning. Visualization: capabilities pass four illuminated gates;
failures fall into category shelves; click any score to inspect or challenge.

**Group 4 — Direction: Ansoff** (existing/new products × existing/new markets; inputs
include VRIO advantages, forces, customer evidence, risk tolerance; outputs: options per
quadrant with relative risk, required capabilities, assumptions, upside). **Three Horizons**
(H1 core / H2 scaling / H3 options; portfolio starvation warning; outputs: initiatives per
horizon, allocation gaps, imbalance, time-phased roadmap). **Blue Ocean / ERRC** (eliminate,
reduce, raise, create; outputs: new value curve, candidate position, cost/value
implications). Visualizations: navigable 2×2 route; draggable allocation timeline (budget
slider shows what gets starved); live value curves redrawing.

**Group 5 — Customer: JTBD** (progress in a circumstance; inputs: interviews, sales calls,
tickets, churn reasons, triggers, workarounds, outcomes, emotional/social context; outputs:
functional/emotional/social jobs, circumstances, outcomes, alternatives, hiring criteria,
evidence excerpts, frequency and importance). **Value Proposition Canvas** (jobs/pains/gains
× products/relievers/creators; outputs: supported and unsupported jobs, relieved and
unaddressed pains, irrelevant features, fit score, messaging opportunities). **Kano**
(must-be / performance / delighters / indifferent / reverse, segment differences).
Enforced rule: transcript analysis can suggest Kano classifications but they are labeled
hypotheses until survey-structured evidence supports them. Visualizations: journey replay
(circumstance→struggle→search→choice→use→outcome, quotes on click); VPC heat map; Kano
satisfaction curves with draggable features.

**Group 6 — Alignment: McKinsey 7S** (strategy, structure, systems, shared values, skills,
style, staff; outputs: current vs required scores, gaps, blockers, risks, changes; network
visualization — pulling one node reveals tension in others). **Balanced Scorecard**
(financial / customer / internal / learning objectives and measures, cause-effect, leading
and lagging; must be written by live systems or it decays). **OKRs** (objectives, key
results, owners, baselines, targets, dependencies, cadence, confidence; tree growing from
strategy → scorecard objective → team objective → KRs → initiatives → work).

**Group 7 — Conductor: Theory of Constraints.** Q: what currently limits throughput of the
whole system? Inputs: model dependencies, financials, demand, pipeline, capacity, delivery,
backlog, org gaps, initiatives, process performance. Outputs: current dominant constraint,
type, evidence, confidence, exploit actions, subordination actions, elevation options,
leading indicators, constraint-moved conditions. Sits above the other frameworks as the
prioritization layer. Visualization: flow system (demand→sales→onboarding→delivery→billing→
retention), throughput pulses, constrained stage brightens/narrows/backs up; intervention
simulation shows whether total throughput moves or only a local metric.

**Group 8 — Delegation: RACI.** Q: who or what performs each activity, who owns the outcome,
where must consultation/notification occur? Outputs: R (may be an agent), A (always a named
human), C (escalation path), I (audit trail), role conflicts, unowned tasks, excessive
approval chains. Instinct extends RACI with capability boundaries, allowed tools/systems,
data-access scope, spending limits, approval thresholds, segregation of duties, credential
policies, revocation, attestation. Visualization: work packets routing through a mixed
workforce; packets stop at human checkpoints (task, R, A, C, I, approval required,
capability limit).

## 4. The Framework Graph

Not a rigid sequence — a graph. PESTLE ↓; BMC → Five Forces → SWOT → TOWS → Ansoff → Three
Horizons; BMC → VRIO → (TOWS, Ansoff); BMC → JTBD → VPC → Kano; VPC+Ansoff → Blue Ocean;
strategy choices → 7S → BSC → OKRs; ALL FINDINGS → TOC → RACI → execution → updated
scorecard → re-run. Shared business state resolves parallelism and ordering.

## 5. Strategy Runs

**Run 1 · Validate a business idea** (pre-launch): BMC → JTBD → VPC → Five Forces → VRIO.
Do not lead with 7S/BSC/RACI. **Run 2 · Find product-market fit**: JTBD → VPC → Kano → BMC
refresh → TOC. **Run 3 · Choose a growth path**: BMC → Five Forces + PESTLE → VRIO →
SWOT/TOWS → Ansoff → Three Horizons. **Run 4 · Enter a new market**: PESTLE → Five Forces →
Ansoff → JTBD → VPC → VRIO. **Run 5 · Reposition a company**: Five Forces → JTBD → VPC →
VRIO → Blue Ocean → TOWS. **Run 6 · Build a product roadmap**: JTBD → VPC → Kano → TOC →
OKRs → RACI. **Run 7 · Fix stalled growth**: BMC refresh → BSC → TOC → branch by constraint
(demand: Five Forces/JTBD; delivery: 7S/process; decision: RACI; product: VPC/Kano;
capability: VRIO/7S). **Run 8 · Align an organization**: strategic choice → 7S → BSC → OKRs
→ RACI → TOC. **Run 9 · Prepare for AI agents**: BMC key activities → 7S → TOC → RACI →
capability boundaries → attestation (the bridge to Instinct's governance layer).

## 6. The framework page pattern

Seven sections: (1) animated explanation — teach, not decorate; (2) Learn — plain language,
when/when-not, mistakes, strong results, position in the stack, READS FROM / WRITES TO /
BEST NEXT indicator; (3) explore an example — change inputs, predict, run, compare, inspect;
(4) run it on my business — Quick Run (guided interview) / Evidence Run (site, documents,
notes, financials, sales, support, research) / Workspace Run (pre-filled from state, asks
only gaps); (5) review — never one polished unquestionable answer; every finding carries
status (fact / supported inference / assumption / hypothesis / recommendation / decision),
evidence, source, confidence, contradictions, date, logic, approval state; user can accept,
edit, reject, challenge, add evidence, mark unknown, ask why, ask what would change the
conclusion; (6) handoff — "what this analysis unlocked" + one-click next framework with
outputs preloaded; (7) save/export/share — web report, image, PDF, slide, Markdown, JSON,
private-by-default share links.

## 7. The generation engine (Phase 2+)

(1) Establish the decision first ("what decision are you trying to make?"). (2) Company
context captured once, reused by every framework. (3) Evidence ingestion — every document
becomes an evidence object (source, author, date, type, excerpts, access, reliability,
relevance). (4) Adaptive questions — inspect known state, ask only gaps (e.g., "six major
customers but no concentration figure — roughly what share is your top five?"). (5)
Structured draft — typed findings with evidence refs, confidence, status; assumptions;
contradictions; state updates; recommended next frameworks. (6) Evaluation pass — evidence
per conclusion, no invented unknowns, correct framework application, conflicts
acknowledged, specificity, calibrated confidence. (7) User approves state updates — the
framework never silently rewrites the company model.

## 8. Example companies

**Beacon Mechanical** (regional commercial HVAC; revenue growing, completed work flat; BMC,
Five Forces, TOC, 7S, RACI; evidence: customer concentration, technician utilization,
dispatch data, complaints, org chart, supplier contracts). **RelayDesk** (B2B SaaS; strong
acquisition, weak retention; JTBD, VPC, Kano, TOC; churn interviews, product analytics,
tickets, roadmap requests, pricing). **Hearth & Pine** (DTC home goods; rising CAC,
commoditization; Five Forces, Blue Ocean, JTBD, VRIO). **Northstar Clinics** (multi-location
healthcare; inconsistent operations post-acquisition; 7S, BSC, OKRs, RACI). **Lantern AI**
(enterprise AI startup choosing markets; BMC, Five Forces, VRIO, Ansoff, Three Horizons).
**Atlas Industrial Supply** (regional distributor; supplier power and margin compression;
Five Forces, PESTLE, TOWS, Blue Ocean, TOC).

## 9. Interactive learning mechanics

**Challenge mode** — predict before reveal. **Consequence mode** — choose an action, the
simulator responds ("demand is not the constraint; more sales creates a larger delivery
backlog"). **Event injection** — competitor raises capital, supplier consolidates, new
regulation, segment contracts, substitute launches, key employee leaves, demand doubles —
then: which frameworks re-run? **Compare lenses** — one fact ("42% of revenue from three
customers") through Five Forces (buyer power), SWOT (weakness+threat), BMC (concentration),
TOC (not necessarily the constraint). **Strategy replay** — a timeline of how the constraint
moved (Jan demand → Mar conversion → May implementation → Aug onboarding).

## 10. Visual design direction *(OVERRULED by 00-LAW Ruling 2 and 01-design-system — kept for the motion table)*

Original: near-black, charcoal panels, spring green active state, electric cyan data
movement, amber unresolved assumptions, red contradictions; monospace for system voice,
sans for lessons. Motion language (adopted): every animation communicates one of — data
entered, state changed, framework transformed information, work moved. Framework motion
concepts (adopted as raw material for recipes): BMC cells assemble and connect; Five Forces
pressure arrows expand/contract; PESTLE signals orbit; SWOT/TOWS cards cross to mint
options; VRIO gates; Ansoff route traces; Three Horizons resources move across time; Blue
Ocean curves redraw; JTBD struggle timeline; VPC matches/gaps illuminate; Kano curves react;
7S tension network; BSC causal arrows; OKR tree grows; TOC flow backs up behind the
bottleneck; RACI work routes to humans and agents. All motion honors reduced-motion.

## 11. Site structure

`/frameworks/{17 slugs}`, `/strategy-runs/{8 slugs}`, `/examples/{6 slugs}`, `/graph`,
`/learn`, `/compare`, `/workspace`, `/reports`, `/about-instinct`. Homepage: hero shows the
Framework Graph running; actions: run a framework / choose a business problem / learn with
an example company; then system map, problem selection, featured interactives, example lab,
connected-outputs explanation, Instinct bridge.

## 12. Technical structure

Frontend: Next.js, TypeScript, shadcn-based components, Tailwind, custom SVG diagrams,
Framer Motion, React Flow or custom graph, MDX. Backend: Supabase auth, Postgres state,
evidence storage, RLS, vector search, version history, event records. Engine contract per
framework: validate inputs → identify missing → adaptive questions → retrieve evidence →
analyze → typed output → evaluate → approval → write state → recommend next. **Framework
registry** (adopted): ID, group, core question, lesson, inputs, evidence types, question
generator, rubric, output schema, visualization component, state read/written, next
frameworks, run membership.

## 13. Quality controls

Never convert unknown to fact; never invent financial/market data; separate evidence from
inference; show score reasoning; preserve lineage; record contradictions; allow challenge;
version every run; show diffs between runs; approval before shared-state updates;
confidence as range or qualitative, never fake statistics; human review for consequential
recommendations. **Multi-stakeholder mode**: several executives answer independently;
show consensus/alignment score (potentially the most valuable feature — it exposes where
the organization does not share one model of the business).

## 14. Free vs paid vs Instinct

Free: learn everything, run examples, single frameworks, limited run, basic profile,
export/share, manual refresh. Paid workspace: multiple companies, uploads, more evidence,
full runs, collaboration, version comparison, custom reports, private sharing, deeper
analysis. Instinct: live connections, continuously updated state, continuous monitoring,
change detection, dynamic constraint identification, work routing, human+agent delegation,
capability boundaries, approvals, attestation, enterprise governance. Conversion message:
**"You ran the framework once. Instinct keeps it running."**

## 15–16. Build sequence and first public version

Phase order (harmonized into 04-phases): system first (brand, graph, shared profile,
evidence model, registry, run schema, workspace, example format — never seventeen engines
before the shared-state contract); flagship diagnostic *Find What Matters Now* (BMC → Five
Forces + VRIO → SWOT/TOWS → TOC → RACI — the smallest version that proves the entire
Instinct thesis); then customer stack, growth stack, execution stack, continuous functions.
First public version: exceptional homepage; full graph; six lessons (BMC, Five Forces,
VRIO, SWOT/TOWS, TOC, RACI); three companies (Beacon, RelayDesk, Lantern); one complete
run; workspace; evidence-backed output; shareable reports; clear Instinct transition.

## 17. Success metrics

Interaction-start rate; lesson completion; example completion; example→own-company
switch rate; framework completion; multi-framework continuation; evidence upload rate;
AI-finding edit/reject rate; time to first useful insight; export rate; share rate;
workspace creation; Instinct click-through; return after a second business event; most
common recommended next framework; most common identified constraint. **North star: a
visitor completes one framework and immediately starts the next because the output made
the next question obvious.**

## Final product vision

The Strategy Stack begins as an educational interactive library → quietly becomes a company
model → the model becomes a diagnostic system → the system determines what matters now →
routes the work → Instinct keeps the loop running: OBSERVE → MODEL → DIAGNOSE → CHOOSE →
PRIORITIZE → DELEGATE → MEASURE → RE-DIAGNOSE ↺. The website's job is to let people see
that system run before they buy Instinct.
