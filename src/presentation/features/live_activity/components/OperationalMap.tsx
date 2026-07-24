import React, { useEffect, useRef, useState } from 'react';
import type { LiveActivitySummary } from '../../../../domain/entities/LiveActivity';

interface OperationalMapProps {
  summary: LiveActivitySummary | null;
}

export const OperationalMap: React.FC<OperationalMapProps> = ({ summary }) => {
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

    // Load stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // Initialize and update Map markers
  useEffect(() => {
    const L = (window as any).L;
    if (!leafletLoaded || !L || !mapContainerRef.current) return;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false
      }).setView([31.7683, 35.2137], 13); // Centered in Jerusalem, Palestine (القدس)

      // Add OpenStreetMap standard tiles for a light street map look (matching user's screenshot)
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

    // Markers dataset
    const markers = [
      {
        id: 'sos',
        coords: [31.7767, 35.2345], // Old City Jerusalem coordinate
        title: '🚨 SOS Emergency in Old City Jerusalem (البلدة القديمة)',
        desc: 'Lina Al-Mansour · Bathroom pipe burst · Job #SN-2417',
        color: '#dc2626',
        type: 'Emergencies',
        count: summary?.sosCount.toString() ?? '3'
      },
      {
        id: 'jobs',
        coords: [31.8260, 35.2260], // Beit Hanina coordinate
        title: '🟢 Active Jobs in Beit Hanina (بيت حنينا)',
        desc: `${summary?.activeJobs.toLocaleString() ?? '1,238'} active maintenance dispatches in Jerusalem`,
        color: '#10b981',
        type: 'Active jobs',
        count: summary?.activeJobs.toString() ?? '1238'
      },
      {
        id: 'crafts',
        coords: [31.8080, 35.2330], // Shuafat coordinate
        title: '🔵 Online Craftsmen in Shuafat & Sheikh Jarrah',
        desc: `${summary?.onlineCraftsmen.toLocaleString() ?? '312'} active technicians online on Sonaa network in Jerusalem`,
        color: '#3b82f6',
        type: 'Online craftsmen',
        count: summary?.onlineCraftsmen.toString() ?? '312'
      }
    ];

    // Filter and add markers to map
    markers.forEach(marker => {
      if (activeFilter !== 'All activity' && marker.type !== activeFilter) return;

      const isEmergency = marker.id === 'sos';
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            width: 14px;
            height: 14px;
            background: ${marker.color};
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 2px 5px rgba(0,0,0,0.4);
            display: block;
            position: relative;
          ">
            ${isEmergency ? `
              <span style="
                position: absolute;
                top: -5px;
                left: -5px;
                width: 20px;
                height: 20px;
                border: 2px solid #dc2626;
                border-radius: 50%;
                animation: pulsate 1.5s infinite ease-out;
                box-sizing: border-box;
                display: block;
              "></span>
            ` : ''}
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      L.marker(marker.coords, { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #171717; font-family: system-ui, -apple-system, sans-serif; padding: 6px; text-align: start; direction: ltr; min-width: 180px;">
            <strong style="display: block; font-size: 12px; margin-bottom: 4px;">${marker.title}</strong>
            <span style="font-size: 11px; color: #52525b; line-height: 1.4; display: block;">${marker.desc}</span>
          </div>
        `);
    });

  }, [leafletLoaded, activeFilter, summary]);

  const filterKeys = ['All activity', 'Active jobs', 'Online craftsmen', 'Emergencies'];
  const filterValues = ['—', summary?.activeJobs.toLocaleString() ?? '—', summary?.onlineCraftsmen.toLocaleString() ?? '—', summary?.sosCount.toString() ?? '—'];

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
          Riyadh · Live dispatch
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
            Loading Riyadh Live dispatch map...
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
