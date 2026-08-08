'use client';

/**
 * The receiving end of the handoff URL (`handoff.ts` writes it; this reads it).
 *
 * When a visitor arrives from another framework page the link carries `company`, `from` and
 * `carries`. This banner says so — *"arrived from the Business Model Canvas with Beacon
 * Mechanical's state: customer segments, value propositions"* — which is what turns a link
 * into a continuous walk rather than seventeen unrelated pages.
 *
 * **Everything is parsed defensively.** Query strings are user input, they survive being
 * pasted through clients that mangle them, and this is a static export where no server ever
 * validated anything. So: an unknown company, an unknown source framework, a source with no
 * edge into this page, or field names that do not travel that edge — each is dropped, and if
 * nothing survives the component renders nothing. It never throws, and it never repeats a
 * value back to the page unchecked.
 *
 * **The allow-lists are props, not imports.** The obvious implementation reaches into the
 * registry to validate, and that is how a marketing page ends up shipping the whole
 * seventeen-record graph to the browser to render one sentence (the warning in
 * `components/index.ts` is about exactly this). The page already knows which edges arrive
 * here, so it hands over the three or four that matter and this stays a few hundred bytes.
 *
 * It reads `window.location` in an effect rather than through `useSearchParams`,
 * deliberately: on a statically exported route that hook forces the page under a Suspense
 * boundary and returns empty during prerender — a lot of machinery for a line that is meant
 * to be absent on first paint anyway.
 */

import { useEffect, useState } from 'react';
import { MONO_LABEL } from '@/components';

/** One framework that genuinely feeds this page, with the fields that edge carries. */
export interface IncomingSource {
  id: string;
  name: string;
  fields: { id: string; label: string }[];
}

export interface IncomingCompany {
  id: string;
  name: string;
}

interface Parsed {
  fromName: string;
  companyName: string | null;
  labels: string[];
}

function parse(
  search: string,
  sources: readonly IncomingSource[],
  companies: readonly IncomingCompany[],
): Parsed | null {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return null;
  }

  const from = params.get('from');
  if (!from) return null;

  // The source must be a framework that actually hands off to this page. A link claiming a
  // handoff the graph does not contain is dropped in silence rather than repeated back.
  const source = sources.find((s) => s.id === from);
  if (!source) return null;

  const company = params.get('company');
  const companyName = companies.find((c) => c.id === company)?.name ?? null;

  const declared = new Set(
    (params.get('carries') ?? '')
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean),
  );
  const labels = source.fields.filter((f) => declared.has(f.id)).map((f) => f.label);

  return { fromName: source.name, companyName, labels };
}

export interface IncomingStateProps {
  /** Frameworks with a real edge into this page. Anything else on the URL is a lie. */
  sources: IncomingSource[];
  companies: IncomingCompany[];
  className?: string;
}

export function IncomingState({ sources, companies, className = '' }: IncomingStateProps) {
  const [incoming, setIncoming] = useState<Parsed | null>(null);

  useEffect(() => {
    setIncoming(parse(window.location.search, sources, companies));
  }, [sources, companies]);

  if (!incoming) return null;

  return (
    <div
      data-testid="incoming-state"
      data-from={incoming.fromName}
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border px-4 py-3 ${className}`}
      style={{
        borderColor: 'color-mix(in srgb, var(--flow) 35%, transparent)',
        background: 'color-mix(in srgb, var(--flow-deep) 12%, transparent)',
      }}
    >
      <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--flow)' }}>
        carried in
      </span>
      <span className="text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>
        Arrived from <span style={{ color: 'var(--ink)' }}>{incoming.fromName}</span>
        {incoming.companyName ? (
          <>
            {' '}
            with <span style={{ color: 'var(--ink)' }}>{incoming.companyName}</span>&apos;s state
          </>
        ) : null}
        {incoming.labels.length > 0 ? <>: {incoming.labels.join(', ').toLowerCase()}</> : null}.
      </span>
    </div>
  );
}

export default IncomingState;
