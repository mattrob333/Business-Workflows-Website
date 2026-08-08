/**
 * RelayDesk — the evidence pack.
 *
 * Fictional. B2B SaaS: shared-inbox and request routing for operations teams. Acquisition
 * works; retention does not. The churn interviews are the load-bearing evidence and are
 * written as people actually talk — the excerpt is the finding, not a paraphrase of it.
 */

import type { Evidence } from '@/lib/claim';
import { num, pct, ratio, round, usd } from '@/lib/format';

export const RELAYDESK_FIGURES = {
  // The ARR bridge — these five numbers must reconcile.
  arrPrior: 3_400_000,
  newLogoArr: 1_498_000,
  expansionArr: 400_000,
  churnedArr: 900_000,
  contractionArr: 200_000,
  arrCurrent: 4_198_000,

  // Logos
  customersStart: 612,
  customersAdded: 214,
  customersLost: 137,
  customersEnd: 689,

  // Acquisition
  trialsStarted: 690,
  acvNew: 7_000,
  cac: 6_400,
  grossMarginPct: 78,

  // Activation and onboarding
  activatedCustomers: 81,
  retentionActivatedPct: 81,
  retentionUnactivatedPct: 39,
  medianDaysToSecondInbox: 23,
  onboardingSpecialists: 2,
  onboardingSessionsPerWeek: 11,
  onboardingSessionsPerAccount: 3,
  accountsAwaitingOnboarding: 46,

  // Voice of customer
  churnInterviews: 14,
  ticketsTtm: 2_847,
  ticketsFindingConversations: 1_167,
  roadmapRequests: 312,
  roadmapRequestsShipped: 41,

  // Shape
  seatsPerAccount: 8.4,
  monthlyPlanShare: 61,
} as const;

const F = RELAYDESK_FIGURES;

export const RELAYDESK_DERIVED = {
  arrBridgeCheck:
    F.arrPrior + F.newLogoArr + F.expansionArr - F.churnedArr - F.contractionArr,
  arrGrowth: ratio(F.arrCurrent - F.arrPrior, F.arrPrior),
  grossLogoRetention: ratio(F.customersStart - F.customersLost, F.customersStart),
  logoChurn: ratio(F.customersLost, F.customersStart),
  netRevenueRetention: ratio(
    F.arrPrior + F.expansionArr - F.churnedArr - F.contractionArr,
    F.arrPrior,
  ),
  grossRevenueRetention: ratio(
    F.arrPrior - F.churnedArr - F.contractionArr,
    F.arrPrior,
  ),
  trialConversion: ratio(F.customersAdded, F.trialsStarted),
  acvCheck: F.newLogoArr / F.customersAdded,
  cacPaybackMonths: round(F.cac / ((F.acvNew * (F.grossMarginPct / 100)) / 12)),
  activationRate: ratio(F.activatedCustomers, F.customersAdded),
  retentionLift: round(F.retentionActivatedPct / F.retentionUnactivatedPct, 1),
  onboardingCapacityAccounts: Math.floor(
    (F.onboardingSessionsPerWeek * 52) / F.onboardingSessionsPerAccount,
  ),
  onboardingDeficitAccounts:
    F.customersAdded -
    Math.floor((F.onboardingSessionsPerWeek * 52) / F.onboardingSessionsPerAccount),
  ticketThemeShare: ratio(F.ticketsFindingConversations, F.ticketsTtm),
  roadmapShipRate: ratio(F.roadmapRequestsShipped, F.roadmapRequests),
} as const;

const D = RELAYDESK_DERIVED;

export const RELAYDESK_EVIDENCE: readonly Evidence[] = [
  {
    id: 'ev_201',
    source: 'Billing system — annual recurring revenue bridge',
    author: 'Finance lead',
    date: '2026-07-01',
    type: 'financial_record',
    excerpt: `Opening ARR ${usd(F.arrPrior)}. New logos added ${usd(
      F.newLogoArr,
    )}, expansion ${usd(F.expansionArr)}, churn ${usd(F.churnedArr)}, contraction ${usd(
      F.contractionArr,
    )}. Closing ARR ${usd(F.arrCurrent)} — growth of ${pct(
      D.arrGrowth,
    )}. Net revenue retention ${pct(D.netRevenueRetention)}; gross revenue retention ${pct(
      D.grossRevenueRetention,
    )}.`,
    reliability: 'high',
  },
  {
    id: 'ev_202',
    source: 'Billing system — customer counts',
    author: 'Finance lead',
    date: '2026-07-01',
    type: 'analytics',
    excerpt: `Started the year with ${F.customersStart} paying accounts, added ${F.customersAdded}, lost ${F.customersLost}, finished with ${F.customersEnd}. Gross logo retention ${pct(
      D.grossLogoRetention,
    )}; logo churn ${pct(D.logoChurn)}.`,
    reliability: 'high',
  },
  {
    id: 'ev_203',
    source: 'Product analytics — trial to paid conversion',
    date: '2026-07-03',
    type: 'analytics',
    excerpt: `${F.trialsStarted} trials started in the trailing twelve months and ${F.customersAdded} converted — ${pct(
      D.trialConversion,
    )}. Conversion has been within two points of that figure for six quarters. The top of the funnel is not the problem.`,
    reliability: 'high',
  },
  {
    id: 'ev_204',
    source: 'Marketing and sales spend reconciliation',
    author: 'Finance lead',
    date: '2026-07-01',
    type: 'financial_record',
    excerpt: `Blended acquisition cost ${usd(F.cac)} per new account against a new-account contract value of ${usd(
      F.acvNew,
    )} and ${pct(F.grossMarginPct, 0)} gross margin — payback of ${D.cacPaybackMonths} months. Accounts that leave before month fifteen are sold at a loss.`,
    reliability: 'high',
  },
  {
    id: 'ev_205',
    source: 'Product analytics — activation cohort analysis',
    date: '2026-07-08',
    type: 'analytics',
    excerpt: `${F.activatedCustomers} of ${F.customersAdded} new accounts connected a second inbox within the first week (${pct(
      D.activationRate,
    )}). Twelve months later ${pct(F.retentionActivatedPct, 0)} of those accounts are still paying, against ${pct(
      F.retentionUnactivatedPct,
      0,
    )} of the rest — a ${D.retentionLift} times difference on a single onboarding step.`,
    reliability: 'high',
  },
  {
    id: 'ev_206',
    source: 'Support desk — ticket volume coded by theme',
    date: '2026-07-10',
    type: 'analytics',
    excerpt: `${num(F.ticketsTtm)} tickets in the trailing twelve months. The largest theme, at ${num(
      F.ticketsFindingConversations,
    )} tickets (${pct(
      D.ticketThemeShare,
    )}), is people unable to find a conversation they know exists. Second is permissions.`,
    reliability: 'medium',
  },
  {
    id: 'ev_207',
    source: 'Roadmap request register',
    author: 'Head of product',
    date: '2026-07-14',
    type: 'document',
    excerpt: `${F.roadmapRequests} distinct feature requests recorded; ${F.roadmapRequestsShipped} shipped (${pct(
      D.roadmapShipRate,
    )}). No requested feature appears in more than nine per cent of accounts. Requests cluster around reporting, which no churn interview raised.`,
    reliability: 'medium',
  },
  {
    id: 'ev_208',
    source: 'Pricing page and plan mix export',
    date: '2026-06-30',
    type: 'document',
    excerpt: `Three plans priced per seat. ${pct(
      F.monthlyPlanShare,
      0,
    )} of accounts are on monthly billing; average account holds ${F.seatsPerAccount} seats. Monthly billing makes leaving a decision anyone can make on a Tuesday.`,
    reliability: 'high',
  },
  {
    id: 'ev_209',
    source: 'Churn interview — operations manager, logistics company, 41 seats',
    date: '2026-05-12',
    type: 'interview',
    excerpt:
      'We bought it because our shared mailbox was chaos. Six weeks in, two people were using it properly and everyone else was still replying from their own mail. It was not the product. Nobody ever sat us down and set it up.',
    reliability: 'medium',
  },
  {
    id: 'ev_210',
    source: 'Churn interview — head of customer operations, e-commerce brand, 12 seats',
    date: '2026-05-19',
    type: 'interview',
    excerpt:
      'Honestly? We never got the second inbox connected. So we were paying for a tool that solved a quarter of the problem, and the quarter it solved we could do in a spreadsheet.',
    reliability: 'medium',
  },
  {
    id: 'ev_211',
    source: 'Churn interview — office manager, professional services firm, 6 seats',
    date: '2026-06-02',
    type: 'interview',
    excerpt:
      'I could not find anything. If a client asked what we told them in March, I had to ask three people. That is the exact thing I was trying to fix when I signed up.',
    reliability: 'medium',
  },
  {
    id: 'ev_212',
    source: 'Churn interview — operations lead, healthcare staffing agency, 23 seats',
    date: '2026-06-09',
    type: 'interview',
    excerpt:
      'Your team kept emailing me about a new reporting dashboard. I did not need reports. I needed the four people on my night shift to stop dropping requests, and that never got easier.',
    reliability: 'medium',
  },
  {
    id: 'ev_213',
    source: 'Churn interview — founder, agency, 9 seats',
    date: '2026-06-17',
    type: 'interview',
    excerpt:
      'We switched because the other one had an onboarding call in the first three days and someone watched us do it. That is the whole reason. Your product is better, for what it is worth.',
    reliability: 'medium',
  },
  {
    id: 'ev_214',
    source: 'Churn interview — support lead, marketplace, 17 seats',
    date: '2026-06-24',
    type: 'interview',
    excerpt:
      'It worked fine for the two months our old support lead was here. When she left, nobody knew how the routing rules were set up, and we went back to the mailbox within a fortnight.',
    reliability: 'medium',
  },
  {
    id: 'ev_215',
    source: 'Onboarding queue — customer success workload',
    author: 'Customer success lead',
    date: '2026-07-16',
    type: 'operational_data',
    excerpt: `${F.onboardingSpecialists} onboarding specialists run ${F.onboardingSessionsPerWeek} guided sessions a week, and a full setup takes ${F.onboardingSessionsPerAccount} sessions — roughly ${D.onboardingCapacityAccounts} accounts a year against ${F.customersAdded} sold. ${F.accountsAwaitingOnboarding} accounts are waiting for a session. Median time from signup to a second inbox connected is ${F.medianDaysToSecondInbox} days.`,
    reliability: 'high',
  },
  {
    id: 'ev_216',
    source: 'Win-loss survey — accounts that cancelled, structured questionnaire',
    date: '2026-07-05',
    type: 'survey',
    excerpt: `Of ${F.churnInterviews} cancelled accounts surveyed, nine selected "we never got it fully set up" as the primary reason, three selected price, and two selected a missing feature. The sample is small and self-reported.`,
    reliability: 'low',
  },
  {
    id: 'ev_217',
    source: 'Competitive scan — public pricing and onboarding claims',
    date: '2026-06-28',
    type: 'market_research',
    excerpt:
      'Two of the four nearest competitors advertise a guided implementation call inside the first seventy-two hours; one includes migration of an existing mailbox at no cost. Feature lists across all four are close to identical.',
    reliability: 'low',
  },
  {
    id: 'ev_218',
    source: 'Customer success staffing plan',
    author: 'Customer success lead',
    date: '2026-07-16',
    type: 'document',
    excerpt: `Headcount plan holds onboarding at ${F.onboardingSpecialists} specialists through the year — about ${D.onboardingCapacityAccounts} accounts of capacity — while the sales plan assumes ${F.customersAdded} new accounts again, a shortfall of ${D.onboardingDeficitAccounts}. Nobody has reconciled the two documents.`,
    reliability: 'high',
  },
];
