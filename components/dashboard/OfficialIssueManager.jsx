
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { DataTable } from './data-table';
import { columns } from './columns';
import { Loader2 } from 'lucide-react';

export default function OfficialIssueManager() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [session]);

  const handleStatusChange = (issueId, newStatus) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue._id === issueId ? { ...issue, status: newStatus } : issue
      )
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Department Issues</h2>
      <DataTable columns={columns(handleStatusChange)} data={issues} />
    </div>
  );
}
