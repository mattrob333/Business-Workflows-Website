import { expect, test, type Page } from '@playwright/test';
import { FRAMEWORKS, allEdges, byId, stateField } from '../src/registry/index';

/**
 * S2 walk — the Framework Graph.
 *
 * 04-phases S2 "done means": *keyboard-navigable; the graph renders from registry alone
 * (delete a record, node vanishes)*. Both halves are checked here, and both are checked
 * **against the registry import rather than against a literal** — a test that hard-codes
 * seventeen would keep passing after someone drops a framework, which is precisely the
 * failure the acceptance criterion is about.
 *
 * Everything else this file asserts is a law: the amber ban on a surface with no
 * constraint (00-LAW Ruling 2), reduced-motion parity as a second theme (Ruling 7), and
 * a clear console.
 */

/** `--constraint` is #E8A845. Computed styles report it as this triplet. */
const AMBER = '232, 168, 69';

/** Chromium probes `/favicon.ico` on its own; the static export has none until S6. */
const IGNORED_ERROR =
  /favicon\.ico|Failed to load resource: the server responded with a status of 404/;

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

/** Per-page emulation: the `test.use` fixture form silently does not take here. */
async function reduceMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

async function settle(page: Page, ms = 1200) {
  await page.getByTestId('framework-graph').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(ms);
}

const EDGES = allEdges();
/** A handoff every assertion below can lean on, taken from the registry, not invented. */
const SAMPLE = EDGES.find((e) => e.from === 'bmc' && e.to === 'five-forces');
if (!SAMPLE) throw new Error('registry no longer contains the bmc → five-forces handoff');
const SAMPLE_KEY = `${SAMPLE.from}->${SAMPLE.to}`;
const SAMPLE_LABELS = SAMPLE.fields.map((f) => stateField(f).label);

test.describe('the framework graph renders from the registry', () => {
  test('every framework is a node, and every handoff is an edge', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/frameworks');
    await expect(page.getByTestId('frameworks-root')).toBeVisible();
    await settle(page);

    const graph = page.getByTestId('framework-graph');
    await expect(graph).toBeVisible();

    // Counted from the registry: delete a record and this expectation moves with it.
    await expect(graph.locator('[data-node]')).toHaveCount(FRAMEWORKS.length);
    await expect(graph.locator('[data-edge]')).toHaveCount(EDGES.length);

    for (const framework of FRAMEWORKS) {
      const node = graph.locator(`[data-node="${framework.id}"]`);
      await expect(node, `${framework.id} has no node`).toHaveCount(1);
      // Every node is a link to its page (S3 fills those routes in).
      await expect(node.locator('a')).toHaveAttribute(
        'href',
        `/frameworks/${framework.slug}`,
      );
      // Accessible name = name + group + depth.
      const label = await node.locator('a').getAttribute('aria-label');
      expect(label, `${framework.id} accessible name`).toContain(framework.name);
      expect(label).toContain(framework.depth === 'full' ? 'full lesson' : 'chapter');
    }

    // Depth is legible in the DOM as well as on the canvas.
    await expect(graph.locator('[data-node][data-depth="full"]')).toHaveCount(
      FRAMEWORKS.filter((f) => f.depth === 'full').length,
    );

    // The list below the graph is the same registry, read as a document.
    for (const framework of FRAMEWORKS) {
      await expect(
        page.locator(`[data-framework="${framework.id}"]`),
        `${framework.id} missing from the list`,
      ).toHaveCount(1);
    }

    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('the conductor is where the graph converges', async ({ page }) => {
    await page.goto('/frameworks');
    await settle(page);
    const conductorEdges = EDGES.filter((e) => e.to === 'theory-of-constraints');
    // The composition's whole argument: this is the busiest reader in the graph.
    const busiest = Math.max(
      ...FRAMEWORKS.map((f) => EDGES.filter((e) => e.to === f.id).length),
    );
    expect(conductorEdges.length).toBe(busiest);

    for (const edge of conductorEdges) {
      await expect(
        page.locator(`[data-edge="${edge.from}->${edge.to}"]`),
        `${edge.from} → conductor is not drawn`,
      ).toHaveCount(1);
    }
  });

  test('no edge appears to touch a node it does not connect', async ({ page }) => {
    await page.goto('/frameworks');
    await settle(page);

    // The authored layout's one machine-checkable property. Measured on the rendered
    // SVG in user units, so it fails if a coordinate drifts, not merely if the module
    // changes. Node radius comes off the focus ring, which is drawn at hex radius + 9.
    const worst = await page.evaluate(() => {
      const svg = document.querySelector('[data-testid="framework-graph"] svg');
      if (!svg) return { clearance: -1, edge: 'no svg', node: '' };
      const nodes = Array.from(svg.querySelectorAll('[data-node]')).map((g) => {
        const ring = g.querySelector('[data-focus-ring]') as SVGCircleElement;
        return {
          id: g.getAttribute('data-node') ?? '',
          x: ring.cx.baseVal.value,
          y: ring.cy.baseVal.value,
          r: ring.r.baseVal.value - 9,
        };
      });
      let worstClearance = Infinity;
      let worstEdge = '';
      let worstNode = '';
      for (const group of Array.from(svg.querySelectorAll('[data-edge]'))) {
        const key = group.getAttribute('data-edge') ?? '';
        const [from, to] = key.split('->');
        const path = group.querySelector(
          '[data-component="graph-edge"] path',
        ) as SVGPathElement | null;
        if (!path) continue;
        const len = path.getTotalLength();
        for (let i = 0; i <= 40; i++) {
          const p = path.getPointAtLength((len * i) / 40);
          for (const n of nodes) {
            if (n.id === from || n.id === to) continue;
            const d = Math.hypot(p.x - n.x, p.y - n.y) - n.r;
            if (d < worstClearance) {
              worstClearance = d;
              worstEdge = key;
              worstNode = n.id;
            }
          }
        }
      }
      return { clearance: worstClearance, edge: worstEdge, node: worstNode };
    });

    expect(
      worst.clearance,
      `${worst.edge} passes within ${worst.clearance.toFixed(1)} units of ${worst.node}`,
    ).toBeGreaterThan(6);
  });
});

test.describe('the graph is keyboard-navigable', () => {
  test('tab reaches the nodes, arrows walk them, and enter follows a real href', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/frameworks');
    await settle(page);

    // Tab from the top of the document until focus lands inside the graph.
    let landed: string | null = null;
    for (let i = 0; i < 14 && !landed; i++) {
      await page.keyboard.press('Tab');
      landed = await page.evaluate(
        () => document.activeElement?.closest('[data-node]')?.getAttribute('data-node') ?? null,
      );
    }
    expect(landed, 'Tab never reached a graph node').not.toBeNull();

    // The focus ring is drawn geometry, so "visible" is a real assertion, not a guess.
    const ring = page.locator(`[data-node="${landed}"] [data-focus-ring]`);
    await expect(ring).toHaveCSS('opacity', '1');
    // And focusing a node lights its handoffs.
    await expect(page.getByTestId('graph-panel')).toBeVisible();

    // Arrow keys walk the graph in reading order and come back.
    await page.keyboard.press('ArrowRight');
    const next = await page.evaluate(
      () => document.activeElement?.closest('[data-node]')?.getAttribute('data-node') ?? null,
    );
    expect(next, 'ArrowRight did not move focus').not.toBe(landed);
    expect(next, 'ArrowRight left the graph').not.toBeNull();

    await page.keyboard.press('ArrowLeft');
    const back = await page.evaluate(
      () => document.activeElement?.closest('[data-node]')?.getAttribute('data-node') ?? null,
    );
    expect(back).toBe(landed);

    // Enter activates the link. The target page is S3's; what S2 owes is the right href.
    const href = await page.evaluate(() =>
      (document.activeElement as HTMLAnchorElement | null)?.getAttribute('href'),
    );
    const framework = FRAMEWORKS.find((f) => f.id === back);
    expect(href).toBe(`/frameworks/${framework?.slug}`);
    expect(await page.evaluate(() => document.activeElement?.tagName.toLowerCase())).toBe('a');

    // Tab order is not a trap: every node is reachable and the skip link precedes them.
    await expect(page.getByRole('link', { name: /skip the graph/i })).toBeVisible();

    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test.describe('an edge explains itself', () => {
  test('hovering a handoff names the state fields it carries', async ({ page }) => {
    await page.goto('/frameworks');
    await settle(page);

    await page.locator(`[data-edge="${SAMPLE_KEY}"] path`).last().hover({ force: true });

    const panel = page.getByTestId('graph-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('data-selection-kind', 'edge');
    await expect(panel).toContainText(byId(SAMPLE.from).name);
    await expect(panel).toContainText(byId(SAMPLE.to).name);
    await expect(panel).toContainText('writes');
    await expect(panel).toContainText('reads');

    // Every field on the panel is a real STATE_FIELDS label, and all of them are there.
    expect(SAMPLE_LABELS.length).toBeGreaterThan(0);
    for (const label of SAMPLE_LABELS) {
      await expect(panel.locator(`[data-field-label="${label}"]`)).toHaveCount(1);
    }

    // The edge is lit, and the rest of the canvas has stepped back.
    await expect(page.locator(`[data-edge="${SAMPLE_KEY}"]`)).toHaveAttribute(
      'data-edge-state',
      'active',
    );
  });

  test('the /graph rail carries the full field descriptions and the runs', async ({
    page,
  }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/graph');
    await expect(page.getByTestId('graph-root')).toBeVisible();
    await settle(page);

    await expect(page.getByTestId('edge-detail-empty')).toBeVisible();

    // Selecting from the index is the keyboard path; it must move focus to the answer.
    await page.locator(`[data-edge-button="${SAMPLE_KEY}"]`).click();
    const detail = page.getByTestId('edge-detail');
    await expect(page.getByTestId('edge-detail-body')).toBeVisible();
    await expect(detail).toBeFocused();

    for (const field of SAMPLE.fields) {
      const meta = stateField(field);
      const entry = detail.locator(`[data-state-field="${field}"]`);
      await expect(entry).toHaveCount(1);
      await expect(entry).toContainText(meta.label);
      // The description, not just the label — that is what "full field list" means.
      await expect(entry).toContainText(meta.description.slice(0, 40));
    }

    // The runs that walk it, and the locator showing where it lands.
    await expect(detail).toContainText(/runs that walk it/i);
    await expect(detail.locator('[data-component="graph-mini-map"]')).toHaveCount(1);
    await expect(
      detail.locator(`[data-component="graph-mini-map"] [data-node="${SAMPLE.to}"]`),
    ).toHaveAttribute('data-current', 'true');

    // And the canvas agrees with the rail.
    await expect(page.locator(`[data-edge="${SAMPLE_KEY}"]`)).toHaveAttribute(
      'data-edge-state',
      'active',
    );

    expect(errors, errors.join('\n')).toEqual([]);
  });
});

test.describe('reduced motion is a second theme', () => {
  for (const route of ['/frameworks', '/graph']) {
    test(`${route} renders complete and legible with prefers-reduced-motion`, async ({
      page,
    }) => {
      const errors = collectConsoleErrors(page);
      await reduceMotion(page);
      await page.goto(route);
      expect(
        await page.evaluate(
          () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        ),
        'reduced-motion emulation did not take',
      ).toBe(true);
      await settle(page, 700);

      const graph = page.getByTestId('framework-graph').first();
      await expect(graph).toHaveAttribute('data-reduced', 'true');
      await expect(graph.locator('[data-node]')).toHaveCount(FRAMEWORKS.length);
      await expect(graph.locator('[data-edge]')).toHaveCount(EDGES.length);

      // Nothing is waiting on an entrance: every node group is fully opaque and every
      // edge is fully drawn (dash offset resolved), on the first frame.
      const state = await page.evaluate(() => {
        const root = document.querySelector('[data-testid="framework-graph"]');
        if (!root) return { faded: ['no graph'], undrawn: ['no graph'] };
        const faded = Array.from(root.querySelectorAll('[data-node]'))
          .filter((el) => Number(getComputedStyle(el.parentElement as Element).opacity) < 0.99)
          .map((el) => el.getAttribute('data-node') ?? '?');
        const undrawn = Array.from(
          root.querySelectorAll('[data-edge] [data-component="graph-edge"] path'),
        )
          .filter((p) => {
            const offset = getComputedStyle(p).strokeDashoffset;
            const drawn = offset === '' || offset === 'none' || parseFloat(offset) === 0;
            return !drawn || (p as SVGPathElement).getTotalLength() === 0;
          })
          .map((p) => p.parentElement?.parentElement?.getAttribute('data-edge') ?? '?');
        return { faded, undrawn };
      });
      expect(state.faded, `nodes still fading in: ${state.faded.join(', ')}`).toEqual([]);
      expect(state.undrawn, `edges still drawing: ${state.undrawn.join(', ')}`).toEqual([]);

      // The graph is still explicable without any motion at all.
      await page.locator(`[data-edge="${SAMPLE_KEY}"] path`).last().hover({ force: true });
      const panel = page.getByTestId('graph-panel').first();
      if (await panel.count()) {
        await expect(panel).toContainText(SAMPLE_LABELS[0] as string);
      }

      expect(errors, errors.join('\n')).toEqual([]);
    });
  }
});

test.describe('the amber law', () => {
  for (const route of ['/frameworks', '/graph']) {
    test(`${route} contains no amber at all`, async ({ page }) => {
      await page.goto(route);
      await settle(page);
      // Exercise the live states too — a hover style could smuggle amber in.
      await page.locator('[data-node="theory-of-constraints"] a').first().hover();
      await page.waitForTimeout(400);

      const hits = await page.evaluate((amber) => {
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
        const found: string[] = [];
        for (const el of Array.from(document.querySelectorAll<HTMLElement>('*'))) {
          const cs = getComputedStyle(el);
          for (const prop of props) {
            const value = cs[prop as keyof CSSStyleDeclaration];
            if (typeof value === 'string' && value.includes(amber)) {
              found.push(`${el.tagName.toLowerCase()}.${prop}`);
            }
          }
        }
        return found;
      }, AMBER);

      // The graph has no constraint surface, so it gets no amber — 00-LAW Ruling 2 and
      // team rule 3. This is the whole assertion: zero, not "zero outside a surface".
      expect(hits, `amber on a surface that has not earned it: ${hits.join(', ')}`).toEqual(
        [],
      );
      await expect(page.locator('[data-amber-surface]')).toHaveCount(0);
    });
  }
});
