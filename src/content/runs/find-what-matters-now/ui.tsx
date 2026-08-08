/**
 * Small shared pieces for the run's authored analysis panels.
 *
 * These exist so that twelve step modules produce one voice rather than twelve, and so that
 * the rule the walk enforces — *every figure inside a block that names its source* — has one
 * obvious way to be obeyed. Anything with a digit in it goes through `ClaimLine`, `MetricLine`
 * or `Sourced`; anything without one is prose, and prose is `Aside`.
 *
 * Server components throughout. The only client thing under here is the evidence chip, which
 * takes a plain object, so a step ships one small island per citation and no page-level
 * JavaScript to render its evidence.
 */

import type { ReactNode } from 'react';
import { MONO_LABEL } from '@/components';
import { ClaimLine, EvidenceChips, MetricLine } from '@/components/framework-page';
import type { Claim, EvidenceId, Metric } from '@/lib/claim';
import { company } from './pack';

/** A claim from the pack, or authored here, with its status and its sources. */
export function Says({ claim, label }: { claim: Claim; label?: string }) {
  return <ClaimLine claim={claim} company={company} {...(label ? { label } : {})} />;
}

/** A figure, its label, and the object it came from. Never a bare number. */
export function Figure({ metric, label, note }: { metric: Metric; label?: string; note?: ReactNode }) {
  return (
    <MetricLine
      metric={metric}
      company={company}
      {...(label ? { label } : {})}
      {...(note !== undefined ? { note } : {})}
    />
  );
}

/** Evidence chips on their own — used under a diagram to say what it was built from. */
export function Sourced({ refs, label }: { refs: readonly EvidenceId[]; label: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
        {label}
      </span>
      <EvidenceChips company={company} refs={refs} />
    </div>
  );
}

/** Teaching-voice prose. Digit-free by contract — a number here belongs in a claim. */
export function Aside({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[68ch] text-[15px] leading-[1.7]" style={{ color: 'var(--muted)' }}>
      {children}
    </p>
  );
}

/** Two-up grid of claim blocks. */
export function Pair({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

/** A titled block inside an analysis panel. */
export function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-3">
      <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--flow)' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

/** The one authored quotable line per step, set in the narrative voice. */
export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <p
      data-pullquote="true"
      className="font-narrative max-w-[34ch] border-l-2 pl-5 text-[clamp(19px,2.4vw,26px)] leading-snug italic"
      style={{ color: 'var(--ink)', borderColor: 'var(--line-strong)' }}
    >
      {children}
    </p>
  );
}
