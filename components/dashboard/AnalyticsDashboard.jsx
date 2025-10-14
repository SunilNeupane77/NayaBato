'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?timeframe=${timeframe}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (!analytics) return <div className="p-6">Failed to load analytics</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Issue Analytics</h2>
        <select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <PieChart width={300} height={200}>
            <Pie
              data={analytics.statusStats}
              cx={150}
              cy={100}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="_id"
            >
              {analytics.statusStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Issues by Category</h3>
          <BarChart width={300} height={200} data={analytics.categoryStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </div>

        {/* Resolution Times */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Resolution Times</h3>
          {analytics.resolutionTimes[0] && (
            <div className="space-y-2">
              <div>Avg: {analytics.resolutionTimes[0].avgResolutionTime?.toFixed(1)} days</div>
              <div>Min: {analytics.resolutionTimes[0].minResolutionTime?.toFixed(1)} days</div>
              <div>Max: {analytics.resolutionTimes[0].maxResolutionTime?.toFixed(1)} days</div>
            </div>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Issue Trends</h3>
        <LineChart width={800} height={300} data={analytics.trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#8884d8" />
        </LineChart>
      </div>
    </div>
  );
}
