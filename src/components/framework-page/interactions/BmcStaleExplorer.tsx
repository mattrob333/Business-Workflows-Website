'use client';

/**
 * The BMC page's explore interaction (03-content-spec §3: *"change an input… run, compare"*).
 *
 * Turn a customer segment or a value proposition off and the blocks that depended on it
 * flag stale — and then, because the blocks are bound to state fields and the state fields
 * are bound to graph edges, the *downstream frameworks* flag stale too. That second step is
 * the point. A canvas that goes stale is a diagram problem; a canvas that makes Five Forces
 * and VRIO go stale is a system, and that is the sentence the whole site is trying to make
 * touchable.
 *
 * The dependency map is authored (it is a claim about how a business model hangs together,
 * not something the registry knows), but everything it triggers is derived: which fields
 * those blocks populate, which frameworks read those fields, and what the edge carries.
 *
 * Every sourced figure arrives as a pre-rendered node from the server — the island owns the
 * toggling, never the evidence. Counts are spelled out rather than printed as numerals, so
 * that the walk's rule for this section stays absolute: a digit in the explore body must sit
 * inside a claim block that cites its source.
 */

import { useMemo, useState, type ReactNode } from 'react';
import { FOCUS_RING, MONO_LABEL } from '@/components';

export interface StaleBlock {
  id: string;
  label: string;
  /** The state field this block populates, as a label. */
  field: string;
}

export interface StaleToggle {
  id: string;
  label: string;
  group: string;
  /** The sourced figure behind it, rendered on the server. */
  note: ReactNode;
  /** Block ids this input invalidates when it changes. Includes its own. */
  invalidates: string[];
  /** State-field labels that go stale with it. */
  fields: string[];
}

export interface StaleDownstream {
  id: string;
  name: string;
  question: string;
  /** State-field labels this framework reads from the canvas. */
  reads: string[];
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const count = (n: number): string => WORDS[n] ?? String(n);

export interface BmcStaleExplorerProps {
  blocks: StaleBlock[];
  toggles: StaleToggle[];
  downstream: StaleDownstream[];
}

export function BmcStaleExplorer({ blocks, toggles, downstream }: BmcStaleExplorerProps) {
  const [changed, setChanged] = useState<Record<string, boolean>>({});

  const { staleBlocks, staleFields, anyChanged } = useMemo(() => {
    const blockIds = new Set<string>();
    const fields = new Set<string>();
    let any = false;
    for (const toggle of toggles) {
      if (!changed[toggle.id]) continue;
      any = true;
      for (const id of toggle.invalidates) blockIds.add(id);
      for (const field of toggle.fields) fields.add(field);
    }
    return { staleBlocks: blockIds, staleFields: fields, anyChanged: any };
  }, [changed, toggles]);

  const staleDownstream = downstream.filter((framework) =>
    framework.reads.some((field) => staleFields.has(field)),
  );

  const groups = Array.from(new Set(toggles.map((t) => t.group)));

  return (
    <div
      data-testid="bmc-explorer"
      data-stale-blocks={staleBlocks.size}
      className="grid gap-6"
    >
      <div className="grid gap-5">
        {groups.map((group) => (
          <div key={group}>
            <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
              {group}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {toggles
                .filter((toggle) => toggle.group === group)
                .map((toggle) => {
                  const off = changed[toggle.id] ?? false;
                  return (
                    <div key={toggle.id} className="grid gap-2">
                      <button
                        type="button"
                        aria-pressed={off}
                        data-toggle={toggle.id}
                        onClick={() =>
                          setChanged((prev) => ({ ...prev, [toggle.id]: !prev[toggle.id] }))
                        }
                        className={`${FOCUS_RING} flex items-start gap-3 rounded-md border px-3 py-3 text-left transition-colors`}
                        style={{
                          borderColor: off
                            ? 'color-mix(in srgb, var(--flow) 55%, transparent)'
                            : 'var(--line)',
                          background: off
                            ? 'color-mix(in srgb, var(--flow-deep) 16%, transparent)'
                            : 'transparent',
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[3px] inline-block h-[11px] w-[11px] shrink-0 rounded-[3px] border"
                          style={{
                            borderColor: off ? 'var(--flow)' : 'var(--line-strong)',
                            background: off ? 'var(--flow)' : 'transparent',
                          }}
                        />
                        <span>
                          <span className="block text-[14px]" style={{ color: 'var(--ink)' }}>
                            {toggle.label}
                          </span>
                          <span
                            className={`${MONO_LABEL} mt-[3px] block text-[9px]`}
                            style={{ color: off ? 'var(--flow)' : 'var(--faint)' }}
                          >
                            {off ? 'changed — dependants stale' : 'change this input'}
                          </span>
                        </span>
                      </button>
                      {toggle.note}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
          the canvas
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {blocks.map((block) => {
            const stale = staleBlocks.has(block.id);
            return (
              <span
                key={block.id}
                data-canvas-block={block.id}
                data-stale={stale ? 'true' : 'false'}
                className={`${MONO_LABEL} rounded-md px-3 py-2 text-[10px] transition-colors`}
                style={{
                  color: stale ? 'var(--ink)' : 'var(--muted)',
                  border: stale ? '1px dashed var(--contradiction)' : '1px solid var(--line)',
                  background: stale
                    ? 'var(--contradiction-soft)'
                    : 'color-mix(in srgb, var(--surface) 55%, transparent)',
                }}
              >
                {block.label}
                {stale ? (
                  <span style={{ color: 'var(--contradiction)' }}> · stale</span>
                ) : null}
              </span>
            );
          })}
        </div>
      </div>

      <div
        aria-live="polite"
        className="rounded-md border p-4"
        style={{
          borderColor: 'var(--line)',
          background: 'color-mix(in srgb, var(--paper) 75%, transparent)',
        }}
      >
        <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          what re-runs
        </div>
        {!anyChanged ? (
          <p className="mt-2 text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
            Nothing changed yet. Change one input above and watch how far the change travels —
            the canvas is not a poster, it is the top of a dependency chain.
          </p>
        ) : (
          <>
            <p className="mt-2 text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
              {count(staleBlocks.size)} of {count(blocks.length)} blocks now need re-checking,
              and {staleDownstream.length === 1 ? 'one framework downstream is' : `${count(staleDownstream.length)} frameworks downstream are`}{' '}
              reading state that no longer holds.
            </p>
            <ul className="mt-3 grid gap-2">
              {staleDownstream.map((framework) => (
                <li
                  key={framework.id}
                  data-stale-framework={framework.id}
                  className="rounded-md border px-3 py-2"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--flow) 30%, transparent)',
                    background: 'color-mix(in srgb, var(--flow-deep) 10%, transparent)',
                  }}
                >
                  <span className="font-system text-[12px]" style={{ color: 'var(--flow)' }}>
                    {framework.name}
                  </span>
                  <span className="ml-2 text-[12px]" style={{ color: 'var(--muted)' }}>
                    {framework.question}
                  </span>
                  <span className={`${MONO_LABEL} mt-1 block text-[9px]`} style={{ color: 'var(--faint)' }}>
                    reads {framework.reads.filter((f) => staleFields.has(f)).join(', ')}
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              data-testid="bmc-rerun"
              onClick={() => setChanged({})}
              className={`${MONO_LABEL} ${FOCUS_RING} mt-4 rounded-md border px-4 py-2 text-[10px] transition-colors`}
              style={{
                color: 'var(--ink)',
                borderColor: 'color-mix(in srgb, var(--flow) 50%, transparent)',
                background: 'color-mix(in srgb, var(--flow-deep) 18%, transparent)',
              }}
            >
              re-run the canvas
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default BmcStaleExplorer;
