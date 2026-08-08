'use client';

/**
 * `GraphInspector` — the Framework Graph with its edge-inspection rail (02-architecture's
 * `/graph` route: *"the graph, expanded, with edge inspection"*).
 *
 * The graph on `/frameworks` answers *what connects to what*. This answers the next
 * question — *what actually travels* — at full depth: every shared field with the
 * definition it carries in `STATE_FIELDS`, and which Strategy Runs walk that handoff.
 *
 * The rail is also the keyboard and screen-reader path to the edges. Fifty-eight
 * focusable curves inside an SVG would be a tab-order disaster and a screen-reader
 * monologue; a grouped list of buttons is the same information as an ordinary document,
 * and selecting one lights the corresponding curve in the canvas. Selection moves focus
 * to the detail panel so a keyboard user lands where the answer appeared.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  STRATEGY_RUNS,
  stateField,
  type FrameworkId,
  type StrategyRun,
} from '@/registry';
import { FrameworkGraph } from './FrameworkGraph';
import { GlassPanel } from './GlassPanel';
import { Kicker } from './Kicker';
import { MONO_LABEL } from './styles';
import { GraphMiniMap } from './GraphMiniMap';
import { frameworkGraphModel, type GraphEdgeModel } from './graph-layout';

/**
 * Runs that walk this handoff.
 *
 * Honest by construction (00-LAW Ruling 4): a run only counts if it uses *both*
 * frameworks, and when both sit in the main sequence the writer must come first —
 * otherwise the run visits them in the other order and this edge is not the one it took.
 */
function runsUsing(from: FrameworkId, to: FrameworkId): StrategyRun[] {
  return STRATEGY_RUNS.filter((run) => {
    const uses = (id: FrameworkId) =>
      run.sequence.includes(id) || run.branches.some((b) => b.frameworks.includes(id));
    if (!uses(from) || !uses(to)) return false;
    const i = run.sequence.indexOf(from);
    const j = run.sequence.indexOf(to);
    if (i >= 0 && j >= 0) return i < j;
    return true;
  });
}

function EdgeDetail({ edge }: { edge: GraphEdgeModel }) {
  const runs = runsUsing(edge.from.framework.id, edge.to.framework.id);
  return (
    <div data-testid="edge-detail-body">
      <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
        the handoff
      </div>
      <h2 className="font-narrative mt-2 text-[22px] leading-[1.15]" style={{ color: 'var(--ink)' }}>
        <a
          href={`/frameworks/${edge.from.framework.slug}`}
          className="underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)]"
          style={{ color: 'inherit', textDecorationColor: 'var(--line-strong)' }}
        >
          {edge.from.framework.name}
        </a>
        <span style={{ color: 'var(--flow)' }}> → </span>
        <a
          href={`/frameworks/${edge.to.framework.slug}`}
          className="underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)]"
          style={{ color: 'inherit', textDecorationColor: 'var(--line-strong)' }}
        >
          {edge.to.framework.name}
        </a>
      </h2>
      <p className="font-system mt-2 text-[11px]" style={{ color: 'var(--muted)' }}>
        {edge.from.framework.name} writes {edge.fields.length} field
        {edge.fields.length === 1 ? '' : 's'} that {edge.to.framework.name} reads.
      </p>

      <h3 className={`${MONO_LABEL} mt-6 text-[9px]`} style={{ color: 'var(--faint)' }}>
        what travels
      </h3>
      <dl className="mt-3 grid gap-3">
        {edge.fields.map((field) => {
          const meta = stateField(field);
          return (
            <div key={field} data-state-field={field}>
              <dt
                className="font-system text-[11px]"
                style={{ color: 'var(--flow)' }}
                data-field-label={meta.label}
              >
                {meta.label}
              </dt>
              <dd className="mt-1 text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
                {meta.description}
              </dd>
            </div>
          );
        })}
      </dl>

      {/* Where it lands. The rail says what travels; the locator says where it arrives. */}
      <h3 className={`${MONO_LABEL} mt-6 text-[9px]`} style={{ color: 'var(--faint)' }}>
        where it lands
      </h3>
      <GraphMiniMap current={edge.to.framework.id} showLabel={false} className="mt-2" />

      <h3 className={`${MONO_LABEL} mt-6 text-[9px]`} style={{ color: 'var(--faint)' }}>
        runs that walk it
      </h3>
      {runs.length === 0 ? (
        <p className="mt-2 text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
          No scripted run takes this handoff yet — the graph allows more paths than the
          nine runs currently describe.
        </p>
      ) : (
        <ul className="mt-2 grid gap-1.5">
          {runs.map((run) => (
            <li key={run.id} data-run={run.id} className="text-[13px] leading-snug">
              <span style={{ color: 'var(--ink)' }}>{run.title}</span>
              {run.flagship ? (
                <span className={`${MONO_LABEL} ml-2 text-[9px]`} style={{ color: 'var(--evidence)' }}>
                  flagship
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function GraphInspector({ className = '' }: { className?: string }) {
  const model = frameworkGraphModel();
  const [selected, setSelected] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const edge = selected ? model.byKey.get(selected) : undefined;

  const select = useCallback((key: string | null) => {
    setSelected((current) => (current === key ? null : key));
  }, []);

  // Focus follows selection: the answer appeared somewhere else on the page, so the
  // keyboard goes there too. Never fires on mount — nothing is selected then.
  useEffect(() => {
    if (selected) detailRef.current?.focus();
  }, [selected]);

  const writers = model.nodes
    .map((node) => ({
      node,
      out: model.edges.filter((e) => e.from.framework.id === node.framework.id),
    }))
    .filter((entry) => entry.out.length > 0);

  return (
    <div
      data-testid="graph-inspector"
      className={`grid gap-10 xl:grid-cols-[minmax(0,1fr)_24rem] ${className}`}
    >
      {/* `min-w-0`: a grid item defaults to `min-width: auto`, which would let the
          canvas's own minimum width push the whole page into a horizontal scroll. */}
      <div className="min-w-0">
        <FrameworkGraph
          selectedEdge={selected}
          onSelectEdge={select}
          id="framework-graph-expanded"
        />
        <p className="mt-4 max-w-[70ch] text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
          Click a line to pin it in the rail, or pick one from the index — the canvas and
          the rail are the same selection.
        </p>
      </div>

      <aside
        aria-label="Edge inspection"
        className="min-w-0 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto"
      >
        <Kicker variant="rule">edge inspection</Kicker>

        <div
          ref={detailRef}
          tabIndex={-1}
          data-testid="edge-detail"
          aria-live="polite"
          className="mt-4 outline-none"
        >
          <GlassPanel pad="md" elevated border={edge ? 'flow' : 'line'}>
            {edge ? (
              <>
                <EdgeDetail edge={edge} />
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className={`${MONO_LABEL} mt-6 rounded-sm border px-2.5 py-1.5 text-[9px] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--void)]`}
                  style={{ borderColor: 'var(--line-strong)', color: 'var(--muted)' }}
                >
                  clear selection
                </button>
              </>
            ) : (
              <div data-testid="edge-detail-empty">
                <p className="text-[15px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
                  Nothing selected. Pick a handoff — on the canvas or from the index below
                  — to see every field it carries, what each field means, and which
                  strategy runs walk it.
                </p>
                <p className="font-system mt-4 text-[11px]" style={{ color: 'var(--faint)' }}>
                  {model.edges.length} handoffs · {model.nodes.length} frameworks
                </p>
              </div>
            )}
          </GlassPanel>
        </div>

        <h2 className={`${MONO_LABEL} mt-10 text-[10px]`} style={{ color: 'var(--faint)' }}>
          the edge index
        </h2>
        <div className="mt-4 grid gap-6">
          {writers.map(({ node, out }) => (
            <section key={node.framework.id} aria-labelledby={`writer-${node.framework.id}`}>
              <h3
                id={`writer-${node.framework.id}`}
                className="font-system text-[11px]"
                style={{ color: 'var(--ink)' }}
              >
                {node.framework.name}
                <span style={{ color: 'var(--faint)' }}> writes to</span>
              </h3>
              <ul className="mt-2 grid gap-1">
                {out.map((e) => {
                  const active = e.key === selected;
                  return (
                    <li key={e.key}>
                      <button
                        type="button"
                        data-edge-button={e.key}
                        aria-pressed={active}
                        onClick={() => select(e.key)}
                        className="flex w-full items-baseline justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--flow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--void)]"
                        style={{
                          borderColor: active ? 'var(--flow)' : 'var(--line)',
                          background: active
                            ? 'color-mix(in srgb, var(--flow-deep) 18%, transparent)'
                            : 'transparent',
                        }}
                      >
                        <span className="text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
                          {e.to.framework.name}
                        </span>
                        <span
                          className="font-system shrink-0 text-[10px] tabular-nums"
                          style={{ color: 'var(--faint)' }}
                        >
                          {e.fields.length}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default GraphInspector;
