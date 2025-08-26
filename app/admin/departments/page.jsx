'use client';

import { AlertCircle, Edit, Eye, FolderIcon, LayoutGrid, List, MoreVertical, Trash } from 'lucide-react';
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

import { useApiWithToast } from '@/lib/hooks/useApiWithToast';
import { useLanguage } from '@/lib/i18n/language-context';

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
  const { t } = useLanguage();
  const api = useApiWithToast();

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
    isActive: true,
  });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [departmentStats, setDepartmentStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(false);

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
      const data = await api.get('/api/departments', {
        errorTitle: t('common.error'),
        errorMessage: t('departments.fetchError') || 'Failed to load departments',
        onError: (err) => setError(err.message || 'Failed to load departments')
      });
      
      if (data.departments) {
        setDepartments(data.departments);
        
        // Fetch stats for each department
        await fetchDepartmentStats(data.departments);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentStats = async (departmentsList) => {
    try {
      setStatsLoading(true);
      const stats = {};
      
      for (const dept of departmentsList) {
        try {
          const data = await api.get(`/api/departments/${dept._id}/stats`, {
            // Silent error - we don't want to show toast for each department stats error
            onError: () => {} // Suppress toast notifications
          });
          
          if (data && data.success) {
            stats[dept._id] = data.stats;
          }
        } catch (err) {
          // Just log the error, no need to display it to the user
          console.error(`Error fetching stats for ${dept.name}:`, err);
        }
      }
      
      setDepartmentStats(stats);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.get('/api/users?role=official', {
        errorTitle: t('common.error'),
        errorMessage: t('users.fetchError') || 'Failed to load users'
      });
      
      setUsers(data.users || []);
    } catch (err) {
      // Error is already handled by the useApiWithToast hook
      console.error('Error fetching users:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
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
      
      return {
        ...prev,
        categories
      };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.categories.length === 0) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('departments.selectAtLeastOneCategory'),
      });
      return;
    }
    
    try {
      const url = currentDepartment 
        ? `/api/departments/${currentDepartment._id}` 
        : '/api/departments';
      
      // Use our API hook for consistent error handling
      if (currentDepartment) {
        await api.put(url, formData, {
          successTitle: t('common.success'),
          successMessage: t('departments.updateSuccess'),
          errorTitle: t('common.error'),
          errorMessage: t('departments.updateFailed'),
          onSuccess: () => {
            setIsDialogOpen(false);
            fetchDepartments();
          }
        });
      } else {
        await api.post(url, formData, {
          successTitle: t('common.success'),
          successMessage: t('departments.creationSuccess'),
          errorTitle: t('common.error'),
          errorMessage: t('departments.creationError'),
          onSuccess: () => {
            setIsDialogOpen(false);
            fetchDepartments();
          }
        });
      }
    } catch (err) {
      // Error is already handled by useApiWithToast
      console.error('Error saving department:', err);
    }
  };

  const handleAddDepartment = () => {
    setCurrentDepartment(null);
    setFormData({
      name: '',
      description: '',
      headOfficer: '',
      contactEmail: '',
      contactPhone: '',
      categories: [],
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditDepartment = (department) => {
    setCurrentDepartment(department);
    setFormData({
      name: department.name || '',
      description: department.description || '',
      headOfficer: department.headOfficer?._id || '',
      contactEmail: department.contactEmail || '',
      contactPhone: department.contactPhone || '',
      categories: department.categories || [],
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
      await api.del(`/api/departments/${departmentToDelete._id}`, {
        successTitle: t('common.success'),
        successMessage: t('departments.deleteSuccess') || 'Department deactivated successfully',
        errorTitle: t('common.error'),
        errorMessage: t('departments.deleteFailed'),
        onSuccess: () => {
          setIsConfirmDialogOpen(false);
          fetchDepartments();
        }
      });
    } catch (err) {
      // Error is already handled by useApiWithToast
      console.error('Error deleting department:', err);
    }
  };
  
  // Filter departments based on search and status
  const filteredDepartments = departments.filter(department => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (department.description && department.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && department.isActive) || 
      (statusFilter === 'inactive' && !department.isActive);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('departments.departmentsList')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.departmentManagement')}
          </p>
        </div>
        <Button onClick={handleAddDepartment}>
          {t('departments.createDepartment')}
        </Button>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="flex-1">
          <Input
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select 
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="active">{t('common.active')}</SelectItem>
              <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button 
              variant={viewMode === 'table' ? 'default' : 'outline'} 
              size="icon"
              onClick={() => setViewMode('table')}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="animate-pulse bg-gray-100 h-12" />
              <CardContent className="mt-4">
                <div className="animate-pulse bg-gray-100 h-4 mb-2" />
                <div className="animate-pulse bg-gray-100 h-4 w-2/3" />
                <div className="mt-4 flex items-center justify-between">
                  <div className="animate-pulse bg-gray-100 h-8 w-20 rounded-full" />
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
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Empty State */}
      {!loading && !error && filteredDepartments.length === 0 && (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="pt-6 text-center">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('departments.noDepartmentsFound')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? t('common.tryAdjustingFilters')
                : t('departments.createDepartmentPrompt')}
            </p>
            <div className="mt-6">
              <Button onClick={handleAddDepartment}>
                {t('departments.createDepartment')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Content - Grid View */}
      {!loading && !error && viewMode === 'grid' && filteredDepartments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((department) => (
            <Card key={department._id} className={`overflow-hidden ${!department.isActive && 'bg-gray-50 opacity-80'}`}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="truncate">{department.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/admin/departments/${department._id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t('common.view')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditDepartment(department)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteConfirm(department)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardTitle>
                {department.description && (
                  <CardDescription className="truncate">
                    {department.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-4">
                  {department.categories.map(category => (
                    <Badge key={category} variant="secondary">
                      {t(`issues.categories.${category}`) || category}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge variant={department.isActive ? "default" : "outline"}>
                    {department.isActive ? t('common.active') : t('common.inactive')}
                  </Badge>
                  
                  {departmentStats[department._id] && (
                    <div className="text-sm">
                      <span className="font-medium">{departmentStats[department._id].total || 0}</span> 
                      <span className="text-gray-500"> {t('issues.issuesFound')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/admin/departments/${department._id}`)}
                >
                  {t('departments.details')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create/Edit Department Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {currentDepartment 
                ? t('departments.updateDepartment')
                : t('departments.createDepartment')}
            </DialogTitle>
            <DialogDescription>
              {t('departments.editDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t('departments.name')}
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  {t('departments.description')}
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="headOfficer" className="text-right">
                  {t('departments.headOfficer')}
                </Label>
                <Select
                  name="headOfficer"
                  value={formData.headOfficer}
                  onValueChange={(value) => setFormData({...formData, headOfficer: value})}
                >
                  <SelectTrigger id="headOfficer" className="col-span-3">
                    <SelectValue placeholder={t('departments.selectAnOfficer')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('departments.selectAnOfficer')}</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contactEmail" className="text-right">
                  {t('departments.contactEmail')}
                </Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contactPhone" className="text-right">
                  {t('departments.contactPhone')}
                </Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-right pt-0">
                  {t('departments.categories')}
                </Label>
                <div className="col-span-3 grid grid-cols-2 gap-2">
                  {departmentCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${category}`}
                        checked={formData.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {t(`issues.categories.${category}`) || category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  {t('common.status')}
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">
                    {formData.isActive ? t('common.active') : t('common.inactive')}
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {currentDepartment ? t('common.save') : t('departments.createDepartment')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('departments.deleteDepartment')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('departments.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteDepartment}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}