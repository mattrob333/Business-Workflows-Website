'use client';

/**
 * The RACI explore interaction: **route a work packet yourself**.
 *
 * Two real interventions off Beacon's constraint diagnosis. For each one the visitor picks
 * who does the work and who owns the outcome, from the same set of humans and agents the
 * showpiece routes through, and then compares against the authored assignment.
 *
 * One rule is enforced by the island rather than by the copy, because it is the one rule this
 * framework does not negotiate: **accountable is always a named human.** The island knows the
 * `kind` of each role — that is structure, not evidence — so choosing an agent for the A
 * column produces the rule rather than a score. An agent may be responsible for a great deal
 * of this work. It cannot be asked to explain the decision afterwards, and that is what
 * accountability means.
 *
 * The other half of a real assignment is the boundary set: which systems, which data, what it
 * may commit, the threshold that sends it back, and how the delegation is revoked. Those are
 * authored per packet and revealed with the answer, because a delegation without them is not
 * a delegation, it is a hope.
 *
 * Dumb-island rules apply (`./BmcStaleExplorer`): the sourced verdicts arrive as nodes
 * rendered on the server, counts are words, and nothing numeric is decided here.
 */

import { useState, type ReactNode } from 'react';
import { FOCUS_RING, MONO_LABEL } from '@/components';

export interface RoutingRole {
  id: string;
  label: string;
  kind: 'human' | 'agent';
  /** One digit-free line: what this role can actually carry. */
  scope: string;
}

export interface RoutingPacket {
  id: string;
  title: string;
  /** The situation, digit-free — the figures live in the verdict node. */
  context: string;
  roles: RoutingRole[];
  answer: { responsible: string; accountable: string };
  /** Why the authored assignment is what it is, rendered on the server. */
  verdict: ReactNode;
  /** capability_boundaries, in the product's own grammar. Digit-free. */
  boundaries: string[];
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const count = (n: number): string => WORDS[n] ?? String(n);

interface PacketPick {
  responsible?: string;
  accountable?: string;
  compared?: boolean;
}

export interface PacketRoutingProps {
  packets: RoutingPacket[];
}

function RoleChoice({
  packet,
  letter,
  gloss,
  value,
  onChange,
  locked,
}: {
  packet: RoutingPacket;
  letter: 'R' | 'A';
  gloss: string;
  value: string | undefined;
  onChange: (id: string) => void;
  locked: boolean;
}) {
  return (
    <fieldset className="grid gap-2" disabled={locked}>
      <legend className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
        {letter} · {gloss}
      </legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {packet.roles.map((role) => {
          const on = value === role.id;
          return (
            <button
              key={role.id}
              type="button"
              aria-pressed={on}
              data-assign={`${packet.id}:${letter}:${role.id}`}
              onClick={() => onChange(role.id)}
              className={`${FOCUS_RING} rounded-md border px-3 py-2 text-left transition-colors disabled:opacity-60`}
              style={{
                borderColor: on
                  ? 'color-mix(in srgb, var(--flow) 55%, transparent)'
                  : 'var(--line)',
                background: on
                  ? 'color-mix(in srgb, var(--flow-deep) 16%, transparent)'
                  : 'transparent',
              }}
            >
              <span className="block text-[13px] leading-snug" style={{ color: 'var(--ink)' }}>
                {role.label}
              </span>
              <span
                className={`${MONO_LABEL} mt-[3px] block text-[9px]`}
                style={{ color: role.kind === 'human' ? 'var(--evidence)' : 'var(--flow)' }}
              >
                {role.kind}
              </span>
              <span className="mt-[3px] block text-[11px] leading-snug" style={{ color: 'var(--faint)' }}>
                {role.scope}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function PacketRouting({ packets }: PacketRoutingProps) {
  const [picks, setPicks] = useState<Record<string, PacketPick>>({});

  const set = (packetId: string, patch: PacketPick) =>
    setPicks((prev) => ({ ...prev, [packetId]: { ...(prev[packetId] ?? {}), ...patch } }));

  const compared = packets.filter((p) => picks[p.id]?.compared);
  const settled = compared.length === packets.length;

  return (
    <div
      data-testid="raci-routing"
      data-compared={compared.length}
      data-settled={settled ? 'true' : 'false'}
      className="grid gap-5"
    >
      <div
        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md border px-4 py-3"
        style={{
          borderColor: 'var(--line)',
          background: 'color-mix(in srgb, var(--paper) 75%, transparent)',
        }}
        aria-live="polite"
      >
        <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          packets routed
        </span>
        <span
          className="font-system text-[13px]"
          style={{ color: settled ? 'var(--evidence)' : 'var(--ink)' }}
        >
          {count(compared.length)} of {count(packets.length)}
        </span>
        <span className="text-[13px]" style={{ color: 'var(--muted)' }}>
          {settled
            ? 'Both packets have an owner and a boundary set. That pair is the output — an assignment without boundaries is not a delegation.'
            : 'Assign the hands and the outcome. One of these letters can go to an agent; the other one cannot.'}
        </span>
      </div>

      {packets.map((packet) => {
        const pick = picks[packet.id] ?? {};
        const done = pick.compared === true;
        const ready = pick.responsible !== undefined && pick.accountable !== undefined;
        const chosenA = packet.roles.find((r) => r.id === pick.accountable);
        const chosenR = packet.roles.find((r) => r.id === pick.responsible);
        const answerR = packet.roles.find((r) => r.id === packet.answer.responsible);
        const answerA = packet.roles.find((r) => r.id === packet.answer.accountable);
        const rightR = pick.responsible === packet.answer.responsible;
        const rightA = pick.accountable === packet.answer.accountable;
        const delegatedAccountability = done && chosenA?.kind === 'agent';

        return (
          <div
            key={packet.id}
            data-packet={packet.id}
            data-r-pick={pick.responsible ?? ''}
            data-a-pick={pick.accountable ?? ''}
            data-compared={done ? 'true' : 'false'}
            className="rounded-lg border p-4"
            style={{
              borderColor: done ? 'var(--line-strong)' : 'var(--line)',
              background: 'color-mix(in srgb, var(--surface) 55%, transparent)',
            }}
          >
            <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
              work packet
            </div>
            <p className="mt-1 text-[15px] leading-snug" style={{ color: 'var(--ink)' }}>
              {packet.title}
            </p>
            <p className="mt-1 text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
              {packet.context}
            </p>

            <div className="mt-4 grid gap-4">
              <RoleChoice
                packet={packet}
                letter="R"
                gloss="does the work"
                value={pick.responsible}
                onChange={(id) => set(packet.id, { responsible: id })}
                locked={done}
              />
              <RoleChoice
                packet={packet}
                letter="A"
                gloss="owns the outcome"
                value={pick.accountable}
                onChange={(id) => set(packet.id, { accountable: id })}
                locked={done}
              />
            </div>

            {!done ? (
              <button
                type="button"
                data-compare={packet.id}
                disabled={!ready}
                onClick={() => set(packet.id, { compared: true })}
                className={`${MONO_LABEL} ${FOCUS_RING} mt-4 rounded-md border px-4 py-2 text-[10px] transition-colors disabled:opacity-45`}
                style={{
                  color: 'var(--ink)',
                  borderColor: 'color-mix(in srgb, var(--flow) 50%, transparent)',
                  background: 'color-mix(in srgb, var(--flow-deep) 18%, transparent)',
                }}
              >
                compare with the authored assignment
              </button>
            ) : (
              <div className="mt-4 grid gap-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { letter: 'R', mine: chosenR, theirs: answerR, right: rightR },
                    { letter: 'A', mine: chosenA, theirs: answerA, right: rightA },
                  ].map((row) => (
                    <div
                      key={row.letter}
                      data-verdict={`${packet.id}:${row.letter}`}
                      data-matched={row.right ? 'true' : 'false'}
                      className="rounded-md border p-3"
                      style={{
                        borderColor: row.right
                          ? 'color-mix(in srgb, var(--evidence) 35%, transparent)'
                          : 'var(--line)',
                        background: row.right ? 'var(--evidence-soft)' : 'transparent',
                      }}
                    >
                      <div
                        className={`${MONO_LABEL} text-[9px]`}
                        style={{ color: row.right ? 'var(--evidence)' : 'var(--muted)' }}
                      >
                        {row.letter} · {row.right ? 'you called it' : 'authored differently'}
                      </div>
                      <p className="mt-1 text-[13px] leading-snug" style={{ color: 'var(--ink)' }}>
                        {row.theirs?.label ?? '—'}
                      </p>
                      {!row.right ? (
                        <p className="mt-1 text-[12px] leading-snug" style={{ color: 'var(--faint)' }}>
                          you routed it to {row.mine?.label ?? '—'}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>

                {delegatedAccountability ? (
                  <p
                    className="rounded-md border px-3 py-2 text-[13px] leading-snug"
                    style={{
                      color: 'var(--ink)',
                      borderColor: 'color-mix(in srgb, var(--contradiction) 45%, transparent)',
                      background: 'var(--contradiction-soft)',
                    }}
                  >
                    Accountable was routed to an agent. That is the one assignment this model
                    refuses: an agent can hold the work, but the outcome has to belong to
                    someone who can be asked to explain it afterwards.
                  </p>
                ) : null}

                {packet.verdict}

                <div>
                  <div className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                    capability boundaries · written with the assignment, not after it
                  </div>
                  <ul className="mt-2 grid gap-1">
                    {packet.boundaries.map((line) => (
                      <li
                        key={line}
                        className="text-[13px] leading-snug"
                        style={{ color: 'var(--muted)' }}
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PacketRouting;
