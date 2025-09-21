'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

function LocationMarker({ position, setPosition, address, setAddress }) {
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      const locationName = await reverseGeocode(lat, lng);
      setAddress(locationName);
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

  useEffect(() => {
    // Fix Leaflet icon issues in Next.js
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
    }
  }, []);

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300 relative">
      <MapContainer
        center={position || defaultPosition}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        scrollWheelZoom={true}
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
