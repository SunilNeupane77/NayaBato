'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

import OTPInput from '@/components/ui/otp-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const email = searchParams?.get('email');
  const type = searchParams?.get('type');
  const userData = searchParams?.get('userData') ? JSON.parse(decodeURIComponent(searchParams.get('userData'))) : null;

  useEffect(() => {
    if (!email || !type) {
      router.push('/auth/signin');
    }
  }, [email, type, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOTPComplete = async (otp) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      toast({
        title: 'Success',
        description: data.message
      });

      // Redirect based on type
      if (type === 'signup') {
        router.push('/auth/signin?message=Account created successfully! Please sign in.');
      } else if (type === 'password_reset') {
        router.push(`/auth/reset-password?email=${email}&verified=true`);
      } else {
        router.push('/');
      }

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type, userData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      toast({
        title: 'Success',
        description: 'OTP sent successfully'
      });

      setCountdown(60);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message
      });
    } finally {
      setIsResending(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'signup': return 'Verify Your Email';
      case 'password_reset': return 'Verify OTP';
      case 'email_verification': return 'Verify Your Email';
      default: return 'Verify OTP';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'signup': return `We've sent a verification code to ${email}. Please enter it below to complete your registration.`;
      case 'password_reset': return `We've sent a verification code to ${email}. Please enter it below to reset your password.`;
      case 'email_verification': return `We've sent a verification code to ${email}. Please enter it below to verify your email.`;
      default: return `We've sent a verification code to ${email}. Please enter it below.`;
    }
  };

  if (!email || !type) {
    return null;
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">{getTitle()}</CardTitle>
            <CardDescription className="text-center">
              {getDescription()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <OTPInput 
              length={6} 
              onComplete={handleOTPComplete}
              disabled={isLoading}
            />
            
            {isLoading && (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Verifying...</span>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                onClick={handleResendOTP}
                disabled={isResending || countdown > 0}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  'Resend OTP'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="container flex h-screen items-center justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
