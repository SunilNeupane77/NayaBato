'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Sign in the user after successful registration
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      // Redirect to home page
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-slate-900">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={cn(
                    "block w-full appearance-none rounded-md border px-3 py-2",
                    "border-gray-300 dark:border-gray-700 placeholder-gray-400 shadow-sm",
                    "focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm",
                    "dark:bg-slate-800"
                  )}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={cn(
                    "block w-full appearance-none rounded-md border px-3 py-2",
                    "border-gray-300 dark:border-gray-700 placeholder-gray-400 shadow-sm",
                    "focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm",
                    "dark:bg-slate-800"
                  )}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium">
                Phone Number (optional)
              </label>
              <div className="mt-1">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={cn(
                    "block w-full appearance-none rounded-md border px-3 py-2",
                    "border-gray-300 dark:border-gray-700 placeholder-gray-400 shadow-sm",
                    "focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm",
                    "dark:bg-slate-800"
                  )}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={cn(
                    "block w-full appearance-none rounded-md border px-3 py-2",
                    "border-gray-300 dark:border-gray-700 placeholder-gray-400 shadow-sm",
                    "focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm",
                    "dark:bg-slate-800"
                  )}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={cn(
                    "block w-full appearance-none rounded-md border px-3 py-2",
                    "border-gray-300 dark:border-gray-700 placeholder-gray-400 shadow-sm",
                    "focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm",
                    "dark:bg-slate-800"
                  )}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "flex w-full justify-center rounded-md border border-transparent",
                  "bg-blue-600 py-2 px-4 text-sm font-medium text-white",
                  "shadow-sm hover:bg-blue-700 focus:outline-none",
                  "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  loading ? "opacity-70 cursor-not-allowed" : ""
                )}
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </span>
                ) : (
                  "Register"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 dark:bg-slate-900 dark:text-gray-400">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link 
                href="/auth/signin" 
                className="flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-700 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
