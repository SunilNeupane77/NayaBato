'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Edit, Users, DollarSign, Clock, TrendingUp, MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import StaffManagement from '@/components/admin/StaffManagement';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DepartmentDetailsPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [department, setDepartment] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchDepartmentDetails();
    }
  }, [session, resolvedParams.id]);

  const fetchDepartmentDetails = async () => {
    try {
      const response = await fetch(`/api/departments/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setDepartment(data.department);
        setStats(data.stats);
        setRecentIssues(data.recentIssues || []);
      }
    } catch (error) {
      console.error('Failed to fetch department details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading department details...</div>;
  }

  if (!department) {
    return <div className="p-6">Department not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{department.name}</h1>
            <p className="text-gray-600">{department.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={department.isActive ? "default" : "outline"}>
            {department.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Button onClick={() => router.push(`/admin/departments/${resolvedParams.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Issues</p>
                <p className="text-2xl font-bold">{stats?.totalIssues || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold">{stats?.resolutionRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Staff Members</p>
                <p className="text-2xl font-bold">{department.staff?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Budget Allocated</p>
                <p className="text-2xl font-bold">${(department.budget?.allocated || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="issues">Recent Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Info */}
            <Card>
              <CardHeader>
                <CardTitle>Department Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Categories</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {department.categories.map(category => (
                      <Badge key={category} variant="secondary">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {department.headOfficer && (
                  <div>
                    <h4 className="font-medium">Head Officer</h4>
                    <p className="text-gray-600">{department.headOfficer.name}</p>
                    <p className="text-sm text-gray-500">{department.headOfficer.email}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium">Contact Information</h4>
                  {department.contactEmail && (
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Mail className="h-4 w-4 mr-2" />
                      {department.contactEmail}
                    </div>
                  )}
                  {department.contactPhone && (
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Phone className="h-4 w-4 mr-2" />
                      {department.contactPhone}
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium">Working Hours</h4>
                  <p className="text-gray-600">
                    {department.workingHours?.start} - {department.workingHours?.end}
                  </p>
                  <p className="text-sm text-gray-500">
                    {department.workingHours?.workingDays?.join(', ')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Issue Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.resolvedIssues}</div>
                        <div className="text-sm text-gray-500">Resolved</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.inProgressIssues}</div>
                        <div className="text-sm text-gray-500">In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pendingIssues}</div>
                        <div className="text-sm text-gray-500">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{stats.totalIssues}</div>
                        <div className="text-sm text-gray-500">Total</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
            </CardHeader>
            <CardContent>
              {department.staff && department.staff.length > 0 ? (
                <div className="space-y-4">
                  {department.staff.map((staff, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{staff.user.name}</h4>
                        <p className="text-sm text-gray-600">{staff.position}</p>
                        <p className="text-sm text-gray-500">{staff.user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {staff.assignedWards?.length || 0} wards assigned
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No staff members assigned</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <StaffManagement departmentId={resolvedParams.id} />
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {department.budget ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ${department.budget.allocated.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Allocated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        ${department.budget.spent.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${(department.budget.allocated - department.budget.spent).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Remaining</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Budget Utilization</span>
                      <span>{((department.budget.spent / department.budget.allocated) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min((department.budget.spent / department.budget.allocated) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No budget information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {recentIssues.length > 0 ? (
                <div className="space-y-4">
                  {recentIssues.map((issue) => (
                    <div key={issue._id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{issue.title}</h4>
                        <p className="text-sm text-gray-600">
                          Reported by {issue.reporter.name}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {issue.assignedWard?.name || 'Unassigned'}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          issue.status === 'resolved' ? 'default' : 
                          issue.status === 'in-progress' ? 'secondary' : 
                          'outline'
                        }>
                          {issue.status}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent issues</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
