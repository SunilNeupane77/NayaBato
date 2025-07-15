'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

// UI Components
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Form component
import SignInForm from '@/components/forms/SignInForm';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [error, setError] = useState(searchParams.get('error') || '');
  
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
            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
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
              Don't have an account?{' '}
              <Link 
                href="/auth/register" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Register
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
