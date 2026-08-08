/**
 * Beacon Mechanical — the evidence pack.
 *
 * Fictional. Every number that appears anywhere in Beacon's profile, story, framework
 * examples or the flagship run originates here (00-LAW Ruling 4). The figures are declared
 * once in `BEACON_FIGURES`; excerpts interpolate them, so the sourced number and the
 * displayed number cannot drift apart.
 *
 * The pack is authored to support one honest diagnosis: the business is limited by
 * installation capacity, not by demand. An analyst reading only these twenty objects should
 * reach that conclusion — and should be able to reject the plausible alternatives.
 */

import type { Evidence } from '@/lib/claim';
import { num, pct, ratio, ratioPct, usd } from '@/lib/format';

export const BEACON_FIGURES = {
  // Money
  revenueTtm: 18_400_000,
  revenuePrior: 15_100_000,
  revenueInstallation: 11_800_000,
  revenueServiceContracts: 4_600_000,
  revenueEmergency: 2_000_000,
  installGrossMarginTtm: 22.1,
  installGrossMarginPrior: 27.4,
  dsoDays: 54,

  // Throughput
  projectsCompletedTtm: 47,
  projectsCompletedPrior: 46,
  projectsSoldTtm: 61,

  // The queue
  queueProjects: 31,
  queueProjectsPrior: 17,
  queueValue: 6_900_000,
  queueMedianWaitDays: 68,
  queueMedianWaitDaysPrior: 24,

  // Capacity
  installTechs: 12,
  installAvailableHours: 22_800,
  installBillableHours: 21_204,
  serviceTechs: 22,
  serviceAvailableHours: 41_800,
  serviceBillableHours: 30_514,
  overtimeHours: 3_180,

  // Demand
  proposalsQuotedTtm: 118,
  proposalsWonTtm: 61,
  proposalsQuotedPrior: 96,
  proposalsWonPrior: 46,
  proposalsLostTtm: 57,
  lossesCitingStartDate: 9,

  // Customers
  topFiveRevenue: 7_900_000,
  largestCustomerRevenue: 2_400_000,
  segmentPropertyRevenue: 7_000_000,
  segmentIndustrialRevenue: 4_400_000,
  segmentPublicRevenue: 4_000_000,
  segmentHospitalityRevenue: 3_000_000,

  // Quality
  complaintsTotal: 128,
  complaintsSchedule: 71,
  complaintsRework: 24,
  complaintsCommunication: 18,
  complaintsBilling: 15,
  reworkEvents: 24,
  reworkCost: 214_000,

  // Decisions and people
  changeOrders: 41,
  changeOrderMedianDays: 6.2,
  openInstallRoles: 3,
  longestVacancyDays: 214,
  averageTimeToHireDays: 94,
  installDepartures: 2,

  // Supply
  distributorShareOfSpend: 78,
  equipmentLeadWeeks: 8,
  equipmentLeadWeeksPrior: 4,
} as const;

const F = BEACON_FIGURES;

/** Derived once, used everywhere. Each is arithmetic over the figures above. */
export const BEACON_DERIVED = {
  installUtilization: ratio(F.installBillableHours, F.installAvailableHours),
  serviceUtilization: ratio(F.serviceBillableHours, F.serviceAvailableHours),
  fieldUtilization: ratio(
    F.installBillableHours + F.serviceBillableHours,
    F.installAvailableHours + F.serviceAvailableHours,
  ),
  topFiveShare: ratio(F.topFiveRevenue, F.revenueTtm),
  largestCustomerShare: ratio(F.largestCustomerRevenue, F.revenueTtm),
  winRateTtm: ratio(F.proposalsWonTtm, F.proposalsQuotedTtm),
  winRatePrior: ratio(F.proposalsWonPrior, F.proposalsQuotedPrior),
  revenueGrowth: ratio(F.revenueTtm - F.revenuePrior, F.revenuePrior),
  backlogGrowthProjects: F.projectsSoldTtm - F.projectsCompletedTtm,
  queueGrowthProjects: F.queueProjects - F.queueProjectsPrior,
  overtimeShareOfBillable: ratio(F.overtimeHours, F.installBillableHours),
  segmentPropertyShare: ratio(F.segmentPropertyRevenue, F.revenueTtm),
  segmentIndustrialShare: ratio(F.segmentIndustrialRevenue, F.revenueTtm),
  segmentPublicShare: ratio(F.segmentPublicRevenue, F.revenueTtm),
  segmentHospitalityShare: ratio(F.segmentHospitalityRevenue, F.revenueTtm),
} as const;

const D = BEACON_DERIVED;

export const BEACON_EVIDENCE: readonly Evidence[] = [
  {
    id: 'ev_101',
    source: 'Accounting system — trailing-twelve-month income statement export',
    author: 'Controller',
    date: '2026-07-06',
    type: 'financial_record',
    excerpt: `Revenue ${usd(F.revenueTtm)} trailing twelve months against ${usd(
      F.revenuePrior,
    )} in the prior twelve — up ${pct(D.revenueGrowth)}. Lines: installation ${usd(
      F.revenueInstallation,
    )}, service contracts ${usd(F.revenueServiceContracts)}, emergency and time-and-materials ${usd(
      F.revenueEmergency,
    )}.`,
    reliability: 'high',
  },
  {
    id: 'ev_102',
    source: 'Project ledger — completed installation projects by fiscal year',
    author: 'Operations coordinator',
    date: '2026-07-02',
    type: 'operational_data',
    excerpt: `${F.projectsCompletedTtm} installation projects reached final sign-off in the trailing twelve months, against ${F.projectsCompletedPrior} the year before. Average contract value rose; count did not.`,
    reliability: 'high',
  },
  {
    id: 'ev_103',
    source: 'Time-and-attendance export — installation crews',
    author: 'Payroll administrator',
    date: '2026-07-05',
    type: 'operational_data',
    excerpt: `${F.installTechs} installation technicians. Scheduled availability ${num(
      F.installAvailableHours,
    )} hours; hours booked to installation projects ${num(F.installBillableHours)} — ${pct(
      D.installUtilization,
    )} utilisation. Crews have not fallen below ninety per cent in eight consecutive months.`,
    reliability: 'high',
  },
  {
    id: 'ev_104',
    source: 'Time-and-attendance export — service technicians',
    author: 'Payroll administrator',
    date: '2026-07-05',
    type: 'operational_data',
    excerpt: `${F.serviceTechs} service technicians. Scheduled availability ${num(
      F.serviceAvailableHours,
    )} hours; hours booked to service calls ${num(F.serviceBillableHours)} — ${pct(
      D.serviceUtilization,
    )} utilisation. Field-wide the two pools run at ${pct(D.fieldUtilization)}.`,
    reliability: 'high',
  },
  {
    id: 'ev_105',
    source: 'Dispatch board — signed projects awaiting a crew, snapshot',
    author: 'Installation project manager',
    date: '2026-07-31',
    type: 'operational_data',
    excerpt: `${F.queueProjects} signed installation projects are waiting to be scheduled, worth ${usd(
      F.queueValue,
    )}. Median wait from signature to crew start is ${F.queueMedianWaitDays} days. The same snapshot a year ago showed ${F.queueProjectsPrior} projects and ${F.queueMedianWaitDaysPrior} days.`,
    reliability: 'high',
  },
  {
    id: 'ev_106',
    source: 'Project ledger — contracts signed versus projects completed',
    author: 'Operations coordinator',
    date: '2026-07-02',
    type: 'operational_data',
    excerpt: `${F.projectsSoldTtm} installation contracts signed in the trailing twelve months; ${F.projectsCompletedTtm} completed. The difference of ${D.backlogGrowthProjects} is the queue growing, and matches the dispatch board moving from ${F.queueProjectsPrior} to ${F.queueProjects} projects.`,
    reliability: 'high',
  },
  {
    id: 'ev_107',
    source: 'Accounting system — revenue by customer, trailing twelve months',
    author: 'Controller',
    date: '2026-07-06',
    type: 'financial_record',
    excerpt: `Top five customers account for ${usd(F.topFiveRevenue)} of ${usd(
      F.revenueTtm,
    )} — ${pct(D.topFiveShare)} of revenue. The largest single account is ${usd(
      F.largestCustomerRevenue,
    )}, or ${pct(D.largestCustomerShare)}. Coded by segment: property management ${usd(
      F.segmentPropertyRevenue,
    )}, industrial and logistics ${usd(F.segmentIndustrialRevenue)}, public sector and schools ${usd(
      F.segmentPublicRevenue,
    )}, grocery and hospitality ${usd(F.segmentHospitalityRevenue)}.`,
    reliability: 'high',
  },
  {
    id: 'ev_108',
    source: 'Service desk — complaint log, coded by theme',
    author: 'Service manager',
    date: '2026-07-12',
    type: 'analytics',
    excerpt: `${F.complaintsTotal} complaints logged in the trailing twelve months: ${F.complaintsSchedule} scheduling and delay (${ratioPct(
      F.complaintsSchedule,
      F.complaintsTotal,
    )}), ${F.complaintsRework} rework, ${F.complaintsCommunication} communication, ${F.complaintsBilling} billing. Scheduling complaints were the smallest theme two years ago.`,
    reliability: 'medium',
  },
  {
    id: 'ev_109',
    source: 'Supply agreement — primary equipment distributor, renewal packet',
    date: '2026-04-18',
    type: 'contract',
    excerpt: `Primary distributor supplies ${pct(
      F.distributorShareOfSpend,
      0,
    )} of equipment spend on net-thirty terms. Quoted lead time for packaged rooftop units is ${F.equipmentLeadWeeks} weeks, against ${F.equipmentLeadWeeksPrior} weeks at the prior renewal.`,
    reliability: 'high',
  },
  {
    id: 'ev_110',
    source: 'Estimating log — proposals issued and won',
    author: 'Estimator',
    date: '2026-07-09',
    type: 'operational_data',
    excerpt: `${F.proposalsQuotedTtm} installation proposals issued, ${F.proposalsWonTtm} won — a ${pct(
      D.winRateTtm,
    )} win rate, against ${pct(D.winRatePrior)} the prior year (${F.proposalsWonPrior} of ${
      F.proposalsQuotedPrior
    }). Proposal volume is up and conversion is up.`,
    reliability: 'high',
  },
  {
    id: 'ev_111',
    source: 'Estimating log — reasons recorded on lost proposals',
    author: 'Estimator',
    date: '2026-07-09',
    type: 'document',
    excerpt: `Of ${F.proposalsLostTtm} lost proposals, ${F.lossesCitingStartDate} record the reason as the earliest available start date. Price was recorded on the majority of the rest.`,
    reliability: 'medium',
  },
  {
    id: 'ev_112',
    source: 'Payroll — overtime hours booked to installation projects',
    author: 'Payroll administrator',
    date: '2026-07-05',
    type: 'operational_data',
    excerpt: `${num(
      F.overtimeHours,
    )} overtime hours were booked to installation work, ${pct(
      D.overtimeShareOfBillable,
    )} of installation billable hours. Overtime is now scheduled in advance rather than exceptional.`,
    reliability: 'high',
  },
  {
    id: 'ev_113',
    source: 'Accounting system — gross margin by line',
    author: 'Controller',
    date: '2026-07-06',
    type: 'financial_record',
    excerpt: `Installation gross margin ${pct(
      F.installGrossMarginTtm,
    )} trailing twelve months, against ${pct(
      F.installGrossMarginPrior,
    )} the prior year. Overtime and rework account for most of the movement.`,
    reliability: 'high',
  },
  {
    id: 'ev_114',
    source: 'Warranty and rework register',
    author: 'Service manager',
    date: '2026-07-12',
    type: 'operational_data',
    excerpt: `${F.reworkEvents} rework events on installation work, costing ${usd(
      F.reworkCost,
    )} in labour and materials. Nineteen of them are on projects finished under a compressed schedule.`,
    reliability: 'medium',
  },
  {
    id: 'ev_115',
    source: 'Organisation chart and role descriptions',
    date: '2026-05-22',
    type: 'document',
    excerpt: `Owner; one installation project manager covering all three crews; one service manager over ${F.serviceTechs} technicians; one estimator; one controller; two office coordinators. The installation project manager approves every change order and every schedule change.`,
    reliability: 'high',
  },
  {
    id: 'ev_116',
    source: 'Change-order log — request to approval',
    author: 'Installation project manager',
    date: '2026-07-15',
    type: 'operational_data',
    excerpt: `${F.changeOrders} change orders raised in the trailing twelve months. Median time from request to approval is ${F.changeOrderMedianDays} days; every one routed through a single approver. Crews stood down on four projects while a change order waited.`,
    reliability: 'medium',
  },
  {
    id: 'ev_117',
    source: 'Recruiting log — installation technician requisitions',
    date: '2026-07-20',
    type: 'document',
    excerpt: `${F.openInstallRoles} installation technician roles are open; the oldest has been open ${F.longestVacancyDays} days. Average time to hire across the last six field hires is ${F.averageTimeToHireDays} days. ${F.installDepartures} installation technicians resigned this year, both citing overtime.`,
    reliability: 'high',
  },
  {
    id: 'ev_118',
    source: 'Interview — service manager',
    author: 'Service manager',
    date: '2026-06-11',
    type: 'interview',
    excerpt:
      'We are not short of work. We are short of the two weeks it takes a crew to finish one. I could sell three more jobs by Friday and it would change nothing except how long the customer waits.',
    reliability: 'medium',
  },
  {
    id: 'ev_119',
    source: 'Interview — facilities director, top-five account',
    date: '2026-06-24',
    type: 'interview',
    excerpt:
      'Your people are the best we use. That is why it is frustrating to be told the first available start is nine weeks out. Last quarter I gave a chiller replacement to someone else purely on the date.',
    reliability: 'medium',
  },
  {
    id: 'ev_120',
    source: 'Accounting system — working-capital summary',
    author: 'Controller',
    date: '2026-07-06',
    type: 'financial_record',
    excerpt: `Days sales outstanding ${F.dsoDays}. Deposits on the ${F.queueProjects} unstarted projects are held as customer deposits, not revenue, and are the largest single item in current liabilities.`,
    reliability: 'high',
  },
];
