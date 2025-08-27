'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
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
  const { t } = useLanguage();
  
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
            <CardTitle>{t('issues.reportIssue.loading') || t('common.loading')}</CardTitle>
            <CardDescription>{t('issues.reportIssue.pleaseWait') || t('common.loading')}</CardDescription>
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
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full" 
            onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('common.back')}
          </Button>
          <h1 className="text-2xl font-bold">{t('issues.reportIssue.title')}</h1>
        </div>
        <Link href="/issues">
          <Button variant="outline">
            {t('issues.allIssues')}
          </Button>
        </Link>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('issues.reportIssue.error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="border-teal-100 shadow-md">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-transparent">
          <CardTitle>{t('issues.reportIssue.issueDetails')}</CardTitle>
          <CardDescription>
            {t('issues.reportIssue.issueDetailsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <IssueForm
            onSuccess={(issueId) => router.push(`/issues/${issueId}`)}
            onError={(err) => setError(err)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
