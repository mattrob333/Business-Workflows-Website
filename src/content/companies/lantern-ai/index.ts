import type { Company } from '../types';
import { LANTERN_EVIDENCE } from './evidence';
import { lanternProfile } from './profile';
import { lanternStory } from './story';

export { LANTERN_DERIVED, LANTERN_EVIDENCE, LANTERN_FIGURES } from './evidence';
export { lanternProfile } from './profile';
export { lanternStory } from './story';

export const lanternAi: Company = {
  id: 'lantern-ai',
  name: 'Lantern AI',
  evidence: LANTERN_EVIDENCE,
  profile: lanternProfile,
  story: lanternStory,
};
