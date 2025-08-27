'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/i18n/language-context';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';
import { Calendar, MapPin, MoreHorizontal, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

// Format date for display
const formatDate = (dateString, locale) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return new Date(dateString).toLocaleDateString(locale === 'ne' ? 'ne-NP' : 'en-US', options);
};

// Format status for display
const formatStatus = (status, t) => {
  if (typeof t === 'function') {
    return t(`issues.statuses.${status}`) || status;
  }
  return status;
};

// Format category for display
const formatCategory = (category, t) => {
  if (typeof t === 'function') {
    return t(`issues.categories.${category}`) || category;
  }
  return category;
};

// Status colors for badges
const STATUS_COLORS = {
  'reported': 'bg-orange-500',
  'under-review': 'bg-blue-500',
  'in-progress': 'bg-yellow-500',
  'resolved': 'bg-green-500',
  'rejected': 'bg-red-500',
};

export default function IssueCard({ issue, onDelete }) {
  const { t, locale } = useLanguage();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isAdmin = session?.user?.role === 'admin';
  const isOfficial = session?.user?.role === 'official';
  const isResolved = issue?.status === 'resolved';
  const canDelete = isAdmin || (isOfficial && isResolved);

  const handleDelete = async () => {
    if (!canDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/issues/${issue._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete issue');
      }
      
      showSuccessToast(
        toast, 
        t('common.success'), 
        t('issues.deleteSuccess') || 'Issue deleted successfully'
      );
      
      if (onDelete) {
        onDelete(issue._id);
      }
    } catch (error) {
      showErrorToast(
        toast, 
        t('common.error') || 'Error', 
        error.message || 'Failed to delete issue'
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <Card 
      className={`transition-all duration-300 border border-gray-200 dark:border-gray-700 ${isHovered ? 'shadow-lg transform -translate-y-1' : 'hover:shadow-md'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Badge className={`${STATUS_COLORS[issue.status]} text-white px-3 py-1`}>
                  {formatStatus(issue.status, t)}
                </Badge>
                <span className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                  {formatCategory(issue.category, t)}
                </span>
              </div>
              
              {canDelete && (
                <div className="ml-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">{t('common.actions')}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('issues.deleteIssue')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            
            <Link href={`/issues/${issue._id}`}>
              <h2 className="text-xl font-semibold mb-2 hover:text-blue-600">{issue.title}</h2>
            </Link>
            
            <div className="text-sm text-gray-500 space-y-1">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {issue.location.address}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {t('issues.reportedOn')} {formatDate(issue.createdAt, locale)}
              </div>
            </div>
          </div>
          
          {issue.images && issue.images.length > 0 && (
            <div className="mt-4 md:mt-0 ml-0 md:ml-4">
              <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                {issue.images.length} {issue.images.length === 1 ? t('issues.image') : t('issues.images')}
              </div>
            </div>
          )}
        </div>
        
        {/* View issue buttons - visible on all screen sizes */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 truncate max-w-[150px]">
            {issue.description ? issue.description.substring(0, 60) + (issue.description.length > 60 ? '...' : '') : ''}
          </div>
          <div className="flex">
            <Link href={`/issues/${issue._id}`} passHref>
              <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                {t('common.viewDetails')}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('issues.deleteIssue')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('issues.deleteConfirmation')}
              {!isAdmin && isOfficial && (
                <div className="mt-2 text-sm font-medium text-amber-600">
                  {t('issues.deleteOnlyResolvedNote')}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? t('common.loading') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
