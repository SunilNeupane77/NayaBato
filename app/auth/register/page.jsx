'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, UserPlus, Camera, MapPin, MessageSquare } from 'lucide-react';

// UI Components
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Form component
import RegisterForm from '@/components/forms/RegisterForm';

// Language
import { useLanguage } from '@/lib/i18n/language-context';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { t } = useLanguage();
  
  const handleRegistrationSuccess = () => {
    router.push('/auth/signin?message=Registration successful! Please sign in.');
  };
  
  const handleRegistrationError = (errorMessage) => {
    setError(errorMessage);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 flex">
      {/* Left Side - Visual Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-cyan-600 to-teal-600 items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
            <UserPlus className="w-12 h-12 text-cyan-200" />
          </div>
          <h2 className="text-2xl font-bold mb-12">{t('auth.joinCommunity')}</h2>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-cyan-200" />
              </div>
              <p className="text-sm text-cyan-100 font-medium">{t('auth.report')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-cyan-200" />
              </div>
              <p className="text-sm text-cyan-100 font-medium">{t('auth.locate')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-cyan-200" />
              </div>
              <p className="text-sm text-cyan-100 font-medium">{t('auth.connect')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900"
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
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t('auth.createAccountTitle')}
                </h1>
                <p className="text-gray-600">
                  {t('auth.createAccountDescription')}
                </p>
              </div>

              <RegisterForm
                onSuccess={handleRegistrationSuccess}
                onError={handleRegistrationError}
              />

              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-center text-sm text-gray-600">
                  {t('auth.alreadyHaveAccountText')}{' '}
                  <Link 
                    href="/auth/signin" 
                    className="font-semibold text-teal-600 hover:text-teal-500 transition-colors"
                  >
                    {t('auth.signInLink')}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
