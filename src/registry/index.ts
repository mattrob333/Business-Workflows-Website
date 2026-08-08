/**
 * Registry barrel + lookups.
 *
 * Everything the site renders about a framework comes through here. `validateRegistry()`
 * is the graph-integrity check: it is run by the registry test and is cheap enough to call
 * at module load in development.
 */

export * from './state-fields';
export * from './frameworks';
export * from './runs';

import {
  FRAMEWORKS,
  GROUPS,
  type Framework,
  type FrameworkGroup,
  type FrameworkId,
} from './frameworks';
import { STRATEGY_RUNS, type StrategyRun, type StrategyRunId } from './runs';
import { isStateField, type StateField } from './state-fields';

const FRAMEWORK_BY_ID = new Map<FrameworkId, Framework>(FRAMEWORKS.map((f) => [f.id, f]));
const FRAMEWORK_BY_SLUG = new Map<string, Framework>(FRAMEWORKS.map((f) => [f.slug, f]));
const RUN_BY_ID = new Map<StrategyRunId, StrategyRun>(STRATEGY_RUNS.map((r) => [r.id, r]));
const RUN_BY_SLUG = new Map<string, StrategyRun>(STRATEGY_RUNS.map((r) => [r.slug, r]));

export function byId(id: FrameworkId): Framework {
  const framework = FRAMEWORK_BY_ID.get(id);
  if (!framework) throw new Error(`Unknown framework id: ${id}`);
  return framework;
}

export function bySlug(slug: string): Framework | undefined {
  return FRAMEWORK_BY_SLUG.get(slug);
}

export function runById(id: StrategyRunId): StrategyRun {
  const run = RUN_BY_ID.get(id);
  if (!run) throw new Error(`Unknown strategy run id: ${id}`);
  return run;
}

export function runBySlug(slug: string): StrategyRun | undefined {
  return RUN_BY_SLUG.get(slug);
}

export function frameworksInGroup(group: FrameworkGroup): Framework[] {
  return FRAMEWORKS.filter((f) => f.group === group);
}

/** The eight groups, each with its frameworks, in registry order. */
export function groupedFrameworks(): { group: (typeof GROUPS)[number]; frameworks: Framework[] }[] {
  return GROUPS.map((group) => ({ group, frameworks: frameworksInGroup(group.id) }));
}

export function frameworksByDepth(depth: Framework['depth']): Framework[] {
  return FRAMEWORKS.filter((f) => f.depth === depth);
}

export function frameworksInRun(id: StrategyRunId): Framework[] {
  return FRAMEWORKS.filter((f) => f.runs.includes(id));
}

export interface GraphEdge {
  readonly from: FrameworkId;
  readonly to: FrameworkId;
  /** The state fields that actually travel along this edge. */
  readonly fields: StateField[];
}

/**
 * Every edge touching `id`, with the state fields carried on it.
 * An edge with no shared fields is a graph lie — `validateRegistry` rejects it.
 */
export function edgesFor(
  id: FrameworkId,
  frameworks: readonly Framework[] = FRAMEWORKS,
): { out: GraphEdge[]; in: GraphEdge[] } {
  const framework = frameworks.find((f) => f.id === id);
  if (!framework) throw new Error(`Unknown framework id: ${id}`);
  const out = framework.feedsInto
    .map((to) => frameworks.find((f) => f.id === to))
    .filter((to): to is Framework => to !== undefined)
    .map((to) => edge(framework, to));
  const incoming = frameworks
    .filter((f) => f.feedsInto.includes(id))
    .map((f) => edge(f, framework));
  return { out, in: incoming };
}

export function allEdges(): GraphEdge[] {
  return FRAMEWORKS.flatMap((f) => f.feedsInto.map((to) => edge(f, byId(to))));
}

function edge(from: Framework, to: Framework): GraphEdge {
  return {
    from: from.id,
    to: to.id,
    fields: from.writesTo.filter((field) => to.readsFrom.includes(field)),
  };
}

export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: string[];
}

/**
 * Graph integrity. Asserts that:
 *  - ids and slugs are unique, v1 depth split holds (six full, eleven chapter);
 *  - every readsFrom/writesTo entry is a real state field;
 *  - every feedsInto / bestBefore target is a real framework, and never itself;
 *  - every edge carries at least one shared state field (frameworks pass fields, not prose);
 *  - every run sequence and branch references real frameworks;
 *  - run membership is symmetric with the runs' sequences and branches;
 *  - the flagship run is unique and fully stepped.
 */
export function validateRegistry(
  frameworks: readonly Framework[] = FRAMEWORKS,
  runs: readonly StrategyRun[] = STRATEGY_RUNS,
): ValidationResult {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const frameworkById = new Map<FrameworkId, Framework>(frameworks.map((f) => [f.id, f]));
  const runById = new Map<StrategyRunId, StrategyRun>(runs.map((r) => [r.id, r]));
  const lookup = (id: FrameworkId): Framework | undefined => frameworkById.get(id);

  for (const f of frameworks) {
    if (seenIds.has(f.id)) errors.push(`duplicate framework id: ${f.id}`);
    seenIds.add(f.id);
    if (seenSlugs.has(f.slug)) errors.push(`duplicate framework slug: ${f.slug}`);
    seenSlugs.add(f.slug);

    for (const field of [...f.readsFrom, ...f.writesTo]) {
      if (!isStateField(field)) errors.push(`${f.id}: unknown state field "${field}"`);
    }
    if (f.readsFrom.length === 0) errors.push(`${f.id}: reads from nothing`);
    if (f.writesTo.length === 0) errors.push(`${f.id}: writes nothing`);
    if (new Set(f.readsFrom).size !== f.readsFrom.length)
      errors.push(`${f.id}: duplicate entries in readsFrom`);
    if (new Set(f.writesTo).size !== f.writesTo.length)
      errors.push(`${f.id}: duplicate entries in writesTo`);

    for (const target of f.feedsInto) {
      if (!frameworkById.has(target)) errors.push(`${f.id}: feedsInto unknown framework "${target}"`);
      if (target === f.id) errors.push(`${f.id}: feedsInto itself`);
    }
    for (const target of f.bestBefore) {
      if (!frameworkById.has(target)) errors.push(`${f.id}: bestBefore unknown framework "${target}"`);
      if (target === f.id) errors.push(`${f.id}: bestBefore itself`);
      if (!f.feedsInto.includes(target))
        errors.push(`${f.id}: bestBefore "${target}" is not an edge — ordering guidance must follow the graph`);
    }
    for (const target of f.feedsInto) {
      const to = frameworkById.get(target);
      if (!to) continue;
      const shared = f.writesTo.filter((field) => to.readsFrom.includes(field));
      if (shared.length === 0)
        errors.push(`${f.id} → ${target}: edge carries no shared state field`);
    }

    for (const runId of f.runs) {
      const run = runById.get(runId);
      if (!run) {
        errors.push(`${f.id}: member of unknown run "${runId}"`);
        continue;
      }
      const inSequence = run.sequence.includes(f.id);
      const inBranch = run.branches.some((b) => b.frameworks.includes(f.id));
      if (!inSequence && !inBranch)
        errors.push(`${f.id}: claims run "${runId}" but the run never uses it`);
    }

    if (!f.motionRecipe.includes('/')) errors.push(`${f.id}: motionRecipe is not a recipe name`);
    if (!f.lesson.endsWith('.mdx')) errors.push(`${f.id}: lesson is not an MDX ref`);
    if (f.example.length === 0) errors.push(`${f.id}: no example binding`);
    if (f.example.filter((e) => e.role === 'primary').length !== 1)
      errors.push(`${f.id}: needs exactly one primary example company`);
  }

  const full = frameworks.filter((f) => f.depth === 'full').length;
  const chapter = frameworks.filter((f) => f.depth === 'chapter').length;
  if (frameworks.length !== 17) errors.push(`expected seventeen frameworks, found ${frameworks.length}`);
  if (full !== 6) errors.push(`expected six full frameworks, found ${full}`);
  if (chapter !== 11) errors.push(`expected eleven chapter frameworks, found ${chapter}`);

  const runSlugs = new Set<string>();
  for (const run of runs) {
    if (runSlugs.has(run.slug)) errors.push(`duplicate run slug: ${run.slug}`);
    runSlugs.add(run.slug);
    if (run.sequence.length === 0) errors.push(`${run.id}: empty sequence`);
    for (const step of run.sequence) {
      if (!frameworkById.has(step)) errors.push(`${run.id}: sequence references unknown framework "${step}"`);
      else if (!lookup(step)!.runs.includes(run.id))
        errors.push(`${run.id}: "${step}" is in the sequence but does not claim the run`);
    }
    for (const branch of run.branches) {
      for (const step of branch.frameworks) {
        if (!frameworkById.has(step))
          errors.push(`${run.id}: branch "${branch.constraintType}" references unknown framework "${step}"`);
        else if (!lookup(step)!.runs.includes(run.id))
          errors.push(`${run.id}: branch "${branch.constraintType}" uses "${step}" which does not claim the run`);
      }
    }
    for (const step of run.steps) {
      if (!frameworkById.has(step.framework))
        errors.push(`${run.id}: step ${step.n} references unknown framework "${step.framework}"`);
      if (!run.sequence.includes(step.framework))
        errors.push(`${run.id}: step ${step.n} uses "${step.framework}", which is not in the sequence`);
      for (const field of [...step.stateIn, ...step.stateOut]) {
        if (!isStateField(field)) errors.push(`${run.id}: step ${step.n} unknown state field "${field}"`);
      }
    }
    if (run.steps.length > 0) {
      const expected = run.steps.map((_, i) => i + 1).join(',');
      const actual = run.steps.map((s) => s.n).join(',');
      if (expected !== actual) errors.push(`${run.id}: steps are not numbered 1..n`);
    }
    if (run.outcomes.length === 0) errors.push(`${run.id}: no outcomes`);
    if (run.bestFor.length === 0) errors.push(`${run.id}: no bestFor`);
  }

  const flagships = runs.filter((r) => r.flagship);
  if (flagships.length !== 1) errors.push(`expected exactly one flagship run, found ${flagships.length}`);
  const flagship = flagships[0];
  if (flagship && flagship.steps.length !== 12)
    errors.push(`the flagship run must have twelve steps, found ${flagship.steps.length}`);

  return { ok: errors.length === 0, errors };
}

export function assertRegistryValid(): void {
  const { ok, errors } = validateRegistry();
  if (!ok) throw new Error(`Registry invalid:\n  ${errors.join('\n  ')}`);
}
