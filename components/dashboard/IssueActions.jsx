
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

export const IssueActions = ({ issue, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      toast({ title: 'Success', description: `Issue status updated to ${status}` });
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={loading}>
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleStatusUpdate('in-progress')}>Mark as In Progress</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusUpdate('resolved')}>Mark as Resolved</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusUpdate('rejected')}>Mark as Rejected</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
