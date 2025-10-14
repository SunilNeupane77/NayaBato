'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, Activity, Globe, Smartphone } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/users?period=${period}`);
      const data = await response.json();
      setAnalytics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center text-red-500">Failed to load analytics data</div>;
  }

  // Process user trends data for chart
  const userTrendsData = analytics.userTrends.reduce((acc, item) => {
    const existing = acc.find(d => d.date === item._id.date);
    if (existing) {
      existing[item._id.role] = item.count;
    } else {
      acc.push({
        date: item._id.date,
        [item._id.role]: item.count
      });
    }
    return acc;
  }, []);

  // Process device stats for pie chart
  const deviceData = analytics.deviceStats.map(item => ({
    name: `${item._id.browser} (${item._id.os})`,
    value: item.count,
    mobile: item._id.isMobile
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="1d">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.newUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Globe className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.activeSessions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Registration Trends */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">User Registration Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={userTrendsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="citizen" fill="#8884d8" name="Citizens" />
            <Bar dataKey="official" fill="#82ca9d" name="Officials" />
            <Bar dataKey="admin" fill="#ffc658" name="Admins" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Activity Breakdown</h2>
          <div className="space-y-3">
            {analytics.activityBreakdown.slice(0, 8).map((activity, index) => (
              <div key={activity._id} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {activity.action.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{activity.count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(activity.count / Math.max(...analytics.activityBreakdown.map(a => a.count))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device/Browser Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Device Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={deviceData.slice(0, 5)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceData.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Geographic Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.geoDistribution.map((location, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="font-medium">{location.location.city || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{location.location.country || 'Unknown'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{location.uniqueUsers}</p>
                <p className="text-sm text-gray-500">{location.sessions} sessions</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
