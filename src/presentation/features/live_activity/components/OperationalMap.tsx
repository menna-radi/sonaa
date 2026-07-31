import React, { useEffect, useRef, useState } from 'react';
import { Search, LocateFixed, Maximize2, Minimize2, MapPin } from 'lucide-react';
import type { LiveActivitySummary, ActiveJob } from '../../../../domain/entities/LiveActivity';

interface OperationalMapProps {
  summary: LiveActivitySummary | null;
  jobs?: ActiveJob[];
  refreshInterval?: number;
  onRefreshIntervalChange?: (intervalMs: number) => void;
}

export const OperationalMap: React.FC<OperationalMapProps> = ({
  summary,
  jobs = [],
  refreshInterval = 12000,
  onRefreshIntervalChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstancesRef = useRef<Record<string, any>>({});
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All activity');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [showCraftsmen, setShowCraftsmen] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [showZonesOverlay, setShowZonesOverlay] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  // Jerusalem Districts Coordinates
  const districts = [
    { key: 'ALL', name: '📍 All Jerusalem (القدس)', coords: [31.7683, 35.2137], zoom: 13 },
    { key: 'OLD_CITY', name: '🏰 Old City (البلدة القديمة)', coords: [31.7767, 35.2345], zoom: 16 },
    { key: 'BEIT_HANINA', name: '🏘️ Beit Hanina (بيت حنينا)', coords: [31.8260, 35.2260], zoom: 15 },
    { key: 'SHUAFAT', name: '🏡 Shuafat (شعفاط)', coords: [31.8080, 35.2330], zoom: 15 },
    { key: 'SHEIKH_JARRAH', name: '🌳 Sheikh Jarrah (الشيخ جراح)', coords: [31.7915, 35.2295], zoom: 16 },
    { key: 'SILWAN', name: '🏛️ Silwan (سلوان)', coords: [31.7700, 35.2350], zoom: 15 },
  ];

  // Load Leaflet dynamically from CDN
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // Helper for status colors
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return { color: '#f59e0b', label: '🟡 New / Unfinished Task', bg: '#fef3c7' };
      case 'ACCEPTED':
        return { color: '#3b82f6', label: '🔵 Accepted & Scheduled', bg: '#dbeafe' };
      case 'IN_PROGRESS':
        return { color: '#10b981', label: '🟢 Working (In Progress)', bg: '#d1fae5' };
      case 'DISPUTED':
        return { color: '#ef4444', label: '🔴 Disputed Task', bg: '#fee2e2' };
      default:
        return { color: '#10b981', label: '🟢 Active Dispatch', bg: '#d1fae5' };
    }
  };

  const layerGroupRef = useRef<any>(null);

  // 1. Initialize Map ONCE (Keeps Leaflet map instance alive without recreating)
  useEffect(() => {
    const L = (window as any).L;
    if (!leafletLoaded || !L || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false
      }).setView([31.7683, 35.2137], 13); // Centered in Jerusalem, Palestine (القدس)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, [leafletLoaded]);

  // 2. Update Layers & Markers smoothly inside layerGroup (Zero map recreation)
  useEffect(() => {
    const L = (window as any).L;
    if (!leafletLoaded || !L || !mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;

    // Smoothly clear layers in-memory (Map container stays 100% active and still)
    layerGroup.clearLayers();

    // Render District Coverage & Demand Capacity Circles when overlay is active
    if (showZonesOverlay) {
      districts.filter(d => d.key !== 'ALL').forEach(d => {
        L.circle(d.coords, {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.12,
          radius: 1200,
          weight: 1.5
        }).addTo(layerGroup).bindPopup(`
          <div style="font-family: system-ui; padding: 4px;">
            <strong style="font-size: 12px; color: #1e3a8a;">${d.name} Zone Overlay</strong>
            <span style="display: block; font-size: 11px; color: #475569; margin-top: 2px;">Active service coverage area & demand ring.</span>
          </div>
        `);
      });
    }

    // Render Craftsman Live Path Tracking & Motion Vector Lines when routes layer is active
    if (showRoutes) {
      const routes = [
        {
          from: [31.8080, 35.2330],
          to: [31.8260, 35.2260],
          color: '#10b981',
          label: '⚡ Live Transit: Ahmad Al-Otaibi → Beit Hanina (1.8 km · 5 min)'
        },
        {
          from: [31.8260, 35.2150],
          to: [31.7800, 35.2150],
          color: '#3b82f6',
          label: '⚡ Live Transit: Yousef H. → Jerusalem Center (4.2 km · 9 min)'
        }
      ];

      routes.forEach(r => {
        L.polyline([r.from, r.to], {
          color: r.color,
          weight: 3.5,
          dashArray: '8, 8',
          opacity: 0.85
        }).addTo(layerGroup).bindPopup(`
          <div style="font-family: system-ui; padding: 4px;">
            <strong style="font-size: 12px; color: ${r.color};">${r.label}</strong>
            <span style="display: block; font-size: 11px; color: #475569; margin-top: 2px;">Active technician route vector line in Jerusalem.</span>
          </div>
        `);
      });
    }

    // Build dynamic markers from real/mock jobs list
    const taskMarkers = jobs.map((j, index) => {
      const statusMeta = getStatusColor(j.status);
      const angle = (index + 1) * 1.8;
      const radius = 0.007 + (index % 4) * 0.005;
      const latOffset = Math.sin(angle) * radius;
      const lngOffset = Math.cos(angle) * radius;
      const baseLat = j.lat && j.lat !== 31.7683 ? j.lat : 31.7683 + latOffset;
      const baseLng = j.lng && j.lng !== 35.2137 ? j.lng : 35.2137 + lngOffset;

      return {
        id: j.id,
        coords: [baseLat, baseLng],
        title: `${statusMeta.label.split(' ')[0]} ${j.title} (${j.jobNumber})`,
        desc: `Customer: ${j.customer} · Craftsman: ${j.craftsman} · Status: ${j.status || 'IN_PROGRESS'} · ${j.amountSAR} ILS`,
        color: statusMeta.color,
        type: 'Active jobs',
        status: j.status || 'IN_PROGRESS'
      };
    });

    const craftsmanMarkers = [
      {
        id: 'craft-1',
        coords: [31.8080, 35.2330],
        title: '🟣 Online Craftsman — Ahmad Al-Otaibi',
        desc: 'Electrician & HVAC Tech · Active in Shuafat Zone',
        color: '#8b5cf6',
        type: 'Online craftsmen',
        status: 'ONLINE'
      },
      {
        id: 'craft-2',
        coords: [31.8260, 35.2150],
        title: '🟣 Online Craftsman — Yousef H.',
        desc: 'Master Plumber · Active in Beit Hanina Zone',
        color: '#8b5cf6',
        type: 'Online craftsmen',
        status: 'ONLINE'
      }
    ];

    const dynamicJobMarkers = jobs.length > 0 
      ? [...taskMarkers, ...craftsmanMarkers] 
      : [
          {
            id: 'jobs-in-progress',
            coords: [31.8260, 35.2260],
            title: '🟢 Working (In Progress) — Beit Hanina',
            desc: 'Craftsman active on-site · Plumbing Repair #SN-1021',
            color: '#10b981',
            type: 'Active jobs',
            status: 'IN_PROGRESS'
          },
          {
            id: 'jobs-accepted',
            coords: [31.7800, 35.2150],
            title: '🔵 Accepted & En Route — Jerusalem Center',
            desc: 'Craftsman accepted offer · Electrical Wiring #SN-1024',
            color: '#3b82f6',
            type: 'Active jobs',
            status: 'ACCEPTED'
          },
          {
            id: 'jobs-pending',
            coords: [31.7767, 35.2345],
            title: '🟡 New / Unfinished Task — Old City',
            desc: 'Customer posted job · Awaiting craftsman acceptance #SN-1029',
            color: '#f59e0b',
            type: 'Active jobs',
            status: 'PENDING'
          },
          ...craftsmanMarkers
        ];

    // Filter and add high-visibility markers (pane: markerPane at z-index 600 above blue rings)
    dynamicJobMarkers.forEach(marker => {
      if (activeFilter !== 'All activity' && marker.type !== activeFilter) return;

      // Layer visibility toggles
      if (!showTasks && marker.type === 'Active jobs') return;
      if (!showCraftsmen && marker.type === 'Online craftsmen') return;

      // Search filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matches = marker.title.toLowerCase().includes(q) || marker.desc.toLowerCase().includes(q);
        if (!matches) return;
      }

      // Draw high-visibility marker inside markerPane (z-index: 600 above all circle overlays)
      const customIcon = L.divIcon({
        className: 'custom-map-marker-pin',
        html: `
          <div style="
            width: 22px;
            height: 22px;
            background: ${marker.color};
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 10px ${marker.color}, 0 2px 8px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const markerObj = L.marker(marker.coords, { icon: customIcon, pane: 'markerPane' })
        .addTo(layerGroup)
        .bindPopup(`
          <div style="color: #171717; font-family: system-ui, -apple-system, sans-serif; padding: 10px; text-align: start; direction: ltr; min-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 700; background: ${marker.color}22; color: ${marker.color}; border: 1px solid ${marker.color}44; padding: 2px 6px; border-radius: 12px; text-transform: uppercase;">
                ${marker.status || 'ACTIVE'}
              </span>
              <span style="font-size: 10px; color: #71717a; font-weight: 600;">Jerusalem Zone</span>
            </div>
            <strong style="display: block; font-size: 13px; margin-bottom: 6px; color: #09090b; line-height: 1.3;">
              ${marker.title}
            </strong>
            <div style="font-size: 11px; color: #52525b; line-height: 1.5; margin-bottom: 10px; background: #f4f4f5; padding: 6px 8px; border-radius: 6px;">
              ${marker.desc}
            </div>
            <button 
              onclick="window.location.hash='tasks'" 
              style="width: 100%; padding: 6px 10px; background: #171717; color: #ffffff; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"
            >
              <span>Inspect Dispatch Details</span>
            </button>
          </div>
        `);

      if (marker.id) {
        markerInstancesRef.current[marker.id] = markerObj;
      }
    });
  }, [leafletLoaded, activeFilter, summary, jobs, showCraftsmen, showTasks, showZonesOverlay, showRoutes, searchQuery]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && (window as any).L) {
      mapInstanceRef.current.setView([31.7683, 35.2137], 13);
      setSelectedDistrict('ALL');
    }
  };

  // Listen for focus-map-job events from feed or jobs list
  useEffect(() => {
    const handleFocusMap = (e: any) => {
      const cardEl = document.getElementById('operational-map-card');
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const { coords, jobId, eventId } = e.detail || {};
      const targetId = jobId || eventId;
      const targetMarker = targetId ? markerInstancesRef.current[targetId] : null;

      if (targetMarker && mapInstanceRef.current) {
        const mCoords = targetMarker.getLatLng();
        mapInstanceRef.current.flyTo([mCoords.lat, mCoords.lng], 16, { duration: 1.2 });
        setTimeout(() => {
          targetMarker.openPopup();
        }, 1200);
      } else if (mapInstanceRef.current && Array.isArray(coords) && coords.length === 2) {
        mapInstanceRef.current.flyTo(coords, 16, { duration: 1.2 });
      } else if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([31.7683, 35.2137], 14, { duration: 1.2 });
      }
    };

    window.addEventListener('focus-map-job', handleFocusMap);
    return () => {
      window.removeEventListener('focus-map-job', handleFocusMap);
    };
  }, []);

  const handleDistrictChange = (key: string) => {
    setSelectedDistrict(key);
    const target = districts.find(d => d.key === key);
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(target.coords, target.zoom, { duration: 1.2 });
    }
  };

  const filterKeys = ['All activity', 'Active jobs', 'Online craftsmen'];
  const filterValues = ['—', (jobs.length || summary?.activeJobs || 0).toLocaleString(), summary?.onlineCraftsmen.toLocaleString() ?? '—'];

  return (
    <div
      id="operational-map-card"
      className="glass-card live-desktop-map-card"
      style={{
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-surface)',
        overflow: 'hidden',
        height: isFullscreen ? '100vh' : '100%',
        width: isFullscreen ? '100vw' : '100%',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Map Header Toolbar */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', textAlign: 'start', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1px' }}>
              Operational Map & Telemetry
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} style={{ color: '#16A34A' }} />
              <span>Jerusalem · Live Dispatch Control</span>
            </div>
          </div>

          {/* Action Toolbar Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Control #4: Telemetry Refresh Speed Pills */}
            {onRefreshIntervalChange && (
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface-hover)', borderRadius: '6px', padding: '2px', border: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => onRefreshIntervalChange(10000)}
                  title="Fast Live Telemetry Stream (10s)"
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: refreshInterval === 10000 ? '#10b981' : 'transparent',
                    color: refreshInterval === 10000 ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ⚡ 10s
                </button>
                <button
                  onClick={() => onRefreshIntervalChange(30000)}
                  title="Standard Telemetry Stream (30s)"
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: refreshInterval === 30000 ? '#3b82f6' : 'transparent',
                    color: refreshInterval === 30000 ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ⏱️ 30s
                </button>
                <button
                  onClick={() => onRefreshIntervalChange(0)}
                  title="Pause Background Polling Stream"
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: refreshInterval === 0 ? '#ef4444' : 'transparent',
                    color: refreshInterval === 0 ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ⏸️ Pause
                </button>
              </div>
            )}

            {/* District Selector */}
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface-hover)',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {districts.map(d => (
                <option key={d.key} value={d.key}>{d.name}</option>
              ))}
            </select>

            {/* Recenter Button */}
            <button
              onClick={handleRecenter}
              title="Recenter Map to Jerusalem Center"
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface-hover)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <LocateFixed size={14} />
              <span>Recenter</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(prev => !prev)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: isFullscreen ? '#171717' : 'var(--bg-surface-hover)',
                color: isFullscreen ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>

        {/* Search input + Filter tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {filterKeys.map((key, i) => {
              const isActive = activeFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: isActive ? '#171717' : 'var(--bg-surface-hover)',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    border: isActive ? 'none' : '1px solid var(--border-color)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    outline: 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  {key}
                  {filterValues[i] !== '—' && (
                    <span style={{ marginInlineStart: '4px', opacity: 0.7 }}>{filterValues[i]}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Layer Visibility Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setShowTasks(prev => !prev)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                background: showTasks ? '#10b98122' : 'transparent',
                color: showTasks ? '#059669' : 'var(--text-muted)',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {showTasks ? '✓ Tasks Layer' : '+ Tasks Layer'}
            </button>

            <button
              onClick={() => setShowCraftsmen(prev => !prev)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                background: showCraftsmen ? '#8b5cf622' : 'transparent',
                color: showCraftsmen ? '#7c3aed' : 'var(--text-muted)',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {showCraftsmen ? '✓ Craftsmen Layer' : '+ Craftsmen Layer'}
            </button>

            <button
              onClick={() => setShowZonesOverlay(prev => !prev)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                background: showZonesOverlay ? '#3b82f622' : 'transparent',
                color: showZonesOverlay ? '#2563eb' : 'var(--text-muted)',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {showZonesOverlay ? '✓ Zone Rings' : '+ Zone Rings'}
            </button>

            <button
              onClick={() => setShowRoutes(prev => !prev)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                background: showRoutes ? '#f59e0b22' : 'transparent',
                color: showRoutes ? '#d97706' : 'var(--text-muted)',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {showRoutes ? '✓ Dispatch Routes' : '+ Dispatch Routes'}
            </button>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '160px' }}>
            <Search size={13} style={{ position: 'absolute', left: 8, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search job or craftsman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '4px 8px 4px 26px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface-hover)',
                fontSize: '0.72rem',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '100%'
              }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Map Wrapper */}
      <div style={{ flex: 1, position: 'relative', minHeight: '320px', display: 'flex' }}>
        {!leafletLoaded && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg-surface-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            zIndex: 10
          }}>
            Loading Jerusalem Live dispatch map...
          </div>
        )}
        <div 
          ref={mapContainerRef} 
          style={{ 
            width: '100%', 
            height: '100%', 
            minHeight: '320px',
            background: '#f4f4f5',
            zIndex: 1 
          }} 
        />
      </div>

      {/* Map Status Legend Footer */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
        <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Status Legend:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
          <span>New / Unfinished</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
          <span>Accepted / En Route</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
          <span>Working (In Progress)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }}></span>
          <span>Online Technician</span>
        </div>
      </div>
      <style>{`
        @keyframes pulsate {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default OperationalMap;
