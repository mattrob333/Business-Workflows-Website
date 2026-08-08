/**
 * **ACT II · The instruments** — 03-content-spec.
 *
 * Spec: *the Framework Graph fades in around the canvas … the graph edges light as
 * outputs hand off (`motion/route`). Copy teaches the one principle: frameworks don't
 * pass paragraphs — they pass typed state.*
 *
 * The act makes that principle checkable rather than merely stated: every chip in the
 * readout under the graph is a real state-field identifier from `src/registry`, and the
 * set on each wire is computed as the intersection of what the source writes and what
 * the target reads. If a visitor doubts the claim, the vocabulary is right there in the
 * system voice — `key_resources`, `force_scores`, `swot_entries`, `current_constraint`.
 *
 * Server component; `InstrumentGraph` is the island and receives plain data.
 */

import { ActCopy } from './ActCopy';
import { InstrumentGraph } from './InstrumentGraph';
import { INSTRUMENT_EDGES, INSTRUMENT_NODES, INSTRUMENT_RETURN, INSTRUMENT_VIEWBOX } from './data';

export function ActInstruments() {
  return (
    <div data-home-act="instruments">
      <InstrumentGraph
        nodes={INSTRUMENT_NODES}
        edges={INSTRUMENT_EDGES}
        returnEdge={INSTRUMENT_RETURN}
        viewBox={INSTRUMENT_VIEWBOX}
        header={
          <ActCopy
            kicker="motion/route · the framework graph"
            headline={
              <>
                Frameworks don&apos;t pass paragraphs. They pass{' '}
                <em className="italic">typed state</em>.
              </>
            }
            note="A canvas writes key resources. Five Forces reads them and writes force scores. Nothing is retyped, nothing is summarised — which is the whole difference between a stack of frameworks and a system."
          />
        }
      />
    </div>
  );
}

export default ActInstruments;
