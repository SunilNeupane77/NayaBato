'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Safely parse JSON response, handling empty responses
 * @param {Response} response - The fetch Response object
 * @returns {Promise<object>} - Parsed JSON or empty object
 */
async function safeParseJSON(response) {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (e) {
    console.error("Failed to parse response:", e);
    return {}; // Return empty object as fallback
  }
}

/**
 * Safely handle error response
 * @param {Response} response - The fetch Response object
 * @throws {Error} - With appropriate error message
 */
async function handleErrorResponse(response) {
  try {
    const errorText = await response.text();
    const errorData = errorText ? JSON.parse(errorText) : { message: 'Unknown error' };
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  } catch (e) {
    throw new Error(`Request failed with status ${response.status}`);
  }
}

/**
 * Custom hook for fetching issues
 * @param {object} params - Query parameters
 * @param {object} options - Additional options for useQuery
 * @returns {object} - The query result with issues array
 */
export function useIssues(params = {}, options = {}) {
  // Convert params to query string
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  const result = useQuery({
    queryKey: ['issues', params],
    queryFn: async () => {
      const response = await fetch(`/api/issues${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to fetch issues');
      }
      const data = await response.json();
      return data;
    },
    ...options,
  });
  
  // Extract issues array from the data and provide it directly
  const issues = result.data?.success ? result.data.issues || [] : [];
  
  // Calculate hasMore based on pagination
  const pagination = result.data?.pagination || {};
  const hasMore = pagination.page < pagination.pages;
  const totalItems = pagination.total || 0;
  const totalPages = pagination.pages || 0;
  
  return {
    ...result,
    issues,
    hasMore,
    pagination: {
      ...pagination,
      totalItems,
      totalPages
    },
  };
}

/**
 * Custom hook for fetching a single issue
 * @param {string} id - The issue ID
 * @param {object} options - Additional options for useQuery
 * @returns {object} - The query result
 */
export function useIssue(id, options = {}) {
  const result = useQuery({
    queryKey: ['issue', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/issues/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch issue');
      }
      return response.json();
    },
    ...options,
  });

  // Extract issue object from the API response
  const issue = result.data?.success ? result.data.issue : null;

  return {
    ...result,
    issue,
  };
}

/**
 * Custom hook for creating an issue
 * @param {object} options - Additional options for useMutation
 * @returns {object} - The mutation result
 */
export function useCreateIssue(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData) => {
      // Handle FormData correctly (don't try to stringify it)
      const response = await fetch('/api/issues', {
        method: 'POST',
        body: formData, // Send FormData as is, without headers
      });
      
      if (!response.ok) {
        await handleErrorResponse(response);
      }
      
      return safeParseJSON(response);
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
    ...options,
  });
}

/**
 * Custom hook for updating an issue
 * @param {object} options - Additional options for useMutation
 * @returns {object} - The mutation result
 */
export function useUpdateIssue(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/issues/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        // Safely handle error response that might be empty
        try {
          const errorText = await response.text();
          const errorData = errorText ? JSON.parse(errorText) : { message: 'Unknown error' };
          throw new Error(errorData.message || 'Failed to update issue');
        } catch (e) {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }
      
      // Safely parse JSON response
      try {
        const text = await response.text();
        return text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Failed to parse response:", e);
        return {}; // Return empty object as fallback
      }
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries(['issue', id]);

      const previousIssue = queryClient.getQueryData(['issue', id]);

      queryClient.setQueryData(['issue', id], (old) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousIssue };
    },
    onError: (err, { id }, context) => {
      if (context.previousIssue) {
        queryClient.setQueryData(['issue', id], context.previousIssue);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries(['issue', id]);
      queryClient.invalidateQueries(['issues']);
    },
    ...options,
  });
}

/**
 * Custom hook for fetching comments for an issue
 * @param {string} issueId - The issue ID
 * @param {object} options - Additional options for useQuery
 * @returns {object} - The query result
 */
export function useComments(issueId, options = {}) {
  return useQuery({
    queryKey: ['comments', issueId],
    queryFn: async () => {
      if (!issueId) return [];
      const res = await fetch(`/api/comments?issue=${issueId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch comments');
      }
      return res.json();
    },
    ...options,
  });
}

/**
 * Custom hook for adding a comment
 * @param {object} options - Additional options for useMutation
 * @returns {object} - The mutation result
 */
export function useAddComment(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        await handleErrorResponse(res);
      }
      
      return safeParseJSON(res);
    },
    onSuccess: (data, variables) => {
      // Invalidate comments for the specific issue
      queryClient.invalidateQueries({ queryKey: ['comments', variables.issue] });
    },
    ...options,
  });
}

/**
 * Custom hook for updating a comment
 * @param {object} options - Additional options for useMutation
 * @returns {object} - The mutation result
 */
export function useUpdateComment(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        await handleErrorResponse(res);
      }
      
      return safeParseJSON(res);
    },
    onSuccess: (data, variables) => {
      // Invalidate comments for the specific issue
      if (data.issue) {
        queryClient.invalidateQueries({ queryKey: ['comments', data.issue] });
      }
    },
    ...options,
  });
}

/**
 * Custom hook for deleting a comment
 * @param {object} options - Additional options for useMutation
 * @returns {object} - The mutation result
 */
export function useDeleteComment(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, issueId }) => {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        await handleErrorResponse(res);
      }
      
      return safeParseJSON(res);
    },
    onSuccess: (data, variables) => {
      // Invalidate comments for the specific issue
      queryClient.invalidateQueries({ queryKey: ['comments', variables.issueId] });
    },
    ...options,
  });
}

/**
 * Custom hook for fetching admin dashboard statistics
 * @param {object} options - Additional options for useQuery
 * @returns {object} - The query result
 */
export function useAdminStats(options = {}) {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }
      return response.json();
    },
    ...options,
  });
}

/**
 * Custom hook for fetching user profile data
 * @param {string} userId - The user ID
 * @param {object} options - Additional options for useQuery
 * @returns {object} - The query result
 */
export function useUserProfile(userId, options = {}) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/users/profile?id=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      return response.json();
    },
    ...options,
  });
}

/**
 * Custom hook for fetching departments
 * @param {object} options - Additional options for useQuery
 * @returns {object} - The query result
 */
export function useDepartments(options = {}) {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      return response.json();
    },
    ...options,
  });
}
