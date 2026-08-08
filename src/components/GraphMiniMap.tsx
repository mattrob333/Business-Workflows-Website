/**
 * `GraphMiniMap` — the locator variant of the Framework Graph.
 *
 * Strokes are `non-scaling-stroke` throughout: the same 1500-unit canvas is embedded at
 * anything from a 384px rail to a full framework-page column, and a scaled 1.5-unit
 * hairline goes sub-pixel and disappears at the small end.
 *
 * 03-content-spec gives every chapter page a "position-in-graph mini-map", and the six
 * full pages get the same affordance in their handoff section. This is that component,
 * built for S3 to embed: same authored coordinates as the full graph, same shape
 * vocabulary, no interaction at all. Its whole job is the sentence *you are here*.
 *
 * Non-interactive is a deliberate constraint, not a shortcut. A second clickable graph
 * on a framework page would compete with the page's own content for attention and would
 * duplicate seventeen links the site already has; a mini-map that is `role="img"` with
 * one authored alt sentence costs one accessibility-tree node instead of seventy-five.
 */

import {
  GRAPH_VIEWBOX,
  frameworkGraphModel,
  hexPath,
  type GraphNodeModel,
} from './graph-layout';
import type { FrameworkId } from '@/registry';
import { MONO_LABEL } from './styles';

export interface GraphMiniMapProps {
  /** The framework the embedding page is about. Highlighted; everything else recedes. */
  current: FrameworkId;
  /** Print the current framework's name under the map. */
  showLabel?: boolean;
  className?: string;
}

function neighbourNames(model: ReturnType<typeof frameworkGraphModel>, id: FrameworkId) {
  const feeds = model.edges
    .filter((e) => e.from.framework.id === id)
    .map((e) => e.to.framework.name);
  const fedBy = model.edges
    .filter((e) => e.to.framework.id === id)
    .map((e) => e.from.framework.name);
  return { feeds, fedBy };
}

export function GraphMiniMap({ current, showLabel = true, className = '' }: GraphMiniMapProps) {
  const model = frameworkGraphModel();
  const node: GraphNodeModel | undefined = model.byId.get(current);
  const { feeds, fedBy } = neighbourNames(model, current);

  const adjacent = new Set<FrameworkId>();
  for (const edge of model.edges) {
    if (edge.from.framework.id === current) adjacent.add(edge.to.framework.id);
    if (edge.to.framework.id === current) adjacent.add(edge.from.framework.id);
  }

  const alt = node
    ? `Position of ${node.framework.name} in the framework graph. It reads from ${
        fedBy.length > 0 ? fedBy.join(', ') : 'no other framework'
      }, and feeds ${feeds.length > 0 ? feeds.join(', ') : 'no other framework'}.`
    : 'The framework graph.';

  return (
    <figure data-component="graph-mini-map" data-current={current} className={className}>
      <svg
        viewBox={`0 0 ${GRAPH_VIEWBOX.width} ${GRAPH_VIEWBOX.height}`}
        className="h-auto w-full"
        role="img"
        aria-label={alt}
      >
        <g data-layer="edges">
          {model.edges.map((edge) => {
            const touches =
              edge.from.framework.id === current || edge.to.framework.id === current;
            return (
              <path
                key={edge.key}
                d={edge.route.d}
                fill="none"
                stroke={touches ? 'var(--flow)' : 'var(--line-strong)'}
                strokeWidth={touches ? 2 : 1}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity={touches ? 0.95 : 0.4}
              />
            );
          })}
        </g>

        <g data-layer="nodes">
          {model.nodes.map((n) => {
            const isCurrent = n.framework.id === current;
            const isAdjacent = adjacent.has(n.framework.id);
            return (
              <path
                key={n.framework.id}
                data-node={n.framework.id}
                data-current={isCurrent ? 'true' : 'false'}
                d={hexPath(n.x, n.y, isCurrent ? n.r + 4 : n.r)}
                fill={
                  isCurrent
                    ? 'color-mix(in srgb, var(--flow-deep) 34%, var(--surface))'
                    : 'var(--surface)'
                }
                stroke={
                  isCurrent
                    ? 'var(--flow)'
                    : isAdjacent
                      ? 'var(--line-strong)'
                      : 'var(--line)'
                }
                strokeWidth={isCurrent ? 2 : 1}
                vectorEffect="non-scaling-stroke"
                opacity={isCurrent ? 1 : isAdjacent ? 0.9 : 0.55}
              />
            );
          })}
        </g>

        {node ? (
          <text
            x={node.x}
            y={node.y + node.r + 30}
            textAnchor="middle"
            className="font-system"
            fontSize={34}
            letterSpacing="0.06em"
            fill="var(--ink)"
          >
            {node.framework.name}
          </text>
        ) : null}
      </svg>

      {showLabel && node ? (
        <figcaption
          className={`${MONO_LABEL} mt-3 text-[10px]`}
          style={{ color: 'var(--faint)' }}
        >
          {node.framework.name} · {node.group.label} · fed by {fedBy.length} · feeds{' '}
          {feeds.length}
        </figcaption>
      ) : null}
    </figure>
  );
}

export default GraphMiniMap;
