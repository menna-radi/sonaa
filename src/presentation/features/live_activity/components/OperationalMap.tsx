import React, { useEffect, useRef, useState } from 'react';
import type { LiveActivitySummary, ActiveJob } from '../../../../domain/entities/LiveActivity';

interface OperationalMapProps {
  summary: LiveActivitySummary | null;
  jobs?: ActiveJob[];
}

export const OperationalMap: React.FC<OperationalMapProps> = ({ summary, jobs = [] }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All activity');

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

  // Initialize and update Map markers
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

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Build dynamic markers from real/mock jobs list or fall back
    const dynamicJobMarkers = jobs.length > 0 ? jobs.map((j, index) => {
      const statusMeta = getStatusColor(j.status);
      const latOffset = (index % 3 - 1) * 0.008;
      const lngOffset = Math.floor(index / 3) * 0.008;
      return {
        id: j.id,
        coords: [j.lat || (31.7683 + latOffset), j.lng || (35.2137 + lngOffset)],
        title: `${statusMeta.label.split(' ')[0]} ${j.title} (${j.jobNumber})`,
        desc: `Customer: ${j.customer} · Craftsman: ${j.craftsman} · Status: ${j.status || 'IN_PROGRESS'} · ${j.amountSAR} ILS`,
        color: statusMeta.color,
        type: 'Active jobs',
        status: j.status || 'IN_PROGRESS'
      };
    }) : [
      {
        id: 'jobs-in-progress',
        coords: [31.8260, 35.2260], // Beit Hanina
        title: '🟢 Working (In Progress) — Beit Hanina',
        desc: 'Craftsman active on-site · Plumbing Repair #SN-1021',
        color: '#10b981',
        type: 'Active jobs',
        status: 'IN_PROGRESS'
      },
      {
        id: 'jobs-accepted',
        coords: [31.7800, 35.2150], // Jerusalem Center
        title: '🔵 Accepted & En Route — Jerusalem Center',
        desc: 'Craftsman accepted offer · Electrical Wiring #SN-1024',
        color: '#3b82f6',
        type: 'Active jobs',
        status: 'ACCEPTED'
      },
      {
        id: 'jobs-pending',
        coords: [31.7767, 35.2345], // Old City
        title: '🟡 New / Unfinished Task — Old City',
        desc: 'Customer posted job · Awaiting craftsman acceptance #SN-1029',
        color: '#f59e0b',
        type: 'Active jobs',
        status: 'PENDING'
      },
      {
        id: 'crafts',
        coords: [31.8080, 35.2330], // Shuafat
        title: '🟣 Online Craftsman — Shuafat & Sheikh Jarrah',
        desc: `${summary?.onlineCraftsmen.toLocaleString() ?? '312'} active technicians available on Sonaa network`,
        color: '#8b5cf6',
        type: 'Online craftsmen',
        status: 'ONLINE'
      }
    ];

    // Filter and add markers to map
    dynamicJobMarkers.forEach(marker => {
      if (activeFilter !== 'All activity' && marker.type !== activeFilter) return;

      const isPending = marker.status === 'PENDING';
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            width: 16px;
            height: 16px;
            background: ${marker.color};
            border: 2.5px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            display: block;
            position: relative;
          ">
            ${isPending ? `
              <span style="
                position: absolute;
                top: -4px;
                left: -4px;
                width: 20px;
                height: 20px;
                border: 2px solid ${marker.color};
                border-radius: 50%;
                animation: pulsate 1.5s infinite ease-out;
                box-sizing: border-box;
                display: block;
              "></span>
            ` : ''}
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      L.marker(marker.coords, { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #171717; font-family: system-ui, -apple-system, sans-serif; padding: 8px; text-align: start; direction: ltr; min-width: 200px;">
            <strong style="display: block; font-size: 13px; margin-bottom: 4px;">${marker.title}</strong>
            <span style="font-size: 11px; color: #52525b; line-height: 1.4; display: block;">${marker.desc}</span>
          </div>
        `);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, activeFilter, summary, jobs]);

  const filterKeys = ['All activity', 'Active jobs', 'Online craftsmen'];
  const filterValues = ['—', (jobs.length || summary?.activeJobs || 0).toLocaleString(), summary?.onlineCraftsmen.toLocaleString() ?? '—'];

  return (
    <div
      className="glass-card live-desktop-map-card"
      style={{
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-surface)',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Map header with filter tabs */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', textAlign: 'start' }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
          Operational Map
        </div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          Jerusalem · Live dispatch
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '12px', overflowX: 'auto', paddingBottom: '2px' }}>
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
