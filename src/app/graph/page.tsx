import type { Metadata } from 'next';
import { FRAMEWORKS, STATE_FIELD_IDS, allEdges, byId } from '@/registry';
import { GraphInspector } from '@/components/GraphInspector';
import { GlassPanel, Kicker, MONO_LABEL } from '@/components';
import { AtmoMeshDrift } from '@/motion/atmo-mesh-drift';
import { Grain } from '@/motion/grain';

/**
 * `/graph` — 02-architecture's expanded graph: *"the graph, with edge inspection"*.
 *
 * `/frameworks` sells the idea; this route is where you check it. Same canvas, same
 * registry, plus a rail that will name every field on any handoff you point at and tell
 * you which strategy runs walk it. If the site's central claim — frameworks pass typed
 * state, not prose — were decoration, this is the page where it would fall apart.
 */

export const metadata: Metadata = {
  title: 'The graph, expanded — The Strategy Stack',
  description: `All ${allEdges().length} handoffs between the ${FRAMEWORKS.length} frameworks, with the typed state fields each one carries and the strategy runs that walk it.`,
};

const FOOTER_LINE =
  'THE STRATEGY STACK · POWERED BY INSTINCT · BUSINESS FRAMEWORKS, FINALLY RUNNING.';

export default function GraphPage() {
  const edges = allEdges();
  const conductor = byId('theory-of-constraints');
  const conductorIn = edges.filter((e) => e.to === conductor.id).length;
  const carried = edges.reduce((sum, e) => sum + e.fields.length, 0);

  return (
    <main data-testid="graph-root" className="relative">
      <noscript>
        <style>{`[data-recipe],[data-recipe] *{opacity:1!important;transform:none!important;filter:none!important}`}</style>
      </noscript>

      <header className="relative overflow-hidden">
        <AtmoMeshDrift seed={9} count={4} intensity={0.08} />
        <Grain />
        <div className="relative mx-auto w-full max-w-[110rem] px-5 pt-20 pb-8 sm:px-8 sm:pt-24">
          <Kicker variant="rule">the graph · expanded</Kicker>
          <h1
            className="font-narrative mt-6 max-w-[19ch] text-[clamp(34px,5.4vw,64px)] leading-[1.04] text-balance"
            style={{ color: 'var(--ink)' }}
          >
            Every handoff, and{' '}
            <em className="italic" style={{ color: 'var(--flow)' }}>
              exactly
            </em>{' '}
            what it carries.
          </h1>
          <div className="mt-6 max-w-2xl">
            <GlassPanel pad="md" eyebrow="how to read this">
              <p className="text-[15px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
                Select a line on the canvas or an entry in the index. The rail answers with
                the typed fields that travel the handoff, what each one means in the shared
                business state, and which of the strategy runs takes that route.
              </p>
              <div
                className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t pt-4"
                style={{ borderColor: 'var(--line)' }}
              >
                {[
                  ['handoffs', `${edges.length}`],
                  ['fields carried', `${carried}`],
                  ['into the conductor', `${conductorIn}`],
                  ['vocabulary', `${STATE_FIELD_IDS.length} fields`],
                  ['frameworks', `${FRAMEWORKS.length}`],
                ].map(([k, v]) => (
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
            </GlassPanel>
          </div>
        </div>
      </header>

      <section className="relative mx-auto w-full max-w-[110rem] px-3 py-10 sm:px-8">
        <GraphInspector />
      </section>

      <footer
        className="mx-auto w-full max-w-[110rem] border-t px-5 py-10 sm:px-8"
        style={{ borderColor: 'var(--line)' }}
      >
        <p className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          {FOOTER_LINE}
        </p>
      </footer>
    </main>
  );
}
