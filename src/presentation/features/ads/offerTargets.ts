/** Targets the offer form may use. Extended to all six by T-F055 (needs B20). */
export const OFFER_TARGETS_ENABLED = ['NONE', 'URL'] as const;

export type OfferTargetEnabled = (typeof OFFER_TARGETS_ENABLED)[number];
