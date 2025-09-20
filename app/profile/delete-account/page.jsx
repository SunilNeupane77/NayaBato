'use client';

import { ArrowLeft, AlertTriangle, Trash2 } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function DeleteAccountPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') {
      toast({
        title: "Error",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Account deleted",
          description: "Your account has been permanently deleted."
        });
        await signOut({ callbackUrl: '/' });
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-red-600">Delete Account</h1>
        <p className="text-gray-600">This action cannot be undone</p>
      </div>

      <Alert className="mb-6 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Warning:</strong> Deleting your account will permanently remove all your data, including reported issues, comments, and profile information. This action cannot be reversed.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <Trash2 className="h-5 w-5 mr-2" />
            Confirm Account Deletion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="confirmation">
              Type <strong>DELETE</strong> to confirm:
            </Label>
            <Input
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
              className="mt-2"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              onClick={handleDelete} 
              disabled={loading || confirmation !== 'DELETE'}
              variant="destructive"
              className="flex-1"
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/profile">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
