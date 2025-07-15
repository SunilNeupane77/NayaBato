'use client';

import { AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// UI Components
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Form component
import IssueForm from '@/components/forms/IssueForm';

export default function ReportIssuePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState(null);
  
  // Redirect to sign in if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/issues/report');
    return null;
  }
  
  // Show loading state
  if (status === 'loading') {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-8">
            <div className="animate-pulse h-6 w-32 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Report New Issue</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Issue Details</CardTitle>
          <CardDescription>
            Please provide information about the issue you'd like to report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IssueForm
            onSuccess={(issueId) => router.push(`/issues/${issueId}`)}
            onError={(err) => setError(err)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
