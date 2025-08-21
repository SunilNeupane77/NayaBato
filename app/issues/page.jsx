'use client';

import { AlertCircle, Calendar, Filter, Loader2, MapPin, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { IssueCardSkeleton } from '@/components/ui/skeleton';

// Custom hooks for data fetching
import { useIssues } from '@/lib/hooks/api';

// Format date for display
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Status colors for badges
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

export default function IssuesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // State variables
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    searchTerm: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  
  // Query issues using custom hook
  const {
    issues = [], // Provide a default empty array
    isLoading,
    isError,
    error,
    hasMore = false,
    pagination = {},
    refetch,
  } = useIssues({
    status: filters.status,
    category: filters.category,
    searchTerm: filters.searchTerm,
    page,
    limit: 10,
    reporter: session?.user && !['admin', 'official'].includes(session.user.role) ? session.user.id : undefined,
  });
  
  // Refetch issues when filters or page change
  useEffect(() => {
    refetch();
  }, [filters, page, refetch]);
  
  // Apply filters and reset page
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
    setShowFilters(false);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      status: '',
      category: '',
      searchTerm: '',
    });
    setPage(1);
  };
  
  // Load more issues
  const handleLoadMore = () => {
    if (hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };
  
  // Determine if any filters are active
  const hasActiveFilters = filters.status || filters.category || filters.searchTerm;
  
  // Show loading state on initial load
  if (status === 'loading' || (isLoading && page === 1)) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            {session?.user && !['admin', 'official'].includes(session.user.role)
              ? 'My Issues'
              : 'All Issues'}
          </h1>
          <p className="text-gray-500 mt-1">
            {pagination?.total
              ? `${pagination.total} ${pagination.total === 1 ? 'issue' : 'issues'} found`
              : `${Array.isArray(issues) ? issues.length : 0} ${Array.isArray(issues) && issues.length === 1 ? 'issue' : 'issues'} found`}
            {hasActiveFilters && ' with current filters'}
            {pagination?.total > 0 && ` • Page ${page} of ${pagination.pages || 1}`}
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button 
            variant={hasActiveFilters ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <Badge variant="outline" className="ml-2 bg-white">
                {Object.values(filters).filter(Boolean).length}
              </Badge>
            )}
          </Button>
          
          {session?.user && (
            <Button
              onClick={() => router.push('/issues/report')}
              size="sm"
            >
              Report New Issue
            </Button>
          )}
        </div>
      </div>
      
      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.status && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
              Status: {formatStatus(filters.status)}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 hover:bg-transparent"
                onClick={() => setFilters({ ...filters, status: '' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.category && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
              Category: {formatCategory(filters.category)}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 hover:bg-transparent"
                onClick={() => setFilters({ ...filters, category: '' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.searchTerm && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
              Search: {filters.searchTerm}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 hover:bg-transparent"
                onClick={() => setFilters({ ...filters, searchTerm: '' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            onClick={handleClearFilters}
          >
            Clear all filters
          </Button>
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Issues list */}
      <div className="space-y-6">
        {(isLoading && issues.length === 0) ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <IssueCardSkeleton />
            </Card>
          ))
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error.message}</p>
              </div>
            </div>
          </div>
        ) : Array.isArray(issues) && issues.length > 0 ? (
          issues.map((issue) => (
            <Link
              href={`/issues/${issue._id}`}
              key={issue._id}
              className="block"
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <Badge className={`${STATUS_COLORS[issue.status]} text-white mr-2`}>
                          {formatStatus(issue.status)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatCategory(issue.category)}
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-semibold mb-2">{issue.title}</h2>
                      
                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {issue.location.address}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Reported {formatDate(issue.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    {issue.images && issue.images.length > 0 && (
                      <div className="mt-4 md:mt-0 ml-0 md:ml-4">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                          {issue.images.length} {issue.images.length === 1 ? 'image' : 'images'}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">No issues found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'There are no issues to display at this time'}
            </p>
            
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {issues.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center justify-between space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1 || isLoading}
                className="px-3"
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-2">
                {pagination && pagination.pages ? (
                  [...Array(Math.min(5, pagination.pages))].map((_, idx) => {
                    // Show 2 pages before and 2 pages after current page
                    const pageToShow = page <= 3
                      ? idx + 1
                      : page >= pagination.pages - 2
                        ? pagination.pages - 4 + idx
                        : page - 2 + idx;
                    
                    if (pageToShow > 0 && pageToShow <= pagination.pages) {
                      return (
                        <Button
                          key={pageToShow}
                          variant={pageToShow === page ? "default" : "outline"}
                          className={`w-9 h-9 p-0 ${pageToShow === page ? 'pointer-events-none' : ''}`}
                          onClick={() => setPage(pageToShow)}
                          disabled={isLoading}
                        >
                          {pageToShow}
                        </Button>
                      );
                    }
                    return null;
                  })
                ) : (
                  <Button
                    variant="default"
                    className="w-9 h-9 p-0 pointer-events-none"
                  >
                    {page}
                  </Button>
                )}
                
                {pagination && pagination.pages > 5 && page < pagination.pages - 2 && (
                  <>
                    <span className="text-gray-500">...</span>
                    <Button
                      variant="outline"
                      className="w-9 h-9 p-0"
                      onClick={() => setPage(pagination.pages)}
                      disabled={isLoading}
                    >
                      {pagination.pages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setPage(prev => prev + 1)}
                disabled={!hasMore || isLoading}
                className="px-3"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Filter dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Issues</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="status-filter" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({...filters, status: value})}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category-filter" className="text-sm font-medium">
                Category
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({...filters, category: value})}
              >
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="roads">Roads</SelectItem>
                  <SelectItem value="sanitation">Sanitation</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="search-filter" className="text-sm font-medium">
                Search
              </label>
              <Input
                id="search-filter"
                placeholder="Search by title or description"
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleClearFilters}
            >
              Reset
            </Button>
            
            <Button 
              onClick={() => handleApplyFilters(filters)}
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
