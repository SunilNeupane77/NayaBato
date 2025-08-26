import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/i18n/language-context';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';

export default function OfficialIssueManager() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    reported: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0
  });
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchIssues = async () => {
      if (!session?.user) return;
      setLoading(true);
      try {
        // If department is available, filter by department, otherwise get issues assigned to official
        const endpoint = session?.user?.department 
          ? `/api/issues/department?department=${encodeURIComponent(session.user.department)}`
          : '/api/issues?official=true';
        
        const response = await fetch(endpoint);
        const data = await response.json();
        const fetchedIssues = data.issues || [];
        setIssues(fetchedIssues);
        
        // Calculate statistics from issues
        const newStats = {
          total: fetchedIssues.length,
          reported: fetchedIssues.filter(issue => issue.status === 'reported').length,
          underReview: fetchedIssues.filter(issue => issue.status === 'under-review').length,
          inProgress: fetchedIssues.filter(issue => issue.status === 'in-progress').length,
          resolved: fetchedIssues.filter(issue => issue.status === 'resolved').length,
          rejected: fetchedIssues.filter(issue => issue.status === 'rejected').length
        };
        setStats(newStats);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
        toast({
          variant: 'destructive',
          title: t('common.error'),
          description: t('issues.fetchError'),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [session, toast, t]);

  const handleStatusChange = (issueId, newStatus) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue._id === issueId ? { ...issue, status: newStatus } : issue
      )
    );
    
    // Update stats when status changes
    const updatedIssue = issues.find(issue => issue._id === issueId);
    if (updatedIssue) {
      const oldStatus = updatedIssue.status;
      setStats(prev => {
        const updated = { ...prev };
        
        // Decrement the old status count
        if (oldStatus === 'reported') updated.reported -= 1;
        else if (oldStatus === 'under-review') updated.underReview -= 1;
        else if (oldStatus === 'in-progress') updated.inProgress -= 1;
        else if (oldStatus === 'resolved') updated.resolved -= 1;
        else if (oldStatus === 'rejected') updated.rejected -= 1;
        
        // Increment the new status count
        if (newStatus === 'reported') updated.reported += 1;
        else if (newStatus === 'under-review') updated.underReview += 1;
        else if (newStatus === 'in-progress') updated.inProgress += 1;
        else if (newStatus === 'resolved') updated.resolved += 1;
        else if (newStatus === 'rejected') updated.rejected += 1;
        
        return updated;
      });
    }
  };

  const handleDelete = (issueId) => {
    // Find the issue before removing it to update stats
    const issueToDelete = issues.find(issue => issue._id === issueId);
    
    setIssues((prevIssues) =>
      prevIssues.filter((issue) => issue._id !== issueId)
    );
    
    // Update stats when an issue is deleted
    if (issueToDelete) {
      setStats(prev => {
        const updated = { ...prev };
        updated.total -= 1;
        
        if (issueToDelete.status === 'reported') updated.reported -= 1;
        else if (issueToDelete.status === 'under-review') updated.underReview -= 1;
        else if (issueToDelete.status === 'in-progress') updated.inProgress -= 1;
        else if (issueToDelete.status === 'resolved') updated.resolved -= 1;
        else if (issueToDelete.status === 'rejected') updated.rejected -= 1;
        
        return updated;
      });
    }
    
    toast({
      title: t('common.success'),
      description: t('issues.issueRemoved'),
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome header with user info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{t('navigation.dashboard')}</h1>
        <p className="opacity-80">
          {t('common.welcome')}, {session?.user?.name || t('common.official')}
          {session?.user?.department && ` | ${session?.user?.department}`}
        </p>
      </div>
      
      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
          <p className="text-sm text-gray-500 mb-1">{t('issues.totalIssues')}</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
          <p className="text-sm text-gray-500 mb-1">{t('issues.statuses.reported')}</p>
          <p className="text-2xl font-bold text-amber-500">{stats.reported}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 mb-1">{t('issues.statuses.inProgress')}</p>
          <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 mb-1">{t('issues.statuses.resolved')}</p>
          <p className="text-2xl font-bold text-green-500">{stats.resolved}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-500 mb-1">{t('issues.statuses.rejected')}</p>
          <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
        </div>
      </div>
      
      {/* Issues management section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">{t('issues.manageDepartmentIssues')}</h2>
        <DataTable 
          columns={columns(handleStatusChange, handleDelete)} 
          data={issues} 
        />
      </div>
    </div>
  );
}
