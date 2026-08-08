'use client';

/**
 * `WaitlistBar` — 01-design-system §6; the essay's closing CTA made real (Ruling 6).
 *
 * The honesty engine applies to the site's own UI, not only to its content. v1 ships
 * before the waitlist endpoint is decided (04-phases, S6: "form → simple endpoint or
 * provider, decided at ship"), so this component has a **designed disabled state**: with
 * no `action`, it says so in plain language and refuses to pretend it captured anything.
 * A form that silently swallows an address is exactly the kind of small lie Ruling 4
 * exists to prevent.
 *
 * Copy law (Ruling 6): never "buy more framework reports" — always *"You ran the
 * framework once. Instinct keeps it running."*
 */

import { useId, useState, type FormEvent } from 'react';
import { FOCUS_RING, MONO_LABEL } from './styles';

export type WaitlistState = 'idle' | 'sending' | 'done' | 'error' | 'unconfigured';

export interface WaitlistBarProps {
  /**
   * Where the address goes. A string is used as a form `action` (POST); a function is
   * awaited. Omit it and the bar renders its honest disabled state.
   */
  action?: string | ((email: string) => Promise<void>);
  headline?: string;
  caption?: string;
  cta?: string;
  className?: string;
}

export function WaitlistBar({
  action,
  headline = 'You ran the framework once. Instinct keeps it running.',
  caption = 'Join the first wave — your company here, with the frameworks live on it.',
  cta = 'Request access',
  className = '',
}: WaitlistBarProps) {
  const configured = action !== undefined;
  const [state, setState] = useState<WaitlistState>(configured ? 'idle' : 'unconfigured');
  const [email, setEmail] = useState('');
  const fieldId = useId();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    if (typeof action !== 'function') return; // string action = native POST
    e.preventDefault();
    setState('sending');
    try {
      await action(email);
      setState('done');
    } catch {
      setState('error');
    }
  };

  const message =
    state === 'unconfigured'
      ? 'No endpoint configured in this build — nothing is sent, and nothing is stored.'
      : state === 'done'
        ? 'Recorded. You will hear from us before the first wave opens.'
        : state === 'error'
          ? 'That did not go through. Try again in a moment.'
          : null;

  return (
    <div
      data-component="waitlist-bar"
      data-state={state}
      className={`rounded-lg border p-5 sm:p-6 ${className}`}
      style={{
        borderColor: 'var(--line)',
        background: 'color-mix(in srgb, var(--surface) 66%, transparent)',
        backdropFilter: 'blur(14px)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
        powered by instinct
      </div>
      <p
        className="font-narrative mt-2 text-2xl leading-tight sm:text-[28px]"
        style={{ color: 'var(--ink)' }}
      >
        {headline}
      </p>
      <p className="mt-2 max-w-[52ch] text-[14px]" style={{ color: 'var(--muted)' }}>
        {caption}
      </p>

      <form
        className="mt-5 flex flex-col gap-2 sm:flex-row"
        {...(typeof action === 'string' ? { action, method: 'post' } : {})}
        onSubmit={submit}
      >
        <label htmlFor={fieldId} className="sr-only">
          Email address
        </label>
        <input
          id={fieldId}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!configured || state === 'sending' || state === 'done'}
          aria-describedby={message ? `${fieldId}-note` : undefined}
          className={`${FOCUS_RING} flex-1 rounded-md border px-3 py-[10px] text-[14px] disabled:cursor-not-allowed disabled:opacity-60`}
          style={{
            borderColor: 'var(--line-strong)',
            background: 'color-mix(in srgb, var(--void) 70%, transparent)',
            color: 'var(--ink)',
          }}
        />
        <button
          type="submit"
          disabled={!configured || state === 'sending' || state === 'done'}
          className={`${MONO_LABEL} ${FOCUS_RING} rounded-md border px-5 py-[10px] text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-60`}
          style={{
            color: configured ? 'var(--ink)' : 'var(--muted)',
            borderColor: configured
              ? 'color-mix(in srgb, var(--flow) 55%, transparent)'
              : 'var(--line-strong)',
            background: configured
              ? 'color-mix(in srgb, var(--flow-deep) 22%, transparent)'
              : 'transparent',
          }}
        >
          {state === 'sending' ? 'sending…' : state === 'done' ? 'received' : cta}
        </button>
      </form>

      {message ? (
        <p
          id={`${fieldId}-note`}
          role={state === 'error' ? 'alert' : undefined}
          className="mt-3 flex items-start gap-2 text-[12px]"
          style={{ color: state === 'done' ? 'var(--evidence)' : 'var(--faint)' }}
        >
          <span
            aria-hidden="true"
            className="mt-[5px] inline-block h-[5px] w-[5px] shrink-0 rounded-full"
            style={{
              background: state === 'done' ? 'var(--evidence)' : 'var(--line-strong)',
            }}
          />
          {message}
        </p>
      ) : null}
    </div>
  );
}

export default WaitlistBar;
