/**
 * `/frameworks/raci` — the delegation instrument, running on Beacon Mechanical.
 *
 * The last of the six, and the one the whole site has been walking toward: some of the work
 * goes to people, some goes to agents, and accountability stays human. `fw/raci-route` makes
 * that a picture — a packet travelling a route, stopping at a round node, waiting while a
 * signature draws — and this page makes it a thing the visitor does with their hands.
 *
 * Two decisions worth knowing about.
 *
 * **The interventions are the conductor's, not invented here.** Both packets in the explore
 * section come off Beacon's constraint diagnosis: re-sequencing the board when a change order
 * lands, and approving a change order that moves a customer's date. Routing work nobody has
 * diagnosed is how RACI becomes a document, so the page routes work that already has a reason
 * to exist.
 *
 * **The second packet's answer is a human on both letters, deliberately.** A page arguing for
 * delegation is under quiet pressure to make every example delegable, and the honest answer
 * to a queue in front of one approver is often a second approver with a threshold rather than
 * an agent. Getting that wrong in the direction of automation would be the same failure as
 * the capabilities slide that flatters everything, one framework later.
 *
 * No amber: the queue in front of the approver is real and it is not this page's constraint
 * to name (00-LAW Ruling 2).
 */

import { LensSwitch, MONO_LABEL } from '@/components';
import {
  beaconMechanical,
  beaconProfile,
  beaconStory,
} from '@/content/companies/beacon-mechanical';
import RaciLesson from '@/content/frameworks/raci/lesson.mdx';
import type { Claim, Metric } from '@/lib/claim';
import { RaciRoute, type RaciNode } from '@/motion/fw-raci-route';
import { ClaimLine, EvidenceChips, MetricLine } from '../Claims';
import { PacketRouting, type RoutingPacket, type RoutingRole } from '../interactions/PacketRouting';
import type { FrameworkPageConfig } from '../types';

const company = beaconMechanical;

/* --------------------------------------------------- figures, from the pack */

function capability(name: string) {
  const found = beaconProfile.capabilities.items.find((c) => c.name === name);
  if (!found) throw new Error(`Beacon's profile has no capability "${name}"`);
  return found;
}

function measure(capabilityName: string, label: string): Metric {
  const found = capability(capabilityName).measures.find((m) => m.label === label);
  if (!found) throw new Error(`Beacon's "${capabilityName}" has no measure "${label}"`);
  return found;
}

function operating(label: string): Metric {
  const found = beaconProfile.operating.items.find((m) => m.label === label);
  if (!found) throw new Error(`Beacon's operating measures have no "${label}"`);
  return found;
}

function org(role: string): Claim {
  const found = beaconProfile.org.items.find((u) => u.role === role);
  if (!found) throw new Error(`Beacon's profile has no role "${role}"`);
  return found.note;
}

function system(name: string): Claim {
  const found = beaconProfile.systems.items.find((s) => s.name === name);
  if (!found) throw new Error(`Beacon's profile has no system of record "${name}"`);
  return found.note;
}

function misreading(prefix: string): Claim {
  const found = beaconStory.constraint.misreadings.find((c) => c.text.startsWith(prefix));
  if (!found) throw new Error(`Beacon's story has no misreading starting "${prefix}"`);
  return found;
}

const APPROVER = 'Single-approver project control';

/* ------------------------------------------------------------- the showpiece */

/**
 * Beacon's change-order route as it actually runs. The accountable node is the installation
 * project manager, which is where the recipe puts the checkpoint by default — and where the
 * pack puts every change order and every schedule change in the business.
 */
const NODES: RaciNode[] = [
  { id: 'intake', label: 'change-order intake', kind: 'agent', raci: 'R' },
  { id: 'estimator', label: 'estimator', kind: 'human', raci: 'C' },
  { id: 'pm', label: 'installation project manager', kind: 'human', raci: 'A' },
  { id: 'dispatch', label: 'dispatch rebooking', kind: 'agent', raci: 'R' },
  { id: 'account', label: 'account contact', kind: 'human', raci: 'I' },
];

const SHOWPIECE_SOURCES = ['ev_105', 'ev_115', 'ev_116'];

const ROUTE_BASIS: { step: string; claim: Claim }[] = [
  {
    step: 'the route, as it runs today',
    claim: org('Installation project manager'),
  },
  {
    step: 'what the stop costs',
    claim: system('Change-order log'),
  },
  {
    step: 'why it is worth fixing, and why it is not the fix',
    claim: misreading('Approvals are the problem'),
  },
];

const READING = (
  <div className="grid gap-4">
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
        the stop, sourced
      </span>
      <span className="text-[14px]" style={{ color: 'var(--muted)' }}>
        One desk, every change, and a measurable wait.
      </span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {ROUTE_BASIS.map((row) => (
        <ClaimLine key={row.step} claim={row.claim} company={company} label={row.step} />
      ))}
      <MetricLine
        metric={measure(APPROVER, 'Median approval time')}
        company={company}
        label="median time, request to approval"
        note="the length of the pause in the picture above"
      />
    </div>
    <p className="max-w-[68ch] text-[15px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
      The pause is not the failure. A packet that stops for a human signature is the model
      working — this is the one framework on the site whose job is to say where the automation
      must not go. The failure is that the pause has one holder, no threshold and no measured
      wait, so a designed stop and an accidental queue look identical from the outside until
      somebody counts the days.
    </p>
  </div>
);

/* ------------------------------------------------------------ the interaction */

const REBOOK_ROLES: RoutingRole[] = [
  {
    id: 'scheduler',
    label: 'scheduling agent',
    kind: 'agent',
    scope: 'reads the board, the equipment orders and the crew calendar; proposes a sequence',
  },
  {
    id: 'pm',
    label: 'installation project manager',
    kind: 'human',
    scope: 'owns every customer commitment across the three crews',
  },
  {
    id: 'service',
    label: 'service manager',
    kind: 'human',
    scope: 'runs the maintenance book and the emergency line, on a different clock',
  },
];

const APPROVE_ROLES: RoutingRole[] = [
  {
    id: 'intake-agent',
    label: 'intake agent',
    kind: 'agent',
    scope: 'assembles the scope change, the cost and every date it touches into one packet',
  },
  {
    id: 'foreman',
    label: 'crew foreman',
    kind: 'human',
    scope: 'is on the site and knows what the change really costs in hours',
  },
  {
    id: 'pm-2',
    label: 'installation project manager',
    kind: 'human',
    scope: 'approves every change order today, and is the reason the queue has one shape',
  },
];

const PACKETS: RoutingPacket[] = [
  {
    id: 'rebook',
    title: 'Re-sequence the dispatch board when a change order lands',
    context:
      'A scope change arrives on a live project. The board has to be reworked against crew availability, equipment already on order, and dates other customers have already been given.',
    roles: REBOOK_ROLES,
    answer: { responsible: 'scheduler', accountable: 'pm' },
    verdict: (
      <div className="grid gap-2">
        <ClaimLine
          claim={{
            text: 'Re-sequencing is a rules problem: crew availability, equipment already ordered, dates already promised. An agent can hold the work and do it the moment the change lands rather than the evening the project manager gets to it. What it cannot hold is the decision to tell a customer their date has moved — so responsibility moves and accountability does not.',
            status: 'recommendation',
            evidenceRefs: ['ev_105', 'ev_115'],
          }}
          company={company}
          label="why the letters split here"
        />
        <MetricLine
          metric={operating('Median wait, signature to start')}
          company={company}
          label="the wait this is being sequenced into"
        />
      </div>
    ),
    boundaries: [
      'May read the dispatch board, the equipment orders and the crew calendar. Not payroll, not pricing.',
      'May propose a sequence, and may write it once the project manager has accepted it.',
      'Stops and asks whenever a proposed sequence would move a date already given to a customer.',
      'Revoked by the project manager in one action, and the board reverts to the last accepted sequence.',
    ],
  },
  {
    id: 'approve',
    title: "Approve a change order that moves a customer's start date",
    context:
      'The scope has grown and the equipment is on a longer lead time. Somebody has to decide whether this customer waits or another one does.',
    roles: APPROVE_ROLES,
    answer: { responsible: 'foreman', accountable: 'pm-2' },
    verdict: (
      <div className="grid gap-2">
        <ClaimLine claim={misreading('Approvals are the problem')} company={company} />
        <ClaimLine
          claim={{
            text: 'The honest answer to a queue in front of one approver is usually a second approver with a written threshold, not an agent. An intake agent can assemble the packet; the judgement itself commits the scarcest resource in the business to one customer instead of another, and that is exactly the kind of decision this framework exists to keep in human hands.',
            status: 'recommendation',
            evidenceRefs: ['ev_116', 'ev_115'],
          }}
          company={company}
          label="why both letters stay human"
        />
      </div>
    ),
    boundaries: [
      'The intake agent may assemble the packet: scope, cost, the crews touched, every date affected.',
      'A foreman may approve inside an agreed cost and schedule threshold; anything above it routes onward.',
      'Nothing that moves a date already given to a customer is approved without the project manager.',
      'Every approval records who decided and on what basis, so the wait can be measured next quarter.',
    ],
  },
];

/* ---------------------------------------------------------------- the compare */

const COMPARE = (
  <LensSwitch
    label="The same stop, before and after"
    lenses={[
      {
        id: 'today',
        label: 'As it runs',
        caption: 'one holder, no threshold, unmeasured',
        content: (
          <div className="grid gap-2">
            <MetricLine
              metric={measure(APPROVER, 'Change orders raised')}
              company={company}
              label="change orders, trailing twelve months"
            />
            <MetricLine
              metric={measure(APPROVER, 'Median approval time')}
              company={company}
              label="median time, request to approval"
            />
            <ClaimLine claim={system('Change-order log')} company={company} />
            <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              Nobody designed this. It is what happens when accountability drifts to the most
              senior person in the room and nothing downstream is ever timed.
            </p>
          </div>
        ),
      },
      {
        id: 'routed',
        label: 'As routed',
        caption: 'the same stop, with a threshold and a name on it',
        content: (
          <div className="grid gap-2">
            <ClaimLine
              claim={{
                text: 'The stop stays exactly where it was. What changes is that it is no longer the only stop: intake and re-sequencing move to agents with boundaries, approval under a threshold moves to the foreman on site, and the project manager keeps the outcome and the decisions that move a customer date. The wait becomes a measured number rather than a habit.',
                status: 'recommendation',
                evidenceRefs: ['ev_116', 'ev_115'],
              }}
              company={company}
              label="the routed version"
            />
            <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              Two of the three moves here are delegations to software and one is a delegation
              to a person, which is roughly the ratio most businesses will find when they
              actually run this. The letters do the sorting; nothing about it requires a view
              on whether automation is good.
            </p>
          </div>
        ),
      },
    ]}
  />
);

/* ----------------------------------------------------------------- the config */

export const raciPageConfig: FrameworkPageConfig = {
  id: 'raci',
  showpiece: {
    recipe: 'fw/raci-route',
    actTitle: 'the delegation',
    headline: (
      <>
        The packet stops. That is the framework <em className="italic">working</em>.
      </>
    ),
    note: "A change order travelling Beacon's real route: an agent takes it in, the estimator is consulted, and then everything waits at a round node while one human signs. Round is human, square is agent, and the round one owns the outcome.",
    pin: 2,
    diagram: <RaciRoute nodes={NODES} packet="change order · rooftop replacement" />,
    evidenceRefs: SHOWPIECE_SOURCES,
    caption: (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          routed from
        </span>
        <EvidenceChips company={company} refs={SHOWPIECE_SOURCES} />
      </div>
    ),
    reading: READING,
  },
  lesson: {
    Body: RaciLesson,
    path: 'src/content/frameworks/raci/lesson.mdx',
  },
  explore: {
    title: (
      <>
        Route two real packets. One letter will not <em className="italic">move</em>.
      </>
    ),
    lede: "Both of these come off Beacon's constraint diagnosis rather than out of a workshop. Assign the hands and the outcome for each, then compare with the authored routing — including the one assignment this model refuses to delegate under any circumstances.",
    prediction: {
      kicker: 'predict before you route',
      question:
        'Two interventions, both touching the same overloaded desk. Which of them can an agent be responsible for?',
      options: [
        {
          id: 'rebook',
          label: 'Re-sequencing the dispatch board when a change order lands',
          detail: 'rules, calendars and equipment dates',
        },
        {
          id: 'approve',
          label: "Approving a change order that moves a customer's start date",
          detail: 'scope, cost, and whose project waits',
        },
        { id: 'both', label: 'Both of them', detail: 'with a human accountable for each' },
        { id: 'neither', label: 'Neither', detail: 'the work is too consequential to delegate' },
      ],
      correctId: 'rebook',
      reveal: (
        <div className="grid gap-3">
          <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
            Re-sequencing is a rules problem with checkable inputs and a checkable output, and
            it is currently waiting on an evening. Approving is a judgement that commits the
            scarcest resource in the business to one customer rather than another. The letters
            sort them without anybody needing a position on automation — and in both cases the
            outcome stays with the same named human.
          </p>
          <ClaimLine claim={system('Change-order log')} company={company} />
        </div>
      ),
    },
    interaction: <PacketRouting packets={PACKETS} />,
    compare: COMPARE,
  },
  unlocked: [
    'Two activities routed with a named accountable human on each, and the responsible letter split between an agent and a person on evidence rather than on preference.',
    'A boundary set written at the same time as the assignment: systems, data scope, the threshold that sends work back, and how the delegation is revoked.',
    'A risk on the record that the org chart could not show: every change order and every schedule change resting on one desk, with no threshold and no measured wait.',
  ],
};

export default raciPageConfig;
