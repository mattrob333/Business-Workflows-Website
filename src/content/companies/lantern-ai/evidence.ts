/**
 * Lantern AI — the evidence pack.
 *
 * Fictional. An enterprise AI startup with one product, three candidate markets and
 * thirteen months of runway. The pack exists to make a *direction* decision inspectable:
 * pipeline, cycle time, delivery cost, team skills and the compliance gate.
 */

import type { Evidence } from '@/lib/claim';
import { pct, ratio, round, usd } from '@/lib/format';

export const LANTERN_FIGURES = {
  // Money
  raised: 6_500_000,
  cashOnHand: 4_100_000,
  monthlyBurn: 312_000,
  arr: 840_000,
  customers: 4,
  grossMarginPct: 54,

  // Pipeline, by candidate market
  oppsFinancialServices: 18,
  oppsHealthcare: 14,
  oppsLogistics: 14,
  valueFinancialServices: 6_100_000,
  valueHealthcare: 3_400_000,
  valueLogistics: 2_900_000,
  weightedPipeline: 3_100_000,

  // Cycle
  cycleDaysFinancialServices: 187,
  cycleDaysHealthcare: 214,
  cycleDaysLogistics: 96,

  // Delivery
  proofsOfConcept: 11,
  proofsToProduction: 3,
  forwardDeployedWeeksPerDeployment: 6,

  // Team
  headcount: 19,
  platformEngineers: 9,
  mlResearchers: 3,
  forwardDeployedEngineers: 3,
  goToMarket: 2,
  designers: 1,
  operations: 1,

  // The gate
  securityQuestionnaires: 18,
  oppsBlockedOnCertification: 7,
  certificationMonths: 9,
  certificationCost: 180_000,
} as const;

const F = LANTERN_FIGURES;

export const LANTERN_DERIVED = {
  runwayMonths: round(F.cashOnHand / F.monthlyBurn),
  totalOpps: F.oppsFinancialServices + F.oppsHealthcare + F.oppsLogistics,
  totalPipeline: F.valueFinancialServices + F.valueHealthcare + F.valueLogistics,
  headcountCheck:
    F.platformEngineers +
    F.mlResearchers +
    F.forwardDeployedEngineers +
    F.goToMarket +
    F.designers +
    F.operations,
  averageContractValue: F.arr / F.customers,
  pocConversion: ratio(F.proofsToProduction, F.proofsOfConcept),
  blockedShareOfFinancialServices: ratio(F.oppsBlockedOnCertification, F.oppsFinancialServices),
  logisticsCycleAdvantage: F.cycleDaysFinancialServices - F.cycleDaysLogistics,
  monthsToCloseFinancialServices: round(F.cycleDaysFinancialServices / 30),
} as const;

const D = LANTERN_DERIVED;

export const LANTERN_EVIDENCE: readonly Evidence[] = [
  {
    id: 'ev_301',
    source: 'Bank statements and board reporting pack',
    author: 'Founder and chief executive',
    date: '2026-07-31',
    type: 'financial_record',
    excerpt: `Seed round of ${usd(F.raised)} closed last year. Cash on hand ${usd(
      F.cashOnHand,
    )} against a monthly net burn of ${usd(
      F.monthlyBurn,
    )} — ${D.runwayMonths} months of runway at the current plan.`,
    reliability: 'high',
  },
  {
    id: 'ev_302',
    source: 'Sales pipeline export, by candidate market',
    author: 'Head of go-to-market',
    date: '2026-07-28',
    type: 'analytics',
    excerpt: `${D.totalOpps} qualified opportunities worth ${usd(
      D.totalPipeline,
    )}: financial services ${F.oppsFinancialServices} opportunities at ${usd(
      F.valueFinancialServices,
    )}, healthcare ${F.oppsHealthcare} at ${usd(F.valueHealthcare)}, logistics ${
      F.oppsLogistics
    } at ${usd(F.valueLogistics)}. Probability-weighted, the pipeline is ${usd(
      F.weightedPipeline,
    )}.`,
    reliability: 'medium',
  },
  {
    id: 'ev_303',
    source: 'Customer relationship system — median days from first meeting to signature',
    date: '2026-07-28',
    type: 'analytics',
    excerpt: `Median sales cycle by market: financial services ${F.cycleDaysFinancialServices} days, healthcare ${F.cycleDaysHealthcare} days, logistics ${F.cycleDaysLogistics} days. Financial services closes roughly ${D.monthsToCloseFinancialServices} months out — beyond the current runway for anything not already in motion.`,
    reliability: 'medium',
  },
  {
    id: 'ev_304',
    source: 'Signed contracts — closed-won register',
    author: 'Head of go-to-market',
    date: '2026-07-28',
    type: 'contract',
    excerpt: `${F.customers} paying customers producing ${usd(
      F.arr,
    )} of annual recurring revenue, an average of ${usd(
      D.averageContractValue,
    )} each. Two are in logistics, one in healthcare, one in financial services.`,
    reliability: 'high',
  },
  {
    id: 'ev_305',
    source: 'Delivery log — proofs of concept and outcomes',
    author: 'Head of delivery',
    date: '2026-07-24',
    type: 'operational_data',
    excerpt: `${F.proofsOfConcept} proofs of concept run in the last eighteen months; ${F.proofsToProduction} reached production (${pct(
      D.pocConversion,
    )}). Each deployment consumed about ${F.forwardDeployedWeeksPerDeployment} weeks of forward-deployed engineering.`,
    reliability: 'high',
  },
  {
    id: 'ev_306',
    source: 'Team roster and skills matrix',
    date: '2026-07-01',
    type: 'document',
    excerpt: `${F.headcount} people: ${F.platformEngineers} platform engineers, ${F.mlResearchers} machine-learning researchers, ${F.forwardDeployedEngineers} forward-deployed engineers, ${F.goToMarket} in go-to-market, ${F.designers} designer, ${F.operations} in operations. No one on the team has previously sold into a regulated bank.`,
    reliability: 'high',
  },
  {
    id: 'ev_307',
    source: 'Security questionnaire log',
    author: 'Operations lead',
    date: '2026-07-22',
    type: 'document',
    excerpt: `${F.securityQuestionnaires} security questionnaires received this year. ${F.oppsBlockedOnCertification} financial-services opportunities are explicitly blocked on an independent security certification the company does not hold — ${pct(
      D.blockedShareOfFinancialServices,
    )} of that market's pipeline by count.`,
    reliability: 'high',
  },
  {
    id: 'ev_308',
    source: 'Prospect interview — vice-president of data, regional bank',
    date: '2026-06-15',
    type: 'interview',
    excerpt:
      'The model quality is not what I am worried about. I am worried about explaining to my regulator why a vendor with nineteen people has access to this data. Come back with the certification and a reference in our sector and this is a short conversation.',
    reliability: 'medium',
  },
  {
    id: 'ev_309',
    source: 'Prospect interview — chief information officer, hospital network',
    date: '2026-06-19',
    type: 'interview',
    excerpt:
      'Our procurement cycle is eleven months and it does not compress for anybody. If you are trying to prove something to investors this year, we are the wrong customer.',
    reliability: 'medium',
  },
  {
    id: 'ev_310',
    source: 'Prospect interview — operations director, freight brokerage',
    date: '2026-06-26',
    type: 'interview',
    excerpt:
      'I can sign this myself if it saves my planners an hour a shift. Show me that in a two-week pilot on our own data and we will not need a committee.',
    reliability: 'medium',
  },
  {
    id: 'ev_311',
    source: 'Competitive scan — funding announcements and positioning',
    date: '2026-07-10',
    type: 'market_research',
    excerpt:
      'Two better-capitalised competitors announced financial-services-specific products in the last two quarters, both with existing certifications. Neither has published anything aimed at freight or logistics operations.',
    reliability: 'low',
  },
  {
    id: 'ev_312',
    source: 'Regulatory monitoring digest',
    date: '2026-07-05',
    type: 'market_research',
    excerpt:
      'Model documentation and audit-trail obligations for automated decisions in regulated financial services tighten next year. Logistics operations fall outside the current scope of that regime.',
    reliability: 'medium',
  },
  {
    id: 'ev_313',
    source: 'Delivery cost analysis by deployment',
    author: 'Head of delivery',
    date: '2026-07-24',
    type: 'financial_record',
    excerpt: `Gross margin across the ${F.customers} live customers is ${pct(
      F.grossMarginPct,
      0,
    )}, held down by ${F.forwardDeployedWeeksPerDeployment} weeks of forward-deployed engineering per deployment. Margin improves only if deployment becomes repeatable within one market.`,
    reliability: 'high',
  },
  {
    id: 'ev_314',
    source: 'Certification readiness quote and plan',
    author: 'Operations lead',
    date: '2026-07-22',
    type: 'document',
    excerpt: `Independent security certification is quoted at ${usd(
      F.certificationCost,
    )} and ${F.certificationMonths} months to first report, including two months of engineering work that would come out of the platform roadmap.`,
    reliability: 'medium',
  },
];
