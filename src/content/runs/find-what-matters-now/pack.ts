/**
 * The run's single doorway into Beacon Mechanical's authored pack.
 *
 * Same discipline as the framework-page configs (`components/framework-page/configs/bmc.tsx`):
 * every figure the run displays is reached through an accessor that **throws** if the pack
 * does not contain it, so a step citing something that was renamed or removed fails the
 * static export rather than shipping a number with nothing under it (00-LAW Ruling 4).
 *
 * Matching is by opening words and by label rather than by array index, deliberately: the
 * pack is an authored document and someone will reorder it. A run that silently rendered the
 * wrong claim after a reorder would be exactly the failure the honesty engine exists to stop.
 */

import {
  BEACON_DERIVED,
  BEACON_FIGURES,
  beaconMechanical,
  beaconProfile,
  beaconStory,
} from '@/content/companies/beacon-mechanical';
import type { CapabilityEntry, Segment } from '@/content/companies';
import type { Claim, Metric } from '@/lib/claim';

export const company = beaconMechanical;
export const D = BEACON_DERIVED;
export const F = BEACON_FIGURES;
export { beaconProfile, beaconStory };

/* -------------------------------------------------------------- the story */

/** A constraint beat, matched on its opening words. */
export function beat(prefix: string): Claim {
  const found = beaconStory.constraint.beats.find((c) => c.text.startsWith(prefix));
  if (!found) throw new Error(`Beacon's story has no constraint beat starting "${prefix}"`);
  return found;
}

/** A plausible wrong answer, with the evidence that rejects it. */
export function misreading(prefix: string): Claim {
  const found = beaconStory.constraint.misreadings.find((c) => c.text.startsWith(prefix));
  if (!found) throw new Error(`Beacon's story has no misreading starting "${prefix}"`);
  return found;
}

export function headline(prefix: string): Claim {
  const found = beaconProfile.headline.find((c) => c.text.startsWith(prefix));
  if (!found) throw new Error(`Beacon's profile has no headline claim starting "${prefix}"`);
  return found;
}

/* ------------------------------------------------------------- the profile */

export function operating(label: string): Metric {
  const found = beaconProfile.operating.items.find((m) => m.label === label);
  if (!found) throw new Error(`Beacon's operating measures have no "${label}"`);
  return found;
}

export function revenueLine(label: string): Metric {
  const found = beaconProfile.revenueMix.items.find((m) => m.label === label);
  if (!found) throw new Error(`Beacon's revenue mix has no line "${label}"`);
  return found;
}

export function capability(name: string): CapabilityEntry {
  const found = beaconProfile.capabilities.items.find((c) => c.name === name);
  if (!found) throw new Error(`Beacon's profile has no capability "${name}"`);
  return found;
}

export function measure(capabilityName: string, label: string): Metric {
  const found = capability(capabilityName).measures.find((m) => m.label === label);
  if (!found) throw new Error(`Beacon's "${capabilityName}" has no measure "${label}"`);
  return found;
}

export function segment(name: string): Segment {
  const found = beaconProfile.segments.items.find((s) => s.name === name);
  if (!found) throw new Error(`Beacon's profile has no segment "${name}"`);
  return found;
}

export function segmentNote(name: string, prefix: string): Claim {
  const note = segment(name).notes.find((n) => n.text.startsWith(prefix));
  if (!note) throw new Error(`Beacon's "${name}" segment has no note starting "${prefix}"`);
  return note;
}

export function org(role: string): Claim {
  const found = beaconProfile.org.items.find((u) => u.role === role);
  if (!found) throw new Error(`Beacon's profile has no role "${role}"`);
  return found.note;
}

export function system(name: string): Claim {
  const found = beaconProfile.systems.items.find((s) => s.name === name);
  if (!found) throw new Error(`Beacon's profile has no system of record "${name}"`);
  return found.note;
}

export function valueProof(segmentName: string, prefix: string): Claim {
  const entry = beaconProfile.valuePropositions.items.find((v) => v.segment === segmentName);
  if (!entry) throw new Error(`Beacon's profile has no value proposition for "${segmentName}"`);
  const proof = entry.proof.find((p) => p.text.startsWith(prefix));
  if (!proof) throw new Error(`Beacon's "${segmentName}" promise has no proof starting "${prefix}"`);
  return proof;
}

/* ------------------------------------------------------- named capabilities */

export const CREW = 'Complex retrofit installation';
export const COVERAGE = 'Contracted service coverage';
export const ESTIMATING = 'Estimating and bid conversion';
export const APPROVER = 'Single-approver project control';

/* ------------------------------------------------------ the conductor model */

/** Stage capacities are `projects / yr` throughout the run, as on the conductor page. */
export const UNIT = 'projects / yr';

/**
 * The one derived capacity in the whole model: forty-seven projects completed at ninety-three
 * per cent crew utilisation is what the stage carries at full utilisation. Arithmetic on the
 * pack, matching `components/framework-page/configs/theory-of-constraints.tsx` exactly — the
 * run and the framework page must not disagree about the number the diagnosis rests on.
 */
export const INSTALL_CAPACITY = Math.round(F.projectsCompletedTtm / (D.installUtilization / 100));

/** The five stages, one unit. Only the narrow one has to be right. */
export const STAGE_CAPACITY = {
  estimating: F.proposalsWonTtm,
  approvals: 58,
  installation: INSTALL_CAPACITY,
  commissioning: 56,
  invoicing: 66,
} as const;
