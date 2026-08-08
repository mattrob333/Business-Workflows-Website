import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

/**
 * Fonts load via next/font/local (pointed at the @fontsource packages, which stay the
 * canonical source of the files) rather than fontsource's CSS imports. The difference
 * is the loading chain: CSS-declared fonts are discovered a round-trip late and repaint
 * the page when they swap in — Lighthouse charged the /recipes LCP ~1.4s for exactly
 * that. next/font inlines the @font-face and preloads the woff2 from the initial HTML.
 * Latin subsets only; the site is English (01-design-system).
 */
const newsreader = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2',
      style: 'normal',
    },
    {
      path: '../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2',
      style: 'italic',
    },
  ],
  variable: '--font-newsreader',
  display: 'swap',
});

const inter = localFont({
  src: '../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  variable: '--font-inter',
  display: 'swap',
});

const plexMono = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2',
      weight: '400',
    },
    {
      path: '../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2',
      weight: '500',
    },
  ],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Strategy Stack — powered by Instinct',
  description: 'Business frameworks, finally running.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
