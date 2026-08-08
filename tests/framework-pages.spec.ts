import { expect, test, type Page } from '@playwright/test';
import { FRAMEWORKS, frameworksByDepth } from '../src/registry/index';

/**
 * S3 walk — the six full framework pages.
 *
 * 04-phases S3 "done means": *each page: act-pinned animation performs; prediction widget
 * works; handoff carries state via URL; per-page Playwright walk.* All four are here, plus
 * the two laws that a framework page is most likely to break:
 *
 *   - **Ruling 4** — every figure in the explore section sits inside a claim block that
 *     cites a source object. Swept from the DOM rather than eyeballed, and swept *after*
 *     the interactions have run, so revealed content is covered too.
 *   - **Ruling 2 / team rule 3** — the amber law. Theory of Constraints is the one page on
 *     this route with a constraint to name, so it is the one page allowed any amber, and
 *     only inside a declared surface. Every other full page must contain none at all.
 *
 * The route counts come from the registry import, never from a literal: a test that
 * hard-codes six would keep passing after someone promotes a chapter framework, which is
 * exactly the drift `generateStaticParams` exists to prevent.
 */

const FULL = frameworksByDepth('full');
const FULL_SLUGS = FULL.map((f) => f.slug);
const CHAPTER = FRAMEWORKS.filter((f) => f.depth === 'chapter');

/** `--constraint` is #E8A845. Computed styles report it as this triplet. */
const AMBER = '232, 168, 69';

/** Chromium probes `/favicon.ico` on its own; the static export has none until S6. */
const IGNORED_ERROR =
  /favicon\.ico|Failed to load resource: the server responded with a status of 404/;

function collectConsoleErrors(page: Page, allow?: RegExp): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() !== 'error') return;
    if (IGNORED_ERROR.test(text) || allow?.test(text)) return;
    errors.push(`console.error: ${text}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** Per-page emulation: the `test.use` fixture form silently does not take here. */
async function reduceMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  const viewport = page.viewportSize()?.height ?? 720;
  for (let y = 0; y < height; y += Math.floor(viewport * 0.6)) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
}

interface FigureAudit {
  /** Text carrying a digit that sits outside any claim block. Ruling 4, mechanised. */
  unsourced: string[];
  /** Digit-bearing text that is correctly inside one — the guard against a vacuous pass. */
  sourced: number;
  claims: number;
  /** Claim blocks that cannot answer "where did this come from?". */
  claimsWithoutEvidence: number;
}

async function figureAudit(page: Page): Promise<FigureAudit> {
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="explore-body"]');
    if (!root) {
      return { unsourced: ['no explore body on the page'], sourced: 0, claims: 0, claimsWithoutEvidence: -1 };
    }
    const unsourced: string[] = [];
    let sourced = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const text = walker.currentNode.nodeValue ?? '';
      if (!/\d/.test(text)) continue;
      if (walker.currentNode.parentElement?.closest('[data-claim]')) {
        sourced += 1;
        continue;
      }
      unsourced.push(text.trim().slice(0, 60));
    }
    const claimBlocks = Array.from(root.querySelectorAll('[data-claim]'));
    return {
      unsourced,
      sourced,
      claims: claimBlocks.length,
      claimsWithoutEvidence: claimBlocks.filter(
        (el) => el.querySelectorAll('[data-component="evidence-ref"]').length === 0,
      ).length,
    };
  });
}

async function expectEveryFigureSourced(page: Page) {
  const audit = await figureAudit(page);
  expect(audit.unsourced, 'figures in the explore section with no source object').toEqual([]);
  expect(audit.claims, 'the explore section should be built from claim blocks').toBeGreaterThan(3);
  expect(audit.sourced, 'the sweep found no figures at all — it is not looking at anything').toBeGreaterThan(0);
  expect(audit.claimsWithoutEvidence, 'claim blocks citing nothing').toBe(0);
}

async function amberAudit(page: Page) {
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
    return hits;
  }, AMBER);
}

/* ------------------------------------------------------------------- routes */

test.describe('the route is the registry', () => {
  test('exactly the full-depth frameworks are exported, and chapters are not', async ({
    request,
  }) => {
    expect(FULL_SLUGS, 'v1 ships six full frameworks (00-LAW Ruling 3)').toHaveLength(6);

    for (const slug of FULL_SLUGS) {
      const response = await request.get(`/frameworks/${slug}`);
      expect(response.status(), `/frameworks/${slug} should be exported`).toBe(200);
    }

    // Chapter pages are S6's. Until then the export must not emit them at all — a stub
    // would be a promise the site cannot keep.
    const chapter = CHAPTER[0];
    expect(chapter, 'the registry no longer has any chapter frameworks').toBeTruthy();
    const missing = await request.get(`/frameworks/${chapter?.slug}`);
    expect(missing.status(), `/frameworks/${chapter?.slug} should not exist yet`).toBe(404);
  });

  test('every full page renders its registry signature and its share row', async ({ page }) => {
    for (const framework of FULL) {
      await page.goto(`/frameworks/${framework.slug}`);
      await expect(page.getByTestId('framework-page-root')).toHaveAttribute(
        'data-framework',
        framework.id,
      );
      const panel = page.getByTestId('state-panel');
      await expect(panel).toHaveCount(1);
      // Reads and writes are the record's, printed with the STATE_FIELDS labels.
      for (const field of framework.readsFrom) {
        await expect(panel.locator(`[data-state-field="${field}"]`).first()).toHaveCount(1);
      }
      await expect(page.getByTestId('share-row')).toHaveCount(1);
      await expect(page.locator('[data-component="waitlist-bar"]')).toHaveCount(1);
    }
  });
});

/* ---------------------------------------------------------------------- bmc */

test.describe('/frameworks/bmc', () => {
  test('the showpiece performs, the prediction pays off, and every figure is sourced', async ({
    page,
  }) => {
    // This is the one walk that scrubs the act, so it is the one walk that carries the
    // exemption above. Every other page here asserts a completely clean console.
    const errors = collectConsoleErrors(page);
    await page.goto('/frameworks/bmc');

    // 1 · the animated explanation, act-pinned on the example company.
    const showpiece = page.getByTestId('showpiece');
    await expect(showpiece).toHaveAttribute('data-showpiece', 'fw/bmc-assemble');
    await expect(page.locator('[data-recipe="fw/bmc-assemble"]')).toHaveCount(1);
    const act = page.locator('[data-act="explain"]');
    await expect(act).toHaveAttribute('data-pinned', 'true');

    // Scrubbing the act advances the assembly — the diagram teaches, it does not decorate.
    const canvas = page.locator('[data-recipe="fw/bmc-assemble"]');
    await canvas.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    const early = Number(await canvas.getAttribute('data-step'));
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.4));
    // Polled rather than slept: the act is scroll-bound, and Lenis settles on its own clock.
    await expect
      .poll(async () => Number(await canvas.getAttribute('data-step')), { timeout: 5_000 })
      .toBeGreaterThan(early);

    // 2 · the lesson, with its one pull-quote-worthy line (03-content-spec voice).
    await expect(page.locator('#learn [data-pullquote]')).toHaveCount(1);

    // 3 · predict → reveal → compare.
    const prompt = page.locator('[data-component="prediction-prompt"]');
    await prompt.scrollIntoViewIfNeeded();
    await expect(prompt.locator('[data-reveal="true"]')).toHaveCount(0);
    await page.getByRole('radio', { name: /Key resources and revenue streams/i }).click();
    const reveal = prompt.locator('[data-reveal="true"]');
    await expect(reveal).toBeVisible();
    await expect(reveal).toContainText(/you called it/i);
    await expect(reveal.locator('[data-claim]').first()).toBeVisible();

    // The interaction: change an input, dependants flag stale, downstream frameworks with it.
    const explorer = page.getByTestId('bmc-explorer');
    await explorer.scrollIntoViewIfNeeded();
    await expect(explorer).toHaveAttribute('data-stale-blocks', '0');
    await explorer.locator('[data-toggle="seg-property"]').click();
    await expect(explorer).not.toHaveAttribute('data-stale-blocks', '0');
    await expect(explorer.locator('[data-canvas-block="cs"]')).toHaveAttribute('data-stale', 'true');
    await expect(explorer.locator('[data-canvas-block="kp"]')).toHaveAttribute('data-stale', 'false');
    // The change reached the graph, not just the diagram.
    await expect(explorer.locator('[data-stale-framework]').first()).toBeVisible();
    await explorer.getByTestId('bmc-rerun').click();
    await expect(explorer).toHaveAttribute('data-stale-blocks', '0');

    // Compare lenses — same company, two blocks.
    const lens = page.locator('[data-component="lens-switch"]');
    await lens.scrollIntoViewIfNeeded();
    await lens.getByRole('tab', { name: /as delivered/i }).click();
    await expect(lens.getByRole('tab', { name: /as delivered/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Ruling 4, swept after every reveal: no figure without a source, no claim without evidence.
    await expectEveryFigureSourced(page);

    // An evidence chip really opens onto its authored object.
    const chip = page.getByTestId('explore-body').locator('[data-component="evidence-ref"] button').first();
    await chip.click();
    await expect(page.getByRole('dialog').first()).toBeVisible();
    await page.keyboard.press('Escape');

    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('the handoff carries the example company and its state in the URL', async ({ page }) => {
    await page.goto('/frameworks/bmc');
    const link = page.locator('[data-handoff-link][data-recommended="true"]').first();
    await link.scrollIntoViewIfNeeded();
    const href = await link.getAttribute('href');
    expect(href, 'the handoff link should carry state').toBeTruthy();
    expect(href).toContain('company=beacon-mechanical');
    expect(href).toContain('from=bmc');
    expect(href).toContain('carries=');

    // And the receiving page reads it back — the round trip is the point of the section.
    await link.click();
    await expect(page).toHaveURL(/from=bmc/);
    const banner = page.getByTestId('incoming-state');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Business Model Canvas');
    await expect(banner).toContainText('Beacon Mechanical');
  });

  test('a mangled handoff URL is dropped rather than repeated back', async ({ page }) => {
    // Query strings are hostile input on a static export: nothing validated them upstream.
    await page.goto('/frameworks/five-forces?company=not-a-company&from=raci&carries=nonsense');
    await expect(page.getByTestId('framework-page-root')).toBeVisible();
    await expect(page.getByTestId('incoming-state')).toHaveCount(0);
  });

  test('reduced motion renders the terminal state, not a frozen first frame', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await reduceMotion(page);
    await page.goto('/frameworks/bmc');
    expect(
      await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches),
      'reduced-motion emulation did not take',
    ).toBe(true);

    const act = page.locator('[data-act="explain"]');
    await expect(act).toHaveAttribute('data-pinned', 'false');
    const ratio = await act.evaluate((el) => el.getBoundingClientRect().height / window.innerHeight);
    expect(ratio, 'a reduced-motion act reads as a document').toBeLessThan(1.5);

    const canvas = page.locator('[data-recipe="fw/bmc-assemble"]');
    await expect(canvas).toBeVisible();
    await canvas.scrollIntoViewIfNeeded();
    await expect
      .poll(
        async () =>
          canvas
            .locator('[data-block]')
            .evaluateAll((els) => els.every((el) => el.getAttribute('data-filled') === 'true')),
        { timeout: 5_000 },
      )
      .toBe(true);
    expect(Number(await canvas.evaluate((el) => getComputedStyle(el).opacity))).toBeGreaterThan(0.98);

    await scrollThrough(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('contains no amber at all — this page has no constraint to name', async ({ page }) => {
    await page.goto('/frameworks/bmc');
    await scrollThrough(page);
    const hits = await amberAudit(page);
    expect(
      hits.map((h) => `${h.path}.${h.prop}`),
      'amber on a page that has not earned it',
    ).toEqual([]);
    await expect(page.locator('[data-amber-surface]')).toHaveCount(0);
  });
});

/* ------------------------------------------------------ theory of constraints */

test.describe('/frameworks/theory-of-constraints', () => {
  test('the set narrows to one, and the verdict is where the amber lands', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/frameworks/theory-of-constraints');

    const showpiece = page.getByTestId('showpiece');
    await expect(showpiece).toHaveAttribute('data-showpiece', 'fw/toc-flow');
    await expect(page.locator('[data-recipe="fw/toc-flow"]')).toHaveCount(1);
    await expect(page.locator('#learn [data-pullquote]')).toHaveCount(1);

    // The lesson of the recipe itself: a non-constraint intervention changes nothing.
    const flow = page.locator('[data-recipe="fw/toc-flow"]');
    await flow.scrollIntoViewIfNeeded();
    const readout = flow.locator('[aria-live="polite"]');
    await flow.getByRole('button', { name: /automate invoicing/i }).click();
    await expect(readout).toContainText(/never the limit/i);
    await flow.getByRole('button', { name: /fourth crew/i }).click();
    await expect(readout).toContainText(/touched the constraint/i);

    // Predict, then narrow the set by hand.
    const prompt = page.locator('[data-component="prediction-prompt"]');
    await prompt.scrollIntoViewIfNeeded();
    await page.getByRole('radio', { name: /Installation capacity/i }).click();
    await expect(prompt.locator('[data-reveal="true"]')).toContainText(/you called it/i);

    const narrowing = page.getByTestId('constraint-narrowing');
    await narrowing.scrollIntoViewIfNeeded();
    await expect(narrowing).toHaveAttribute('data-remaining', '5');
    await expect(page.getByTestId('narrowing-verdict')).toHaveCount(0);

    const candidates = ['demand', 'concentration', 'equipment', 'approvals', 'capacity'];
    for (const id of candidates) {
      await narrowing.locator(`[data-test-candidate="${id}"]`).click();
      await expect(narrowing.locator(`[data-candidate="${id}"] [data-claim]`).first()).toBeVisible();
    }
    await expect(narrowing).toHaveAttribute('data-remaining', '1');
    await expect(narrowing).toHaveAttribute('data-settled', 'true');
    await expect(narrowing.locator('[data-candidate="capacity"]')).toHaveAttribute(
      'data-outcome',
      'binding',
    );

    const verdict = page.getByTestId('constraint-verdict');
    await expect(verdict).toBeVisible();
    await expect(verdict).toContainText(/implementation capacity/i);
    await expect(verdict.locator('[data-component="constraint-badge"]')).toBeVisible();

    await expectEveryFigureSourced(page);

    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('amber appears only inside a declared constraint surface', async ({ page }) => {
    await page.goto('/frameworks/theory-of-constraints');
    await scrollThrough(page);

    // Settle the narrowing so the verdict — the page's authored amber — is on screen too.
    const narrowing = page.getByTestId('constraint-narrowing');
    await narrowing.scrollIntoViewIfNeeded();
    for (const id of ['demand', 'concentration', 'equipment', 'approvals', 'capacity']) {
      await narrowing.locator(`[data-test-candidate="${id}"]`).click();
    }
    await expect(page.getByTestId('constraint-verdict')).toBeVisible();

    const audit = await amberAudit(page);
    // Guard against a vacuous pass: this page must actually be wearing amber somewhere.
    expect(audit.length, 'no amber found at all — the audit is not looking at anything').toBeGreaterThan(0);
    const violations = audit.filter((h) => !h.allowed);
    expect(
      violations.map((v) => `${v.path}.${v.prop}`),
      'amber outside a constraint surface',
    ).toEqual([]);

    // And the surfaces are exactly the three sanctioned ones: the recipe's computed stage,
    // the badge that names it, and the verdict that closes the elimination.
    const surfaces = await page
      .locator('[data-amber-surface]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-amber-surface')));
    expect(new Set(surfaces)).toEqual(new Set(['toc', 'badge', 'verdict']));
  });

  test('renders complete under reduced motion, with no console errors', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await reduceMotion(page);
    await page.goto('/frameworks/theory-of-constraints');
    await expect(page.locator('[data-act="explain"]')).toHaveAttribute('data-pinned', 'false');
    const flow = page.locator('[data-recipe="fw/toc-flow"]');
    await expect(flow).toBeVisible();
    await flow.scrollIntoViewIfNeeded();
    // The narrow stage is found on the first frame — the diagnosis does not need the animation.
    await expect(flow.locator('[data-stage][data-constraint="true"]')).toHaveCount(1);
    await scrollThrough(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });
});
