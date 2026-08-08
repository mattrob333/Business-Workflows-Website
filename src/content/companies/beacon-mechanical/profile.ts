/**
 * Beacon Mechanical — the profile: shared business state, hand-authored.
 *
 * Every section binds to a registry state field; every number is a `Metric` carrying the
 * evidence object it came from. Nothing here is asserted that ev_101–ev_120 do not support.
 */

import type { Claim, Metric } from '@/lib/claim';
import type { CompanyProfile } from '../types';
import { BEACON_DERIVED as D, BEACON_FIGURES as F } from './evidence';

const metric = (label: string, value: number | string, unit: string, evidenceRef: string): Metric => ({
  label,
  value,
  unit,
  evidenceRef,
});

const headline: Claim[] = [
  {
    text: `Revenue grew ${D.revenueGrowth} per cent to ${F.revenueTtm / 1_000_000} million dollars while completed installation projects moved from ${F.projectsCompletedPrior} to ${F.projectsCompletedTtm}.`,
    status: 'fact',
    evidenceRefs: ['ev_101', 'ev_102'],
    date: '2026-07-06',
  },
  {
    text: 'The business is selling faster than it can install, and the gap is accumulating on the dispatch board rather than in the income statement.',
    status: 'supported_inference',
    evidenceRefs: ['ev_105', 'ev_106', 'ev_102'],
    date: '2026-08-01',
  },
  {
    text: 'Margin erosion is a symptom of compressed schedules, not of pricing.',
    status: 'supported_inference',
    evidenceRefs: ['ev_113', 'ev_112', 'ev_114'],
    date: '2026-08-01',
  },
];

export const beaconProfile: CompanyProfile = {
  id: 'beacon-mechanical',
  name: 'Beacon Mechanical',
  sector: 'Commercial HVAC service and installation',
  oneLiner:
    'A regional commercial HVAC contractor with three installation crews, a service book that funds the business, and a queue that keeps getting longer.',
  headline,
  segments: {
    field: 'customer_segments',
    label: 'Customer segments',
    items: [
      {
        name: 'Multi-tenant property management',
        description:
          'Owners and managers of office and retail portfolios; buys planned replacement work and contracted maintenance.',
        shareOfRevenue: metric('Share of revenue', D.segmentPropertyShare, '%', 'ev_107'),
        notes: [
          {
            text: 'Three of the five largest accounts sit in this segment, which is where the concentration risk lives.',
            status: 'supported_inference',
            evidenceRefs: ['ev_107'],
          },
        ],
      },
      {
        name: 'Industrial and logistics facilities',
        description:
          'Distribution centres and light manufacturing; process-critical cooling, tolerant of price, intolerant of downtime.',
        shareOfRevenue: metric('Share of revenue', D.segmentIndustrialShare, '%', 'ev_107'),
        notes: [
          {
            text: 'This segment is the most willing to pay for speed, and the most likely to leave over a start date.',
            status: 'hypothesis',
            evidenceRefs: ['ev_111', 'ev_119'],
          },
        ],
      },
      {
        name: 'Public sector and schools',
        description:
          'District and municipal buildings; procurement-led, summer-window installation, slow but dependable.',
        shareOfRevenue: metric('Share of revenue', D.segmentPublicShare, '%', 'ev_107'),
        notes: [
          {
            text: 'Summer installation windows collide with the peak of the queue every year.',
            status: 'supported_inference',
            evidenceRefs: ['ev_105', 'ev_108'],
          },
        ],
      },
      {
        name: 'Grocery and hospitality',
        description:
          'Refrigeration-adjacent work and rooftop replacement; high emergency call volume, contract-heavy.',
        shareOfRevenue: metric('Share of revenue', D.segmentHospitalityShare, '%', 'ev_107'),
        notes: [
          {
            text: 'The emergency line is almost entirely this segment.',
            status: 'assumption',
            evidenceRefs: ['ev_101'],
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
        segment: 'Multi-tenant property management',
        promise: {
          text: 'One contractor covers planned replacement and the maintenance contract, so the building has a single number to call.',
          status: 'fact',
          evidenceRefs: ['ev_101'],
        },
        proof: [
          {
            text: 'Service contracts and installation are sold to the same accounts, and the service line funds the field organisation between projects.',
            status: 'supported_inference',
            evidenceRefs: ['ev_101', 'ev_104'],
          },
        ],
      },
      {
        segment: 'Industrial and logistics facilities',
        promise: {
          text: 'Crews that finish complex retrofits without a second visit.',
          status: 'supported_inference',
          evidenceRefs: ['ev_119', 'ev_114'],
        },
        proof: [
          {
            text: 'Customers rate the work highly even while complaining about the wait.',
            status: 'supported_inference',
            evidenceRefs: ['ev_119', 'ev_108'],
          },
          {
            text: 'Rework runs at twenty-four events a year, and most of those trace to compressed schedules rather than to skill.',
            status: 'supported_inference',
            evidenceRefs: ['ev_114'],
          },
        ],
      },
      {
        segment: 'Grocery and hospitality',
        promise: {
          text: 'Emergency coverage that actually answers, backed by service technicians who are not fully booked.',
          status: 'supported_inference',
          evidenceRefs: ['ev_104'],
        },
        proof: [
          {
            text: `Service technicians run at ${D.serviceUtilization} per cent utilisation, leaving genuine headroom for unplanned calls.`,
            status: 'fact',
            evidenceRefs: ['ev_104'],
          },
        ],
      },
    ],
  },
  revenueMix: {
    field: 'revenue_streams',
    label: 'Revenue mix (trailing twelve months)',
    items: [
      metric('Installation projects', F.revenueInstallation, 'USD', 'ev_101'),
      metric('Service contracts', F.revenueServiceContracts, 'USD', 'ev_101'),
      metric('Emergency and time-and-materials', F.revenueEmergency, 'USD', 'ev_101'),
      metric('Total revenue', F.revenueTtm, 'USD', 'ev_101'),
      metric('Installation gross margin', F.installGrossMarginTtm, '%', 'ev_113'),
    ],
  },
  capabilities: {
    field: 'key_resources',
    label: 'Capabilities and resources',
    items: [
      {
        name: 'Complex retrofit installation',
        description:
          'Three crews that can replace rooftop and chiller plant in occupied buildings without shutting the tenant down.',
        assessment: {
          text: 'This is the capability customers buy, and it is the scarcest thing the company owns.',
          status: 'supported_inference',
          evidenceRefs: ['ev_103', 'ev_119', 'ev_117'],
        },
        measures: [
          metric('Installation technicians', F.installTechs, 'people', 'ev_103'),
          metric('Installation utilisation', D.installUtilization, '%', 'ev_103'),
          metric('Projects completed', F.projectsCompletedTtm, 'projects', 'ev_102'),
        ],
      },
      {
        name: 'Contracted service coverage',
        description:
          'Twenty-two service technicians on planned maintenance and emergency calls across the region.',
        assessment: {
          text: 'Valuable and well organised, but not rare — three regional contractors offer the same coverage.',
          status: 'assumption',
          evidenceRefs: ['ev_104'],
        },
        measures: [
          metric('Service technicians', F.serviceTechs, 'people', 'ev_104'),
          metric('Service utilisation', D.serviceUtilization, '%', 'ev_104'),
        ],
      },
      {
        name: 'Estimating and bid conversion',
        description: 'One estimator with fifteen years of local pricing history.',
        assessment: {
          text: 'Conversion improved year on year, which is why the queue is growing faster than the crews.',
          status: 'supported_inference',
          evidenceRefs: ['ev_110', 'ev_106'],
        },
        measures: [
          metric('Win rate', D.winRateTtm, '%', 'ev_110'),
          metric('Win rate, prior year', D.winRatePrior, '%', 'ev_110'),
          metric('Proposals issued', F.proposalsQuotedTtm, 'proposals', 'ev_110'),
        ],
      },
      {
        name: 'Single-approver project control',
        description:
          'One installation project manager approves every change order and every schedule change across three crews.',
        assessment: {
          text: 'Presented internally as a strength; it functions as a second queue in front of the first.',
          status: 'supported_inference',
          evidenceRefs: ['ev_116', 'ev_115'],
        },
        measures: [
          metric('Change orders raised', F.changeOrders, 'orders', 'ev_116'),
          metric('Median approval time', F.changeOrderMedianDays, 'days', 'ev_116'),
        ],
      },
    ],
  },
  org: {
    field: 'work_assignments',
    label: 'People and ownership',
    items: [
      {
        role: 'Installation project manager',
        headcount: metric('Headcount', 1, 'people', 'ev_115'),
        owns: 'Scheduling, change orders, customer commitments on installation work',
        note: {
          text: 'Every schedule change and every change order routes through this one role.',
          status: 'fact',
          evidenceRefs: ['ev_115', 'ev_116'],
        },
      },
      {
        role: 'Installation technicians',
        headcount: metric('Headcount', F.installTechs, 'people', 'ev_103'),
        owns: 'Retrofit and replacement delivery across three crews',
        note: {
          text: `Three roles remain open, the oldest for ${F.longestVacancyDays} days, against an average time to hire of ${F.averageTimeToHireDays} days.`,
          status: 'fact',
          evidenceRefs: ['ev_117'],
        },
      },
      {
        role: 'Service manager and technicians',
        headcount: metric('Headcount', F.serviceTechs + 1, 'people', 'ev_115'),
        owns: 'Maintenance contracts, emergency response, complaint intake',
        note: {
          text: 'The service organisation has slack and is measured on a different clock from installation.',
          status: 'supported_inference',
          evidenceRefs: ['ev_104', 'ev_118'],
        },
      },
      {
        role: 'Estimator',
        headcount: metric('Headcount', 1, 'people', 'ev_115'),
        owns: 'Proposals, pricing, recorded loss reasons',
        note: {
          text: 'Compensated on proposals won, with no line of sight to the installation schedule.',
          status: 'assumption',
          evidenceRefs: ['ev_110', 'ev_111'],
        },
      },
      {
        role: 'Controller and office coordinators',
        headcount: metric('Headcount', 3, 'people', 'ev_115'),
        owns: 'Billing, collections, purchasing, dispatch administration',
        note: {
          text: `Days sales outstanding sits at ${F.dsoDays}, with customer deposits on unstarted projects the largest current liability.`,
          status: 'fact',
          evidenceRefs: ['ev_120'],
        },
      },
    ],
  },
  systems: {
    field: 'key_activities',
    label: 'Systems of record',
    items: [
      {
        name: 'Dispatch board',
        supports: 'Scheduling crews against signed projects',
        note: {
          text: `The board holds ${F.queueProjects} signed projects worth ${F.queueValue / 1_000_000} million dollars, waiting a median of ${F.queueMedianWaitDays} days for a crew.`,
          status: 'fact',
          evidenceRefs: ['ev_105'],
        },
      },
      {
        name: 'Time and attendance',
        supports: 'Booking technician hours to projects and service calls',
        note: {
          text: 'Hours are booked by pool, which is what makes the installation and service split visible at all.',
          status: 'fact',
          evidenceRefs: ['ev_103', 'ev_104'],
        },
      },
      {
        name: 'Estimating log',
        supports: 'Proposals, win rates and recorded loss reasons',
        note: {
          text: 'Loss reasons are recorded inconsistently, which limits how far the demand read can be pushed.',
          status: 'supported_inference',
          evidenceRefs: ['ev_111'],
        },
      },
      {
        name: 'Service desk complaint log',
        supports: 'Complaint intake and theme coding',
        note: {
          text: `Scheduling and delay is now the largest complaint theme at ${F.complaintsSchedule} of ${F.complaintsTotal}.`,
          status: 'fact',
          evidenceRefs: ['ev_108'],
        },
      },
      {
        name: 'Change-order log',
        supports: 'Approval of scope and schedule changes',
        note: {
          text: 'Crews stood down on four projects while a change order waited for approval.',
          status: 'fact',
          evidenceRefs: ['ev_116'],
        },
      },
    ],
  },
  operating: {
    field: 'performance_metrics',
    label: 'Operating measures',
    items: [
      metric('Installation utilisation', D.installUtilization, '%', 'ev_103'),
      metric('Service utilisation', D.serviceUtilization, '%', 'ev_104'),
      metric('Field utilisation, both pools', D.fieldUtilization, '%', 'ev_104'),
      metric('Signed projects awaiting a crew', F.queueProjects, 'projects', 'ev_105'),
      metric('Median wait, signature to start', F.queueMedianWaitDays, 'days', 'ev_105'),
      metric('Projects sold, not completed', D.backlogGrowthProjects, 'projects', 'ev_106'),
      metric('Proposal win rate', D.winRateTtm, '%', 'ev_110'),
      metric('Top-five customer concentration', D.topFiveShare, '%', 'ev_107'),
      metric('Overtime booked to installation', F.overtimeHours, 'hours', 'ev_112'),
      metric('Rework cost', F.reworkCost, 'USD', 'ev_114'),
      metric('Equipment lead time', F.equipmentLeadWeeks, 'weeks', 'ev_109'),
      metric('Average time to hire', F.averageTimeToHireDays, 'days', 'ev_117'),
      metric('Days sales outstanding', F.dsoDays, 'days', 'ev_120'),
    ],
  },
  fieldsPopulated: [
    'company_profile',
    'customer_segments',
    'value_propositions',
    'revenue_streams',
    'key_resources',
    'key_activities',
    'key_partners',
    'cost_structure',
    'financials',
    'performance_metrics',
    'pipeline',
    'customer_concentration',
    'competitors',
    'capacity_utilization',
    'delivery_backlog',
    'flow_stages',
    'work_assignments',
    'current_constraint',
    'assumptions',
    'open_questions',
  ],
};
