import type { Metadata } from 'next';

import { openGraphFor } from '@/lib/site';

/**
 * Metadata for `/recipes`, which cannot declare its own.
 *
 * The gallery is a `'use client'` page — it has to be, since every entry on it is a live
 * recipe with its own state — and a client component may not export `metadata`. Without
 * this layout the route inherits the root title and describes itself as the site, which is
 * the one page on the site that is emphatically not the site.
 *
 * A layout is the sanctioned way to attach metadata to a client page, and it is added here
 * as a new file rather than by converting the gallery: S6 completes the site's metadata, it
 * does not refactor S0's acceptance surface.
 */

const TITLE = 'The recipe gallery — The Strategy Stack';
const DESCRIPTION =
  'Every motion recipe in the design system, performing, with its duration, easing, trigger and reduced-motion terminal state stated beside it.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...openGraphFor(TITLE, DESCRIPTION),
};

export default function RecipesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
