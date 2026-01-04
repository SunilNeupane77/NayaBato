'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    FileText,
    MapPin,
    Tag,
    Trash2,
    User,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WardDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [wardData, setWardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    number: '',
    description: ''
  });

  useEffect(() => {
    fetchWardData();
  }, [params.id]);

  useEffect(() => {
    if (wardData) {
      setEditForm({
        name: wardData.ward.name || '',
        number: wardData.ward.number || '',
        description: wardData.ward.description || ''
      });
    }
  }, [wardData]);

  const fetchWardData = async () => {
    try {
      const response = await fetch(`/api/official/wards/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setWardData(data);
      }
    } catch (error) {
      console.error('Error fetching ward data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWard = async () => {
    try {
      const response = await fetch(`/api/official/wards/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        toast({ title: 'Ward updated successfully' });
        setEditDialogOpen(false);
        fetchWardData();
      } else {
        toast({ title: 'Failed to update ward', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error updating ward', variant: 'destructive' });
    }
  };

  const deleteWard = async () => {
    if (!confirm('Are you sure you want to delete this ward?')) return;
    
    try {
      const response = await fetch(`/api/official/wards/${params.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({ title: 'Ward deleted successfully' });
        window.location.href = '/official/wards';
      } else {
        toast({ title: 'Failed to delete ward', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error deleting ward', variant: 'destructive' });
    }
  };

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      const response = await fetch(`/api/official/issues/${issueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast({ title: 'Issue status updated successfully' });
        fetchWardData();
      } else {
        toast({ title: 'Failed to update issue status', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error updating issue status', variant: 'destructive' });
    }
  };

  const getStatusColor = (status) => {
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    return 'text-gray-700';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!wardData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Ward not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/official/wards">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Wards
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{wardData.ward.name}</h1>
          <p className="text-gray-600">Ward {wardData.ward.number}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="ml-auto flex gap-2">
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <Edit className="h-4 w-4 mr-2" />
                Edit Ward
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Ward</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Ward Name</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Enter ward name"
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ward Number</label>
                  <Input
                    type="number"
                    value={editForm.number}
                    onChange={(e) => setEditForm({...editForm, number: e.target.value})}
                    placeholder="Enter ward number"
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    placeholder="Enter ward description"
                    className="border-gray-300"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={updateWard} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
                    Update Ward
                  </Button>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="sm" onClick={deleteWard} className="border-red-300 text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Ward
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-gray-200">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <div className="text-3xl font-semibold text-gray-900">{wardData.stats.totalIssues}</div>
            <div className="text-sm text-gray-600 font-medium">Total Issues</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <div className="text-3xl font-semibold text-gray-900">{wardData.stats.pendingIssues}</div>
            <div className="text-sm text-gray-600 font-medium">Pending</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <div className="text-3xl font-semibold text-gray-900">{wardData.stats.inProgressIssues}</div>
            <div className="text-sm text-gray-600 font-medium">In Progress</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <div className="text-3xl font-semibold text-gray-900">{wardData.stats.resolvedIssues}</div>
            <div className="text-sm text-gray-600 font-medium">Resolved</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <div className="text-3xl font-semibold text-gray-900">{wardData.stats.citizensCount}</div>
            <div className="text-sm text-gray-600 font-medium">Citizens</div>
          </CardContent>
        </Card>
      </div>

      {/* Ward Info and Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ward Information */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              Ward Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Ward Name</label>
              <p className="text-lg font-medium text-gray-900">{wardData.ward.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Ward Number</label>
              <p className="text-lg font-medium text-gray-900">{wardData.ward.number}</p>
            </div>
            {wardData.ward.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-700">{wardData.ward.description}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Assigned Officials</label>
              <div className="space-y-2 mt-2">
                {wardData.ward.assignedOfficials?.map((official) => (
                  <div key={official._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{official.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ward Issues */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Ward Issues
              </CardTitle>
              <p className="text-sm text-gray-600">All issues reported in this ward</p>
            </CardHeader>
            <CardContent>
              {wardData.issues.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
                  <p>No issues have been reported in this ward yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wardData.issues.map((issue) => (
                    <Card key={issue._id} className="border-gray-200 hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-lg text-gray-900">{issue.title}</h4>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(issue.status)}>
                              {issue.status.replace('_', ' ').replace('-', ' ')}
                            </Badge>
                            <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                              {issue.priority} priority
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {issue.description}
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{issue.reporter?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            <span className="capitalize">{issue.category || 'General'}</span>
                          </div>
                        </div>
                        
                        {/* Issue Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          {issue.status !== 'in_progress' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={() => updateIssueStatus(issue._id, 'in_progress')}
                            >
                              In Progress
                            </Button>
                          )}
                          {issue.status !== 'resolved' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={() => updateIssueStatus(issue._id, 'resolved')}
                            >
                              Resolve
                            </Button>
                          )}
                          <Link href={`/issues/${issue._id}`}>
                            <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
