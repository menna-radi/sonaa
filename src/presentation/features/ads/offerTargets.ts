/** Targets the offer form may use. All six since backend B20. */
export const OFFER_TARGETS_ENABLED = ['NONE', 'URL', 'CRAFTSMAN', 'CATEGORY', 'TASK', 'SERVICE'] as const;

export type OfferTargetEnabled = (typeof OFFER_TARGETS_ENABLED)[number];
