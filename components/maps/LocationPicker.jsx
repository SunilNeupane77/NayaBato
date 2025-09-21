'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { MapPin, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the entire map component to avoid SSR issues
const DynamicMap = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useLanguage();
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">{t('common.loadingMap')}</div>
      </div>
    );
  }
});

export default function LocationPicker({ 
  position, 
  setPosition, 
  address, 
  setAddress, 
  className = "" 
}) {
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          
          // Get location name using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            const locationName = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setAddress(locationName);
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
            setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  if (!isClient) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">{t('common.loadingMap')}</div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          <MapPin className="inline w-4 h-4 mr-1" />
          {t('maps.issueLocation') || t('forms.location')}
        </label>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="flex items-center text-sm text-blue-600 hover:text-blue-500"
        >
          <Navigation className="w-4 h-4 mr-1" />
          {t('maps.useCurrentLocation')}
        </button>
      </div>
      
      <DynamicMap 
        position={position}
        setPosition={setPosition}
        address={address}
        setAddress={setAddress}
      />
      
      {address && position && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg space-y-1">
          <div><strong>{t('maps.selectedLocation')}:</strong> {address}</div>
          <div className="text-xs text-gray-500">
            <strong>{t('maps.coordinates')}:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
}
