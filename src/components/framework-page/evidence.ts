/**
 * Adapters between the authored content model and the honesty components.
 *
 * `src/lib/claim` describes evidence the way an analyst does (type, author, reliability
 * grade); `components/EvidenceRef` describes it the way a reader does (kind, date,
 * excerpt, a sentence about how much to trust it). The two were designed in different
 * slices and both are right, so the translation lives in exactly one place rather than
 * being re-improvised on every page.
 *
 * `evidenceSource` resolves through `requireEvidence`, which throws — a framework page
 * that cites a reference the company's pack does not contain fails the static export
 * rather than shipping a chip that opens onto nothing (00-LAW Ruling 4).
 */

import type { EvidenceSource } from '@/components';
import type { ClaimStatus as ChipStatus } from '@/components';
import type { Company } from '@/content/companies';
import {
  requireEvidence,
  type Claim,
  type EvidenceId,
  type EvidenceType,
  type Metric,
  type Reliability,
} from '@/lib/claim';
import { usd } from '@/lib/format';

const KIND: Record<EvidenceType, string> = {
  operational_data: 'operational data',
  financial_record: 'financial record',
  interview: 'interview',
  document: 'document',
  analytics: 'analytics',
  contract: 'contract',
  survey: 'survey',
  observation: 'observation',
  market_research: 'market research',
};

const RELIABILITY: Record<Reliability, string> = {
  high: 'High reliability — a primary system export or signed record.',
  medium: 'Medium reliability — coded, sampled or single-informant.',
  low: 'Low reliability — treat as directional only.',
};

/** Resolve an `ev_1nn` reference against a company's pack, shaped for `EvidenceRef`. */
export function evidenceSource(company: Company, ref: EvidenceId): EvidenceSource {
  const evidence = requireEvidence(company, ref);
  return {
    id: evidence.id,
    source: evidence.source,
    date: evidence.date,
    excerpt: evidence.excerpt,
    kind: KIND[evidence.type],
    reliability: evidence.author
      ? `${RELIABILITY[evidence.reliability]} Recorded by the ${evidence.author.toLowerCase()}.`
      : RELIABILITY[evidence.reliability],
  };
}

/**
 * The five lifecycle states are spelled with underscores in the data model and hyphens in
 * the chip. Same ladder, two conventions, one crossing point.
 */
export function chipStatus(status: Claim['status']): ChipStatus {
  switch (status) {
    case 'supported_inference':
      return 'supported-inference';
    case 'fact':
      return 'fact';
    case 'assumption':
      return 'assumption';
    case 'hypothesis':
      return 'hypothesis';
    case 'recommendation':
      return 'recommendation';
  }
}

/** A metric printed the way its unit wants to be read. Never a bare number. */
export function metricText(metric: Metric): string {
  if (metric.unit === 'USD' && typeof metric.value === 'number') return usd(metric.value);
  if (metric.unit === '%') return `${metric.value}%`;
  return `${metric.value} ${metric.unit}`;
}
