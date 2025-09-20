'use client';

import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useLanguage } from '@/lib/i18n/language-context';

// Fix Leaflet icon issues in Next.js
let DefaultIcon;

// Initialize Leaflet icons on the client side only
if (typeof window !== 'undefined') {
  DefaultIcon = new Icon({
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });
}

/**
 * Map component to display issue location
 */
export default function IssueLocationMap({ location }) {
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useLanguage();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return (
      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <p className="text-gray-500">{t('common.loadingMap')}</p>
      </div>
    );
  }
  
  if (!location || !location.coordinates || !location.coordinates.coordinates) {
    return (
      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <p className="text-gray-500">{t('common.locationUnavailable')}</p>
      </div>
    );
  }

  // MongoDB GeoJSON stores coordinates as [longitude, latitude]
  // Leaflet expects [latitude, longitude]
  const [longitude, latitude] = location.coordinates.coordinates;
  const position = [latitude, longitude];
  const address = location.address;

  return (
    <MapContainer
      center={position}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={DefaultIcon}>
        <Popup>
          <div>
            <p><strong>{t('common.issueLocation')}</strong></p>
            <p className="text-xs">{address || 'No address provided'}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
