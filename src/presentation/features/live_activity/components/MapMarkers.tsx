import type { ActiveJob, LiveCraftsman } from '../../../../domain/entities/LiveActivity';

export type MarkerKind = 'job' | 'craftsman';
export type MarkerTone = 'pending' | 'accepted' | 'progress' | 'disputed' | 'other' | 'craftsman';

export interface MapMarker {
  id: string;
  kind: MarkerKind;
  tone: MarkerTone;
  coords: [number, number];
  title: string;
  desc: string;
  statusLabel: string;
}

export interface MarkerLabels {
  customer: string;
  craftsman: string;
  onlineCraftsman: string;
  rating: string;
  /** Translates a task status code; returns the raw code when no label exists. */
  status: (code: string) => string;
}

export const toneForStatus = (status?: string): MarkerTone => {
  switch (status) {
    case 'PENDING':
      return 'pending';
    case 'ACCEPTED':
      return 'accepted';
    case 'IN_PROGRESS':
      return 'progress';
    case 'DISPUTED':
      return 'disputed';
    default:
      return 'other';
  }
};

const hasCoords = (lat: number | undefined, lng: number | undefined): lat is number =>
  typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng);

/** Only jobs and craftsmen with real coordinates become markers — nothing is placed on a default position. */
export const buildMarkers = (jobs: ActiveJob[], craftsmen: LiveCraftsman[], labels: MarkerLabels): MapMarker[] => {
  const out: MapMarker[] = [];
  for (const j of jobs) {
    if (!hasCoords(j.lat, j.lng)) continue;
    const code = j.status ?? '';
    out.push({
      id: j.id,
      kind: 'job',
      tone: toneForStatus(j.status),
      coords: [j.lat, j.lng as number],
      title: j.jobNumber ? `${j.title} (${j.jobNumber})` : j.title,
      desc: `${labels.customer}: ${j.customer} · ${labels.craftsman}: ${j.craftsman}`,
      statusLabel: code ? labels.status(code) : '',
    });
  }
  for (const c of craftsmen) {
    if (!hasCoords(c.lat, c.lng)) continue;
    const rating = typeof c.rating === 'number' ? ` · ${labels.rating}: ${c.rating.toFixed(1)}` : '';
    out.push({
      id: `craft-${c.id}`,
      kind: 'craftsman',
      tone: 'craftsman',
      coords: [c.lat, c.lng],
      title: c.name,
      desc: `${c.title}${rating}`,
      statusLabel: labels.onlineCraftsman,
    });
  }
  return out;
};

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (v: string): string => v.replace(/[&<>"']/g, (c) => ESCAPES[c]);

export const pinHtml = (tone: MarkerTone): string => `<div class="live-pin live-tone--${tone}"></div>`;

export const popupHtml = (m: MapMarker): string => `
  <div class="live-popup live-tone--${m.tone}">
    ${m.statusLabel ? `<span class="live-popup__status">${escapeHtml(m.statusLabel)}</span>` : ''}
    <strong class="live-popup__title">${escapeHtml(m.title)}</strong>
    <div class="live-popup__desc">${escapeHtml(m.desc)}</div>
  </div>`;
