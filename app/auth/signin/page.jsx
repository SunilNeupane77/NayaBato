'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Shield, ClipboardList, Bell, Home } from 'lucide-react';

// UI Components
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Form component
import SignInForm from '@/components/forms/SignInForm';

// Language
import { useLanguage } from '@/lib/i18n/language-context';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [error, setError] = useState(searchParams.get('error') || '');
  const { t } = useLanguage();
  
  const handleSignInSuccess = () => {
    router.push(callbackUrl);
    router.refresh();
  };
  
  const handleSignInError = (errorMessage) => {
    setError(errorMessage);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-gray-600 hover:text-gray-900"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('auth.back')}
          </Button>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t('auth.signInTitle')}
                </h1>
                <p className="text-gray-600">
                  {t('auth.signInDescription')}
                </p>
              </div>

              <SignInForm
                onSuccess={handleSignInSuccess}
                onError={handleSignInError}
                callbackUrl={callbackUrl}
              />

              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-center text-sm text-gray-600">
                  {t('auth.newHere')}{' '}
                  <Link 
                    href="/auth/register" 
                    className="font-semibold text-teal-600 hover:text-teal-500 transition-colors"
                  >
                    {t('auth.createAccountLink')}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Visual Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-600 to-cyan-600 items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-teal-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
            <Shield className="w-12 h-12 text-teal-200" />
          </div>
          <h2 className="text-2xl font-bold mb-12">{t('auth.welcomeBack')}</h2>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-teal-200" />
              </div>
              <p className="text-sm text-teal-100 font-medium">{t('auth.track')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-teal-200" />
              </div>
              <p className="text-sm text-teal-100 font-medium">{t('auth.updates')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-teal-200" />
              </div>
              <p className="text-sm text-teal-100 font-medium">{t('auth.community')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
