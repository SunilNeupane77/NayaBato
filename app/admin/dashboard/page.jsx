'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar, Users, AlertTriangle, CheckCircle, Clock,
  TrendingUp, MapPin, Mail, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, issuesRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/admin/issues?limit=5') // Only fetch 5 for recent list
      ]);

      const analyticsData = await analyticsRes.json();
      const issuesData = await issuesRes.json();

      if (analyticsData.success) {
        setData(analyticsData.analytics);
      }

      if (issuesData.issues) {
        setRecentIssues(issuesData.issues);
      }
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
      const resData = await response.json();

      if (response.ok) {
        alert(`✅ ${resData.message}\n\nDetails:\n• Total Subscribers: ${resData.details.totalSubscribers}\n• Successfully Sent: ${resData.details.successCount}\n• Failed: ${resData.details.failCount}`);
      } else {
        alert(`❌ Error: ${resData.error}`);
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
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
                <div className="h-8 w-16 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded animate-pulse" />
          <div className="h-80 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of platform activity and performance metrics</p>
        </div>
        <Button
          onClick={sendWeeklyDigest}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
        >
          <Mail className="w-4 h-4 mr-2" />
          Send Weekly Digest
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Issues"
          value={data.overview.totalIssues}
          icon={AlertTriangle}
          color="text-blue-600"
          bgColor="bg-blue-100 dark:bg-blue-900/20"
          trend={data.overview.weeklyIssues}
          trendLabel="this week"
        />
        <StatCard
          title="Resolved"
          value={data.overview.resolvedIssues}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-100 dark:bg-green-900/20"
          subValue={`${data.overview.resolutionRate}%`}
          subLabel="Resolution Rate"
        />
        <StatCard
          title="Pending"
          value={data.overview.pendingIssues}
          icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-100 dark:bg-yellow-900/20"
          description="Requires attention"
        />
        <StatCard
          title="Total Users"
          value={data.overview.totalUsers}
          icon={Users}
          color="text-purple-600"
          bgColor="bg-purple-100 dark:bg-purple-900/20"
          description="Registered citizens"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Weekly Trend - Takes up 4 columns */}
        <Card className="lg:col-span-4 shadow-md border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-500" />
              Weekly Activity
            </CardTitle>
            <CardDescription>New issues vs Resolved issues over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trends.weekly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area
                    type="monotone"
                    dataKey="issues"
                    name="New Issues"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorIssues)"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    name="Resolved"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorResolved)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Categories - Takes up 3 columns */}
        <Card className="lg:col-span-3 shadow-md border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
            <CardDescription>Distribution of reported issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.distributions.category}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.distributions.category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-x-16">
                <div className="text-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.overview.totalIssues}</span>
                  <p className="text-xs text-gray-500 uppercase font-medium">Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 - Pie Charts for Status and Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution - Pie Chart */}
        <Card className="shadow-md border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Current status of reported issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex flex-col sm:flex-row items-center justify-center gap-8">
              <div className="h-[250px] w-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.distributions.status}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.distributions.status.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.overview.totalIssues}</span>
                    <p className="text-xs text-gray-500 uppercase font-medium">Total</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-3 min-w-[150px]">
                {data.distributions.status.map((status, index) => (
                  <div key={status.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="capitalize text-gray-700 dark:text-gray-300">
                        {status.name.replace('-', ' ')}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{status.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution - Pie Chart */}
        <Card className="shadow-md border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Priority Levels</CardTitle>
            <CardDescription>Severity of reported issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex flex-col sm:flex-row items-center justify-center gap-8">
              <div className="h-[250px] w-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.distributions.priority}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.distributions.priority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.name === 'critical' ? '#ef4444' :
                            entry.name === 'high' ? '#f97316' :
                              entry.name === 'medium' ? '#f59e0b' : '#3b82f6'
                        } strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-3 min-w-[150px]">
                {data.distributions.priority.map((priority, index) => (
                  <div key={priority.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            priority.name === 'critical' ? '#ef4444' :
                              priority.name === 'high' ? '#f97316' :
                                priority.name === 'medium' ? '#f59e0b' : '#3b82f6'
                        }}
                      />
                      <span className="capitalize text-gray-700 dark:text-gray-300">
                        {priority.name}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{priority.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues Table */}
      <Card className="shadow-md border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            Recent Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIssues.map((issue) => (
              <div key={issue._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full mt-1 ${issue.priority === 'critical' ? 'bg-red-100 text-red-600' :
                    issue.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{issue.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {issue.location?.address || 'No location'}
                      </span>
                      <span>•</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-14 sm:pl-0">
                  <Badge variant="outline" className="capitalize">{issue.category}</Badge>
                  <Badge
                    className={
                      issue.status === 'resolved' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' :
                        issue.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' :
                          issue.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' :
                            'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
                    }
                  >
                    {issue.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
            {recentIssues.length === 0 && (
              <div className="text-center py-8 text-gray-500">No recent issues found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor, trend, trendLabel, subValue, subLabel, description }) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="h-3 w-3" />
              +{trend}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</h3>
          {(subValue || description || trendLabel) && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              {subValue && <span className="font-semibold text-gray-900">{subValue}</span>}
              <span>{subLabel || description || (trendLabel && `New ${trendLabel}`)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
