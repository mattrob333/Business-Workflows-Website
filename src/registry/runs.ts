/**
 * Strategy Runs — guided framework combinations, organised by business problem.
 *
 * Sequences are appendix §5, adopted law-by-reference (00-LAW Ruling 8). Run 7,
 * "fix stalled growth", is the flagship the LAW scopes into v1 under its product name
 * *Find What Matters Now* (00-LAW Ruling 3, 03-content-spec): Beacon Mechanical through
 * BMC → Five Forces + VRIO → SWOT/TOWS → Theory of Constraints → RACI, twelve scripted
 * steps. The step list is typed here and stubbed — S5 authors the reveal copy.
 */

import type { FrameworkId } from './frameworks';
import type { StateField } from './state-fields';

export const STRATEGY_RUN_IDS = [
  'validate-an-idea',
  'find-product-market-fit',
  'choose-a-growth-path',
  'enter-a-new-market',
  'reposition-the-company',
  'build-a-product-roadmap',
  'find-what-matters-now',
  'align-the-organization',
  'prepare-for-ai-agents',
] as const;

export type StrategyRunId = (typeof STRATEGY_RUN_IDS)[number];

/** The learning mechanics of appendix §9, as a closed set. */
export type RunInteraction =
  | 'prediction'
  | 'assumption-slider'
  | 'lens-compare'
  | 'event-injection'
  | 'consequence'
  | 'replay';

export interface RunStep {
  /** 1-based position in the scripted run. */
  readonly n: number;
  readonly framework: FrameworkId;
  readonly title: string;
  /** State the step is handed. */
  readonly stateIn: StateField[];
  /** State the step writes back — the save file, visibly growing. */
  readonly stateOut: StateField[];
  readonly interaction: RunInteraction;
  /** Authored analysis copy. `null` until S5 writes it. */
  readonly reveal: string | null;
  /** Challenge-mode prompt shown before the reveal. `null` until S5 writes it. */
  readonly predictionPrompt: string | null;
}

/** Run 7 branches on the constraint the diagnosis lands on. */
export interface RunBranch {
  readonly constraintType: string;
  readonly when: string;
  readonly frameworks: FrameworkId[];
  readonly note: string;
}

export interface StrategyRun {
  readonly id: StrategyRunId;
  readonly slug: string;
  readonly title: string;
  readonly businessQuestion: string;
  readonly sequence: FrameworkId[];
  readonly branches: RunBranch[];
  readonly bestFor: string[];
  readonly outcomes: string[];
  /** Exactly one run is the flagship in v1. */
  readonly flagship: boolean;
  /** Scripted steps. Populated for the flagship; the rest arrive in Phase 3. */
  readonly steps: RunStep[];
}

/** The twelve steps of *Find What Matters Now* (03-content-spec). Copy lands in S5. */
const FIND_WHAT_MATTERS_NOW_STEPS: RunStep[] = [
  {
    n: 1,
    framework: 'bmc',
    title: 'The board state',
    stateIn: ['company_profile', 'financials', 'performance_metrics'],
    stateOut: ['customer_segments', 'value_propositions', 'revenue_streams', 'key_activities'],
    interaction: 'prediction',
    reveal: null,
    predictionPrompt: null,
  },
  {
    n: 2,
    framework: 'bmc',
    title: 'Two blocks disagree',
    stateIn: ['revenue_streams', 'key_resources', 'key_activities', 'cost_structure'],
    stateOut: ['model_contradictions', 'assumptions', 'open_questions'],
    interaction: 'lens-compare',
    reveal: null,
    predictionPrompt: null,
  },
  {
    n: 3,
    framework: 'five-forces',
    title: 'Where the power sits',
    stateIn: ['competitors', 'customer_concentration', 'key_partners', 'customer_segments'],
    stateOut: ['force_scores'],
    interaction: 'assumption-slider',
    reveal: null,
    predictionPrompt: null,
  },
  {
    n: 4,
    framework: 'five-forces',
    title: 'The concentration question, through four lenses',
    stateIn: ['force_scores', 'customer_concentration'],
    stateOut: ['primary_economic_pressure', 'risk_register'],
    interaction: 'lens-compare',
    reveal: null,
    predictionPrompt: null,
  },
  {
    n: 5,
    framework: 'vrio',
    title: 'Four capabilities, four gates',
    stateIn: ['key_resources', 'key_activities', 'competitors', 'performance_metrics'],
    stateOut: ['capabilities_vrio'],
    interaction: 'prediction',
    reveal: null,
    predictionPrompt: null,
  },
  {
    n: 6,
    framework: 'vrio',
    title: 'The advantage that is also the bottleneck',
    stateIn: ['capabilities_vrio', 'capacity_utilization'],
    stateOut: ['capability_gaps'],
    interaction: 'consequence',
    reveal: null,
    predictionPrompt: null,
  },
  {
    n: 7,
    framework: 'swot',
    title: 'Collect — with evidence strength attached',
    stateIn: ['capabilities_vrio', 'capability_gaps', 'force_scores', 'external_signals'],
    stateOut: ['swot_entries'],
    interaction: 'prediction',
    reveal: null,
    predictionPrompt: null,
  },
  {
    n: 8,
    framework: 'tows',
    title: 'The cross mints options',
    stateIn: ['swot_entries', 'force_scores'],
    stateOut: ['strategic_options', 'assumptions'],
    interaction: 'prediction',
    reveal: null,
    predictionPrompt: null,
  },
  {
    n: 9,
    framework: 'tows',
    title: 'A competitor raises capital — which frameworks re-run?',
    stateIn: ['strategic_options', 'external_signals', 'competitors'],
    stateOut: ['risk_register', 'strategic_options'],
    interaction: 'event-injection',
    reveal: null,
    predictionPrompt: null,
  },
  {
    n: 10,
    framework: 'theory-of-constraints',
    title: 'The pipe narrows in exactly one place',
    stateIn: ['flow_stages', 'capacity_utilization', 'delivery_backlog', 'pipeline'],
    stateOut: ['current_constraint'],
    interaction: 'prediction',
    reveal: null,
    predictionPrompt: null,
  },
  {
    n: 11,
    framework: 'theory-of-constraints',
    title: 'Improve a non-constraint, change nothing',
    stateIn: ['current_constraint', 'flow_stages', 'strategic_options'],
    stateOut: ['constraint_actions', 'leading_indicators'],
    interaction: 'consequence',
    reveal: null,
    predictionPrompt: null,
  },
  {
    n: 12,
    framework: 'raci',
    title: 'Route the work — accountability stays human',
    stateIn: ['constraint_actions', 'key_activities', 'org_alignment'],
    stateOut: ['work_assignments', 'capability_boundaries'],
    interaction: 'replay',
    reveal: null,
    predictionPrompt: null,
  },
];

export const STRATEGY_RUNS: readonly StrategyRun[] = [
  {
    id: 'validate-an-idea',
    slug: 'validate-an-idea',
    title: 'Validate a business idea',
    businessQuestion: 'Is there a business here, or only an intention?',
    sequence: ['bmc', 'jobs-to-be-done', 'value-proposition-canvas', 'five-forces', 'vrio'],
    branches: [],
    bestFor: ['Pre-launch founders', 'A new line inside an existing company'],
    outcomes: [
      'A model written down instead of carried in one head',
      'The job the product would be hired for, in the customer’s words',
      'The two or three assumptions the whole idea rests on',
      'A market read before the first hire, not after',
    ],
    flagship: false,
    steps: [],
  },
  {
    id: 'find-product-market-fit',
    slug: 'find-product-market-fit',
    title: 'Find product–market fit',
    businessQuestion: 'People try it. Why don’t they stay?',
    sequence: ['jobs-to-be-done', 'value-proposition-canvas', 'kano', 'bmc', 'theory-of-constraints'],
    branches: [],
    bestFor: ['Products with traffic and no retention', 'Post-launch teams guessing at a roadmap'],
    outcomes: [
      'Jobs and pains separated from feature requests',
      'A fit score with the unsupported jobs named',
      'Kano classifications, honestly labelled as hypotheses until surveyed',
      'The stage of the funnel that is actually limiting growth',
    ],
    flagship: false,
    steps: [],
  },
  {
    id: 'choose-a-growth-path',
    slug: 'choose-a-growth-path',
    title: 'Choose a growth path',
    businessQuestion: 'We could grow in four directions. Which one are we equipped for?',
    sequence: [
      'bmc',
      'five-forces',
      'pestle',
      'vrio',
      'swot',
      'tows',
      'ansoff',
      'three-horizons',
    ],
    branches: [],
    bestFor: ['Profitable businesses with more options than capacity', 'Annual planning'],
    outcomes: [
      'Options ranked by required capability, not by enthusiasm',
      'The forces and signals that make one route cheaper than another',
      'A horizon allocation that shows what is being starved',
    ],
    flagship: false,
    steps: [],
  },
  {
    id: 'enter-a-new-market',
    slug: 'enter-a-new-market',
    title: 'Enter a new market',
    businessQuestion: 'What does this market actually reward, and do we have it?',
    sequence: [
      'pestle',
      'five-forces',
      'ansoff',
      'jobs-to-be-done',
      'value-proposition-canvas',
      'vrio',
    ],
    branches: [],
    bestFor: ['Geographic or segment expansion', 'Startups choosing a beachhead'],
    outcomes: [
      'The external conditions that would make entry a mistake',
      'A read on where power sits before the first sales hire',
      'The capability gap between here and credible there',
    ],
    flagship: false,
    steps: [],
  },
  {
    id: 'reposition-the-company',
    slug: 'reposition-the-company',
    title: 'Reposition the company',
    businessQuestion: 'We are competing on the same curve as everyone else. How do we stop?',
    sequence: [
      'five-forces',
      'jobs-to-be-done',
      'value-proposition-canvas',
      'vrio',
      'blue-ocean',
      'tows',
    ],
    branches: [],
    bestFor: ['Commoditising markets', 'Rising acquisition cost with flat differentiation'],
    outcomes: [
      'The competing factors everyone in the market over-serves',
      'A candidate value curve with cost implications attached',
      'Repositioning options crossed against real capabilities',
    ],
    flagship: false,
    steps: [],
  },
  {
    id: 'build-a-product-roadmap',
    slug: 'build-a-product-roadmap',
    title: 'Build a product roadmap',
    businessQuestion: 'Everything is a priority. What goes first, and why?',
    sequence: [
      'jobs-to-be-done',
      'value-proposition-canvas',
      'kano',
      'theory-of-constraints',
      'okrs',
      'raci',
    ],
    branches: [],
    bestFor: ['Product teams with a backlog and no argument-settling mechanism'],
    outcomes: [
      'A roadmap ordered by constraint, not by loudest stakeholder',
      'Key results tied to the thing that limits throughput',
      'Named accountability per initiative before work starts',
    ],
    flagship: false,
    steps: [],
  },
  {
    id: 'find-what-matters-now',
    slug: 'find-what-matters-now',
    title: 'Find What Matters Now',
    businessQuestion:
      'Revenue is up and output is flat. A hundred true findings — which one is binding?',
    sequence: [
      'bmc',
      'five-forces',
      'vrio',
      'swot',
      'tows',
      'theory-of-constraints',
      'raci',
    ],
    branches: [
      {
        constraintType: 'demand',
        when: 'Pipeline is thin and win rates are falling',
        frameworks: ['five-forces', 'jobs-to-be-done'],
        note: 'Re-read the terrain and the job before adding sales headcount.',
      },
      {
        constraintType: 'delivery',
        when: 'Work is sold faster than it is completed and the queue is ageing',
        frameworks: ['mckinsey-7s', 'theory-of-constraints'],
        note: 'The Beacon branch: structure, staff and systems around the constrained stage.',
      },
      {
        constraintType: 'decision',
        when: 'Work waits on approvals rather than on capacity',
        frameworks: ['raci'],
        note: 'Unowned tasks and excessive approval chains are a throughput problem.',
      },
      {
        constraintType: 'product',
        when: 'Customers arrive and leave for reasons the product controls',
        frameworks: ['value-proposition-canvas', 'kano'],
        note: 'Fit before funnel.',
      },
      {
        constraintType: 'capability',
        when: 'The chosen direction needs something the company does not have',
        frameworks: ['vrio', 'mckinsey-7s'],
        note: 'Buy, build or drop the option — decided against evidence.',
      },
    ],
    bestFor: [
      'Growing revenue with flat output',
      'Teams busy everywhere and moving nowhere',
      'Anyone with a strategy document and no idea what to do on Monday',
    ],
    outcomes: [
      'One named constraint with its evidence and confidence',
      'Exploit, subordinate and elevate actions in that order',
      'The conditions under which the constraint will move next',
      'Work routed to people and agents with accountability held by a named human',
    ],
    flagship: true,
    steps: FIND_WHAT_MATTERS_NOW_STEPS,
  },
  {
    id: 'align-the-organization',
    slug: 'align-the-organization',
    title: 'Align an organisation',
    businessQuestion: 'We agreed on the strategy. Why is nothing moving?',
    sequence: ['tows', 'mckinsey-7s', 'balanced-scorecard', 'okrs', 'raci', 'theory-of-constraints'],
    branches: [],
    bestFor: ['Post-merger integration', 'Strategy that keeps failing at execution'],
    outcomes: [
      'The 7S elements pulling against the chosen strategy, named',
      'Objectives and measures that someone actually writes to',
      'A delegation map where every outcome has one accountable human',
    ],
    flagship: false,
    steps: [],
  },
  {
    id: 'prepare-for-ai-agents',
    slug: 'prepare-for-ai-agents',
    title: 'Prepare for AI agents',
    businessQuestion: 'Which work can be delegated to agents without losing accountability?',
    sequence: ['bmc', 'mckinsey-7s', 'theory-of-constraints', 'raci'],
    branches: [],
    bestFor: ['Operators piloting agents', 'Teams writing their first delegation policy'],
    outcomes: [
      'Key activities separated into human judgement and routable work',
      'Capability boundaries: tools, data scope, spending limits, approval thresholds',
      'An attestation trail that survives an audit',
    ],
    flagship: false,
    steps: [],
  },
];
