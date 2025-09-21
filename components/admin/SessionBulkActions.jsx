'use client';

import { useState } from 'react';
import { Trash2, Power, Users } from 'lucide-react';

export default function SessionBulkActions({ selectedSessions, onBulkAction, onClearSelection }) {
  const [loading, setLoading] = useState(false);

  const handleBulkTerminate = async () => {
    if (!confirm(`Terminate ${selectedSessions.length} selected sessions?`)) return;
    
    setLoading(true);
    try {
      await Promise.all(
        selectedSessions.map(sessionId => 
          fetch(`/api/admin/sessions/${sessionId}`, { method: 'DELETE' })
        )
      );
      onBulkAction();
      onClearSelection();
    } catch (error) {
      console.error('Bulk terminate error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedSessions.length} selected sessions permanently?`)) return;
    
    setLoading(true);
    try {
      await Promise.all(
        selectedSessions.map(sessionId => 
          fetch(`/api/admin/sessions/${sessionId}`, { method: 'DELETE' })
        )
      );
      onBulkAction();
      onClearSelection();
    } catch (error) {
      console.error('Bulk delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedSessions.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {selectedSessions.length} session{selectedSessions.length > 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBulkTerminate}
            disabled={loading}
            className="flex items-center space-x-1 px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
          >
            <Power className="h-4 w-4" />
            <span>Terminate</span>
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={loading}
            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
          <button
            onClick={onClearSelection}
            className="px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
