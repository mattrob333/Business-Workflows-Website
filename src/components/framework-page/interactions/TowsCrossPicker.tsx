'use client';

/**
 * The SWOT/TOWS explore interaction: **the cross, operated by hand**.
 *
 * Pick one internal entry and one external entry. If the pair was crossed, a strategic
 * option is minted, stamped with its kind and carrying the sourced verdict on what it would
 * do to the business. If it was not, the panel says so and stays empty.
 *
 * The empty result is not a gap in the content — it is the argument. Four internal entries
 * against four external ones is sixteen pairings, and Beacon's authored cross generates from
 * four of them. A visitor who clicks through the other twelve has performed the lesson this
 * page exists for: collection is not generation, and a wall of sticky notes is a wall of
 * ingredients until somebody does the crossing and finds out how few of them cook.
 *
 * The pairs, the options and the verdicts are all authored — a claim about this business, not
 * something the registry or the model can derive. What the island does is hold two selections
 * and decide which server-rendered node to show. Counts are words, never numerals, so the
 * walk's digit sweep over the explore section stays absolute.
 */

import { useState, type ReactNode } from 'react';
import { FOCUS_RING, MONO_LABEL } from '@/components';

export type CrossSide = 'S' | 'W' | 'O' | 'T';
export type CrossKind = 'SO' | 'ST' | 'WO' | 'WT';

export interface CrossCard {
  id: string;
  label: string;
  side: CrossSide;
}

export interface CrossMove {
  internal: string;
  external: string;
  kind: CrossKind;
  /** The strategy the pairing generates. One sentence, imperative. */
  option: string;
  /** What it does to the business, in words: "releases crew hours". */
  verdict: string;
  /** Whether it widens the narrow stage, loads it, or neither. */
  effect: 'releases' | 'loads' | 'neutral';
  /** The sourced claim behind the verdict, rendered on the server. */
  detail: ReactNode;
}

const SIDE_LABEL: Record<CrossSide, string> = {
  S: 'strength',
  W: 'weakness',
  O: 'opportunity',
  T: 'threat',
};

const KIND_GLOSS: Record<CrossKind, string> = {
  SO: 'strength × opportunity — press the advantage',
  ST: 'strength × threat — defend with what you have',
  WO: 'weakness × opportunity — fix to compete',
  WT: 'weakness × threat — contain the damage',
};

const WORDS = [
  'no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
];
const count = (n: number): string => WORDS[n] ?? String(n);

export interface TowsCrossPickerProps {
  internals: CrossCard[];
  externals: CrossCard[];
  moves: CrossMove[];
}

function Column({
  title,
  cards,
  picked,
  onPick,
  slot,
}: {
  title: string;
  cards: CrossCard[];
  picked: string | null;
  onPick: (id: string) => void;
  slot: 'internal' | 'external';
}) {
  return (
    <div>
      <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
        {title}
      </div>
      <div className="mt-3 grid gap-2">
        {cards.map((card) => {
          const on = picked === card.id;
          return (
            <button
              key={card.id}
              type="button"
              aria-pressed={on}
              data-cross-card={card.id}
              data-slot={slot}
              onClick={() => onPick(card.id)}
              className={`${FOCUS_RING} rounded-md border px-3 py-2 text-left transition-colors`}
              style={{
                borderColor: on
                  ? 'color-mix(in srgb, var(--flow) 60%, transparent)'
                  : 'var(--line)',
                background: on
                  ? 'color-mix(in srgb, var(--flow-deep) 16%, transparent)'
                  : 'color-mix(in srgb, var(--surface) 55%, transparent)',
              }}
            >
              <span
                className={`${MONO_LABEL} block text-[9px]`}
                style={{ color: on ? 'var(--flow)' : 'var(--faint)' }}
              >
                {SIDE_LABEL[card.side]}
              </span>
              <span
                className="mt-[3px] block text-[13px] leading-snug"
                style={{ color: on ? 'var(--ink)' : 'var(--muted)' }}
              >
                {card.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TowsCrossPicker({ internals, externals, moves }: TowsCrossPickerProps) {
  const [internal, setInternal] = useState<string | null>(null);
  const [external, setExternal] = useState<string | null>(null);
  const [found, setFound] = useState<string[]>([]);

  const move =
    internal && external
      ? (moves.find((m) => m.internal === internal && m.external === external) ?? null)
      : null;

  const record = (key: string | null) => {
    if (!key) return;
    setFound((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const pickInternal = (id: string) => {
    setInternal(id);
    if (external) {
      const hit = moves.find((m) => m.internal === id && m.external === external);
      record(hit ? hit.kind : null);
    }
  };

  const pickExternal = (id: string) => {
    setExternal(id);
    if (internal) {
      const hit = moves.find((m) => m.internal === internal && m.external === id);
      record(hit ? hit.kind : null);
    }
  };

  const pairings = internals.length * externals.length;

  return (
    <div
      data-testid="tows-picker"
      data-internal={internal ?? ''}
      data-external={external ?? ''}
      data-move={move ? move.kind : internal && external ? 'none' : ''}
      data-found={found.length}
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,1.2fr)_minmax(0,1fr)]"
    >
      <Column
        title="what we have"
        cards={internals}
        picked={internal}
        onPick={pickInternal}
        slot="internal"
      />

      <div className="grid content-start gap-3">
        <div className={`${MONO_LABEL} text-center text-[10px]`} style={{ color: 'var(--faint)' }}>
          the cross
        </div>
        <div
          aria-live="polite"
          className="rounded-lg border p-4"
          style={{
            border: move
              ? '1px solid color-mix(in srgb, var(--flow) 40%, transparent)'
              : '1px dashed var(--line)',
            background: move
              ? 'color-mix(in srgb, var(--flow-deep) 10%, transparent)'
              : 'transparent',
          }}
        >
          {!internal || !external ? (
            <p className="text-center text-[13px] leading-relaxed" style={{ color: 'var(--faint)' }}>
              Pick one entry from each side.
              <br />
              Nothing has been generated yet.
            </p>
          ) : move ? (
            <div data-minted={move.kind} className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`${MONO_LABEL} rounded-[3px] border px-[6px] py-[2px] text-[9px]`}
                  style={{
                    color: 'var(--flow)',
                    borderColor: 'color-mix(in srgb, var(--flow) 45%, transparent)',
                  }}
                >
                  {move.kind}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--faint)' }}>
                  {KIND_GLOSS[move.kind]}
                </span>
              </div>
              <p className="text-[15px] leading-snug" style={{ color: 'var(--ink)' }}>
                {move.option}
              </p>
              <div
                className={`${MONO_LABEL} text-[9px]`}
                style={{
                  color: move.effect === 'releases' ? 'var(--evidence)' : 'var(--muted)',
                }}
                data-effect={move.effect}
              >
                {move.verdict}
              </div>
              {move.detail}
            </div>
          ) : (
            <div className="grid gap-2">
              <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                nothing minted
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                This pairing was not crossed. Both entries are true and putting them next to
                each other produces no move — which is a finding, not a gap. A wall that
                cannot say where it has no move will let somebody promise one anyway.
              </p>
            </div>
          )}
        </div>
        <p className={`${MONO_LABEL} text-center text-[9px]`} style={{ color: 'var(--faint)' }}>
          {count(found.length)} of {count(moves.length)} moves found ·{' '}
          {count(moves.length)} of {count(pairings)} pairings generate
        </p>
      </div>

      <Column
        title="what is out there"
        cards={externals}
        picked={external}
        onPick={pickExternal}
        slot="external"
      />
    </div>
  );
}

export default TowsCrossPicker;
