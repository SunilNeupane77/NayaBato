'use client';

import { AlertCircle, Edit, Eye, FolderIcon, LayoutGrid, List, MoreVertical, Trash, Plus, Users, TrendingUp, Clock, DollarSign, Building } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const departmentCategories = [
  'pothole',
  'streetlight', 
  'garbage',
  'water',
  'electricity',
  'other',
];

export default function DepartmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headOfficer: '',
    contactEmail: '',
    contactPhone: '',
    categories: [],
    budget: { allocated: 0, spent: 0, year: new Date().getFullYear() },
    workingHours: {
      start: '09:00',
      end: '17:00',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    isActive: true,
  });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all-categories');
  const [sortBy, setSortBy] = useState('name');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedDepartments(filteredDepartments.map(d => d._id));
    } else {
      setSelectedDepartments([]);
    }
  };

  const handleSelectDepartment = (departmentId, checked) => {
    if (checked) {
      setSelectedDepartments(prev => [...prev, departmentId]);
    } else {
      setSelectedDepartments(prev => prev.filter(id => id !== departmentId));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedDepartments.length === 0) return;

    try {
      const response = await fetch('/api/departments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, departmentIds: selectedDepartments })
      });

      if (response.ok) {
        const data = await response.json();
        toast({ title: 'Success', description: data.message });
        setSelectedDepartments([]);
        fetchDepartments();
      } else {
        const data = await response.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Bulk operation failed', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/departments');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchDepartments();
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        category: categoryFilter
      });
      
      const response = await fetch(`/api/departments?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (err) {
      console.error('Fetch departments error:', err);
      setError(err.message || 'Failed to load departments');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to load departments'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?role=official');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const categories = [...prev.categories];
      const index = categories.indexOf(category);
      
      if (index > -1) {
        categories.splice(index, 1);
      } else {
        categories.push(category);
      }
      
      return { ...prev, categories };
    });
  };

  const handleWorkingDayToggle = (day) => {
    setFormData(prev => {
      const workingDays = [...prev.workingHours.workingDays];
      const index = workingDays.indexOf(day);
      
      if (index > -1) {
        workingDays.splice(index, 1);
      } else {
        workingDays.push(day);
      }
      
      return {
        ...prev,
        workingHours: { ...prev.workingHours, workingDays }
      };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.categories.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one category',
      });
      return;
    }
    
    try {
      const url = currentDepartment 
        ? `/api/departments/${currentDepartment._id}` 
        : '/api/departments';
      
      const method = currentDepartment ? 'PUT' : 'POST';
      const submitData = {
        ...formData,
        headOfficer: formData.headOfficer === 'no-officer' ? '' : formData.headOfficer
      };
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: currentDepartment ? 'Department updated successfully' : 'Department created successfully'
        });
        setIsDialogOpen(false);
        fetchDepartments();
      } else {
        const data = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to save department'
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save department'
      });
    }
  };

  const handleAddDepartment = () => {
    setCurrentDepartment(null);
    setFormData({
      name: '',
      description: '',
      headOfficer: 'no-officer',
      contactEmail: '',
      contactPhone: '',
      categories: [],
      budget: { allocated: 0, spent: 0, year: new Date().getFullYear() },
      workingHours: {
        start: '09:00',
        end: '17:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditDepartment = (department) => {
    setCurrentDepartment(department);
    setFormData({
      name: department.name || '',
      description: department.description || '',
      headOfficer: department.headOfficer?._id || 'no-officer',
      contactEmail: department.contactEmail || '',
      contactPhone: department.contactPhone || '',
      categories: department.categories || [],
      budget: department.budget || { allocated: 0, spent: 0, year: new Date().getFullYear() },
      workingHours: department.workingHours || {
        start: '09:00',
        end: '17:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      isActive: department.isActive !== undefined ? department.isActive : true,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = (department) => {
    setDepartmentToDelete(department);
    setIsConfirmDialogOpen(true);
  };

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;
    
    try {
      const response = await fetch(`/api/departments/${departmentToDelete._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Department deactivated successfully'
        });
        setIsConfirmDialogOpen(false);
        fetchDepartments();
      } else {
        const data = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to delete department'
        });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete department'
      });
    }
  };

  // Filter and sort departments
  const filteredDepartments = departments
    .filter(department => {
      const matchesSearch = searchQuery === '' || 
        department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (department.description && department.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && department.isActive) || 
        (statusFilter === 'inactive' && !department.isActive);
      
      const matchesCategory = categoryFilter === '' || categoryFilter === 'all-categories' || 
        department.categories.includes(categoryFilter);
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'issues':
          return (b.issueCount || 0) - (a.issueCount || 0);
        case 'resolution':
          return (b.resolutionRate || 0) - (a.resolutionRate || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Management</h1>
          <p className="text-muted-foreground">Manage government departments and their operations</p>
        </div>
        <Button onClick={handleAddDepartment} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Active Departments</p>
                <p className="text-2xl font-bold">{departments.filter(d => d.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Issues</p>
                <p className="text-2xl font-bold">{departments.reduce((sum, d) => sum + (d.issueCount || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Avg Resolution</p>
                <p className="text-2xl font-bold">
                  {departments.length > 0 
                    ? (departments.reduce((sum, d) => sum + (parseFloat(d.resolutionRate) || 0), 0) / departments.length).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Bulk Actions */}
      {selectedDepartments.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedDepartments.length} department(s) selected
              </span>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleBulkAction('activate')}>
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                  Deactivate
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                  Delete
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedDepartments([])}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <Input
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              {departmentCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="issues">Issue Count</SelectItem>
              <SelectItem value="resolution">Resolution Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'} 
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="animate-pulse bg-gray-100 dark:bg-gray-800 h-20" />
              <CardContent className="mt-4">
                <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-4 mb-2" />
                <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-4 w-2/3 mb-4" />
                <div className="flex justify-between">
                  <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-6 w-16 rounded-full" />
                  <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-6 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Empty State */}
      {!loading && !error && filteredDepartments.length === 0 && (
        <Card className="bg-gray-50 dark:bg-gray-900 border-dashed">
          <CardContent className="pt-6 text-center">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || statusFilter !== 'all' || categoryFilter
                ? 'Try adjusting your filters'
                : 'Get started by creating your first department'}
            </p>
            <div className="mt-6">
              <Button onClick={handleAddDepartment}>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Content - Grid View */}
      {!loading && !error && viewMode === 'grid' && filteredDepartments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedDepartments.length === filteredDepartments.length}
              onCheckedChange={handleSelectAll}
            />
            <Label>Select All</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((department) => (
              <Card key={department._id} className={`overflow-hidden transition-all hover:shadow-lg ${!department.isActive && 'bg-gray-50 dark:bg-gray-900 opacity-80'}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3 flex-1">
                      <Checkbox
                        checked={selectedDepartments.includes(department._id)}
                        onCheckedChange={(checked) => handleSelectDepartment(department._id, checked)}
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{department.name}</CardTitle>
                        {department.description && (
                          <CardDescription className="mt-1 line-clamp-2">
                            {department.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/departments/${department._id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/departments/${department._id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteConfirm(department)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
              
              <CardContent className="pt-0">
                {/* Categories */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {department.categories.slice(0, 3).map(category => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Badge>
                  ))}
                  {department.categories.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{department.categories.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{department.issueCount || 0}</div>
                    <div className="text-xs text-gray-500">Total Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{department.resolutionRate || 0}%</div>
                    <div className="text-xs text-gray-500">Resolution Rate</div>
                  </div>
                </div>

                {/* Head Officer */}
                {department.headOfficer && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Users className="h-4 w-4 mr-2" />
                    {department.headOfficer.name}
                  </div>
                )}

                {/* Budget Info */}
                {department.budget && department.budget.allocated > 0 && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${department.budget.allocated.toLocaleString()} allocated
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="border-t bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                <Badge variant={department.isActive ? "default" : "outline"}>
                  {department.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/admin/departments/${department._id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
          </div>
        </div>
      )}
      
      {/* Create/Edit Department Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentDepartment ? 'Update Department' : 'Create New Department'}
            </DialogTitle>
            <DialogDescription>
              {currentDepartment ? 'Update department information and settings' : 'Add a new department to manage civic issues'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="operations">Operations</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Department Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Public Works Department"
                    />
                  </div>
                  <div>
                    <Label htmlFor="headOfficer">Head Officer</Label>
                    <Select
                      value={formData.headOfficer}
                      onValueChange={(value) => setFormData({...formData, headOfficer: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select head officer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-officer">No officer assigned</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Brief description of department responsibilities..."
                  />
                </div>
                
                <div>
                  <Label>Issue Categories *</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {departmentCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category}`}
                          checked={formData.categories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <label htmlFor={`category-${category}`} className="text-sm font-medium">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">
                    {formData.isActive ? 'Active Department' : 'Inactive Department'}
                  </Label>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="department@city.gov"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="operations" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workingHours.start">Start Time</Label>
                    <Input
                      id="workingHours.start"
                      name="workingHours.start"
                      type="time"
                      value={formData.workingHours.start}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="workingHours.end">End Time</Label>
                    <Input
                      id="workingHours.end"
                      name="workingHours.end"
                      type="time"
                      value={formData.workingHours.end}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Working Days</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`day-${day}`}
                          checked={formData.workingHours.workingDays.includes(day)}
                          onCheckedChange={() => handleWorkingDayToggle(day)}
                        />
                        <label htmlFor={`day-${day}`} className="text-sm">
                          {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="budget" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="budget.allocated">Allocated Budget ($)</Label>
                    <Input
                      id="budget.allocated"
                      name="budget.allocated"
                      type="number"
                      value={formData.budget.allocated}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget.spent">Spent Budget ($)</Label>
                    <Input
                      id="budget.spent"
                      name="budget.spent"
                      type="number"
                      value={formData.budget.spent}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget.year">Budget Year</Label>
                    <Input
                      id="budget.year"
                      name="budget.year"
                      type="number"
                      value={formData.budget.year}
                      onChange={handleInputChange}
                      placeholder={new Date().getFullYear()}
                    />
                  </div>
                </div>
                
                {formData.budget.allocated > 0 && (
                  <div className="mt-4">
                    <Label>Budget Utilization</Label>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min((formData.budget.spent / formData.budget.allocated) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {((formData.budget.spent / formData.budget.allocated) * 100).toFixed(1)}% utilized
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {currentDepartment ? 'Update Department' : 'Create Department'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate "{departmentToDelete?.name}"? This will make the department inactive but preserve all data. You can reactivate it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteDepartment}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}