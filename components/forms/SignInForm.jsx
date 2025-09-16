'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";

// Import shadcn components
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { useToast } from "@/components/ui/use-toast";

// Import language context
import { useLanguage } from '@/lib/i18n/language-context';

export default function SignInForm({ onSuccess, onError, callbackUrl = '/' }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { t } = useLanguage();

  // Define validation schema with Zod
  const signInSchema = z.object({
    email: z.string().email({ message: t('auth.validation.emailInvalid') || "Please enter a valid email address" }),
    password: z.string().min(1, { message: t('auth.validation.passwordRequired') || "Password is required" })
  });

  // Initialize react-hook-form with zod validation
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl,
      });
      
      console.log('SignIn result:', result); // For debugging

      if (result.error) {
        // Check if the error is about pending approval
        const errorMessage = result.error.includes('pending approval') 
          ? result.error 
          : t('auth.invalidCredentials');
        
        // Show toast error
        toast({
          variant: 'destructive',
          title: t('auth.signInFailed'),
          description: errorMessage
        });
        
        setError(errorMessage);
        if (onError) onError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Successful login
      toast({
        title: t('auth.signInSuccess'),
        description: t('auth.welcomeBack')
      });
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect based on user role
        try {
          // Fetch user data to determine role
          const userResponse = await fetch('/api/users/profile');
          const userData = await userResponse.json();
          
          if (userData.success) {
            const userRole = userData.user.role;
            
            // Role-specific redirects
            switch (userRole) {
              case 'admin':
                router.push('/admin/dashboard');
                break;
              case 'official':
                router.push('/issues'); // Officials see issues they need to handle
                break;
              default:
                router.push(callbackUrl || '/');
            }
          } else {
            router.push(callbackUrl || '/');
          }
        } catch (error) {
          // If fetching user data fails, use default redirect
          console.error('Error fetching user data:', error);
          toast({
            variant: 'destructive',
            title: t('common.error'),
            description: t('auth.userDataFetchError') || 'Failed to fetch user data'
          });
          router.push(callbackUrl || '/');
        }
        router.refresh();
      }
      
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('auth.unexpectedError')
      });
      const errorMessage = t('auth.unexpectedError');
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">{t('auth.signInTitle')}</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.email')}</FormLabel>
                <FormControl>
                  <Input placeholder="your@email.com" type="email" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>{t('auth.password')}</FormLabel>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput 
                    placeholder="••••••••" 
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.signingIn')}
              </div>
            ) : (
              t('auth.signIn')
            )}
          </Button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isLoading}
            onClick={() => signIn('google', { callbackUrl })}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </form>
      </Form>
    </div>
  );
}
