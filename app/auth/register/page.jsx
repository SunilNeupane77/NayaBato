'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// UI Components
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Form component
import RegisterForm from '@/components/forms/RegisterForm';

// Language
import { useLanguage } from '@/lib/i18n/language-context';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { t } = useLanguage();
  
  const handleRegistrationSuccess = () => {
    // Redirect to sign in page after successful registration
    router.push('/auth/signin?message=Registration successful! Please sign in.');
  };
  
  const handleRegistrationError = (errorMessage) => {
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
            <CardTitle className="text-2xl font-bold">{t('auth.createAccountTitle')}</CardTitle>
            <CardDescription>
              {t('auth.createAccountDescription')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <RegisterForm
              onSuccess={handleRegistrationSuccess}
              onError={handleRegistrationError}
            />
          </CardContent>
          
          
        </Card>
      </div>
    </div>
  );
}
