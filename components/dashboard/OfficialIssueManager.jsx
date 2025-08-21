'use client';

import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

// Status colors
const STATUS_COLORS = {
  'reported': 'bg-orange-500',
  'under-review': 'bg-blue-500',
  'in-progress': 'bg-yellow-500',
  'resolved': 'bg-green-500',
  'rejected': 'bg-red-500',
};

// Format status for display
const formatStatus = (status) => {
  const map = {
    'reported': 'Reported',
    'under-review': 'Under Review',
    'in-progress': 'In Progress',
    'resolved': 'Resolved',
    'rejected': 'Not Actionable',
  };
  return map[status] || status;
};

// Format category for display
const formatCategory = (category) => {
  const map = {
    'pothole': 'Potholes',
    'streetlight': 'Streetlights',
    'garbage': 'Garbage',
    'water': 'Water Issues',
    'electricity': 'Electricity',
    'other': 'Other Issues',
  };
  return map[category] || category;
};

export default function OfficialIssueManager() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [departmentIssues, setDepartmentIssues] = useState([]);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  
  // Load issues relevant to the official's department
  useEffect(() => {
    const fetchDepartmentIssues = async () => {
      if (!session?.user?.department) return;
      
      try {
        setLoading(true);
        // Fetch issues for this official's department
        const response = await fetch(`/api/issues?department=${session.user.department}&status=reported,under-review`);
        
        if (!response.ok) {
          throw new Error('Failed to load department issues');
        }
        
        const data = await response.json();
        setDepartmentIssues(data.issues || []);
      } catch (err) {
        console.error('Error fetching department issues:', err);
        setError(err.message || 'Failed to load department issues');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentIssues();
  }, [session]);

  // Handle status change
  const handleStatusChange = async (issueId, newStatus) => {
    if (!issueId || !newStatus) return;
    
    try {
      setProcessingId(issueId);
      
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          statusNotes: `Status updated to ${formatStatus(newStatus)} by ${session.user.name}`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update issue status');
      }
      
      // Update local state
      setDepartmentIssues(prev => 
        prev.map(issue => 
          issue._id === issueId ? { ...issue, status: newStatus } : issue
        )
      );
      
      toast({
        title: 'Status Updated',
        description: `Issue status has been updated to ${formatStatus(newStatus)}`,
      });
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Issues</CardTitle>
        <CardDescription>
          Manage issues assigned to {session?.user?.department} department
        </CardDescription>
      </CardHeader>
      <CardContent>
        {departmentIssues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending issues for your department
          </div>
        ) : (
          <div className="space-y-4">
            {departmentIssues.map(issue => (
              <div key={issue._id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline">{formatCategory(issue.category)}</Badge>
                      <Badge className={STATUS_COLORS[issue.status]}>
                        {formatStatus(issue.status)}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-lg mb-1">{issue.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {issue.description.substring(0, 100)}
                      {issue.description.length > 100 ? '...' : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      Reported on {new Date(issue.createdAt).toLocaleDateString()} 
                      by {issue.reporter?.name || 'Anonymous'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/issues/${issue._id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 pt-2 border-t flex justify-between items-center">
                  <div className="flex-1 max-w-xs">
                    <Select
                      onValueChange={(value) => handleStatusChange(issue._id, value)}
                      defaultValue={issue.status}
                      disabled={processingId === issue._id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reported">Reported</SelectItem>
                        <SelectItem value="under-review">Under Review</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="rejected">Not Actionable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {processingId === issue._id ? (
                    <div className="ml-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : issue.status === 'resolved' ? (
                    <div className="ml-2 text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Resolved</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={() => router.push('/issues')}>
          View All Issues
        </Button>
      </CardFooter>
    </Card>
  );
}