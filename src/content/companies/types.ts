/**
 * The authored example-company model.
 *
 * Every section of a profile is bound at compile time to a state field from the registry
 * vocabulary — the profile *is* shared business state, hand-authored for v1 (Ruling 3) and
 * shaped exactly like the workspace state Phase 2 will write. Numbers appear only as
 * `Metric`s, which cannot exist without an evidence reference (Ruling 4).
 */

import type { FrameworkId } from '@/registry/frameworks';
import type { StateField } from '@/registry/state-fields';
import type { Claim, Evidence, EvidenceCarrier, Metric } from '@/lib/claim';

export const COMPANY_IDS = ['beacon-mechanical', 'relaydesk', 'lantern-ai'] as const;
export type CompanyId = (typeof COMPANY_IDS)[number];

/** A slice of company state: the field it populates, and the authored items in it. */
export interface ProfileSection<F extends StateField, T> {
  readonly field: F;
  readonly label: string;
  readonly items: readonly T[];
}

export interface Segment {
  readonly name: string;
  readonly description: string;
  readonly shareOfRevenue: Metric;
  readonly notes: readonly Claim[];
}

export interface ValuePropositionEntry {
  readonly segment: string;
  readonly promise: Claim;
  readonly proof: readonly Claim[];
}

export interface CapabilityEntry {
  readonly name: string;
  readonly description: string;
  readonly assessment: Claim;
  readonly measures: readonly Metric[];
}

export interface OrgUnit {
  readonly role: string;
  readonly headcount: Metric;
  readonly owns: string;
  readonly note: Claim;
}

export interface SystemEntry {
  readonly name: string;
  readonly supports: string;
  readonly note: Claim;
}

export interface CompanyProfile {
  readonly id: CompanyId;
  readonly name: string;
  readonly sector: string;
  readonly oneLiner: string;
  readonly headline: readonly Claim[];
  readonly segments: ProfileSection<'customer_segments', Segment>;
  readonly valuePropositions: ProfileSection<'value_propositions', ValuePropositionEntry>;
  readonly revenueMix: ProfileSection<'revenue_streams', Metric>;
  readonly capabilities: ProfileSection<'key_resources', CapabilityEntry>;
  readonly org: ProfileSection<'work_assignments', OrgUnit>;
  readonly systems: ProfileSection<'key_activities', SystemEntry>;
  readonly operating: ProfileSection<'performance_metrics', Metric>;
  /** Every state field this authored pack populates. Validated against the registry. */
  readonly fieldsPopulated: readonly StateField[];
}

export interface FrameworkDemo {
  readonly framework: FrameworkId;
  /** What this company shows when that framework runs on it. */
  readonly beat: string;
}

export interface CompanyStory {
  readonly id: CompanyId;
  /** The situation, in three or four beats. */
  readonly challenge: readonly string[];
  readonly constraint: {
    readonly headline: string;
    readonly beats: readonly Claim[];
    readonly diagnosis: Claim;
    /** The plausible wrong answers, and why the evidence rejects them. */
    readonly misreadings: readonly Claim[];
  };
  readonly demonstrates: readonly FrameworkDemo[];
  /** One line, Newsreader italic, quotable (03-content-spec voice rules). */
  readonly pullQuote: string;
}

export interface Company extends EvidenceCarrier {
  readonly id: CompanyId;
  readonly name: string;
  readonly evidence: readonly Evidence[];
  readonly profile: CompanyProfile;
  readonly story: CompanyStory;
}
