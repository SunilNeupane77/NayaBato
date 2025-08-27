'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
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
function LocationMarker({ position, setPosition, address, setAddress, t }) {
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
        setAddress(data.display_name || t('maps.addressNotFound') || 'Address not found');
      } catch (error) {
        console.error('Error getting address:', error);
        setAddress(t('maps.errorGettingAddress') || 'Error getting address');
      }
    }
  });

  return position ? (
    <Marker position={position} icon={DefaultIcon}>
      <Popup>
        <div>
          <p><strong>{t('maps.selectedLocation')}</strong></p>
          <p className="text-xs">{address}</p>
          <p className="text-xs">
            {t('maps.lat')}: {position[0].toFixed(6)}, {t('maps.lng')}: {position[1].toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

export default function LocationPicker({ 
  initialPosition = [27.7172, 85.3240], // Default to Kathmandu
  onLocationSelect = () => {}
}) {
  const { t } = useLanguage();
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  
  // Update parent component when position changes
  useEffect(() => {
    if (position) {
      onLocationSelect({
        lat: position[0],
        lng: position[1],
        address
      });
    }
  }, [position, address, onLocationSelect]);

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          
          // Get address for the location
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`
          )
            .then(res => res.json())
            .then(data => {
              setAddress(data.display_name || t('maps.addressNotFound'));
            })
            .catch(err => {
              console.error('Error getting address:', err);
              setAddress(t('maps.errorGettingAddress'));
            });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="w-full h-64 md:h-96 border rounded-md overflow-hidden relative shadow-sm z-0">
        <div className="absolute top-0 left-0 right-0 z-10 bg-white bg-opacity-80 p-2 text-sm flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-teal-600" />
            <span>{t('maps.clickToSelect')}</span>
          </div>
          
          <button 
            type="button" 
            onClick={getUserLocation}
            className="bg-teal-600 text-white px-2 py-1 rounded-md text-xs flex items-center"
          >
            <Navigation className="h-3 w-3 mr-1" />
            {t('maps.useCurrentLocation')}
          </button>
        </div>
        
        <MapContainer
          center={initialPosition}
          zoom={13}
          scrollWheelZoom={true}
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
            t={t}
          />
        </MapContainer>
        
        {!position && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 pointer-events-none">
            <div className="bg-white p-3 rounded-lg shadow-md text-center">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-teal-600" />
              <p className="font-medium text-gray-800">{t('maps.clickToSelect')}</p>
            </div>
          </div>
        )}
      </div>
      
      {position && (
        <div className="text-xs text-gray-500">
          <div className="flex">
            <span className="font-medium w-20">{t('maps.coordinates')}:</span>
            <span>{t('maps.latitude')} {position[0].toFixed(6)}, {t('maps.longitude')} {position[1].toFixed(6)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
