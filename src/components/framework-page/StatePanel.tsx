/**
 * The READS FROM / WRITES TO / BEST NEXT panel that closes every lesson (03-content-spec §2).
 *
 * Set entirely in the system voice, because that is what it is: the framework's signature.
 * Field *labels and descriptions* come from `STATE_FIELDS`, the reads/writes lists from the
 * registry record, and BEST NEXT from `bestBefore` / `feedsInto`. Change a record and this
 * panel changes with it; there is no copy of the graph anywhere on this page.
 *
 * It is also the page's quietest argument. A visitor who has just read eight hundred words
 * about a canvas sees, immediately underneath, that the canvas emits thirteen named fields
 * and that four other instruments are waiting to read them. That is the site's thesis in a
 * table: frameworks do not pass paragraphs to each other.
 */

import { MONO_LABEL } from '@/components';
import { stateField, type Framework, type StateField } from '@/registry';
import type { HandoffTarget } from './handoff';

function FieldList({ fields, tone }: { fields: readonly StateField[]; tone: string }) {
  return (
    <ul className="grid gap-2">
      {fields.map((field) => {
        const meta = stateField(field);
        return (
          <li key={field} data-state-field={field} className="leading-snug">
            <span className="font-system text-[12px]" style={{ color: tone }}>
              {meta.label}
            </span>
            <span className="mt-[2px] block text-[12px]" style={{ color: 'var(--faint)' }}>
              {meta.description}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Column({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-5" style={{ background: 'color-mix(in srgb, var(--surface) 70%, var(--void))' }}>
      <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
        {label}
      </div>
      <p className="mt-1 mb-4 text-[12px] leading-snug" style={{ color: 'var(--faint)' }}>
        {hint}
      </p>
      {children}
    </div>
  );
}

export interface StatePanelProps {
  framework: Framework;
  targets: readonly HandoffTarget[];
  className?: string;
}

export function StatePanel({ framework, targets, className = '' }: StatePanelProps) {
  const recommended = targets.filter((t) => t.recommended);
  const rest = targets.filter((t) => !t.recommended);

  return (
    <div
      data-testid="state-panel"
      data-framework={framework.id}
      className={`grid gap-px overflow-hidden rounded-lg border md:grid-cols-3 ${className}`}
      style={{ borderColor: 'var(--line)', background: 'var(--line)' }}
    >
      <Column label="reads from" hint="State this framework needs before it can say anything.">
        <FieldList fields={framework.readsFrom} tone="var(--muted)" />
      </Column>

      <Column label="writes to" hint="State it hands back, typed, for everything downstream.">
        <FieldList fields={framework.writesTo} tone="var(--ink)" />
      </Column>

      <Column label="best next" hint="What the graph says to run once this one has written.">
        <ul className="grid gap-3">
          {[...recommended, ...rest].map((target) => (
            <li key={target.framework.id} data-best-next={target.framework.id}>
              <div className="flex flex-wrap items-baseline gap-x-2">
                {target.href ? (
                  <a
                    href={target.href}
                    className="font-system rounded-sm text-[12px] underline decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)]"
                    style={{ color: 'var(--flow)' }}
                  >
                    {target.framework.name}
                  </a>
                ) : (
                  <span className="font-system text-[12px]" style={{ color: 'var(--muted)' }}>
                    {target.framework.name}
                  </span>
                )}
                <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                  {target.recommended ? 'recommended' : target.linkable ? 'later' : 'chapter · S6'}
                </span>
              </div>
              <span className="mt-[2px] block text-[12px]" style={{ color: 'var(--faint)' }}>
                carries {target.fields.map((f) => stateField(f).label.toLowerCase()).join(', ')}
              </span>
            </li>
          ))}
        </ul>
      </Column>
    </div>
  );
}

export default StatePanel;
