import { describe, expect, it } from 'vitest';
import { COMPANIES } from '@/content/companies';
import {
  CLAIM_STATUSES,
  assertClaimsResolve,
  checkClaimsResolve,
  collectClaims,
  collectMetrics,
  isMetric,
  requireEvidence,
  resolveEvidence,
} from './claim';

describe('the honesty engine', () => {
  it('names the five lifecycle states, in the product grammar', () => {
    expect([...CLAIM_STATUSES]).toEqual([
      'fact',
      'supported_inference',
      'assumption',
      'hypothesis',
      'recommendation',
    ]);
  });

  it('resolves every claim and metric in all three companies', () => {
    for (const company of COMPANIES) {
      const report = assertClaimsResolve(company);
      expect(report.ok).toBe(true);
      expect(report.claims).toBeGreaterThan(10);
      expect(report.metrics).toBeGreaterThan(10);
    }
  });

  it('resolves an evidence reference to its object', () => {
    const beacon = COMPANIES[0]!;
    const evidence = requireEvidence(beacon, 'ev_103');
    expect(evidence.type).toBe('operational_data');
    expect(evidence.excerpt).toContain('utilisation');
    expect(resolveEvidence(beacon, 'ev_999')).toBeUndefined();
    expect(() => requireEvidence(beacon, 'ev_999')).toThrow(/does not resolve/);
  });

  it('fails a metric whose evidence does not resolve — Ruling 4, enforced', () => {
    const beacon = COMPANIES[0]!;
    const forged = {
      ...beacon,
      profile: {
        ...beacon.profile,
        operating: {
          ...beacon.profile.operating,
          items: [
            ...beacon.profile.operating.items,
            { label: 'Made-up throughput', value: 99, unit: '%', evidenceRef: 'ev_nope' },
          ],
        },
      },
    };
    const report = checkClaimsResolve(forged);
    expect(report.ok).toBe(false);
    expect(report.errors.join()).toContain('Made-up throughput');
    expect(() => assertClaimsResolve(forged)).toThrow(/Unresolved evidence/);
  });

  it('fails a claim that cites nothing and is not a recommendation', () => {
    const beacon = COMPANIES[0]!;
    const forged = {
      ...beacon,
      story: {
        ...beacon.story,
        constraint: {
          ...beacon.story.constraint,
          beats: [
            ...beacon.story.constraint.beats,
            { text: 'Everyone knows the crews are the problem.', status: 'fact' as const, evidenceRefs: [] },
          ],
        },
      },
    };
    expect(checkClaimsResolve(forged).ok).toBe(false);
  });

  it('walks nested authored structures to find claims and metrics', () => {
    const nested = { a: [{ b: { c: { label: 'x', value: 1, unit: '%', evidenceRef: 'ev_1' } } }] };
    expect(collectMetrics(nested)).toHaveLength(1);
    expect(collectClaims(nested)).toHaveLength(0);
    expect(isMetric({ label: 'x', value: 1, unit: '%' })).toBe(false);
  });
});
