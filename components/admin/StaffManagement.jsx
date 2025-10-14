'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Users, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

const POSITIONS = [
  'Senior Officer',
  'Field Officer', 
  'Inspector',
  'Coordinator',
  'Supervisor',
  'Technician'
];

const PERMISSIONS = [
  { id: 'view_issues', label: 'View Issues' },
  { id: 'update_issues', label: 'Update Issues' },
  { id: 'assign_issues', label: 'Assign Issues' },
  { id: 'resolve_issues', label: 'Resolve Issues' },
  { id: 'manage_reports', label: 'Manage Reports' }
];

export default function StaffManagement({ departmentId }) {
  const { toast } = useToast();
  const [staff, setStaff] = useState([]);
  const [users, setUsers] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    position: '',
    assignedWards: [],
    permissions: ['view_issues', 'update_issues']
  });

  useEffect(() => {
    if (departmentId) {
      fetchStaff();
      fetchUsers();
      fetchWards();
    }
  }, [departmentId]);

  const fetchStaff = async () => {
    try {
      const response = await fetch(`/api/departments/${departmentId}/staff`);
      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff || []);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load staff', variant: 'destructive' });
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

  const fetchWards = async () => {
    try {
      const response = await fetch('/api/wards');
      if (response.ok) {
        const data = await response.json();
        setWards(data.wards || []);
      }
    } catch (error) {
      console.error('Failed to fetch wards:', error);
    }
  };

  const handleAddStaff = () => {
    setCurrentStaff(null);
    setFormData({
      userId: '',
      position: '',
      assignedWards: [],
      permissions: ['view_issues', 'update_issues']
    });
    setIsDialogOpen(true);
  };

  const handleEditStaff = (staffMember) => {
    setCurrentStaff(staffMember);
    setFormData({
      userId: staffMember.user._id,
      position: staffMember.position,
      assignedWards: staffMember.assignedWards?.map(w => w._id) || [],
      permissions: staffMember.permissions || ['view_issues', 'update_issues']
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.position) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    try {
      const url = currentStaff 
        ? `/api/departments/${departmentId}/staff/${currentStaff._id}`
        : `/api/departments/${departmentId}/staff`;
      
      const method = currentStaff ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({ 
          title: 'Success', 
          description: currentStaff ? 'Staff member updated' : 'Staff member added' 
        });
        setIsDialogOpen(false);
        fetchStaff();
      } else {
        const data = await response.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save staff member', variant: 'destructive' });
    }
  };

  const handleDeleteConfirm = (staffMember) => {
    setStaffToDelete(staffMember);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!staffToDelete) return;

    try {
      const response = await fetch(`/api/departments/${departmentId}/staff/${staffToDelete._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Staff member removed' });
        setIsDeleteDialogOpen(false);
        setStaffToDelete(null);
        fetchStaff();
      } else {
        const data = await response.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove staff member', variant: 'destructive' });
    }
  };

  const handlePermissionChange = (permissionId, checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  const handleWardChange = (wardId, checked) => {
    setFormData(prev => ({
      ...prev,
      assignedWards: checked 
        ? [...prev.assignedWards, wardId]
        : prev.assignedWards.filter(w => w !== wardId)
    }));
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded"></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Staff Management</h2>
        <Button onClick={handleAddStaff}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {staff.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">No staff members</h3>
            <p className="text-gray-500">Add staff members to manage this department</p>
            <Button onClick={handleAddStaff} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add First Staff Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <Card key={member._id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{member.user.name}</CardTitle>
                    <p className="text-sm text-gray-600">{member.position}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditStaff(member)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteConfirm(member)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {member.user.email}
                  </div>
                  {member.user.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {member.user.phone}
                    </div>
                  )}
                  {member.assignedWards?.length > 0 && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                      <div>
                        {member.assignedWards.map(ward => (
                          <Badge key={ward._id} variant="outline" className="mr-1 mb-1">
                            Ward {ward.number}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {member.permissions?.slice(0, 2).map(permission => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {PERMISSIONS.find(p => p.id === permission)?.label || permission}
                      </Badge>
                    ))}
                    {member.permissions?.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{member.permissions.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userId">Select User *</Label>
                <Select 
                  value={formData.userId} 
                  onValueChange={(value) => setFormData({...formData, userId: value})}
                  disabled={!!currentStaff}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(user => !staff.some(s => s.user._id === user._id) || currentStaff?.user._id === user._id).map(user => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="position">Position *</Label>
                <Select 
                  value={formData.position} 
                  onValueChange={(value) => setFormData({...formData, position: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map(position => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Assigned Wards</Label>
              <div className="grid grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto">
                {wards.map(ward => (
                  <div key={ward._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ward-${ward._id}`}
                      checked={formData.assignedWards.includes(ward._id)}
                      onCheckedChange={(checked) => handleWardChange(ward._id, checked)}
                    />
                    <label htmlFor={`ward-${ward._id}`} className="text-sm">
                      Ward {ward.number}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {PERMISSIONS.map(permission => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`perm-${permission.id}`}
                      checked={formData.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                    />
                    <label htmlFor={`perm-${permission.id}`} className="text-sm">
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {currentStaff ? 'Update' : 'Add'} Staff Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {staffToDelete?.user.name} from this department? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
