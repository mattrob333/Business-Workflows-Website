/**
 * Steps eight and nine — TOWS, and the injected event.
 *
 * Step eight is where SWOT stops describing and starts generating: the four lists cross, and
 * four options get minted with an origin stamped on each one. Three of them add work to the
 * stage the run has already noticed has no room in it. The fourth gives hours back and rests
 * entirely on the assumption step seven flagged — which is the honest shape of most good
 * strategy: the best available move is the one whose premise nobody has checked.
 *
 * Step nine is the run's argument for itself. A competitor closes a funding round, and every
 * instrument on the board is suddenly in question. The finding is that most of them are not:
 * three re-run, four hold, and none of the three touches the rate. That is the difference
 * between a company model and a folder of decks — the folder has to be redone entirely,
 * because nothing in it knows what it depends on.
 */

import { EventInjection, RunPrediction } from '@/components/run/interactions';
import { GlassPanel, MONO_LABEL } from '@/components';
import { TowsCross, type TowsCard, type TowsCrossing } from '@/motion/fw-tows-cross';
import { Aside, Block, Figure, Pair, PullQuote, Says, Sourced } from './ui';
import { CREW, capability, misreading, operating, segmentNote, system } from './pack';
import type { RunStepContent } from './types';

/* ----------------------------------------------------------------- the cross */

const STRENGTHS: TowsCard[] = [
  { id: 's1', text: 'Crews that finish occupied-building retrofits without a second visit' },
  { id: 's2', text: 'A service book with real headroom in it' },
];

const WEAKNESSES: TowsCard[] = [
  { id: 'w1', text: 'Every change order waits on one approver' },
  { id: 'w2', text: 'Signed work waits most of a season for a crew' },
];

const OPPORTUNITIES: TowsCard[] = [
  { id: 'o1', text: 'Industrial buyers who pay for a date rather than a discount' },
  { id: 'o2', text: 'Accounts asking for planned replacement programmes' },
];

const THREATS: TowsCard[] = [
  { id: 't1', text: 'Distributor lead times doubled at the last renewal' },
  { id: 't2', text: 'The largest accounts moving work over start dates' },
];

const CROSSINGS: TowsCrossing[] = [
  {
    id: 'so',
    kind: 'SO',
    internal: 's1',
    external: 'o1',
    option: 'Push retrofit volume into the industrial segment, where buyers pay for speed.',
  },
  {
    id: 'st',
    kind: 'ST',
    internal: 's1',
    external: 't2',
    option: 'Guarantee start windows to the largest accounts before a missed date decides for them.',
  },
  {
    id: 'wo',
    kind: 'WO',
    internal: 'w2',
    external: 'o2',
    option:
      'Take the planned-replacement programmes, but run survey, commissioning and punch-list off the service book so crew hours go only to installing.',
  },
  {
    id: 'wt',
    kind: 'WT',
    internal: 'w1',
    external: 't1',
    option:
      'Delegate change-order approval under a threshold and order long-lead equipment against the signed queue.',
  },
];

/* ------------------------------------------------------------------ step 8 */

export const step8: RunStepContent = {
  n: 8,
  framework: 'tows',
  interaction: 'prediction',
  minutes: 1.5,
  lede: 'Strengths cross opportunities, weaknesses cross threats, and at each intersection a strategy option is minted with its origin stamped on it. SWOT gathered; this generates.',
  stateInNote:
    'The six collected entries come back in together with the force scores, so a minted option can be checked against the terrain it would have to survive.',
  predictionPrompt:
    'Four options get minted. Three of them add work to the stage with the least room in it. Which one gives hours back?',
  reveal: 'One of the four moves releases capacity — and it rests on something the pack cannot confirm.',
  stage: (
    <div className="grid gap-5">
      <TowsCross
        strengths={STRENGTHS}
        weaknesses={WEAKNESSES}
        opportunities={OPPORTUNITIES}
        threats={THREATS}
        crossings={CROSSINGS}
      />
      <Sourced label="crossed from" refs={['ev_103', 'ev_104', 'ev_105', 'ev_109', 'ev_116', 'ev_119']} />
    </div>
  ),
  interactionNode: (
    <RunPrediction
      question="Four minted options. Which one is the only move that returns installation hours?"
      options={[
        {
          id: 'so',
          label: 'SO · push retrofit volume into industrial',
          detail: 'sell the advantage into the segment that pays for speed',
        },
        {
          id: 'st',
          label: 'ST · guarantee start windows to the largest accounts',
          detail: 'defend the accounts most likely to leave',
        },
        {
          id: 'wo',
          label: 'WO · run survey and commissioning off the service book',
          detail: 'take non-installing work off the crews',
        },
        {
          id: 'wt',
          label: 'WT · delegate approval and pre-order long-lead equipment',
          detail: 'shorten the two waits in front of the work',
        },
      ]}
      correctId="wo"
      reveal={
        <div className="grid gap-3">
          <Aside>
            Both strength-led moves sell more of the scarcest thing in the business. The
            weakness–threat move is genuinely worth doing and moves days where the limit moves
            weeks. Only the fourth changes what a crew spends its hours on — and it is the only one
            whose premise is not yet evidenced.
          </Aside>
          <Says
            claim={{
              text: 'Whether punch-list and commissioning can move to the service pool is an assumption. The pack shows the headroom, and shows that rework traces to compressed schedules rather than to skill; it does not show that these technicians are qualified for this work. That is the open question, and it is the one worth answering first.',
              status: 'assumption',
              evidenceRefs: ['ev_104', 'ev_114'],
            }}
            label="what would have to be true"
          />
        </div>
      }
    />
  ),
  analysis: (
    <>
      <Block label="the three that load the same stage">
        <Pair>
          <Figure
            metric={operating('Signed projects awaiting a crew')}
            label="what SO and ST would add to"
            note="already signed, already waiting"
          />
          <Says
            claim={{
              text: 'Both strength-led moves add installation work to a dispatch board that already holds thirty-one signed projects at a median wait of sixty-eight days, in a year when contracts signed ran fourteen ahead of projects completed.',
              status: 'supported_inference',
              evidenceRefs: ['ev_105', 'ev_106'],
            }}
            label="run against the board"
          />
        </Pair>
      </Block>
      <Block label="the one that moves days rather than weeks">
        <Says claim={misreading('Approvals are the problem')} label="WT · delegate approval" />
      </Block>
      <PullQuote>
        The best available option is the one whose premise nobody has checked. That is not a flaw
        in the analysis — it is the analysis telling you what to go and find out.
      </PullQuote>
      <Aside>
        Four options, one of them recorded with an unproven assumption bolted to it rather than
        quietly leaned on. The assumption travels with the option from here on, which is what
        stops it being forgotten by the time somebody is deciding whether to fund it.
      </Aside>
    </>
  ),
  handoff:
    'Four options are on the record and the run is about to rank them. This is the moment the outside world usually chooses to change.',
  writes: [
    {
      field: 'strategic_options',
      value:
        'Four minted — SO and ST load the crews, WT moves days, WO is the only one that releases hours.',
      status: 'supported-inference',
      refs: ['ev_105', 'ev_116', 'ev_104'],
    },
    {
      field: 'assumptions',
      value: 'Service technicians are qualified for punch-list and commissioning — unconfirmed.',
      status: 'assumption',
      refs: ['ev_104', 'ev_114'],
      revises: true,
    },
  ],
};

/* ------------------------------------------------------------------ step 9 */

const EVENT_LABEL = 'a regional competitor closes a funding round';

export const step9: RunStepContent = {
  n: 9,
  framework: 'tows',
  interaction: 'event-injection',
  minutes: 1.5,
  lede: 'Something happens that was not in the pack. In a folder of documents this is the moment all of them quietly expire. In a model, it is a question with a checkable answer.',
  stateInNote:
    'The four minted options come back in, along with the competitor picture and the dated external facts. The run now has to say which of its own instruments this event invalidates.',
  predictionPrompt:
    'A competitor raises capital. Mark the instruments you think have to run again — then inject it and watch the graph disagree with you.',
  reveal: 'Three instruments re-run. Four hold. None of the three changes what to do on Monday.',
  stage: (
    <div className="grid gap-5">
      <GlassPanel pad="lg" eyebrow="injected signal">
        <p className="font-narrative text-[clamp(20px,2.6vw,28px)] leading-tight" style={{ color: 'var(--ink)' }}>
          A regional competitor closes a funding round and says it will hire.
        </p>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7]" style={{ color: 'var(--muted)' }}>
          This is not in Beacon&apos;s evidence pack and the run does not pretend otherwise. It is
          injected — a scripted external event, carrying no figures, used to ask the only question
          that matters when the world moves: which parts of what we already decided are now wrong?
        </p>
        <div className={`${MONO_LABEL} mt-5 text-[9px]`} style={{ color: 'var(--faint)' }}>
          not evidence · injected for this step · nothing downstream treats it as a fact
        </div>
      </GlassPanel>
    </div>
  ),
  interactionNode: (
    <EventInjection
      prompt="Which of the seven instruments has to run again?"
      instruction="Mark your answers first — the marking is free and reversible. Injecting the event lights the edges into the instruments that genuinely re-run, and leaves the rest dark."
      eventLabel={EVENT_LABEL}
      targets={[
        {
          id: 'bmc',
          name: 'BMC',
          reruns: false,
          fields: [],
          verdict: (
            <Says
              claim={{
                text: 'The canvas describes who Beacon serves, what it promises them and where the money comes from. A competitor’s balance sheet changes none of those blocks. If it eventually changes the segment mix, the change will arrive as a revenue fact and the canvas will re-run then.',
                status: 'supported_inference',
                evidenceRefs: ['ev_101', 'ev_107'],
              }}
            />
          ),
        },
        {
          id: 'five-forces',
          name: 'Five Forces',
          reruns: true,
          fields: ['Force scores', 'Risks'],
          verdict: (
            <Says
              claim={{
                text: 'Rivalry and new entrants are scored on how many contractors offer comparable coverage and how hard crews are to assemble. A funded competitor moves both, and both were already carried as assumptions rather than facts.',
                status: 'assumption',
                evidenceRefs: ['ev_104', 'ev_117'],
              }}
            />
          ),
        },
        {
          id: 'vrio',
          name: 'VRIO',
          reruns: false,
          fields: [],
          verdict: (
            <Says
              claim={{
                text: 'Tempting, and no. Inimitability here is a hiring lead time: three roles have been open for months against a ninety-four-day average time to hire. Capital does not shorten that this quarter. Watch crew departures and time-to-hire as the indicator that would move the score — a leading indicator, not a finding.',
                status: 'hypothesis',
                evidenceRefs: ['ev_117'],
              }}
            />
          ),
        },
        {
          id: 'swot',
          name: 'SWOT',
          reruns: true,
          fields: ['SWOT entries'],
          verdict: (
            <Says
              claim={{
                text: 'A funded competitor in the same metro is a threat entry with a date on it. Collection is exactly the instrument for that, and the entry arrives as a hypothesis rather than as a fact because nothing has happened yet.',
                status: 'hypothesis',
                evidenceRefs: ['ev_119'],
              }}
            />
          ),
        },
        {
          id: 'tows',
          name: 'TOWS',
          reruns: true,
          fields: ['Strategic options', 'Risks'],
          verdict: (
            <Says
              claim={{
                text: 'One of the cross’s inputs changed, so the cross regenerates. The move that guarantees start windows to the largest accounts gains urgency — those accounts have already shown they will move work over a date — and the ranking of the four options does not change.',
                status: 'supported_inference',
                evidenceRefs: ['ev_119'],
              }}
            />
          ),
        },
        {
          id: 'theory-of-constraints',
          name: 'Conductor',
          reruns: false,
          fields: [],
          verdict: (
            <Says
              claim={{
                text: 'Throughput here is set by installation crew hours, and nothing in a competitor’s raise adds or removes one of those hours. The rate this business runs at is an internal fact. It would still be the rate if the competitor had raised nothing.',
                status: 'supported_inference',
                evidenceRefs: ['ev_103', 'ev_105'],
              }}
            />
          ),
        },
        {
          id: 'raci',
          name: 'RACI',
          reruns: false,
          fields: [],
          verdict: (
            <Says
              claim={{
                text: 'Who approves a change order, and who is accountable for a customer’s date, are decisions about this company’s own structure. They are unaffected by anybody else’s balance sheet.',
                status: 'fact',
                evidenceRefs: ['ev_115'],
              }}
            />
          ),
        },
      ]}
      settled={
        <div className="grid gap-3">
          <Says
            claim={{
              text: 'Three instruments re-run and four hold, because the model knows which fields each instrument reads. The re-runs rewrite force scores, SWOT entries, strategic options and the risk register; they do not touch capacity, utilisation or the flow stages, which is where the rate lives.',
              status: 'supported_inference',
              evidenceRefs: ['ev_103', 'ev_104'],
            }}
            label="what the graph settled"
          />
          <Aside>
            The same event arriving in a folder of documents invalidates all of them at once,
            because no document in a folder knows what it depends on. That is the difference this
            site exists to show, and it took one click to show it.
          </Aside>
        </div>
      }
    />
  ),
  analysis: (
    <>
      <Block label="what got rewritten">
        <Pair>
          <Says
            claim={{
              text: 'The risk register takes a new entry: a funded regional competitor, with crew departures and time-to-hire named as the indicators that would turn it from a hypothesis into a finding. Two installation technicians already resigned this year, both citing overtime.',
              status: 'hypothesis',
              evidenceRefs: ['ev_117'],
            }}
            label="risk register · new entry"
          />
          <Says claim={segmentNote('Industrial and logistics facilities', 'This segment is the most willing')} label="and why the ST move gains urgency" />
        </Pair>
      </Block>
      <Block label="and what did not">
        <Says claim={capability(CREW).assessment} label="the advantage, unchanged" />
        <Says claim={system('Dispatch board')} label="the board, unchanged" />
      </Block>
      <PullQuote>
        The event that felt like it changed everything changed four fields, and none of them was
        the one that sets the rate.
      </PullQuote>
      <Aside>
        The run is now finished with options and ready for the question it was started to answer.
        Everything so far has been true. Almost none of it has been binding.
      </Aside>
    </>
  ),
  handoff:
    'Seven instruments, a shelf of true findings, and an event that survived contact with all of them. The conductor is next, and its only job is to say which single stage sets the rate for the whole line.',
  writes: [
    {
      field: 'risk_register',
      value: 'A funded regional competitor — watch crew departures and time-to-hire as the indicator.',
      status: 'hypothesis',
      refs: ['ev_117'],
      revises: true,
    },
    {
      field: 'strategic_options',
      value: 'The guarantee-start-windows move gains urgency; the ranking of the four is unchanged.',
      status: 'supported-inference',
      refs: ['ev_119'],
      revises: true,
    },
  ],
};
