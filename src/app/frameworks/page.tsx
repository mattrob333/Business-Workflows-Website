import type { Metadata } from 'next';
import {
  FRAMEWORKS,
  GROUPS,
  STRATEGY_RUNS,
  STATE_FIELD_IDS,
  allEdges,
  byId,
  edgesFor,
  frameworksByDepth,
  frameworksInGroup,
  stateField,
} from '@/registry';
import { FrameworkGraph } from '@/components/FrameworkGraph';
import { GraphLegend } from '@/components/GraphLegend';
import { GlassPanel, Kicker, MONO_LABEL } from '@/components';
import { AtmoMeshDrift } from '@/motion/atmo-mesh-drift';
import { Grain } from '@/motion/grain';
import { Ingest, IngestGroup } from '@/motion/motion-ingest';

/**
 * `/frameworks` — ACT II made into a page.
 *
 * S1 shipped this route as a deliberately plain proof that the registry drives rendering.
 * S2 keeps that property exactly — every node, edge, group and row below still comes from
 * `src/registry` and nothing else — and raises it to the bar the recipe gallery set: the
 * graph is the page's substance, the serif overlaps the data layer once (01 §3), and the
 * list underneath is not a fallback but the screen-reader-first path through the same
 * information.
 *
 * The page is a *server* component. Only the graph itself needs the client, so only the
 * graph ships as one; the hero, the legend and the seventeen rows are static HTML that
 * renders with JavaScript off (00-LAW Ruling 7).
 */

/** Counted from the registry, like everything else on the page. */
export const metadata: Metadata = {
  title: 'The framework graph — The Strategy Stack',
  description: `${FRAMEWORKS.length} frameworks, ${allEdges().length} handoffs, one shared business state. Frameworks do not pass paragraphs to each other — they pass typed fields.`,
};

const FOOTER_LINE =
  'THE STRATEGY STACK · POWERED BY INSTINCT · BUSINESS FRAMEWORKS, FINALLY RUNNING.';

function StatRow({ items }: { items: [string, string][] }) {
  return (
    <div
      className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t pt-4"
      style={{ borderColor: 'var(--line)' }}
    >
      {items.map(([k, v]) => (
        <div key={k}>
          <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
            {k}
          </div>
          <div
            className="font-system mt-1 text-[13px] tabular-nums"
            style={{ color: 'var(--ink)' }}
          >
            {v}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FrameworksIndexPage() {
  const total = FRAMEWORKS.length;
  const full = frameworksByDepth('full').length;
  const edges = allEdges();
  const conductor = byId('theory-of-constraints');
  const conductorIn = edges.filter((e) => e.to === conductor.id).length;

  return (
    <main data-testid="frameworks-root" className="relative">
      {/*
        With JavaScript off, Framer's initial variants would hold the graph and the
        entrance groups at opacity 0. Ruling 7 requires every diagram to be readable in
        its final state without JS, so the no-JS path force-resolves them.
      */}
      <noscript>
        <style>{`[data-recipe],[data-recipe] *{opacity:1!important;transform:none!important;filter:none!important}`}</style>
      </noscript>

      {/* ------------------------------------------------------------- hero */}
      <header className="relative overflow-hidden">
        <AtmoMeshDrift seed={5} count={5} intensity={0.09} />
        <Grain />
        <div className="relative mx-auto w-full max-w-[92rem] px-5 pt-24 pb-10 sm:px-8 sm:pt-32">
          <Kicker index="II" variant="rule">
            the instruments · the framework graph
          </Kicker>

          <h1
            className="font-narrative mt-7 max-w-[17ch] text-[clamp(42px,7.4vw,92px)] leading-[1.02] text-balance"
            style={{ color: 'var(--ink)' }}
          >
            Seventeen instruments, reading one{' '}
            <em className="italic" style={{ color: 'var(--flow)' }}>
              shared
            </em>{' '}
            state.
          </h1>

          {/* type/serif-over-data — used once on this page. */}
          <div className="relative mt-[-0.35em] max-w-3xl pt-16">
            <GlassPanel pad="lg" overhang elevated eyebrow="the principle">
              <p
                className="max-w-[62ch] text-[16px] leading-[1.65]"
                style={{ color: 'var(--muted)' }}
              >
                Frameworks do not pass paragraphs to each other. They pass{' '}
                <span style={{ color: 'var(--ink)' }}>typed fields</span> of one business
                model — segments, force scores, capabilities, the constraint. Every line
                in the graph below is a real handoff, and hovering it names the fields
                travelling along it. Delete a framework from the registry and its node
                disappears from this page; nothing here is drawn by hand.
              </p>
              <StatRow
                items={[
                  ['frameworks', `${total}`],
                  ['full lessons', `${full}`],
                  ['handoffs', `${edges.length}`],
                  ['state fields', `${STATE_FIELD_IDS.length}`],
                  ['strategy runs', `${STRATEGY_RUNS.length}`],
                ]}
              />
            </GlassPanel>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------ graph */}
      <section
        aria-labelledby="graph-heading"
        className="relative mx-auto w-full max-w-[110rem] px-3 pt-6 pb-16 sm:px-6"
      >
        <div className="mx-auto max-w-[92rem] px-2">
          <h2
            id="graph-heading"
            className="font-narrative text-[clamp(22px,2.6vw,32px)] leading-tight"
            style={{ color: 'var(--ink)' }}
          >
            The map of the handoffs
          </h2>
          <p className="mt-3 max-w-[68ch] text-[15px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
            Hover or focus a node to light its handoffs; hover a line to see the fields it
            carries. Every node is a link to its page. {conductorIn} of the {total} feed{' '}
            {conductor.name} — that convergence is the story: a hundred true findings, one
            binding constraint.
          </p>
          <a
            href="#framework-list"
            className="font-system mt-4 inline-block rounded-sm py-1 text-[11px] underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)]"
            style={{ color: 'var(--muted)' }}
          >
            Skip the graph — read the seventeen as a list
          </a>
        </div>

        <Ingest trigger="in-view" className="mt-8">
          <FrameworkGraph />
        </Ingest>

        <div className="mx-auto mt-10 max-w-[92rem] px-2">
          <GraphLegend />
        </div>

        <div className="mx-auto mt-10 max-w-[92rem] px-2">
          <GlassPanel pad="md" eyebrow="the expanded view">
            <p className="max-w-[68ch] text-[15px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              Want the full field list for a single handoff, with descriptions and the
              strategy runs that traverse it?{' '}
              <a
                href="/graph"
                className="underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)]"
                style={{ color: 'var(--flow)' }}
              >
                Open the graph with its inspection rail
              </a>
              .
            </p>
          </GlassPanel>
        </div>
      </section>

      {/* ------------------------------------------------------------- list */}
      <section
        id="framework-list"
        aria-labelledby="list-heading"
        className="relative mx-auto w-full max-w-[80rem] px-5 py-16 sm:px-8"
      >
        <Kicker index="III" variant="rule">
          the seventeen, as text
        </Kicker>
        <h2
          id="list-heading"
          className="font-narrative mt-5 max-w-[20ch] text-[clamp(28px,4vw,46px)] leading-[1.06]"
          style={{ color: 'var(--ink)' }}
        >
          The same graph, read as a document.
        </h2>
        <p className="mt-4 max-w-[64ch] text-[16px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
          Grouped by the job each framework does. The reads, writes and feeds below are the
          same registry records the canvas is drawn from — {conductorIn} of these rows end
          with an arrow into the conductor.
        </p>

        {GROUPS.map((group) => {
          const frameworks = frameworksInGroup(group.id);
          if (frameworks.length === 0) return null;
          return (
            <div key={group.id} className="mt-14" data-group={group.id}>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3
                  id={`group-${group.id}`}
                  className={`${MONO_LABEL} text-[11px]`}
                  style={{ color: 'var(--flow)' }}
                >
                  {group.label}
                </h3>
                <p className="text-[14px]" style={{ color: 'var(--faint)' }}>
                  {group.blurb}
                </p>
              </div>

              <IngestGroup
                trigger="in-view"
                className="mt-5 grid gap-px overflow-hidden rounded-md"
                style={{ background: 'var(--line)' }}
              >
                {frameworks.map((framework) => {
                  const { out } = edgesFor(framework.id);
                  return (
                    <article
                      key={framework.id}
                      data-framework={framework.id}
                      className="px-5 py-5 sm:px-6"
                      style={{ background: 'color-mix(in srgb, var(--surface) 70%, var(--void))' }}
                    >
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <h4 className="font-narrative text-[22px] leading-tight">
                          <a
                            href={`/frameworks/${framework.slug}`}
                            className="underline decoration-dotted underline-offset-[6px] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--void)]"
                            style={{ color: 'var(--ink)', textDecorationColor: 'var(--line-strong)' }}
                          >
                            {framework.name}
                          </a>
                        </h4>
                        <span className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
                          {framework.depth === 'full' ? 'full lesson' : 'chapter'}
                        </span>
                        <span className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
                          /{framework.slug}
                        </span>
                      </div>

                      <p className="mt-2 max-w-[70ch] text-[15px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
                        {framework.coreQuestion}
                      </p>

                      <dl className="mt-4 grid gap-2 text-[13px] sm:grid-cols-[5.5rem_minmax(0,1fr)]">
                        <dt className={`${MONO_LABEL} text-[9px] sm:pt-[3px]`} style={{ color: 'var(--faint)' }}>
                          reads
                        </dt>
                        <dd style={{ color: 'var(--muted)' }}>
                          {framework.readsFrom.map((f) => stateField(f).label).join(' · ')}
                        </dd>
                        <dt className={`${MONO_LABEL} text-[9px] sm:pt-[3px]`} style={{ color: 'var(--faint)' }}>
                          writes
                        </dt>
                        <dd style={{ color: 'var(--muted)' }}>
                          {framework.writesTo.map((f) => stateField(f).label).join(' · ')}
                        </dd>
                        <dt className={`${MONO_LABEL} text-[9px] sm:pt-[3px]`} style={{ color: 'var(--faint)' }}>
                          feeds
                        </dt>
                        <dd style={{ color: 'var(--muted)' }}>
                          {out.length === 0
                            ? 'nothing — this is a terminal node'
                            : out
                                .map(
                                  (edge) =>
                                    `${byId(edge.to).name} (${edge.fields.length} field${
                                      edge.fields.length === 1 ? '' : 's'
                                    })`,
                                )
                                .join(' · ')}
                        </dd>
                      </dl>
                    </article>
                  );
                })}
              </IngestGroup>
            </div>
          );
        })}
      </section>

      <footer
        className="mx-auto w-full max-w-[80rem] border-t px-5 py-10 sm:px-8"
        style={{ borderColor: 'var(--line)' }}
      >
        <p className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          {FOOTER_LINE}
        </p>
      </footer>
    </main>
  );
}
