/**
 * The quiet footer — 01-design-system §7: *"every page ends with the same quiet mono
 * footer line."*
 *
 * Quiet is the brief. After five acts the page has said everything it has to say, so the
 * footer is filing information and three doors: the library, the map, and the recipe
 * gallery the whole site is built from. Plain anchors, as everywhere else on this site —
 * a static export gains nothing from prefetching three routes a visitor may never open,
 * and the homepage's budget is the tightest on the site (00-LAW Ruling 7).
 *
 * The closing line is the essay's, verbatim (Ruling 6).
 */

import { MONO_LABEL } from '@/components/styles';
import { FOOTER_LINE } from './data';

const DOORS: readonly { href: string; label: string; note: string }[] = [
  { href: '/frameworks', label: 'the library', note: 'seventeen frameworks, six at full depth' },
  { href: '/graph', label: 'the graph', note: 'which output feeds which input' },
  { href: '/recipes', label: 'the recipes', note: 'every motion spec, performing' },
];

export function HomeFooter() {
  return (
    <footer
      data-testid="home-footer"
      className="mx-auto w-full max-w-5xl border-t px-5 pt-10 pb-14 sm:px-8"
      style={{ borderColor: 'var(--line)' }}
    >
      <nav aria-label="Elsewhere on the site" className="grid gap-6 sm:grid-cols-3">
        {DOORS.map((door) => (
          <a
            key={door.href}
            href={door.href}
            className="group rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--flow)]"
          >
            <span
              className={`${MONO_LABEL} block text-[11px] underline decoration-dotted underline-offset-4`}
              style={{ color: 'var(--muted)' }}
            >
              {door.label}
            </span>
            <span className="mt-1 block text-[13px] leading-snug" style={{ color: 'var(--faint)' }}>
              {door.note}
            </span>
          </a>
        ))}
      </nav>

      <p
        className="font-narrative mt-10 max-w-[46ch] text-[19px] leading-snug"
        style={{ color: 'var(--muted)' }}
      >
        AI is the processor. <em className="italic">Instinct is the compiler and runtime.</em>
      </p>

      <p className={`${MONO_LABEL} mt-6 text-[9px]`} style={{ color: 'var(--faint)' }}>
        {FOOTER_LINE}
      </p>
    </footer>
  );
}

export default HomeFooter;
