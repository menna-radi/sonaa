import type { Campaign } from '../../../../domain/repositories/AdRepository';

export type CampaignDerivedState = 'ACTIVE' | 'PAUSED' | 'SCHEDULED' | 'ENDED';

/** Derived display state: ENDED → SCHEDULED → stored status. */
export function getCampaignState(camp: Pick<Campaign, 'status' | 'startDate' | 'endDate'>, now: number = Date.now()): CampaignDerivedState {
  if (camp.status === 'Ended') return 'ENDED';
  if (camp.endDate && new Date(camp.endDate).getTime() < now) return 'ENDED';
  if (camp.startDate && new Date(camp.startDate).getTime() > now) return 'SCHEDULED';
  return camp.status === 'Paused' ? 'PAUSED' : 'ACTIVE';
}
