import { ImageResponse } from 'next/og';

/**
 * `/og/default.png` — the site's one share image, authored in code (04-phases S6).
 *
 * ## Why this is a route handler and not `opengraph-image.tsx`
 *
 * Next's `opengraph-image` file convention is the obvious way to do this and it is wrong
 * here for two concrete reasons, both discovered by trying it:
 *
 * 1. **It exports to a path with no extension.** The convention emits `out/opengraph-image`,
 *    and a static host has nothing to derive a content type from — the file ships as
 *    `application/octet-stream`, which several scrapers refuse. A route handler named
 *    `og/default.png/route.tsx` exports to `out/og/default.png`, so every static host on
 *    earth serves it as `image/png` without configuration.
 * 2. **It cascades into every route's metadata**, which forces `metadataBase` to resolve
 *    for pages that would otherwise need none. Referencing this file explicitly keeps the
 *    absolute URL under the site's own control — see `src/lib/site.ts`, where it is built
 *    only when the deployment host has actually been configured. 02-architecture requires
 *    that nothing in v1 assume a host.
 *
 * `dynamic = 'force-static'` is mandatory: `output: 'export'` refuses to collect a route
 * handler that has not declared itself static, and refuses it with an error rather than a
 * warning, so this cannot rot silently.
 *
 * ## Why one image rather than seventeen
 *
 * 03-content-spec asks for a per-framework og-image, *authored*. Authored is the operative
 * word — a designed share card per page is design work, not generation work, and seventeen
 * procedurally-templated cards would be seventeen slightly-wrong images rather than one
 * right one. This is the one right one: the tagline, the byline, the site's ground, drawn
 * in the palette's own tokens. Per-framework cards are a design task for whoever owns the
 * next pass, and the route to hang them on now exists.
 *
 * ## Where the colours come from
 *
 * `satori` renders this outside the DOM, so there is no `:root` to read custom properties
 * from and the card needs real values. Copying six hex literals in here would put the
 * site's palette in two places and break team rule 1 (tokens are the single source), so it
 * reads `src/app/tokens.css` at build time instead and pulls the tokens out by name. The
 * file access is free: `dynamic = 'force-static'` means this function runs exactly once,
 * during `next build`, in Node. Retune a token and the share card retunes with it.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const dynamic = 'force-static';

/** Reads one custom property out of the tokens sheet. Throws if it is gone. */
function token(name: string): string {
  const css = readFileSync(resolve(process.cwd(), 'src/app/tokens.css'), 'utf8');
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(css);
  if (!match?.[1]) throw new Error(`og image: tokens.css has no --${name}`);
  return match[1].trim();
}

export function GET() {
  const VOID = token('void');
  const INK = token('ink');
  const MUTED = token('muted');
  const FAINT = token('faint');
  const FLOW = token('flow');
  const LINE = token('line');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px 88px',
          background: VOID,
          color: INK,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 22,
              height: 22,
              background: FLOW,
              transform: 'rotate(45deg)',
              borderRadius: 3,
            }}
          />
          <div style={{ fontSize: 24, letterSpacing: 8, color: FAINT }}>THE STRATEGY STACK</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 88, lineHeight: 1.04, letterSpacing: -1, maxWidth: 900 }}>
            Business frameworks,
          </div>
          <div style={{ fontSize: 88, lineHeight: 1.04, letterSpacing: -1, color: FLOW }}>
            finally running.
          </div>
          <div style={{ fontSize: 30, marginTop: 30, color: MUTED, maxWidth: 800 }}>
            Seventeen instruments reading one shared business state — watch them run on a
            company, then join the first wave.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: `1px solid ${LINE}`,
            paddingTop: 26,
            fontSize: 22,
            letterSpacing: 4,
            color: FAINT,
          }}
        >
          <div>POWERED BY INSTINCT</div>
          <div>AI IS THE PROCESSOR · INSTINCT IS THE COMPILER AND RUNTIME</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
