/**
 * The per-framework configs, and the two checks that keep them honest.
 *
 * S3-A ships `bmc` and `theory-of-constraints`. S3-B adds `five-forces`, `vrio`, `swot`
 * (which owns `/frameworks/swot-tows`) and `raci` by writing one file each in this
 * directory and adding it to `CONFIGS` — the route, the state panel, the handoff, the
 * locked door and the share row already work for all six.
 *
 * `assertConfigMatchesRegistry` runs during static generation, so a config that drifts from
 * its registry record — a showpiece bound to a recipe the record does not name, a lesson at
 * a path the record does not carry, a config for a chapter-depth framework — fails the
 * build instead of shipping a page that quietly disagrees with the graph.
 */

import { byId, type Framework, type FrameworkId } from '@/registry';
import type { FrameworkPageConfig } from '../types';
import { bmcPageConfig } from './bmc';
import { tocPageConfig } from './theory-of-constraints';

const CONFIGS: readonly FrameworkPageConfig[] = [bmcPageConfig, tocPageConfig];

const BY_ID = new Map<FrameworkId, FrameworkPageConfig>(CONFIGS.map((c) => [c.id, c]));

/** The frameworks whose full page pattern is authored. The rest render the scaffold. */
export const CONFIGURED_FRAMEWORK_IDS: readonly FrameworkId[] = CONFIGS.map((c) => c.id);

export function frameworkPageConfig(id: FrameworkId): FrameworkPageConfig | undefined {
  return BY_ID.get(id);
}

export function assertConfigMatchesRegistry(config: FrameworkPageConfig): Framework {
  const framework = byId(config.id);
  if (framework.depth !== 'full')
    throw new Error(`${config.id}: only full-depth frameworks get a page config`);
  if (config.showpiece.recipe !== framework.motionRecipe)
    throw new Error(
      `${config.id}: showpiece is bound to "${config.showpiece.recipe}" but the registry says "${framework.motionRecipe}"`,
    );
  if (config.lesson.path !== framework.lesson)
    throw new Error(
      `${config.id}: lesson is "${config.lesson.path}" but the registry says "${framework.lesson}"`,
    );
  if (config.showpiece.evidenceRefs.length === 0)
    throw new Error(`${config.id}: the showpiece cites no evidence`);
  return framework;
}
