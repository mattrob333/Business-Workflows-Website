import { describe, expect, it } from 'vitest';
import {
  FRAMEWORKS,
  FRAMEWORK_IDS,
  GROUPS,
  STATE_FIELDS,
  STATE_FIELD_IDS,
  STRATEGY_RUNS,
  allEdges,
  byId,
  bySlug,
  edgesFor,
  frameworksByDepth,
  isStateField,
  validateRegistry,
} from './index';

describe('registry integrity', () => {
  it('validates', () => {
    const result = validateRegistry();
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('holds seventeen frameworks: six full, eleven chapter', () => {
    expect(FRAMEWORKS).toHaveLength(17);
    expect(frameworksByDepth('full')).toHaveLength(6);
    expect(frameworksByDepth('chapter')).toHaveLength(11);
    expect(frameworksByDepth('full').map((f) => f.id).sort()).toEqual(
      ['bmc', 'five-forces', 'raci', 'swot', 'theory-of-constraints', 'vrio'].sort(),
    );
  });

  it('has unique ids and slugs', () => {
    expect(new Set(FRAMEWORKS.map((f) => f.id)).size).toBe(17);
    expect(new Set(FRAMEWORKS.map((f) => f.slug)).size).toBe(17);
    expect([...FRAMEWORK_IDS].sort()).toEqual(FRAMEWORKS.map((f) => f.id).sort());
  });

  it('puts every framework in one of the eight groups', () => {
    const groupIds = new Set(GROUPS.map((g) => g.id));
    expect(groupIds.size).toBe(8);
    for (const framework of FRAMEWORKS) expect(groupIds.has(framework.group)).toBe(true);
  });

  it('resolves by id and slug', () => {
    expect(byId('theory-of-constraints').name).toBe('Theory of Constraints');
    expect(bySlug('swot-tows')?.id).toBe('swot');
    expect(bySlug('not-a-framework')).toBeUndefined();
    expect(() => byId('nope' as never)).toThrow();
  });
});

describe('state fields', () => {
  it('has metadata for every id, and no orphans', () => {
    expect(STATE_FIELDS).toHaveLength(STATE_FIELD_IDS.length);
    expect(STATE_FIELDS.map((f) => f.id).sort()).toEqual([...STATE_FIELD_IDS].sort());
    for (const field of STATE_FIELDS) {
      expect(field.label.length).toBeGreaterThan(2);
      expect(field.description.length).toBeGreaterThan(20);
    }
  });

  it('only accepts known fields', () => {
    expect(isStateField('current_constraint')).toBe(true);
    expect(isStateField('vibes')).toBe(false);
  });

  it('is exercised: every field is read or written by at least one framework', () => {
    const used = new Set(FRAMEWORKS.flatMap((f) => [...f.readsFrom, ...f.writesTo]));
    const unused = STATE_FIELD_IDS.filter((id) => !used.has(id));
    expect(unused).toEqual([]);
  });
});

describe('the graph', () => {
  it('carries typed state on every edge, never prose', () => {
    for (const edge of allEdges()) {
      expect(edge.fields.length, `${edge.from} → ${edge.to}`).toBeGreaterThan(0);
    }
  });

  it('reports both directions for a node', () => {
    const toc = edgesFor('theory-of-constraints');
    expect(toc.out.map((e) => e.to)).toContain('raci');
    expect(toc.in.map((e) => e.from)).toContain('five-forces');
    expect(toc.in.map((e) => e.from)).toContain('swot');

    const bmc = edgesFor('bmc');
    expect(bmc.in).toHaveLength(0);
    expect(bmc.out.map((e) => e.to)).toContain('vrio');
  });

  it('names the fields that travel a specific edge', () => {
    const swotToTows = edgesFor('swot').out.find((e) => e.to === 'tows');
    expect(swotToTows?.fields).toContain('swot_entries');

    const tocToRaci = edgesFor('theory-of-constraints').out.find((e) => e.to === 'raci');
    expect(tocToRaci?.fields).toContain('constraint_actions');
  });

  it('breaks in the right places when a record is deleted', () => {
    const withoutVrio = FRAMEWORKS.filter((f) => f.id !== 'vrio');

    // Edges into the deleted node vanish; edges out of it are unreachable.
    const swotEdges = edgesFor('swot', withoutVrio);
    expect(swotEdges.in.map((e) => e.from)).not.toContain('vrio');
    expect(edgesFor('swot').in.map((e) => e.from)).toContain('vrio');

    const result = validateRegistry(withoutVrio, STRATEGY_RUNS);
    expect(result.ok).toBe(false);
    // Every framework that fed VRIO now points at nothing...
    expect(result.errors).toContain('bmc: feedsInto unknown framework "vrio"');
    // ...the runs that sequence it are broken...
    expect(result.errors).toContain(
      'find-what-matters-now: sequence references unknown framework "vrio"',
    );
    // ...and the v1 depth split no longer holds.
    expect(result.errors).toContain('expected seventeen frameworks, found 16');
    expect(result.errors).toContain('expected six full frameworks, found 5');
  });

  it('rejects an edge that carries no shared state field', () => {
    const broken = FRAMEWORKS.map((f) =>
      f.id === 'swot' ? { ...f, writesTo: ['open_questions' as const] } : f,
    );
    const result = validateRegistry(broken, STRATEGY_RUNS);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('swot → tows: edge carries no shared state field');
  });
});

describe('strategy runs', () => {
  it('holds nine runs with unique slugs', () => {
    expect(STRATEGY_RUNS).toHaveLength(9);
    expect(new Set(STRATEGY_RUNS.map((r) => r.slug)).size).toBe(9);
  });

  it('sequences only real frameworks, and membership is symmetric', () => {
    for (const run of STRATEGY_RUNS) {
      expect(run.sequence.length).toBeGreaterThan(0);
      for (const id of run.sequence) {
        const framework = byId(id);
        expect(framework.runs, `${run.id} ← ${id}`).toContain(run.id);
      }
      for (const branch of run.branches) {
        for (const id of branch.frameworks) expect(byId(id).runs).toContain(run.id);
      }
    }
  });

  it('has exactly one flagship, scripted in twelve steps', () => {
    const flagship = STRATEGY_RUNS.filter((r) => r.flagship);
    expect(flagship).toHaveLength(1);
    const run = flagship[0]!;
    expect(run.id).toBe('find-what-matters-now');
    expect(run.steps).toHaveLength(12);
    expect(run.steps.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    // The LAW's flagship path: BMC → Five Forces + VRIO → SWOT/TOWS → ToC → RACI.
    expect(run.sequence).toEqual([
      'bmc',
      'five-forces',
      'vrio',
      'swot',
      'tows',
      'theory-of-constraints',
      'raci',
    ]);
    // Event injection lands at step 9 (03-content-spec).
    expect(run.steps[8]!.interaction).toBe('event-injection');
    // Copy is S5's job; the structure is S1's.
    for (const step of run.steps) {
      expect(step.reveal).toBeNull();
      expect(step.predictionPrompt).toBeNull();
    }
    expect(run.branches.map((b) => b.constraintType)).toEqual([
      'demand',
      'delivery',
      'decision',
      'product',
      'capability',
    ]);
  });

  it('gives non-flagship runs no scripted steps in v1', () => {
    for (const run of STRATEGY_RUNS.filter((r) => !r.flagship)) {
      expect(run.steps).toHaveLength(0);
      expect(run.outcomes.length).toBeGreaterThan(1);
    }
  });
});

describe('motion and lesson bindings', () => {
  const RECIPES = new Set([
    'motion/ingest',
    'motion/state',
    'motion/transform',
    'motion/route',
    'fw/bmc-assemble',
    'fw/forces-gauges',
    'fw/vrio-gates',
    'fw/tows-cross',
    'fw/toc-flow',
    'fw/raci-route',
  ]);

  it('binds every framework to a recipe that exists in 01-design-system', () => {
    for (const framework of FRAMEWORKS) {
      expect(RECIPES.has(framework.motionRecipe), `${framework.id}: ${framework.motionRecipe}`).toBe(
        true,
      );
    }
  });

  it('gives every full framework its own named recipe', () => {
    for (const framework of frameworksByDepth('full')) {
      expect(framework.motionRecipe.startsWith('fw/')).toBe(true);
    }
  });

  it('points every lesson at an MDX file under src/content/frameworks', () => {
    for (const framework of FRAMEWORKS) {
      expect(framework.lesson).toMatch(/^src\/content\/frameworks\/[a-z0-9-]+\/lesson\.mdx$/);
    }
  });
});
