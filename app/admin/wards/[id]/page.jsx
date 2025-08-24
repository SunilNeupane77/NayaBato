'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/lib/i18n/language-context';
import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WardDetailPage({ params }) {
  // Use React.use to unwrap params
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const router = useRouter();
  const { t, locale } = useLanguage();
  
  // Define all state variables at the top level
  const [ward, setWard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    address: '',
    latitude: '',
    longitude: '',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchWard = async () => {
      if (!id) {
        setError('Invalid ward ID');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`/api/wards/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.ward) {
          setWard(result.ward);
          // Initialize form data with ward data
          setFormData({
            name: result.ward.name || '',
            number: result.ward.number || '',
            address: result.ward.location?.address || '',
            latitude: result.ward.location?.coordinates?.coordinates[1] || '',
            longitude: result.ward.location?.coordinates?.coordinates[0] || '',
            description: result.ward.description || ''
          });
        } else {
          setError(result.message || 'Ward not found');
        }
      } catch (err) {
        console.error('Error fetching ward:', err);
        setError(err.message || 'Failed to fetch ward details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWard();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    if (ward) {
      setFormData({
        name: ward.name,
        number: ward.number,
        address: ward.location?.address || '',
        latitude: ward.location?.coordinates?.coordinates[1] || '',
        longitude: ward.location?.coordinates?.coordinates[0] || '',
        description: ward.description || ''
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`/api/wards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          number: parseInt(formData.number),
          location: {
            address: formData.address,
            coordinates: {
              type: "Point",
              coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
            }
          },
          description: formData.description
        }),
      });

      const result = await response.json();

      if (result.success) {
        setWard(result.ward);
        setIsEditing(false);
      } else {
        setSaveError(result.message || 'Failed to update ward');
      }
    } catch (err) {
      console.error('Error updating ward:', err);
      setSaveError(err.message || 'An error occurred while updating');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/wards/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/wards');
      } else {
        setError(result.message || t('wards.deleteFailed'));
        setDeleteDialogOpen(false);
      }
    } catch (err) {
      console.error('Error deleting ward:', err);
      setError(err.message || t('wards.deleteFailed'));
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border border-gray-200">
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
  
  if (error || !ward) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <Alert variant="destructive">
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>
              {error || t('wards.notFound')}
            </AlertDescription>
          </Alert>
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => router.push('/admin/wards')}>
              {t('common.back')} {t('navigation.wards')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('wards.wardDetails')}</h1>
            <p className="text-gray-500">{t('wards.wardNumber')} #{ward.number}</p>
          </div>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/wards')}
            >
              {t('common.back')}
            </Button>
          </div>
        </div>

        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('common.edit')} {ward.name}</CardTitle>
              <CardDescription>{t('wards.wardAddDescription')}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {saveError && (
                  <Alert variant="destructive">
                    <AlertDescription>{saveError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      {t('wards.wardName')} <span className="text-red-500">*</span>
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
                    <label htmlFor="number" className="text-sm font-medium">
                      {t('wards.wardNumber')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="number"
                      name="number"
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.number}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    {t('wards.address')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="latitude" className="text-sm font-medium">
                      {t('wards.latitude')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="latitude"
                      name="latitude"
                      type="number"
                      required
                      step="any"
                      min="-90"
                      max="90"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.latitude}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="longitude" className="text-sm font-medium">
                      {t('wards.longitude')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="longitude"
                      name="longitude"
                      type="number"
                      required
                      step="any"
                      min="-180"
                      max="180"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.longitude}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    {t('wards.description')}
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
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? t('common.loading') : t('common.save')}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">{t('wards.details')}</TabsTrigger>
                <TabsTrigger value="issues">{t('issues.relatedIssues')}</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-2xl font-bold">{ward.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" /> {ward.location?.address}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-sm px-3 py-1 font-medium">
                        {t('wards.wardNumber')} #{ward.number}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          {t('wards.coordinates')}
                        </h3>
                        <p className="text-lg font-medium">
                          {ward.location?.coordinates?.coordinates[1].toFixed(6)}, {ward.location?.coordinates?.coordinates[0].toFixed(6)}
                        </p>
                      </div>
                      
                      {ward.officerInCharge && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            {t('wards.officerInCharge')}
                          </h3>
                          <p className="text-lg font-medium">{ward.officerInCharge.name}</p>
                          <p className="text-sm text-gray-500">{ward.officerInCharge.email}</p>
                        </div>
                      )}
                    </div>
                    
                    {ward.description && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          {t('wards.description')}
                        </h3>
                        <p className="text-base whitespace-pre-line">{ward.description}</p>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex justify-end space-x-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleEdit}
                    >
                      {t('common.edit')}
                    </Button>
                    
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          {t('wards.deleteWard')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('wards.deleteWard')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('wards.deleteConfirm')}
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
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="issues" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('issues.relatedIssues')}</CardTitle>
                    <CardDescription>
                      {t('issues.viewIssuesInThisWard')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center py-8">
                      <Button 
                        variant="default" 
                        size="lg"
                        onClick={() => router.push(`/issues?ward=${id}`)}
                      >
                        {t('issues.viewIssues')}
                      </Button>
                    </div>
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
