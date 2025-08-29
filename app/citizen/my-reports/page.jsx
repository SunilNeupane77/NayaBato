'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Filter,
  Search,
  Eye,
  MessageSquare,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Target,
  Users,
  Globe,
  Star,
  Award,
  Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MyReportsPage() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMyReports();
  }, []);

  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm, statusFilter]);

  const fetchMyReports = async () => {
    try {
      const response = await fetch('/api/citizen/my-reports');
      const data = await response.json();
      setIssues(data.issues || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIssues = () => {
    let filtered = issues;

    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    setFilteredIssues(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'under-review': return <AlertCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in-progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'under-review': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="self-start hover:bg-white/80 backdrop-blur-sm">
              <Link href="/citizen/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    My Reports
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Track and manage your civic contributions
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
            <Link href="/issues/report">
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Link>
          </Button>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{issues.length}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Target className="w-3 h-3" />
                Total Reports
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white to-emerald-50 border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {issues.filter(i => i.status === 'resolved').length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Award className="w-3 h-3" />
                Resolved
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white to-amber-50 border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {issues.filter(i => i.status === 'in-progress').length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3" />
                In Progress
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {issues.filter(i => i.status === 'under-review').length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Under Review
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search your reports by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-white/50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-56 h-12 bg-white/50 border-gray-200">
                  <Filter className="w-5 h-5 mr-2 text-gray-500" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      All Status
                    </div>
                  </SelectItem>
                  <SelectItem value="reported">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Reported
                    </div>
                  </SelectItem>
                  <SelectItem value="under-review">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Under Review
                    </div>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="resolved">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Resolved
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Rejected
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Issues List */}
        <div className="space-y-4">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => (
              <Card key={issue._id} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 truncate flex items-center gap-2">
                          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          {issue.title}
                        </h3>
                        <Badge className={`${getStatusColor(issue.status)} border flex items-center gap-1.5 px-3 py-1`}>
                          {getStatusIcon(issue.status)}
                          {issue.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">{issue.description}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                          <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{issue.location?.address || 'Unknown location'}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                          <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{formatDate(issue.createdAt)}</span>
                        </div>
                        {issue.comments?.length > 0 && (
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                            <MessageSquare className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            <span>{issue.comments.length} comments</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" asChild className="w-full sm:w-auto bg-white/50 hover:bg-white border-gray-200 hover:border-blue-300 transition-colors">
                      <Link href={`/issues/${issue._id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-6">
                  <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <Search className="w-10 h-10" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  No reports found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search criteria or filters to find what you\'re looking for'
                    : 'Start making a difference in your community by submitting your first report'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Link href="/issues/report">
                      <Star className="w-4 h-4 mr-2" />
                      Submit Your First Report
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
