'use client';

import { MessageCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

// Import custom React Query hooks
import { useAddComment, useComments, useDeleteComment, useUpdateComment } from '@/lib/hooks/api';

/**
 * Comment section for an issue
 */
export default function CommentSection({ issueId }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  // Fetch comments using React Query
  const { 
    data, 
    isLoading, 
    error 
  } = useComments(issueId, {
    // Only fetch if we have an issueId
    enabled: !!issueId,
    // Don't refetch on window focus
    refetchOnWindowFocus: false
  });
  
  // Get comments array from the data
  const comments = data?.success ? data.comments : [];
  
  // Add comment mutation
  const addCommentMutation = useAddComment({
    onSuccess: (data) => {
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add comment. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Update comment mutation
  const updateCommentMutation = useUpdateComment({
    onSuccess: () => {
      toast({
        title: 'Comment updated',
        description: 'Your comment has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update comment. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Delete comment mutation
  const deleteCommentMutation = useDeleteComment({
    onSuccess: () => {
      toast({
        title: 'Comment deleted',
        description: 'The comment has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete comment. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Add a new comment handler
  const handleAddComment = (commentData) => {
    addCommentMutation.mutate(commentData);
  };

  // Update an existing comment handler
  const handleUpdateComment = (commentId, updateData) => {
    updateCommentMutation.mutate({ 
      id: commentId, 
      data: updateData
    });
  };

  // Delete a comment handler
  const handleDeleteComment = (commentId) => {
    deleteCommentMutation.mutate({ 
      id: commentId,
      issueId: issueId
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <MessageCircle className="mr-2" /> Comments
        </h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <MessageCircle className="mr-2" /> Comments
        </h2>
        <div className="text-red-500">{error.message || 'Failed to load comments'}</div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <MessageCircle className="mr-2" /> 
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>
      
      {/* Comment form - only show for authenticated users */}
      {session ? (
        <div className="mb-6">
          <CommentForm 
            onSubmit={handleAddComment}
            issueId={issueId}
            isSubmitting={addCommentMutation.isPending}
          />
        </div>
      ) : (
        <p className="mb-6 text-gray-500">
          Please sign in to post a comment.
        </p>
      )}
      
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem 
              key={comment._id}
              comment={comment}
              onDelete={handleDeleteComment}
              onUpdate={handleUpdateComment}
              isUpdating={updateCommentMutation.isPending && updateCommentMutation.variables?.id === comment._id}
              isDeleting={deleteCommentMutation.isPending && deleteCommentMutation.variables?.id === comment._id}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 italic">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
}
