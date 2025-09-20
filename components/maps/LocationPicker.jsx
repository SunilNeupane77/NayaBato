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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
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
          {t('forms.location')}
        </label>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="flex items-center text-sm text-blue-600 hover:text-blue-500"
        >
          <Navigation className="w-4 h-4 mr-1" />
          {t('forms.useCurrentLocation')}
        </button>
      </div>
      
      <DynamicMap 
        position={position}
        setPosition={setPosition}
        address={address}
        setAddress={setAddress}
      />
      
      {address && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>{t('forms.selectedLocation')}:</strong> {address}
        </div>
      )}
    </div>
  );
}
