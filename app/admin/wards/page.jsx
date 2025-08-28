'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Filter, MapPin, Users, TrendingUp, Clock, 
  Eye, Edit, Trash, MoreVertical, Map, Navigation, Building2,
  Phone, Mail, Calendar, Target, BarChart3
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [wards, setWards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [userLocation, setUserLocation] = useState(null);
  const [radiusFilter, setRadiusFilter] = useState(10);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentWard, setCurrentWard] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [wardToDelete, setWardToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    description: '',
    population: 0,
    area: 0,
    coordinates: { latitude: '', longitude: '' },
    address: { street: '', city: '', state: '', zipCode: '' },
    officerInCharge: 'no-officer',
    contactInfo: { phone: '', email: '' },
    isActive: true
  });

  useEffect(() => {
    if (status === 'authenticated' && ['admin', 'official'].includes(session?.user?.role)) {
      fetchWards();
      fetchUsers();
      requestLocation();
    }
  }, [status, session]);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  };

  const fetchWards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        sortBy: sortBy
      });

      if (userLocation && sortBy === 'distance') {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
        params.append('radius', radiusFilter);
      }

      const response = await fetch(`/api/wards?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setWards(data.wards || []);
      } else {
        console.error('API Error:', data);
        toast({ 
          title: 'Error', 
          description: data.error || 'Failed to load wards', 
          variant: 'destructive' 
        });
        setWards([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to load wards', 
        variant: 'destructive' 
      });
      setWards([]); // Set empty array on error
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = currentWard ? `/api/wards/${currentWard._id}` : '/api/wards';
      const method = currentWard ? 'PUT' : 'POST';
      
      const submitData = {
        ...formData,
        officerInCharge: formData.officerInCharge === 'no-officer' ? null : formData.officerInCharge,
        population: parseInt(formData.population) || 0,
        area: parseFloat(formData.area) || 0,
        coordinates: {
          latitude: parseFloat(formData.coordinates.latitude) || null,
          longitude: parseFloat(formData.coordinates.longitude) || null
        }
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast({ 
          title: 'Success', 
          description: currentWard ? 'Ward updated successfully' : 'Ward created successfully' 
        });
        setIsDialogOpen(false);
        fetchWards();
      } else {
        const data = await response.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save ward', variant: 'destructive' });
    }
  };

  const handleAddWard = () => {
    setCurrentWard(null);
    setFormData({
      name: '',
      number: '',
      description: '',
      population: 0,
      area: 0,
      coordinates: { latitude: '', longitude: '' },
      address: { street: '', city: '', state: '', zipCode: '' },
      officerInCharge: 'no-officer',
      contactInfo: { phone: '', email: '' },
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const handleEditWard = (ward) => {
    setCurrentWard(ward);
    setFormData({
      name: ward.name || '',
      number: ward.number || '',
      description: ward.description || '',
      population: ward.population || 0,
      area: ward.area || 0,
      coordinates: {
        latitude: ward.coordinates?.latitude || '',
        longitude: ward.coordinates?.longitude || ''
      },
      address: ward.address || { street: '', city: '', state: '', zipCode: '' },
      officerInCharge: ward.officerInCharge?._id || 'no-officer',
      contactInfo: ward.contactInfo || { phone: '', email: '' },
      isActive: ward.isActive !== undefined ? ward.isActive : true
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = (ward) => {
    setWardToDelete(ward);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteWard = async () => {
    if (!wardToDelete) return;
    
    try {
      const response = await fetch(`/api/wards/${wardToDelete._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Ward deactivated successfully' });
        setIsDeleteDialogOpen(false);
        setWardToDelete(null);
        fetchWards();
      } else {
        const data = await response.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete ward', variant: 'destructive' });
    }
  };

  const handleDuplicateWard = async (ward) => {
    try {
      const response = await fetch(`/api/wards/${ward._id}/duplicate`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Ward duplicated successfully' });
        fetchWards();
      } else {
        const data = await response.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to duplicate ward', variant: 'destructive' });
    }
  };

  const createSampleData = async () => {
    try {
      const response = await fetch('/api/wards/sample', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        toast({ title: 'Success', description: data.message });
        fetchWards();
      } else {
        const data = await response.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create sample data', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchWards();
  }, [searchQuery, statusFilter, sortBy, userLocation, radiusFilter]);

  if (status === 'loading') return <div>Loading...</div>;
  if (!session || !['admin', 'official'].includes(session.user.role)) {
    router.push('/');
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ward Management</h1>
          <p className="text-muted-foreground">Manage administrative wards and their boundaries</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowLocationDialog(true)}>
            <Navigation className="h-4 w-4 mr-2" />
            Location Settings
          </Button>
          <Button onClick={handleAddWard}>
            <Plus className="h-4 w-4 mr-2" />
            Add Ward
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Wards</p>
                <p className="text-2xl font-bold">{wards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Population</p>
                <p className="text-2xl font-bold">
                  {wards.reduce((sum, w) => sum + (w.population || 0), 0).toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold">
                  {wards.reduce((sum, w) => sum + (w.stats?.totalIssues || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Avg Resolution Rate</p>
                <p className="text-2xl font-bold">
                  {wards.length > 0 
                    ? (wards.reduce((sum, w) => sum + parseFloat(w.stats?.resolutionRate || 0), 0) / wards.length).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search wards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
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

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="population">Population</SelectItem>
              <SelectItem value="issues">Issue Count</SelectItem>
              <SelectItem value="resolution">Resolution Rate</SelectItem>
              {userLocation && <SelectItem value="distance">Distance</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Wards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={`skeleton-${i}`} className="animate-pulse">
              <CardHeader className="bg-gray-100 h-20" />
              <CardContent className="p-4">
                <div className="bg-gray-100 h-4 mb-2" />
                <div className="bg-gray-100 h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : wards.length === 0 ? (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="pt-6 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No wards found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first ward'}
            </p>
            <div className="mt-6 space-y-2">
              <Button onClick={handleAddWard}>
                <Plus className="h-4 w-4 mr-2" />
                Add Ward
              </Button>
              <Button variant="outline" onClick={createSampleData} className="w-full">
                Create Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wards.map((ward) => (
            <Card key={ward._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Ward {ward.number}</CardTitle>
                    <p className="text-sm text-gray-600">{ward.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={ward.isActive ? "default" : "outline"}>
                      {ward.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/wards/${ward._id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditWard(ward)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/wards/${ward._id}/map`)}>
                          <Map className="mr-2 h-4 w-4" />
                          View on Map
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateWard(ward)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteConfirm(ward)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Location Info */}
                {ward.distance && (
                  <div className="flex items-center text-sm text-blue-600 mb-2">
                    <Navigation className="h-4 w-4 mr-1" />
                    {ward.distance.toFixed(1)} km away
                  </div>
                )}
                
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {ward.population?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-500">Population</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {ward.area || 0} km²
                    </div>
                    <div className="text-xs text-gray-500">Area</div>
                  </div>
                </div>

                {/* Issue Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <div className="text-sm font-bold text-orange-600">
                      {ward.stats?.totalIssues || 0}
                    </div>
                    <div className="text-xs text-gray-500">Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-green-600">
                      {ward.stats?.resolvedIssues || 0}
                    </div>
                    <div className="text-xs text-gray-500">Resolved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-purple-600">
                      {ward.stats?.resolutionRate || 0}%
                    </div>
                    <div className="text-xs text-gray-500">Rate</div>
                  </div>
                </div>

                {/* Officer Info */}
                {ward.officerInCharge && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Users className="h-4 w-4 mr-2" />
                    {ward.officerInCharge.name}
                  </div>
                )}

                {/* Contact Info */}
                {ward.contactInfo?.phone && (
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Phone className="h-4 w-4 mr-2" />
                    {ward.contactInfo.phone}
                  </div>
                )}

                {/* Address */}
                {ward.address?.city && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {ward.address.city}, {ward.address.state}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Ward Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentWard ? 'Edit Ward' : 'Add New Ward'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="officer">Officer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Ward Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Ward Number *</Label>
                    <Input
                      id="number"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      required
                    />
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="population">Population</Label>
                    <Input
                      id="population"
                      name="population"
                      type="number"
                      value={formData.population}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="area">Area (km²)</Label>
                    <Input
                      id="area"
                      name="area"
                      type="number"
                      step="0.01"
                      value={formData.area}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Active Ward</Label>
                </div>
              </TabsContent>
              
              <TabsContent value="location" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="coordinates.latitude">Latitude</Label>
                    <Input
                      id="coordinates.latitude"
                      name="coordinates.latitude"
                      type="number"
                      step="any"
                      value={formData.coordinates.latitude}
                      onChange={handleInputChange}
                      placeholder="e.g., 27.7172"
                    />
                  </div>
                  <div>
                    <Label htmlFor="coordinates.longitude">Longitude</Label>
                    <Input
                      id="coordinates.longitude"
                      name="coordinates.longitude"
                      type="number"
                      step="any"
                      value={formData.coordinates.longitude}
                      onChange={handleInputChange}
                      placeholder="e.g., 85.3240"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address.street">Street Address</Label>
                    <Input
                      id="address.street"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address.city">City</Label>
                    <Input
                      id="address.city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address.state">State/Province</Label>
                    <Input
                      id="address.state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address.zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="address.zipCode"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactInfo.phone">Phone Number</Label>
                    <Input
                      id="contactInfo.phone"
                      name="contactInfo.phone"
                      value={formData.contactInfo.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactInfo.email">Email Address</Label>
                    <Input
                      id="contactInfo.email"
                      name="contactInfo.email"
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="officer" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="officerInCharge">Officer in Charge</Label>
                  <Select
                    value={formData.officerInCharge}
                    onValueChange={(value) => setFormData({...formData, officerInCharge: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-officer">No officer assigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {currentWard ? 'Update Ward' : 'Create Ward'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Location Settings Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Location Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Location</Label>
              <p className="text-sm text-gray-600">
                {userLocation 
                  ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                  : 'Location not available'
                }
              </p>
            </div>
            <div>
              <Label htmlFor="radius">Search Radius (km)</Label>
              <Input
                id="radius"
                type="number"
                value={radiusFilter}
                onChange={(e) => setRadiusFilter(parseFloat(e.target.value) || 10)}
                min="1"
                max="100"
              />
            </div>
            <Button onClick={requestLocation} className="w-full">
              <Navigation className="h-4 w-4 mr-2" />
              Update Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Ward</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate "{wardToDelete?.name}"? This will make the ward inactive but preserve all data. You can reactivate it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteWard}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
