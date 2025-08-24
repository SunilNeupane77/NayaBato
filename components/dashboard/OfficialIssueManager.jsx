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
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchIssues = async () => {
      if (!session?.user?.department) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/issues/department?department=${session.user.department}`);
        const data = await response.json();
        setIssues(data.issues || []);
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
  };

  const handleDelete = (issueId) => {
    setIssues((prevIssues) =>
      prevIssues.filter((issue) => issue._id !== issueId)
    );
    
    toast({
      title: t('common.success'),
      description: t('issues.issueRemoved'),
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{t('issues.manageDepartmentIssues')}</h2>
      <DataTable 
        columns={columns(handleStatusChange, handleDelete)} 
        data={issues} 
      />
    </div>
  );
}
