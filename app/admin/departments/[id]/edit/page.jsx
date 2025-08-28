'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

const departmentCategories = ['pothole', 'streetlight', 'garbage', 'water', 'electricity', 'other'];

export default function EditDepartmentPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchDepartment();
      fetchUsers();
    }
  }, [session, resolvedParams.id]);

  const fetchDepartment = async () => {
    try {
      const response = await fetch(`/api/departments/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        const dept = data.department;
        setFormData({
          name: dept.name || '',
          description: dept.description || '',
          headOfficer: dept.headOfficer?._id || 'no-officer',
          contactEmail: dept.contactEmail || '',
          contactPhone: dept.contactPhone || '',
          categories: dept.categories || [],
          budget: dept.budget || { allocated: 0, spent: 0, year: new Date().getFullYear() },
          workingHours: dept.workingHours || {
            start: '09:00',
            end: '17:00',
            workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          },
          isActive: dept.isActive !== undefined ? dept.isActive : true,
        });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load department', variant: 'destructive' });
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
    } catch (error) {
      console.error('Failed to fetch users:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.categories.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one category', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        ...formData,
        headOfficer: formData.headOfficer === 'no-officer' ? '' : formData.headOfficer
      };

      const response = await fetch(`/api/departments/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Department updated successfully' });
        router.push(`/admin/departments/${resolvedParams.id}`);
      } else {
        const data = await response.json();
        toast({ title: 'Error', description: data.error || 'Failed to update department', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update department', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Department</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Department Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="headOfficer">Head Officer</Label>
                    <Select
                      value={formData.headOfficer}
                      onValueChange={(value) => setFormData({...formData, headOfficer: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-officer">No officer assigned</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name}
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
                  <Label htmlFor="isActive">Active Department</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Working Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="budget.allocated">Allocated Budget ($)</Label>
                    <Input
                      id="budget.allocated"
                      name="budget.allocated"
                      type="number"
                      value={formData.budget.allocated}
                      onChange={handleInputChange}
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
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-4 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
