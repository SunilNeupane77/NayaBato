import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import CommentForm from './CommentForm';

/**
 * Single comment display component
 */
export default function CommentItem({ 
  comment, 
  onDelete, 
  onUpdate 
}) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  
  // Check if the current user is the author or an admin
  const isAuthor = session?.user?.id === comment.author?._id;
  const isAdmin = session?.user?.role === 'admin';
  const canEdit = isAuthor || isAdmin;
  const canDelete = isAuthor || isAdmin;
  
  // Format creation date
  const formattedDate = comment.createdAt ? 
    formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 
    'recently';
  
  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Handle comment deletion
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment._id);
    }
  };
  
  // Handle comment update
  const handleUpdate = (content) => {
    onUpdate(comment._id, { content });
    setIsEditing(false);
  };

  // If editing, show the comment form instead
  if (isEditing) {
    return (
      <Card className="p-4 mb-4">
        <CommentForm
          initialContent={comment.content}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          submitLabel="Update"
        />
      </Card>
    );
  }
  
  return (
    <Card className={`p-4 mb-4 ${comment.isInternal ? 'border-amber-400 bg-amber-50' : ''}`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.author?.image} />
          <AvatarFallback>{getInitials(comment.author?.name || 'User')}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{comment.author?.name}</span>
              
              {comment.author?.role !== 'citizen' && (
                <Badge variant="outline" className="text-xs">
                  {comment.author?.role === 'admin' ? 'Administrator' : 'Official'}
                </Badge>
              )}
              
              {comment.isInternal && (
                <Tooltip content="Only visible to officials">
                  <span className="flex items-center text-amber-600 text-xs">
                    <AlertCircle size={14} className="mr-1" />
                    Internal Note
                  </span>
                </Tooltip>
              )}
            </div>
            
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>
          
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-2">{comment.content}</div>
          
          {(canEdit || canDelete) && (
            <div className="flex justify-end gap-2 mt-2">
              {canEdit && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="h-8 px-2"
                >
                  <Edit2 size={16} className="mr-1" />
                  Edit
                </Button>
              )}
              
              {canDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDelete}
                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
