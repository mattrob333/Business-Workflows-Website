/**
 * The shared-business-state vocabulary.
 *
 * 02-architecture: "Frameworks never pass prose to each other — they pass these fields."
 * Derived from the appendix §1D workspace list and the §3 per-framework outputs.
 * In v1 these fields describe the authored example-company data flowing between pages;
 * in Phase 2 the same identifiers become the user workspace schema. Renaming one is a
 * breaking change to the whole stack — add, don't rewrite.
 */

export const STATE_FIELD_IDS = [
  // --- The model (BMC's nine blocks + what the canvas exposes) ---
  'company_profile',
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

  // --- Measurement (cross-cutting; every framework may read these) ---
  'financials',
  'performance_metrics',
  'pipeline',

  // --- Terrain ---
  'competitors',
  'customer_concentration',
  'force_scores',
  'primary_economic_pressure',
  'external_signals',
  'leading_indicators',

  // --- Advantage ---
  'swot_entries',
  'capabilities_vrio',
  'capability_gaps',
  'strategic_options',

  // --- Direction ---
  'horizon_portfolio',
  'value_curve',

  // --- Customer ---
  'customer_jobs',
  'customer_pains_gains',
  'value_map_fit',
  'feature_classifications',

  // --- Alignment ---
  'org_alignment',
  'scorecard_objectives',
  'objectives_okrs',

  // --- Conductor (Theory of Constraints) ---
  'flow_stages',
  'capacity_utilization',
  'delivery_backlog',
  'current_constraint',
  'constraint_actions',

  // --- Delegation ---
  'work_assignments',
  'capability_boundaries',
] as const;

export type StateField = (typeof STATE_FIELD_IDS)[number];

export interface StateFieldMeta {
  readonly id: StateField;
  readonly label: string;
  readonly description: string;
}

export const STATE_FIELDS: readonly StateFieldMeta[] = [
  {
    id: 'company_profile',
    label: 'Company profile',
    description:
      'What the business is: sector, size, geography, operating shape. The one field every framework may assume exists.',
  },
  {
    id: 'customer_segments',
    label: 'Customer segments',
    description:
      'Distinct groups the business serves, with size, share of revenue, and how they differ in behaviour.',
  },
  {
    id: 'value_propositions',
    label: 'Value propositions',
    description: 'What the business promises each segment, and the proof it can keep the promise.',
  },
  {
    id: 'channels',
    label: 'Channels',
    description: 'How value reaches each segment — sales motion, delivery route, service surface.',
  },
  {
    id: 'customer_relationships',
    label: 'Customer relationships',
    description:
      'The kind of relationship each segment expects: contracted, transactional, advisory, self-serve.',
  },
  {
    id: 'revenue_streams',
    label: 'Revenue streams',
    description:
      'Where money actually comes from, by line, with pricing model and share of total revenue.',
  },
  {
    id: 'key_resources',
    label: 'Key resources',
    description: 'Assets the model depends on: people, equipment, data, licences, brand, capital.',
  },
  {
    id: 'key_activities',
    label: 'Key activities',
    description: 'The work the business must perform for the model to function. RACI routes these.',
  },
  {
    id: 'key_partners',
    label: 'Key partners',
    description: 'Suppliers, distributors, and alliances the model leans on, with terms and concentration.',
  },
  {
    id: 'cost_structure',
    label: 'Cost structure',
    description: 'Where the money goes: fixed vs variable, and which activities and resources drive it.',
  },
  {
    id: 'assumptions',
    label: 'Assumptions',
    description:
      'Beliefs the model rests on that are not yet evidenced. Carried as claims with status "assumption".',
  },
  {
    id: 'model_contradictions',
    label: 'Contradictions',
    description:
      'Places where two parts of the model cannot both be true. Surfaced, never silently reconciled.',
  },
  {
    id: 'open_questions',
    label: 'Open questions',
    description:
      'Information the analysis needs and does not have. Drives the adaptive questions in Phase 2.',
  },
  {
    id: 'risk_register',
    label: 'Risks',
    description: 'Named risks with likelihood, impact, and the indicator that would show them arriving.',
  },
  {
    id: 'financials',
    label: 'Financials',
    description: 'Revenue, margin, cash, and the ratios derived from them. Every figure carries evidence.',
  },
  {
    id: 'performance_metrics',
    label: 'Performance metrics',
    description: 'Operating measures over time — the numbers that show whether the model is working.',
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    description: 'Demand ahead of the business: quotes, opportunities, trials, signed-but-unstarted work.',
  },
  {
    id: 'competitors',
    label: 'Competitors',
    description: 'Who else serves these segments, on what basis they win, and how they are moving.',
  },
  {
    id: 'customer_concentration',
    label: 'Customer concentration',
    description:
      'Share of revenue held by the largest customers — the single most load-bearing buyer-power input.',
  },
  {
    id: 'force_scores',
    label: 'Force scores',
    description:
      'The five competitive forces scored 0–10 with the evidence and confidence behind each score.',
  },
  {
    id: 'primary_economic_pressure',
    label: 'Primary economic pressure',
    description: 'Which single force most determines profitability in this market right now.',
  },
  {
    id: 'external_signals',
    label: 'External signals',
    description:
      'PESTLE signals with likelihood, impact, horizon, direction, and the components they touch.',
  },
  {
    id: 'leading_indicators',
    label: 'Leading indicators',
    description:
      'Measures that move before outcomes do — early warning for signals, constraints, and objectives.',
  },
  {
    id: 'swot_entries',
    label: 'SWOT entries',
    description:
      'Strengths, weaknesses, opportunities, threats — each with evidence strength, importance, controllability.',
  },
  {
    id: 'capabilities_vrio',
    label: 'Capabilities (VRIO)',
    description:
      'Capabilities scored valuable / rare / inimitable / organised, classified parity → sustained.',
  },
  {
    id: 'capability_gaps',
    label: 'Capability gaps',
    description: 'Capabilities the chosen direction requires that the business does not yet hold.',
  },
  {
    id: 'strategic_options',
    label: 'Strategic options',
    description:
      'Candidate moves with required capabilities, assumptions, relative risk, and expected upside.',
  },
  {
    id: 'horizon_portfolio',
    label: 'Horizon portfolio',
    description: 'Initiatives allocated across H1 core, H2 scaling, H3 options, with the starvation gaps.',
  },
  {
    id: 'value_curve',
    label: 'Value curve',
    description: 'The competing factors and the level offered on each — the ERRC candidate position.',
  },
  {
    id: 'customer_jobs',
    label: 'Customer jobs',
    description:
      'Functional, emotional, and social jobs in a circumstance, with hiring criteria and alternatives.',
  },
  {
    id: 'customer_pains_gains',
    label: 'Pains and gains',
    description: 'What obstructs progress and what counts as a better outcome, with frequency and importance.',
  },
  {
    id: 'value_map_fit',
    label: 'Value-map fit',
    description: 'Which jobs are supported, which pains relieved, which features irrelevant — and the fit score.',
  },
  {
    id: 'feature_classifications',
    label: 'Feature classifications',
    description:
      'Kano classes (must-be, performance, delighter, indifferent, reverse) per segment. Hypotheses until surveyed.',
  },
  {
    id: 'org_alignment',
    label: 'Organisational alignment',
    description: 'The 7S elements scored current vs required, with the tension between them made explicit.',
  },
  {
    id: 'scorecard_objectives',
    label: 'Scorecard objectives',
    description:
      'Financial, customer, internal, and learning objectives with measures and cause-effect links.',
  },
  {
    id: 'objectives_okrs',
    label: 'Objectives and key results',
    description: 'Objectives, key results, owners, baselines, targets, cadence, and confidence.',
  },
  {
    id: 'flow_stages',
    label: 'Flow stages',
    description:
      'The system as a pipe — demand, sales, onboarding, delivery, billing, retention — with throughput per stage.',
  },
  {
    id: 'capacity_utilization',
    label: 'Capacity utilisation',
    description: 'Available vs consumed capacity per stage or resource pool. The constraint hides here.',
  },
  {
    id: 'delivery_backlog',
    label: 'Delivery backlog',
    description: 'Work committed but not yet delivered, with age and wait time. Queues reveal bottlenecks.',
  },
  {
    id: 'current_constraint',
    label: 'Current constraint',
    description:
      'The one stage limiting throughput of the whole system, its type, evidence, and confidence.',
  },
  {
    id: 'constraint_actions',
    label: 'Constraint actions',
    description: 'Exploit, subordinate, and elevate actions, plus the conditions under which the constraint moves.',
  },
  {
    id: 'work_assignments',
    label: 'Work assignments',
    description:
      'Who or what performs each activity: responsible (may be an agent), accountable (always a named human), consulted, informed.',
  },
  {
    id: 'capability_boundaries',
    label: 'Capability boundaries',
    description:
      'Limits on delegated work: allowed tools and systems, data scope, spending limits, approval thresholds, revocation.',
  },
];

const BY_ID = new Map<StateField, StateFieldMeta>(STATE_FIELDS.map((f) => [f.id, f]));

export function stateField(id: StateField): StateFieldMeta {
  const meta = BY_ID.get(id);
  if (!meta) throw new Error(`Unknown state field: ${id}`);
  return meta;
}

export function isStateField(value: string): value is StateField {
  return BY_ID.has(value as StateField);
}
