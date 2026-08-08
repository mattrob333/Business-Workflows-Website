'use client';

/**
 * `/recipes` — the S0 acceptance surface.
 *
 * 04-phases S0, "done means": *a storybook-style recipe demo route renders every
 * recipe; reduced-motion parity verified.* This page is that route, and it is also the
 * build team's visual reference — the place an agent looks before asking "what does an
 * ingest feel like here?" So each entry states its spec (duration, easing, trigger) and
 * its reduced-motion terminal state next to the live thing, because team rule 2 says
 * specs beat vibes and a gallery that only shows the vibe teaches the wrong lesson.
 *
 * The six framework showpieces are presented **in scroll-act form** rather than as
 * static cards: pinning choreography that is only ever exercised on the homepage would
 * be choreography nobody can review. Scrub this page and you are reviewing S3 and S4's
 * mechanics a slice early.
 */

import { useState } from 'react';
import {
  ActMarker,
  ConstraintBadge,
  EvidenceRef,
  GlassPanel,
  GraphEdge,
  GraphNode,
  Kicker,
  LensSwitch,
  PredictionPrompt,
  StatusChip,
  WaitlistBar,
  CLAIM_STATUSES,
  MONO_LABEL,
  type ClaimStatus,
} from '@/components';
import { FOCUS_RING } from '@/components/styles';
import { LenisProvider, useReducedMotion } from '@/lib/motion-utils';
import { Act, Acts } from '@/motion/acts';
import { AtmoMeshDrift } from '@/motion/atmo-mesh-drift';
import { Grain } from '@/motion/grain';
import { PanelGlass } from '@/motion/panel-glass';
import { IngestGroup } from '@/motion/motion-ingest';
import { ChipFlip, ContradictionPulse, StateShift } from '@/motion/motion-state';
import { TransformFlow } from '@/motion/motion-transform';
import { RouteHandoff } from '@/motion/motion-route';
import { BmcAssemble } from '@/motion/fw-bmc-assemble';
import { ForcesGauges } from '@/motion/fw-forces-gauges';
import { VrioGates } from '@/motion/fw-vrio-gates';
import { TowsCross } from '@/motion/fw-tows-cross';
import { TocFlow } from '@/motion/fw-toc-flow';
import { RaciRoute } from '@/motion/fw-raci-route';
import {
  BMC_BLOCKS,
  BMC_CONTRADICTION,
  CAPABILITIES,
  COMPANY,
  CROSSINGS,
  EVIDENCE,
  FOOTER_LINE,
  FORCES,
  OPPORTUNITIES,
  RACI_NODES,
  STRENGTHS,
  THREATS,
  TOC_DEMAND,
  TOC_INTERVENTIONS,
  TOC_STAGES,
  WEAKNESSES,
} from './data';

/* ------------------------------------------------------------ page furniture */

function Section({
  id,
  index,
  kicker,
  title,
  lede,
  children,
}: {
  id: string;
  index: string;
  kicker: string;
  title: React.ReactNode;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <Kicker index={index} variant="rule">
        {kicker}
      </Kicker>
      <h2
        className="font-narrative mt-5 text-[clamp(30px,4.4vw,52px)] leading-[1.06] text-balance"
        style={{ color: 'var(--ink)' }}
      >
        {title}
      </h2>
      {lede ? (
        <p
          className="mt-4 max-w-[62ch] text-[16px] leading-[1.6]"
          style={{ color: 'var(--muted)' }}
        >
          {lede}
        </p>
      ) : null}
      <div className="mt-12 grid gap-12">{children}</div>
    </section>
  );
}

/**
 * A recipe entry: the live thing, plus the contract it is held to. The spec rail is not
 * decoration — it is the artefact a reviewer checks the implementation against.
 */
function RecipeBlock({
  testId,
  name,
  what,
  spec,
  reducedState,
  children,
  wide = false,
}: {
  testId: string;
  name: string;
  what: string;
  spec: string;
  reducedState: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <article
      data-testid={testId}
      className={`grid gap-6 ${wide ? '' : 'lg:grid-cols-[minmax(0,1fr)_minmax(210px,260px)]'}`}
    >
      <div className={wide ? 'order-2' : ''}>{children}</div>
      <aside
        className={`${wide ? 'order-1' : ''} self-start rounded-md border p-4`}
        style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--paper) 70%, transparent)' }}
      >
        <div className="font-system text-[12px]" style={{ color: 'var(--flow)' }}>
          {name}
        </div>
        <p className="mt-2 text-[13px] leading-snug" style={{ color: 'var(--ink)' }}>
          {what}
        </p>
        <dl className="mt-3 grid gap-2">
          <div>
            <dt className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
              spec
            </dt>
            <dd className="mt-[3px] text-[12px] leading-snug" style={{ color: 'var(--muted)' }}>
              {spec}
            </dd>
          </div>
          <div>
            <dt className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
              reduced motion
            </dt>
            <dd className="mt-[3px] text-[12px] leading-snug" style={{ color: 'var(--muted)' }}>
              {reducedState}
            </dd>
          </div>
        </dl>
      </aside>
    </article>
  );
}

function DemoFrame({
  children,
  className = '',
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg p-5 sm:p-6 ${className}`}
      style={{
        border: '1px solid var(--line)',
        background: 'color-mix(in srgb, var(--paper) 80%, transparent)',
      }}
    >
      {label ? (
        <div className={`${MONO_LABEL} mb-4 text-[9px]`} style={{ color: 'var(--faint)' }}>
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function ComponentCard({
  testId,
  name,
  note,
  children,
}: {
  testId: string;
  name: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-testid={testId}
      className="flex flex-col rounded-lg border p-5"
      style={{
        borderColor: 'var(--line)',
        background: 'color-mix(in srgb, var(--surface) 48%, transparent)',
      }}
    >
      <div className="font-system text-[11px]" style={{ color: 'var(--ink)' }}>
        {name}
      </div>
      <p className="mt-1 mb-4 text-[12px] leading-snug" style={{ color: 'var(--faint)' }}>
        {note}
      </p>
      <div className="mt-auto">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------- small demos */

/** motion/state needs a state to change; this is the smallest honest way to show it. */
function StateDemo() {
  const [index, setIndex] = useState(0);
  const status = CLAIM_STATUSES[index % CLAIM_STATUSES.length] ?? 'fact';
  const isContradiction = index % CLAIM_STATUSES.length === 4;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <StateShift
        state={status}
        borderColor={
          status === 'fact' || status === 'supported-inference'
            ? 'color-mix(in srgb, var(--evidence) 45%, transparent)'
            : 'var(--line-strong)'
        }
        className="rounded-md border px-4 py-3"
        style={{ borderWidth: 1, borderStyle: 'solid' }}
      >
        <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          claim status
        </div>
        <div className="mt-2">
          <ChipFlip flipKey={status}>
            <StatusChip status={status} form="long" />
          </ChipFlip>
        </div>
      </StateShift>

      <ContradictionPulse
        active={isContradiction}
        className="rounded-md px-4 py-3 text-[13px]"
        style={{
          border: '1px solid color-mix(in srgb, var(--contradiction) 45%, transparent)',
          background: 'var(--contradiction-soft)',
          color: 'var(--ink)',
        }}
      >
        contradiction pulse — fires once
      </ContradictionPulse>

      <button
        type="button"
        onClick={() => setIndex((i) => i + 1)}
        className={`${MONO_LABEL} ${FOCUS_RING} rounded-md border px-4 py-2 text-[10px]`}
        style={{
          color: 'var(--ink)',
          borderColor: 'color-mix(in srgb, var(--flow) 50%, transparent)',
          background: 'color-mix(in srgb, var(--flow-deep) 18%, transparent)',
        }}
      >
        advance the state
      </button>
    </div>
  );
}

function GraphPrimitives() {
  return (
    <svg viewBox="0 0 320 120" className="w-full" role="img" aria-label="Graph primitives">
      <GraphEdge from={{ x: 54, y: 46 }} to={{ x: 160, y: 46 }} tone="active" route />
      <GraphEdge from={{ x: 186, y: 46 }} to={{ x: 266, y: 46 }} tone="idle" dashed />
      <GraphNode x={40} y={46} size={18} label="human" kind="human" state="done" badge="A" />
      <GraphNode x={160} y={46} size={18} label="agent" kind="agent" state="active" badge="R" />
      <GraphNode x={280} y={46} size={18} label="framework" kind="framework" state="idle" badge="V" />
    </svg>
  );
}

/* -------------------------------------------------------------------- acts */

const ACTS = [
  { id: 'bmc', title: 'the map' },
  { id: 'forces', title: 'the terrain' },
  { id: 'vrio', title: 'the advantage' },
  { id: 'tows', title: 'the options' },
  { id: 'toc', title: 'the constraint' },
  { id: 'raci', title: 'the handoff' },
];

function ActHead({
  kicker,
  title,
  note,
}: {
  kicker: string;
  title: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="mb-6 max-w-[58ch]">
      <Kicker>{kicker}</Kicker>
      <h3
        className="font-narrative mt-3 text-[clamp(24px,3.2vw,38px)] leading-[1.08] text-balance"
        style={{ color: 'var(--ink)' }}
      >
        {title}
      </h3>
      {note ? (
        <p className="mt-2 text-[14px] leading-relaxed" style={{ color: 'var(--muted)' }}>
          {note}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------- page */

export default function RecipesPage() {
  const reduced = useReducedMotion();

  return (
    <LenisProvider>
      {/*
        With JavaScript off, Framer's initial variants would leave scroll-triggered
        content at opacity 0. 00-LAW Ruling 7 requires diagrams to be readable in their
        final state without JS, so the no-JS path force-resolves them.
      */}
      <noscript>
        <style>{`[data-recipe],[data-recipe] *{opacity:1!important;transform:none!important;filter:none!important}`}</style>
      </noscript>

      <main data-testid="recipes-root" className="relative">
        {/* ------------------------------------------------------------- hero */}
        <header className="relative flex min-h-[92vh] items-center overflow-hidden">
          <AtmoMeshDrift seed={3} count={5} intensity={0.09} />
          <Grain />
          <div className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
            <Kicker index="S0" variant="rule">
              recipe gallery · the observatory
            </Kicker>

            <h1
              className="font-narrative mt-7 max-w-[18ch] text-[clamp(44px,8vw,96px)] leading-[1.02] text-balance"
              style={{ color: 'var(--ink)' }}
            >
              Every effect on this site is a{' '}
              <em className="italic" style={{ color: 'var(--flow)' }}>
                named
              </em>{' '}
              recipe.
            </h1>

            {/* type/serif-over-data: the headline overlaps the panel by ~0.5em. */}
            <div className="relative mt-[-0.4em] max-w-3xl pt-16">
              <GlassPanel pad="lg" overhang elevated eyebrow="the contract">
                <p className="max-w-[62ch] text-[16px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
                  Fourteen recipes and eleven components, each with a stated duration,
                  easing and trigger — and each with a designed reduced-motion terminal
                  state, checked like a second theme. If an effect is not on this page,
                  it does not ship.
                </p>
                <div
                  className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4"
                  style={{ borderColor: 'var(--line)' }}
                >
                  {[
                    ['easing', 'cubic-bezier(.16,1,.3,1)'],
                    ['ingest', '600ms · 60ms stagger'],
                    ['route', '900ms · linear'],
                    ['reduced', '200ms crossfade'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                        {k}
                      </div>
                      <div className="font-system mt-1 text-[11px]" style={{ color: 'var(--ink)' }}>
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>

            <p
              className={`${MONO_LABEL} mt-8 text-[10px]`}
              style={{ color: reduced ? 'var(--evidence)' : 'var(--faint)' }}
            >
              {reduced
                ? 'reduced motion active · every recipe is showing its terminal state'
                : 'full motion · scroll to run the acts'}
            </p>
          </div>
        </header>

        {/* ------------------------------------------------------- atmosphere */}
        <Section
          id="atmosphere"
          index="01"
          kicker="depth model · 01 §2"
          title={
            <>
              Three layers, and the bottom one you are never meant to{' '}
              <em className="italic">notice</em>.
            </>
          }
          lede="Atmosphere, then the data layer, then editorial type overlapping it. The atmosphere carries no information at all — its whole job is to stop a near-black page from reading as a void."
        >
          <RecipeBlock
            testId="recipe-atmo-mesh-drift"
            name="atmo/mesh-drift"
            what="Mesh-gradient field over the page canvas."
            spec="Blobs from --flow-deep / --flow / warm neutrals at 4–10%. Drift ≤ 8px over ≥ 20s, symmetric ease, looping."
            reducedState="Blobs render at their rest position. No drift, identical field."
          >
            <DemoFrame className="min-h-[240px]" label="four blobs · seed 3 · deterministic">
              <div className="relative h-[200px] overflow-hidden rounded-md">
                <AtmoMeshDrift seed={11} count={4} intensity={0.1} />
                <div className="relative flex h-full items-end">
                  <p className="max-w-[40ch] text-[13px]" style={{ color: 'var(--muted)' }}>
                    Seeded, so the server and the client agree on where the light is.
                  </p>
                </div>
              </div>
            </DemoFrame>
          </RecipeBlock>

          <RecipeBlock
            testId="recipe-grain"
            name="atmo/grain"
            what="Static film grain over the whole composition."
            spec="Inline SVG feTurbulence, fractalNoise, desaturated. opacity .04, mix-blend-mode: overlay. No animation, ever."
            reducedState="Identical — grain is static by definition."
          >
            <DemoFrame label="grain off · grain on">
              <div className="grid gap-4 sm:grid-cols-2">
                <div
                  className="relative h-[150px] overflow-hidden rounded-md"
                  style={{ background: 'var(--raised)' }}
                >
                  <span
                    className={`${MONO_LABEL} absolute bottom-3 left-3 text-[9px]`}
                    style={{ color: 'var(--faint)' }}
                  >
                    flat
                  </span>
                </div>
                <div
                  className="relative h-[150px] overflow-hidden rounded-md"
                  style={{ background: 'var(--raised)' }}
                >
                  <Grain opacity={0.16} />
                  <span
                    className={`${MONO_LABEL} absolute bottom-3 left-3 text-[9px]`}
                    style={{ color: 'var(--faint)' }}
                  >
                    grain (shown at 4x for the eye)
                  </span>
                </div>
              </div>
            </DemoFrame>
          </RecipeBlock>

          <RecipeBlock
            testId="recipe-panel-glass"
            name="panel/glass"
            what="The data layer's surface."
            spec="--surface at 66%, backdrop-filter: blur(14px), 1px --line border. Lift = 2px rise + --shadow over 300ms."
            reducedState="Lift becomes a shadow crossfade; the panel does not travel."
          >
            <DemoFrame label="tone · border · lift">
              <div className="grid gap-4 sm:grid-cols-3">
                <PanelGlass className="p-4" tone="surface">
                  <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                    surface
                  </div>
                  <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>
                    the default panel
                  </p>
                </PanelGlass>
                <PanelGlass className="p-4" tone="raised" border="line-strong">
                  <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                    raised
                  </div>
                  <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>
                    hover ground
                  </p>
                </PanelGlass>
                <PanelGlass className="p-4" tone="raised" border="flow" lifted elevated>
                  <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--flow)' }}>
                    lifted
                  </div>
                  <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>
                    work just arrived
                  </p>
                </PanelGlass>
              </div>
            </DemoFrame>
          </RecipeBlock>
        </Section>

        {/* ----------------------------------------------------- four meanings */}
        <Section
          id="meanings"
          index="02"
          kicker="motion language · 01 §4"
          title={
            <>
              Four legal meanings. Anything else is <em className="italic">decoration</em>.
            </>
          }
          lede="Data enters. State changes. A framework transforms information. Work moves elsewhere. A visitor who watches this site for ninety seconds should be able to predict what a movement means before it finishes."
        >
          <RecipeBlock
            testId="recipe-motion-ingest"
            name="motion/ingest"
            what="Data enters the system."
            spec="Fade + 12px rise, cubic-bezier(.16,1,.3,1), 600ms, 60ms stagger per item. Trigger: in view, once."
            reducedState="Fade only, 200ms, no stagger, no travel."
          >
            <DemoFrame label="typed state fields arriving">
              <IngestGroup className="grid gap-2 sm:grid-cols-2">
                {[
                  'segments[]',
                  'value_props[]',
                  'capabilities[]',
                  'forces[]',
                  'constraints[]',
                  'assignments[]',
                ].map((field) => (
                  <div
                    key={field}
                    className="font-system rounded-md border px-3 py-2 text-[11px]"
                    style={{
                      borderColor: 'var(--line)',
                      background: 'color-mix(in srgb, var(--surface) 60%, transparent)',
                      color: 'var(--muted)',
                    }}
                  >
                    {field}
                  </div>
                ))}
              </IngestGroup>
            </DemoFrame>
          </RecipeBlock>

          <RecipeBlock
            testId="recipe-motion-state"
            name="motion/state"
            what="A claim changes what it is."
            spec="Colour/border crossfade 300ms + one 1.02 scale pulse 250ms. Chips flip 180° rotateX over 400ms. Contradiction pulses once."
            reducedState="Colour crossfade kept (it carries the meaning); pulse and flip replaced by a 200ms opacity crossfade."
          >
            <DemoFrame label="press to advance through the five honesty states">
              <StateDemo />
            </DemoFrame>
          </RecipeBlock>

          <RecipeBlock
            testId="recipe-motion-transform"
            name="motion/transform"
            what="A framework turns inputs into a new field."
            spec="Paths draw via stroke-dashoffset, 800ms expo-out; travellers ride the path; the output slot lands with motion/ingest."
            reducedState="Paths render drawn, travellers rest at the output, slot crossfades in."
            wide
          >
            <DemoFrame label="frameworks pass fields, never prose">
              <TransformFlow
                inputs={[
                  { id: 'seg', label: 'segments[]' },
                  { id: 'cap', label: 'capabilities[]' },
                  { id: 'ev', label: 'evidence[]' },
                ]}
                output="constraints[]"
                operator="THEORY OF CONSTRAINTS"
              />
            </DemoFrame>
          </RecipeBlock>

          <RecipeBlock
            testId="recipe-motion-route"
            name="motion/route"
            what="Work moves to the next framework."
            spec="A 6px --flow dot travels the connecting path, 900ms, linear. The destination panel lifts 2px and gains --shadow on arrival."
            reducedState="Dot rests at the destination; the panel renders already lifted."
            wide
          >
            <DemoFrame label="the handoff that makes the next framework obvious">
              <RouteHandoff
                from={{ label: 'Five Forces', caption: 'wrote forces[] and pressure ranking' }}
                to={{ label: 'Theory of Constraints', caption: 'reads forces[], finds the binding stage' }}
                payload="forces[]"
              />
            </DemoFrame>
          </RecipeBlock>
        </Section>

        {/* ---------------------------------------------------------- components */}
        <Section
          id="components"
          index="03"
          kicker="component set · 01 §6"
          title={
            <>
              Eleven components, built once. The honesty engine has a{' '}
              <em className="italic">face</em>.
            </>
          }
          lede="Every claim on this site carries its epistemic status, and every number can answer where it came from. That is not a feature bolted on later — it is the constitution (Ruling 4), so it is the first thing the component set implements."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ComponentCard
              testId="component-status-chip"
              name="StatusChip"
              note="Five honesty states. Green is spent only on fact and supported inference; the rest are neutral. No amber, ever."
            >
              <div className="flex flex-wrap gap-2">
                {CLAIM_STATUSES.map((s: ClaimStatus) => (
                  <StatusChip key={s} status={s} />
                ))}
              </div>
            </ComponentCard>

            <ComponentCard
              testId="component-evidence-ref"
              name="EvidenceRef"
              note="Mono chip → a positioned dialog with source, date and excerpt. Escape closes; focus returns to the chip."
            >
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                Median booking-to-site time is 6.1 days{' '}
                <EvidenceRef evidence={EVIDENCE.ev_103} />, and renewals rarely go out to
                quote <EvidenceRef evidence={EVIDENCE.ev_141} />.
              </p>
            </ComponentCard>

            <ComponentCard
              testId="component-kicker"
              name="Kicker"
              note="The system voice above a narrative headline. 11px, uppercase, .14em."
            >
              <div className="grid gap-3">
                <Kicker index="04">act four</Kicker>
                <Kicker variant="rule" tone="flow">
                  with rule
                </Kicker>
              </div>
            </ComponentCard>

            <ComponentCard
              testId="component-act-marker"
              name="ActMarker"
              note="Chapter marker for the margin rail. Vertical by default; horizontal below xl."
            >
              <div className="flex items-start gap-8">
                <ActMarker index={3} total={6} title="the constraint" active />
                <ActMarker index={4} total={6} title="the handoff" orientation="horizontal" />
              </div>
            </ComponentCard>

            <ComponentCard
              testId="component-glass-panel"
              name="GlassPanel"
              note="panel/glass with a padding scale, a mono eyebrow, and the serif-over-data overhang."
            >
              <GlassPanel pad="sm" eyebrow="evidence pack" border="line-strong">
                <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
                  41 renewals · 4 certified techs
                </p>
              </GlassPanel>
            </ComponentCard>

            <ComponentCard
              testId="component-graph-node"
              name="GraphNode"
              note="Round = human, square = agent, hex = framework. State lives in the stroke, never the fill."
            >
              <GraphPrimitives />
            </ComponentCard>

            <ComponentCard
              testId="component-graph-edge"
              name="GraphEdge"
              note="A hairline with two hooks: draw (motion/transform) and route (motion/route). Dashed = provisional."
            >
              <svg viewBox="0 0 300 70" className="w-full" role="img" aria-label="Edge tones">
                <GraphEdge from={{ x: 12, y: 18 }} to={{ x: 288, y: 18 }} tone="active" route routeRepeat />
                <GraphEdge from={{ x: 12, y: 40 }} to={{ x: 288, y: 40 }} tone="evidence" curve={-14} />
                <GraphEdge from={{ x: 12, y: 62 }} to={{ x: 288, y: 62 }} tone="ghost" dashed />
              </svg>
            </ComponentCard>

            <ComponentCard
              testId="component-prediction-prompt"
              name="PredictionPrompt"
              note="Commit before the reveal. A real radio group: arrow keys move, Enter commits."
            >
              <PredictionPrompt
                question="Which stage do you think is holding Beacon back?"
                options={[
                  { id: 'intake', label: 'Intake', detail: 'the phones are busy' },
                  { id: 'certified', label: 'Certified work', detail: 'four people can do it' },
                  { id: 'invoice', label: 'Invoicing', detail: 'paperwork always is' },
                ]}
                correctId="certified"
              >
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Certified work caps the line at 22 jobs a week against 52 of demand{' '}
                  <EvidenceRef evidence={EVIDENCE.ev_155} />. Everything upstream simply
                  queues.
                </p>
              </PredictionPrompt>
            </ComponentCard>

            <ComponentCard
              testId="component-lens-switch"
              name="LensSwitch"
              note="Same company, different instrument. WAI-ARIA tabs; selection follows focus."
            >
              <LensSwitch
                lenses={[
                  {
                    id: 'vrio',
                    label: 'VRIO',
                    caption: 'what is durable?',
                    content: (
                      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                        The certified crew is valuable, rare and hard to imitate — and the
                        firm is not organised to exploit it.
                      </p>
                    ),
                  },
                  {
                    id: 'toc',
                    label: 'ToC',
                    caption: 'what limits us?',
                    content: (
                      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                        The same crew is the binding constraint. One lens calls it an
                        advantage; the other calls it the ceiling. Both are right.
                      </p>
                    ),
                  },
                ]}
              />
            </ComponentCard>

            <div data-amber-surface="gallery">
              <ComponentCard
                testId="component-constraint-badge"
                name="ConstraintBadge"
                note="THE amber component. Amber means the binding constraint and nothing else — this file and fw/toc-flow are the only two allowed to name the token."
              >
                <div className="flex flex-wrap items-center gap-3">
                  <ConstraintBadge subject="certified work" />
                  <ConstraintBadge label="constraint" size="sm" variant="outline" />
                </div>
              </ComponentCard>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <ComponentCard
                testId="component-waitlist-bar"
                name="WaitlistBar"
                note="With no action configured it says so, plainly, and refuses to pretend it captured anything. The honesty engine applies to our own UI too."
              >
                <WaitlistBar />
              </ComponentCard>
            </div>
          </div>
        </Section>

        {/* --------------------------------------------------------- the acts */}
        <section id="showpieces" className="relative">
          <div className="mx-auto w-full max-w-6xl px-5 pt-24 sm:px-8 sm:pt-32">
            <Kicker index="04" variant="rule">
              framework showpieces · 01 §5
            </Kicker>
            <h2
              className="font-narrative mt-5 max-w-[20ch] text-[clamp(30px,4.4vw,52px)] leading-[1.06] text-balance"
              style={{ color: 'var(--ink)' }}
            >
              Six frameworks, running on one <em className="italic">fictional</em> company.
            </h2>
            <p
              className="mt-4 max-w-[62ch] text-[16px] leading-[1.6]"
              style={{ color: 'var(--muted)' }}
            >
              Each one is pinned for two viewport heights and scrubbed by scroll, exactly
              as the framework pages and the homepage will drive them. {COMPANY} is
              invented; every figure below traces to an authored evidence object.
            </p>
          </div>

          <Acts acts={ACTS} className="mt-16">
            <div data-testid="recipe-acts" data-acts="6">
              <Act id="bmc" pin={2.2}>
                <div data-testid="recipe-fw-bmc-assemble">
                  <ActHead
                    kicker="fw/bmc-assemble"
                    title="The canvas fills in the order you actually reason."
                    note={BMC_CONTRADICTION}
                  />
                  <BmcAssemble blocks={BMC_BLOCKS} company={COMPANY} />
                </div>
              </Act>

              <Act id="forces" pin={2}>
                <div data-testid="recipe-fw-forces-gauges">
                  <ActHead
                    kicker="fw/forces-gauges"
                    title="Five pressures, pointing inward."
                    note="Move a slider and watch which force actually decides the shape. Every score is an assumption until the evidence pack overrules it."
                  />
                  <ForcesGauges company={COMPANY} forces={FORCES} />
                </div>
              </Act>

              <Act id="vrio" pin={2.3}>
                <div data-testid="recipe-fw-vrio-gates">
                  <ActHead
                    kicker="fw/vrio-gates"
                    title="Four gates. Most capabilities fail one."
                    note="Tokens travel V · R · I · O. Failing a gate drops the capability into its shelf; passing all four docks it right. Click any token for its evidence."
                  />
                  <VrioGates capabilities={CAPABILITIES} />
                </div>
              </Act>

              <Act id="tows" pin={2.2}>
                <div data-testid="recipe-fw-tows-cross">
                  <ActHead
                    kicker="fw/tows-cross"
                    title="SWOT gathers. TOWS generates."
                    note="Four lists are not a strategy. Options only exist where two of them cross."
                  />
                  <TowsCross
                    strengths={STRENGTHS}
                    weaknesses={WEAKNESSES}
                    opportunities={OPPORTUNITIES}
                    threats={THREATS}
                    crossings={CROSSINGS}
                  />
                </div>
              </Act>

              <Act id="toc" pin={2}>
                <div data-testid="recipe-fw-toc-flow">
                  <ActHead
                    kicker="fw/toc-flow"
                    title="Improve a non-constraint and nothing happens."
                    note="The only amber on this page. The constrained stage is computed from capacity, never authored — move the bottleneck and the amber moves with it."
                  />
                  <TocFlow
                    stages={TOC_STAGES}
                    interventions={TOC_INTERVENTIONS}
                    demand={TOC_DEMAND}
                  />
                </div>
              </Act>

              <Act id="raci" pin={2}>
                <div data-testid="recipe-fw-raci-route">
                  <ActHead
                    kicker="fw/raci-route"
                    title="The pipeline stops where a human is accountable."
                    note="Square nodes are agents, round nodes are humans, and accountability is always round. The packet waits, visibly, until it is signed."
                  />
                  <RaciRoute nodes={RACI_NODES} packet="retrofit quote · Kessler Ave" />
                </div>
              </Act>
            </div>
          </Acts>
        </section>

        {/* --------------------------------------------------------- closing */}
        <Section
          id="closing"
          index="05"
          kicker="parity · 00-LAW ruling 7"
          title={
            <>
              Reduced motion is a <em className="italic">second theme</em>, not a switch.
            </>
          }
          lede="Turn the OS setting on and every recipe above renders its terminal state: acts un-pin and read as a document, travellers rest at their destinations, the canvas is already assembled and the constraint is already found. Nothing is missing — only the performance is."
        >
          <div
            className="rounded-lg border p-5"
            style={{
              borderColor: 'var(--line)',
              background: 'color-mix(in srgb, var(--paper) 70%, transparent)',
            }}
          >
            <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
              current session
            </div>
            <p
              className="font-system mt-2 text-[13px]"
              style={{ color: reduced ? 'var(--evidence)' : 'var(--ink)' }}
            >
              prefers-reduced-motion: {reduced ? 'reduce' : 'no-preference'}
            </p>
          </div>
        </Section>

        <footer
          className="mx-auto w-full max-w-6xl border-t px-5 py-10 sm:px-8"
          style={{ borderColor: 'var(--line)' }}
        >
          <p className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
            {FOOTER_LINE}
          </p>
        </footer>
      </main>
    </LenisProvider>
  );
}
