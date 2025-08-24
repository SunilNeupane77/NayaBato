'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

// UI Components
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="container flex h-screen items-center justify-center">
      <div className="w-full max-w-md">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">{t('auth.signInTitle')}</CardTitle>
            <CardDescription>
              {t('auth.signInDescription')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <SignInForm
              onSuccess={handleSignInSuccess}
              onError={handleSignInError}
              callbackUrl={callbackUrl}
            />
          </CardContent>
          
          <CardFooter>
            <div className="text-sm text-center w-full">
              {t('auth.dontHaveAccount')}{' '}
              <Link 
                href="/auth/register" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {t('navigation.register')}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
