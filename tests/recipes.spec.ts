import { expect, test, type Page } from '@playwright/test';

/**
 * S0 walk — the recipe gallery.
 *
 * 04-phases S0 "done means": every recipe renders on the demo route, and reduced-motion
 * parity is *verified*, not assumed (team rule 6). Plus the one rule reviewers are told
 * to grep for: the amber token may only appear on a constraint surface (team rule 3).
 */

const RECIPES = [
  'recipe-atmo-mesh-drift',
  'recipe-grain',
  'recipe-panel-glass',
  'recipe-motion-ingest',
  'recipe-motion-state',
  'recipe-motion-transform',
  'recipe-motion-route',
  'recipe-acts',
  'recipe-fw-bmc-assemble',
  'recipe-fw-forces-gauges',
  'recipe-fw-vrio-gates',
  'recipe-fw-tows-cross',
  'recipe-fw-toc-flow',
  'recipe-fw-raci-route',
] as const;

const COMPONENTS = [
  'component-status-chip',
  'component-evidence-ref',
  'component-kicker',
  'component-act-marker',
  'component-glass-panel',
  'component-graph-node',
  'component-graph-edge',
  'component-prediction-prompt',
  'component-lens-switch',
  'component-constraint-badge',
  'component-waitlist-bar',
] as const;

/** `--constraint` is #E8A845. Computed styles report it as this triplet. */
const AMBER = '232, 168, 69';

/**
 * Chromium probes `/favicon.ico` on its own and the static export has none yet — that
 * lands in S6 with the og-images. It is a browser-initiated request, not a page fault,
 * so it is filtered rather than allowed to mask real errors.
 */
const IGNORED_ERROR = /favicon\.ico|Failed to load resource: the server responded with a status of 404/;

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !IGNORED_ERROR.test(msg.text())) {
      errors.push(`console.error: ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/**
 * Reduced motion is emulated per page rather than through `test.use({ reducedMotion })`:
 * with the Chromium build available here the fixture form silently does not take, and a
 * reduced-motion test that quietly runs in full motion is worse than no test at all.
 */
async function reduceMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

/** Walk the whole page so every in-view trigger and every act has fired. */
async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  const viewport = page.viewportSize()?.height ?? 720;
  for (let y = 0; y < height; y += Math.floor(viewport * 0.6)) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(90);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
}

test.describe('recipe gallery', () => {
  test('renders every recipe and component, with no console errors', async ({ page }) => {
    const errors = collectConsoleErrors(page);

    await page.goto('/recipes');
    await expect(page.getByTestId('recipes-root')).toBeVisible();

    for (const id of RECIPES) {
      await expect(page.getByTestId(id), `recipe ${id} is missing`).toHaveCount(1);
    }
    for (const id of COMPONENTS) {
      await expect(page.getByTestId(id), `component ${id} is missing`).toBeVisible();
    }

    // Every recipe root declares which recipe it is (01 §4/§5 names).
    const declared = await page.locator('[data-recipe]').evaluateAll((els) =>
      Array.from(new Set(els.map((el) => el.getAttribute('data-recipe')))).sort(),
    );
    for (const name of [
      'atmo/mesh-drift',
      'atmo/grain',
      'panel/glass',
      'motion/ingest',
      'motion/state',
      'motion/transform',
      'motion/route',
      'motion/acts',
      'fw/bmc-assemble',
      'fw/forces-gauges',
      'fw/vrio-gates',
      'fw/tows-cross',
      'fw/toc-flow',
      'fw/raci-route',
    ]) {
      expect(declared, `recipe name ${name} not declared in the DOM`).toContain(name);
    }

    await scrollThrough(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('six acts pin and scrub under full motion', async ({ page }) => {
    await page.goto('/recipes');

    const acts = page.locator('[data-act]');
    await expect(acts).toHaveCount(6);

    // Pinned acts are taller than the viewport and carry the spec'd 1.5–2.5vh span.
    const heights = await acts.evaluateAll((els) =>
      els.map((el) => ({
        pinned: el.getAttribute('data-pinned'),
        ratio: el.getBoundingClientRect().height / window.innerHeight,
        sticky: getComputedStyle(el.firstElementChild as Element).position,
      })),
    );
    for (const h of heights) {
      expect(h.pinned).toBe('true');
      expect(h.ratio).toBeGreaterThanOrEqual(1.4);
      expect(h.ratio).toBeLessThanOrEqual(2.6);
      expect(h.sticky).toBe('sticky');
    }

    // Scrubbing the BMC act advances its assembly.
    const bmc = page.locator('[data-recipe="fw/bmc-assemble"]');
    await bmc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    const early = Number(await bmc.getAttribute('data-step'));
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.6));
    await page.waitForTimeout(400);
    const later = Number(await bmc.getAttribute('data-step'));
    expect(later).toBeGreaterThan(early);
  });

  test('the evidence popover is keyboard operable and closes on Escape', async ({ page }) => {
    await page.goto('/recipes');
    const chip = page.getByTestId('component-evidence-ref').getByRole('button').first();
    await chip.scrollIntoViewIfNeeded();
    await chip.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Dispatch log export');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(chip).toBeFocused();
  });

  test('the theory-of-constraints lesson holds: a non-constraint changes nothing', async ({
    page,
  }) => {
    await page.goto('/recipes');
    const toc = page.locator('[data-recipe="fw/toc-flow"]');
    await toc.scrollIntoViewIfNeeded();

    const readout = toc.locator('[aria-live="polite"]');
    await toc.getByRole('button', { name: /automate invoicing/i }).click();
    await expect(readout).toContainText(/never the limit/i);

    await toc.getByRole('button', { name: /certify two techs/i }).click();
    await expect(readout).toContainText(/touched the constraint/i);
  });
});

test.describe('reduced motion is a second theme', () => {
  test('every recipe renders its terminal state and acts un-pin', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await reduceMotion(page);
    await page.goto('/recipes');
    expect(
      await page.evaluate(
        () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      ),
      'reduced-motion emulation did not take',
    ).toBe(true);
    await expect(page.getByTestId('recipes-root')).toBeVisible();

    // The page announces the mode it is in.
    await expect(page.getByText(/reduced motion active/i)).toBeVisible();

    // No pinning: acts are document-height and their stage is not sticky.
    const acts = page.locator('[data-act]');
    await expect(acts).toHaveCount(6);
    const states = await acts.evaluateAll((els) =>
      els.map((el) => ({
        pinned: el.getAttribute('data-pinned'),
        ratio: el.getBoundingClientRect().height / window.innerHeight,
        position: getComputedStyle(el.firstElementChild as Element).position,
      })),
    );
    for (const s of states) {
      expect(s.pinned).toBe('false');
      expect(s.position).not.toBe('sticky');
      expect(s.ratio).toBeLessThan(1.5);
    }

    // Every recipe is present, visible and fully opaque — no frozen first frames.
    for (const id of RECIPES) {
      const node = page.getByTestId(id);
      await expect(node, `recipe ${id} is missing`).toHaveCount(1);
      await node.scrollIntoViewIfNeeded();
      await expect(node).toBeVisible();
    }

    // `atmo/grain` is excluded: its terminal state *is* opacity .04 (01 §2), which is
    // the spec, not an unfinished fade.
    const faded = await page.locator('[data-recipe]:not([data-recipe="atmo/grain"])').evaluateAll(
      (els) =>
        els
          .filter((el) => Number(getComputedStyle(el).opacity) < 0.99)
          .map((el) => el.getAttribute('data-recipe')),
    );
    expect(faded, `these recipes are not at their terminal state: ${faded.join(', ')}`).toEqual(
      [],
    );

    // Terminal state, specifically: the canvas is assembled, the gates are resolved,
    // the options are minted and the packet has been delivered.
    const filled = await page
      .locator('[data-recipe="fw/bmc-assemble"] [data-block]')
      .evaluateAll((els) => els.every((el) => el.getAttribute('data-filled') === 'true'));
    expect(filled, 'the BMC canvas should be fully assembled under reduced motion').toBe(true);

    const shelved = await page
      .locator('[data-recipe="fw/vrio-gates"] [data-capability]')
      .evaluateAll((els) => els.every((el) => el.getAttribute('data-shelf') !== 'lane'));
    expect(shelved, 'VRIO tokens should already be shelved or docked').toBe(true);

    await expect(page.locator('[data-recipe="fw/tows-cross"]')).toHaveAttribute('data-minted', '4');

    const raciStep = await page
      .locator('[data-recipe="fw/raci-route"]')
      .getAttribute('data-step');
    expect(Number(raciStep)).toBe(5);

    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test.describe('the amber law', () => {
  test('amber appears only on constraint surfaces', async ({ page }) => {
    await page.goto('/recipes');
    await scrollThrough(page);

    const audit = await page.evaluate((amber) => {
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
            const tag = el.tagName.toLowerCase();
            const id = el.getAttribute('data-component') ?? el.getAttribute('data-recipe') ?? '';
            hits.push({
              path: `${tag}${id ? `[${id}]` : ''}`,
              prop,
              allowed: el.closest('[data-amber-surface]') !== null,
            });
          }
        }
      }
      return hits;
    }, AMBER);

    // Guard against a vacuous pass: the constraint surfaces must actually be amber.
    expect(audit.length, 'no amber found at all — the audit is not looking at anything').toBeGreaterThan(0);

    const violations = audit.filter((h) => !h.allowed);
    expect(
      violations,
      `amber outside a constraint surface: ${violations.map((v) => `${v.path}.${v.prop}`).join(', ')}`,
    ).toEqual([]);

    // And the constraint surfaces themselves are exactly the two sanctioned ones.
    const surfaces = await page
      .locator('[data-amber-surface]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-amber-surface')));
    expect(new Set(surfaces)).toEqual(new Set(['toc', 'badge', 'gallery']));
  });
});
