'use client';

/**
 * Section 7 — share (03-content-spec: *"v1: copy-link"*; og-images land with S6).
 *
 * Three tiers, because the clipboard is the least reliable API on the web and this is a
 * statically exported page that may well be opened from an insecure origin or an in-app
 * browser:
 *
 *   1. `navigator.clipboard.writeText` — the modern path, requires a secure context.
 *   2. `document.execCommand('copy')` over a selected input — deprecated, still the only
 *      thing that works in a few embedded webviews.
 *   3. The URL, printed in a focused, selected, read-only field with an instruction.
 *      A copy button that silently fails is worse than one that hands you the text.
 *
 * The result is announced through `aria-live`, and the field is real markup rather than an
 * off-screen textarea, so a keyboard user reaches the same three tiers in the same order.
 */

import { useEffect, useRef, useState } from 'react';
import { FOCUS_RING, MONO_LABEL } from '@/components';

type CopyState = 'idle' | 'copied' | 'manual';

export interface ShareRowProps {
  /** What is being shared, for the announcement. */
  label: string;
  className?: string;
}

export function ShareRow({ label, className = '' }: ShareRowProps) {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<CopyState>('idle');
  const fieldRef = useRef<HTMLInputElement>(null);

  /** Read after mount: the export has no request URL, and query state belongs on the link. */
  useEffect(() => {
    setUrl(`${window.location.origin}${window.location.pathname}`);
  }, []);

  const copy = async () => {
    const href = url || window.location.href;
    try {
      if (window.isSecureContext && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(href);
        setState('copied');
        return;
      }
    } catch {
      /* fall through to the legacy path */
    }
    const field = fieldRef.current;
    if (field) {
      field.removeAttribute('readonly');
      field.select();
      field.setSelectionRange(0, href.length);
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      field.setAttribute('readonly', 'true');
      setState(ok ? 'copied' : 'manual');
      return;
    }
    setState('manual');
  };

  const message =
    state === 'copied'
      ? 'Link copied.'
      : state === 'manual'
        ? 'This browser will not let a page write to your clipboard — the link is selected above, copy it by hand.'
        : null;

  return (
    <div data-testid="share-row" data-copy-state={state} className={`grid gap-3 ${className}`}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="share-url" className="sr-only">
          Link to this page
        </label>
        <input
          id="share-url"
          ref={fieldRef}
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className={`${FOCUS_RING} flex-1 rounded-md border px-3 py-[10px] font-system text-[13px]`}
          style={{
            borderColor: 'var(--line-strong)',
            background: 'color-mix(in srgb, var(--void) 70%, transparent)',
            color: 'var(--muted)',
          }}
        />
        <button
          type="button"
          onClick={copy}
          className={`${MONO_LABEL} ${FOCUS_RING} rounded-md border px-5 py-[10px] text-[11px] transition-colors`}
          style={{
            color: 'var(--ink)',
            borderColor: 'color-mix(in srgb, var(--flow) 55%, transparent)',
            background: 'color-mix(in srgb, var(--flow-deep) 22%, transparent)',
          }}
        >
          {state === 'copied' ? 'copied' : `copy link`}
        </button>
      </div>
      <p aria-live="polite" className="min-h-[1rem] text-[12px]" style={{ color: state === 'copied' ? 'var(--evidence)' : 'var(--faint)' }}>
        {message ?? `Share ${label} — the page carries its own state in the URL.`}
      </p>
    </div>
  );
}

export default ShareRow;
