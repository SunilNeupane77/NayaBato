'use client';

import { Clock, Loader2, Mail, Settings, Shield } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// UI Components
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userIssues, setUserIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/profile');
    }
  }, [status, router]);
  
  // Fetch user's issues
  useEffect(() => {
    async function fetchUserIssues() {
      if (status !== 'authenticated') return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/issues?reporter=${session.user.id}&limit=5`);
        
        if (!response.ok) {
          throw new Error('Failed to load issues');
        }
        
        const data = await response.json();
        setUserIssues(data.issues);
      } catch (err) {
        console.error('Error fetching user issues:', err);
        setError(err.message || 'Failed to load your issues');
      } finally {
        setLoading(false);
      }
    }
    
    if (status === 'authenticated') {
      fetchUserIssues();
    }
  }, [status, session]);

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Show not authenticated state
  if (status === 'unauthenticated') {
    return null; // We're redirecting in the useEffect
  }

  // Helper function to get initials from name
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'U';
  };

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="sr-only">User Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{session?.user?.name}</CardTitle>
            <div className="flex justify-center">
              <Badge>{session?.user?.role || 'citizen'}</Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{session?.user?.email}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">Joined {formatDate(session?.user?.createdAt || new Date())}</span>
              </div>
              
              {session?.user?.role !== 'citizen' && (
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Official Account</span>
                </div>
              )}
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/profile/edit">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
              
              <Button asChild className="w-full">
                <Link href="/issues/report">
                  Report New Issue
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* User Activity */}
        <div className="md:col-span-2">
          <Tabs defaultValue="issues" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="issues">My Issues</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="issues">
              <Card>
                <CardHeader>
                  <CardTitle>My Reported Issues</CardTitle>
                  <CardDescription>Issues you've submitted to Nayabato</CardDescription>
                </CardHeader>
                
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  ) : error ? (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : userIssues.length > 0 ? (
                    <div className="space-y-4">
                      {userIssues.map((issue) => (
                        <div 
                          key={issue._id} 
                          className="p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => router.push(`/issues/${issue._id}`)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-lg">{issue.title}</h3>
                            <Badge className={`bg-${issue.status === 'resolved' ? 'green' : issue.status === 'rejected' ? 'red' : 'blue'}-500`}>
                              {issue.status}
                            </Badge>
                          </div>
                          <p className="text-gray-500 text-sm mb-2">
                            {issue.location?.address}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Reported on {formatDate(issue.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-4">You haven't reported any issues yet.</p>
                      <Button asChild>
                        <Link href="/issues/report">Report Your First Issue</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/issues?reporter=me">
                      View All My Issues
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Recent actions and updates</CardDescription>
                </CardHeader>
                
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">
                    Activity tracking will be available in a future update.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
