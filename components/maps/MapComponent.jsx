'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issues in Next.js
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, address, setAddress }) {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
      // Try to get reverse geocoding for the address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
      } catch (error) {
        console.error('Error getting address:', error);
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    },
  });

  useEffect(() => {
    if (position && position.length === 2) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position && position.length === 2 ? (
    <Marker position={position}>
      <Popup>
        Selected location: {address || `${position[0].toFixed(6)}, ${position[1].toFixed(6)}`}
      </Popup>
    </Marker>
  ) : null;
}

export default function MapComponent({ position, setPosition, address, setAddress }) {
  const defaultPosition = [27.7172, 85.3240]; // Kathmandu, Nepal

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={position || defaultPosition}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          position={position} 
          setPosition={setPosition}
          address={address}
          setAddress={setAddress}
        />
      </MapContainer>
    </div>
  );
}
