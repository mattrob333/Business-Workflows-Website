/**
 * The honesty engine, as page furniture.
 *
 * 00-LAW Ruling 4 in one component: nothing on a framework page states a number without
 * saying what kind of statement it is and where the figure came from. `ClaimLine` renders
 * a `Claim` from a company's authored pack with its `StatusChip` and its evidence chips;
 * `MetricLine` does the same for a `Metric`, which cannot exist without a reference.
 *
 * The `data-claim` attribute is not decoration either — the S3 walk sweeps the explore
 * section for text containing a digit and fails if it sits outside one of these blocks.
 * That is the crude-but-effective enforcement 02-architecture asks for, applied to the
 * one section where a page is most tempted to make a number up.
 *
 * These are server components. `EvidenceRef` is the only client thing under here, and it
 * takes a plain object, so a framework page ships one interactive island per chip and no
 * page-level JavaScript to render its evidence.
 */

import type { ReactNode } from 'react';
import { EvidenceRef, MONO_LABEL, StatusChip } from '@/components';
import type { Company } from '@/content/companies';
import type { Claim, EvidenceId, Metric } from '@/lib/claim';
import { chipStatus, evidenceSource, metricText } from './evidence';

export interface EvidenceChipsProps {
  company: Company;
  refs: readonly EvidenceId[];
  className?: string;
}

export function EvidenceChips({ company, refs, className = '' }: EvidenceChipsProps) {
  if (refs.length === 0) return null;
  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      {refs.map((ref) => (
        <EvidenceRef key={ref} evidence={evidenceSource(company, ref)} />
      ))}
    </span>
  );
}

export interface ClaimLineProps {
  claim: Claim;
  company: Company;
  /** Rendered before the claim text — a stage name, a candidate, a block label. */
  label?: string;
  /** Struck through, for a candidate the evidence has just eliminated. */
  rejected?: boolean;
  className?: string;
}

/** One claim: what is being said, how sure it is, and what it rests on. */
export function ClaimLine({
  claim,
  company,
  label,
  rejected = false,
  className = '',
}: ClaimLineProps) {
  return (
    <div
      data-claim="true"
      data-status={claim.status}
      className={`rounded-md border p-3 ${className}`}
      style={{
        borderColor: 'var(--line)',
        background: 'color-mix(in srgb, var(--surface) 55%, transparent)',
      }}
    >
      {label ? (
        <div className={`${MONO_LABEL} mb-2 text-[10px]`} style={{ color: 'var(--faint)' }}>
          {label}
        </div>
      ) : null}
      <p
        className="text-[14px] leading-[1.6]"
        style={{
          color: rejected ? 'var(--faint)' : 'var(--muted)',
          textDecoration: rejected ? 'line-through' : undefined,
        }}
      >
        {claim.text}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusChip status={chipStatus(claim.status)} />
        <EvidenceChips company={company} refs={claim.evidenceRefs} />
      </div>
    </div>
  );
}

export interface ClaimListProps {
  claims: readonly Claim[];
  company: Company;
  className?: string;
}

export function ClaimList({ claims, company, className = '' }: ClaimListProps) {
  return (
    <div className={`grid gap-3 ${className}`}>
      {claims.map((claim) => (
        <ClaimLine key={claim.text} claim={claim} company={company} />
      ))}
    </div>
  );
}

export interface MetricLineProps {
  metric: Metric;
  company: Company;
  /** Overrides the metric's own label. */
  label?: string;
  /** Why this figure is here, in one clause. */
  note?: ReactNode;
  className?: string;
}

/** A displayed figure, its label, and the object it came from. */
export function MetricLine({ metric, company, label, note, className = '' }: MetricLineProps) {
  return (
    <div
      data-claim="true"
      data-metric={metric.label}
      className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md border px-3 py-2 ${className}`}
      style={{
        borderColor: 'var(--line)',
        background: 'color-mix(in srgb, var(--surface) 55%, transparent)',
      }}
    >
      <span className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
        {label ?? metric.label}
      </span>
      <span className="font-system text-[15px] tabular-nums" style={{ color: 'var(--ink)' }}>
        {metricText(metric)}
      </span>
      {note ? (
        <span className="text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
          {note}
        </span>
      ) : null}
      <span className="ml-auto">
        <EvidenceChips company={company} refs={[metric.evidenceRef]} />
      </span>
    </div>
  );
}
