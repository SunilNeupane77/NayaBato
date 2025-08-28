'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function IssueAssignment({ issue, departments, onAssign }) {
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedDept) return;
    
    setLoading(true);
    try {
      await onAssign(issue._id, selectedDept);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={issue.assignedTo ? 'default' : 'secondary'}>
        {issue.assignedTo?.name || 'Unassigned'}
      </Badge>
      
      <Select value={selectedDept} onValueChange={setSelectedDept}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Assign to..." />
        </SelectTrigger>
        <SelectContent>
          {departments.map(dept => (
            <SelectItem key={dept._id} value={dept._id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        size="sm" 
        onClick={handleAssign} 
        disabled={!selectedDept || loading}
      >
        Assign
      </Button>
    </div>
  );
}
