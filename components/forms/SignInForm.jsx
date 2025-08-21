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

// Define validation schema with Zod
const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" })
});

export default function SignInForm({ onSuccess, onError, callbackUrl = '/' }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
          : 'Invalid email or password';
        
        setError(errorMessage);
        if (onError) onError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Successful login
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
                router.push('/admin/dashboard'); // Officials now have access to dashboard
                break;
              default:
                router.push(callbackUrl || '/');
            }
          } else {
            router.push(callbackUrl || '/');
          }
        } catch (error) {
          // If fetching user data fails, use default redirect
          router.push(callbackUrl || '/');
        }
        router.refresh();
      }
      
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
      
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
                <FormLabel>Email</FormLabel>
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
                  <FormLabel>Password</FormLabel>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input placeholder="••••••••" type="password" {...field} disabled={isLoading} />
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
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>
      
      
    </div>
  );
}
