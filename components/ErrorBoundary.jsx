'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

/**
 * Error boundary component to catch and display errors in the UI
 */
export default function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Handle errors that occur during rendering
  useEffect(() => {
    // Create a global error handler
    const errorHandler = (event) => {
      console.error('Global error caught:', event.error);
      setError(event.error || new Error('An unknown error occurred'));
      
      // Show toast notification
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: event.error?.message || 'Something went wrong',
      });
      
      // Prevent the default error handling
      event.preventDefault();
    };

    // Add the global error event listener
    window.addEventListener('error', errorHandler);
    
    // Remove the event listener on cleanup
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, [toast]);

  // Reset the error state
  const resetError = () => {
    setError(null);
  };

  // If there's an error, render fallback UI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-6">
        <div className="p-6 max-w-md w-full bg-white rounded-lg shadow-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <div className="flex justify-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mr-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
            <Button 
              onClick={resetError}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If no error, render children normally
  return children;
}
