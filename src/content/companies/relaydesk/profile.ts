/**
 * RelayDesk — the profile: shared business state, hand-authored.
 *
 * The customer-stack example. Acquisition is a strength on the canvas and the reason the
 * business is in trouble: it keeps buying accounts that onboarding cannot absorb.
 */

import type { Claim, Metric } from '@/lib/claim';
import type { CompanyProfile } from '../types';
import { RELAYDESK_DERIVED as D, RELAYDESK_FIGURES as F } from './evidence';

const metric = (label: string, value: number | string, unit: string, evidenceRef: string): Metric => ({
  label,
  value,
  unit,
  evidenceRef,
});

const headline: Claim[] = [
  {
    text: `Revenue grew ${D.arrGrowth} per cent while gross revenue retention sat at ${D.grossRevenueRetention} per cent — growth bought, not compounded.`,
    status: 'fact',
    evidenceRefs: ['ev_201'],
    date: '2026-07-01',
  },
  {
    text: 'Accounts that connect a second inbox in week one behave like a different company from accounts that do not.',
    status: 'fact',
    evidenceRefs: ['ev_205'],
    date: '2026-07-08',
  },
  {
    text: 'The product people churn away from is the product they never finished setting up.',
    status: 'supported_inference',
    evidenceRefs: ['ev_209', 'ev_210', 'ev_213', 'ev_216', 'ev_215'],
    date: '2026-08-01',
  },
];

export const relaydeskProfile: CompanyProfile = {
  id: 'relaydesk',
  name: 'RelayDesk',
  sector: 'B2B SaaS — shared inbox and request routing for operations teams',
  oneLiner:
    'Seven hundred small operations teams run their shared mailboxes on RelayDesk, and a third of them leave within a year.',
  headline,
  segments: {
    field: 'customer_segments',
    label: 'Customer segments',
    items: [
      {
        name: 'Small operations teams (5–15 seats)',
        description:
          'Agencies, e-commerce brands and professional services firms replacing a shared mailbox. Self-serve, monthly billing.',
        shareOfRevenue: metric('Accounts on monthly billing', F.monthlyPlanShare, '%', 'ev_208'),
        notes: [
          {
            text: 'This segment converts from trial without help and leaves without warning.',
            status: 'supported_inference',
            evidenceRefs: ['ev_203', 'ev_208', 'ev_202'],
          },
        ],
      },
      {
        name: 'Multi-shift operations (15–50 seats)',
        description:
          'Logistics, staffing and marketplace operations with handover between shifts; the segment that needs routing rules to work.',
        shareOfRevenue: metric('Average seats per account', F.seatsPerAccount, 'seats', 'ev_208'),
        notes: [
          {
            text: 'When configuration knowledge leaves with one employee, the account reverts to a mailbox.',
            status: 'supported_inference',
            evidenceRefs: ['ev_214', 'ev_212'],
          },
        ],
      },
    ],
  },
  valuePropositions: {
    field: 'value_propositions',
    label: 'Value propositions',
    items: [
      {
        segment: 'Small operations teams',
        promise: {
          text: 'Turn a shared mailbox into assigned, trackable work in an afternoon.',
          status: 'assumption',
          evidenceRefs: ['ev_203'],
        },
        proof: [
          {
            text: `The promise holds only for the ${D.activationRate} per cent of accounts that connect a second inbox in week one.`,
            status: 'supported_inference',
            evidenceRefs: ['ev_205'],
          },
        ],
      },
      {
        segment: 'Multi-shift operations',
        promise: {
          text: 'Nothing gets dropped between shifts.',
          status: 'assumption',
          evidenceRefs: ['ev_212'],
        },
        proof: [
          {
            text: 'The largest support theme is people unable to find a conversation they know exists — the promise inverted.',
            status: 'supported_inference',
            evidenceRefs: ['ev_206', 'ev_211'],
          },
        ],
      },
    ],
  },
  revenueMix: {
    field: 'revenue_streams',
    label: 'Revenue (annual recurring)',
    items: [
      metric('Opening ARR', F.arrPrior, 'USD', 'ev_201'),
      metric('New logo ARR', F.newLogoArr, 'USD', 'ev_201'),
      metric('Expansion ARR', F.expansionArr, 'USD', 'ev_201'),
      metric('Churned ARR', F.churnedArr, 'USD', 'ev_201'),
      metric('Contraction ARR', F.contractionArr, 'USD', 'ev_201'),
      metric('Closing ARR', F.arrCurrent, 'USD', 'ev_201'),
    ],
  },
  capabilities: {
    field: 'key_resources',
    label: 'Capabilities and resources',
    items: [
      {
        name: 'Self-serve acquisition',
        description: 'Content, trial and a checkout that converts without a salesperson.',
        assessment: {
          text: 'Genuinely strong and genuinely replicable — valuable, not rare.',
          status: 'supported_inference',
          evidenceRefs: ['ev_203', 'ev_217'],
        },
        measures: [
          metric('Trial conversion', D.trialConversion, '%', 'ev_203'),
          metric('Trials started', F.trialsStarted, 'trials', 'ev_203'),
          metric('Acquisition cost', F.cac, 'USD', 'ev_204'),
        ],
      },
      {
        name: 'Onboarding and implementation',
        description: 'Two specialists running guided setup sessions for new accounts.',
        assessment: {
          text: 'The stage that determines whether an account survives, staffed as if it were an overhead.',
          status: 'supported_inference',
          evidenceRefs: ['ev_215', 'ev_205', 'ev_218'],
        },
        measures: [
          metric('Onboarding specialists', F.onboardingSpecialists, 'people', 'ev_215'),
          metric('Accounts awaiting onboarding', F.accountsAwaitingOnboarding, 'accounts', 'ev_215'),
          metric('Median days to second inbox', F.medianDaysToSecondInbox, 'days', 'ev_215'),
        ],
      },
      {
        name: 'Routing and assignment engine',
        description: 'Rules that assign incoming requests across a team and across shifts.',
        assessment: {
          text: 'The product capability customers describe as the reason to buy, and the one they never finish configuring.',
          status: 'supported_inference',
          evidenceRefs: ['ev_212', 'ev_214'],
        },
        measures: [metric('Support tickets, trailing twelve months', F.ticketsTtm, 'tickets', 'ev_206')],
      },
    ],
  },
  org: {
    field: 'work_assignments',
    label: 'People and ownership',
    items: [
      {
        role: 'Customer success',
        headcount: metric('Onboarding specialists', F.onboardingSpecialists, 'people', 'ev_215'),
        owns: 'Guided setup, migration, configuration handover',
        note: {
          text: `Capacity is about ${D.onboardingCapacityAccounts} accounts a year against ${F.customersAdded} sold — a shortfall of ${D.onboardingDeficitAccounts}.`,
          status: 'fact',
          evidenceRefs: ['ev_215', 'ev_202'],
        },
      },
      {
        role: 'Product',
        headcount: metric('Requests recorded', F.roadmapRequests, 'requests', 'ev_207'),
        owns: 'Roadmap prioritisation and the request register',
        note: {
          text: 'Requests cluster around reporting; no churn interview mentions reporting.',
          status: 'supported_inference',
          evidenceRefs: ['ev_207', 'ev_212'],
        },
      },
    ],
  },
  systems: {
    field: 'key_activities',
    label: 'Systems of record',
    items: [
      {
        name: 'Product analytics',
        supports: 'Trial, activation and cohort retention measurement',
        note: {
          text: 'The activation signal has existed in the data for six quarters and has never been an operating target.',
          status: 'supported_inference',
          evidenceRefs: ['ev_205', 'ev_203'],
        },
      },
      {
        name: 'Support desk',
        supports: 'Ticket intake and theme coding',
        note: {
          text: 'Theme coding is manual and applied inconsistently across weekends.',
          status: 'assumption',
          evidenceRefs: ['ev_206'],
        },
      },
      {
        name: 'Onboarding queue',
        supports: 'Scheduling guided setup sessions',
        note: {
          text: `${F.accountsAwaitingOnboarding} accounts are in the queue, which is roughly four weeks of capacity.`,
          status: 'fact',
          evidenceRefs: ['ev_215'],
        },
      },
    ],
  },
  operating: {
    field: 'performance_metrics',
    label: 'Operating measures',
    items: [
      metric('Gross logo retention', D.grossLogoRetention, '%', 'ev_202'),
      metric('Net revenue retention', D.netRevenueRetention, '%', 'ev_201'),
      metric('Gross revenue retention', D.grossRevenueRetention, '%', 'ev_201'),
      metric('Trial conversion', D.trialConversion, '%', 'ev_203'),
      metric('Activation rate, week one', D.activationRate, '%', 'ev_205'),
      metric('Retention lift when activated', D.retentionLift, 'x', 'ev_205'),
      metric('Acquisition payback', D.cacPaybackMonths, 'months', 'ev_204'),
      metric('Median days to second inbox', F.medianDaysToSecondInbox, 'days', 'ev_215'),
      metric('Onboarding capacity', D.onboardingCapacityAccounts, 'accounts/year', 'ev_215'),
      metric('Accounts awaiting onboarding', F.accountsAwaitingOnboarding, 'accounts', 'ev_215'),
      metric('Largest support theme share', D.ticketThemeShare, '%', 'ev_206'),
    ],
  },
  fieldsPopulated: [
    'company_profile',
    'customer_segments',
    'value_propositions',
    'channels',
    'revenue_streams',
    'key_resources',
    'key_activities',
    'financials',
    'performance_metrics',
    'pipeline',
    'customer_jobs',
    'customer_pains_gains',
    'flow_stages',
    'capacity_utilization',
    'delivery_backlog',
    'work_assignments',
    'assumptions',
    'open_questions',
  ],
};
