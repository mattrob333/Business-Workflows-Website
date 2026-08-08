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

/* ===========================================================================
 * S3-B — the remaining four full pages.
 *
 * Same walk pattern as the two above, four times: the showpiece is bound to the recipe the
 * registry names, the prediction pays off, the explore island actually changes the model,
 * every figure in the section sits inside a claim block, the handoff carries state, and the
 * reduced-motion render is the finished picture rather than a frozen first frame.
 *
 * The amber assertion is repeated per page rather than looped once, deliberately: it is the
 * site's most sacred rule and a per-page failure should name the page that broke it.
 * ======================================================================== */

/** Ruling 2, from the other side: these four have no constraint to name. */
async function expectNoAmber(page: Page) {
  await scrollThrough(page);
  const hits = await amberAudit(page);
  expect(
    hits.map((h) => `${h.path}.${h.prop}`),
    'amber on a page that has not earned it',
  ).toEqual([]);
  await expect(page.locator('[data-amber-surface]')).toHaveCount(0);
}

/* -------------------------------------------------------------- five forces */

test.describe('/frameworks/five-forces', () => {
  test('the assumptions move the ranking, and the delivery rate never moves', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/frameworks/five-forces');

    const showpiece = page.getByTestId('showpiece');
    await expect(showpiece).toHaveAttribute('data-showpiece', 'fw/forces-gauges');
    await expect(page.locator('[data-recipe="fw/forces-gauges"]')).toHaveCount(1);
    await expect(page.locator('#learn [data-pullquote]')).toHaveCount(1);

    // Predict, then read the twist: the strongest force is a real finding and not the limit.
    const prompt = page.locator('[data-component="prediction-prompt"]');
    await prompt.scrollIntoViewIfNeeded();
    await expect(prompt.locator('[data-reveal="true"]')).toHaveCount(0);
    await page.getByRole('radio', { name: /Buyer power/i }).click();
    const reveal = prompt.locator('[data-reveal="true"]');
    await expect(reveal).toContainText(/you called it/i);
    await expect(reveal.locator('[data-claim]').first()).toBeVisible();

    // The island: flip a dated fact around and watch the pressures re-score.
    const flip = page.getByTestId('forces-flip');
    await flip.scrollIntoViewIfNeeded();
    await expect(flip).toHaveAttribute('data-strongest', 'buyers');

    // Supply eases; the ranking survives it, which is what a robust finding looks like.
    await flip.locator('[data-flip="lead-times"]').click();
    await expect(flip.locator('[data-force-row="suppliers"]')).toHaveAttribute('data-moved', 'down');
    await expect(flip).toHaveAttribute('data-strongest', 'buyers');
    await expect(flip.locator('[data-implication="lead-times"]')).toBeVisible();

    // Buyer power eases instead, and the strongest pressure genuinely changes hands.
    await flip.locator('[data-flip="lead-times"]').click();
    await flip.locator('[data-flip="multi-year"]').click();
    await expect(flip).toHaveAttribute('data-strongest', 'suppliers');

    const lens = page.locator('[data-component="lens-switch"]');
    await lens.scrollIntoViewIfNeeded();
    await lens.getByRole('tab', { name: /ceiling on volume/i }).click();
    await expect(lens.getByRole('tab', { name: /ceiling on volume/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await expectEveryFigureSourced(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('the handoff carries the example company and its state in the URL', async ({ page }) => {
    await page.goto('/frameworks/five-forces');
    const link = page.locator('[data-handoff-link][data-recommended="true"]').first();
    await link.scrollIntoViewIfNeeded();
    const href = await link.getAttribute('href');
    expect(href).toContain('company=beacon-mechanical');
    expect(href).toContain('from=five-forces');
    expect(href).toContain('carries=');

    await link.click();
    await expect(page).toHaveURL(/from=five-forces/);
    const banner = page.getByTestId('incoming-state');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Five Forces');
    await expect(banner).toContainText('Beacon Mechanical');
  });

  test('reduced motion renders every wedge at its final geometry', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await reduceMotion(page);
    await page.goto('/frameworks/five-forces');
    await expect(page.locator('[data-act="explain"]')).toHaveAttribute('data-pinned', 'false');

    const gauges = page.locator('[data-recipe="fw/forces-gauges"]');
    await expect(gauges).toBeVisible();
    await gauges.scrollIntoViewIfNeeded();
    // Five wedges plus the settled reading: the stage reports its terminal step immediately.
    await expect.poll(async () => gauges.getAttribute('data-step'), { timeout: 5_000 }).toBe('5');
    await expect(gauges.locator('[data-force]')).toHaveCount(5);

    await scrollThrough(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('contains no amber at all — the terrain is not the constraint', async ({ page }) => {
    await page.goto('/frameworks/five-forces');
    await expectNoAmber(page);
  });
});

/* --------------------------------------------------------------------- vrio */

test.describe('/frameworks/vrio', () => {
  test('four capabilities stop at four different gates', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/frameworks/vrio');

    const showpiece = page.getByTestId('showpiece');
    await expect(showpiece).toHaveAttribute('data-showpiece', 'fw/vrio-gates');
    await expect(page.locator('[data-recipe="fw/vrio-gates"]')).toHaveCount(1);
    await expect(page.locator('#learn [data-pullquote]')).toHaveCount(1);

    const prompt = page.locator('[data-component="prediction-prompt"]');
    await prompt.scrollIntoViewIfNeeded();
    await page.getByRole('radio', { name: /Single-approver project control/i }).click();
    await expect(prompt.locator('[data-reveal="true"]')).toContainText(/you called it/i);

    const walk = page.getByTestId('vrio-walk');
    await walk.scrollIntoViewIfNeeded();
    await expect(walk).toHaveAttribute('data-walked', '0');

    // The one presented as a strength does not clear the first gate.
    await walk.locator('[data-gate-pick="approver:v"]').click();
    await expect(walk.locator('[data-candidate="approver"]')).toHaveAttribute(
      'data-outcome',
      'parity',
    );
    await expect(walk.locator('[data-gate="approver:v"]')).toHaveAttribute(
      'data-gate-passed',
      'false',
    );
    await expect(walk.locator('[data-gate="approver:v"] [data-claim]').first()).toBeVisible();
    // The filter stops: the gates after the failure are never asked.
    await expect(walk.locator('[data-gate="approver:r"]')).toHaveCount(0);

    await walk.locator('[data-gate-pick="crews:none"]').click();
    await expect(walk.locator('[data-candidate="crews"]')).toHaveAttribute(
      'data-outcome',
      'sustained',
    );
    await expect(walk.locator('[data-gate="crews:o"]')).toHaveAttribute('data-gate-passed', 'true');

    await walk.locator('[data-gate-pick="estimating:o"]').click();
    await expect(walk.locator('[data-candidate="estimating"]')).toHaveAttribute(
      'data-outcome',
      'uncaptured',
    );
    await expect(walk.locator('[data-gate="estimating:o"]')).toHaveAttribute(
      'data-gate-passed',
      'false',
    );

    await walk.locator('[data-gate-pick="coverage:r"]').click();
    await expect(walk).toHaveAttribute('data-settled', 'true');
    await expect(walk).toHaveAttribute('data-called', '4');

    const lens = page.locator('[data-component="lens-switch"]');
    await lens.scrollIntoViewIfNeeded();
    await lens.getByRole('tab', { name: /as tested/i }).click();
    await expect(lens.getByRole('tab', { name: /as tested/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await expectEveryFigureSourced(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('the handoff carries the example company and its state in the URL', async ({ page }) => {
    await page.goto('/frameworks/vrio');
    const link = page.locator('[data-handoff-link][data-recommended="true"]').first();
    await link.scrollIntoViewIfNeeded();
    const href = await link.getAttribute('href');
    expect(href).toContain('company=beacon-mechanical');
    expect(href).toContain('from=vrio');
    expect(href).toContain('carries=');

    await link.click();
    await expect(page).toHaveURL(/from=vrio/);
    const banner = page.getByTestId('incoming-state');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('VRIO');
    await expect(banner).toContainText('Beacon Mechanical');
  });

  test('reduced motion renders every token already shelved or docked', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await reduceMotion(page);
    await page.goto('/frameworks/vrio');
    await expect(page.locator('[data-act="explain"]')).toHaveAttribute('data-pinned', 'false');

    const gates = page.locator('[data-recipe="fw/vrio-gates"]');
    await expect(gates).toBeVisible();
    await gates.scrollIntoViewIfNeeded();
    await expect
      .poll(
        async () =>
          gates
            .locator('[data-capability]')
            .evaluateAll((els) => els.every((el) => el.getAttribute('data-shelf') !== 'lane')),
        { timeout: 5_000 },
      )
      .toBe(true);
    await expect(gates.locator('[data-shelf="sustained"]')).toHaveCount(1);

    await scrollThrough(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('contains no amber at all — an advantage is not a constraint', async ({ page }) => {
    await page.goto('/frameworks/vrio');
    await expectNoAmber(page);
  });
});

/* ---------------------------------------------------------------- swot/tows */

test.describe('/frameworks/swot-tows', () => {
  test('collection is not generation: most pairings mint nothing', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/frameworks/swot-tows');

    const showpiece = page.getByTestId('showpiece');
    await expect(showpiece).toHaveAttribute('data-showpiece', 'fw/tows-cross');
    await expect(page.locator('[data-recipe="fw/tows-cross"]')).toHaveCount(1);
    await expect(page.locator('#learn [data-pullquote]')).toHaveCount(1);

    const prompt = page.locator('[data-component="prediction-prompt"]');
    await prompt.scrollIntoViewIfNeeded();
    await page
      .getByRole('radio', { name: /Run survey and commissioning off the service book/i })
      .click();
    await expect(prompt.locator('[data-reveal="true"]')).toContainText(/you called it/i);

    const picker = page.getByTestId('tows-picker');
    await picker.scrollIntoViewIfNeeded();
    await expect(picker).toHaveAttribute('data-move', '');

    // A pairing nobody crossed: both entries true, no option minted. That is the lesson.
    await picker.locator('[data-cross-card="s1"]').click();
    await picker.locator('[data-cross-card="t1"]').click();
    await expect(picker).toHaveAttribute('data-move', 'none');
    await expect(picker.locator('[data-minted]')).toHaveCount(0);

    // The one crossing that gives capacity back.
    await picker.locator('[data-cross-card="w2"]').click();
    await picker.locator('[data-cross-card="o2"]').click();
    await expect(picker).toHaveAttribute('data-move', 'WO');
    await expect(picker.locator('[data-minted="WO"]')).toBeVisible();
    await expect(picker.locator('[data-effect="releases"]')).toBeVisible();
    await expect(picker).toHaveAttribute('data-found', '1');
    await expect(picker.locator('[data-minted="WO"] [data-claim]').first()).toBeVisible();

    const lens = page.locator('[data-component="lens-switch"]');
    await lens.scrollIntoViewIfNeeded();
    await lens.getByRole('tab', { name: /as typed/i }).click();
    await expect(lens.getByRole('tab', { name: /as typed/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await expectEveryFigureSourced(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('the handoff carries the example company and its state in the URL', async ({ page }) => {
    await page.goto('/frameworks/swot-tows');
    // SWOT's own bestBefore is TOWS, whose page is S6's — so the linkable edge here is the
    // conductor, and it is correctly not marked as the recommended next step.
    const link = page.locator('[data-handoff-link]').first();
    await link.scrollIntoViewIfNeeded();
    const href = await link.getAttribute('href');
    expect(href).toContain('company=beacon-mechanical');
    expect(href).toContain('from=swot');
    expect(href).toContain('carries=');
    await expect(page.locator('[data-handoff-chapter="tows"]')).toHaveCount(1);

    await link.click();
    await expect(page).toHaveURL(/from=swot/);
    const banner = page.getByTestId('incoming-state');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('SWOT');
    await expect(banner).toContainText('Beacon Mechanical');
  });

  test('reduced motion renders every option already minted', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await reduceMotion(page);
    await page.goto('/frameworks/swot-tows');
    await expect(page.locator('[data-act="explain"]')).toHaveAttribute('data-pinned', 'false');

    const cross = page.locator('[data-recipe="fw/tows-cross"]');
    await expect(cross).toBeVisible();
    await cross.scrollIntoViewIfNeeded();
    // The mint zone is empty by design at rest; under reduced motion it must arrive full.
    await expect.poll(async () => cross.getAttribute('data-minted'), { timeout: 5_000 }).toBe('4');
    await expect(cross.locator('[data-minted="SO"]')).toHaveCount(1);
    await expect(cross.locator('[data-minted="WT"]')).toHaveCount(1);

    await scrollThrough(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('contains no amber at all — the cross generates, it does not diagnose', async ({ page }) => {
    await page.goto('/frameworks/swot-tows');
    await expectNoAmber(page);
  });
});

/* --------------------------------------------------------------------- raci */

test.describe('/frameworks/raci', () => {
  test('an agent can be responsible; accountable stays a named human', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/frameworks/raci');

    const showpiece = page.getByTestId('showpiece');
    await expect(showpiece).toHaveAttribute('data-showpiece', 'fw/raci-route');
    await expect(page.locator('[data-recipe="fw/raci-route"]')).toHaveCount(1);
    await expect(page.locator('#learn [data-pullquote]')).toHaveCount(1);

    const prompt = page.locator('[data-component="prediction-prompt"]');
    await prompt.scrollIntoViewIfNeeded();
    await page.getByRole('radio', { name: /Re-sequencing the dispatch board/i }).click();
    await expect(prompt.locator('[data-reveal="true"]')).toContainText(/you called it/i);

    const routing = page.getByTestId('raci-routing');
    await routing.scrollIntoViewIfNeeded();
    await expect(routing).toHaveAttribute('data-compared', '0');

    // Packet one, routed the way the pack routes it.
    await routing.locator('[data-assign="rebook:R:scheduler"]').click();
    await routing.locator('[data-assign="rebook:A:pm"]').click();
    await routing.locator('[data-compare="rebook"]').click();
    await expect(routing.locator('[data-packet="rebook"]')).toHaveAttribute('data-compared', 'true');
    await expect(routing.locator('[data-verdict="rebook:R"]')).toHaveAttribute('data-matched', 'true');
    await expect(routing.locator('[data-verdict="rebook:A"]')).toHaveAttribute('data-matched', 'true');

    // Packet two, routed the way this framework refuses: accountability to an agent.
    await routing.locator('[data-assign="approve:R:intake-agent"]').click();
    await routing.locator('[data-assign="approve:A:intake-agent"]').click();
    await routing.locator('[data-compare="approve"]').click();
    await expect(routing.locator('[data-verdict="approve:A"]')).toHaveAttribute(
      'data-matched',
      'false',
    );
    await expect(routing.getByText(/one assignment this model refuses/i)).toBeVisible();
    await expect(routing).toHaveAttribute('data-settled', 'true');

    const lens = page.locator('[data-component="lens-switch"]');
    await lens.scrollIntoViewIfNeeded();
    await lens.getByRole('tab', { name: /as routed/i }).click();
    await expect(lens.getByRole('tab', { name: /as routed/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await expectEveryFigureSourced(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('the handoff carries the example company and its state in the URL', async ({ page }) => {
    await page.goto('/frameworks/raci');
    // RACI's recommended next step is the Balanced Scorecard, a chapter page until S6, so the
    // walkable edge is the one back into the conductor.
    const link = page.locator('[data-handoff-link]').first();
    await link.scrollIntoViewIfNeeded();
    const href = await link.getAttribute('href');
    expect(href).toContain('company=beacon-mechanical');
    expect(href).toContain('from=raci');
    expect(href).toContain('carries=');

    await link.click();
    await expect(page).toHaveURL(/from=raci/);
    const banner = page.getByTestId('incoming-state');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('RACI');
    await expect(banner).toContainText('Beacon Mechanical');
  });

  test('reduced motion renders the packet delivered and the signature drawn', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await reduceMotion(page);
    await page.goto('/frameworks/raci');
    await expect(page.locator('[data-act="explain"]')).toHaveAttribute('data-pinned', 'false');

    const route = page.locator('[data-recipe="fw/raci-route"]');
    await expect(route).toBeVisible();
    await route.scrollIntoViewIfNeeded();
    // Five nodes plus the pause: the stop is recorded in the picture rather than merely
    // having happened, which is the whole reduced-motion contract for this recipe.
    await expect.poll(async () => route.getAttribute('data-step'), { timeout: 5_000 }).toBe('5');
    await expect(route.locator('[data-component="graph-node"]')).toHaveCount(5);

    await scrollThrough(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('contains no amber at all — the stop is a design, not a diagnosis', async ({ page }) => {
    await page.goto('/frameworks/raci');
    await expectNoAmber(page);
  });
});
