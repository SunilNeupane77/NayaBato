'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, 
  Search, 
  Filter,
  Calendar,
  User,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Settings,
  Tag
} from 'lucide-react';
import Link from 'next/link';

export default function OfficialIssuesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    ward: 'all',
    search: ''
  });
  const [wards, setWards] = useState([]);

  useEffect(() => {
    fetchIssues();
    fetchWards();
  }, [session, filters]);

  const fetchIssues = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value);
      });

      const response = await fetch(`/api/official/issues?${params}`);
      if (response.ok) {
        const data = await response.json();
        setIssues(data.issues || []);
      } else {
        console.error('Failed to fetch issues:', response.status);
        setIssues([]);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async () => {
    try {
      const response = await fetch('/api/official/wards');
      if (response.ok) {
        const data = await response.json();
        setWards(data.wards || []);
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      const response = await fetch(`/api/official/issues/${issueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setIssues(issues.map(issue => 
          issue._id === issueId ? { ...issue, status: newStatus } : issue
        ));
        toast({ title: 'Issue status updated successfully' });
      }
    } catch (error) {
      toast({ title: 'Error updating issue status', variant: 'destructive' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Issue Management</h1>
        <p className="text-muted-foreground">
          Manage and track issues in your assigned wards
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search issues..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({...filters, status: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.priority}
              onValueChange={(value) => setFilters({...filters, priority: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.ward}
              onValueChange={(value) => setFilters({...filters, ward: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Wards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {wards.map((ward) => (
                  <SelectItem key={ward._id} value={ward._id}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle>Issues ({issues.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {issues.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
              <p>No issues match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {issues.map((issue) => (
                <Card key={issue._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex">
                    {/* Issue Image */}
                    <div className="w-48 h-48 flex-shrink-0 bg-gray-100">
                      {issue.images && issue.images.length > 0 ? (
                        <img 
                          src={issue.images[0].url} 
                          alt={issue.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FileText className="h-16 w-16" />
                        </div>
                      )}
                    </div>
                    
                    {/* Issue Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{issue.title}</h3>
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className={`${getStatusColor(issue.status)} border-0 flex items-center gap-1`}>
                              {getStatusIcon(issue.status)}
                              {issue.status.replace('_', ' ').replace('-', ' ')}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                              {issue.priority.toUpperCase()}
                            </Badge>
                            {issue.priority === 'high' && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                URGENT
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {issue.description}
                      </p>
                      
                      {/* Issue Meta Info */}
                      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <User className="h-4 w-4" />
                          <span className="font-medium">Reporter:</span>
                          <span>{issue.citizen?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium">Ward:</span>
                          <span>{issue.ward?.name || 'No ward'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Date:</span>
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Tag className="h-4 w-4" />
                          <span className="font-medium">Category:</span>
                          <span className="capitalize">{issue.category || 'General'}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex gap-2">
                          {issue.status !== 'under-review' && (
                            <Button 
                              size="sm" 
                              className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm"
                              onClick={() => handleStatusUpdate(issue._id, 'under-review')}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Under Review
                            </Button>
                          )}
                          {issue.status !== 'in_progress' && issue.status !== 'in-progress' && (
                            <Button 
                              size="sm" 
                              className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                              onClick={() => handleStatusUpdate(issue._id, 'in_progress')}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              In Progress
                            </Button>
                          )}
                          {issue.status !== 'resolved' && (
                            <Button 
                              size="sm" 
                              className="bg-green-500 hover:bg-green-600 text-white shadow-sm"
                              onClick={() => handleStatusUpdate(issue._id, 'resolved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                        
                        <div className="ml-auto">
                          <Link href={`/issues/${issue._id}`}>
                            <Button size="sm" variant="outline" className="shadow-sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
