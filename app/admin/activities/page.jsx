'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Activity, Eye, Edit, MessageSquare, Vote, Search, Settings } from 'lucide-react';

export default function ActivitiesPage() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [page, setPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);

  const fetchUserAnalytics = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/analytics`);
      const data = await response.json();
      setUserAnalytics(data);
      setSelectedUser(userId);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [filters, page]);

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });
      
      const response = await fetch(`/api/admin/activities?${params}`);
      const data = await response.json();
      setActivities(data.activities || []);
      setStats(data.stats || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      login: <Activity className="h-4 w-4 text-green-500" />,
      logout: <Activity className="h-4 w-4 text-red-500" />,
      page_view: <Eye className="h-4 w-4 text-blue-500" />,
      issue_created: <Edit className="h-4 w-4 text-purple-500" />,
      issue_updated: <Edit className="h-4 w-4 text-orange-500" />,
      issue_voted: <Vote className="h-4 w-4 text-yellow-500" />,
      comment_added: <MessageSquare className="h-4 w-4 text-indigo-500" />,
      search_performed: <Search className="h-4 w-4 text-gray-500" />,
      settings_changed: <Settings className="h-4 w-4 text-red-400" />
    };
    return icons[action] || <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getActionLabel = (action) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading activities...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Activities</h1>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.slice(0, 4).map((stat) => (
          <div key={stat._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              {getActionIcon(stat._id)}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{getActionLabel(stat._id)}</p>
                <p className="text-xl font-bold text-gray-900">{stat.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Actions</option>
              {stats.map((stat) => (
                <option key={stat._id} value={stat._id}>
                  {getActionLabel(stat._id)} ({stat.count})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ action: '', userId: '', dateFrom: '', dateTo: '' })}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Page
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <button
                        onClick={() => fetchUserAnalytics(activity.userId._id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900"
                      >
                        {activity.userId?.name || 'Unknown'}
                      </button>
                      <div className="text-sm text-gray-500">{activity.userId?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getActionIcon(activity.action)}
                    <span className="ml-2 text-sm text-gray-900">
                      {getActionLabel(activity.action)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {activity.resource?.type || '-'}
                  {activity.resource?.resourceId && (
                    <div className="text-xs text-gray-500">ID: {activity.resource.resourceId}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {activity.page || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(activity.createdAt), 'MMM dd, HH:mm:ss')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activity.ipAddress || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Analytics Modal */}
      {userAnalytics && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">User Analytics - {userAnalytics.user.name}</h3>
              <button
                onClick={() => setUserAnalytics(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Session Statistics</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p>Total Sessions: {userAnalytics.sessionStats.totalSessions || 0}</p>
                  <p>Avg Duration: {Math.round(userAnalytics.sessionStats.avgDuration || 0)} min</p>
                  <p>Last Login: {userAnalytics.sessionStats.lastLogin ? 
                    format(new Date(userAnalytics.sessionStats.lastLogin), 'MMM dd, yyyy HH:mm') : 'Never'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Activity Summary</h4>
                <div className="bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                  {userAnalytics.activitySummary.map((activity) => (
                    <div key={activity._id} className="flex justify-between">
                      <span className="capitalize">{activity._id.replace('_', ' ')}</span>
                      <span>{activity.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Recent Activities</h4>
              <div className="max-h-40 overflow-y-auto">
                {userAnalytics.activities.slice(0, 10).map((activity) => (
                  <div key={activity._id} className="flex justify-between text-sm py-1">
                    <span>{activity.action.replace('_', ' ')}</span>
                    <span>{format(new Date(activity.createdAt), 'MMM dd, HH:mm')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
