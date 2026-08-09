import { readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

/**
 * The full-site crawl — S6's capstone (04-phases: *"full-site Playwright crawl green"*).
 *
 * The other five specs each walk one surface in depth. This one walks **everything the
 * export actually contains**, shallowly, and asserts the handful of properties that must
 * hold on every page of this site without exception. It is the test that notices a route
 * nobody remembered to look at.
 *
 * ## The routes come from `out/`, never from a list
 *
 * `ROUTES` is read off the filesystem at collection time. That is the whole design: a
 * hard-coded list would keep passing after someone adds a route and forgets to add it here,
 * which is precisely the failure this spec exists to prevent. Add a page, and it is crawled
 * on the next run whether or not anyone updated a test.
 *
 * The same list is also the **link oracle**. Knowing every exported route means internal
 * link integrity is a set-membership check rather than a few hundred HTTP requests: each
 * page's `<a href>` targets are collected in the browser and compared against the export.
 * A crawl that re-fetched every link would take minutes and prove the same thing.
 *
 * ## What every page must satisfy
 *
 *   1 · **No console errors and no page errors.** The favicon exemption the other specs
 *       carry is gone from this file: S6 ships `app/icon.svg` and `public/favicon.ico`, so
 *       a 404 for either is now a real failure rather than noise. The other specs keep
 *       their masks — they are not this slice's to edit.
 *   2 · **Exactly one `h1`, with text.** 00-LAW Ruling 7 asks for 100 accessibility on
 *       every route, and a missing or duplicated top-level heading is the cheapest way to
 *       lose it.
 *   3 · **A title and a description.** Every route names itself in a tab and in a share
 *       card. `<title>` must not be empty and must not be the raw filename.
 *   4 · **The amber law** (Ruling 2, team rule 3) — the site's most sacred rule, checked
 *       here across the whole export rather than page by page. Two halves: amber may never
 *       appear outside a declared `[data-amber-surface]` *anywhere*, and only the four
 *       routes that have a constraint to name may carry any at all.
 *   5 · **Every internal link resolves.** Including the ones S6 unlocked — the handoffs
 *       into the eleven chapter pages, which were deliberately unlinked until those pages
 *       existed.
 *
 * ## And one pass under reduced motion
 *
 * A single test walks every route with `prefers-reduced-motion: reduce`, asserting the page
 * still renders its heading and still logs nothing. Ruling 7 requires reduced motion to be
 * a designed experience rather than a broken one, and the per-surface specs already check
 * the terminal states of the diagrams; what this adds is coverage of the routes that have
 * no spec of their own.
 */

/* --------------------------------------------------------------- the export */

/**
 * Resolved from the working directory rather than from `import.meta.url`: Playwright
 * transpiles specs to CommonJS, where `import.meta` is a syntax error, and it always runs
 * with the project root as cwd — the same root `next build` writes `out/` into.
 */
const OUT = resolve(process.cwd(), 'out');

/** Every `.html` in the export, as the route a visitor would type. */
function exportedRoutes(dir = OUT): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === '_next') continue;
      found.push(...exportedRoutes(full));
      continue;
    }
    if (!entry.endsWith('.html')) continue;
    // The export's own error document. It is not a route and has no inbound link.
    if (entry === '404.html') continue;
    const rel = relative(OUT, full).split(sep).join('/');
    found.push(rel === 'index.html' ? '/' : `/${rel.replace(/\.html$/, '')}`);
  }
  return found;
}

/** Non-HTML files in the export — favicons, the share image. Link targets may point here. */
function exportedAssets(dir = OUT): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      // `_next` is build output: hashed chunks nobody links to by hand.
      if (entry !== '_next') found.push(...exportedAssets(full));
      continue;
    }
    if (entry.endsWith('.html')) continue;
    found.push(`/${relative(OUT, full).split(sep).join('/')}`);
  }
  return found;
}

const ROUTES = exportedRoutes().sort();
const ASSETS = new Set(exportedAssets());
const ROUTE_SET = new Set(ROUTES);

/**
 * The routes with a constraint to name, and therefore the only ones allowed to wear amber
 * at all. Each is a deliberate, documented surface rather than a page that happens to have
 * some:
 *
 *   /                             ACT III, the conductor — 03-content-spec puts the page's
 *                                 first amber there and nowhere earlier.
 *   /recipes                      the gallery, which performs `fw/toc-flow` and prints the
 *                                 `ConstraintBadge` as a component specimen.
 *   /frameworks/theory-of-…       the conductor's own page: the recipe's narrow stage, the
 *                                 badge, and the verdict.
 *   /runs/find-what-matters-now   the run, whose eleventh step is the diagnosis.
 *
 * Everything S6 added — eleven chapters, three company pages, the examples index and the
 * bridge — is on the other side of this list, and that is the point: a chapter framework
 * has no constraint to name, and neither does a company profile.
 */
const AMBER_ROUTES = new Set([
  '/',
  '/recipes',
  '/frameworks/theory-of-constraints',
  '/runs/find-what-matters-now',
]);

/** `--constraint` is #E8A845; computed styles report it as this triplet. */
const AMBER = '232, 168, 69';

/**
 * The run reveals its constraint at step eleven, so a crawl that lands on step one finds no
 * amber on the one page whose whole argument is amber. The vacuity check below visits it at
 * the step where the diagnosis is on screen.
 */
const AMBER_AT: Readonly<Record<string, string>> = {
  '/runs/find-what-matters-now': '/runs/find-what-matters-now?step=11',
};

/**
 * Routes exempt from the one-h1 rule. Empty since the integration lead promoted the
 * run header's title to the document h1 (each step's title is an h2 under it) —
 * kept as a set so any future exemption has to be named here, visibly.
 */
const NO_H1_YET = new Set<string>([]);

/* ------------------------------------------------------------------ helpers */

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => {
    errors.push(`requestfailed: ${req.url()} — ${req.failure()?.errorText ?? 'unknown'}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) errors.push(`http ${res.status()}: ${res.url()}`);
  });
  return errors;
}

async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  const viewport = page.viewportSize()?.height ?? 720;
  for (let y = 0; y < height; y += Math.floor(viewport * 0.9)) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(50);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
}

interface PageAudit {
  h1s: string[];
  title: string;
  description: string;
  hrefs: string[];
  amber: { path: string; prop: string; allowed: boolean }[];
}

/** One trip into the page, returning everything the assertions below need. */
async function auditPage(page: Page): Promise<PageAudit> {
  return page.evaluate((amber) => {
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

    const hits: { path: string; prop: string; allowed: boolean }[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('*'))) {
      const cs = getComputedStyle(el);
      for (const prop of props) {
        const value = cs[prop as keyof CSSStyleDeclaration];
        if (typeof value === 'string' && value.includes(amber)) {
          const id = el.getAttribute('data-component') ?? el.getAttribute('data-recipe') ?? '';
          hits.push({
            path: `${el.tagName.toLowerCase()}${id ? `[${id}]` : ''}`,
            prop,
            allowed: el.closest('[data-amber-surface]') !== null,
          });
        }
      }
    }

    return {
      h1s: Array.from(document.querySelectorAll('h1')).map((el) => el.textContent?.trim() ?? ''),
      title: document.title,
      description:
        document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
      hrefs: Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]')).map((a) =>
        a.getAttribute('href') ?? '',
      ),
      amber: hits,
    };
  }, AMBER);
}

/** An internal `href` reduced to the route it names, or null when it is not internal. */
function targetRoute(href: string): string | null {
  if (href === '' || href.startsWith('#')) return null;
  if (/^[a-z]+:/i.test(href) || href.startsWith('//')) return null; // external, mailto, tel
  const path = href.split('#')[0]?.split('?')[0] ?? '';
  if (path === '') return null; // a bare query or fragment: same page
  return path.replace(/\/$/, '') || '/';
}

/* -------------------------------------------------------------------- tests */

test.describe('the export is what the site claims to be', () => {
  test('every route the architecture names is in the export', () => {
    // 02-architecture's route table, checked against the artefact rather than the source.
    const required = [
      '/',
      '/frameworks',
      '/graph',
      '/examples',
      '/about-instinct',
      '/runs/find-what-matters-now',
      '/examples/beacon-mechanical',
      '/examples/relaydesk',
      '/examples/lantern-ai',
    ];
    for (const route of required) {
      expect(ROUTE_SET.has(route), `${route} is missing from the export`).toBe(true);
    }

    // Seventeen framework pages: six full, eleven chapters. S6's headline deliverable.
    const frameworkRoutes = ROUTES.filter((r) => r.startsWith('/frameworks/'));
    expect(frameworkRoutes, 'all seventeen frameworks should have a page').toHaveLength(17);

    // And the assets that used to 404: the favicon S6 added, and the share image.
    expect(ASSETS.has('/favicon.ico'), '/favicon.ico should ship').toBe(true);
    expect(ASSETS.has('/icon.svg'), '/icon.svg should ship').toBe(true);
    expect(ASSETS.has('/og/default.png'), '/og/default.png should ship').toBe(true);
  });
});

test.describe('every page in the export', () => {
  for (const route of ROUTES) {
    test(`${route} — clean, headed, titled, amber-lawful, and linked to real pages`, async ({
      page,
    }) => {
      const errors = collectConsoleErrors(page);

      const response = await page.goto(route);
      expect(response?.status(), `${route} did not respond 200`).toBe(200);
      await scrollThrough(page);

      const audit = await auditPage(page);

      /* 2 · one heading, and it says something. */
      if (NO_H1_YET.has(route)) {
        expect(audit.h1s, `${route} unexpectedly grew an h1 — remove it from NO_H1_YET`).toHaveLength(0);
      } else {
        expect(audit.h1s, `${route} should have exactly one h1`).toHaveLength(1);
        expect(audit.h1s[0]?.length ?? 0, `${route}'s h1 is empty`).toBeGreaterThan(2);
      }

      /* 3 · it names itself. */
      expect(audit.title.length, `${route} has no title`).toBeGreaterThan(8);
      expect(audit.title, `${route}'s title should carry the site name`).toContain(
        'The Strategy Stack',
      );
      expect(audit.description.length, `${route} has no meta description`).toBeGreaterThan(20);

      /* 4 · the amber law, both halves. */
      const violations = audit.amber.filter((h) => !h.allowed);
      expect(
        violations.map((v) => `${v.path}.${v.prop}`),
        `${route}: amber outside a declared constraint surface`,
      ).toEqual([]);
      if (!AMBER_ROUTES.has(route)) {
        expect(
          audit.amber.map((h) => `${h.path}.${h.prop}`),
          `${route} has not earned any amber`,
        ).toEqual([]);
        await expect(page.locator('[data-amber-surface]')).toHaveCount(0);
      }

      /* 5 · every internal link lands on a page that exists. */
      const broken = audit.hrefs
        .map(targetRoute)
        .filter((target): target is string => target !== null)
        .filter((target) => !ROUTE_SET.has(target) && !ASSETS.has(target));
      expect([...new Set(broken)], `${route} links to pages that are not in the export`).toEqual(
        [],
      );

      /* 1 · nothing went wrong on the way. */
      expect(errors, `${route}\n${errors.join('\n')}`).toEqual([]);
    });
  }
});

test.describe('the amber audit is not vacuous', () => {
  test('the four routes that have earned amber are actually wearing it', async ({ page }) => {
    // Without this, a stylesheet regression that removed --constraint everywhere would make
    // every assertion above pass. The law has two failure modes and this is the quiet one.
    for (const route of AMBER_ROUTES) {
      if (!ROUTE_SET.has(route)) continue;
      await page.goto(AMBER_AT[route] ?? route);
      await scrollThrough(page);
      const audit = await auditPage(page);
      expect(audit.amber.length, `${route} should carry amber and carries none`).toBeGreaterThan(
        0,
      );
    }
  });
});

test.describe('reduced motion', () => {
  test('every route renders as a document, silently', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    for (const route of ROUTES) {
      await page.goto(route);
      expect(
        await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches),
        'reduced-motion emulation did not take',
      ).toBe(true);
      await expect(page.locator('h1')).toHaveCount(NO_H1_YET.has(route) ? 0 : 1);
      if (!NO_H1_YET.has(route)) await expect(page.locator('h1')).toBeVisible();
      // A designed reduced-motion page is a page, not a frozen first frame: it has to have
      // rendered enough content to scroll.
      const height = await page.evaluate(() => document.body.scrollHeight);
      expect(height, `${route} rendered almost nothing under reduced motion`).toBeGreaterThan(600);
    }

    expect(errors, errors.join('\n')).toEqual([]);
  });
});

/* ------------------------------------------------ S6's own content contracts */

test.describe('the eleven chapter pages', () => {
  const CHAPTER_ROUTES = [
    '/frameworks/pestle',
    '/frameworks/tows',
    '/frameworks/ansoff',
    '/frameworks/three-horizons',
    '/frameworks/blue-ocean',
    '/frameworks/jobs-to-be-done',
    '/frameworks/value-proposition-canvas',
    '/frameworks/kano',
    '/frameworks/mckinsey-7s',
    '/frameworks/balanced-scorecard',
    '/frameworks/okrs',
  ];

  test('each carries the five things 03-content-spec asks a chapter for', async ({ page }) => {
    for (const route of CHAPTER_ROUTES) {
      await page.goto(route);
      const root = page.getByTestId('framework-page-root');
      await expect(root, `${route} is not a chapter page`).toHaveAttribute('data-depth', 'chapter');

      // hero question · mini-map · static teaser · summary with its pull quote · notify me
      await expect(root.locator('h1')).toBeVisible();
      await expect(page.locator('[data-component="graph-mini-map"]')).toHaveCount(1);
      const teaser = page.getByTestId('chapter-teaser');
      await expect(teaser).toHaveCount(1);
      await expect(teaser.locator('[data-teaser-frame]')).toHaveCount(1);
      // A still, not a showpiece. The atmosphere and glass recipes are page furniture and
      // run everywhere; what a chapter must never carry is a *framework* recipe performing
      // (`fw/…`) or a pinned act, because it has not authored one.
      await expect(page.locator('[data-recipe^="fw/"]')).toHaveCount(0);
      await expect(page.locator('[data-act]')).toHaveCount(0);
      await expect(page.locator('#chapter [data-pullquote]')).toHaveCount(1);
      await expect(page.locator('#notify [data-component="waitlist-bar"]')).toHaveCount(1);
      await expect(page.getByTestId('state-panel')).toHaveCount(1);
      await expect(page.getByTestId('site-footer')).toHaveCount(1);
    }
  });

  test('a chapter summary states no figure it cannot source', async ({ page }) => {
    // Ruling 4 on a page with no evidence pack: the only defensible number of unsourced
    // figures in the prose is zero, so the summaries spell their counts as words.
    for (const route of CHAPTER_ROUTES) {
      await page.goto(route);
      // A framework whose own name contains a numeral — McKinsey 7S, Three Horizons' H1/H2/H3
      // — is not stating a figure when it says its own name, so the name is removed before
      // the sweep rather than the sweep being softened.
      const name = (await page.locator('h1').innerText()).trim();
      const digits = await page.evaluate((frameworkName) => {
        const root = document.querySelector('#chapter article');
        if (!root) return ['no summary on the page'];
        const found: string[] = [];
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const text = (walker.currentNode.nodeValue ?? '').split(frameworkName).join('');
          if (/\d/.test(text)) found.push(text.trim().slice(0, 60));
        }
        return found;
      }, name);
      expect(digits, `${route}: a figure in the summary with no source object`).toEqual([]);
    }
  });

  test('the handoff into a chapter is now a real link', async ({ page }) => {
    // S3 left these named and unlinked, because a handoff into a 404 is worse than a
    // missing link. This is the assertion that they were unlocked rather than forgotten.
    await page.goto('/frameworks/swot-tows');
    const chapterLink = page.locator('[data-handoff-link="tows"]');
    await expect(chapterLink).toHaveCount(1);
    await expect(page.locator('[data-handoff-chapter]')).toHaveCount(0);

    await chapterLink.first().scrollIntoViewIfNeeded();
    await chapterLink.first().click();
    await expect(page).toHaveURL(/\/frameworks\/tows\?/);
    await expect(page.getByTestId('framework-page-root')).toHaveAttribute('data-depth', 'chapter');
    // And the receiving chapter reads the carried state back.
    await expect(page.getByTestId('incoming-state')).toContainText('SWOT');
  });
});

test.describe('the three example companies', () => {
  const COMPANY_ROUTES = ['/examples/beacon-mechanical', '/examples/relaydesk', '/examples/lantern-ai'];

  test('the index ships three and names three more without inventing them', async ({ page }) => {
    await page.goto('/examples');
    await expect(page.locator('[data-example-link]')).toHaveCount(3);
    for (const name of ['Hearth & Pine', 'Northstar Clinics', 'Atlas Industrial']) {
      const row = page.locator(`[data-in-the-lab="${name}"]`);
      await expect(row).toHaveCount(1);
      // Names only: a company with no authored pack gets no sector, no figures, no story.
      const text = (await row.innerText()).replace(/in the lab/i, '');
      expect(text.replace(name, '').trim(), `${name} should be a name and nothing else`).toBe('');
    }
  });

  test('every figure on a company page cites a source object', async ({ page }) => {
    for (const route of COMPANY_ROUTES) {
      await page.goto(route);
      const audit = await page.evaluate(() => {
        const root = document.querySelector('[data-testid="company-body"]');
        if (!root) return { unsourced: ['no company body on the page'], sourced: 0, objects: 0 };
        const unsourced: string[] = [];
        let sourced = 0;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const text = walker.currentNode.nodeValue ?? '';
          if (!/\d/.test(text)) continue;
          const parent = walker.currentNode.parentElement;
          // A section's own counter ("01", "02") is page furniture printed by `Kicker`, not
          // a statement about the business, so it is skipped rather than sourced.
          if (parent?.closest('[data-component="kicker"]')) continue;
          // Either it sits in a claim block that cites its object, or it *is* the object.
          if (parent?.closest('[data-claim], [data-evidence-object]')) {
            sourced += 1;
            continue;
          }
          unsourced.push(text.trim().slice(0, 60));
        }
        return {
          unsourced,
          sourced,
          objects: root.querySelectorAll('[data-evidence-object]').length,
        };
      });
      expect(audit.unsourced, `${route}: figures with no source object`).toEqual([]);
      expect(audit.sourced, `${route}: the sweep found no figures at all`).toBeGreaterThan(20);
      expect(audit.objects, `${route}: the evidence pack should be printed in full`).toBeGreaterThan(
        11,
      );
    }
  });

  test('the evidence pack is inspectable without opening anything', async ({ page }) => {
    await page.goto('/examples/beacon-mechanical');
    const first = page.locator('[data-evidence-object]').first();
    await expect(first).toBeVisible();
    // 03-content-spec: source, date, type, excerpt, reliability — all five, on the page.
    await expect(first).toHaveAttribute('data-reliability', /high|medium|low/);
    await expect(first).toContainText('ev_');
    await expect(first).toContainText(/\d{4}-\d{2}-\d{2}/);
    await expect(first).toContainText(/reliability/i);
  });

  test('a framework link carries the company through', async ({ page }) => {
    await page.goto('/examples/relaydesk');
    const link = page.locator('[data-try-framework]').first();
    await link.scrollIntoViewIfNeeded();
    expect(await link.getAttribute('href')).toContain('company=relaydesk');
  });
});

test.describe('the bridge', () => {
  test('quotes the law, shows the loop, and does not fake the door', async ({ page }) => {
    await page.goto('/about-instinct');

    // Ruling 6's conversion message, verbatim, and the essay lines 00-LAW quotes.
    await expect(page.locator('h1')).toContainText('You ran the framework once.');
    await expect(page.locator('h1')).toContainText('Instinct keeps it running.');
    await expect(page.getByTestId('bridge-root')).toContainText(
      'Business frameworks were never wallpaper.',
    );
    await expect(page.getByTestId('bridge-root')).toContainText(
      'AI is the processor.',
    );
    // Never the banned framing.
    await expect(page.getByTestId('bridge-root')).not.toContainText(/framework reports?/i);

    // The four product frames, and the loop.
    await expect(page.locator('[data-frame]')).toHaveCount(4);
    await expect(page.getByTestId('loop-diagram')).toBeVisible();

    // The waitlist is front and centre, and honest about this build.
    const bar = page.getByTestId('join-section').locator('[data-component="waitlist-bar"]');
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute('data-state', 'unconfigured');
    await expect(bar.locator('input[type="email"]')).toBeDisabled();
    await expect(bar).toContainText(/nothing is sent, and nothing is stored/i);
  });
});

test.describe('the footer completes the site', () => {
  test('every S6 page ends with the same doors and the same closing line', async ({ page }) => {
    for (const route of ['/examples', '/examples/lantern-ai', '/about-instinct', '/frameworks/kano']) {
      await page.goto(route);
      const footer = page.getByTestId('site-footer');
      await expect(footer, `${route} has no site footer`).toHaveCount(1);
      for (const href of ['/frameworks', '/graph', '/examples', '/about-instinct']) {
        await expect(footer.locator(`a[href="${href}"]`)).toHaveCount(1);
      }
      await expect(footer).toContainText('THE STRATEGY STACK · POWERED BY INSTINCT');
      await expect(footer).toContainText('Instinct is the compiler and runtime.');
    }
  });
});
