'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export default function SessionTimeout() {
  const { data: session } = useSession();
  const [showExpired, setShowExpired] = useState(false);
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const { t } = useLanguage();

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    lastActivityRef.current = Date.now();
    
    if (session) {
      timeoutRef.current = setTimeout(() => {
        setShowExpired(true);
        signOut({ redirect: false });
      }, TIMEOUT_DURATION);
    }
  };

  useEffect(() => {
    if (!session) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });

    resetTimeout();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [session]);

  if (!showExpired) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{t('common.sessionExpired')}</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          {t('common.sessionExpiredMessage')}
        </p>
        
        <button
          onClick={() => window.location.href = '/auth/signin'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <LogIn className="h-4 w-4" />
          {t('common.signInAgain')}
        </button>
      </div>
    </div>
  );
}
