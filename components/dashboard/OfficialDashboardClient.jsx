'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, AlertTriangle, CheckCircle, Clock, TrendingUp, MapPin, FileText, User } from 'lucide-react';
import Link from 'next/link';

export default function OfficialDashboardClient({ session }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const response = await fetch('/api/official/dashboard');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data received:', data);
        setDashboardData(data);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        setError(errorData.error || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 sm:p-6">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-700">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Official Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Welcome back, {session.user.name}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Issues</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalIssues || 0}</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.pendingIssues || 0}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">In Progress</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.inProgressIssues || 0}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Resolved</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.resolvedIssues || 0}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Citizens</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.citizensCount || 0}</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ward Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/official/wards">
              <Button className="w-full">
                Manage Wards ({stats.activeWards || 0})
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Issue Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/official/issues">
                <Button className="w-full" variant="outline">
                  Official Issues
                </Button>
              </Link>
              <Link href="/issues">
                <Button className="w-full" variant="secondary">
                  All Issues (Original)
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/official/users">
              <Button className="w-full" variant="outline">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sessions & Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/official/sessions">
              <Button className="w-full" variant="outline">
                View Activity
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues and Assigned Wards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentIssues?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentIssues.slice(0, 5).map((issue) => (
                  <div key={issue._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{issue.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{issue.category || 'General'}</Badge>
                        <Badge 
                          className={
                            issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            issue.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {issue.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{issue.user?.name || 'Unknown'}</span>
                        <Calendar className="h-4 w-4 ml-2" />
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent issues to display</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Wards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Assigned Wards
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.assignedWards?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.assignedWards.map((ward) => (
                  <div key={ward._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <span className="font-medium">{ward.name}</span>
                      <p className="text-sm text-gray-500">Ward {ward.number}</p>
                    </div>
                    <Link href={`/official/wards/${ward._id}`}>
                      <Button size="sm" variant="outline">
                        Manage
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No wards assigned</p>
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/auto-assign-wards', { method: 'POST' });
                      if (response.ok) {
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error('Auto-assignment failed:', error);
                    }
                  }}
                  size="sm" 
                  className="mt-2"
                >
                  Auto-Assign Wards
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
