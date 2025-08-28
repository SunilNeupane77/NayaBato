'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Building, Users, DollarSign, Clock } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DepartmentDashboard() {
  const [departmentData, setDepartmentData] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    try {
      const response = await fetch('/api/departments/dashboard');
      const data = await response.json();
      setDepartmentData(data.departments || []);
      if (data.departments?.length > 0) {
        setSelectedDept(data.departments[0]);
      }
    } catch (error) {
      console.error('Failed to fetch department data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading department dashboard...</div>;
  if (departmentData.length === 0) return <div className="p-6">No departments found</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Department Dashboard</h2>
        <select 
          value={selectedDept?.department._id || ''} 
          onChange={(e) => setSelectedDept(departmentData.find(d => d.department._id === e.target.value))}
          className="px-3 py-2 border rounded-md"
        >
          {departmentData.map(({ department }) => (
            <option key={department._id} value={department._id}>
              {department.name}
            </option>
          ))}
        </select>
      </div>

      {selectedDept && (
        <>
          {/* Department Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Total Issues</p>
                  <p className="text-xl font-semibold">{selectedDept.performanceMetrics.totalIssues}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Staff Count</p>
                  <p className="text-xl font-semibold">{selectedDept.department.staff.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Budget Used</p>
                  <p className="text-xl font-semibold">{selectedDept.performanceMetrics.budgetUtilization}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Avg Resolution</p>
                  <p className="text-xl font-semibold">{selectedDept.performanceMetrics.avgResolutionTime} days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Issue Status Distribution */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Issue Status Distribution</h3>
              <PieChart width={350} height={250}>
                <Pie
                  data={selectedDept.issueStats}
                  cx={175}
                  cy={125}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="_id"
                >
                  {selectedDept.issueStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>

            {/* Ward Distribution */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Issues by Ward</h3>
              <BarChart width={350} height={250} data={selectedDept.wardDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id.wardNumber" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </div>
          </div>

          {/* Department Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Department Staff</h3>
              </div>
              <div className="p-4">
                {selectedDept.department.staff.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDept.department.staff.map((staff, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <h4 className="font-medium">{staff.user.name}</h4>
                          <p className="text-sm text-gray-600">{staff.position}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {staff.assignedWards?.length || 0} wards
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No staff assigned</p>
                )}
              </div>
            </div>

            {/* Budget Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Budget Overview</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Allocated:</span>
                  <span className="font-semibold">${selectedDept.department.budget.allocated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Spent:</span>
                  <span className="font-semibold">${selectedDept.department.budget.spent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-semibold text-green-600">
                    ${(selectedDept.department.budget.allocated - selectedDept.department.budget.spent).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(selectedDept.performanceMetrics.budgetUtilization, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Areas */}
          {selectedDept.department.serviceAreas.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Service Areas</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedDept.department.serviceAreas.map((ward) => (
                    <div key={ward._id} className="flex items-center p-2 bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium">Ward {ward.number}</p>
                        <p className="text-sm text-gray-600">{ward.name}</p>
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
