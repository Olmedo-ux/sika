import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface CollectionPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  neighborhood?: string;
  avatar?: string;
  phone?: string;
  rating?: number;
}

interface InteractiveMapProps {
  height?: string;
  center?: [number, number];
  zoom?: number;
  showPoints?: boolean;
  points?: CollectionPoint[];
  onPointClick?: (point: CollectionPoint) => void;
  selectedPoint?: string | null;
  userLocation?: { lat: number; lng: number } | null;
}

export function InteractiveMap({
  height = '400px',
  center = [6.1375, 1.2125],
  zoom = 12,
  showPoints = true,
  points = [],
  onPointClick,
  selectedPoint,
  userLocation,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when points change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (!showPoints || !points.length) return;

    // Custom icons
    const collectionIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: hsl(160, 84%, 39%); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
        <span style="font-size: 14px;">📍</span>
      </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    const recyclerIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: hsl(38, 92%, 50%); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
        <span style="font-size: 14px;">🏭</span>
      </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    // Add markers
    points.forEach((point) => {
      const icon = point.type === 'recycler' ? recyclerIcon : collectionIcon;
      const marker = L.marker([point.lat, point.lng], { icon }).addTo(mapInstanceRef.current!);
      
      // Build popup content with avatar and user info
      const avatarHtml = point.avatar 
        ? `<img src="${point.avatar}" alt="${point.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-bottom: 8px; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" />`
        : `<div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, hsl(160, 84%, 39%), hsl(38, 92%, 50%)); display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 24px; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${point.type === 'recycler' ? '🏭' : '🚴'}</div>`;
      
      const ratingHtml = point.rating 
        ? `<div style="margin-top: 4px; color: #f59e0b; font-size: 12px;">⭐ ${point.rating.toFixed(1)}</div>`
        : '';
      
      const phoneHtml = point.phone 
        ? `<div style="margin-top: 4px; font-size: 11px; color: #666;">📞 ${point.phone}</div>`
        : '';
      
      marker.bindPopup(`
        <div style="text-align: center; padding: 12px; min-width: 150px;">
          ${avatarHtml}
          <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${point.name}</strong>
          <span style="font-size: 11px; color: #666; display: block;">
            ${point.type === 'recycler' ? '🏭 Recycleur' : '🚴 Collecteur'}
          </span>
          ${ratingHtml}
          ${phoneHtml}
          ${point.neighborhood ? `<div style="margin-top: 4px; font-size: 11px; color: #888;">📍 ${point.neighborhood}</div>` : ''}
        </div>
      `);

      marker.on('click', () => {
        onPointClick?.(point);
      });

      markersRef.current.push(marker);
    });
  }, [points, showPoints, onPointClick]);

  // Update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    const userIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup('Votre position');

    mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14);
  }, [userLocation]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden z-0"
    />
  );
}
