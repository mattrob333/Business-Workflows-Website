/**
 * Lantern AI — the narrative beats. The direction-stack teaser (03-content-spec).
 */

import type { CompanyStory } from '../types';
import { LANTERN_DERIVED as D, LANTERN_FIGURES as F } from './evidence';

export const lanternStory: CompanyStory = {
  id: 'lantern-ai',
  challenge: [
    'Lantern AI has one product, four customers and three markets that all say yes to a first meeting.',
    'The board deck shows a pipeline of twelve million dollars. The bank shows thirteen months.',
    'Financial services has the biggest deals and a certification gate. Healthcare has the deepest lock-in and the slowest procurement. Logistics has an operational buyer who can sign this quarter.',
    'The company has been pursuing all three, which is the same as pursuing none of them well.',
  ],
  constraint: {
    headline: 'Focus, priced in runway.',
    beats: [
      {
        text: `Runway is ${D.runwayMonths} months at the current burn.`,
        status: 'fact',
        evidenceRefs: ['ev_301'],
        date: '2026-07-31',
      },
      {
        text: `The median financial-services cycle is ${F.cycleDaysFinancialServices} days and the healthcare cycle ${F.cycleDaysHealthcare} days; logistics closes in ${F.cycleDaysLogistics}.`,
        status: 'fact',
        evidenceRefs: ['ev_303'],
        date: '2026-07-28',
      },
      {
        text: `${F.oppsBlockedOnCertification} financial-services opportunities are blocked on a certification quoted at ${F.certificationMonths} months — longer than the time available to convert them.`,
        status: 'fact',
        evidenceRefs: ['ev_307', 'ev_314', 'ev_301'],
        date: '2026-07-22',
      },
      {
        text: `Two go-to-market people are covering three buying processes while forward-deployed delivery holds gross margin at ${F.grossMarginPct} per cent.`,
        status: 'supported_inference',
        evidenceRefs: ['ev_306', 'ev_313', 'ev_305'],
        date: '2026-08-01',
      },
    ],
    diagnosis: {
      text: 'The binding constraint is not pipeline; it is the number of distinct buying processes a nineteen-person company can serve before the cash runs out. Choosing the market whose cycle fits inside the runway is what makes every other capability usable.',
      status: 'supported_inference',
      evidenceRefs: ['ev_301', 'ev_303', 'ev_306', 'ev_302'],
      date: '2026-08-01',
    },
    misreadings: [
      {
        text: `Follow the largest pipeline. Rejected on arithmetic: financial services holds ${F.valueFinancialServices / 1_000_000} million dollars of pipeline behind a ${F.certificationMonths}-month gate and a ${D.monthsToCloseFinancialServices}-month cycle.`,
        status: 'supported_inference',
        evidenceRefs: ['ev_302', 'ev_307', 'ev_303'],
      },
      {
        text: 'The model needs to be better. Not supported by the buyer evidence: the objections recorded are certification, procurement duration and proof on the customer’s own data.',
        status: 'supported_inference',
        evidenceRefs: ['ev_308', 'ev_309', 'ev_310'],
      },
      {
        text: 'Raise more money and pursue all three. A live option, not a diagnosis: it changes the runway without changing how many buying processes two people can run.',
        status: 'recommendation',
        evidenceRefs: ['ev_301', 'ev_306'],
      },
    ],
  },
  demonstrates: [
    {
      framework: 'ansoff',
      beat: 'One product against three markets: the quadrant turns an argument about enthusiasm into a comparison of required capability.',
    },
    {
      framework: 'three-horizons',
      beat: 'Thirteen months allocated across horizons, with the slider showing exactly what gets starved.',
    },
    {
      framework: 'five-forces',
      beat: 'Three candidate markets scored separately; buyer power and entry barriers differ more than the pitch does.',
    },
    {
      framework: 'vrio',
      beat: 'A research team that is rare and inimitable, and an organisation not yet built to capture it.',
    },
    {
      framework: 'pestle',
      beat: 'Model-documentation obligations dated and scored — the regulation is a signal with a horizon, not a mood.',
    },
    {
      framework: 'bmc',
      beat: 'One canvas per candidate market, which is how the choice stops being a discussion and starts being a comparison.',
    },
    {
      framework: 'tows',
      beat: 'Market entry framed as SO, ST, WO and WT rather than as the loudest advisor in the room.',
    },
    {
      framework: 'raci',
      beat: 'Agent-run research with a named human accountable, and capability boundaries written down before the pilot.',
    },
  ],
  pullQuote:
    'The pipeline is measured in dollars and the runway is measured in months, and only one of those two numbers is negotiable.',
};
