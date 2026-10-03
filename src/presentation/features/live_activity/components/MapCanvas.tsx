import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { pinHtml, popupHtml, type MapMarker } from './MapMarkers';

type LatLng = [number, number];

interface LeafletLayerGroup {
  addTo(map: LeafletMap): LeafletLayerGroup;
  clearLayers(): void;
}
interface LeafletMarker {
  addTo(group: LeafletLayerGroup): LeafletMarker;
  bindPopup(html: string): LeafletMarker;
  getLatLng(): { lat: number; lng: number };
  openPopup(): void;
}
interface LeafletMap {
  setView(center: LatLng, zoom: number): LeafletMap;
  flyTo(center: LatLng, zoom: number, opts?: { duration: number }): void;
  fitBounds(bounds: LatLng[], opts?: { padding: [number, number]; maxZoom: number }): void;
  invalidateSize(): void;
  remove(): void;
}
interface LeafletApi {
  map(el: HTMLElement, opts: object): LeafletMap;
  tileLayer(url: string, opts: object): { addTo(map: LeafletMap): void };
  layerGroup(): LeafletLayerGroup;
  divIcon(opts: object): unknown;
  marker(coords: LatLng, opts: object): LeafletMarker;
}
type LeafletWindow = Window & { L?: LeafletApi };

const getLeaflet = (): LeafletApi | undefined => (window as LeafletWindow).L;

/** Camera used only until the first markers arrive (it is not data). */
const DEFAULT_CENTER: LatLng = [31.7683, 35.2137];
const DEFAULT_ZOOM = 13;

export interface MapCanvasHandle {
  recenter: () => void;
}

interface MapCanvasProps {
  markers: MapMarker[];
  loadingLabel: string;
  /** Changes when the card is resized (fullscreen) so Leaflet recomputes its size. */
  sizeKey?: string;
}

export const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(({ markers, loadingLabel, sizeKey }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LeafletLayerGroup | null>(null);
  const markerRefs = useRef<Record<string, LeafletMarker>>({});
  const fittedRef = useRef(false);
  const [leafletLoaded, setLeafletLoaded] = useState(() => Boolean(getLeaflet()));

  // Load Leaflet from the CDN once.
  useEffect(() => {
    if (getLeaflet()) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Create the map once; it stays alive across marker updates.
  useEffect(() => {
    const L = getLeaflet();
    if (!leafletLoaded || !L || !containerRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: true, attributionControl: false }).setView(
      DEFAULT_CENTER,
      DEFAULT_ZOOM
    );
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      markerRefs.current = {};
      fittedRef.current = false;
    };
  }, [leafletLoaded]);

  useEffect(() => {
    mapRef.current?.invalidateSize();
  }, [sizeKey]);

  const fitAll = (list: MapMarker[]) => {
    const map = mapRef.current;
    if (!map) return;
    if (list.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }
    map.fitBounds(
      list.map((m) => m.coords),
      { padding: [40, 40], maxZoom: 15 }
    );
  };

  // Redraw the markers; fit the camera to them the first time any exist.
  useEffect(() => {
    const L = getLeaflet();
    const layer = layerRef.current;
    if (!leafletLoaded || !L || !layer) return;

    layer.clearLayers();
    markerRefs.current = {};
    markers.forEach((m) => {
      const icon = L.divIcon({ className: 'live-pin-wrap', html: pinHtml(m.tone), iconSize: [22, 22], iconAnchor: [11, 11] });
      markerRefs.current[m.id] = L.marker(m.coords, { icon, pane: 'markerPane' }).addTo(layer).bindPopup(popupHtml(m));
    });
    if (!fittedRef.current && markers.length > 0) {
      fitAll(markers);
      fittedRef.current = true;
    }
  }, [leafletLoaded, markers]);

  useImperativeHandle(ref, () => ({ recenter: () => fitAll(markers) }), [markers]);

  // Jobs list asks the map to focus a job.
  useEffect(() => {
    const onFocus = (e: Event) => {
      const detail = (e as CustomEvent<{ jobId?: string; coords?: LatLng }>).detail;
      document.getElementById('operational-map-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const map = mapRef.current;
      if (!map || !detail) return;
      const marker = detail.jobId ? markerRefs.current[detail.jobId] : undefined;
      if (marker) {
        const p = marker.getLatLng();
        map.flyTo([p.lat, p.lng], 16, { duration: 1.2 });
        marker.openPopup();
      } else if (detail.coords) {
        map.flyTo(detail.coords, 16, { duration: 1.2 });
      }
    };
    window.addEventListener('focus-map-job', onFocus);
    return () => window.removeEventListener('focus-map-job', onFocus);
  }, []);

  return (
    <>
      {!leafletLoaded && <div className="live-map-loading">{loadingLabel}</div>}
      <div ref={containerRef} className="live-map-canvas" />
    </>
  );
});
MapCanvas.displayName = 'MapCanvas';

export default MapCanvas;
