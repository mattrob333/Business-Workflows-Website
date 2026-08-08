import { expect, test, type Page } from '@playwright/test';
import { runById } from '../src/registry/index';

/**
 * S5 walk — *Find What Matters Now*, the flagship scripted Strategy Run.
 *
 * 04-phases S5 "done means": *a first-time visitor completes it in 12–18 min; every step
 * interactive; resumable by URL.* The first is a design budget rather than an assertion; the
 * other two are mechanised here, along with the three laws a run of this size is most likely to
 * break:
 *
 *   - **Ruling 4, the simulation label** — the `SIMULATION` chip is pinned in the header for the
 *     entire run, not just at the top of step one.
 *   - **Ruling 4, the evidence rule** — every figure in a step's analysis panel sits inside a
 *     claim block that names its source. Swept from the DOM, after the interactions have run, so
 *     revealed content is covered too.
 *   - **Ruling 2 / team rule 3, the amber law** — the run has exactly one constraint to name, so
 *     it wears amber at exactly one step, inside declared surfaces. Every step before it must
 *     contain none at all, and the assertion is a set comparison rather than a count so that a
 *     new amber-bearing surface fails loudly instead of blending in.
 *
 * The step count comes from the registry, never from a literal: a walk that hard-coded twelve
 * would keep passing after somebody re-scripted the run.
 */

const RUN = runById('find-what-matters-now');
const PATH = '/runs/find-what-matters-now';
const TOTAL = RUN.steps.length;

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

async function reduceMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

/** Land on a step by URL alone. The run must not need any other state to be correct. */
async function open(page: Page, step?: number) {
  await page.goto(step === undefined ? PATH : `${PATH}?step=${step}`);
  await expect(page.getByTestId('run-root')).toHaveAttribute(
    'data-step',
    String(step ?? 1),
  );
  // One step is mounted at a time once hydrated.
  await expect.poll(async () => page.locator('[data-run-step]').count()).toBe(1);
}

/**
 * Drive whichever of the six §9 mechanics this step carries, and report that it registered.
 * The uniform `data-run-interaction` / `data-interacted` contract is what lets one helper
 * cover twelve steps without a per-step table of selectors.
 */
async function interact(page: Page): Promise<string> {
  const island = page.locator('[data-run-interaction]').first();
  await expect(island).toHaveCount(1);
  const kind = (await island.getAttribute('data-run-interaction')) ?? '';
  await island.scrollIntoViewIfNeeded();

  switch (kind) {
    case 'prediction': {
      await island.getByRole('radio').first().click();
      await expect(island.locator('[data-reveal="true"]')).toBeVisible();
      break;
    }
    case 'lens-compare': {
      const tabs = island.getByRole('tab');
      await tabs.nth(1).click();
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
      break;
    }
    case 'assumption-slider': {
      const slider = island.locator('input[type="range"]').first();
      await slider.fill('0');
      await expect(island.locator('[data-implication]')).toBeVisible();
      break;
    }
    case 'consequence': {
      await island.locator('[data-consequence-pick]').first().click();
      await expect(island.locator('[data-consequence][data-open="true"]').first()).toBeVisible();
      break;
    }
    case 'event-injection': {
      await page.getByTestId('inject-event').click();
      await expect(page.getByTestId('event-injection')).toHaveAttribute('data-injected', 'true');
      break;
    }
    case 'replay': {
      await page.getByTestId('replay-routing').click();
      await expect(page.getByTestId('run-recap')).toBeVisible();
      break;
    }
    default:
      throw new Error(`unknown run interaction: "${kind}"`);
  }

  await expect(island).toHaveAttribute('data-interacted', 'true');
  return kind;
}

/** Ruling 4, mechanised: a digit in an analysis panel must sit inside a sourced claim block. */
async function figureAudit(page: Page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="run-analysis"]');
    if (!root) return { unsourced: ['no analysis panel on this step'], sourced: 0, claims: 0, claimsWithoutEvidence: -1 };
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

const railCount = async (page: Page): Promise<number> =>
  Number(await page.getByTestId('state-rail').getAttribute('data-fields'));

/* ------------------------------------------------------------------ the route */

test.describe('the run loads and labels itself', () => {
  test('opens at step one with the simulation chip pinned across every step', async ({ page }) => {
    await open(page);

    await expect(page.getByTestId('run-step-title-1')).toBeVisible();
    const chip = page.getByTestId('simulation-chip');
    await expect(chip).toBeVisible();
    await expect(chip).toHaveText(/simulation/i);

    // Ruling 4: the label cannot scroll out of the argument. The header is sticky, so the chip
    // is still in the viewport at the bottom of a step and at every step after it.
    for (const step of [1, 6, TOTAL]) {
      await open(page, step);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(150);
      await expect(chip, `simulation chip lost at step ${step}`).toBeInViewport();
      const header = page.getByTestId('run-header');
      expect(await header.evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
    }
  });

  test('the run is one exported document with a step query, not twelve routes', async ({
    request,
  }) => {
    expect((await request.get(PATH)).status()).toBe(200);
    expect((await request.get(`${PATH}?step=9`)).status()).toBe(200);
    // A step outside the script is clamped rather than 404ing — query strings are hostile input.
    expect((await request.get(`${PATH}?step=99`)).status()).toBe(200);
  });

  test('a nonsense step parameter lands on step one instead of breaking', async ({ page }) => {
    for (const raw of ['nonsense', '0', '-4', '99']) {
      await page.goto(`${PATH}?step=${raw}`);
      const step = Number(await page.getByTestId('run-root').getAttribute('data-step'));
      expect(step, `?step=${raw}`).toBeGreaterThanOrEqual(1);
      expect(step).toBeLessThanOrEqual(TOTAL);
      await expect(page.locator('[data-run-step]')).toHaveCount(1);
    }
  });
});

/* --------------------------------------------------------------- URL resume */

test.describe('resumable by URL', () => {
  test('landing at step seven shows the first six steps’ writes, with nothing stored', async ({
    page,
  }) => {
    await open(page, 7);

    // The rail's contents are a pure function of the step number.
    const rows = page.locator('[data-rail-row]');
    const steps = await rows.evaluateAll((els) =>
      els.map((el) => Number(el.getAttribute('data-rail-step'))),
    );
    expect(steps.length).toBeGreaterThan(0);
    expect(Math.min(...steps)).toBe(1);
    expect(steps.filter((s) => s > 7)).toEqual([]);
    // Steps one to six are committed; step seven's own writes are pending until it is done.
    const committed = await page.locator('[data-rail-state="committed"]').count();
    const pending = await page.locator('[data-rail-state="pending"]').count();
    expect(committed).toBeGreaterThan(0);
    expect(pending).toBeGreaterThan(0);
    expect(await railCount(page)).toBe(committed);

    // No browser storage is read or written — the resume cannot silently depend on it.
    const storage = await page.evaluate(() => ({
      local: window.localStorage.length,
      session: window.sessionStorage.length,
    }));
    expect(storage).toEqual({ local: 0, session: 0 });

    // A second visitor with a clean context sees exactly the same save file.
    const before = await rows.count();
    await page.context().clearCookies();
    await open(page, 7);
    expect(await rows.count()).toBe(before);
  });

  test('navigating writes the step to the URL, and back walks the run backwards', async ({
    page,
  }) => {
    await open(page);
    await page.getByTestId('run-next').click();
    await expect(page).toHaveURL(/\?step=2/);
    await expect(page.getByTestId('run-root')).toHaveAttribute('data-step', '2');

    await page.locator('[data-step-link="5"]').click();
    await expect(page).toHaveURL(/\?step=5/);

    await page.goBack();
    await expect(page.getByTestId('run-root')).toHaveAttribute('data-step', '2');
    await page.goForward();
    await expect(page.getByTestId('run-root')).toHaveAttribute('data-step', '5');
  });
});

/* --------------------------------------------------------- every step interacts */

test.describe('every step is interactive', () => {
  for (const record of RUN.steps) {
    test(`step ${record.n} · ${record.title} · ${record.interaction}`, async ({ page }) => {
      await open(page, record.n);

      await expect(page.locator(`[data-run-step="${record.n}"]`)).toHaveAttribute(
        'data-framework',
        record.framework,
      );

      const before = await railCount(page);
      const kind = await interact(page);
      expect(kind, 'the island must carry the mechanic the registry declares').toBe(
        record.interaction,
      );

      // The step's own writes land in the rail the moment the interaction is completed —
      // motion/ingest, and the reason the rail feels earned rather than scripted.
      await expect
        .poll(async () => railCount(page))
        .toBe(before + record.stateOut.length);
      await expect(page.locator('[data-rail-state="pending"]')).toHaveCount(0);

      // Ruling 4, swept after the reveal so revealed content is covered.
      const audit = await figureAudit(page);
      expect(audit.unsourced, `unsourced figures in step ${record.n}`).toEqual([]);
      expect(audit.claims, `step ${record.n} should reason in claim blocks`).toBeGreaterThan(0);
      expect(audit.claimsWithoutEvidence, `claim blocks citing nothing in step ${record.n}`).toBe(0);
    });
  }

  test('the step-nine event injection lights the re-runs and leaves the rest dark', async ({
    page,
  }) => {
    await open(page, 9);
    const island = page.getByTestId('event-injection');
    await island.scrollIntoViewIfNeeded();

    // Before the event, nothing is lit and nothing has a verdict.
    await expect(island).toHaveAttribute('data-lit', '0');
    await expect(island.locator('[data-event-edge][data-lit="true"]')).toHaveCount(0);
    await expect(island.locator('[data-event-verdict]')).toHaveCount(0);

    // Marking is free and reversible.
    await island.locator('[data-event-mark="bmc"]').click();
    await expect(island).toHaveAttribute('data-marked', '1');
    await island.locator('[data-event-mark="bmc"]').click();
    await expect(island).toHaveAttribute('data-marked', '0');

    await page.getByTestId('inject-event').click();

    const lit = island.locator('[data-event-edge][data-lit="true"]');
    const dark = island.locator('[data-event-edge][data-lit="false"]');
    await expect(lit).toHaveCount(3);
    await expect(dark).toHaveCount(4);
    for (const id of ['five-forces', 'swot', 'tows']) {
      await expect(island.locator(`[data-event-edge="${id}"]`)).toHaveAttribute('data-lit', 'true');
      await expect(island.locator(`[data-event-node="${id}"]`)).toHaveAttribute('data-state', 'rerun');
    }
    // The negative space is the finding: the conductor does not re-run, and says why.
    for (const id of ['bmc', 'vrio', 'theory-of-constraints', 'raci']) {
      await expect(island.locator(`[data-event-node="${id}"]`)).toHaveAttribute(
        'data-state',
        'unchanged',
      );
      await expect(island.locator(`[data-event-verdict="${id}"] [data-claim]`).first()).toBeVisible();
    }
    await expect(page.getByTestId('injection-settled')).toBeVisible();
  });

  test('the step-three slider moves the implication and never moves the invariant', async ({
    page,
  }) => {
    await open(page, 3);
    const island = page.getByTestId('assumption-slider');
    await island.scrollIntoViewIfNeeded();
    await expect(island).toHaveAttribute('data-baseline', 'true');
    await expect(island).toHaveAttribute('data-stop', 'pack');

    const invariant = page.getByTestId('assumption-invariant');
    const invariantText = await invariant.innerText();

    const slider = island.locator('input[type="range"]').first();
    await slider.fill('0');
    await expect(island).toHaveAttribute('data-stop', 'diffuse');
    await expect(island).toHaveAttribute('data-baseline', 'false');
    await expect(island.locator('[data-implication="diffuse"]')).toBeVisible();

    await slider.fill('3');
    await expect(island).toHaveAttribute('data-stop', 'doubled');
    await expect(island.locator('[data-implication="doubled"]')).toBeVisible();

    // The whole point of the mechanic: one panel rewrites itself, the other refuses to.
    expect(await invariant.innerText()).toBe(invariantText);
  });
});

/* ----------------------------------------------------------------- the rail */

test.describe('the state rail accretes', () => {
  test('grows monotonically, and every step contributes', async ({ page }) => {
    let previous = -1;
    for (const record of RUN.steps) {
      await open(page, record.n);
      const count = await railCount(page);
      expect(count, `rail shrank at step ${record.n}`).toBeGreaterThan(previous);
      // Committed rows only — deterministic, and independent of anything the visitor did.
      const expected = RUN.steps
        .filter((s) => s.n < record.n)
        .reduce((sum, s) => sum + s.stateOut.length, 0);
      expect(count, `rail contents at step ${record.n}`).toBe(expected);
      previous = count;
    }
    // By the last step the save file holds every write the run made before it.
    expect(previous).toBeGreaterThan(TOTAL);
  });

  test('a field written twice is a revision, not a silent overwrite', async ({ page }) => {
    await open(page, TOTAL);
    const risks = page.locator('[data-rail-field="risk_register"]');
    await expect(risks).toHaveCount(2);
    await expect(risks.nth(1)).toContainText(/revised/i);
    // Distinct fields are fewer than rows — which is the run being honest about rewriting.
    const rail = page.getByTestId('state-rail');
    const rows = Number(await rail.getAttribute('data-fields'));
    const distinct = Number(await rail.getAttribute('data-distinct-fields'));
    expect(distinct).toBeLessThan(rows);
  });

  test('collapses on a narrow viewport and is scrollable when full', async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 780 });
    await open(page, 8);
    const toggle = page.getByTestId('rail-toggle');
    await expect(toggle).toBeVisible();
    await expect(page.getByTestId('state-rail')).toHaveAttribute('data-open', 'false');
    await toggle.click();
    await expect(page.getByTestId('state-rail')).toHaveAttribute('data-open', 'true');
    const overflow = await page
      .locator('#state-rail-body')
      .evaluate((el) => getComputedStyle(el).overflowY);
    expect(overflow).toBe('auto');
  });
});

/* ------------------------------------------------------------------- amber */

test.describe('the amber law', () => {
  for (const record of RUN.steps.filter((s) => s.n <= 10)) {
    test(`step ${record.n} contains no amber at all`, async ({ page }) => {
      await open(page, record.n);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(120);
      const hits = await amberAudit(page);
      expect(
        hits.map((h) => `${h.path}.${h.prop}`),
        `amber at step ${record.n}, which has no constraint to name`,
      ).toEqual([]);
      await expect(page.locator('[data-amber-surface]')).toHaveCount(0);
    });
  }

  test('step eleven wears amber, and only inside declared constraint surfaces', async ({
    page,
  }) => {
    await open(page, 11);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);

    const audit = await amberAudit(page);
    // Guard against a vacuous pass: this step must actually be wearing amber somewhere.
    expect(audit.length, 'no amber found at all — the audit is not looking at anything').toBeGreaterThan(0);
    expect(
      audit.filter((h) => !h.allowed).map((v) => `${v.path}.${v.prop}`),
      'amber outside a constraint surface',
    ).toEqual([]);

    // Exactly the three sanctioned surfaces: the recipe's computed stage, the badge that names
    // it, and the verdict that closes the diagnosis. A fourth is a review failure, not a nuance.
    const surfaces = await page
      .locator('[data-amber-surface]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-amber-surface')));
    expect(new Set(surfaces)).toEqual(new Set(['toc', 'badge', 'verdict']));

    await expect(page.getByTestId('constraint-verdict')).toContainText(/implementation capacity/i);
    await expect(page.locator('[data-recipe="fw/toc-flow"] [data-stage][data-constraint="true"]')).toHaveCount(1);
  });
});

/* --------------------------------------------------------------- the replay */

test.describe('replay', () => {
  test('replaying a step re-runs its diagram and keeps the answer', async ({ page }) => {
    await open(page, 5);
    await interact(page);
    const island = page.locator('[data-run-interaction]').first();
    await expect(island).toHaveAttribute('data-interacted', 'true');

    await page.getByTestId('replay-step').first().click();
    // The diagram is re-keyed; the commitment is not thrown away.
    await expect(page.locator('[data-recipe="fw/vrio-gates"]')).toBeVisible();
    await expect(island).toHaveAttribute('data-interacted', 'true');
  });

  test('restarting the run resets cleanly to an empty save file', async ({ page }) => {
    await open(page, 4);
    await interact(page);
    expect(await railCount(page)).toBeGreaterThan(0);

    await page.getByTestId('restart-run').first().click();
    await expect(page.getByTestId('run-root')).toHaveAttribute('data-step', '1');
    await expect(page).toHaveURL(/\?step=1/);
    await expect(page.locator('[data-run-step="1"]')).toHaveCount(1);
    // Step one writes nothing until step one is done, so the file is empty again.
    expect(await railCount(page)).toBe(0);
    await expect(page.locator('[data-run-interaction]').first()).toHaveAttribute(
      'data-interacted',
      'false',
    );
  });
});

/* ------------------------------------------------------- the full walk, twice */

test.describe('the walk', () => {
  test('step one to twelve, every interaction, no console errors', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await open(page);

    for (const record of RUN.steps) {
      await expect(page.getByTestId('run-root')).toHaveAttribute('data-step', String(record.n));
      await expect(page.getByTestId('run-step-title-' + record.n)).toBeVisible();
      await interact(page);
      if (record.n < TOTAL) {
        await page.getByTestId(`run-continue-${record.n}`).click();
      }
    }

    // The last step closes on the bridge, in the essay's words (00-LAW Ruling 6).
    const bridge = page.getByTestId('run-bridge');
    await bridge.scrollIntoViewIfNeeded();
    await expect(bridge).toContainText(/Instinct keeps it running/i);
    await expect(page.locator('[data-component="waitlist-bar"]')).toHaveCount(1);
    await expect(page.getByTestId('run-next')).toHaveAttribute('aria-disabled', 'true');

    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('under reduced motion the run still completes, at terminal states', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await reduceMotion(page);
    await open(page);
    expect(
      await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches),
      'reduced-motion emulation did not take',
    ).toBe(true);

    // The recipes arrive finished rather than frozen on their first frame.
    const canvas = page.locator('[data-recipe="fw/bmc-assemble"]');
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

    for (const record of RUN.steps) {
      await open(page, record.n);
      await interact(page);
    }

    await open(page, 11);
    await expect(page.locator('[data-recipe="fw/toc-flow"] [data-stage][data-constraint="true"]')).toHaveCount(1);

    expect(errors, errors.join('\n')).toEqual([]);
  });
});
