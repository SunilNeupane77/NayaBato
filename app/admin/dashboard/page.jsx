'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Status colors for charts
const STATUS_COLORS = {
  'reported': '#f97316', // Orange
  'under-review': '#3b82f6', // Blue
  'in-progress': '#eab308', // Yellow
  'resolved': '#22c55e', // Green
  'rejected': '#ef4444', // Red
};

// Format status for display
const formatStatus = (status) => {
  const map = {
    'reported': 'Reported',
    'under-review': 'Under Review',
    'in-progress': 'In Progress',
    'resolved': 'Resolved',
    'rejected': 'Not Actionable',
  };
  return map[status] || status;
};

// Format category for display
const formatCategory = (category) => {
  const map = {
    'pothole': 'Potholes',
    'streetlight': 'Streetlights',
    'garbage': 'Garbage',
    'water': 'Water Issues',
    'electricity': 'Electricity',
    'other': 'Other Issues',
  };
  return map[category] || category;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication and authorization
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/dashboard');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/stats');
        
        if (!response.ok) {
          throw new Error('Failed to load dashboard data');
        }
        
        const data = await response.json();
        setStats(data.stats);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchStats();
    }
  }, [status, session, router]);

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Extract data for charts
  const statusData = stats?.issuesByStatus.map(item => ({
    name: formatStatus(item.status),
    value: item.count,
    color: STATUS_COLORS[item.status]
  })) || [];

  const categoryData = stats?.issuesByCategory.map(item => ({
    name: formatCategory(item.category),
    value: item.count
  })) || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of civic issues</p>
        </div>
        <Button onClick={() => router.push('/issues')} className="mt-4 md:mt-0">
          View All Issues
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalIssues || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              {(stats?.issuesByStatus.find(s => s.status === 'reported')?.count || 0) + 
               (stats?.issuesByStatus.find(s => s.status === 'under-review')?.count || 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              {stats?.issuesByStatus.find(s => s.status === 'in-progress')?.count || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Resolved Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {stats?.issuesByStatus.find(s => s.status === 'resolved')?.count || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Issues</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Issues by Status</CardTitle>
                <CardDescription>Distribution of issues by current status</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} issues`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Category Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Issues by Category</CardTitle>
                <CardDescription>Distribution of issues by category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                      tick={{ fontSize: 12 }} 
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Issues" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
              <CardDescription>Latest reported issues</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentIssues && stats.recentIssues.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentIssues.map((issue) => (
                    <div 
                      key={issue._id} 
                      className="flex flex-col md:flex-row justify-between border-b pb-4 cursor-pointer"
                      onClick={() => router.push(`/issues/${issue._id}`)}
                    >
                      <div>
                        <div className="flex items-center mb-2">
                          <Badge className="bg-blue-500 mr-2">{formatCategory(issue.category)}</Badge>
                          <Badge className={`${STATUS_COLORS[issue.status]}`}>
                            {formatStatus(issue.status)}
                          </Badge>
                        </div>
                        <h3 className="font-medium">{issue.title}</h3>
                        <p className="text-sm text-gray-500 truncate max-w-md">
                          {issue.description.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0 text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                          {issue.reporter?.name || 'Anonymous'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent issues to display
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" onClick={() => router.push('/issues')}>
                View All Issues
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resolution Time */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Average Resolution Time</CardTitle>
          <CardDescription>Time taken to resolve issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {stats?.averageResolutionTimeInDays
                  ? `${stats.averageResolutionTimeInDays.toFixed(1)} days`
                  : 'N/A'}
              </div>
              <p className="text-gray-500">Average time to resolve an issue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
