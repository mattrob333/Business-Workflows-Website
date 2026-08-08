/**
 * The honesty engine (00-LAW Ruling 4).
 *
 * Not a feature — the constitution. Every displayed claim carries a status; every number
 * displayed anywhere traces to an evidence object in a company's authored pack. That rule
 * is enforced *structurally* here: `Metric` cannot be constructed without an `evidenceRef`,
 * so a figure with no source will not typecheck, let alone render.
 *
 * Rendering happens only through `StatusChip` and `EvidenceRef` (01-design-system §6);
 * this module is the data layer beneath them.
 */

/** The five lifecycle states, in the product's exact grammar. */
export const CLAIM_STATUSES = [
  'fact',
  'supported_inference',
  'assumption',
  'hypothesis',
  'recommendation',
] as const;

export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const CLAIM_STATUS_LABELS: Readonly<Record<ClaimStatus, string>> = {
  fact: 'Fact',
  supported_inference: 'Supported inference',
  assumption: 'Assumption',
  hypothesis: 'Hypothesis',
  recommendation: 'Recommendation',
};

/** What kind of thing the evidence is (appendix §7's evidence-object model). */
export const EVIDENCE_TYPES = [
  'operational_data',
  'financial_record',
  'interview',
  'document',
  'analytics',
  'contract',
  'survey',
  'observation',
  'market_research',
] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export type Reliability = 'high' | 'medium' | 'low';

/** A reference to an evidence object, e.g. `ev_103`. */
export type EvidenceId = string;

export interface Evidence {
  readonly id: EvidenceId;
  /** Where it came from — a system, a document, a person's role. Never a real company. */
  readonly source: string;
  readonly author?: string;
  /** ISO date (YYYY-MM-DD). When the evidence was produced, not when it was read. */
  readonly date: string;
  readonly type: EvidenceType;
  /** The quotable fragment the UI shows in the evidence popover. */
  readonly excerpt: string;
  readonly reliability: Reliability;
}

export interface Claim {
  readonly text: string;
  readonly status: ClaimStatus;
  readonly evidenceRefs: EvidenceId[];
  /** ISO date the claim was made. */
  readonly date?: string;
}

/**
 * A displayed number. Ruling 4 in the type system: no evidenceRef, no Metric, no render.
 */
export interface Metric {
  readonly label: string;
  readonly value: number | string;
  readonly unit: string;
  readonly evidenceRef: EvidenceId;
}

/** Anything carrying an authored evidence pack — a company, in v1. */
export interface EvidenceCarrier {
  readonly id: string;
  readonly evidence: readonly Evidence[];
}

export function resolveEvidence(
  carrier: EvidenceCarrier,
  ref: EvidenceId,
): Evidence | undefined {
  return carrier.evidence.find((e) => e.id === ref);
}

/** Same, but loud: used where a missing source is a build-breaking error. */
export function requireEvidence(carrier: EvidenceCarrier, ref: EvidenceId): Evidence {
  const found = resolveEvidence(carrier, ref);
  if (!found) throw new Error(`${carrier.id}: evidence "${ref}" does not resolve`);
  return found;
}

export function isClaim(value: unknown): value is Claim {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Claim>;
  return (
    typeof candidate.text === 'string' &&
    typeof candidate.status === 'string' &&
    (CLAIM_STATUSES as readonly string[]).includes(candidate.status) &&
    Array.isArray(candidate.evidenceRefs)
  );
}

export function isMetric(value: unknown): value is Metric {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Metric>;
  return (
    typeof candidate.label === 'string' &&
    (typeof candidate.value === 'number' || typeof candidate.value === 'string') &&
    typeof candidate.unit === 'string' &&
    typeof candidate.evidenceRef === 'string'
  );
}

/** Walks an arbitrary authored object graph and collects every claim it contains. */
export function collectClaims(node: unknown, found: Claim[] = []): Claim[] {
  if (Array.isArray(node)) {
    for (const child of node) collectClaims(child, found);
    return found;
  }
  if (typeof node === 'object' && node !== null) {
    if (isClaim(node)) found.push(node);
    else for (const child of Object.values(node)) collectClaims(child, found);
  }
  return found;
}

/** Walks an arbitrary authored object graph and collects every metric it contains. */
export function collectMetrics(node: unknown, found: Metric[] = []): Metric[] {
  if (Array.isArray(node)) {
    for (const child of node) collectMetrics(child, found);
    return found;
  }
  if (typeof node === 'object' && node !== null) {
    if (isMetric(node)) found.push(node);
    else for (const child of Object.values(node)) collectMetrics(child, found);
  }
  return found;
}

export interface ResolutionReport {
  readonly ok: boolean;
  readonly claims: number;
  readonly metrics: number;
  readonly errors: string[];
}

/**
 * Every claim reference and every metric reference in `carrier` resolves to an evidence
 * object in the same pack. Used by the content tests; the same call guards Phase 2 writes.
 */
export function checkClaimsResolve<T extends EvidenceCarrier>(carrier: T): ResolutionReport {
  const errors: string[] = [];
  const ids = new Set(carrier.evidence.map((e) => e.id));

  const seen = new Set<string>();
  for (const e of carrier.evidence) {
    if (seen.has(e.id)) errors.push(`${carrier.id}: duplicate evidence id "${e.id}"`);
    seen.add(e.id);
  }

  const claims = collectClaims(carrier);
  for (const claim of claims) {
    if (claim.evidenceRefs.length === 0 && claim.status !== 'recommendation')
      errors.push(`${carrier.id}: claim "${truncate(claim.text)}" has no evidence and is not a recommendation`);
    for (const ref of claim.evidenceRefs) {
      if (!ids.has(ref)) errors.push(`${carrier.id}: claim "${truncate(claim.text)}" cites missing evidence "${ref}"`);
    }
  }

  const metrics = collectMetrics(carrier);
  for (const metric of metrics) {
    if (!ids.has(metric.evidenceRef))
      errors.push(`${carrier.id}: metric "${metric.label}" cites missing evidence "${metric.evidenceRef}"`);
  }

  return { ok: errors.length === 0, claims: claims.length, metrics: metrics.length, errors };
}

/** Throwing form — the one the tests call. */
export function assertClaimsResolve<T extends EvidenceCarrier>(carrier: T): ResolutionReport {
  const report = checkClaimsResolve(carrier);
  if (!report.ok) throw new Error(`Unresolved evidence:\n  ${report.errors.join('\n  ')}`);
  return report;
}

function truncate(text: string, max = 48): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}
