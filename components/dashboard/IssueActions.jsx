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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/i18n/language-context';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export const IssueActions = ({ issue, onStatusChange, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();
  const { t } = useLanguage();

  const isAdmin = session?.user?.role === 'admin';
  const isOfficial = session?.user?.role === 'official';
  const isResolved = issue?.status === 'resolved';
  const canDelete = isAdmin || (isOfficial && isResolved);

  const handleStatusUpdate = async (status) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/issues/${issue._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      onStatusChange(issue._id, status);
      toast({ 
        title: t('common.success') || 'Success', 
        description: t('issues.statusUpdated', { status }) || `Status updated to ${status}` 
      });
    } catch (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/issues/${issue._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete issue');
      }
      
      toast({ 
        title: t('common.success') || 'Success', 
        description: t('issues.deleteSuccess') || 'Issue deleted successfully' 
      });
      
      if (onDelete) {
        onDelete(issue._id);
      }
    } catch (error) {
      toast({ 
        title: t('common.error') || 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={loading}>
            {t('common.actions')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleStatusUpdate('in-progress')}>{t('issues.markInProgress') || 'Mark as In Progress'}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate('resolved')}>{t('issues.markResolved') || 'Mark as Resolved'}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate('rejected')}>{t('issues.markRejected') || 'Mark as Rejected'}</DropdownMenuItem>
          
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600 focus:text-red-600"
              >
                {t('issues.deleteIssue')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('issues.deleteIssue') || 'Delete Issue'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('issues.deleteConfirmation') || 'Are you sure you want to delete this issue? This action cannot be undone.'}
              {!isAdmin && isOfficial && (
                <div className="mt-2 text-sm font-medium text-amber-600">
                  {t('issues.deleteOnlyResolvedNote') || 'As an official, you can only delete resolved issues.'}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel') || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (t('common.loading') || 'Loading...') : (t('common.delete') || 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
