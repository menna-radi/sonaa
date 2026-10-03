import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import type { MarkerTone } from './MapMarkers';

const ITEMS: { tone: MarkerTone; labelKey: string }[] = [
  { tone: 'pending', labelKey: 'live_legend_pending' },
  { tone: 'accepted', labelKey: 'live_legend_accepted' },
  { tone: 'progress', labelKey: 'live_legend_progress' },
  { tone: 'disputed', labelKey: 'live_legend_disputed' },
  { tone: 'craftsman', labelKey: 'live_legend_craftsman' },
];

export const MapLegend: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="live-legend">
      <span className="live-legend__title">{t('live_map_legend')}</span>
      {ITEMS.map((item) => (
        <div key={item.tone} className={`live-legend__item live-tone--${item.tone}`}>
          <span className="live-dot" />
          <span>{t(item.labelKey)}</span>
        </div>
      ))}
    </div>
  );
};

export default MapLegend;
