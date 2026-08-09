/**
 * Where this site lives, if anyone has said.
 *
 * 02-architecture is explicit that deployment is decided at ship time and that *nothing may
 * assume one* host. Open Graph is the one place that collides with: a share card has to be
 * an absolute URL, because the scraper fetching it has no page context to resolve a
 * relative path against. Next resolves that through `metadataBase`, and if `metadataBase`
 * is unset it silently substitutes `http://localhost:3000` — an absolute URL that is
 * confidently wrong, which is worse than none.
 *
 * So the host is configuration, exactly like the waitlist endpoint:
 *
 * ```sh
 * NEXT_PUBLIC_SITE_URL=https://…   # before `npm run build`
 * ```
 *
 * Set it and every page emits a complete Open Graph card pointing at `/og/default.png`.
 * Leave it unset — as this build does — and the pages emit their title and description and
 * no image, which is the honest degradation: a share card that cannot be fetched is not a
 * smaller card, it is a broken one.
 */

import type { Metadata } from 'next';

/** Trailing slash removed so `${SITE_URL}/og/default.png` is always well formed. */
export const SITE_URL: string | undefined = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '');

export const OG_IMAGE_PATH = '/og/default.png';

export const SITE_NAME = 'The Strategy Stack';

/**
 * The Open Graph half of a page's metadata. Returns nothing at all when no host is
 * configured, so `...openGraphFor(…)` spreads to nothing and the page keeps a clean head.
 */
export function openGraphFor(title: string, description: string): Pick<Metadata, 'openGraph'> {
  if (!SITE_URL) return {};
  return {
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: 'website',
      images: [
        {
          url: `${SITE_URL}${OG_IMAGE_PATH}`,
          width: 1200,
          height: 630,
          alt: 'The Strategy Stack — business frameworks, finally running.',
        },
      ],
    },
  };
}
