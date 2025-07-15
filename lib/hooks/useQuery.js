'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook for fetching data from API
 * @param {string} key - The query key
 * @param {string} url - The API endpoint
 * @param {object} options - Additional options for useQuery
 * @returns {object} - The query result
 */
export function useFetchData(key, url, options = {}) {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    ...options,
  });
}

/**
 * Custom hook for creating data
 * @param {string} key - The query key to invalidate after mutation
 * @param {string} url - The API endpoint
 * @param {object} options - Additional options for useMutation
 * @returns {object} - The mutation result
 */
export function useCreateData(key, url, options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create data');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
    },
    ...options,
  });
}

/**
 * Custom hook for updating data
 * @param {string} key - The query key to invalidate after mutation
 * @param {string} url - The API endpoint
 * @param {object} options - Additional options for useMutation
 * @returns {object} - The mutation result
 */
export function useUpdateData(key, url, options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`${url}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update data');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
      
      // Update the specific item in the cache if needed
      if (options.updateItem) {
        queryClient.setQueryData([key, variables.id], (oldData) => {
          return { ...oldData, ...data };
        });
      }
    },
    ...options,
  });
}

/**
 * Custom hook for deleting data
 * @param {string} key - The query key to invalidate after mutation
 * @param {string} url - The API endpoint
 * @param {object} options - Additional options for useMutation
 * @returns {object} - The mutation result
 */
export function useDeleteData(key, url, options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${url}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete data');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
    },
    ...options,
  });
}
