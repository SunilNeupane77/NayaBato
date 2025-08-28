'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function BulkActions({ selectedIssues, onBulkAction, departments }) {
  const [action, setAction] = useState('');
  const [targetDept, setTargetDept] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBulkAction = async () => {
    if (!action || selectedIssues.length === 0) return;
    
    setLoading(true);
    try {
      await onBulkAction(action, selectedIssues, targetDept);
      setAction('');
      setTargetDept('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
      <span className="text-sm font-medium">
        {selectedIssues.length} selected
      </span>
      
      <Select value={action} onValueChange={setAction}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Action..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="assign">Assign</SelectItem>
          <SelectItem value="status-in-progress">Mark In Progress</SelectItem>
          <SelectItem value="status-resolved">Mark Resolved</SelectItem>
          <SelectItem value="priority-high">Set High Priority</SelectItem>
        </SelectContent>
      </Select>

      {action === 'assign' && (
        <Select value={targetDept} onValueChange={setTargetDept}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Department..." />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept._id} value={dept._id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button 
        onClick={handleBulkAction} 
        disabled={!action || loading || selectedIssues.length === 0}
      >
        Apply
      </Button>
    </div>
  );
}
