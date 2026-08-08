/**
 * Steps three and four — Five Forces, on Beacon Mechanical.
 *
 * The terrain instrument's job in this run is to produce a true finding that turns out not to
 * be the binding one, and to be honest about that while producing it. Buyer power really is
 * the strongest pressure on this business: a handful of accounts carry two-fifths of the
 * revenue and one of them has already moved a chiller replacement elsewhere over a start date.
 * None of that adds or removes an hour of crew time.
 *
 * That is why step three's mechanic is an assumption slider rather than another prediction.
 * A score of seven out of ten is the least evidenced number the run will display all the way
 * through, and the way to be honest about it is to let the visitor move it and watch what
 * survives. The panel that refuses to move while everything else re-ranks is the argument.
 */

import { AssumptionSlider, RunLensCompare } from '@/components/run/interactions';
import { ForcesGauges, type Force } from '@/motion/fw-forces-gauges';
import { TransformFlow } from '@/motion/motion-transform';
import { stateField } from '@/registry';
import { Aside, Block, Figure, Pair, PullQuote, Says, Sourced } from './ui';
import { company, misreading, operating, segmentNote } from './pack';
import type { RunStepContent } from './types';

/* ---------------------------------------------------------------- the scores */

const SCORES = { buyers: 7, suppliers: 6, rivalry: 5, substitutes: 3.5, entrants: 3 } as const;

const FORCES: Force[] = [
  {
    id: 'buyers',
    label: 'buyer power',
    score: SCORES.buyers,
    note: 'A handful of accounts carry much of the revenue, and one of them has already moved work over a start date.',
  },
  {
    id: 'suppliers',
    label: 'supplier power',
    score: SCORES.suppliers,
    note: 'One distributor carries most of the equipment spend, and its lead times doubled at the last renewal.',
  },
  {
    id: 'rivalry',
    label: 'rivalry',
    score: SCORES.rivalry,
    note: 'Several regional contractors offer the same coverage; price is the reason recorded on most lost proposals.',
  },
  {
    id: 'substitutes',
    label: 'substitutes',
    score: SCORES.substitutes,
    note: 'In-house facilities teams, and the option of running the old plant another season.',
  },
  {
    id: 'entrants',
    label: 'new entrants',
    score: SCORES.entrants,
    note: 'Crews who can retrofit an occupied building take months to assemble — the scarcity that limits Beacon also protects it.',
  },
];

const TERRAIN_SOURCES = ['ev_104', 'ev_107', 'ev_109', 'ev_110', 'ev_117', 'ev_119'];

/* ------------------------------------------------------------------ step 3 */

export const step3: RunStepContent = {
  n: 3,
  framework: 'five-forces',
  interaction: 'assumption-slider',
  minutes: 1.5,
  lede: 'Five pressures, scored zero to ten. The scores are judgements and the run says so on every one of them; what is not a judgement is the basis underneath each score.',
  stateInNote:
    'Terrain reads what the canvas wrote: who else serves these segments, how concentrated the customer base is, who supplies the equipment, and which segments are in play.',
  predictionPrompt:
    'The whole terrain read leans on one number. Move it, and find out how much of the picture it was carrying.',
  reveal: 'Buyer power tops the ranking — and the ranking does not touch the delivery rate.',
  stage: (
    <div className="grid gap-5">
      <ForcesGauges company={company.name} forces={FORCES} />
      <Sourced label="scored against" refs={TERRAIN_SOURCES} />
    </div>
  ),
  interactionNode: (
    <AssumptionSlider
      prompt="Suppose the customer base were more spread out — or less. Where does the pressure go?"
      instruction="The pack's own figure is marked on the scale. Every other position is a what-if, and every implication it produces is labelled as one."
      assumption="top-five customer concentration"
      baseline={
        <Figure
          metric={operating('Top-five customer concentration')}
          label="as the pack has it"
          note="five accounts, coded from the revenue-by-customer export"
        />
      }
      baselineIndex={2}
      stops={[
        {
          id: 'diffuse',
          label: 'spread across many accounts',
          strongest: 'supplier power',
          implication: (
            <Says
              claim={{
                text: 'With no account large enough to set terms, the strongest pressure becomes the distributor that supplies more than three-quarters of equipment spend on lead times that doubled at the last renewal. Buyer power drops out of the top of the ranking entirely.',
                status: 'hypothesis',
                evidenceRefs: ['ev_109'],
              }}
              label="what would follow"
            />
          ),
        },
        {
          id: 'halved',
          label: 'half as concentrated',
          strongest: 'supplier power',
          implication: (
            <Says
              claim={{
                text: 'Halved, the buyer read softens to roughly the level of rivalry and the ranking changes hands. Pricing risk falls; the renewal conversation stops being an annual threat. Nothing about how fast work leaves the building is different.',
                status: 'hypothesis',
                evidenceRefs: ['ev_107', 'ev_110'],
              }}
              label="what would follow"
            />
          ),
        },
        {
          id: 'pack',
          label: 'as the pack has it',
          strongest: 'buyer power',
          implication: (
            <Says
              claim={{
                text: 'The five largest customers hold two-fifths of revenue and three of them sit in one segment. A facilities director at one of those accounts has already given a chiller replacement to somebody else on the strength of the date. That is real leverage over price and over terms.',
                status: 'supported_inference',
                evidenceRefs: ['ev_107', 'ev_119'],
              }}
              label="the reading the evidence supports"
            />
          ),
        },
        {
          id: 'doubled',
          label: 'the largest account doubles',
          strongest: 'buyer power',
          implication: (
            <Says
              claim={{
                text: 'Concentrated further, buyer power stops being a score and becomes a single-customer dependency: one renewal decision would move a fifth of revenue. Worth a risk entry with a named indicator, and still not an answer to why completed projects were flat.',
                status: 'hypothesis',
                evidenceRefs: ['ev_107', 'ev_102'],
              }}
              label="what would follow"
            />
          ),
        },
      ]}
      invariant={
        <div className="grid gap-3">
          <Figure
            metric={operating('Installation utilisation')}
            label="installation crews, booked"
            note="unchanged at every position on the scale"
          />
          <Says
            claim={{
              text: 'No position on that slider adds an hour of installation capacity, and none of them explains why completed projects stayed flat while revenue rose. A force score describes the terms of trade, not the rate at which work leaves the building.',
              status: 'supported_inference',
              evidenceRefs: ['ev_103', 'ev_102'],
            }}
            label="the invariant"
          />
        </div>
      }
    />
  ),
  analysis: (
    <>
      <Block label="where the two loudest scores come from">
        <Pair>
          <Says
            claim={{
              text: 'Buyer power, high. The five largest customers hold two-fifths of revenue, three of them in a single segment, and one has already moved work over a start date. Leverage over price and over terms is real.',
              status: 'supported_inference',
              evidenceRefs: ['ev_107', 'ev_119'],
            }}
            label="buyer power · high"
          />
          <Says
            claim={{
              text: 'Supplier power, elevated. The primary distributor supplies more than three-quarters of equipment spend on net-thirty terms, and quoted lead times for packaged rooftop units doubled at the last renewal. Concentration plus a moving lead time is a supplier with leverage.',
              status: 'supported_inference',
              evidenceRefs: ['ev_109'],
            }}
            label="supplier power · elevated"
          />
        </Pair>
      </Block>
      <Block label="and the one nobody has counted">
        <Says
          claim={{
            text: 'Rivalry is scored as an assumption on purpose: several regional contractors offer comparable coverage and price is recorded on the majority of lost proposals, but nobody has counted competing bids and the loss reasons are recorded inconsistently. A score with no census under it should say so.',
            status: 'assumption',
            evidenceRefs: ['ev_104', 'ev_111'],
          }}
          label="rivalry · moderate"
        />
      </Block>
      <Aside>
        Five true statements about the terrain, and a ranking that will survive being wrong about
        any one of them. What the ranking cannot do is explain the number this run started from.
      </Aside>
    </>
  ),
  handoff:
    'The pressures are scored. The next question is which of them decides profitability here — and whether the answer changes anything a crew does on Monday.',
  writes: [
    {
      field: 'force_scores',
      value: 'buyers 7 · suppliers 6 · rivalry 5 · substitutes 3.5 · entrants 3, each with a written basis.',
      status: 'assumption',
      refs: ['ev_107', 'ev_109', 'ev_111'],
    },
  ],
};

/* ------------------------------------------------------------------ step 4 */

export const step4: RunStepContent = {
  n: 4,
  framework: 'five-forces',
  interaction: 'lens-compare',
  minutes: 1,
  lede: 'One fact — a concentrated customer base — read by four different instruments. Three of the readings are useful. Only one of them changes what happens on Monday, and it is not the one the framework is for.',
  stateInNote:
    'The scores from the last step, and the concentration figure they lean on, come back in together. The instrument now has to say which single pressure most determines profitability here.',
  predictionPrompt:
    'The same concentration figure means four different things depending on which instrument is holding it. Which reading survives contact with the delivery rate?',
  reveal: 'One fact, four instruments — and only the fourth reading is about the rate.',
  stage: (
    <TransformFlow
      inputs={[
        { id: 'force_scores', label: 'force scores' },
        { id: 'customer_concentration', label: 'concentration' },
      ]}
      output={stateField('primary_economic_pressure').label}
      operator="FIVE FORCES"
    />
  ),
  interactionNode: (
    <RunLensCompare
      prompt="Two-fifths of revenue in five accounts. What kind of fact is that?"
      instruction="Four lenses, one figure. Move through them and watch a true finding fail to become a diagnosis."
      label="The concentration question, through four lenses"
      lenses={[
        {
          id: 'power',
          label: 'As buyer power',
          caption: 'five forces · who sets the terms?',
          content: (
            <div className="grid gap-2">
              <Figure metric={operating('Top-five customer concentration')} label="top five, share of revenue" />
              <Says claim={segmentNote('Multi-tenant property management', 'Three of the five largest')} />
              <Aside>
                The instrument's own reading: leverage sits with the buyer, so price and terms are
                negotiated from a weak position and renewals are load-bearing.
              </Aside>
            </div>
          ),
        },
        {
          id: 'quality',
          label: 'As revenue quality',
          caption: 'financials · how good is this income?',
          content: (
            <div className="grid gap-2">
              <Figure metric={operating('Days sales outstanding')} label="days sales outstanding" />
              <Says
                claim={{
                  text: 'Concentrated revenue from contracted accounts collects predictably, and deposits on unstarted projects sit in current liabilities rather than in cash. Concentration is doing something to the balance sheet, and what it is doing is mostly benign.',
                  status: 'supported_inference',
                  evidenceRefs: ['ev_120', 'ev_107'],
                }}
              />
            </div>
          ),
        },
        {
          id: 'risk',
          label: 'As a delivery risk',
          caption: 'risk register · what could go wrong fastest?',
          content: (
            <div className="grid gap-2">
              <Says
                claim={{
                  text: 'A facilities director at a top-five account has already given a chiller replacement to somebody else purely on the date. Concentration turns a scheduling problem into a revenue problem, because the accounts that leave are the large ones.',
                  status: 'fact',
                  evidenceRefs: ['ev_119'],
                }}
              />
              <Figure metric={operating('Median wait, signature to start')} label="what they were quoted against" />
            </div>
          ),
        },
        {
          id: 'rate',
          label: 'As a limit on output',
          caption: 'the conductor · what sets the rate?',
          content: (
            <div className="grid gap-2">
              <Says claim={misreading('Customer concentration is the problem')} label="tested against the pack" />
              <Aside>
                It is not one. Concentration explains the terms Beacon trades on; it does not
                explain why the same number of projects finished on nearly a quarter more revenue.
                A real finding that cannot move the rate is still a real finding — it just is not
                the one to act on first.
              </Aside>
            </div>
          ),
        },
      ]}
    />
  ),
  analysis: (
    <>
      <Block label="the primary pressure, named">
        <Says
          claim={{
            text: 'Buyer power is the pressure that most determines profitability in this market for this company: concentration sets the price, and switching on start dates sets the risk. It is recorded as the primary economic pressure with the evidence attached.',
            status: 'supported_inference',
            evidenceRefs: ['ev_107', 'ev_119'],
          }}
          label="primary economic pressure"
        />
      </Block>
      <Block label="and the risk it opens">
        <Says
          claim={{
            text: 'One top-five account has already moved a chiller replacement to a competitor over an availability date. The leading indicator is not the win rate — it is the quoted start date at the moment of proposal.',
            status: 'fact',
            evidenceRefs: ['ev_119', 'ev_111'],
          }}
          label="risk register · entry"
        />
      </Block>
      <PullQuote>
        Being true is not the same as being binding. Most of what a strategy review produces is
        the first kind.
      </PullQuote>
      <Aside>
        Terrain is finished, and it has handed on two fields and one warning. The instrument that
        runs next looks the other way — not at what the market can do to Beacon, but at what
        Beacon has that the market cannot easily copy.
      </Aside>
    </>
  ),
  handoff:
    'The outside is read. Now the inside: of everything this company owns and does, which parts are genuine advantages and which merely feel like them?',
  writes: [
    {
      field: 'primary_economic_pressure',
      value: 'Buyer power — concentration on price, switching on start dates.',
      status: 'supported-inference',
      refs: ['ev_107', 'ev_119'],
    },
    {
      field: 'risk_register',
      value: 'A top-five account has already moved work over a start date.',
      status: 'fact',
      refs: ['ev_119'],
    },
  ],
};
