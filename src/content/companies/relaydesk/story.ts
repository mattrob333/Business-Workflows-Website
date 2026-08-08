/**
 * RelayDesk — the narrative beats. The customer-stack teaser (03-content-spec).
 */

import type { CompanyStory } from '../types';
import { RELAYDESK_DERIVED as D, RELAYDESK_FIGURES as F } from './evidence';

export const relaydeskStory: CompanyStory = {
  id: 'relaydesk',
  challenge: [
    'RelayDesk has the funnel most companies want. Trials convert at a rate that has not moved in six quarters, and the content engine keeps filling the top.',
    'It also loses roughly a third of its accounts every year, and the accounts it loses cost more to acquire than they ever paid.',
    'The board reads the growth number. The founder reads the retention number. Both are looking at the same business.',
    'The roadmap has three hundred requests on it. The churn interviews mention none of them.',
  ],
  constraint: {
    headline: 'Onboarding capacity, not product surface.',
    beats: [
      {
        text: `Trials convert at ${D.trialConversion} per cent and have for six quarters — acquisition is not the failing stage.`,
        status: 'fact',
        evidenceRefs: ['ev_203'],
        date: '2026-07-03',
      },
      {
        text: `Accounts that connect a second inbox in week one retain at ${F.retentionActivatedPct} per cent against ${F.retentionUnactivatedPct} per cent for the rest, and only ${D.activationRate} per cent of new accounts get there.`,
        status: 'fact',
        evidenceRefs: ['ev_205'],
        date: '2026-07-08',
      },
      {
        text: `Two onboarding specialists carry about ${D.onboardingCapacityAccounts} accounts a year against ${F.customersAdded} sold, and ${F.accountsAwaitingOnboarding} accounts are queued waiting for a session.`,
        status: 'fact',
        evidenceRefs: ['ev_215', 'ev_218'],
        date: '2026-07-16',
      },
      {
        text: 'Cancelled customers describe setup, not features: the second inbox never connected, nobody watched them do it, the person who configured the rules left.',
        status: 'supported_inference',
        evidenceRefs: ['ev_209', 'ev_210', 'ev_213', 'ev_214', 'ev_216'],
        date: '2026-08-01',
      },
    ],
    diagnosis: {
      text: `Throughput of *retained* customers is limited by guided onboarding capacity. Spending more on acquisition at a ${D.cacPaybackMonths}-month payback while accounts leave before month twelve converts marketing budget into churn.`,
      status: 'supported_inference',
      evidenceRefs: ['ev_205', 'ev_215', 'ev_204', 'ev_201'],
      date: '2026-08-01',
    },
    misreadings: [
      {
        text: `Missing features are the problem. Weak: ${F.roadmapRequests} requests are recorded, none appearing in more than nine per cent of accounts, and the cluster is reporting — which no cancelled customer raised.`,
        status: 'supported_inference',
        evidenceRefs: ['ev_207', 'ev_212'],
      },
      {
        text: 'Price is the problem. Partly: three of fourteen surveyed cancellations chose price, and monthly billing makes leaving frictionless — but that explains the ease of leaving, not the reason.',
        status: 'supported_inference',
        evidenceRefs: ['ev_216', 'ev_208'],
      },
      {
        text: 'Competitors are winning on product. Not supported: feature lists are close to identical; two competitors differentiate on a guided implementation call in the first seventy-two hours.',
        status: 'hypothesis',
        evidenceRefs: ['ev_217', 'ev_213'],
      },
    ],
  },
  demonstrates: [
    {
      framework: 'jobs-to-be-done',
      beat: 'Fourteen cancelled customers describe the same circumstance: a mailbox that became chaos, and a setup nobody finished.',
    },
    {
      framework: 'value-proposition-canvas',
      beat: 'The promise is "assigned, trackable work in an afternoon"; the fit score collapses on the pains onboarding never relieves.',
    },
    {
      framework: 'kano',
      beat: 'Transcript-derived classifications stay labelled hypotheses until a structured survey supports them.',
    },
    {
      framework: 'theory-of-constraints',
      beat: 'Onboarding is the narrow stage; more trials simply lengthen the queue in front of it.',
    },
    {
      framework: 'blue-ocean',
      beat: 'Raise implementation, eliminate the feature race — a value curve drawn from churn interviews rather than from a competitor grid.',
    },
    {
      framework: 'bmc',
      beat: 'A canvas where channels and revenue streams are strong and customer relationships is nearly empty.',
    },
    {
      framework: 'swot',
      beat: 'Self-serve acquisition is filed as a strength and, read against retention, is also the weakness.',
    },
  ],
  pullQuote:
    'They did not leave because the product was missing something. They left because they never finished arriving.',
};
