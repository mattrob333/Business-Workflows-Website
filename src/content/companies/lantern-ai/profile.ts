/**
 * Lantern AI — the profile: shared business state, hand-authored.
 *
 * The direction-stack example. One product, three candidate markets, thirteen months of
 * runway: the decision is which market to be excellent in before the money runs out.
 */

import type { Claim, Metric } from '@/lib/claim';
import type { CompanyProfile } from '../types';
import { LANTERN_DERIVED as D, LANTERN_FIGURES as F } from './evidence';

const metric = (label: string, value: number | string, unit: string, evidenceRef: string): Metric => ({
  label,
  value,
  unit,
  evidenceRef,
});

const headline: Claim[] = [
  {
    text: `${D.runwayMonths} months of runway against a financial-services sales cycle of ${F.cycleDaysFinancialServices} days.`,
    status: 'fact',
    evidenceRefs: ['ev_301', 'ev_303'],
    date: '2026-07-31',
  },
  {
    text: 'The largest pipeline sits in the market the company is least equipped to close, and the fastest-closing market has no competitor aimed at it.',
    status: 'supported_inference',
    evidenceRefs: ['ev_302', 'ev_303', 'ev_307', 'ev_311'],
    date: '2026-08-01',
  },
  {
    text: `Gross margin of ${F.grossMarginPct} per cent will not improve until deployment repeats within a single market.`,
    status: 'supported_inference',
    evidenceRefs: ['ev_313', 'ev_305'],
    date: '2026-07-24',
  },
];

export const lanternProfile: CompanyProfile = {
  id: 'lantern-ai',
  name: 'Lantern AI',
  sector: 'Enterprise AI — decision support for operational planning teams',
  oneLiner:
    'Nineteen people, four customers and one product being pitched into three markets that reward completely different things.',
  headline,
  segments: {
    field: 'customer_segments',
    label: 'Candidate markets',
    items: [
      {
        name: 'Financial services',
        description:
          'Regional banks and insurers; the largest deals, the heaviest scrutiny, and a certification gate in front of the door.',
        shareOfRevenue: metric('Pipeline value', F.valueFinancialServices, 'USD', 'ev_302'),
        notes: [
          {
            text: `${F.oppsBlockedOnCertification} of ${F.oppsFinancialServices} opportunities in this market are explicitly blocked on a certification the company does not hold.`,
            status: 'fact',
            evidenceRefs: ['ev_307'],
          },
          {
            text: 'Two better-capitalised competitors already ship sector-specific products here.',
            status: 'supported_inference',
            evidenceRefs: ['ev_311'],
          },
        ],
      },
      {
        name: 'Healthcare systems',
        description:
          'Hospital networks and provider groups; long procurement, high switching costs once inside.',
        shareOfRevenue: metric('Pipeline value', F.valueHealthcare, 'USD', 'ev_302'),
        notes: [
          {
            text: `A median cycle of ${F.cycleDaysHealthcare} days puts a first close beyond the current runway.`,
            status: 'supported_inference',
            evidenceRefs: ['ev_303', 'ev_309', 'ev_301'],
          },
        ],
      },
      {
        name: 'Logistics and freight operations',
        description:
          'Brokerages and fleet operations teams; smaller contracts, an operational buyer who can sign, and a two-week pilot as the whole sales process.',
        shareOfRevenue: metric('Pipeline value', F.valueLogistics, 'USD', 'ev_302'),
        notes: [
          {
            text: `Median cycle of ${F.cycleDaysLogistics} days — ${D.logisticsCycleAdvantage} days faster than financial services.`,
            status: 'fact',
            evidenceRefs: ['ev_303'],
          },
          {
            text: 'No scanned competitor has published anything aimed at this market.',
            status: 'supported_inference',
            evidenceRefs: ['ev_311'],
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
        segment: 'Logistics and freight operations',
        promise: {
          text: 'Give every planner back an hour a shift, provable inside a two-week pilot on the customer’s own data.',
          status: 'supported_inference',
          evidenceRefs: ['ev_310', 'ev_304'],
        },
        proof: [
          {
            text: 'Two of the four live customers are in logistics, and both moved from pilot to production.',
            status: 'fact',
            evidenceRefs: ['ev_304', 'ev_305'],
          },
        ],
      },
      {
        segment: 'Financial services',
        promise: {
          text: 'Model documentation and an audit trail that satisfies a regulator by default.',
          status: 'hypothesis',
          evidenceRefs: ['ev_308', 'ev_312'],
        },
        proof: [
          {
            text: 'The obligation is real and tightening; the company cannot yet demonstrate compliance without certification.',
            status: 'supported_inference',
            evidenceRefs: ['ev_312', 'ev_307', 'ev_314'],
          },
        ],
      },
    ],
  },
  revenueMix: {
    field: 'revenue_streams',
    label: 'Revenue and capital',
    items: [
      metric('Annual recurring revenue', F.arr, 'USD', 'ev_304'),
      metric('Average contract value', D.averageContractValue, 'USD', 'ev_304'),
      metric('Gross margin', F.grossMarginPct, '%', 'ev_313'),
      metric('Cash on hand', F.cashOnHand, 'USD', 'ev_301'),
      metric('Monthly net burn', F.monthlyBurn, 'USD', 'ev_301'),
      metric('Runway', D.runwayMonths, 'months', 'ev_301'),
    ],
  },
  capabilities: {
    field: 'key_resources',
    label: 'Capabilities and resources',
    items: [
      {
        name: 'Applied research team',
        description: 'Three researchers with published work on planning under uncertainty.',
        assessment: {
          text: 'Rare and hard to imitate, and not yet organised to capture value — the classic uncaptured advantage.',
          status: 'supported_inference',
          evidenceRefs: ['ev_306', 'ev_313'],
        },
        measures: [
          metric('Machine-learning researchers', F.mlResearchers, 'people', 'ev_306'),
          metric('Gross margin', F.grossMarginPct, '%', 'ev_313'),
        ],
      },
      {
        name: 'Forward-deployed delivery',
        description: 'Engineers who sit with the customer for the length of a deployment.',
        assessment: {
          text: `Valuable and expensive: ${F.forwardDeployedWeeksPerDeployment} weeks per deployment is what holds margin at ${F.grossMarginPct} per cent.`,
          status: 'fact',
          evidenceRefs: ['ev_313', 'ev_305'],
        },
        measures: [
          metric('Forward-deployed engineers', F.forwardDeployedEngineers, 'people', 'ev_306'),
          metric('Proof-of-concept conversion', D.pocConversion, '%', 'ev_305'),
        ],
      },
      {
        name: 'Enterprise trust and certification',
        description: 'The security posture an enterprise buyer requires before data moves.',
        assessment: {
          text: `Absent. ${F.certificationMonths} months and ${F.certificationCost / 1000} thousand dollars to acquire, against ${D.runwayMonths} months of runway.`,
          status: 'fact',
          evidenceRefs: ['ev_314', 'ev_307', 'ev_301'],
        },
        measures: [
          metric('Opportunities blocked', F.oppsBlockedOnCertification, 'opportunities', 'ev_307'),
          metric('Time to certification', F.certificationMonths, 'months', 'ev_314'),
        ],
      },
    ],
  },
  org: {
    field: 'work_assignments',
    label: 'People and ownership',
    items: [
      {
        role: 'Platform engineering',
        headcount: metric('Headcount', F.platformEngineers, 'people', 'ev_306'),
        owns: 'The product, the model pipeline, and any certification engineering work',
        note: {
          text: 'Certification would take two months of this team out of the roadmap.',
          status: 'fact',
          evidenceRefs: ['ev_314'],
        },
      },
      {
        role: 'Go-to-market',
        headcount: metric('Headcount', F.goToMarket, 'people', 'ev_306'),
        owns: 'Pipeline across all three candidate markets simultaneously',
        note: {
          text: 'Two people are covering three markets with three different buying processes.',
          status: 'supported_inference',
          evidenceRefs: ['ev_306', 'ev_302', 'ev_303'],
        },
      },
      {
        role: 'Delivery',
        headcount: metric('Headcount', F.forwardDeployedEngineers, 'people', 'ev_306'),
        owns: 'Proofs of concept and production deployments',
        note: {
          text: `${F.proofsOfConcept} proofs of concept produced ${F.proofsToProduction} production customers.`,
          status: 'fact',
          evidenceRefs: ['ev_305'],
        },
      },
    ],
  },
  systems: {
    field: 'key_activities',
    label: 'Systems of record',
    items: [
      {
        name: 'Customer relationship system',
        supports: 'Pipeline, stage and cycle-time measurement',
        note: {
          text: 'Cycle time is measured by market, which is the only reason the three markets are comparable at all.',
          status: 'fact',
          evidenceRefs: ['ev_303', 'ev_302'],
        },
      },
      {
        name: 'Delivery log',
        supports: 'Proof-of-concept tracking and deployment effort',
        note: {
          text: 'Effort per deployment is recorded; effort per market is not, so repeatability is inferred rather than measured.',
          status: 'assumption',
          evidenceRefs: ['ev_305', 'ev_313'],
        },
      },
      {
        name: 'Security questionnaire log',
        supports: 'Enterprise procurement responses',
        note: {
          text: 'The log is where the certification gate first became visible as a pattern rather than as one lost deal.',
          status: 'supported_inference',
          evidenceRefs: ['ev_307'],
        },
      },
    ],
  },
  operating: {
    field: 'performance_metrics',
    label: 'Operating measures',
    items: [
      metric('Runway', D.runwayMonths, 'months', 'ev_301'),
      metric('Qualified opportunities', D.totalOpps, 'opportunities', 'ev_302'),
      metric('Pipeline value', D.totalPipeline, 'USD', 'ev_302'),
      metric('Weighted pipeline', F.weightedPipeline, 'USD', 'ev_302'),
      metric('Median cycle, financial services', F.cycleDaysFinancialServices, 'days', 'ev_303'),
      metric('Median cycle, healthcare', F.cycleDaysHealthcare, 'days', 'ev_303'),
      metric('Median cycle, logistics', F.cycleDaysLogistics, 'days', 'ev_303'),
      metric('Proof-of-concept conversion', D.pocConversion, '%', 'ev_305'),
      metric('Headcount', F.headcount, 'people', 'ev_306'),
      metric('Gross margin', F.grossMarginPct, '%', 'ev_313'),
    ],
  },
  fieldsPopulated: [
    'company_profile',
    'customer_segments',
    'value_propositions',
    'revenue_streams',
    'key_resources',
    'key_activities',
    'financials',
    'performance_metrics',
    'pipeline',
    'competitors',
    'external_signals',
    'capabilities_vrio',
    'capability_gaps',
    'strategic_options',
    'work_assignments',
    'risk_register',
    'assumptions',
    'open_questions',
  ],
};
