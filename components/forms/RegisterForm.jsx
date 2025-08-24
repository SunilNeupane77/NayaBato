'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import language context
import { useLanguage } from '@/lib/i18n/language-context';

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { t } = useLanguage();
  
  // Define validation schema with Zod
  const registerSchema = z.object({
    name: z.string().min(2, { message: t('auth.validation.nameRequired') || "Name must be at least 2 characters" }),
    email: z.string().email({ message: t('auth.validation.emailInvalid') || "Please enter a valid email address" }),
    password: z.string().min(6, { message: t('auth.validation.passwordLength') || "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    role: z.enum(["citizen", "official"])
  }).refine(data => data.password === data.confirmPassword, {
    message: t('auth.validation.passwordsDoNotMatch') || "Passwords do not match",
    path: ["confirmPassword"],
  });
  
  // Initialize react-hook-form with zod validation
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "citizen"
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('auth.registrationFailed'));
      }

      // Success
      setSuccess(t('auth.registrationRedirect'));
      
      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || t('auth.unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">{t('auth.createAccount')}</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 border-green-500 text-green-800 dark:text-green-400">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('auth.namePlaceholder') || "John Doe"} {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                <FormLabel>{t('auth.password')}</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" type="password" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" type="password" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.registerAs')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('auth.selectRole')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="citizen">{t('auth.citizen')}</SelectItem>
                    <SelectItem value="official">{t('auth.official')}</SelectItem>
                  </SelectContent>
                </Select>
                {field.value === 'official' && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {t('auth.officialNote')}
                  </p>
                )}
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
                {t('auth.creatingAccount')}
              </div>
            ) : (
              t('auth.createAccount')
            )}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm">
        {t('auth.alreadyHaveAccount')}{" "}
        <Link 
          href="/auth/signin" 
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium"
        >
          {t('auth.signIn')}
        </Link>
      </div>
    </div>
  );
}
