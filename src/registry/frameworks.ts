/**
 * The framework registry — the load-bearing decision (00-LAW Ruling 5).
 *
 * The seventeen frameworks are data, not pages: this file drives routes, graph nodes,
 * reads-from/writes-to indicators, motion-recipe bindings and Strategy Run membership.
 * The `Framework` interface is 02-architecture's, verbatim.
 *
 * Inputs / outputs / feeds-into are appendix §3 and the §4 graph, which 00-LAW Ruling 8
 * adopts law-by-reference. Motion recipes bind to names that exist in 01-design-system
 * §4 (the four meanings) and §5 (the six full recipes) — no recipe is invented here.
 *
 * Note on the seventeenth record: appendix §3 counts SWOT and TOWS as two engines
 * (17 total; "SWOT collects; TOWS generates" — and TOWS reads SWOT's typed output, so
 * the edge is real). 03-content-spec merges them onto one page, `/frameworks/swot-tows`.
 * Both are true here: `swot` owns the full page at slug `swot-tows`, `tows` is a distinct
 * record at chapter depth whose page points into the cross. Six full, eleven chapter.
 */

import type { StateField } from './state-fields';
import type { StrategyRunId } from './runs';

export const FRAMEWORK_IDS = [
  'bmc',
  'five-forces',
  'pestle',
  'swot',
  'tows',
  'vrio',
  'ansoff',
  'three-horizons',
  'blue-ocean',
  'jobs-to-be-done',
  'value-proposition-canvas',
  'kano',
  'mckinsey-7s',
  'balanced-scorecard',
  'okrs',
  'theory-of-constraints',
  'raci',
] as const;

export type FrameworkId = (typeof FRAMEWORK_IDS)[number];

export type FrameworkGroup =
  | 'map'
  | 'terrain'
  | 'advantage'
  | 'direction'
  | 'customer'
  | 'alignment'
  | 'conductor'
  | 'delegation';

export const FRAMEWORK_GROUPS = [
  'map',
  'terrain',
  'advantage',
  'direction',
  'customer',
  'alignment',
  'conductor',
  'delegation',
] as const;

export interface FrameworkGroupMeta {
  readonly id: FrameworkGroup;
  readonly label: string;
  readonly blurb: string;
}

export const GROUPS: readonly FrameworkGroupMeta[] = [
  { id: 'map', label: 'Map', blurb: 'What this business is.' },
  { id: 'terrain', label: 'Terrain', blurb: 'What it is standing in.' },
  { id: 'advantage', label: 'Advantage', blurb: 'What it actually has.' },
  { id: 'direction', label: 'Direction', blurb: 'Where it could go.' },
  { id: 'customer', label: 'Customer', blurb: 'What people are hiring it to do.' },
  { id: 'alignment', label: 'Alignment', blurb: 'Whether the organisation can carry the choice.' },
  { id: 'conductor', label: 'Conductor', blurb: 'What matters most right now.' },
  { id: 'delegation', label: 'Delegation', blurb: 'Who — or what — does the work.' },
];

/** Path to the MDX lesson for a framework's Learn section. */
export type MDXRef = string;

export type ExampleRole = 'primary' | 'secondary';

export interface ExampleBinding {
  /** Slug of a company in src/content/companies. */
  readonly company: string;
  readonly role: ExampleRole;
  /** One line: what this framework shows when it runs on this company. */
  readonly note: string;
}

export interface Framework {
  id: FrameworkId;
  group: FrameworkGroup;
  name: string;
  slug: string;
  /** The one-sentence question it answers. */
  coreQuestion: string;
  /** v1: six full, eleven chapter. */
  depth: 'full' | 'chapter';
  /** Typed state fields, not prose. */
  readsFrom: StateField[];
  writesTo: StateField[];
  /** Graph edges (appendix §4). */
  feedsInto: FrameworkId[];
  /** Ordering guidance: run these after this one, not before. */
  bestBefore: FrameworkId[];
  /** Binds to a recipe name in 01-design-system §4/§5. */
  motionRecipe: string;
  runs: StrategyRunId[];
  lesson: MDXRef;
  example: ExampleBinding[];
}

const BEACON = 'beacon-mechanical';
const RELAYDESK = 'relaydesk';
const LANTERN = 'lantern-ai';

export const FRAMEWORKS: readonly Framework[] = [
  {
    id: 'bmc',
    group: 'map',
    name: 'Business Model Canvas',
    slug: 'bmc',
    coreQuestion:
      'What is this business, and how does it create, deliver and capture value?',
    depth: 'full',
    readsFrom: ['company_profile', 'financials', 'performance_metrics'],
    writesTo: [
      'customer_segments',
      'value_propositions',
      'channels',
      'customer_relationships',
      'revenue_streams',
      'key_resources',
      'key_activities',
      'key_partners',
      'cost_structure',
      'assumptions',
      'model_contradictions',
      'open_questions',
      'risk_register',
    ],
    feedsInto: [
      'five-forces',
      'vrio',
      'swot',
      'jobs-to-be-done',
      'value-proposition-canvas',
      'theory-of-constraints',
      'mckinsey-7s',
    ],
    bestBefore: ['five-forces', 'vrio', 'swot', 'jobs-to-be-done'],
    motionRecipe: 'fw/bmc-assemble',
    runs: [
      'validate-an-idea',
      'find-product-market-fit',
      'choose-a-growth-path',
      'find-what-matters-now',
      'prepare-for-ai-agents',
    ],
    lesson: 'src/content/frameworks/bmc/lesson.mdx',
    example: [
      {
        company: BEACON,
        role: 'primary',
        note: 'Nine blocks assemble from dispatch, payroll and contract data — and two blocks disagree.',
      },
      {
        company: RELAYDESK,
        role: 'secondary',
        note: 'A canvas where acquisition is strong and the relationships block is nearly empty.',
      },
      {
        company: LANTERN,
        role: 'secondary',
        note: 'One canvas per candidate market, so the choice becomes visible instead of argued.',
      },
    ],
  },
  {
    id: 'five-forces',
    group: 'terrain',
    name: 'Five Forces',
    slug: 'five-forces',
    coreQuestion:
      'Where does power sit in this market, and which pressure determines whether the business is profitable?',
    depth: 'full',
    readsFrom: [
      'competitors',
      'customer_concentration',
      'customer_segments',
      'value_propositions',
      'key_partners',
      'external_signals',
      'financials',
    ],
    writesTo: ['force_scores', 'primary_economic_pressure', 'risk_register', 'open_questions'],
    feedsInto: ['swot', 'tows', 'ansoff', 'blue-ocean', 'theory-of-constraints'],
    bestBefore: ['swot', 'ansoff', 'blue-ocean'],
    motionRecipe: 'fw/forces-gauges',
    runs: [
      'validate-an-idea',
      'choose-a-growth-path',
      'enter-a-new-market',
      'reposition-the-company',
      'find-what-matters-now',
    ],
    lesson: 'src/content/frameworks/five-forces/lesson.mdx',
    example: [
      {
        company: BEACON,
        role: 'primary',
        note: 'Buyer power reads high on 43% concentration — and still is not the thing holding the business back.',
      },
      {
        company: LANTERN,
        role: 'secondary',
        note: 'Three candidate markets scored side by side; the forces differ more than the pitch does.',
      },
    ],
  },
  {
    id: 'pestle',
    group: 'terrain',
    name: 'PESTLE',
    slug: 'pestle',
    coreQuestion:
      'Which large external forces could materially change this business before it notices?',
    depth: 'chapter',
    readsFrom: ['company_profile', 'customer_segments', 'key_partners', 'competitors'],
    writesTo: ['external_signals', 'leading_indicators', 'risk_register'],
    feedsInto: ['five-forces', 'swot', 'ansoff', 'three-horizons', 'balanced-scorecard'],
    bestBefore: ['five-forces', 'ansoff'],
    motionRecipe: 'fw/forces-gauges',
    runs: ['choose-a-growth-path', 'enter-a-new-market'],
    lesson: 'src/content/frameworks/pestle/lesson.mdx',
    example: [
      {
        company: LANTERN,
        role: 'primary',
        note: 'Procurement rules and model-audit requirements are the weather over enterprise AI.',
      },
      {
        company: BEACON,
        role: 'secondary',
        note: 'Refrigerant regulation and equipment lead times as signals with dates attached.',
      },
    ],
  },
  {
    id: 'swot',
    group: 'advantage',
    name: 'SWOT',
    slug: 'swot-tows',
    coreQuestion:
      'What does this business actually have, what is missing, and what is the environment offering or threatening?',
    depth: 'full',
    readsFrom: [
      'capabilities_vrio',
      'capability_gaps',
      'key_resources',
      'performance_metrics',
      'force_scores',
      'external_signals',
      'competitors',
      'customer_jobs',
    ],
    writesTo: ['swot_entries', 'open_questions'],
    feedsInto: ['tows', 'theory-of-constraints'],
    bestBefore: ['tows'],
    motionRecipe: 'fw/tows-cross',
    runs: ['choose-a-growth-path', 'find-what-matters-now'],
    lesson: 'src/content/frameworks/swot/lesson.mdx',
    example: [
      {
        company: BEACON,
        role: 'primary',
        note: 'Every quadrant entry carries evidence strength — the sticky-note version dies here.',
      },
      {
        company: RELAYDESK,
        role: 'secondary',
        note: 'A strength (acquisition) and a weakness (activation) that are the same fact seen twice.',
      },
    ],
  },
  {
    id: 'tows',
    group: 'advantage',
    name: 'TOWS',
    slug: 'tows',
    coreQuestion: 'Crossing what we have with what is out there, which strategies are worth writing down?',
    depth: 'chapter',
    readsFrom: ['swot_entries', 'force_scores', 'capabilities_vrio', 'external_signals', 'value_curve'],
    writesTo: ['strategic_options', 'assumptions', 'risk_register'],
    feedsInto: ['ansoff', 'three-horizons', 'blue-ocean', 'okrs', 'theory-of-constraints'],
    bestBefore: ['ansoff', 'three-horizons', 'okrs'],
    motionRecipe: 'fw/tows-cross',
    runs: [
      'choose-a-growth-path',
      'reposition-the-company',
      'find-what-matters-now',
      'align-the-organization',
    ],
    lesson: 'src/content/frameworks/tows/lesson.mdx',
    example: [
      {
        company: BEACON,
        role: 'primary',
        note: 'Four ranked options minted from the cross — three of them make the backlog worse.',
      },
      {
        company: LANTERN,
        role: 'secondary',
        note: 'Market entry framed as SO/ST/WO/WT rather than as enthusiasm.',
      },
    ],
  },
  {
    id: 'vrio',
    group: 'advantage',
    name: 'VRIO',
    slug: 'vrio',
    coreQuestion: 'Which of our resources and capabilities are genuine advantages, and which just feel like it?',
    depth: 'full',
    readsFrom: ['key_resources', 'key_activities', 'competitors', 'performance_metrics', 'financials'],
    writesTo: ['capabilities_vrio', 'capability_gaps'],
    feedsInto: ['swot', 'tows', 'ansoff', 'blue-ocean', 'mckinsey-7s'],
    bestBefore: ['swot', 'ansoff'],
    motionRecipe: 'fw/vrio-gates',
    runs: [
      'validate-an-idea',
      'choose-a-growth-path',
      'enter-a-new-market',
      'reposition-the-company',
      'find-what-matters-now',
    ],
    lesson: 'src/content/frameworks/vrio/lesson.mdx',
    example: [
      {
        company: BEACON,
        role: 'primary',
        note: 'Four capabilities enter the gates; one sustained advantage is also the bottleneck.',
      },
      {
        company: LANTERN,
        role: 'secondary',
        note: 'A research team that is rare but not yet organised to capture value.',
      },
    ],
  },
  {
    id: 'ansoff',
    group: 'direction',
    name: 'Ansoff Matrix',
    slug: 'ansoff',
    coreQuestion: 'Existing or new product, existing or new market — and what does each route cost us in risk?',
    depth: 'chapter',
    readsFrom: [
      'capabilities_vrio',
      'capability_gaps',
      'force_scores',
      'customer_jobs',
      'customer_segments',
      'value_propositions',
      'strategic_options',
      'external_signals',
    ],
    writesTo: ['strategic_options', 'assumptions', 'risk_register'],
    feedsInto: ['three-horizons', 'blue-ocean', 'theory-of-constraints'],
    bestBefore: ['three-horizons'],
    runs: ['choose-a-growth-path', 'enter-a-new-market'],
    motionRecipe: 'motion/route',
    lesson: 'src/content/frameworks/ansoff/lesson.mdx',
    example: [
      {
        company: LANTERN,
        role: 'primary',
        note: 'Three markets, one product: the quadrant makes the risk difference impossible to hide.',
      },
    ],
  },
  {
    id: 'three-horizons',
    group: 'direction',
    name: 'Three Horizons',
    slug: 'three-horizons',
    coreQuestion: 'Are we starving the core to fund the future, or starving the future to protect the core?',
    depth: 'chapter',
    readsFrom: ['strategic_options', 'financials', 'capabilities_vrio', 'external_signals'],
    writesTo: ['horizon_portfolio', 'risk_register', 'open_questions'],
    feedsInto: ['okrs', 'balanced-scorecard', 'theory-of-constraints'],
    bestBefore: ['okrs'],
    motionRecipe: 'motion/transform',
    runs: ['choose-a-growth-path'],
    lesson: 'src/content/frameworks/three-horizons/lesson.mdx',
    example: [
      {
        company: LANTERN,
        role: 'primary',
        note: 'Thirteen months of runway allocated across three horizons — the slider tells the truth.',
      },
    ],
  },
  {
    id: 'blue-ocean',
    group: 'direction',
    name: 'Blue Ocean / ERRC',
    slug: 'blue-ocean',
    coreQuestion: 'Which competing factors could we eliminate, reduce, raise or create to stop competing on the same curve?',
    depth: 'chapter',
    readsFrom: [
      'value_propositions',
      'competitors',
      'force_scores',
      'customer_pains_gains',
      'value_map_fit',
      'capabilities_vrio',
      'strategic_options',
    ],
    writesTo: ['value_curve', 'strategic_options', 'assumptions'],
    feedsInto: ['tows', 'theory-of-constraints'],
    bestBefore: ['tows'],
    motionRecipe: 'motion/transform',
    runs: ['reposition-the-company'],
    lesson: 'src/content/frameworks/blue-ocean/lesson.mdx',
    example: [
      {
        company: RELAYDESK,
        role: 'primary',
        note: 'Raise onboarding, eliminate the feature race: a value curve drawn from churn interviews.',
      },
    ],
  },
  {
    id: 'jobs-to-be-done',
    group: 'customer',
    name: 'Jobs to be Done',
    slug: 'jobs-to-be-done',
    coreQuestion: 'What progress is a customer trying to make, in what circumstance, when they hire this?',
    depth: 'chapter',
    readsFrom: ['customer_segments', 'channels', 'performance_metrics'],
    writesTo: ['customer_jobs', 'customer_pains_gains', 'assumptions'],
    feedsInto: ['value-proposition-canvas', 'swot', 'blue-ocean', 'theory-of-constraints'],
    bestBefore: ['value-proposition-canvas'],
    motionRecipe: 'motion/route',
    runs: [
      'validate-an-idea',
      'find-product-market-fit',
      'enter-a-new-market',
      'reposition-the-company',
      'build-a-product-roadmap',
      'find-what-matters-now',
    ],
    lesson: 'src/content/frameworks/jobs-to-be-done/lesson.mdx',
    example: [
      {
        company: RELAYDESK,
        role: 'primary',
        note: 'Fourteen churn interviews replayed as a struggle timeline; the quotes carry the finding.',
      },
    ],
  },
  {
    id: 'value-proposition-canvas',
    group: 'customer',
    name: 'Value Proposition Canvas',
    slug: 'value-proposition-canvas',
    coreQuestion: 'Does what we built actually relieve the pains and create the gains the job requires?',
    depth: 'chapter',
    readsFrom: ['customer_jobs', 'customer_pains_gains', 'value_propositions', 'channels'],
    writesTo: ['value_map_fit', 'open_questions', 'strategic_options'],
    feedsInto: ['kano', 'blue-ocean', 'theory-of-constraints'],
    bestBefore: ['kano'],
    motionRecipe: 'motion/state',
    runs: [
      'validate-an-idea',
      'find-product-market-fit',
      'enter-a-new-market',
      'reposition-the-company',
      'build-a-product-roadmap',
      'find-what-matters-now',
    ],
    lesson: 'src/content/frameworks/value-proposition-canvas/lesson.mdx',
    example: [
      {
        company: RELAYDESK,
        role: 'primary',
        note: 'Two features nothing hires, one pain nothing relieves — the fit score earns its number.',
      },
    ],
  },
  {
    id: 'kano',
    group: 'customer',
    name: 'Kano Model',
    slug: 'kano',
    coreQuestion: 'Which features are expected, which are worth improving, and which would actually delight?',
    depth: 'chapter',
    readsFrom: ['customer_jobs', 'value_map_fit', 'customer_segments', 'performance_metrics'],
    writesTo: ['feature_classifications', 'assumptions'],
    feedsInto: ['okrs', 'theory-of-constraints'],
    bestBefore: ['okrs'],
    motionRecipe: 'motion/state',
    runs: ['find-product-market-fit', 'build-a-product-roadmap', 'find-what-matters-now'],
    lesson: 'src/content/frameworks/kano/lesson.mdx',
    example: [
      {
        company: RELAYDESK,
        role: 'primary',
        note: 'Classifications drawn from transcripts stay labelled hypotheses until a survey says otherwise.',
      },
    ],
  },
  {
    id: 'mckinsey-7s',
    group: 'alignment',
    name: 'McKinsey 7S',
    slug: 'mckinsey-7s',
    coreQuestion: 'Can this organisation, as it is actually built, carry the strategy we just chose?',
    depth: 'chapter',
    readsFrom: [
      'strategic_options',
      'key_activities',
      'capabilities_vrio',
      'capability_gaps',
      'work_assignments',
      'company_profile',
    ],
    writesTo: ['org_alignment', 'capability_gaps', 'risk_register'],
    feedsInto: ['balanced-scorecard', 'okrs', 'raci', 'theory-of-constraints'],
    bestBefore: ['balanced-scorecard', 'okrs', 'raci'],
    motionRecipe: 'motion/state',
    runs: ['align-the-organization', 'find-what-matters-now', 'prepare-for-ai-agents'],
    lesson: 'src/content/frameworks/mckinsey-7s/lesson.mdx',
    example: [
      {
        company: BEACON,
        role: 'primary',
        note: 'One project manager, three crews: structure and staff pull against each other.',
      },
    ],
  },
  {
    id: 'balanced-scorecard',
    group: 'alignment',
    name: 'Balanced Scorecard',
    slug: 'balanced-scorecard',
    coreQuestion: 'What do we measure across financial, customer, internal and learning so the strategy shows up in numbers?',
    depth: 'chapter',
    readsFrom: [
      'strategic_options',
      'org_alignment',
      'financials',
      'performance_metrics',
      'customer_jobs',
      'horizon_portfolio',
      'external_signals',
      'current_constraint',
      'work_assignments',
    ],
    writesTo: ['scorecard_objectives', 'leading_indicators'],
    feedsInto: ['okrs', 'theory-of-constraints'],
    bestBefore: ['okrs'],
    motionRecipe: 'motion/transform',
    runs: ['align-the-organization'],
    lesson: 'src/content/frameworks/balanced-scorecard/lesson.mdx',
    example: [
      {
        company: BEACON,
        role: 'primary',
        note: 'A scorecard that decays the moment nobody writes to it — the failure mode, animated.',
      },
    ],
  },
  {
    id: 'okrs',
    group: 'alignment',
    name: 'OKRs',
    slug: 'okrs',
    coreQuestion: 'What are we trying to achieve this quarter, and how will we know we did?',
    depth: 'chapter',
    readsFrom: [
      'scorecard_objectives',
      'strategic_options',
      'constraint_actions',
      'horizon_portfolio',
      'feature_classifications',
      'capability_gaps',
    ],
    writesTo: ['objectives_okrs', 'work_assignments', 'leading_indicators'],
    feedsInto: ['raci'],
    bestBefore: ['raci'],
    motionRecipe: 'motion/ingest',
    runs: ['build-a-product-roadmap', 'align-the-organization'],
    lesson: 'src/content/frameworks/okrs/lesson.mdx',
    example: [
      {
        company: BEACON,
        role: 'primary',
        note: 'Key results written against the constraint, not against everything at once.',
      },
    ],
  },
  {
    id: 'theory-of-constraints',
    group: 'conductor',
    name: 'Theory of Constraints',
    slug: 'theory-of-constraints',
    coreQuestion: 'What currently limits the throughput of the whole system?',
    depth: 'full',
    readsFrom: [
      'flow_stages',
      'capacity_utilization',
      'delivery_backlog',
      'pipeline',
      'financials',
      'performance_metrics',
      'force_scores',
      'capabilities_vrio',
      'swot_entries',
      'strategic_options',
      'org_alignment',
      'key_activities',
      'horizon_portfolio',
      'customer_jobs',
      'feature_classifications',
      'scorecard_objectives',
      'work_assignments',
    ],
    writesTo: ['current_constraint', 'constraint_actions', 'leading_indicators', 'flow_stages'],
    feedsInto: ['raci', 'okrs', 'balanced-scorecard'],
    bestBefore: ['raci', 'okrs'],
    motionRecipe: 'fw/toc-flow',
    runs: [
      'find-product-market-fit',
      'build-a-product-roadmap',
      'find-what-matters-now',
      'align-the-organization',
      'prepare-for-ai-agents',
    ],
    lesson: 'src/content/frameworks/theory-of-constraints/lesson.mdx',
    example: [
      {
        company: BEACON,
        role: 'primary',
        note: 'Install capacity at 93% while service sits at 73%: the pipe narrows in exactly one place.',
      },
      {
        company: RELAYDESK,
        role: 'secondary',
        note: 'The constraint is onboarding, which is why more trials changed nothing.',
      },
    ],
  },
  {
    id: 'raci',
    group: 'delegation',
    name: 'RACI',
    slug: 'raci',
    coreQuestion:
      'Who — or what — performs each activity, who owns the outcome, and where must a human stop the work?',
    depth: 'full',
    readsFrom: [
      'key_activities',
      'constraint_actions',
      'objectives_okrs',
      'work_assignments',
      'org_alignment',
    ],
    writesTo: ['work_assignments', 'capability_boundaries', 'risk_register'],
    feedsInto: ['balanced-scorecard', 'theory-of-constraints'],
    bestBefore: ['balanced-scorecard'],
    motionRecipe: 'fw/raci-route',
    runs: [
      'build-a-product-roadmap',
      'find-what-matters-now',
      'align-the-organization',
      'prepare-for-ai-agents',
    ],
    lesson: 'src/content/frameworks/raci/lesson.mdx',
    example: [
      {
        company: BEACON,
        role: 'primary',
        note: 'Change orders queue behind one approver; the packet stops and waits for a human signature.',
      },
      {
        company: LANTERN,
        role: 'secondary',
        note: 'Agent-run research with a named human accountable — capability boundaries written down.',
      },
    ],
  },
];
