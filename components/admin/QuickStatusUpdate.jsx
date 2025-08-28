'use client';

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateIssue } from '@/lib/hooks/api';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'reported', label: 'Reported', color: 'bg-orange-500' },
  { value: 'under-review', label: 'Under Review', color: 'bg-blue-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-500' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' }
];

export default function QuickStatusUpdate({ issue, onUpdate }) {
  const [newStatus, setNewStatus] = useState(issue.status);
  const [newPriority, setNewPriority] = useState(issue.priority || 'medium');
  const [isUpdating, setIsUpdating] = useState(false);
  const updateIssue = useUpdateIssue();
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (newStatus === issue.status && newPriority === (issue.priority || 'medium')) return;
    
    setIsUpdating(true);
    try {
      const updateData = {};
      if (newStatus !== issue.status) updateData.status = newStatus;
      if (newPriority !== (issue.priority || 'medium')) updateData.priority = newPriority;
      
      await updateIssue.mutateAsync({ 
        id: issue._id, 
        data: updateData
      });
      
      toast({
        title: 'Issue Updated',
        description: `Issue updated successfully`
      });
      
      onUpdate?.();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Failed to update issue'
      });
      setNewStatus(issue.status);
      setNewPriority(issue.priority || 'medium');
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = newStatus !== issue.status || newPriority !== (issue.priority || 'medium');

  return (
    <div className="flex items-center gap-2">
      <Select value={newStatus} onValueChange={setNewStatus}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${option.color}`} />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={newPriority} onValueChange={setNewPriority}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${option.color}`} />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {hasChanges && (
        <Button 
          size="sm" 
          onClick={handleUpdate}
          disabled={isUpdating}
        >
          {isUpdating && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
          Update
        </Button>
      )}
    </div>
  );
}
