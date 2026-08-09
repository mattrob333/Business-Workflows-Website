/**
 * Section 6 — the handoff (03-content-spec: *"the graph edge, made walkable"*).
 *
 * Three parts, in the order the visitor needs them: what this framework just wrote, where
 * that state is wanted next, and where the whole thing sits in the graph.
 *
 * The lead visual is `motion/route` — the recipe whose meaning is *work moves elsewhere*
 * (01 §4) — pointed at the registry's recommended next framework. Underneath it, every
 * outgoing edge is a card that names the fields it carries and links with the example
 * company's state in the URL (`handoff.ts` documents the contract).
 *
 * **S6 unlocked the chapter edges.** Chapter targets used to be listed without a link,
 * because a handoff into a 404 would have been a worse lie than a missing link. All
 * seventeen pages are now in the export, so every card is a link and the `bestBefore`
 * recommendation is finally the thing the visitor can click. The unlinked branch is kept
 * for a target `handoff.ts` marks unwalkable — it renders nothing today.
 */

import { GlassPanel, MONO_LABEL } from '@/components';
import { GraphMiniMap } from '@/components/GraphMiniMap';
import { RouteHandoff } from '@/motion/motion-route';
import { Ingest, IngestGroup } from '@/motion/motion-ingest';
import { stateField, type Framework } from '@/registry';
import type { Company } from '@/content/companies';
import type { HandoffTarget } from './handoff';

export interface HandoffSectionProps {
  framework: Framework;
  company: Company;
  targets: readonly HandoffTarget[];
  /** Two to four lines: what running this made possible. */
  unlocked: readonly string[];
}

export function HandoffSection({ framework, company, targets, unlocked }: HandoffSectionProps) {
  const lead = targets.find((t) => t.recommended && t.linkable) ?? targets.find((t) => t.linkable);
  const leadField = lead?.fields[0];
  const leadPayload =
    lead && lead.fields.length === 1 && leadField
      ? stateField(leadField).label
      : `${lead?.fields.length ?? 0} state fields`;

  return (
    <div className="grid gap-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <GlassPanel pad="lg" eyebrow="what this unlocked" elevated>
          <ul className="grid gap-3">
            {unlocked.map((line) => (
              <li key={line} className="flex gap-3 text-[15px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
                <span
                  aria-hidden="true"
                  className="mt-[9px] inline-block h-[5px] w-[5px] shrink-0 rounded-full"
                  style={{ background: 'var(--flow)' }}
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t pt-4" style={{ borderColor: 'var(--line)' }}>
            <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
              written to the shared state
            </div>
            <p className="mt-2 text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
              {framework.writesTo.map((f) => stateField(f).label).join(' · ')}
            </p>
          </div>
        </GlassPanel>

        <GlassPanel pad="md" eyebrow="position in the graph">
          <GraphMiniMap current={framework.id} />
        </GlassPanel>
      </div>

      {lead ? (
        <Ingest trigger="in-view">
          <RouteHandoff
            from={{
              label: framework.name,
              caption: `ran on ${company.name}`,
            }}
            to={{
              label: lead.framework.name,
              caption: lead.framework.coreQuestion,
            }}
            payload={leadPayload}
          />
        </Ingest>
      ) : null}

      <IngestGroup trigger="in-view" className="grid gap-3 sm:grid-cols-2">
        {targets.map((target) => {
          const carried = target.fields.map((f) => stateField(f).label).join(', ');
          const body = (
            <>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-narrative text-[21px] leading-tight" style={{ color: 'var(--ink)' }}>
                  {target.framework.name}
                </span>
                <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                  {target.recommended
                    ? 'run this next'
                    : target.linkable
                      ? 'also reads this'
                      : 'not yet published'}
                </span>
              </div>
              <p className="mt-2 text-[14px] leading-[1.55]" style={{ color: 'var(--muted)' }}>
                {target.framework.coreQuestion}
              </p>
              <p className={`${MONO_LABEL} mt-3 text-[9px]`} style={{ color: 'var(--flow)' }}>
                carries {carried}
              </p>
            </>
          );

          return target.href ? (
            <a
              key={target.framework.id}
              data-handoff-link={target.framework.id}
              data-recommended={target.recommended ? 'true' : 'false'}
              href={target.href}
              className="block h-full rounded-lg border p-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--flow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--void)] hover:border-[color:color-mix(in_srgb,var(--flow)_55%,transparent)]"
              style={{
                borderColor: target.recommended
                  ? 'color-mix(in srgb, var(--flow) 40%, transparent)'
                  : 'var(--line)',
                background: 'color-mix(in srgb, var(--surface) 60%, transparent)',
              }}
            >
              {body}
            </a>
          ) : (
            <div
              key={target.framework.id}
              data-handoff-chapter={target.framework.id}
              className="block h-full rounded-lg border border-dashed p-5"
              style={{ borderColor: 'var(--line)', background: 'transparent', opacity: 0.75 }}
            >
              {body}
            </div>
          );
        })}
      </IngestGroup>
    </div>
  );
}

export default HandoffSection;
