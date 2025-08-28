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
        </form>
      </Form>
    </div>
  );
}
