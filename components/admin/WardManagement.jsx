'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  AlertCircle,
  Calendar,
  CheckCircle,
  Edit,
  FileText,
  MapPin,
  Power,
  Search,
  Trash2,
  User,
  Users,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WardManagement() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [editingWard, setEditingWard] = useState(null);
  const [wardIssues, setWardIssues] = useState({});

  useEffect(() => {
    fetchWards();
  }, [pagination.page, search]);

  const fetchWards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '10',
        search
      });

      const response = await fetch(`/api/admin/wards?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setWards(data.wards);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWardIssues = async (wardId) => {
    try {
      const response = await fetch(`/api/issues?ward=${wardId}&limit=5`);
      const data = await response.json();
      if (data.success) {
        setWardIssues(prev => ({ ...prev, [wardId]: data.issues }));
      }
    } catch (error) {
      console.error('Error fetching ward issues:', error);
    }
  };

  const editWard = async (wardData) => {
    try {
      const response = await fetch(`/api/admin/wards/${wardData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wardData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Ward updated successfully');
        setEditingWard(null);
        fetchWards();
      } else {
        alert(data.message || 'Failed to update ward');
      }
    } catch (error) {
      alert('Error updating ward');
    }
  };

  const toggleWardStatus = async (wardId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/wards/${wardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Ward ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchWards();
      } else {
        alert(data.message || 'Failed to update ward status');
      }
    } catch (error) {
      alert('Error updating ward status');
    }
  };

  const deleteWard = async (wardId, wardName) => {
    if (!confirm(`Are you sure you want to delete ${wardName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/wards?id=${wardId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Ward deleted successfully');
        fetchWards();
      } else {
        alert(data.message || 'Failed to delete ward');
      }
    } catch (error) {
      alert('Error deleting ward');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ward Management</h2>
          <p className="text-muted-foreground">
            Manage existing wards with full CRUD operations
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by ward name or number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchWards}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Wards List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Existing Wards ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading wards...</div>
          ) : wards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No wards found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wards.map((ward) => (
                <Card key={ward._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{ward.name}</h3>
                            <p className="text-sm text-muted-foreground">Ward #{ward.number}</p>
                          </div>
                          <Badge variant={ward.isActive ? "default" : "secondary"}>
                            {ward.isActive ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </div>

                        {/* Location & Population */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{ward.location?.address || 'No address'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Population: {ward.population?.toLocaleString() || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Coordinates */}
                        {ward.location?.coordinates?.coordinates && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>
                              Coordinates: {ward.location.coordinates.coordinates[1]}, {ward.location.coordinates.coordinates[0]}
                            </span>
                          </div>
                        )}

                        {/* Officer */}
                        {ward.officerInCharge && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Officer: {ward.officerInCharge.name}</span>
                          </div>
                        )}

                        {/* Description */}
                        {ward.description && (
                          <p className="text-sm text-muted-foreground">{ward.description}</p>
                        )}

                        {/* Related Issues */}
                        <div className="border-t pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Related Issues</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchWardIssues(ward._id)}
                            >
                              Load Issues
                            </Button>
                          </div>
                          
                          {wardIssues[ward._id] ? (
                            wardIssues[ward._id].length > 0 ? (
                              <div className="space-y-1">
                                {wardIssues[ward._id].map((issue) => (
                                  <div key={issue._id} className="text-xs p-2 bg-gray-50 rounded flex justify-between">
                                    <span className="truncate">{issue.title}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {issue.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">No issues assigned</p>
                            )
                          ) : (
                            <p className="text-xs text-muted-foreground">Click "Load Issues" to view</p>
                          )}
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center gap-6 text-xs text-muted-foreground pt-2 border-t">
                          <span>Area: {ward.area || 'N/A'} sq km</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created: {new Date(ward.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleWardStatus(ward._id, ward.isActive)}
                          title={ward.isActive ? 'Deactivate Ward' : 'Activate Ward'}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingWard(ward)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Ward</DialogTitle>
                            </DialogHeader>
                            {editingWard && (
                              <EditWardForm 
                                ward={editingWard} 
                                onSave={editWard}
                                onCancel={() => setEditingWard(null)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteWard(ward._id, ward.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EditWardForm({ ward, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: ward.name || '',
    description: ward.description || '',
    population: ward.population || '',
    area: ward.area || '',
    contactEmail: ward.contactEmail || '',
    contactPhone: ward.contactPhone || '',
    'location.address': ward.location?.address || '',
    isActive: ward.isActive !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...ward,
      ...formData,
      population: parseInt(formData.population) || 0,
      area: parseFloat(formData.area) || 0,
      location: {
        ...ward.location,
        address: formData['location.address']
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">Ward Name</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>
      
      <div>
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="edit-address">Address</Label>
        <Input
          id="edit-address"
          value={formData['location.address']}
          onChange={(e) => setFormData(prev => ({ ...prev, 'location.address': e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-population">Population</Label>
          <Input
            id="edit-population"
            type="number"
            value={formData.population}
            onChange={(e) => setFormData(prev => ({ ...prev, population: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="edit-area">Area (sq km)</Label>
          <Input
            id="edit-area"
            type="number"
            step="0.1"
            value={formData.area}
            onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-email">Contact Email</Label>
          <Input
            id="edit-email"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="edit-phone">Contact Phone</Label>
          <Input
            id="edit-phone"
            value={formData.contactPhone}
            onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="edit-status">Ward Status</Label>
        <Switch
          id="edit-status"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
