/**
 * Steps five to seven — VRIO twice, then SWOT.
 *
 * The advantage stack is where the run turns the corner. VRIO docks exactly one sustained
 * advantage, and step six then makes the observation the entire diagnosis rests on: *the
 * advantage and the bottleneck are the same crew*. That sentence is the run's hinge, and it is
 * deliberately arrived at before Theory of Constraints has said a word — because a visitor who
 * reaches it themselves at step six will believe the amber at step eleven, and a visitor who is
 * handed it at step eleven will not.
 *
 * Step seven collects. That is all SWOT does, and pretending otherwise is how it became
 * wallpaper. What makes this collection different from the wall of sticky notes is the column
 * the wall cannot have: every entry carries how sure the run is about it, and one of the six is
 * an assumption in a strength's clothes. That entry is the one the next step's best move will
 * turn out to rest on.
 */

import { evidenceSource } from '@/components/framework-page';
import { UtilisationBars } from '@/components/run/UtilisationBars';
import { ConsequencePicker, RunPrediction } from '@/components/run/interactions';
import { MONO_LABEL } from '@/components';
import { VrioGates, type Capability } from '@/motion/fw-vrio-gates';
import { Aside, Block, Figure, Pair, PullQuote, Says, Sourced } from './ui';
import {
  APPROVER,
  COVERAGE,
  CREW,
  D,
  ESTIMATING,
  capability,
  company,
  measure,
  misreading,
  operating,
  org,
  segmentNote,
} from './pack';
import type { RunStepContent } from './types';

/* ---------------------------------------------------------------- the gates */

const CAPABILITIES: Capability[] = [
  {
    id: 'crews',
    label: 'complex retrofit crews',
    v: true,
    r: true,
    i: true,
    o: true,
    note: 'Three crews who can replace rooftop and chiller plant in an occupied building without shutting the tenant down. Scarce locally, slow to assemble, sold through a book the business already holds.',
    evidence: evidenceSource(company, 'ev_103'),
  },
  {
    id: 'coverage',
    label: 'contracted service coverage',
    v: true,
    r: false,
    i: false,
    o: true,
    note: 'Valuable and well run — and matched by three regional contractors, which is where it stops.',
    evidence: evidenceSource(company, 'ev_104'),
  },
  {
    id: 'estimating',
    label: 'estimating and bid conversion',
    v: true,
    r: true,
    i: true,
    o: false,
    note: 'Fifteen years of local pricing in one head, converting better every year — into a queue the company cannot install.',
    evidence: evidenceSource(company, 'ev_110'),
  },
  {
    id: 'approver',
    label: 'single-approver control',
    v: false,
    r: false,
    i: false,
    o: true,
    note: 'Consistently applied, thoroughly organised, and a queue in front of the constrained stage. Organisation cannot rescue a capability that fails the first gate.',
    evidence: evidenceSource(company, 'ev_116'),
  },
];

/* ------------------------------------------------------------------ step 5 */

export const step5: RunStepContent = {
  n: 5,
  framework: 'vrio',
  interaction: 'prediction',
  minutes: 1.5,
  lede: 'Four capabilities queue at four gates — valuable, rare, inimitable, organised. A capability that fails a gate is never asked about the next one, which is what stops the exercise flattering everything.',
  stateInNote:
    'The advantage instrument reads what the canvas wrote about resources and activities, plus who else is in this market and how the operation has actually been performing.',
  predictionPrompt:
    'One of these four is presented internally as a strength and does not clear the first gate. Which one?',
  reveal: 'One sustained advantage, two at parity, and one that exists and cannot be collected.',
  stage: (
    <div className="grid gap-5">
      <VrioGates capabilities={CAPABILITIES} />
      <Sourced label="gated against" refs={['ev_103', 'ev_104', 'ev_110', 'ev_115', 'ev_116', 'ev_117']} />
    </div>
  ),
  interactionNode: (
    <RunPrediction
      question="Four capabilities, four gates. Which one fails the very first gate — valuable?"
      options={[
        { id: 'crews', label: 'Complex retrofit crews', detail: 'occupied-building replacement, three crews' },
        { id: 'coverage', label: 'Contracted service coverage', detail: 'the maintenance book and the emergency line' },
        { id: 'estimating', label: 'Estimating and bid conversion', detail: 'one estimator, fifteen years of pricing' },
        { id: 'approver', label: 'Single-approver project control', detail: 'one desk signs every change' },
      ]}
      correctId="approver"
      reveal={
        <div className="grid gap-3">
          <Aside>
            It is the one the company would have listed first. Consistency is not value: a control
            that reliably delays the scarcest resource in the business is thoroughly organised
            around something that fails the gate before organisation is even asked about.
          </Aside>
          <Says claim={capability(APPROVER).assessment} label="the pack, written before the gates were drawn" />
        </div>
      }
    />
  ),
  analysis: (
    <>
      <Block label="four verdicts">
        <Pair>
          <Says claim={capability(CREW).assessment} label="retrofit crews · sustained" />
          <Says claim={capability(ESTIMATING).assessment} label="estimating · uncaptured" />
          <Says claim={capability(COVERAGE).assessment} label="service coverage · parity" />
          <Says claim={capability(APPROVER).assessment} label="single-approver control · parity" />
        </Pair>
      </Block>
      <Aside>
        One sustained advantage out of four candidates is a healthy result, not a poor one. The
        two that stop early are the ordinary substance of a working business. The one that stops
        at the last gate — an advantage that exists and is not being collected — is usually one
        incentive or one scheduling rule away from being collected, which is cheaper than
        anything the other gates could suggest.
      </Aside>
    </>
  ),
  handoff:
    'The instrument has found the one thing this company owns that a competitor cannot quickly copy. The next step asks the uncomfortable second question about it.',
  writes: [
    {
      field: 'capabilities_vrio',
      value:
        'Retrofit crews sustained · estimating uncaptured · service coverage and single-approver control at parity.',
      status: 'supported-inference',
      refs: ['ev_103', 'ev_104', 'ev_110', 'ev_116'],
    },
  ],
};

/* ------------------------------------------------------------------ step 6 */

export const step6: RunStepContent = {
  n: 6,
  framework: 'vrio',
  interaction: 'consequence',
  minutes: 1,
  lede: 'The advantage is real, rare, hard to copy and well organised. It is also booked to the top of its range, every month, for most of a year.',
  stateInNote:
    'The gate results come back in alongside the capacity numbers they were scored against. Same crews, two instruments, and the second one asks what the first one could not.',
  predictionPrompt:
    'You have exactly one sustained advantage in this business and it is running flat out. What do you do with it?',
  reveal: 'The gap is not a capability the company lacks — it is one it cannot get more of quickly.',
  stage: (
    <div className="grid gap-5">
      <UtilisationBars
        advantage="retrofit crews"
        pools={[
          {
            id: 'installation',
            label: 'Installation crews',
            percent: D.installUtilization,
            note: 'twelve technicians, three crews, eight consecutive months above ninety per cent',
            tone: 'advantage',
          },
          {
            id: 'service',
            label: 'Service technicians',
            percent: D.serviceUtilization,
            note: 'twenty-two technicians on planned maintenance and the emergency line',
            tone: 'slack',
          },
        ]}
      />
      <Sourced label="booked hours from" refs={['ev_103', 'ev_104', 'ev_112']} />
    </div>
  ),
  interactionNode: (
    <ConsequencePicker
      prompt="Four things a reasonable operator would do with a sustained advantage. Run each one forward."
      instruction="Nothing here is scored right or wrong. Open all four and read them side by side — the differences between them are the finding."
      options={[
        {
          id: 'sell',
          label: 'Sell more of it',
          basis: 'The obvious move, and the one the sales conversation always reaches for.',
          effect: 'loads',
          consequence: <Says claim={misreading('Demand is the problem')} label="run forward" />,
        },
        {
          id: 'protect',
          label: 'Protect it — pay to keep the crews',
          basis: 'Real, urgent, and about retention rather than about output.',
          effect: 'elsewhere',
          consequence: (
            <Says
              claim={{
                text: 'Two installation technicians resigned this year and both cited overtime, against overtime that is now scheduled in advance rather than exceptional. Protecting the crews stops the advantage shrinking. It does not make it larger.',
                status: 'supported_inference',
                evidenceRefs: ['ev_117', 'ev_112'],
              }}
              label="run forward"
            />
          ),
        },
        {
          id: 'elevate',
          label: 'Add crews',
          basis: 'The answer everybody arrives at, and the slowest one available.',
          effect: 'releases',
          consequence: <Says claim={misreading('Hiring alone will resolve it')} label="run forward" />,
        },
        {
          id: 'shift',
          label: 'Take the work off them that is not installing',
          basis: 'Survey, commissioning, punch-list — hours the crews spend not doing the scarce thing.',
          effect: 'releases',
          consequence: (
            <div className="grid gap-2">
              <Figure
                metric={operating('Service utilisation')}
                label="the pool with headroom"
                note="against installation crews, who have none"
              />
              <Says
                claim={{
                  text: 'The headroom is real and the arithmetic is attractive. Whether these technicians are qualified for punch-list and commissioning on retrofit work is not in the pack, and this run will not assume it. Recorded as the capability question to answer first.',
                  status: 'assumption',
                  evidenceRefs: ['ev_104', 'ev_114'],
                }}
                label="and what it rests on"
              />
            </div>
          ),
        },
      ]}
      settled={
        <Aside>
          Two of the four give hours back and both are slow: one is a hiring cycle, the other is a
          question nobody has answered. The two quick moves do not add capacity at all. That is the
          shape of a business at its ceiling, and it is worth seeing before anybody names a
          constraint.
        </Aside>
      }
    />
  ),
  analysis: (
    <>
      <Block label="the same crew, from both sides">
        <Pair>
          <Says claim={capability(CREW).assessment} label="the advantage lens" />
          <Figure metric={operating('Installation utilisation')} label="the capacity lens" />
        </Pair>
      </Block>
      <PullQuote>
        The one thing this company owns that nobody can copy is also the one thing it cannot buy
        more of this quarter.
      </PullQuote>
      <Block label="what stands between here and more of it">
        <Says claim={org('Installation technicians')} label="the hiring position" />
        <Figure metric={measure(CREW, 'Projects completed')} label="what the crews delivered" />
      </Block>
      <Aside>
        This is a capability gap of an unusual kind. Nothing is missing from the company — the
        skill is there, the reputation is there, the demand is there. What is missing is more
        hours of the specific thing that is already the best thing about the business.
      </Aside>
    </>
  ),
  handoff:
    'Two instruments have now produced findings and one contradiction between them. Before generating options, the run collects everything it has learned into one place — and attaches to each entry how sure it is.',
  writes: [
    {
      field: 'capability_gaps',
      value: 'Installation crew hours — three roles open, ninety-four-day average time to hire.',
      status: 'fact',
      refs: ['ev_117'],
    },
  ],
};

/* ------------------------------------------------------------------ step 7 */

const QUADRANTS: {
  id: string;
  label: string;
  tone: string;
  entries: { id: string; text: string }[];
}[] = [
  {
    id: 's',
    label: 'strengths',
    tone: 'var(--evidence)',
    entries: [
      { id: 's1', text: 'Crews that finish occupied-building retrofits without a second visit' },
      { id: 's2', text: 'A service book with real headroom in it' },
    ],
  },
  {
    id: 'w',
    label: 'weaknesses',
    tone: 'var(--contradiction)',
    entries: [
      { id: 'w1', text: 'Every change order waits on one approver' },
      { id: 'w2', text: 'Signed work waits most of a season for a crew' },
    ],
  },
  {
    id: 'o',
    label: 'opportunities',
    tone: 'var(--flow)',
    entries: [{ id: 'o1', text: 'Industrial buyers who pay for a date rather than a discount' }],
  },
  {
    id: 't',
    label: 'threats',
    tone: 'var(--muted)',
    entries: [{ id: 't1', text: 'Distributor lead times doubled at the last renewal' }],
  },
];

export const step7: RunStepContent = {
  n: 7,
  framework: 'swot',
  interaction: 'prediction',
  minutes: 1.5,
  lede: 'Six entries, four quadrants. Identical in shape to the version on every office wall, and different in the one way that matters: each entry carries the evidence behind it and how sure the run is.',
  stateInNote:
    'Collection reads everything the run has produced so far — the gated capabilities, the gap, the force scores — plus the dated external facts the terrain read surfaced: the distributor renewal, and the account that moved over a date.',
  predictionPrompt:
    'Five of these entries come off a system export. One does not. Which entry is the run least sure about?',
  reveal: 'Five entries come off a system export. One is an assumption wearing a strength’s clothes.',
  stage: (
    <div className="grid gap-5">
      <div
        data-testid="swot-board"
        className="grid gap-px overflow-hidden rounded-lg border sm:grid-cols-2"
        style={{ borderColor: 'var(--line)', background: 'var(--line)' }}
      >
        {QUADRANTS.map((q) => (
          <div
            key={q.id}
            data-quadrant={q.id}
            className="px-5 py-5"
            style={{ background: 'color-mix(in srgb, var(--surface) 70%, var(--void))' }}
          >
            <div className={`${MONO_LABEL} text-[10px]`} style={{ color: q.tone }}>
              {q.label}
            </div>
            <ul className="mt-3 grid gap-2">
              {q.entries.map((entry) => (
                <li
                  key={entry.id}
                  data-swot-entry={entry.id}
                  className="text-[14px] leading-snug"
                  style={{ color: 'var(--ink)' }}
                >
                  {entry.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Sourced label="collected from" refs={['ev_103', 'ev_104', 'ev_105', 'ev_109', 'ev_116', 'ev_119']} />
    </div>
  ),
  interactionNode: (
    <RunPrediction
      question="Four of the six entries. Which one is not supported by anything in the pack?"
      options={[
        {
          id: 's1',
          label: 'Crews that finish retrofits without a second visit',
          detail: 'strength',
        },
        { id: 's2', label: 'A service book with real headroom in it', detail: 'strength' },
        { id: 'w2', label: 'Signed work waits most of a season for a crew', detail: 'weakness' },
        { id: 't1', label: 'Distributor lead times doubled at renewal', detail: 'threat' },
      ]}
      correctId="s2"
      reveal={
        <div className="grid gap-3">
          <Aside>
            The headroom itself is measured and real. What is not evidenced is the thing the entry
            is doing on the board: sitting in the strengths column implies it can be spent, and
            nothing in the pack says these technicians can do retrofit punch-list and
            commissioning. A wall of sticky notes cannot make that distinction. A field with a
            status on it cannot avoid making it.
          </Aside>
          <Says
            claim={{
              text: 'Service technicians run at roughly three-quarters of their scheduled hours against installation crews at over ninety per cent. The headroom is real. Whether it can take work off the crews is a separate question, and the pack does not answer it.',
              status: 'supported_inference',
              evidenceRefs: ['ev_104', 'ev_103'],
            }}
            label="what is actually known"
          />
        </div>
      }
    />
  ),
  analysis: (
    <>
      <Block label="every entry, with what is under it">
        <Pair>
          <Says claim={capability(CREW).assessment} label="strength · retrofit crews" />
          <Says
            claim={{
              text: 'Signed installation projects wait a median of sixty-eight days for a crew, against twenty-four days a year ago, and scheduling is now the largest complaint theme in the service desk log.',
              status: 'fact',
              evidenceRefs: ['ev_105', 'ev_108'],
            }}
            label="weakness · the wait for a crew"
          />
          <Says claim={capability(APPROVER).assessment} label="weakness · one approver" />
          <Says
            claim={segmentNote('Industrial and logistics facilities', 'This segment is the most willing')}
            label="opportunity · buyers who pay for speed"
          />
        </Pair>
      </Block>
      <Aside>
        Two of these come off a system export, one is an inference, and one is a hypothesis
        carried forward as an open question. A photograph of a whiteboard preserves none of that
        distinction, which is exactly why the quadrant ages so badly: an entry that cannot say how
        sure it is will be exactly as confident next year as it is today.
      </Aside>
    </>
  ),
  handoff:
    'Collection is finished, and collection generates nothing. The cross is next, and it is where the four lists stop being a description and start being a decision.',
  writes: [
    {
      field: 'swot_entries',
      value:
        'Six entries with evidence strength attached — two strengths, two weaknesses, one opportunity, one threat.',
      status: 'supported-inference',
      refs: ['ev_103', 'ev_104', 'ev_105', 'ev_109'],
    },
  ],
};
