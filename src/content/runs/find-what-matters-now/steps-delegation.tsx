/**
 * Step twelve — RACI, and the bridge.
 *
 * The run has a constraint, a plan in the right order, and two measures. What it does not have
 * is a name against any of it, which is the point at which most strategy documents quietly stop
 * and most strategies quietly die. So the last instrument routes the work: some of it to
 * agents, some of it to people, and accountability to a named human every time.
 *
 * The routing here is not invented for the demonstration. Every packet on this step is one of
 * the three constraint actions the conductor just wrote, which is the honest order of
 * operations — routing work nobody has diagnosed is exactly how RACI becomes a document.
 *
 * The step is exported as a factory because its recap is the other eleven steps' findings, and
 * a module cannot import the list it is a member of. `./index` assembles the recap and passes
 * it in.
 */

import type { ReactNode } from 'react';
import { MONO_LABEL, WaitlistBar } from '@/components';
import { RunReplayStep } from '@/components/run/interactions';
import { RaciRoute, type RaciNode } from '@/motion/fw-raci-route';
import { Aside, Block, Figure, Pair, PullQuote, Says, Sourced } from './ui';
import { APPROVER, measure, misreading, org, system } from './pack';
import type { RunStepContent } from './types';

const NODES: RaciNode[] = [
  { id: 'intake', label: 'change-order intake', kind: 'agent', raci: 'R' },
  { id: 'estimator', label: 'estimator', kind: 'human', raci: 'C' },
  { id: 'pm', label: 'installation project manager', kind: 'human', raci: 'A' },
  { id: 'dispatch', label: 'dispatch rebooking', kind: 'agent', raci: 'R' },
  { id: 'account', label: 'account contact', kind: 'human', raci: 'I' },
];

/** The three constraint actions, each with one accountable human. */
const ROUTING: {
  action: string;
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
}[] = [
  {
    action: 'Exploit — move survey, commissioning and punch-list off the crews',
    responsible: 'service manager (human)',
    accountable: 'owner',
    consulted: 'crew foremen',
    informed: 'estimator, account contacts',
  },
  {
    action: 'Subordinate — schedule estimating and approvals to the crews',
    responsible: 'scheduling agent',
    accountable: 'installation project manager',
    consulted: 'estimator',
    informed: 'account contacts',
  },
  {
    action: 'Elevate — hire against the open installation roles',
    responsible: 'recruiting agent (sourcing only)',
    accountable: 'owner',
    consulted: 'crew foremen',
    informed: 'controller',
  },
];

export function makeStep12(recap: ReactNode): RunStepContent {
  return {
    n: 12,
    framework: 'raci',
    interaction: 'replay',
    minutes: 1.5,
    lede: 'A work packet travels the route and stops at a round node. The stop is not a failure of the automation — it is the one instrument on this site whose job is to say where the automation must not go.',
    stateInNote:
      'Delegation reads the constraint actions the conductor wrote, the key activities the canvas listed, and the organisation as it is actually built — one project manager, three crews, and an estimator paid on proposals won.',
    predictionPrompt:
      'Every action has to land on somebody. Route the packet once more, and the run prints what it decided.',
    reveal: 'Some of the work goes to agents. Accountability stays with a named human, every time.',
    stage: (
      <div className="grid gap-5">
        <RaciRoute
          nodes={NODES}
          packet="change order · reschedule three projects"
          checkpointId="pm"
        />
        <Sourced label="routed from" refs={['ev_105', 'ev_115', 'ev_116']} />
      </div>
    ),
    interactionNode: (
      <RunReplayStep
        prompt="Watch the packet stop at the human, then read the whole run back."
        instruction="Replaying re-runs the routing diagram above from its first frame. Nothing is discarded — the run remembers what you decided."
        recap={recap}
      />
    ),
    analysis: (
      <>
        <Block label="the three actions, routed">
          <div
            data-testid="raci-table"
            className="overflow-x-auto rounded-lg border"
            style={{ borderColor: 'var(--line)' }}
          >
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr>
                  {['action', 'responsible', 'accountable', 'consulted', 'informed'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className={`${MONO_LABEL} border-b px-4 py-3 text-[9px]`}
                      style={{ borderColor: 'var(--line)', color: 'var(--faint)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROUTING.map((row) => (
                  <tr key={row.action} data-raci-row={row.accountable}>
                    <td
                      className="border-b px-4 py-3 text-[13px] leading-snug"
                      style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                    >
                      {row.action}
                    </td>
                    <td
                      className="border-b px-4 py-3 text-[13px]"
                      style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
                    >
                      {row.responsible}
                    </td>
                    <td
                      className="border-b px-4 py-3 text-[13px]"
                      style={{ borderColor: 'var(--line)', color: 'var(--evidence)' }}
                    >
                      {row.accountable}
                    </td>
                    <td
                      className="border-b px-4 py-3 text-[13px]"
                      style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
                    >
                      {row.consulted}
                    </td>
                    <td
                      className="border-b px-4 py-3 text-[13px]"
                      style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
                    >
                      {row.informed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>

        <Block label="where the automation stops">
          <Pair>
            <Says claim={org('Installation project manager')} label="the route, as it runs today" />
            <Says claim={system('Change-order log')} label="what the stop currently costs" />
            <Figure
              metric={measure(APPROVER, 'Median approval time')}
              label="median, request to approval"
              note="the length of the pause in the diagram above"
            />
            <Says claim={misreading('Approvals are the problem')} label="and why it is worth fixing anyway" />
          </Pair>
        </Block>

        <Block label="the boundaries the agents run inside">
          <Says
            claim={{
              text: 'Agents may read the dispatch board, the equipment orders and the crew calendar, and may propose a sequence. They may not commit a customer date, approve a change order above the delegated threshold, or alter a signed scope. Every action they take is attributable, reversible and logged against the named accountable human.',
              status: 'recommendation',
              evidenceRefs: ['ev_115', 'ev_116'],
            }}
            label="capability boundaries"
          />
        </Block>

        <PullQuote>
          An agent can be responsible. Only a person can be accountable.
        </PullQuote>

        {/* ------------------------------------------------------------- the bridge */}
        <div
          data-testid="run-bridge"
          className="rounded-lg border p-6 sm:p-8"
          style={{
            borderColor: 'var(--line-strong)',
            background: 'color-mix(in srgb, var(--paper) 82%, transparent)',
          }}
        >
          <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
            the bridge
          </div>
          <p
            className="font-narrative mt-4 max-w-[22ch] text-[clamp(28px,4vw,46px)] leading-[1.06] text-balance"
            style={{ color: 'var(--ink)' }}
          >
            You just ran the framework once. <em className="italic">Instinct keeps it running.</em>
          </p>
          <p className="mt-5 max-w-[66ch] text-[16px] leading-[1.7]" style={{ color: 'var(--muted)' }}>
            Everything in the rail is now stale from the moment you close this tab. The dispatch
            board moves tomorrow, the wait changes next week, and the constraint moves the month
            after that — and when it does, three instruments will need to re-run and four will not.
            Knowing which is which is not a report. It is a runtime.
          </p>
          <p className="mt-4 max-w-[66ch] text-[16px] leading-[1.7]" style={{ color: 'var(--muted)' }}>
            AI is the processor. Instinct is the compiler and the runtime.
          </p>
          <div className="mt-7">
            {/*
              The bar's default headline is Ruling 6's copy law, which the panel above has just
              said in full. Repeating it two inches later spends the line twice, so the bar
              carries the other half of the same sentence instead.
            */}
            <WaitlistBar headline="Beacon Mechanical is fictional. Your company is not." />
          </div>
        </div>

        <Aside>
          The whole of this run was authored: no engine ran, no model was called, and every figure
          traces to one of twenty evidence objects in a fictional company&apos;s pack. That is the
          honest description of what you just used, and it is printed here rather than buried,
          because a simulator that misrepresents itself would have failed at the first step.
        </Aside>
      </>
    ),
    handoff:
      'The run is complete: one constraint, a plan in the right order, two measures, and a named human against every action. Replay it, restart it, or take the argument somewhere it can keep running.',
    writes: [
      {
        field: 'work_assignments',
        value: 'Each constraint action has one accountable human; two are responsible-to-agent.',
        status: 'recommendation',
        refs: ['ev_115'],
      },
      {
        field: 'capability_boundaries',
        value:
          'Agents may read, propose and sequence; committing a date or approving above the threshold stays human.',
        status: 'recommendation',
        refs: ['ev_115', 'ev_116'],
      },
    ],
  };
}
