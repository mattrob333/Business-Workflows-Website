/**
 * Handoff targets and the state they carry — derived, never authored.
 *
 * 03-content-spec §6: *"one-click into the next framework page with the example company's
 * state carried in the URL (the graph edge, made walkable)"*. Both halves of that sentence
 * come out of `src/registry`: the ordering is `bestBefore` first (the registry's own
 * "run these after this one" guidance) then the remaining `feedsInto` edges, and the state
 * on the link is the edge's shared fields — the same set `/graph` names when you hover the
 * line. Nothing here is a hand-written list of "related frameworks".
 *
 * **The URL contract**, so that S3-B and S5 read what S3-A writes:
 *
 *   /frameworks/<slug>?company=<company-id>&from=<framework-id>&carries=<field,field,…>
 *
 * `company` is the company id as it appears in `src/content/companies` (`beacon-mechanical`,
 * not `beacon`); `from` is a framework **id**, not a slug, because ids are what the registry
 * and the graph speak; `carries` is a comma-separated list of `StateField`s. All three are
 * optional and every reader must treat them as hostile — see `IncomingState`.
 *
 * Chapter-depth targets are named but not linked. Their pages are S6's, and a handoff into
 * a 404 would break the one promise this section exists to make.
 */

import { byId, edgesFor, stateField, type Framework, type FrameworkId, type StateField } from '@/registry';
import type { CompanyId } from '@/content/companies';

export interface HandoffTarget {
  readonly framework: Framework;
  /** The state fields that actually travel this edge. */
  readonly fields: StateField[];
  /** `bestBefore` targets are the registry's recommended next step. */
  readonly recommended: boolean;
  /** Full-depth pages exist in v1; chapter pages land in S6. */
  readonly linkable: boolean;
  readonly href: string | null;
}

export function handoffHref(
  from: FrameworkId,
  to: Framework,
  company: CompanyId,
  fields: readonly StateField[],
): string {
  const params = new URLSearchParams({ company, from });
  if (fields.length > 0) params.set('carries', fields.join(','));
  return `/frameworks/${to.slug}?${params.toString()}`;
}

/**
 * The mirror image, for the receiving page: every framework that hands off *into* this one,
 * with the fields that edge carries. Computed on the server and handed to `IncomingState`
 * as its allow-list, so the browser never needs the registry to validate a query string.
 */
export function incomingSources(framework: Framework): {
  id: string;
  name: string;
  fields: { id: string; label: string }[];
}[] {
  return edgesFor(framework.id).in.map((edge) => {
    const source = byId(edge.from);
    return {
      id: source.id,
      name: source.name,
      fields: edge.fields.map((f) => ({ id: f, label: stateField(f).label })),
    };
  });
}

/** Every framework this one feeds, recommended ones first, with their carried state. */
export function handoffTargets(framework: Framework, company: CompanyId): HandoffTarget[] {
  const { out } = edgesFor(framework.id);
  const ordered = [...out].sort((a, b) => {
    const rank = (id: FrameworkId) => (framework.bestBefore.includes(id) ? 0 : 1);
    const byRank = rank(a.to) - rank(b.to);
    if (byRank !== 0) return byRank;
    return b.fields.length - a.fields.length;
  });

  return ordered.map((edge) => {
    const target = byId(edge.to);
    const linkable = target.depth === 'full';
    return {
      framework: target,
      fields: edge.fields,
      recommended: framework.bestBefore.includes(target.id),
      linkable,
      href: linkable ? handoffHref(framework.id, target, company, edge.fields) : null,
    };
  });
}
