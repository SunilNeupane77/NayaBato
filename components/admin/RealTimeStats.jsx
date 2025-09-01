'use client';

import { useState, useEffect } from 'react';
import { Users, Activity, Monitor, TrendingUp } from 'lucide-react';

export default function RealTimeStats() {
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalSessions: 0,
    recentActivities: 0,
    onlineNow: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sessionsRes, activitiesRes] = await Promise.all([
          fetch('/api/admin/sessions?status=active&limit=1'),
          fetch('/api/admin/activities?limit=1')
        ]);

        const sessionsData = await sessionsRes.json();
        const activitiesData = await activitiesRes.json();

        setStats({
          activeUsers: sessionsData.stats?.activeSessions || 0,
          totalSessions: sessionsData.stats?.totalSessions || 0,
          recentActivities: activitiesData.pagination?.total || 0,
          onlineNow: sessionsData.stats?.activeSessions || 0
        });
      } catch (error) {
        console.error('Error fetching real-time stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Online Now</p>
            <p className="text-2xl font-bold text-gray-900">{stats.onlineNow}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Monitor className="h-8 w-8 text-green-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Sessions</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Activity className="h-8 w-8 text-purple-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Activities</p>
            <p className="text-2xl font-bold text-gray-900">{stats.recentActivities}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-orange-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Active Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
