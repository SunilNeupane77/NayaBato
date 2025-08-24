'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Map, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useFetchData } from '@/lib/hooks/useQuery';
import { useLanguage } from '@/lib/i18n/language-context';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Form schema for ward creation
const createWardSchema = (t) => z.object({
  name: z.string().min(2, { message: t('wards.validation.nameRequired') }),
  number: z.coerce.number().min(1, { message: t('wards.validation.numberMin') }),
  address: z.string().min(5, { message: t('wards.validation.addressRequired') }),
  latitude: z.coerce.number().min(-90).max(90, { 
    message: t('wards.validation.latitudeRange') 
  }),
  longitude: z.coerce.number().min(-180).max(180, { 
    message: t('wards.validation.longitudeRange') 
  }),
  officerInCharge: z.string().optional(),
  description: z.string().optional(),
});

export default function WardsPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [wardToDelete, setWardToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch wards data
  const { data: wardsData, isLoading, error, refetch: mutate } = useFetchData('wards', '/api/wards');
  // Ensure wards is always an array
  const wards = Array.isArray(wardsData?.wards) ? wardsData?.wards : (Array.isArray(wardsData) ? wardsData : []);

  // Fetch users for officer selection
  const { data: usersRaw } = useFetchData('/api/users?role=official');
  const users = Array.isArray(usersRaw) ? usersRaw : [];

  // Create schema with translations
  const wardSchema = createWardSchema(t);
  
  // Form definition
  const form = useForm({
    resolver: zodResolver(wardSchema),
    defaultValues: {
      name: '',
      number: '',
      address: '',
      latitude: '',
      longitude: '',
      officerInCharge: '',
      description: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/wards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          number: parseInt(data.number),
          location: {
            address: data.address,
            coordinates: {
              type: 'Point',
              coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)],
            },
          },
          officerInCharge: data.officerInCharge || undefined,
          description: data.description || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: t('common.success'),
          description: t('wards.wardCreatedSuccess'),
        });
        setIsDialogOpen(false);
        form.reset();
        mutate(); // Refresh the wards list
        // Redirect to the new ward details page if ward._id exists
        if (result.ward && result.ward._id) {
          window.location.href = `/admin/wards/${result.ward._id}`;
        }
      } else if (result.message && result.message.includes('already exists')) {
        toast({
          variant: 'destructive',
          title: t('wards.duplicateWardNumber'),
          description: t('wards.duplicateWardNumber'),
        });
      } else {
        throw new Error(result.message || 'Failed to create ward');
      }
    } catch (error) {        
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('wards.wardCreationError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare for ward deletion
  const openDeleteDialog = (ward) => {
    setWardToDelete(ward);
    setIsDeleteDialogOpen(true);
  };

  // Handle ward deletion
  const handleDeleteWard = async () => {
    if (!wardToDelete) return;
    
    try {
      const response = await fetch(`/api/wards/${wardToDelete._id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: t('common.success'),
          description: t('wards.wardDeletedSuccess'),
        });
        mutate(); // Refresh the wards list
      } else {
        throw new Error(result.message || t('wards.deleteFailed'));
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('wards.deleteFailed'),
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setWardToDelete(null);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('wards.wardManagement')}</h1>
          <p className="text-gray-500 mt-1">
            {wards.length} {wards.length === 1 ? 'ward' : 'wards'} {t('common.found')}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> {t('wards.addNewWard')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{t('wards.createNewWard')}</DialogTitle>
              <DialogDescription>
                {t('wards.wardAddDescription')}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('wards.wardName')}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., East City Ward" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('wards.wardNumber')}</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('wards.address')}</FormLabel>
                      <FormControl>
                        <Input placeholder="Ward office address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('wards.latitude')}</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('wards.longitude')}</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {users.length > 0 && (
                  <FormField
                    control={form.control}
                    name="officerInCharge"
                    render={({ field }) => (
                      <FormItem>                      
                        <FormLabel>{t('wards.officerInCharge')} (Optional)</FormLabel>
                        <FormControl>
                          <select
                            className="w-full border border-gray-300 rounded-md p-2"
                            {...field}
                          >
                            <option value="">{t('wards.selectAnOfficer')}</option>
                              {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                  {user.name} ({user.email})
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('wards.description')} (Optional)</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? t('common.loading') : t('wards.createNewWard')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                  <div className="w-full flex justify-between">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-28" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wards.length > 0 ? (
              wards.map((ward) => (
                <Card key={ward._id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{ward.name}</CardTitle>
                      <Badge variant="outline" className="font-medium">#{ward.number}</Badge>
                    </div>
                    <CardDescription className="flex items-center mt-1">
                      <Map className="h-3 w-3 mr-1" /> {ward.location.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      <strong>{t('wards.coordinates')}:</strong> {ward.location.coordinates.coordinates[1].toFixed(4)}, {ward.location.coordinates.coordinates[0].toFixed(4)}
                    </p>
                    {ward.description && (
                      <p className="text-sm line-clamp-2">{ward.description}</p>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2 border-t bg-gray-50 dark:bg-gray-900">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => window.location.href = `/admin/wards/${ward._id}`}
                    >
                      {t('wards.viewDetails')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => openDeleteDialog(ward)}
                    >
                      {t('wards.deleteWard')}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                    <Map className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-medium">{t('wards.noWardsFound')}</h3>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    {t('wards.addNewWard')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('wards.deleteWard')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('wards.deleteConfirm')} {wardToDelete && <strong>{wardToDelete.name}</strong>}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteWard}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {t('common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
}
