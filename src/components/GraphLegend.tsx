/**
 * `GraphLegend` — how to read the Framework Graph.
 *
 * A graph that needs a paragraph of instructions has failed, but a graph that refuses to
 * name its own conventions is just decoration. This is the short version: what a node's
 * weight means, what a line means, and what the eight groups are — the last of which is
 * read straight out of the registry, so a new group cannot appear on the canvas without
 * appearing here too.
 *
 * Server-rendered on purpose: it is the part of the graph that works with JavaScript off.
 */

import { GROUPS, frameworksByDepth, allEdges, FRAMEWORKS } from '@/registry';
import { hexPath } from './graph-layout';
import { MONO_LABEL } from './styles';

function Swatch({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 64 40" className="h-10 w-16 shrink-0" role="img" aria-label={label}>
        {children}
      </svg>
      <span className="text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
    </div>
  );
}

export function GraphLegend({ className = '' }: { className?: string }) {
  const full = frameworksByDepth('full').length;
  const chapter = frameworksByDepth('chapter').length;
  const edges = allEdges();
  const conductorEdges = edges.filter((e) => e.to === 'theory-of-constraints').length;

  return (
    <div
      data-testid="graph-legend"
      className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      <section aria-labelledby="legend-nodes">
        <h3 id="legend-nodes" className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
          the nodes
        </h3>
        <div className="mt-4 grid gap-3">
          <Swatch label={`${full} frameworks are taught at full depth — heavier stroke, double wall.`}>
            <path
              d={hexPath(20, 20, 13)}
              fill="color-mix(in srgb, var(--surface) 92%, transparent)"
              stroke="var(--line-strong)"
              strokeWidth={2}
            />
            <path d={hexPath(20, 20, 7)} fill="none" stroke="var(--line-strong)" strokeWidth={1} opacity={0.85} />
          </Swatch>
          <Swatch label={`${chapter} arrive as chapters in v1 — the question, the position, the lab to come.`}>
            <path
              d={hexPath(20, 20, 10)}
              fill="color-mix(in srgb, var(--surface) 92%, transparent)"
              stroke="var(--line)"
              strokeWidth={1.5}
            />
          </Swatch>
        </div>
      </section>

      <section aria-labelledby="legend-edges">
        <h3 id="legend-edges" className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
          the edges
        </h3>
        <div className="mt-4 grid gap-3">
          <Swatch label="A line is a handoff: the writer's typed output fields are the reader's inputs. It leaves the writer's right flank and arrives at the reader's left.">
            <path
              d="M 6 20 C 22 20, 36 20, 52 20"
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <circle cx={52} cy={20} r={3} fill="var(--flow)" />
          </Swatch>
          <Swatch label="A line that runs right to left is the loop closing — the constraint re-writing the plan that produced it.">
            <path
              d="M 52 26 C 40 6, 20 6, 8 22"
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <circle cx={8} cy={22} r={3} fill="var(--flow)" />
          </Swatch>
          <p className="text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
            {edges.length} handoffs in all. {conductorEdges} of them end at Theory of
            Constraints, which is why it sits where it sits.
          </p>
        </div>
      </section>

      <section aria-labelledby="legend-groups" className="sm:col-span-2 lg:col-span-1">
        <h3 id="legend-groups" className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
          the eight groups
        </h3>
        <dl className="mt-4 grid gap-2">
          {GROUPS.map((group) => (
            <div key={group.id} className="flex items-baseline gap-3">
              <dt
                className={`${MONO_LABEL} w-[6.5rem] shrink-0 text-[10px]`}
                style={{ color: 'var(--ink)' }}
              >
                {group.label}
              </dt>
              <dd className="text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
                {group.blurb}{' '}
                <span className="font-system text-[11px]" style={{ color: 'var(--faint)' }}>
                  ({FRAMEWORKS.filter((f) => f.group === group.id).length})
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export default GraphLegend;
