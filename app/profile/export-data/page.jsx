'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function ExportDataPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) redirect('/auth/signin');

  const exportData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nayabato-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({ title: 'Success', description: 'Data exported successfully' });
      } else {
        toast({ title: 'Error', description: 'Failed to export data', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to export data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Download all your data including reported issues, comments, and profile information in JSON format.
          </p>
          
          <Button onClick={exportData} disabled={loading} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Exporting...' : 'Export Data'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
