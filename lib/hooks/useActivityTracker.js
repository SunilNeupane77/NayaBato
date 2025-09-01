import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';

export function useActivityTracker() {
  const { data: session } = useSession();
  const router = useRouter();

  const trackActivity = useCallback(async (action, resource = null, metadata = {}) => {
    if (!session?.user) return;

    try {
      await fetch('/api/admin/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          resource,
          page: window.location.pathname,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            url: window.location.href
          }
        })
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, [session]);

  // Track page views
  useEffect(() => {
    if (session?.user) {
      trackActivity('page_view', null, {
        referrer: document.referrer,
        userAgent: navigator.userAgent
      });
    }
  }, [router.pathname, session, trackActivity]);

  // Track user interactions
  const trackClick = useCallback((element, metadata = {}) => {
    trackActivity('click', null, { element, ...metadata });
  }, [trackActivity]);

  const trackSearch = useCallback((query, results = 0) => {
    trackActivity('search_performed', null, { query, results });
  }, [trackActivity]);

  const trackIssueAction = useCallback((action, issueId, metadata = {}) => {
    trackActivity(action, { type: 'issue', resourceId: issueId }, metadata);
  }, [trackActivity]);

  const trackCommentAction = useCallback((commentId, metadata = {}) => {
    trackActivity('comment_added', { type: 'comment', resourceId: commentId }, metadata);
  }, [trackActivity]);

  return {
    trackActivity,
    trackClick,
    trackSearch,
    trackIssueAction,
    trackCommentAction
  };
}

export default useActivityTracker;
