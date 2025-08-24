'use client';

import { AlertCircle, Filter, Loader2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// UI Components
import IssueCard from '@/components/issues/IssueCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { useLanguage } from '@/lib/i18n/language-context';

// Format date for display
const formatDate = (dateString, locale) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return new Date(dateString).toLocaleDateString(locale === 'ne' ? 'ne-NP' : 'en-US', options);
};

// Status colors for badges
const STATUS_COLORS = {
  'reported': 'bg-orange-500',
  'under-review': 'bg-blue-500',
  'in-progress': 'bg-yellow-500',
  'resolved': 'bg-green-500',
  'rejected': 'bg-red-500',
};

// Format status for display - using t function passed from component
const formatStatus = (status, t) => {
  const statusMap = {
    'reported': t('issues.statuses.reported'),
    'under-review': t('issues.statuses.underReview'),
    'in-progress': t('issues.statuses.inProgress'),
    'resolved': t('issues.statuses.resolved'),
    'rejected': t('issues.statuses.rejected'),
  };
  return statusMap[status] || status;
};

// Format category for display - using t function passed from component
const formatCategory = (category, t) => {
  const categoryMap = {
    'pothole': t('issues.categories.roads'),
    'streetlight': t('issues.categories.electricity'),
    'garbage': t('issues.categories.sanitation'),
    'water': t('issues.categories.water'),
    'electricity': t('issues.categories.electricity'),
    'other': t('issues.categories.general'),
  };
  return categoryMap[category] || category;
};

export default function IssuesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { locale, t } = useLanguage();
  
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
              ? t('issues.myIssues')
              : t('issues.allIssues')}
          </h1>
          <p className="text-gray-500 mt-1">
            {pagination?.total
              ? `${pagination.total} ${pagination.total === 1 ? t('issues.issueFound') : t('issues.issuesFound')}`
              : `${Array.isArray(issues) ? issues.length : 0} ${Array.isArray(issues) && issues.length === 1 ? t('issues.issueFound') : t('issues.issuesFound')}`}
            {hasActiveFilters && ` ${t('issues.withCurrentFilters')}`}
            {pagination?.total > 0 && ` • ${t('issues.pageOf', { current: page, total: pagination.pages || 1 })}`}
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button 
            variant={hasActiveFilters ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {t('common.filter')}
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
              {t('issues.reportNewIssue')}
            </Button>
          )}
        </div>
      </div>
      
      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.status && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
              {t('issues.status')}: {formatStatus(filters.status, t)}
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
              {t('issues.category')}: {formatCategory(filters.category, t)}
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
              {t('common.search')}: {filters.searchTerm}
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
            {t('common.clearAll')}
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
            <IssueCard 
              key={issue._id} 
              issue={issue} 
              onDelete={(deletedId) => {
                setIssues(prevIssues => prevIssues.filter(issue => issue._id !== deletedId));
              }}
            />
          ))
        ) : (
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">{t('issues.noIssuesFound')}</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {hasActiveFilters
                ? t('issues.tryAdjustingFilters')
                : t('issues.noIssuesAtThisTime')}
            </p>
            
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleClearFilters}
              >
                {t('common.clearAll')}
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
                {t('common.previous')}
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
                {t('common.next')}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Filter dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('issues.filterIssues')}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="status-filter" className="text-sm font-medium">
                {t('issues.status')}
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({...filters, status: value})}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder={t('issues.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('issues.allStatuses')}</SelectItem>
                  <SelectItem value="reported">{t('issues.statuses.reported')}</SelectItem>
                  <SelectItem value="under-review">{t('issues.statuses.underReview')}</SelectItem>
                  <SelectItem value="in-progress">{t('issues.statuses.inProgress')}</SelectItem>
                  <SelectItem value="resolved">{t('issues.statuses.resolved')}</SelectItem>
                  <SelectItem value="rejected">{t('issues.statuses.rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category-filter" className="text-sm font-medium">
                {t('issues.category')}
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({...filters, category: value})}
              >
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder={t('issues.allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('issues.allCategories')}</SelectItem>
                  <SelectItem value="water">{t('issues.categories.water')}</SelectItem>
                  <SelectItem value="roads">{t('issues.categories.roads')}</SelectItem>
                  <SelectItem value="sanitation">{t('issues.categories.sanitation')}</SelectItem>
                  <SelectItem value="electricity">{t('issues.categories.electricity')}</SelectItem>
                  <SelectItem value="general">{t('issues.categories.general')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="search-filter" className="text-sm font-medium">
                {t('common.search')}
              </label>
              <Input
                id="search-filter"
                placeholder={t('issues.searchPlaceholder')}
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
              {t('common.reset')}
            </Button>
            
            <Button 
              onClick={() => handleApplyFilters(filters)}
            >
              {t('issues.applyFilters')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
