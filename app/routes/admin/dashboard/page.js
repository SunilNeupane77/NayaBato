'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
    'rejected': 'Rejected',
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
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && !['admin', 'official'].includes(session?.user?.role)) {
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

    if (status === 'authenticated' && ['admin', 'official'].includes(session?.user?.role)) {
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
        <div className="text-red-500 text-lg mb-4">
          Error: {error}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No stats yet
  if (!stats) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium mb-2">Total Issues</h2>
          <p className="text-3xl font-bold">{stats.totalIssues || 0}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium mb-2">Resolved Issues</h2>
          <p className="text-3xl font-bold">
            {stats.statusData.find(s => s.status === 'resolved')?.count || 0}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium mb-2">Avg. Resolution Time</h2>
          <p className="text-3xl font-bold">
            {stats.avgResolutionDays ? `${stats.avgResolutionDays} days` : 'N/A'}
          </p>
        </div>
      </div>
      
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium mb-4">Issues by Status</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.statusData.map(item => ({
                  status: formatStatus(item.status),
                  count: item.count
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" angle={-45} textAnchor="end" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Issues" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Category chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium mb-4">Issues by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData.map(item => ({
                    name: formatCategory(item.category),
                    value: item.count
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent issues */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium mb-4">Recent Issues</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Reported By</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.recentIssues.map((issue) => (
                <tr key={issue._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {issue._id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {issue.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatCategory(issue.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={cn(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      {
                        'bg-orange-100 text-orange-800': issue.status === 'reported',
                        'bg-blue-100 text-blue-800': issue.status === 'under-review',
                        'bg-yellow-100 text-yellow-800': issue.status === 'in-progress',
                        'bg-green-100 text-green-800': issue.status === 'resolved',
                        'bg-red-100 text-red-800': issue.status === 'rejected',
                      }
                    )}>
                      {formatStatus(issue.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {issue.reporter?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                    <a href={`/issues/${issue._id}`}>View Details</a>
                  </td>
                </tr>
              ))}
              
              {stats.recentIssues.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No recent issues found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
