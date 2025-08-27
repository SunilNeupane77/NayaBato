'use client';

import { AlertCircle, Filter, Loader2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// UI Components
import IssueCard from '@/components/issues/IssueCard';
import { Badge } from '@/components/ui/badge';
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
  return t(`issues.categories.${category}`) || category;
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
      {/* Page header with gradient background */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {session?.user && !['admin', 'official'].includes(session.user.role)
                ? t('issues.myIssues')
                : t('issues.allIssues')}
            </h1>
            <p className="text-blue-100 mt-2">
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
              className="bg-white text-blue-800 hover:bg-blue-50 border-none"
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('common.filter')}
              {hasActiveFilters && (
                <Badge variant="outline" className="ml-2 bg-blue-600 text-white border-none">
                  {Object.values(filters).filter(Boolean).length}
                </Badge>
              )}
            </Button>
            
            {session?.user && (
              <Button
                onClick={() => router.push('/issues/report')}
                size="sm"
                className="bg-white text-blue-800 hover:bg-blue-50 border-none"
              >
                {t('issues.reportNewIssue')}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Active filters display with improved styling */}
      {hasActiveFilters && (
        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('issues.activeFilters')}</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 p-0 h-auto"
              onClick={handleClearFilters}
            >
              {t('common.clearAll')}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.status && (
              <Badge variant="secondary" className="pl-3 pr-1 py-1.5 flex items-center bg-white dark:bg-gray-700 shadow-sm">
                <span className="font-medium mr-1">{t('issues.status')}:</span> {formatStatus(filters.status, t)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 hover:bg-transparent p-0"
                  onClick={() => setFilters({ ...filters, status: '' })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.category && (
              <Badge variant="secondary" className="pl-3 pr-1 py-1.5 flex items-center bg-white dark:bg-gray-700 shadow-sm">
                <span className="font-medium mr-1">{t('issues.category')}:</span> {formatCategory(filters.category, t)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 hover:bg-transparent p-0"
                  onClick={() => setFilters({ ...filters, category: '' })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.searchTerm && (
              <Badge variant="secondary" className="pl-3 pr-1 py-1.5 flex items-center bg-white dark:bg-gray-700 shadow-sm">
                <span className="font-medium mr-1">{t('common.search')}:</span> {filters.searchTerm}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 hover:bg-transparent p-0"
                  onClick={() => setFilters({ ...filters, searchTerm: '' })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
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
      
      {/* Issues list with grid layout for larger screens */}
      <div className="space-y-6">
        {(isLoading && issues.length === 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden border border-gray-200 dark:border-gray-700">
                <IssueCardSkeleton />
              </Card>
            ))}
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {issues.map((issue) => (
              <IssueCard 
                key={issue._id} 
                issue={issue} 
                onDelete={(deletedId) => {
                  setIssues(prevIssues => prevIssues.filter(issue => issue._id !== deletedId));
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <AlertCircle className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200">{t('issues.noIssuesFound')}</h3>
              <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-md">
                {hasActiveFilters
                  ? t('issues.tryAdjustingFilters')
                  : t('issues.noIssuesAtThisTime')}
              </p>
              
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="mt-6 px-6"
                  onClick={handleClearFilters}
                >
                  {t('common.clearAll')}
                </Button>
              )}
              
              {!hasActiveFilters && session?.user && (
                <Button
                  className="mt-6 px-6"
                  onClick={() => router.push('/issues/report')}
                >
                  {t('issues.reportNewIssue')}
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Improved Pagination */}
        {issues.length > 0 && (
          <div className="mt-10 flex justify-center">
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-2">
              <div className="flex items-center justify-between space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1 || isLoading}
                  className="px-4 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t('common.previous')}
                </Button>
                
                <div className="hidden sm:flex items-center space-x-1 px-2">
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
                            variant={pageToShow === page ? "default" : "ghost"}
                            className={`w-10 h-10 rounded-full p-0 ${pageToShow === page ? 'bg-blue-600 text-white pointer-events-none' : ''}`}
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
                      className="w-10 h-10 rounded-full p-0 bg-blue-600 text-white pointer-events-none"
                    >
                      {page}
                    </Button>
                  )}
                  
                  {pagination && pagination.pages > 5 && page < pagination.pages - 2 && (
                    <>
                      <span className="text-gray-500 px-1">...</span>
                      <Button
                        variant="ghost"
                        className="w-10 h-10 rounded-full p-0"
                        onClick={() => setPage(pagination.pages)}
                        disabled={isLoading}
                      >
                        {pagination.pages}
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="sm:hidden flex items-center">
                  <span className="text-sm text-gray-500">
                    {t('issues.pageOf', { current: page, total: pagination.pages || 1 })}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={!hasMore || isLoading}
                  className="px-4 flex items-center"
                >
                  {t('common.next')}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced Filter dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <Filter className="h-5 w-5 mr-2 text-blue-600" />
              {t('issues.filterIssues')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="status-filter" className="text-sm font-medium flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                {t('issues.status')}
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({...filters, status: value})}
              >
                <SelectTrigger id="status-filter" className="border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder={t('issues.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('issues.allStatuses')}</SelectItem>
                  <div className="p-1 border-b border-gray-100">
                    <SelectItem value="reported" className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                      {t('issues.statuses.reported')}
                    </SelectItem>
                    <SelectItem value="under-review" className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                      {t('issues.statuses.underReview')}
                    </SelectItem>
                    <SelectItem value="in-progress" className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                      {t('issues.statuses.inProgress')}
                    </SelectItem>
                    <SelectItem value="resolved" className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      {t('issues.statuses.resolved')}
                    </SelectItem>
                    <SelectItem value="rejected" className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                      {t('issues.statuses.rejected')}
                    </SelectItem>
                  </div>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category-filter" className="text-sm font-medium flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                {t('issues.category')}
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({...filters, category: value})}
              >
                <SelectTrigger id="category-filter" className="border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder={t('issues.allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('issues.allCategories')}</SelectItem>
                  <div className="p-1 border-b border-gray-100">
                    <SelectItem value="water">{t('issues.categories.water')}</SelectItem>
                    <SelectItem value="roads">{t('issues.categories.roads')}</SelectItem>
                    <SelectItem value="sanitation">{t('issues.categories.sanitation')}</SelectItem>
                    <SelectItem value="electricity">{t('issues.categories.electricity')}</SelectItem>
                    <SelectItem value="general">{t('issues.categories.general')}</SelectItem>
                  </div>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="search-filter" className="text-sm font-medium flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                {t('common.search')}
              </label>
              <Input
                id="search-filter"
                placeholder={t('issues.searchPlaceholder')}
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <DialogFooter className="border-t border-gray-100 pt-4 flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="mt-3 sm:mt-0"
            >
              {t('common.reset')}
            </Button>
            
            <Button 
              onClick={() => handleApplyFilters(filters)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t('issues.applyFilters')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
