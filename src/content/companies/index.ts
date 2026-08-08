/**
 * The three v1 example companies (00-LAW Ruling 3, 03-content-spec).
 *
 * All fictional, forever (Ruling 4). Hearth & Pine, Northstar Clinics and Atlas Industrial
 * are named on the examples index as "in the lab" and ship in later phases.
 */

import { beaconMechanical } from './beacon-mechanical';
import { lanternAi } from './lantern-ai';
import { relaydesk } from './relaydesk';
import type { Company, CompanyId } from './types';

export * from './types';
export { beaconMechanical } from './beacon-mechanical';
export { relaydesk } from './relaydesk';
export { lanternAi } from './lantern-ai';

export const COMPANIES: readonly Company[] = [beaconMechanical, relaydesk, lanternAi];

const BY_ID = new Map<CompanyId, Company>(COMPANIES.map((c) => [c.id, c]));

export function companyById(id: CompanyId): Company {
  const company = BY_ID.get(id);
  if (!company) throw new Error(`Unknown company: ${id}`);
  return company;
}

export function companyBySlug(slug: string): Company | undefined {
  return BY_ID.get(slug as CompanyId);
}
