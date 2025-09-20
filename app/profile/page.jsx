'use client';

import { Clock, Loader2, Mail, Settings, Shield, Bell, MapPin, BarChart3, Heart, MessageSquare, Calendar, Award } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userIssues, setUserIssues] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    emailNotifications: true,
    digestEmails: false,
    locationSharing: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/profile');
    }
  }, [status, router]);
  
  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      if (status !== 'authenticated') return;
      
      try {
        setLoading(true);
        const [issuesRes, statsRes, notificationsRes] = await Promise.all([
          fetch(`/api/issues?reporter=${session.user.id}&limit=5`),
          fetch(`/api/users/stats`),
          fetch(`/api/notifications?limit=5`)
        ]);
        
        if (issuesRes.ok) {
          const issuesData = await issuesRes.json();
          setUserIssues(issuesData.issues);
        }
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setUserStats(statsData);
        }
        
        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json();
          setNotifications(notificationsData.notifications || []);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }
    
    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, session]);

  const updatePreferences = async (key, value) => {
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });
      
      if (response.ok) {
        setUserPreferences(prev => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

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
    return null;
  }

  const getInitials = (name) => {
    return name?.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2) || 'U';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="sr-only">User Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* User Profile Card */}
        <Card className="lg:col-span-1">
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
              <Badge variant={session?.user?.role === 'admin' ? 'destructive' : session?.user?.role === 'official' ? 'default' : 'secondary'}>
                {session?.user?.role || 'citizen'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{session?.user?.email}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
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
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userStats.totalIssues || 0}</div>
                <div className="text-xs text-gray-500">Issues Reported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userStats.resolvedIssues || 0}</div>
                <div className="text-xs text-gray-500">Resolved</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/profile/edit">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/profile/change-password">
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="issues">My Issues</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Activity Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Activity Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Issues</span>
                        <Badge variant="outline">{userStats.totalIssues || 0}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Resolved</span>
                        <Badge variant="outline" className="bg-green-50">{userStats.resolvedIssues || 0}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>In Progress</span>
                        <Badge variant="outline" className="bg-blue-50">{userStats.inProgressIssues || 0}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending</span>
                        <Badge variant="outline" className="bg-yellow-50">{userStats.pendingIssues || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userIssues.slice(0, 3).map((issue) => (
                      <div key={issue._id} className="flex items-center space-x-3 mb-3 last:mb-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{issue.title}</p>
                          <p className="text-xs text-gray-500">{formatDate(issue.createdAt)}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {issue.status}
                        </Badge>
                      </div>
                    ))}
                    {userIssues.length === 0 && (
                      <p className="text-sm text-gray-500">No recent activity</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
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
                            <Badge variant={
                              issue.status === 'resolved' ? 'default' : 
                              issue.status === 'rejected' ? 'destructive' : 
                              'secondary'
                            }>
                              {issue.status}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {issue.location?.address}
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                              Reported on {formatDate(issue.createdAt)}
                            </p>
                            <div className="flex items-center space-x-2">
                              {issue.votes?.upvotes > 0 && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Heart className="h-3 w-3 mr-1" />
                                  {issue.votes.upvotes}
                                </div>
                              )}
                              {issue.commentsCount > 0 && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  {issue.commentsCount}
                                </div>
                              )}
                            </div>
                          </div>
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
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Recent updates and alerts</CardDescription>
                </CardHeader>
                
                <CardContent>
                  {notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div key={notification._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(notification.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">No notifications yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive email updates about your issues</p>
                    </div>
                    <Switch
                      checked={userPreferences.emailNotifications}
                      onCheckedChange={(checked) => updatePreferences('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Weekly Digest</h4>
                      <p className="text-sm text-gray-500">Get weekly summary of platform activity</p>
                    </div>
                    <Switch
                      checked={userPreferences.digestEmails}
                      onCheckedChange={(checked) => updatePreferences('digestEmails', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Location Sharing</h4>
                      <p className="text-sm text-gray-500">Allow location-based issue suggestions</p>
                    </div>
                    <Switch
                      checked={userPreferences.locationSharing}
                      onCheckedChange={(checked) => updatePreferences('locationSharing', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/profile/export-data">
                        Export My Data
                      </Link>
                    </Button>
                    
                    <Button variant="destructive" className="w-full">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
