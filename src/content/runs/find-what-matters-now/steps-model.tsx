/**
 * Steps one and two — the Business Model Canvas, on Beacon Mechanical.
 *
 * The run opens with the least interpretive thing it can do: write the business down. Nine
 * blocks, assembled from payroll, dispatch and the accounting export, with nothing scored and
 * nothing diagnosed. Then it does the second least interpretive thing: read the same twelve
 * months twice, once off the invoices and once off the timesheets, and notice that the two
 * readings cannot both be comfortable.
 *
 * The canvas is drawn twice on purpose. Step one marks key resources `confirmed` — because at
 * that point it is a confirmed fact, twelve technicians booked to a measured number of hours.
 * Step two re-renders the same recipe with that one cell flipped to `contradiction`, and
 * `fw/bmc-assemble` pulses it once. Nothing about the business changed between the two
 * pictures; what changed is that the run has now read the revenue block next to it. That is
 * the whole argument for a model over a document, made with one cell.
 */

import { RunLensCompare, RunPrediction } from '@/components/run/interactions';
import { usd } from '@/lib/format';
import { BmcAssemble, type BmcBlock } from '@/motion/fw-bmc-assemble';
import { Aside, Block, Figure, Pair, PullQuote, Says, Sourced } from './ui';
import { D, F, capability, company, headline, operating, revenueLine, segment } from './pack';
import type { RunStepContent } from './types';

const round = (n: number) => Math.round(n);

/* ------------------------------------------------------------ the canvas */

function blocks(contradiction: boolean): BmcBlock[] {
  return [
    {
      id: 'cs',
      label: 'customer segments',
      items: [
        { text: `Property management · ${round(D.segmentPropertyShare)}% of revenue`, strength: 'confirmed' },
        { text: `Industrial and logistics · ${round(D.segmentIndustrialShare)}%`, strength: 'confirmed' },
        { text: `Public sector and schools · ${round(D.segmentPublicShare)}%`, strength: 'confirmed' },
        { text: `Grocery and hospitality · ${round(D.segmentHospitalityShare)}%`, strength: 'weak' },
      ],
    },
    {
      id: 'vp',
      label: 'value proposition',
      items: [
        { text: 'One contractor for the plant and the contract', strength: 'confirmed' },
        { text: 'Retrofits finished without a second visit', strength: 'confirmed' },
        { text: 'A start date the crews can hold', strength: 'weak' },
      ],
    },
    {
      id: 'ch',
      label: 'channels',
      items: [
        { text: 'Direct to facilities and property managers', strength: 'confirmed' },
        { text: 'Referral from mechanical contractors', strength: 'weak' },
      ],
    },
    {
      id: 'cr',
      label: 'customer relationships',
      items: [
        { text: 'Annual agreements, auto-renewing', strength: 'confirmed' },
        { text: 'One project manager across three crews', strength: 'weak' },
      ],
    },
    {
      id: 'rev',
      label: 'revenue streams',
      items: [
        { text: `Installation projects · ${usd(F.revenueInstallation)}`, strength: 'confirmed' },
        { text: `Service contracts · ${usd(F.revenueServiceContracts)}`, strength: 'confirmed' },
        { text: `Emergency and time-and-materials · ${usd(F.revenueEmergency)}`, strength: 'confirmed' },
      ],
    },
    {
      id: 'kr',
      label: 'key resources',
      items: [
        {
          text: `${F.installTechs} installation technicians · ${D.installUtilization}% booked`,
          strength: contradiction ? 'contradiction' : 'confirmed',
        },
        {
          text: `${F.serviceTechs} service technicians · ${D.serviceUtilization}% booked`,
          strength: 'confirmed',
        },
        { text: 'One estimator, fifteen years of local pricing', strength: 'confirmed' },
      ],
    },
    {
      id: 'ka',
      label: 'key activities',
      items: [
        { text: 'Retrofit and replacement delivery', strength: 'confirmed' },
        { text: 'Planned maintenance visits', strength: 'confirmed' },
        { text: 'Change-order approval — one desk', strength: 'weak' },
      ],
    },
    {
      id: 'kp',
      label: 'key partners',
      items: [
        {
          text: `Primary distributor · ${F.distributorShareOfSpend}% of equipment spend`,
          strength: 'confirmed',
        },
        { text: 'Independent sheet-metal shop', strength: 'weak' },
      ],
    },
    {
      id: 'cost',
      label: 'cost structure',
      items: [
        { text: 'Field labour, dominant', strength: 'confirmed' },
        { text: 'Overtime, now scheduled rather than exceptional', strength: 'confirmed' },
      ],
    },
  ];
}

const CANVAS_SOURCES = ['ev_101', 'ev_103', 'ev_104', 'ev_107', 'ev_109', 'ev_112'];

/* ------------------------------------------------------------------ step 1 */

export const step1: RunStepContent = {
  n: 1,
  framework: 'bmc',
  interaction: 'prediction',
  minutes: 1,
  lede: 'Nine blocks, assembled from payroll, dispatch and the accounting export. Nothing is scored and nothing is diagnosed yet — this is only the business, written down in fields instead of paragraphs.',
  stateInNote:
    'The run starts with what any company can hand over without a workshop: what it is, what it earned, and what it already measures. Three fields in, and the canvas is the first thing that comes back out.',
  predictionPrompt:
    'Before the canvas fills: which line does most of the money come from — and is it the line that grew?',
  reveal: 'The money is in installation, and installation is the line that grew.',
  stage: (
    <div className="grid gap-5">
      <BmcAssemble blocks={blocks(false)} company={company.name} />
      <Sourced label="assembled from" refs={CANVAS_SOURCES} />
    </div>
  ),
  interactionNode: (
    <RunPrediction
      question="Beacon has three revenue lines. Which one carries most of the money?"
      options={[
        { id: 'install', label: 'Installation projects', detail: 'retrofit and replacement — lumpy, project-shaped' },
        { id: 'service', label: 'Service contracts', detail: 'the recurring maintenance book' },
        { id: 'emergency', label: 'Emergency and time-and-materials', detail: 'the call-out line' },
        { id: 'even', label: 'All three, roughly evenly', detail: 'no line dominates' },
      ]}
      correctId="install"
      reveal={
        <div className="grid gap-3">
          <Aside>
            Two-thirds of the revenue is project work, and the project line is the one that moved.
            Everything the rest of this run does follows from that single fact about where the
            money is.
          </Aside>
          <Figure metric={revenueLine('Installation projects')} label="installation" />
          <Figure metric={revenueLine('Service contracts')} label="service contracts" />
        </div>
      }
    />
  ),
  analysis: (
    <>
      <Block label="the money, by line">
        <Pair>
          <Figure metric={revenueLine('Installation projects')} label="installation projects" />
          <Figure metric={revenueLine('Service contracts')} label="service contracts" />
          <Figure metric={revenueLine('Emergency and time-and-materials')} label="emergency and T&M" />
          <Figure metric={revenueLine('Total revenue')} label="total, trailing twelve months" />
        </Pair>
      </Block>
      <Block label="the year, as the owner would describe it">
        <Says claim={headline('Revenue grew')} label="the headline" />
      </Block>
      <Block label="who it is sold to">
        <Figure
          metric={segment('Multi-tenant property management').shareOfRevenue}
          label="property management"
          note="the largest segment, and where the concentration lives"
        />
        <Says
          claim={segment('Multi-tenant property management').notes[0]!}
          label="and the note attached to it"
        />
      </Block>
      <Aside>
        Nothing above is an insight. It is a company written down in typed fields rather than in
        a deck, which is the only starting position from which the next six instruments can run
        at all. A canvas that ends here is wallpaper; a canvas that hands off is a program.
      </Aside>
    </>
  ),
  handoff:
    'The canvas now holds segments, a promise, the money and the work. What it has not been asked is whether any two of those blocks can both be comfortable at the same time.',
  writes: [
    {
      field: 'customer_segments',
      value: 'Four segments, coded by revenue share — property management largest, hospitality thinnest.',
      status: 'fact',
      refs: ['ev_107'],
    },
    {
      field: 'value_propositions',
      value: 'One contractor for the plant and the maintenance contract; retrofits finished without a second visit.',
      status: 'fact',
      refs: ['ev_101'],
    },
    {
      field: 'revenue_streams',
      value: `Installation ${usd(F.revenueInstallation)} · service ${usd(
        F.revenueServiceContracts,
      )} · emergency ${usd(F.revenueEmergency)}.`,
      status: 'fact',
      refs: ['ev_101'],
    },
    {
      field: 'key_activities',
      value: 'Retrofit and replacement delivery, planned maintenance, change-order approval through one desk.',
      status: 'fact',
      refs: ['ev_115'],
    },
  ],
};

/* ------------------------------------------------------------------ step 2 */

export const step2: RunStepContent = {
  n: 2,
  framework: 'bmc',
  interaction: 'lens-compare',
  minutes: 1.5,
  lede: 'The same twelve months, read twice: once off the invoices, once off the timesheets. Both readings are sourced to the same pack. Only one of them is the story the company tells about itself.',
  stateInNote:
    'The canvas hands itself back its own money and its own means — what the model sells, what it sells it with, the work that turns one into the other, and what that costs.',
  predictionPrompt:
    'Read the year from the earning side and then from the resource side. Which pair of blocks stops agreeing?',
  reveal: 'Revenue grew on the back of the one resource the business cannot add quickly.',
  stage: (
    <div className="grid gap-5">
      <BmcAssemble blocks={blocks(true)} company={company.name} />
      <Sourced label="the same canvas, one cell re-scored from" refs={['ev_101', 'ev_102', 'ev_103']} />
    </div>
  ),
  interactionNode: (
    <RunLensCompare
      prompt="Same company, same twelve months. Switch the lens and watch the year change character."
      instruction="Start on the earning side, where the year is a success. Then move to the resource side, where it is the same numbers and a different business."
      label="Two blocks, one business"
      lenses={[
        {
          id: 'sold',
          label: 'As sold',
          caption: 'revenue streams · what the model promises',
          content: (
            <div className="grid gap-2">
              <Figure metric={revenueLine('Installation projects')} label="installation revenue" />
              <Figure metric={operating('Proposal win rate')} label="proposal win rate" />
              <Figure metric={operating('Signed projects awaiting a crew')} label="signed and waiting" />
              <Aside>
                Read from the earning side, this is a company having its best year: it sells more,
                it converts better, and the order book has never been fuller.
              </Aside>
            </div>
          ),
        },
        {
          id: 'delivered',
          label: 'As delivered',
          caption: 'key resources · what the model can carry',
          content: (
            <div className="grid gap-2">
              <Figure metric={operating('Installation utilisation')} label="installation crews" />
              <Figure metric={operating('Service utilisation')} label="service technicians" />
              <Figure metric={operating('Projects sold, not completed')} label="sold and not completed" />
              <Aside>
                Read from the resource side, the same year is a company selling work it has no
                hours to install. Neither reading is wrong. The canvas is where they meet.
              </Aside>
            </div>
          ),
        },
      ]}
    />
  ),
  analysis: (
    <>
      <Block label="the contradiction, stated">
        <Says claim={headline('The business is selling faster')} label="what both readings agree on" />
        <Says claim={capability('Complex retrofit installation').assessment} label="the resource in question" />
      </Block>
      <PullQuote>
        The model sells most of the thing it has least of, and the gap accumulates on a dispatch
        board rather than in the income statement.
      </PullQuote>
      <Block label="what the canvas cannot settle">
        <Says
          claim={{
            text: 'The two technician pools are treated as separate throughout: installation crews and service technicians are booked to different work on different clocks. Whether any installation work could be carried by the service pool is not something the canvas can answer.',
            status: 'assumption',
            evidenceRefs: ['ev_103', 'ev_104'],
          }}
          label="carried forward as an assumption"
        />
        <Says
          claim={{
            text: 'Does the queue come from selling too much or from installing too little? Both produce the same dispatch board, and the canvas has now put the question on the record instead of resolving it in a meeting.',
            status: 'hypothesis',
            evidenceRefs: ['ev_106'],
          }}
          label="and as an open question"
        />
      </Block>
      <Aside>
        A contradiction is not a failure of the model — it is the model doing its job. The
        version of this document that lives in a slide deck reconciles the two blocks with an
        adjective and moves on. This one writes the disagreement into a field, with a status on
        it, where the next five instruments can read it.
      </Aside>
    </>
  ),
  handoff:
    'The model now knows something is wrong with it and not yet what. Before looking inward, the run looks outward: terrain first, because a business can be squeezed from outside in ways that look identical from the inside.',
  writes: [
    {
      field: 'model_contradictions',
      value: 'Revenue leans on installation; installation is the resource with no room left in it.',
      status: 'supported-inference',
      refs: ['ev_101', 'ev_103'],
    },
    {
      field: 'assumptions',
      value: 'The two technician pools are not interchangeable.',
      status: 'assumption',
      refs: ['ev_103', 'ev_104'],
    },
    {
      field: 'open_questions',
      value: 'Is the queue a demand problem or a delivery problem?',
      status: 'hypothesis',
      refs: ['ev_106'],
    },
  ],
};
