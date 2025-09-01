'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RealTimeStats from '@/components/admin/RealTimeStats';
import { Calendar, Users, AlertTriangle, CheckCircle, Clock, TrendingUp, MapPin, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalIssues: 0,
    totalUsers: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    recentIssues: [],
    categoryData: [],
    statusData: [],
    weeklyData: [],
    priorityData: [],
    departmentData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [issuesRes, usersRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/issues'),
        fetch('/api/admin/users'),
        fetch('/api/analytics')
      ]);

      const [issues, users, analytics] = await Promise.all([
        issuesRes.json(),
        usersRes.json(),
        analyticsRes.json()
      ]);

      // Process data for charts
      const categoryData = Object.entries(
        issues.issues?.reduce((acc, issue) => {
          acc[issue.category] = (acc[issue.category] || 0) + 1;
          return acc;
        }, {}) || {}
      ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

      const statusData = Object.entries(
        issues.issues?.reduce((acc, issue) => {
          acc[issue.status] = (acc[issue.status] || 0) + 1;
          return acc;
        }, {}) || {}
      ).map(([name, value]) => ({ name: name.replace('-', ' ').toUpperCase(), value }));

      const priorityData = Object.entries(
        issues.issues?.reduce((acc, issue) => {
          acc[issue.priority || 'medium'] = (acc[issue.priority || 'medium'] || 0) + 1;
          return acc;
        }, {}) || {}
      ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

      // Weekly trend data (last 7 days)
      const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayIssues = issues.issues?.filter(issue => 
          new Date(issue.createdAt).toDateString() === date.toDateString()
        ).length || 0;
        return {
          day: date.toLocaleDateString('en', { weekday: 'short' }),
          issues: dayIssues,
          resolved: issues.issues?.filter(issue => 
            new Date(issue.updatedAt).toDateString() === date.toDateString() && 
            issue.status === 'resolved'
          ).length || 0
        };
      });

      setStats({
        totalIssues: issues.issues?.length || 0,
        totalUsers: users.users?.length || 0,
        pendingIssues: issues.issues?.filter(i => !['resolved', 'rejected'].includes(i.status)).length || 0,
        resolvedIssues: issues.issues?.filter(i => i.status === 'resolved').length || 0,
        recentIssues: issues.issues?.slice(0, 5) || [],
        categoryData,
        statusData,
        weeklyData,
        priorityData,
        departmentData: users.users?.reduce((acc, user) => {
          if (user.department) {
            acc[user.department] = (acc[user.department] || 0) + 1;
          }
          return acc;
        }, {}) || {}
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendWeeklyDigest = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email/weekly-digest', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ ${data.message}\n\nDetails:\n• Total Subscribers: ${data.details.totalSubscribers}\n• Successfully Sent: ${data.details.successCount}\n• Failed: ${data.details.failCount}`);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Failed to send weekly digest. Please try again.');
      console.error('Weekly digest error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of platform activity and metrics</p>
        </div>
        <Button onClick={sendWeeklyDigest} className="bg-purple-600 hover:bg-purple-700">
          <Mail className="w-4 h-4 mr-2" />
          Send Weekly Digest
        </Button>
      </div>

      {/* Real-time Session Stats */}
      <RealTimeStats />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolvedIssues}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingIssues}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="issues" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="resolved" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Issue Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status and Category Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Issues by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.statusData.map((status, index) => (
                <div key={status.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium capitalize">{status.name.replace('-', ' ')}</span>
                  </div>
                  <Badge variant="secondary">{status.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Issues by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium capitalize">{category.name}</span>
                  </div>
                  <Badge variant="secondary">{category.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resolution Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Resolution Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentIssues.map((issue) => (
              <div key={issue._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{issue.title}</span>
                  </div>
                  <Badge variant="outline">{issue.category}</Badge>
                  <Badge 
                    className={
                      issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      issue.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }
                  >
                    {issue.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
