/**
 * The quiet footer, for every page S6 added.
 *
 * 01-design-system §7: *"every page ends with the same quiet mono footer line."* The six
 * full framework pages, the graph, the library index and the run each print that line
 * inline; the homepage has `HomeFooter`, which is the same idea with the homepage's three
 * doors under it. This is the shared version, written once for the eleven chapters, the
 * examples and the bridge — the routes that complete the site.
 *
 * Two rules it exists to keep:
 *
 * 1. **The doors are the site, not a sitemap.** Five links, each with a line saying what is
 *    behind it, in the order a visitor would want them: the library, the map, the worked
 *    examples, the run, the bridge. A footer that listed every route would be longer than
 *    some of the pages it appears on.
 * 2. **The closing line is the essay's, verbatim** (00-LAW Ruling 6) — *"AI is the
 *    processor. Instinct is the compiler and runtime."* It is quoted, never paraphrased,
 *    and it is the only sentence on this site that appears in more than one place on
 *    purpose.
 *
 * Plain anchors. A static export gains nothing from prefetching five routes a visitor may
 * never open, and every page carrying this one is inside the same performance budget
 * (Ruling 7).
 */

import { MONO_LABEL } from './styles';

export const FOOTER_LINE =
  'THE STRATEGY STACK · POWERED BY INSTINCT · BUSINESS FRAMEWORKS, FINALLY RUNNING.';

const DOORS: readonly { href: string; label: string; note: string }[] = [
  { href: '/frameworks', label: 'the library', note: 'seventeen frameworks, six at full depth' },
  { href: '/graph', label: 'the graph', note: 'which output feeds which input' },
  { href: '/examples', label: 'the examples', note: 'three companies, evidence packs open' },
  {
    href: '/runs/find-what-matters-now',
    label: 'the run',
    note: 'twelve steps, one diagnosis, start to finish',
  },
  { href: '/about-instinct', label: 'the bridge', note: 'what keeps it running afterwards' },
];

export interface SiteFooterProps {
  /** Match the page's own column width — the library runs wider than a lesson. */
  width?: 'column' | 'wide';
  className?: string;
}

export function SiteFooter({ width = 'column', className = '' }: SiteFooterProps) {
  return (
    <footer
      data-testid="site-footer"
      className={`mx-auto w-full border-t px-5 pt-10 pb-14 sm:px-8 ${
        width === 'wide' ? 'max-w-[80rem]' : 'max-w-5xl'
      } ${className}`}
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

export default SiteFooter;
