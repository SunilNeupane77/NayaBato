'use client';

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
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form schema for ward creation
const wardSchema = z.object({
  name: z.string().min(2, { message: 'Ward name is required' }),
  number: z.coerce.number().min(1, { message: 'Ward number must be at least 1' }),
  address: z.string().min(5, { message: 'Address is required' }),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  officerInCharge: z.string().optional(),
  description: z.string().optional(),
});

export default function WardsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch wards data
  const { data: wardsData, isLoading, error, refetch: mutate } = useFetchData('wards', '/api/wards');
  // Ensure wards is always an array
  const wards = Array.isArray(wardsData?.wards) ? wardsData?.wards : (Array.isArray(wardsData) ? wardsData : []);

  // Fetch users for officer selection
  const { data: usersRaw } = useFetchData('/api/users?role=official');
  const users = Array.isArray(usersRaw) ? usersRaw : [];

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
          title: 'Success',
          description: 'Ward created successfully',
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
          title: 'Duplicate Ward Number',
          description: 'A ward with this number already exists. Please choose a different number.',
        });
      } else {
        throw new Error(result.message || 'Failed to create ward');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An error occurred while creating the ward',
      });
    }
  };

  // Handle ward deletion
  const handleDeleteWard = async (wardId) => {
    if (!confirm('Are you sure you want to delete this ward?')) return;
    
    try {
      const response = await fetch(`/api/wards/${wardId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Ward deleted successfully',
        });
        mutate(); // Refresh the wards list
      } else {
        throw new Error(result.message || 'Failed to delete ward');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An error occurred while deleting the ward',
      });
    }
  };

  // No longer needed as we navigate to a dedicated page

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Ward Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Ward</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Ward</DialogTitle>
              <DialogDescription>
                Add a new ward to the system. Wards are local administrative units responsible for handling issues in their area.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ward Name</FormLabel>
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
                      <FormLabel>Ward Number</FormLabel>
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
                      <FormLabel>Address</FormLabel>
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
                        <FormLabel>Latitude</FormLabel>
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
                        <FormLabel>Longitude</FormLabel>
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
                        <FormLabel>Officer in Charge (Optional)</FormLabel>
                        <FormControl>
                          <select
                            className="w-full border border-gray-300 rounded-md p-2"
                            {...field}
                          >
                            <option value="">Select an officer</option>
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Create Ward</Button>
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
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-20 mr-2" />
                <Skeleton className="h-8 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-700">Error loading wards: {error.message}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wards.length > 0 ? (
            wards.map((ward) => (
              <Card key={ward._id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {ward.name} 
                    <Badge variant="outline">Ward #{ward.number}</Badge>
                  </CardTitle>
                  <CardDescription>{ward.location.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">
                    <strong>Coordinates:</strong> {ward.location.coordinates.coordinates[1]}, {ward.location.coordinates.coordinates[0]}
                  </p>
                  {ward.description && (
                    <p className="text-sm">{ward.description}</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = `/admin/wards/${ward._id}`}
                  >
                    View Details
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteWard(ward._id)}>
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-3 p-6 text-center">
              <p className="text-gray-500">No wards found. Create a new ward to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* We've removed the modal dialog in favor of a dedicated ward details page */}
    </div>
  );
}
