'use client';

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function WeeklyDigestButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendWeeklyDigest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/email/weekly-digest', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Weekly Digest Sent',
          description: data.message
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send Digest',
        description: error.message || 'Something went wrong'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={sendWeeklyDigest} 
      disabled={isLoading}
      className="bg-purple-600 hover:bg-purple-700"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Mail className="w-4 h-4 mr-2" />
      )}
      Send Weekly Digest
    </Button>
  );
}
