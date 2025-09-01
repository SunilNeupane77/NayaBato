'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Home, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await fetch('/api/health', { method: 'HEAD' });
      window.location.reload();
    } catch {
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <WifiOff className="w-8 h-8 text-red-600" />
          </div>
          <img src="/globe.svg" alt="Nayabato" className="mx-auto h-8 w-8 mb-2 opacity-50" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Connection Lost
        </h1>
        
        <p className="text-gray-600 mb-6">
          {isOnline 
            ? "Server connection failed. This might be a temporary issue with authentication services."
            : "You're currently offline. Check your internet connection and try again."
          }
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </button>
          
          <Link 
            href="/"
            className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">While offline, you can:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• View previously loaded pages</li>
                <li>• Browse cached issue reports</li>
                <li>• Access your profile information</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Status: {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>
    </div>
  );
}
