'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Monitor, Smartphone, Globe, Clock, Users, Activity } from 'lucide-react';

export default function SessionsPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSessions();
  }, [filter, page]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/admin/sessions?status=${filter}&page=${page}&limit=20`);
      const data = await response.json();
      setSessions(data.sessions || []);
      setStats(data.stats || {});
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setLoading(false);
    }
  };

  const getDeviceIcon = (device) => {
    return device?.isMobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const terminateSession = async (sessionId) => {
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchSessions(); // Refresh the list
      }
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Sessions</h1>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Sessions</option>
            <option value="active">Active Sessions</option>
            <option value="inactive">Inactive Sessions</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSessions || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSessions || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.avgSessionDuration)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Login Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.map((session) => (
              <tr key={session._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {session.userId?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">{session.userId?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getDeviceIcon(session.device)}
                    <div className="ml-2">
                      <div className="text-sm text-gray-900">{session.device?.browser || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{session.device?.os || 'Unknown'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <div className="ml-2">
                      <div className="text-sm text-gray-900">{session.location?.city || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{session.location?.country || 'Unknown'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(session.loginTime), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDuration(session.sessionDuration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    session.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {session.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {session.isActive && (
                    <button
                      onClick={() => terminateSession(session.sessionId)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Terminate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
