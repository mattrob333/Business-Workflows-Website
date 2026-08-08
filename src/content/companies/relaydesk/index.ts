import type { Company } from '../types';
import { RELAYDESK_EVIDENCE } from './evidence';
import { relaydeskProfile } from './profile';
import { relaydeskStory } from './story';

export { RELAYDESK_DERIVED, RELAYDESK_EVIDENCE, RELAYDESK_FIGURES } from './evidence';
export { relaydeskProfile } from './profile';
export { relaydeskStory } from './story';

export const relaydesk: Company = {
  id: 'relaydesk',
  name: 'RelayDesk',
  evidence: RELAYDESK_EVIDENCE,
  profile: relaydeskProfile,
  story: relaydeskStory,
};
