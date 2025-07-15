'use client';

import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';

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
 * Interactive map marker that handles map clicks
 */
function LocationMarker({ position, setPosition, address, setAddress }) {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
      // Try to get reverse geocoding for the address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`
        );
        const data = await response.json();
        setAddress(data.display_name || 'Address not found');
      } catch (error) {
        console.error('Error getting address:', error);
        setAddress('Error getting address');
      }
    }
  });

  return position ? (
    <Marker position={position} icon={DefaultIcon}>
      <Popup>
        <div>
          <p><strong>Selected Location</strong></p>
          <p className="text-xs">{address}</p>
          <p className="text-xs">
            Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

/**
 * Interactive map component for selecting issue locations
 */
export default function LocationPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState([27.7172, 85.3240]); // Default: Kathmandu

  // Get user's current location if allowed
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([
            position.coords.latitude,
            position.coords.longitude
          ]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
    setMapLoaded(true);
  }, []);

  // Update the parent component with the selected location
  useEffect(() => {
    if (position && address) {
      const locationData = {
        coordinates: {
          type: 'Point',
          coordinates: [position[1], position[0]] // Convert to [longitude, latitude] for GeoJSON
        },
        address
      };
      onLocationSelect(locationData);
    }
  }, [position, address]);

  if (!mapLoaded) {
    return <div className="w-full h-64 bg-slate-100 animate-pulse rounded-md" />;
  }

  return (
    <div className="w-full h-64 rounded-md overflow-hidden border border-gray-200">
      <MapContainer
        center={currentLocation}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
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
