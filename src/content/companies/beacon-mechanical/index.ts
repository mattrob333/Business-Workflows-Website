import type { Company } from '../types';
import { BEACON_EVIDENCE } from './evidence';
import { beaconProfile } from './profile';
import { beaconStory } from './story';

export { BEACON_DERIVED, BEACON_EVIDENCE, BEACON_FIGURES } from './evidence';
export { beaconProfile } from './profile';
export { beaconStory } from './story';

export const beaconMechanical: Company = {
  id: 'beacon-mechanical',
  name: 'Beacon Mechanical',
  evidence: BEACON_EVIDENCE,
  profile: beaconProfile,
  story: beaconStory,
};
