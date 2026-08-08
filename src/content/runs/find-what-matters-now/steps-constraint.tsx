/**
 * Steps ten and eleven — the conductor, and the run's only amber.
 *
 * ## Why the colour arrives at eleven rather than ten
 *
 * Step ten identifies the narrow stage. Step eleven paints it. That gap is deliberate and it is
 * the run's reading of 00-LAW Ruling 2: amber marks *the binding constraint*, and nothing is
 * binding merely because it is the smallest number in a table. It becomes binding when the
 * alternatives have been eliminated and the consequence has been demonstrated — when improving
 * a non-constraint has been run forward in front of the visitor and visibly changed nothing.
 *
 * So step ten draws the same five stages in the flow hue with demand across them and asks the
 * question (`components/run/CapacityLadder`, no amber anywhere in it). Step eleven hands the
 * same five stages to `fw/toc-flow`, which computes the narrow one and wears the colour, and
 * closes with `ConstraintVerdict`. Amber appears in exactly three declared surfaces — the
 * recipe's computed stage, the badge that names it, and the verdict — and it does not exist in
 * the document at all before this step, because the run mounts one step at a time.
 *
 * ## The one number that has to be right
 *
 * Installation capacity is arithmetic on the pack — projects completed divided by measured crew
 * utilisation — and every other stage is modelled and labelled `assumption`. The model would
 * survive being wrong about any of the other four by a wide margin. That is the test a
 * constraint claim should pass before it earns any colour, and the ladder prints the basis for
 * each capacity so a visitor can check it rather than take it.
 */

import { ConstraintVerdict } from '@/components/framework-page';
import { CapacityLadder } from '@/components/run/CapacityLadder';
import { ConsequencePicker, RunPrediction } from '@/components/run/interactions';
import { TocFlow, type TocIntervention, type TocStage } from '@/motion/fw-toc-flow';
import { Aside, Block, Figure, Pair, PullQuote, Says, Sourced } from './ui';
import {
  D,
  F,
  INSTALL_CAPACITY,
  STAGE_CAPACITY,
  UNIT,
  beaconStory,
  beat,
  company,
  misreading,
  operating,
  system,
} from './pack';
import type { RunStepContent } from './types';

/* ------------------------------------------------------------ the five stages */

const STAGES: TocStage[] = [
  { id: 'estimating', label: 'estimating', capacity: STAGE_CAPACITY.estimating },
  { id: 'approvals', label: 'approvals', capacity: STAGE_CAPACITY.approvals },
  { id: 'installation', label: 'installation', capacity: STAGE_CAPACITY.installation },
  { id: 'commissioning', label: 'commissioning', capacity: STAGE_CAPACITY.commissioning },
  { id: 'invoicing', label: 'invoicing', capacity: STAGE_CAPACITY.invoicing },
];

const INTERVENTIONS: TocIntervention[] = [
  { id: 'iv-estimator', label: 'add a second estimator', stageId: 'estimating', delta: 18 },
  { id: 'iv-approvals', label: 'delegate change-order approval', stageId: 'approvals', delta: 9 },
  { id: 'iv-crew', label: 'stand up a fourth crew', stageId: 'installation', delta: 16 },
  { id: 'iv-invoice', label: 'automate invoicing', stageId: 'invoicing', delta: 20 },
];

const FLOW_SOURCES = ['ev_102', 'ev_103', 'ev_105', 'ev_106', 'ev_110', 'ev_116'];

/* ------------------------------------------------------------------ step 10 */

export const step10: RunStepContent = {
  n: 10,
  framework: 'theory-of-constraints',
  interaction: 'prediction',
  minutes: 1.5,
  lede: 'Beacon as a pipe: five stages, one unit, demand drawn across all of them. Four of the five capacities are modelled and say so. One is arithmetic, and it is the one the diagnosis will rest on.',
  stateInNote:
    'The conductor reads the shape of the system rather than any one department: the stages work passes through, the capacity each has, the queue behind them, and the demand in front.',
  predictionPrompt:
    'Five stages, one unit, demand across all five. Which stage sets the rate for the whole line?',
  reveal: 'Installation — derived from the pack rather than chosen, and the only capacity that has to be right.',
  stage: (
    <div className="grid gap-5">
      <CapacityLadder
        unit={UNIT}
        demand={F.projectsSoldTtm}
        stages={[
          {
            id: 'estimating',
            label: 'estimating',
            capacity: STAGE_CAPACITY.estimating,
            basis: 'the signed contracts the stage demonstrably passed through, treated as a floor',
            kind: 'derived',
          },
          {
            id: 'approvals',
            label: 'approvals',
            capacity: STAGE_CAPACITY.approvals,
            basis: 'modelled just below the rate of sale — the pack shows the stage delaying work, not how much it could carry',
            kind: 'modelled',
          },
          {
            id: 'installation',
            label: 'installation',
            capacity: STAGE_CAPACITY.installation,
            basis: 'projects completed divided by measured crew utilisation',
            kind: 'derived',
          },
          {
            id: 'commissioning',
            label: 'commissioning',
            capacity: STAGE_CAPACITY.commissioning,
            basis: 'modelled above installation and below the rate of sale, carrying the rework that comes back to it',
            kind: 'modelled',
          },
          {
            id: 'invoicing',
            label: 'invoicing',
            capacity: STAGE_CAPACITY.invoicing,
            basis: 'modelled comfortably above demand — billing has never been recorded as the reason a start slipped',
            kind: 'modelled',
          },
        ]}
      />
      <Sourced label="modelled from" refs={FLOW_SOURCES} />
    </div>
  ),
  interactionNode: (
    <RunPrediction
      question="Beacon finished the same number of installation projects as last year on nearly a quarter more revenue. Which stage is holding the rate down?"
      options={[
        { id: 'estimating', label: 'Estimating', detail: 'proposals out of the door' },
        { id: 'approvals', label: 'Approvals', detail: 'one desk signs every change' },
        { id: 'installation', label: 'Installation', detail: 'crew hours, and only crew hours' },
        { id: 'commissioning', label: 'Commissioning', detail: 'handover and punch-list' },
        { id: 'invoicing', label: 'Invoicing', detail: 'billing and collection' },
      ]}
      correctId="installation"
      reveal={
        <div className="grid gap-3">
          <Aside>
            The constraint is not the worst problem in the business. It is the stage that sets the
            rate — and it hides in the place that looks healthiest, because a stage running flat
            out looks like a stage doing well.
          </Aside>
          <Says claim={beat('Installation crews run at')} />
        </div>
      }
    />
  ),
  analysis: (
    <>
      <Block label="the one derived number">
        <Says
          claim={{
            text: `Derived, not assumed: ${F.projectsCompletedTtm} projects completed at ${D.installUtilization} per cent crew utilisation is about ${INSTALL_CAPACITY} at full utilisation. Every other stage in the model is an authored assumption, and the diagnosis would survive being wrong about all four of them.`,
            status: 'supported_inference',
            evidenceRefs: ['ev_102', 'ev_103'],
          }}
          label={`installation · capacity ${INSTALL_CAPACITY} ${UNIT}`}
        />
      </Block>
      <Block label="what the queue behind it looks like">
        <Pair>
          <Says claim={beat('The company signed')} label="sold against completed" />
          <Says claim={beat('Median wait')} label="and what the wait became" />
          <Figure metric={operating('Signed projects awaiting a crew')} label="on the board today" />
          <Says claim={system('Dispatch board')} label="the board itself" />
        </Pair>
      </Block>
      <PullQuote>
        A hundred true findings. One of them is binding, and the other ninety-nine are how you
        stay busy while nothing moves.
      </PullQuote>
      <Aside>
        The candidate has a name. It has not earned any colour yet: the run has identified the
        narrow stage, and identifying is not the same as proving. The next step improves the other
        stages, one at a time, in front of you.
      </Aside>
    </>
  ),
  handoff:
    'One stage is nominated. The next step tries to break the nomination by fixing everything else — and then, only then, paints it.',
  writes: [
    {
      field: 'current_constraint',
      value: 'Installation crew hours.',
      status: 'supported-inference',
      refs: ['ev_102', 'ev_103', 'ev_105', 'ev_106'],
    },
  ],
};

/* ------------------------------------------------------------------ step 11 */

export const step11: RunStepContent = {
  n: 11,
  framework: 'theory-of-constraints',
  interaction: 'consequence',
  minutes: 2,
  lede: 'Apply an improvement to a stage that is not the constraint and the throughput of the whole system does not move. Not approximately — at all. The pipe is the proof, and the colour arrives with it.',
  stateInNote:
    'The nominated constraint comes back in with the flow stages and the four options the cross minted, so every proposed move can be asked the only question that matters: does this touch the narrow stage?',
  predictionPrompt:
    'Four interventions, five stages, one of them constrained. Run each one forward and watch which downstream numbers move.',
  reveal: 'Improve a non-constraint and nothing downstream moves. That is arithmetic, not a metaphor.',
  stage: (
    <div className="grid gap-5">
      <TocFlow stages={STAGES} interventions={INTERVENTIONS} demand={F.projectsSoldTtm} unit={UNIT} />
      <Sourced label="capacities modelled from" refs={FLOW_SOURCES} />
    </div>
  ),
  interactionNode: (
    <ConsequencePicker
      prompt="Five reasonable improvements. Which of them changes the rate?"
      instruction="Open them in any order. The pipe above takes the same interventions — apply one there and watch the throughput readout refuse to move."
      options={[
        {
          id: 'invoice',
          label: 'Automate invoicing',
          basis: 'A clean project with a clear payback, and the easiest of the five to fund.',
          effect: 'elsewhere',
          consequence: (
            <div className="grid gap-2">
              <Figure metric={operating('Days sales outstanding')} label="what would improve" />
              <Says
                claim={{
                  text: 'Days sales outstanding is a collection measure rather than a throughput one, and billing has never been recorded as the reason a project start slipped. The stage was already comfortably above demand, so raising it changes no downstream number at all.',
                  status: 'supported_inference',
                  evidenceRefs: ['ev_120', 'ev_115'],
                }}
                label="and what would not"
              />
            </div>
          ),
        },
        {
          id: 'estimator',
          label: 'Add a second estimator',
          basis: 'Proposal volume is up and conversion is up; more of both looks like more revenue.',
          effect: 'loads',
          consequence: <Says claim={misreading('Demand is the problem')} label="run forward" />,
        },
        {
          id: 'approvals',
          label: 'Delegate change-order approval under a threshold',
          basis: 'A real queue in front of the real one, and cheap to fix.',
          effect: 'elsewhere',
          consequence: <Says claim={misreading('Approvals are the problem')} label="run forward" />,
        },
        {
          id: 'subordinate',
          label: 'Move survey, commissioning and punch-list to the service book',
          basis: 'Hours the crews currently spend not installing, handed to the pool that has room.',
          effect: 'releases',
          consequence: (
            <div className="grid gap-2">
              <Figure metric={operating('Service utilisation')} label="the pool with headroom" />
              <Says
                claim={{
                  text: 'This is exploitation in the strict sense: no new capacity is bought, and the constrained resource stops spending hours on work that does not require it. It is also the move that still rests on an unconfirmed assumption about what those technicians are qualified to do.',
                  status: 'assumption',
                  evidenceRefs: ['ev_104', 'ev_114'],
                }}
                label="run forward"
              />
            </div>
          ),
        },
        {
          id: 'crew',
          label: 'Stand up a fourth crew',
          basis: 'The move everybody arrives at, and the only one that raises the ceiling.',
          effect: 'releases',
          consequence: <Says claim={misreading('Hiring alone will resolve it')} label="run forward" />,
        },
      ]}
      settled={
        <Aside>
          Three of the five are worth doing and two of them change the rate. The order matters more
          than the list: exploitation is free and immediate, subordination is a scheduling decision,
          and elevation is a hiring cycle measured in months. Run them in the other order and the
          business spends a year hiring to feed a stage that is still doing work it should not be
          doing.
        </Aside>
      }
    />
  ),
  analysis: (
    <>
      <ConstraintVerdict
        company={company}
        subject="installation"
        headline={beaconStory.constraint.headline}
        diagnosis={beaconStory.constraint.diagnosis}
        caveat={misreading('Hiring alone will resolve it')}
      />

      <Block label="the intervention plan, in order">
        <Says
          claim={{
            text: 'Exploit first: take survey, commissioning and punch-list off the installation crews so that every crew hour goes to installing, and confirm the qualification question before committing to it. No new capacity is purchased and the change can start this month.',
            status: 'recommendation',
            evidenceRefs: ['ev_104', 'ev_103'],
          }}
          label="one · exploit"
        />
        <Says
          claim={{
            text: 'Subordinate second: schedule estimating and approvals to the crews rather than to their own clocks. Delegate change-order approval under a threshold, and order long-lead equipment against the signed queue instead of against the start date, so that no crew hour is ever spent waiting.',
            status: 'recommendation',
            evidenceRefs: ['ev_116', 'ev_109'],
          }}
          label="two · subordinate"
        />
        <Says
          claim={{
            text: 'Elevate last: hire. Three roles are already open against a ninety-four-day average time to hire, so elevation is the slowest instrument available and must not be the first one reached for. It is also the only one that raises the ceiling permanently.',
            status: 'recommendation',
            evidenceRefs: ['ev_117'],
          }}
          label="three · elevate"
        />
      </Block>

      <Block label="and the measures that would show it working">
        <Pair>
          <Figure
            metric={operating('Median wait, signature to start')}
            label="the number to watch weekly"
            note="the constraint moving looks like this falling"
          />
          <Figure
            metric={operating('Overtime booked to installation')}
            label="and the one that should fall with it"
            note="a constrained resource run hot shows up here first"
          />
        </Pair>
      </Block>

      <Aside>
        The constraint will move. When exploitation and subordination are done and the crews are
        installing for every scheduled hour, something else becomes the narrow stage — most likely
        approvals, which is already a queue in waiting. That is not a failure of the diagnosis; it
        is the diagnosis having worked, and it is why the run records the conditions under which
        the answer changes rather than pretending it is permanent.
      </Aside>
    </>
  ),
  handoff:
    'There is a constraint, a plan in the right order, and two measures that would show it working. What there is not yet is a single name against any of it.',
  writes: [
    {
      field: 'constraint_actions',
      value: 'Exploit crew hours, subordinate the rest of the line to them, elevate by hiring last.',
      status: 'recommendation',
      refs: ['ev_103', 'ev_104', 'ev_117'],
    },
    {
      field: 'leading_indicators',
      value: 'Median wait from signature to crew start; overtime booked to installation.',
      status: 'recommendation',
      refs: ['ev_105', 'ev_112'],
    },
  ],
};
