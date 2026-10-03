/**
 * The backend's /admin/live-activity still derives busy zones, job progress and amounts
 * from placeholders (backend ticket B17). While false, those blocks are neither mapped nor rendered.
 */
export const LIVE_FABRICATED_FIELDS_TRUSTED = false;

/** Foreground polling period of the live snapshot. */
export const LIVE_REFETCH_MS = 15000;
