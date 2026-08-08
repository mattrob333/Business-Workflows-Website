import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EVIDENCE_TYPES, assertClaimsResolve, collectMetrics } from '@/lib/claim';
import { FRAMEWORKS, STATE_FIELD_IDS, byId } from '@/registry';
import { COMPANIES, companyById } from './index';
import { BEACON_DERIVED, BEACON_FIGURES } from './beacon-mechanical';
import { RELAYDESK_DERIVED, RELAYDESK_FIGURES } from './relaydesk';
import { LANTERN_DERIVED, LANTERN_FIGURES } from './lantern-ai';
import { ratio, round } from '@/lib/format';

describe('the three example companies', () => {
  it('ships exactly the three v1 companies', () => {
    expect(COMPANIES.map((c) => c.id)).toEqual(['beacon-mechanical', 'relaydesk', 'lantern-ai']);
  });

  it('carries an evidence pack of twelve to twenty objects each', () => {
    for (const company of COMPANIES) {
      expect(company.evidence.length, company.id).toBeGreaterThanOrEqual(12);
      expect(company.evidence.length, company.id).toBeLessThanOrEqual(20);
    }
    expect(companyById('beacon-mechanical').evidence).toHaveLength(20);
  });

  it('gives every evidence object a source, an ISO date, a type, an excerpt and a reliability', () => {
    for (const company of COMPANIES) {
      for (const evidence of company.evidence) {
        const where = `${company.id}/${evidence.id}`;
        expect(evidence.id, where).toMatch(/^ev_\d{3}$/);
        expect(evidence.source.length, where).toBeGreaterThan(10);
        expect(evidence.date, where).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Number.isNaN(Date.parse(evidence.date)), where).toBe(false);
        expect(EVIDENCE_TYPES, where).toContain(evidence.type);
        expect(evidence.excerpt.length, where).toBeGreaterThan(40);
        expect(['high', 'medium', 'low'], where).toContain(evidence.reliability);
      }
      expect(new Set(company.evidence.map((e) => e.id)).size).toBe(company.evidence.length);
    }
  });

  it('resolves every claim and every metric to its pack', () => {
    for (const company of COMPANIES) expect(assertClaimsResolve(company).ok).toBe(true);
  });

  it('populates only real state fields, and binds each profile section to one', () => {
    const known = new Set<string>(STATE_FIELD_IDS);
    for (const company of COMPANIES) {
      for (const field of company.profile.fieldsPopulated) {
        expect(known.has(field), `${company.id}: ${field}`).toBe(true);
      }
      const sections = [
        company.profile.segments,
        company.profile.valuePropositions,
        company.profile.revenueMix,
        company.profile.capabilities,
        company.profile.org,
        company.profile.systems,
        company.profile.operating,
      ];
      for (const section of sections) {
        expect(known.has(section.field), `${company.id}: ${section.field}`).toBe(true);
        expect(section.items.length).toBeGreaterThan(0);
      }
    }
  });

  it('only demonstrates frameworks that bind it as an example', () => {
    for (const company of COMPANIES) {
      for (const demo of company.story.demonstrates) {
        const framework = byId(demo.framework);
        expect(
          framework.example.map((e) => e.company),
          `${framework.id} should bind ${company.id}`,
        ).toContain(company.id);
        expect(demo.beat.length).toBeGreaterThan(30);
      }
    }
  });

  it('binds every framework example to a company that exists', () => {
    const ids = new Set(COMPANIES.map((c) => c.id));
    for (const framework of FRAMEWORKS) {
      for (const binding of framework.example) {
        expect(ids.has(binding.company as never), `${framework.id}: ${binding.company}`).toBe(true);
      }
    }
  });
});

describe('Beacon Mechanical — internal consistency', () => {
  const F = BEACON_FIGURES;
  const D = BEACON_DERIVED;

  it('derives utilisation from the hours data', () => {
    expect(D.installUtilization).toBe(round(ratio(F.installBillableHours, F.installAvailableHours)));
    expect(D.installUtilization).toBe(93);
    expect(D.serviceUtilization).toBe(73);
    expect(D.fieldUtilization).toBe(
      ratio(
        F.installBillableHours + F.serviceBillableHours,
        F.installAvailableHours + F.serviceAvailableHours,
      ),
    );
    expect(D.fieldUtilization).toBe(80.1);
  });

  it('keeps hours inside available capacity', () => {
    expect(F.installBillableHours).toBeLessThan(F.installAvailableHours);
    expect(F.serviceBillableHours).toBeLessThan(F.serviceAvailableHours);
    expect(F.installAvailableHours / F.installTechs).toBe(F.serviceAvailableHours / F.serviceTechs);
  });

  it('reconciles revenue by line and by segment with total revenue', () => {
    expect(F.revenueInstallation + F.revenueServiceContracts + F.revenueEmergency).toBe(
      F.revenueTtm,
    );
    expect(
      F.segmentPropertyRevenue +
        F.segmentIndustrialRevenue +
        F.segmentPublicRevenue +
        F.segmentHospitalityRevenue,
    ).toBe(F.revenueTtm);
    expect(F.topFiveRevenue).toBeLessThan(F.revenueTtm);
    expect(F.largestCustomerRevenue).toBeLessThan(F.topFiveRevenue);
    expect(D.topFiveShare).toBe(42.9);
  });

  it('makes the queue arithmetic add up: sold minus completed equals queue growth', () => {
    expect(D.backlogGrowthProjects).toBe(F.projectsSoldTtm - F.projectsCompletedTtm);
    expect(D.backlogGrowthProjects).toBe(F.queueProjects - F.queueProjectsPrior);
    expect(F.queueMedianWaitDays).toBeGreaterThan(F.queueMedianWaitDaysPrior);
  });

  it('ties proposals to signed projects and to recorded losses', () => {
    expect(F.proposalsWonTtm).toBe(F.projectsSoldTtm);
    expect(F.proposalsWonTtm + F.proposalsLostTtm).toBe(F.proposalsQuotedTtm);
    expect(F.lossesCitingStartDate).toBeLessThan(F.proposalsLostTtm);
  });

  it('sums the complaint themes to the complaint total', () => {
    expect(
      F.complaintsSchedule + F.complaintsRework + F.complaintsCommunication + F.complaintsBilling,
    ).toBe(F.complaintsTotal);
    expect(F.reworkEvents).toBe(F.complaintsRework);
    expect(F.complaintsSchedule).toBeGreaterThan(F.complaintsTotal / 2);
  });

  it('supports "capacity, not demand" rather than the alternatives', () => {
    // Demand is strengthening, not weakening.
    expect(D.winRateTtm).toBeGreaterThan(D.winRatePrior);
    expect(F.proposalsQuotedTtm).toBeGreaterThan(F.proposalsQuotedPrior);
    // Revenue rose; completions did not.
    expect(D.revenueGrowth).toBeGreaterThan(15);
    expect(F.projectsCompletedTtm - F.projectsCompletedPrior).toBeLessThanOrEqual(1);
    // The constraint is local to installation, not to the field as a whole.
    expect(D.installUtilization - D.serviceUtilization).toBeGreaterThan(15);
    // Running the constrained resource hot costs margin.
    expect(F.installGrossMarginTtm).toBeLessThan(F.installGrossMarginPrior);
    expect(D.overtimeShareOfBillable).toBeGreaterThan(10);
    // Equipment lead time is real but shorter than the wait for a crew.
    expect(F.equipmentLeadWeeks * 7).toBeLessThan(F.queueMedianWaitDays);
    expect(F.equipmentLeadWeeks).toBeGreaterThan(F.equipmentLeadWeeksPrior);
    // Approvals move days where crew capacity moves weeks.
    expect(F.changeOrderMedianDays * 7).toBeLessThan(F.queueMedianWaitDays);
  });

  it('says so in the story, as a supported inference and not as a fact', () => {
    const story = companyById('beacon-mechanical').story;
    expect(story.constraint.headline).toContain('capacity');
    expect(story.constraint.diagnosis.status).toBe('supported_inference');
    expect(story.constraint.diagnosis.evidenceRefs.length).toBeGreaterThanOrEqual(4);
    expect(story.constraint.misreadings.length).toBeGreaterThanOrEqual(4);
  });

  it('sources every displayed number: no metric without evidence', () => {
    const metrics = collectMetrics(companyById('beacon-mechanical'));
    expect(metrics.length).toBeGreaterThan(30);
    for (const metric of metrics) expect(metric.evidenceRef).toMatch(/^ev_1\d{2}$/);
  });
});

describe('RelayDesk — internal consistency', () => {
  const F = RELAYDESK_FIGURES;
  const D = RELAYDESK_DERIVED;

  it('reconciles the ARR bridge', () => {
    expect(D.arrBridgeCheck).toBe(F.arrCurrent);
    expect(D.acvCheck).toBe(F.acvNew);
  });

  it('reconciles the logo count', () => {
    expect(F.customersStart + F.customersAdded - F.customersLost).toBe(F.customersEnd);
    expect(D.grossLogoRetention + D.logoChurn).toBeCloseTo(100, 1);
  });

  it('supports "onboarding, not features"', () => {
    // Acquisition is not the failing stage.
    expect(D.trialConversion).toBeGreaterThan(25);
    // Retention is.
    expect(D.grossRevenueRetention).toBeLessThan(80);
    expect(D.netRevenueRetention).toBeLessThan(100);
    // Activation separates survivors from the rest, and most accounts never activate.
    expect(F.retentionActivatedPct).toBeGreaterThan(F.retentionUnactivatedPct * 2);
    expect(D.activationRate).toBeLessThan(50);
    // Onboarding capacity cannot absorb the accounts sales adds.
    expect(D.onboardingCapacityAccounts).toBeLessThan(F.customersAdded);
    expect(D.onboardingDeficitAccounts).toBeGreaterThan(0);
    // Accounts leave before acquisition is paid back.
    expect(D.cacPaybackMonths).toBeGreaterThan(12);
  });
});

describe('Lantern AI — internal consistency', () => {
  const F = LANTERN_FIGURES;
  const D = LANTERN_DERIVED;

  it('reconciles headcount, pipeline and runway', () => {
    expect(D.headcountCheck).toBe(F.headcount);
    expect(D.totalOpps).toBe(46);
    expect(D.totalPipeline).toBe(12_400_000);
    expect(F.weightedPipeline).toBeLessThan(D.totalPipeline);
    expect(D.runwayMonths).toBe(round(F.cashOnHand / F.monthlyBurn));
    expect(D.averageContractValue).toBe(F.arr / F.customers);
  });

  it('supports "choose the market that fits inside the runway"', () => {
    expect(D.runwayMonths * 30).toBeLessThan(F.cycleDaysHealthcare + F.cycleDaysFinancialServices);
    expect(F.cycleDaysLogistics).toBeLessThan(D.runwayMonths * 30);
    expect(F.certificationMonths).toBeLessThan(D.runwayMonths);
    expect(F.oppsBlockedOnCertification).toBeLessThan(F.oppsFinancialServices);
    expect(F.proofsToProduction).toBeLessThan(F.proofsOfConcept);
  });
});

describe('fictional companies only (Ruling 4, team rule 5)', () => {
  /** Real brands that must never appear in authored content. */
  const BANNED = [
    // HVAC and industrial distribution
    'wesco',
    'trane',
    'lennox',
    'daikin',
    'rheem',
    'goodman mfg',
    'johnson controls',
    'honeywell',
    'ferguson enterprises',
    'grainger',
    'mitsubishi',
    'bosch',
    'siemens',
    // SaaS / helpdesk / shared inbox
    'zendesk',
    'freshdesk',
    'help scout',
    'helpscout',
    'hubspot',
    'salesforce',
    'intercom',
    'atlassian',
    'jira',
    'zoho',
    'asana',
    'trello',
    'gorgias',
    'missive',
    // Enterprise AI
    'openai',
    'anthropic',
    'databricks',
    'snowflake',
    'palantir',
    'servicenow',
    'workday',
    'oracle',
    'sap se',
    'cohere',
    'mistral ai',
  ];

  const ROOTS = ['src/content', 'src/registry', 'src/app/frameworks'];

  function files(dir: string, found: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) files(path, found);
      else if (/\.(ts|tsx|mdx|md)$/.test(entry) && !entry.endsWith('.test.ts')) found.push(path);
    }
    return found;
  }

  it('never names a real company', () => {
    const hits: string[] = [];
    for (const root of ROOTS) {
      for (const path of files(root)) {
        const source = readFileSync(path, 'utf8').toLowerCase();
        for (const banned of BANNED) {
          if (source.includes(banned)) hits.push(`${path}: "${banned}"`);
        }
      }
    }
    expect(hits).toEqual([]);
  });

  it('keeps the company names fictional and stable', () => {
    expect(COMPANIES.map((c) => c.name)).toEqual(['Beacon Mechanical', 'RelayDesk', 'Lantern AI']);
  });
});
