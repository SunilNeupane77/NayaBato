import { AlertCircle, Send, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/**
 * Form for adding or editing comments
 */
export default function CommentForm({ 
  initialContent = '', 
  onSubmit, 
  onCancel,
  submitLabel = 'Post',
  issueId = null,
  placeholder = 'Add a comment...',
  isSubmitting = false
}) {
  const { data: session } = useSession();
  const [content, setContent] = useState(initialContent);
  const [isInternal, setIsInternal] = useState(false);
  
  // Check if user is an official (can add internal notes)
  const isOfficial = session?.user && ['admin', 'official'].includes(session.user.role);
  
  // Check if the form is valid
  const isValid = content.trim().length > 0 && content.length <= 1000;
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValid || isSubmitting) return;
    
    // Prepare data for submission
    const commentData = {
      content: content.trim()
    };
    
    // If this is a new comment, include the issue ID
    if (issueId) {
      commentData.issue = issueId;
    }
    
    // If the user is an official, include the internal flag
    if (isOfficial) {
      commentData.internal = isInternal;
    }
    
    // Submit data via parent component handler
    onSubmit(commentData);
    
    // Clear form if not editing
    if (!initialContent) {
      setContent('');
      setIsInternal(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-24 resize-y"
          disabled={isSubmitting}
        />
        <p className={`text-xs text-right ${content.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}>
          {content.length}/1000
        </p>
      </div>
      
      {/* Internal note checkbox for officials */}
      {isOfficial && (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="internal" 
            checked={isInternal}
            onCheckedChange={setIsInternal}
            disabled={isSubmitting}
          />
          <Label htmlFor="internal" className="text-sm font-medium">
            Mark as internal note (only visible to officials)
          </Label>
        </div>
      )}
      
      <div className="flex space-x-2 justify-end">
        {onCancel && (
          <Button 
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
        
        <Button 
          type="submit"
          disabled={!isValid || isSubmitting}
          className="relative"
        >
          {isSubmitting ? (
            <>
              <span className="opacity-0">
                <Send className="mr-2 h-4 w-4" />
                {submitLabel}
              </span>
              <span className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
      
      {content.length > 1000 && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Comment is too long. Please keep it under 1000 characters.</span>
        </div>
      )}
    </form>
  );
}
