'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { MapPin, Users, Calendar, TrendingUp } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function WardDashboard() {
  const [wardData, setWardData] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWardData();
  }, []);

  const fetchWardData = async () => {
    try {
      const response = await fetch('/api/wards/dashboard');
      const data = await response.json();
      setWardData(data.wards || []);
      if (data.wards?.length > 0) {
        setSelectedWard(data.wards[0]);
      }
    } catch (error) {
      console.error('Failed to fetch ward data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading ward dashboard...</div>;
  if (wardData.length === 0) return <div className="p-6">No wards assigned</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ward Dashboard</h2>
        <select 
          value={selectedWard?.ward._id || ''} 
          onChange={(e) => setSelectedWard(wardData.find(w => w.ward._id === e.target.value))}
          className="px-3 py-2 border rounded-md"
        >
          {wardData.map(({ ward }) => (
            <option key={ward._id} value={ward._id}>
              Ward {ward.number} - {ward.name}
            </option>
          ))}
        </select>
      </div>

      {selectedWard && (
        <>
          {/* Ward Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Population</p>
                  <p className="text-xl font-semibold">{selectedWard.ward.population.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="text-xl font-semibold">{selectedWard.ward.area} km²</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Total Issues</p>
                  <p className="text-xl font-semibold">{selectedWard.performanceMetrics.totalIssues}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Resolution Rate</p>
                  <p className="text-xl font-semibold">{selectedWard.performanceMetrics.resolutionRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Issue Status Distribution */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Issue Status Distribution</h3>
              <PieChart width={350} height={250}>
                <Pie
                  data={selectedWard.issueStats.statusStats}
                  cx={175}
                  cy={125}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="_id"
                >
                  {selectedWard.issueStats.statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Issues by Category</h3>
              <BarChart width={350} height={250} data={selectedWard.issueStats.categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </div>
          </div>

          {/* Recent Issues */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Recent Issues</h3>
            </div>
            <div className="p-4">
              {selectedWard.recentIssues.length > 0 ? (
                <div className="space-y-3">
                  {selectedWard.recentIssues.map((issue) => (
                    <div key={issue._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded">
                      <div>
                        <h4 className="font-medium">{issue.title}</h4>
                        <p className="text-sm text-gray-600">
                          {issue.category} • Reported by {issue.reporter.name}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        issue.status === 'under-review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-800'
                      }`}>
                        {issue.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent issues</p>
              )}
            </div>
          </div>

          {/* Ward Facilities */}
          {selectedWard.ward.facilities.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Ward Facilities</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedWard.ward.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium">{facility.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{facility.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
