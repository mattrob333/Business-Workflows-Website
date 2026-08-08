/**
 * Beacon Mechanical — the narrative beats.
 *
 * The homepage scrolls this story and the flagship run walks it. The constraint is stated
 * as a supported inference, never as a fact, and the plausible wrong answers are written
 * down with the evidence that rejects them — that is the honesty engine doing its job.
 */

import type { CompanyStory } from '../types';
import { BEACON_DERIVED as D, BEACON_FIGURES as F } from './evidence';

export const beaconStory: CompanyStory = {
  id: 'beacon-mechanical',
  challenge: [
    'Beacon has had its best year on paper. Revenue is up by nearly a quarter, the win rate improved, and the owner has never had more signed work in hand.',
    'The number that has not moved is the one that matters: the company finished forty-seven installation projects this year and forty-six last year.',
    'Everyone in the building has an explanation, and each explanation points at a different department. The owner has three proposals on the desk: hire two salespeople, raise prices, or replace the scheduling software.',
    'None of the three is obviously wrong. Only one of them can be first.',
  ],
  constraint: {
    headline: 'Implementation capacity, not demand.',
    beats: [
      {
        text: `Installation crews run at ${D.installUtilization} per cent of scheduled hours while service technicians run at ${D.serviceUtilization} per cent. The two pools are not interchangeable.`,
        status: 'fact',
        evidenceRefs: ['ev_103', 'ev_104'],
        date: '2026-07-05',
      },
      {
        text: `The company signed ${F.projectsSoldTtm} installation contracts and completed ${F.projectsCompletedTtm}; the dispatch board moved from ${F.queueProjectsPrior} to ${F.queueProjects} waiting projects over the same period.`,
        status: 'fact',
        evidenceRefs: ['ev_106', 'ev_105'],
        date: '2026-07-31',
      },
      {
        text: `Median wait from signature to crew start went from ${F.queueMedianWaitDaysPrior} days to ${F.queueMedianWaitDays} days, and scheduling is now the largest complaint theme at ${F.complaintsSchedule} of ${F.complaintsTotal}.`,
        status: 'fact',
        evidenceRefs: ['ev_105', 'ev_108'],
        date: '2026-07-12',
      },
      {
        text: `Margin on installation fell from ${F.installGrossMarginPrior} to ${F.installGrossMarginTtm} per cent while ${F.overtimeHours} overtime hours and ${F.reworkEvents} rework events were absorbed — the cost of running a constrained resource hot.`,
        status: 'supported_inference',
        evidenceRefs: ['ev_113', 'ev_112', 'ev_114'],
        date: '2026-08-01',
      },
    ],
    diagnosis: {
      text: 'Throughput is limited by installation crew hours. Until that stage widens, every additional sale lengthens the queue instead of raising revenue, and every improvement made elsewhere in the system will show up as a local metric and nothing else.',
      status: 'supported_inference',
      evidenceRefs: ['ev_103', 'ev_105', 'ev_106', 'ev_102', 'ev_110'],
      date: '2026-08-01',
    },
    misreadings: [
      {
        text: `Demand is the problem. Rejected: proposal volume rose from ${F.proposalsQuotedPrior} to ${F.proposalsQuotedTtm} and the win rate rose from ${D.winRatePrior} to ${D.winRateTtm} per cent. More selling would add to a queue that is already ${F.queueMedianWaitDays} days deep.`,
        status: 'supported_inference',
        evidenceRefs: ['ev_110', 'ev_105'],
      },
      {
        text: `Customer concentration is the problem. Real, but not binding: the top five hold ${D.topFiveShare} per cent of revenue, which sets buyer power and pricing risk — it does not explain why completed projects were flat while sales rose.`,
        status: 'supported_inference',
        evidenceRefs: ['ev_107', 'ev_102'],
      },
      {
        text: `Equipment lead times are the problem. Contributing, not binding: distributor lead time moved from ${F.equipmentLeadWeeksPrior} to ${F.equipmentLeadWeeks} weeks, which is shorter than the ${F.queueMedianWaitDays}-day median wait for a crew.`,
        status: 'supported_inference',
        evidenceRefs: ['ev_109', 'ev_105'],
      },
      {
        text: `Approvals are the problem. A candidate second constraint: ${F.changeOrders} change orders at a median of ${F.changeOrderMedianDays} days through a single approver, with crews idled on four projects. Worth fixing, but it moves days where crew capacity moves weeks.`,
        status: 'hypothesis',
        evidenceRefs: ['ev_116', 'ev_115'],
      },
      {
        text: 'Hiring alone will resolve it. Unproven: three roles have been open for months against a ninety-four-day average time to hire, so elevation is slow and exploitation of existing crew hours has to come first.',
        status: 'hypothesis',
        evidenceRefs: ['ev_117'],
      },
    ],
  },
  demonstrates: [
    {
      framework: 'bmc',
      beat: 'The canvas assembles cleanly until key resources and revenue streams disagree: the model sells more of exactly the thing it has least of.',
    },
    {
      framework: 'five-forces',
      beat: 'Buyer power scores high on concentration and switching costs — a true finding that turns out not to be the binding one.',
    },
    {
      framework: 'vrio',
      beat: 'Retrofit crews pass all four gates and dock as the one sustained advantage; the same token is the narrow point of the pipe.',
    },
    {
      framework: 'swot',
      beat: 'Strength and weakness collected against evidence strength, so the sticky-note version cannot survive.',
    },
    {
      framework: 'tows',
      beat: 'Four options minted from the cross; three of them add work to the constrained stage.',
    },
    {
      framework: 'theory-of-constraints',
      beat: 'The pipe narrows at installation. Improving service response, the tempting move, changes no downstream number.',
    },
    {
      framework: 'raci',
      beat: 'Change orders route to one approver, packets stop, and accountability for the schedule has no named owner at all.',
    },
    {
      framework: 'mckinsey-7s',
      beat: 'Structure and staff pull against strategy: one project manager, three crews, and an estimator paid on proposals won.',
    },
    {
      framework: 'balanced-scorecard',
      beat: 'A scorecard with no measure for the queue, which is why the queue grew unnoticed for four quarters.',
    },
    {
      framework: 'okrs',
      beat: 'Key results written against crew hours released rather than against revenue booked.',
    },
    {
      framework: 'pestle',
      beat: 'Refrigerant regulation and distributor lead times, dated and scored, sit behind the equipment story.',
    },
  ],
  pullQuote:
    'A hundred true findings. One of them is binding, and the other ninety-nine are how you stay busy while nothing moves.',
};
