import React, { useMemo, useRef, useState } from 'react';
import { Search, LocateFixed, Maximize2, Minimize2, MapPin } from 'lucide-react';
import type { LiveActivitySummary, ActiveJob, LiveCraftsman } from '../../../../domain/entities/LiveActivity';
import { Button } from '../../../components/ui';
import { statusLabelKey } from '../../../components/ui/status';
import { useLanguage } from '../../../context/LanguageContext';
import { formatNumber } from '../../../../core/utils/format';
import { MapCanvas, type MapCanvasHandle } from './MapCanvas';
import { MapLegend } from './MapLegend';
import { buildMarkers, type MarkerKind } from './MapMarkers';

type MapFilter = 'all' | MarkerKind;

interface OperationalMapProps {
  summary: LiveActivitySummary | null;
  jobs?: ActiveJob[];
  craftsmen?: LiveCraftsman[];
}

export const OperationalMap: React.FC<OperationalMapProps> = ({ summary, jobs = [], craftsmen = [] }) => {
  const { t, language } = useLanguage();
  const canvasRef = useRef<MapCanvasHandle>(null);
  const [filter, setFilter] = useState<MapFilter>('all');
  const [query, setQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const allMarkers = useMemo(
    () =>
      buildMarkers(jobs, craftsmen, {
        customer: t('live_customer'),
        craftsman: t('live_craftsman'),
        onlineCraftsman: t('live_online_craftsman'),
        rating: t('live_rating'),
        status: (code) => {
          const key = statusLabelKey('task', code);
          const label = t(key);
          return label === key ? code : label;
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jobs, craftsmen, language]
  );

  const markers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allMarkers.filter(
      (m) => (filter === 'all' || m.kind === filter) && (!q || `${m.title} ${m.desc}`.toLowerCase().includes(q))
    );
  }, [allMarkers, filter, query]);

  const jobMarkers = allMarkers.filter((m) => m.kind === 'job').length;
  const filters: { key: MapFilter; label: string; count?: number }[] = [
    { key: 'all', label: t('live_map_filter_all') },
    { key: 'job', label: t('live_map_filter_jobs'), count: jobMarkers },
    { key: 'craftsman', label: t('live_map_filter_craftsmen'), count: summary?.onlineCraftsmen },
  ];

  return (
    <div id="operational-map-card" className={`live-map-card${isFullscreen ? ' live-map-card--full' : ''}`}>
      <div className="live-map-head">
        <div className="live-map-controls">
          <div>
            <div className="ui-eyebrow">{t('live_map_eyebrow')}</div>
            <div className="live-map-title">
              <MapPin size={16} />
              <span>{t('live_map_title')}</span>
            </div>
          </div>
          <div className="ui-row">
            <Button variant="outline" size="sm" iconLeading={<LocateFixed size={14} />} onClick={() => canvasRef.current?.recenter()}>
              {t('live_map_recenter')}
            </Button>
            <Button
              variant={isFullscreen ? 'primary' : 'outline'}
              size="sm"
              iconLeading={isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              onClick={() => setIsFullscreen((v) => !v)}
            >
              {isFullscreen ? t('live_map_exit_fullscreen') : t('live_map_fullscreen')}
            </Button>
          </div>
        </div>

        <div className="live-map-controls">
          <div className="live-map-filters">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`live-chip${filter === f.key ? ' is-active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                {f.count !== undefined && <span className="live-chip__count ui-num">{formatNumber(f.count, language)}</span>}
              </button>
            ))}
          </div>
          <label className="live-map-search">
            <Search size={13} />
            <input
              type="text"
              value={query}
              placeholder={t('live_map_search_placeholder')}
              aria-label={t('live_map_search_placeholder')}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="live-map-body">
        <MapCanvas ref={canvasRef} markers={markers} loadingLabel={t('live_map_loading')} sizeKey={String(isFullscreen)} />
        {allMarkers.length === 0 && <div className="live-map-empty">{t('live_map_no_locations')}</div>}
      </div>

      <MapLegend />
    </div>
  );
};

export default OperationalMap;
