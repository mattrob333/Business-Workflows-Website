import { expect, test, type Page } from '@playwright/test';

/**
 * S4 walk — the homepage, five acts.
 *
 * 04-phases S4 "done means": *all five acts on scroll + reduced-motion doc mode.* Both
 * halves are here, plus the four laws a scrollytelling front door is most likely to
 * break:
 *
 *   - **Ruling 7, the hard line.** `LCP < 2.0s` on this page, and the hero headline is the
 *     LCP element. The first test fetches the *raw exported HTML* — not the hydrated DOM —
 *     and fails if anything in the hero is opacity-gated. A headline that waits for
 *     hydration cannot make that budget, and a rendered-only assertion would never catch
 *     it because by the time Playwright looks, hydration has happened.
 *   - **Ruling 2 / team rule 3, the amber law.** ACT III carries the page's first and only
 *     amber. The other four acts and the hero are asserted amber-*free* — an absence, not
 *     a containment — and ACT III's amber is asserted to sit entirely inside declared
 *     `[data-amber-surface]` elements, which must be exactly the two sanctioned ones.
 *   - **Ruling 4, the honesty engine.** Every digit in the page's copy panels sits inside a
 *     claim block or an evidence chip, or it is spelled as a word. Swept from the DOM the
 *     way S3 sweeps the explore sections.
 *   - **Ruling 7's reduced-motion clause.** Acts un-pin, the story still reads top to
 *     bottom, and every diagram shows its terminal state rather than a frozen first frame.
 */

const ACT_IDS = ['board', 'instruments', 'conductor', 'delegation', 'bridge'] as const;

/** The four acts (plus the hero) that must contain no amber at all. */
const AMBER_FREE = [
  '[data-testid="hero"]',
  '[data-act="board"]',
  '[data-act="instruments"]',
  '[data-act="delegation"]',
  '[data-act="bridge"]',
  '[data-testid="join-section"]',
  '[data-testid="home-footer"]',
] as const;

/** `--constraint` is #E8A845. Computed styles report it as this triplet. */
const AMBER = '232, 168, 69';

/** Chromium probes `/favicon.ico` on its own; the static export has none until S6. */
const IGNORED_ERROR =
  /favicon\.ico|Failed to load resource: the server responded with a status of 404/;

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() !== 'error') return;
    if (IGNORED_ERROR.test(text)) return;
    errors.push(`console.error: ${text}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** Per-page emulation: the `test.use` fixture form silently does not take here. */
async function reduceMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

/** Walk the whole page so every act has been scrubbed to its end. */
async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  const viewport = page.viewportSize()?.height ?? 720;
  for (let y = 0; y < height; y += Math.floor(viewport * 0.5)) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(70);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
}

interface AmberHit {
  path: string;
  prop: string;
  allowed: boolean;
}

/** The S0/S3 audit, scoped to one region of the page. */
async function amberAuditIn(page: Page, selector: string): Promise<AmberHit[]> {
  return page.evaluate(
    ({ amber, selector: sel }) => {
      const props = [
        'color',
        'backgroundColor',
        'backgroundImage',
        'borderTopColor',
        'borderRightColor',
        'borderBottomColor',
        'borderLeftColor',
        'outlineColor',
        'boxShadow',
        'fill',
        'stroke',
      ] as const;
      const root = document.querySelector<HTMLElement>(sel);
      if (!root) return [{ path: `missing region ${sel}`, prop: '-', allowed: false }];
      const hits: { path: string; prop: string; allowed: boolean }[] = [];
      for (const el of [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]) {
        const cs = getComputedStyle(el);
        for (const prop of props) {
          const value = cs[prop as keyof CSSStyleDeclaration];
          if (typeof value === 'string' && value.includes(amber)) {
            const id =
              el.getAttribute('data-component') ?? el.getAttribute('data-recipe') ?? '';
            hits.push({
              path: `${sel} ${el.tagName.toLowerCase()}${id ? `[${id}]` : ''}`,
              prop,
              allowed: el.closest('[data-amber-surface]') !== null,
            });
          }
        }
      }
      return hits;
    },
    { amber: AMBER, selector },
  );
}

/* ------------------------------------------------------------------ the hero */

test.describe('the hero paints before hydration', () => {
  test('the exported HTML carries a visible headline with no opacity gate', async ({
    request,
  }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
    const html = await response.text();

    // The sentence itself is in the static payload, in an h1.
    expect(html).toContain('data-testid="hero-headline"');
    expect(html).toContain('Business frameworks were never wallpaper.');
    const h1 = html.match(/<h1[^>]*data-testid="hero-headline"[^>]*>/);
    expect(h1, 'the headline is not an h1 in the exported HTML').not.toBeNull();

    // Nothing in the hero — the headline, its wrappers, the header itself — is faded
    // out waiting for JavaScript. This is the LCP guarantee, checked at the source.
    const start = html.indexOf('data-testid="hero"');
    const end = html.indexOf('</header>', start);
    expect(start, 'no hero region in the exported HTML').toBeGreaterThan(-1);
    const hero = html.slice(start, end);
    // `opacity: 0` exactly — the atmosphere's blobs legitimately sit at `opacity:0.07`.
    expect(hero).not.toMatch(/opacity:\s*0(?![.0-9])/);
    expect(hero, 'the hero must not be wrapped in an entrance recipe').not.toContain(
      'data-recipe="motion/ingest"',
    );

    // Tighter still: the editorial column the headline lives in carries no opacity of
    // any kind, so nothing in the LCP element's ancestry can be fading.
    const copyStart = html.indexOf('data-copy="hero"');
    const copy = html.slice(copyStart, end);
    expect(copyStart, 'no hero copy panel in the exported HTML').toBeGreaterThan(-1);
    expect(copy, 'the hero copy column is opacity-styled').not.toMatch(/opacity:/);

    // The sub-line and both calls to action ship in the same payload.
    expect(hero).toContain('Business frameworks, finally running.');
    expect(hero).toContain('Watch it run');
    expect(hero).toContain('Join the first wave');
  });

  test('the headline renders fully opaque, and the CTAs are real links', async ({ page }) => {
    await page.goto('/');
    const headline = page.getByTestId('hero-headline');
    await expect(headline).toBeVisible();
    await expect(headline).toHaveText(/Business frameworks were never wallpaper/);
    expect(
      await headline.evaluate((el) => getComputedStyle(el).opacity),
      'the headline is not fully opaque',
    ).toBe('1');

    await expect(page.getByTestId('cta-watch')).toHaveAttribute('href', '#watch');
    await expect(page.getByTestId('cta-join')).toHaveAttribute('href', '#join');
  });
});

/* ------------------------------------------------------------------ the acts */

test.describe('five acts, in order', () => {
  test('every act pins and scrubs under full motion, with no console errors', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/');
    await expect(page.getByTestId('home-root')).toBeVisible();

    const acts = page.locator('[data-act]');
    await expect(acts).toHaveCount(5);
    expect(
      await acts.evaluateAll((els) => els.map((el) => el.getAttribute('data-act'))),
      'the acts are out of order',
    ).toEqual([...ACT_IDS]);

    const staged = await acts.evaluateAll((els) =>
      els.map((el) => ({
        id: el.getAttribute('data-act'),
        pinned: el.getAttribute('data-pinned'),
        span: (el as HTMLElement).style.height,
        ratio: el.getBoundingClientRect().height / window.innerHeight,
        sticky: getComputedStyle(el.firstElementChild as Element).position,
      })),
    );
    for (const s of staged) {
      expect(s.pinned, `act ${s.id} is not pinned`).toBe('true');
      expect(s.sticky, `act ${s.id} has no sticky stage`).toBe('sticky');
      // 01 §4's spec'd pin range, 1.5–2.5 viewport heights, reserved explicitly.
      const vh = Number(s.span.replace('vh', ''));
      expect(vh, `act ${s.id} reserves "${s.span}"`).toBeGreaterThanOrEqual(150);
      expect(vh, `act ${s.id} reserves "${s.span}"`).toBeLessThanOrEqual(250);
      expect(s.ratio).toBeGreaterThanOrEqual(1.4);
      expect(s.ratio).toBeLessThanOrEqual(2.6);
    }

    // Each act performs the recipe 03-content-spec assigns it.
    await expect(page.locator('[data-recipe="fw/bmc-assemble"]')).toHaveCount(1);
    await expect(page.getByTestId('instrument-graph')).toHaveCount(1);
    await expect(page.locator('[data-recipe="fw/toc-flow"]')).toHaveCount(1);
    await expect(page.locator('[data-recipe="fw/raci-route"]')).toHaveCount(1);
    await expect(page.getByTestId('loop-diagram')).toHaveCount(1);

    // Scrubbing ACT I advances the canvas: the act is bound to scroll, not to a timer.
    const canvas = page.locator('[data-recipe="fw/bmc-assemble"]');
    await canvas.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    const early = Number(await canvas.getAttribute('data-step'));
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.4));
    await page.waitForTimeout(400);
    const later = Number(await canvas.getAttribute('data-step'));
    expect(later, 'the canvas did not advance on scroll').toBeGreaterThan(early);

    await scrollThrough(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('the margin rail prints all five chapter markers', async ({ page }) => {
    await page.goto('/');
    // Each act renders the marker twice — vertical in the margin at `xl`, horizontal
    // inline below it — and CSS shows exactly one. The kage rail is the visible one.
    const markers = page.locator('[data-component="act-marker"]:visible');
    await expect(markers).toHaveCount(5);
    const indices = await markers.evaluateAll((els) =>
      els.map((el) => el.getAttribute('data-act-index')),
    );
    expect(indices).toEqual(['1', '2', '3', '4', '5']);
    await expect(markers.first()).toContainText('01');
    await expect(markers.first()).toContainText('05');
  });

  test('ACT II names the typed state that travels on each edge', async ({ page }) => {
    await page.goto('/');
    const graph = page.getByTestId('instrument-graph');
    await graph.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);

    // Seven instruments, and every wire on the canvas is a registry edge.
    await expect(graph.locator('[data-component="graph-node"]')).toHaveCount(7);
    const edges = await graph.locator('[data-component="graph-edge"]').count();
    expect(edges, 'the graph should draw the handoffs plus the return edge').toBe(9);

    // The readout carries real state-field identifiers, not prose.
    const readout = page.getByTestId('instrument-readout');
    await expect(readout.locator('[data-state-field]').first()).toBeVisible();
  });
});

/* -------------------------------------------------------------- reduced motion */

test.describe('reduced motion is doc mode', () => {
  test('acts un-pin and every diagram shows its terminal state', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await reduceMotion(page);
    await page.goto('/');
    expect(
      await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches),
      'reduced-motion emulation did not take',
    ).toBe(true);

    const acts = page.locator('[data-act]');
    await expect(acts).toHaveCount(5);
    const states = await acts.evaluateAll((els) =>
      els.map((el) => ({
        id: el.getAttribute('data-act'),
        pinned: el.getAttribute('data-pinned'),
        span: (el as HTMLElement).style.height,
        position: getComputedStyle(el.firstElementChild as Element).position,
      })),
    );
    for (const s of states) {
      expect(s.pinned, `act ${s.id} still pins`).toBe('false');
      expect(s.position).not.toBe('sticky');
      // The act is as tall as its content and no taller: no reserved scroll span. Height
      // is not asserted in viewports here — ACT III's copy, pipe and interventions are
      // legitimately more than one screenful of *document* once nothing is pinned.
      expect(s.span, `act ${s.id} still reserves a scroll span`).toBe('');
    }

    await scrollThrough(page);

    // ACT I — the canvas is assembled, not nine empty boxes.
    const filled = await page
      .locator('[data-recipe="fw/bmc-assemble"] [data-block]')
      .evaluateAll((els) => els.every((el) => el.getAttribute('data-filled') === 'true'));
    expect(filled, 'the canvas should be fully assembled under reduced motion').toBe(true);

    // ACT II — every handoff lit, the readout resting on the last one.
    await expect(page.getByTestId('instrument-graph')).toHaveAttribute('data-step', '8');
    await expect(page.getByTestId('instrument-readout')).toContainText('the last handoff');

    // ACT III — the pipe has run and the queue has backed up behind the constraint.
    const flow = page.locator('[data-recipe="fw/toc-flow"]');
    await expect(flow).toBeVisible();
    await expect(flow.locator('[data-constraint="true"]')).toHaveCount(1);
    await expect(flow.locator('[data-queue="true"]')).toHaveCount(1);

    // ACT IV — the packet has been delivered and the checkpoint is signed.
    await expect(page.locator('[data-recipe="fw/raci-route"]')).toHaveAttribute('data-step', '5');

    // ACT V — the loop is closed: every station lit.
    const loop = page.getByTestId('loop-diagram');
    await expect(loop).toHaveAttribute('data-step', '6');
    const litStations = await loop
      .locator('[data-station]')
      .evaluateAll((els) => els.every((el) => el.getAttribute('data-lit') === 'true'));
    expect(litStations, 'the loop should be closed under reduced motion').toBe(true);

    // Nothing is left mid-fade. `atmo/grain`'s terminal state *is* opacity .04 (01 §2).
    const faded = await page
      .locator('[data-recipe]:not([data-recipe="atmo/grain"])')
      .evaluateAll((els) =>
        els
          .filter((el) => Number(getComputedStyle(el).opacity) < 0.99)
          .map((el) => el.getAttribute('data-recipe')),
      );
    expect(faded, `not at terminal state: ${faded.join(', ')}`).toEqual([]);

    // And the story still reads top to bottom: hero, five acts, the door, the footer.
    await expect(page.getByTestId('hero-headline')).toBeVisible();
    await expect(page.getByTestId('join-section')).toBeVisible();
    await expect(page.getByTestId('home-footer')).toBeVisible();

    expect(errors, errors.join('\n')).toEqual([]);
  });
});

/* ------------------------------------------------------------- the amber law */

test.describe('the amber law', () => {
  test('ACT III carries the first and only amber, inside declared surfaces', async ({
    page,
  }) => {
    await page.goto('/');
    await scrollThrough(page);

    for (const region of AMBER_FREE) {
      const hits = await amberAuditIn(page, region);
      expect(
        hits.map((h) => `${h.path}.${h.prop}`),
        `${region} has not earned any amber`,
      ).toEqual([]);
    }

    const conductor = await amberAuditIn(page, '[data-act="conductor"]');
    // Guard against a vacuous pass: the conductor must actually be wearing amber.
    expect(
      conductor.length,
      'no amber in ACT III — the audit is not looking at anything',
    ).toBeGreaterThan(0);
    expect(
      conductor.filter((h) => !h.allowed).map((h) => `${h.path}.${h.prop}`),
      'amber outside a constraint surface',
    ).toEqual([]);

    // The surfaces are exactly the two sanctioned ones: the recipe's computed stage and
    // the badge that names it. No third pragma'd file was written for this page.
    const surfaces = await page
      .locator('[data-amber-surface]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-amber-surface')));
    expect(new Set(surfaces)).toEqual(new Set(['toc', 'badge']));
  });
});

/* --------------------------------------------------------- the honesty engine */

test.describe('every figure is sourced', () => {
  test('no digit in the page copy sits outside a claim block', async ({ page }) => {
    await page.goto('/');
    await scrollThrough(page);

    const audit = await page.evaluate(() => {
      const unsourced: string[] = [];
      let sourced = 0;
      for (const panel of Array.from(document.querySelectorAll<HTMLElement>('[data-copy]'))) {
        const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const text = walker.currentNode.nodeValue ?? '';
          if (!/\d/.test(text)) continue;
          const parent = walker.currentNode.parentElement;
          // A claim block cites its sources; an evidence chip *is* one.
          if (
            parent?.closest('[data-claim]') ??
            parent?.closest('[data-component="evidence-ref"]')
          ) {
            sourced += 1;
            continue;
          }
          unsourced.push(`${panel.getAttribute('data-copy')}: ${text.trim().slice(0, 60)}`);
        }
      }
      const panels = document.querySelectorAll('[data-copy]').length;
      const claims = document.querySelectorAll('[data-copy] [data-claim]').length;
      const uncited = Array.from(
        document.querySelectorAll('[data-copy] [data-claim]'),
      ).filter((el) => el.querySelectorAll('[data-component="evidence-ref"]').length === 0).length;
      return { unsourced, sourced, panels, claims, uncited };
    });

    expect(audit.panels, 'the hero and all five acts should declare copy panels').toBeGreaterThan(5);
    expect(audit.unsourced, 'figures in the page copy with no source object').toEqual([]);
    expect(audit.claims, 'the acts should carry sourced claim blocks').toBeGreaterThan(3);
    expect(audit.sourced, 'the sweep found no figures at all — it is not looking').toBeGreaterThan(0);
    expect(audit.uncited, 'claim blocks citing nothing').toBe(0);
  });

  test('the page says the company is fictional before it shows a number', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByTestId('hero').getByText(/a fictional company, every number authored/i),
    ).toBeVisible();
  });
});

/* ------------------------------------------------------------------- the CTAs */

test.describe('both calls to action are live', () => {
  test('“Watch it run” lands on the acts and “Join the first wave” reaches the waitlist', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByTestId('cta-watch').click();
    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe('#watch');
    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const el = document.querySelector('#watch');
            return el ? Math.round(el.getBoundingClientRect().top) : 99999;
          }),
        { message: 'the acts container did not come to the top of the viewport' },
      )
      .toBeLessThan(120);

    await page.goto('/');
    await page.getByTestId('cta-join').click();
    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe('#join');
    await expect(page.getByTestId('join-section')).toBeInViewport();
    await expect(page.locator('[data-component="waitlist-bar"]')).toBeVisible();
    // S6 wires the endpoint. Until then the bar says so rather than faking a capture.
    await expect(page.locator('[data-component="waitlist-bar"]')).toHaveAttribute(
      'data-state',
      'unconfigured',
    );
  });

  test('the quiet footer opens the other three doors', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByTestId('home-footer');
    for (const href of ['/frameworks', '/graph', '/recipes']) {
      await expect(footer.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
    await expect(footer).toContainText('THE STRATEGY STACK · POWERED BY INSTINCT');
  });
});
