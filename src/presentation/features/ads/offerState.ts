import type { Offer, OfferState } from '../../../domain/entities/Offer';

/** Client-side state derivation: ENDED → SCHEDULED → ACTIVE/PAUSED. */
export function getOfferState(offer: Pick<Offer, 'isActive' | 'startDate' | 'endDate'>, now: number = Date.now()): OfferState {
  if (offer.endDate && new Date(offer.endDate).getTime() < now) return 'ENDED';
  if (offer.startDate && new Date(offer.startDate).getTime() > now) return 'SCHEDULED';
  return offer.isActive ? 'ACTIVE' : 'PAUSED';
}
