/* amber-law: constraint-surface */

/**
 * The verdict panel on `/frameworks/theory-of-constraints` — **the site's one authored
 * amber surface** (00-LAW Ruling 2, 01-design-system §1, team rule 3).
 *
 * Amber means the binding constraint and nothing else. `fw/toc-flow` already earns it for
 * the stage it computes from capacity, and `ConstraintBadge` carries it wherever a
 * constraint is named. This file is the third and last place the token is spoken in `src/`,
 * and it exists for one reason: after the elimination, the page has to *say* what binds,
 * and a verdict rendered in the same neutral grey as the four rejected candidates would
 * throw away the only moment on the site where the colour grammar pays off.
 *
 * The discipline that makes that safe: the panel takes its constraint from the company's
 * authored story — the diagnosis claim, with its status and its evidence, exactly as the
 * pack states it. It cannot be pointed at anything that is not a diagnosed constraint,
 * because there is nothing else to point it at.
 *
 * If you are adding the pragma to a fourth file, you are almost certainly wrong.
 */

import { ConstraintBadge, MONO_LABEL } from '@/components';
import type { Company } from '@/content/companies';
import type { Claim } from '@/lib/claim';
import { ClaimLine } from './Claims';

export interface ConstraintVerdictProps {
  company: Company;
  /** What binds, in two or three words. Printed on the badge. */
  subject: string;
  /** The headline, from the company's story. */
  headline: string;
  /** The diagnosis, with its status and evidence. */
  diagnosis: Claim;
  /** The caveat that survives the diagnosis — usually "and this does not fix it fast". */
  caveat?: Claim;
}

export function ConstraintVerdict({
  company,
  subject,
  headline,
  diagnosis,
  caveat,
}: ConstraintVerdictProps) {
  return (
    <div
      data-testid="constraint-verdict"
      data-amber-surface="verdict"
      className="rounded-lg border p-5 sm:p-6"
      style={{
        borderColor: 'color-mix(in srgb, var(--constraint) 45%, transparent)',
        background: 'var(--constraint-soft)',
      }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <ConstraintBadge subject={subject} />
        <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
          one stage sets the rate for the whole line
        </span>
      </div>

      <p
        className="font-narrative mt-4 text-[clamp(24px,3vw,34px)] leading-tight"
        style={{ color: 'var(--ink)' }}
      >
        {headline}
      </p>

      <div className="mt-5">
        <ClaimLine claim={diagnosis} company={company} label="the diagnosis" />
      </div>

      {caveat ? (
        <div className="mt-3">
          <ClaimLine claim={caveat} company={company} label="and the caveat" />
        </div>
      ) : null}
    </div>
  );
}

export default ConstraintVerdict;
