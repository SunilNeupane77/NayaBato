'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar, Users, AlertTriangle, CheckCircle, Clock,
  TrendingUp, MapPin, Mail, Activity, ArrowUpRight, ArrowDownRight,
  FileText, Shield, Eye
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, description, subValue, subLabel }) => (
  <Card className="border-gray-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-gray-50">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            {trend > 0 ? (
              <ArrowUpRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-gray-600" />
            )}
            <span className="text-sm font-medium text-gray-600">
              {Math.abs(trend)}
            </span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
        {subValue && (
          <span className="text-sm font-medium text-gray-500">({subValue})</span>
        )}
      </div>
      {trendLabel && (
        <p className="text-xs text-gray-500 mt-1">{trendLabel}</p>
      )}
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
      {subLabel && (
        <p className="text-xs text-gray-500 mt-1">{subLabel}</p>
      )}
    </CardContent>
  </Card>
);

export default function OfficialDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/official/dashboard');
      
      if (response.ok) {
        const dashboardData = await response.json();
        
        // Transform the data to match our needs
        const stats = dashboardData.stats || {};
        const transformedData = {
          overview: {
            totalIssues: stats.totalIssues || 0,
            resolvedIssues: stats.resolvedIssues || 0,
            pendingIssues: stats.pendingIssues || 0,
            inProgressIssues: stats.inProgressIssues || 0,
            totalUsers: stats.citizensCount || 0,
            activeWards: stats.activeWards || 0,
            resolutionRate: stats.totalIssues > 0 
              ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100) 
              : 0,
            weeklyIssues: stats.weeklyIssues || 0
          },
          trends: {
            weekly: dashboardData.weeklyTrend || []
          },
          issuesByStatus: [
            { name: 'Pending', value: stats.pendingIssues || 0 },
            { name: 'In Progress', value: stats.inProgressIssues || 0 },
            { name: 'Resolved', value: stats.resolvedIssues || 0 }
          ],
          issuesByPriority: [
            { name: 'High', value: stats.highPriority || 0 },
            { name: 'Medium', value: stats.mediumPriority || 0 },
            { name: 'Low', value: stats.lowPriority || 0 }
          ]
        };
        
        setData(transformedData);
        setRecentIssues(dashboardData.recentIssues || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
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
      </div>
    );
  }

  if (!data) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'in_progress': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-gray-700';
      case 'medium': return 'text-gray-700';
      case 'low': return 'text-gray-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Official Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {session?.user?.name} - Manage your assigned wards and issues
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Issues"
          value={data.overview.totalIssues}
          icon={AlertTriangle}
          trend={data.overview.weeklyIssues}
          trendLabel="this week"
        />
        <StatCard
          title="Resolved"
          value={data.overview.resolvedIssues}
          icon={CheckCircle}
          subValue={`${data.overview.resolutionRate}%`}
          subLabel="Resolution Rate"
        />
        <StatCard
          title="Pending"
          value={data.overview.pendingIssues}
          icon={Clock}
          description="Requires attention"
        />
        <StatCard
          title="Assigned Wards"
          value={data.overview.activeWards}
          icon={MapPin}
          description="Under your management"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Issues by Status */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              Issues by Status
            </CardTitle>
            <CardDescription>Distribution of issues across different statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.issuesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#6b7280"
                    dataKey="value"
                  >
                    {data.issuesByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`#${(6 + index * 2).toString(16)}b7280`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Recent Issues
              </CardTitle>
              <CardDescription>Latest issues reported in your wards</CardDescription>
            </div>
            <Link href="/official/issues">
              <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                View All
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIssues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent issues</p>
              </div>
            ) : (
              recentIssues.map((issue) => (
                <div
                  key={issue._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <Link href={`/issues/${issue._id}`} className="hover:underline">
                      <h4 className="font-medium text-gray-900 truncate">
                        {issue.title}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className={`text-sm font-medium ${getPriorityColor(issue.priority)}`}>
                        {issue.priority?.toUpperCase()} Priority
                      </span>
                      {issue.ward?.name && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {issue.ward.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link href={`/issues/${issue._id}`}>
                    <Button size="sm" variant="ghost" className="text-gray-600 hover:bg-gray-100">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200 hover:shadow-sm transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              Ward Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View and manage your assigned wards
            </p>
            <Link href="/official/wards">
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Manage Wards ({data.overview.activeWards})
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-sm transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              Issue Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Track and resolve issues efficiently
            </p>
            <Link href="/official/issues">
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                View Issues ({data.overview.totalIssues})
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-sm transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Manage users in your wards
            </p>
            <Link href="/official/users">
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                View Users ({data.overview.totalUsers})
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
