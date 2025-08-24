'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

// UI Components
import StatusBadge from '@/components/dashboard/StatusBadge';
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
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import {
    AlertCircle,
    ChevronLeft,
    Edit,
    Mail,
    Phone,
    Tag,
    Trash2,
    User
} from 'lucide-react';

export default function DepartmentDetailPage({ params }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();
  
  // Properly unwrap the params Promise
  const resolvedParams = use(params);
  const departmentId = resolvedParams.id;
  
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    headOfficer: '',
    categories: []
  });

  useEffect(() => {
    const fetchDepartment = async () => {
      if (!departmentId) {
        setError('Invalid department ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/departments/${departmentId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.department) {
          setDepartment(result.department);
          setFormData({
            name: result.department.name || '',
            description: result.department.description || '',
            contactEmail: result.department.contactEmail || '',
            contactPhone: result.department.contactPhone || '',
            headOfficer: result.department.headOfficer?._id || '',
            categories: result.department.categories || []
          });
        } else {
          setError(result.message || 'Department not found');
        }
      } catch (err) {
        console.error('Error fetching department:', err);
        setError(err.message || 'Failed to fetch department details');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [departmentId]);

  useEffect(() => {
    if (activeTab === 'issues' && department) {
      fetchDepartmentIssues();
    }
  }, [activeTab, department, statusFilter]);

  const fetchDepartmentIssues = async () => {
    if (!department?._id) return;

    try {
      setIssuesLoading(true);
      const url = new URL(`/api/departments/${department._id}/issues`, window.location.origin);
      
      if (statusFilter) {
        url.searchParams.append('status', statusFilter);
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setIssues(result.issues);
      } else {
        console.error('Error fetching issues:', result.message);
      }
    } catch (err) {
      console.error('Error fetching department issues:', err);
    } finally {
      setIssuesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session || session.user.role !== 'admin') {
      alert(t('common.notAuthorized'));
      return;
    }
    
    try {
      const response = await fetch(`/api/departments/${department._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDepartment(result.department);
        setIsEditing(false);
      } else {
        alert(result.message || t('departments.updateFailed'));
      }
    } catch (err) {
      console.error('Error updating department:', err);
      alert(err.message || t('common.errorOccurred'));
    }
  };

  const handleDelete = async () => {
    if (!session || session.user.role !== 'admin') {
      alert(t('common.notAuthorized'));
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/departments/${department._id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        router.push('/admin/departments');
      } else {
        alert(result.message || t('departments.deleteFailed'));
        setDeleteDialogOpen(false);
      }
    } catch (err) {
      console.error('Error deleting department:', err);
      alert(err.message || t('common.errorOccurred'));
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-blue-200 animate-spin"></div>
                <p className="text-lg text-gray-500">{t('common.loading')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>
              {error || t('departments.notFound')}
            </AlertDescription>
          </Alert>
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => router.push('/admin/departments')}>
              {t('common.back')} {t('navigation.departments')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = session?.user?.role === 'admin';
  const categoryOptions = ['pothole', 'streetlight', 'garbage', 'water', 'electricity', 'other'];

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button 
              variant="ghost" 
              className="flex items-center mb-2" 
              onClick={() => router.push('/admin/departments')}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t('common.back')}
            </Button>
            <h1 className="text-2xl font-bold">{department.name}</h1>
          </div>

          {canEdit && !isEditing && (
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="flex items-center"
              >
                <Edit className="mr-1 h-4 w-4" />
                {t('common.edit')}
              </Button>
              
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="flex items-center"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    {t('departments.deleteDepartment')}
                  </Button>
                </AlertDialogTrigger>
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
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? t('common.loading') : t('common.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('common.edit')} {department.name}</CardTitle>
              <CardDescription>{t('departments.editDescription')}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    {t('departments.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    {t('departments.description')}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="contactEmail" className="text-sm font-medium">
                      {t('departments.contactEmail')}
                    </label>
                    <input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="contactPhone" className="text-sm font-medium">
                      {t('departments.contactPhone')}
                    </label>
                    <input
                      id="contactPhone"
                      name="contactPhone"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium block mb-2">
                    {t('departments.categories')} <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categoryOptions.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          checked={formData.categories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`category-${category}`} className="text-sm">
                          {t(`issues.categories.${category}`)}
                        </label>
                      </div>
                    ))}
                  </div>
                  {formData.categories.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">
                      {t('departments.selectAtLeastOneCategory')}
                    </p>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit"
                  disabled={formData.categories.length === 0}
                >
                  {t('common.save')}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">{t('departments.details')}</TabsTrigger>
                <TabsTrigger value="issues">{t('issues.relatedIssues')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="pt-4">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">
                          {t('departments.name')}
                        </h3>
                        <p className="text-lg font-semibold">{department.name}</p>
                      </div>

                      <div className="mt-4 md:mt-0">
                        <Badge variant={department.isActive ? "success" : "destructive"}>
                          {department.isActive ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {department.description && (
                      <>
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium text-gray-500">
                            {t('departments.description')}
                          </h3>
                          <p className="text-base">{department.description}</p>
                        </div>
                        <Separator />
                      </>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">
                          {t('departments.contactInfo')}
                        </h3>
                        {department.contactEmail && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <p>{department.contactEmail}</p>
                          </div>
                        )}
                        {department.contactPhone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <p>{department.contactPhone}</p>
                          </div>
                        )}
                        {!department.contactEmail && !department.contactPhone && (
                          <p className="text-gray-400">{t('departments.noContactInfo')}</p>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">
                          {t('departments.headOfficer')}
                        </h3>
                        {department.headOfficer ? (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{department.headOfficer.name}</p>
                              <p className="text-sm text-gray-500">{department.headOfficer.email}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-400">{t('departments.noHeadOfficer')}</p>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500">
                        {t('departments.issueCategories')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {department.categories && department.categories.length > 0 ? (
                          department.categories.map(category => (
                            <Badge key={category} className="flex items-center space-x-1">
                              <Tag className="h-3 w-3 mr-1" />
                              {t(`issues.categories.${category}`)}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-400">{t('departments.noCategories')}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="issues" className="pt-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle>{t('issues.relatedIssues')}</CardTitle>
                        <CardDescription>
                          {t('departments.issuesHandledByDepartment')}
                        </CardDescription>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex items-center space-x-2">
                        <select 
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">{t('issues.allStatuses')}</option>
                          <option value="reported">{t('issues.statuses.reported')}</option>
                          <option value="under-review">{t('issues.statuses.under-review')}</option>
                          <option value="in-progress">{t('issues.statuses.in-progress')}</option>
                          <option value="resolved">{t('issues.statuses.resolved')}</option>
                          <option value="rejected">{t('issues.statuses.rejected')}</option>
                        </select>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={fetchDepartmentIssues}
                        >
                          {t('common.refresh')}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {issuesLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 rounded-full border-4 border-t-blue-500 border-blue-200 animate-spin"></div>
                      </div>
                    ) : issues.length > 0 ? (
                      <div className="space-y-4">
                        {issues.map(issue => (
                          <Card key={issue._id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <StatusBadge status={issue.status} />
                                    <h3 className="font-medium">{issue.title}</h3>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {issue.description}
                                  </p>
                                </div>
                                <div className="mt-4 md:mt-0">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => router.push(`/issues/${issue._id}`)}
                                  >
                                    {t('common.view')}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-lg font-medium text-gray-500">
                          {t('issues.noIssuesFound')}
                        </p>
                        <p className="text-gray-400 mt-1">
                          {statusFilter 
                            ? t('issues.noIssuesWithStatus') 
                            : t('issues.noDepartmentIssues')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
