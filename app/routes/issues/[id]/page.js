'use client';

import { cn } from '@/lib/utils';
import { Calendar, Clock, Loader2, MapPin, Tag, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Dynamically import map component to avoid SSR issues with Leaflet
const IssueLocationMap = dynamic(() => import('@/components/maps/IssueLocationMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-100 animate-pulse rounded-md"></div>
});

// Format date helper
const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format status helper
const formatStatus = (status) => {
  const map = {
    'reported': 'Reported',
    'under-review': 'Under Review',
    'in-progress': 'In Progress',
    'resolved': 'Resolved',
    'rejected': 'Not Actionable',
  };
  return map[status] || status;
};

// Format category helper
const formatCategory = (category) => {
  const map = {
    'pothole': 'Road/Pothole',
    'streetlight': 'Streetlight',
    'garbage': 'Garbage',
    'water': 'Water Issue',
    'electricity': 'Electricity',
    'other': 'Other',
  };
  return map[category] || category;
};

// Status badge component
const StatusBadge = ({ status }) => {
  return (
    <span className={cn(
      "px-3 py-1 inline-flex text-sm font-medium rounded-full",
      {
        'bg-orange-100 text-orange-800': status === 'reported',
        'bg-blue-100 text-blue-800': status === 'under-review',
        'bg-yellow-100 text-yellow-800': status === 'in-progress',
        'bg-green-100 text-green-800': status === 'resolved',
        'bg-red-100 text-red-800': status === 'rejected',
      }
    )}>
      {formatStatus(status)}
    </span>
  );
};

export default function IssueDetail({ params }) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const { id } = params;

  useEffect(() => {
    // Fetch issue details
    const fetchIssueDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/issues/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to load issue details');
        }
        
        const data = await response.json();
        setIssue(data.issue);
        if (data.issue?.status) {
          setUpdateStatus(data.issue.status);
        }
      } catch (err) {
        console.error('Error fetching issue details:', err);
        setError(err.message || 'Failed to load issue details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIssueDetails();
    }
  }, [id]);

  // Handle status update
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      return;
    }
    
    try {
      setUpdateLoading(true);
      
      const response = await fetch(`/api/issues/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: updateStatus,
          notes
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Refresh issue data
      const data = await response.json();
      setIssue(data.issue);
      setNotes('');
      
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Show error state
  if (error || !issue) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="text-red-500 text-lg mb-4">
          Error: {error || 'Issue not found'}
        </div>
        <button 
          onClick={() => router.push('/issues')} 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Back to Issues
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <a 
          onClick={() => router.back()} 
          className="text-blue-500 hover:underline cursor-pointer"
        >
          &larr; Back
        </a>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        {/* Issue header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
            <h1 className="text-2xl font-bold mb-2 md:mb-0">{issue.title}</h1>
            <StatusBadge status={issue.status} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span>Reported: {formatDate(issue.createdAt)}</span>
            </div>
            
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span>Reporter: {issue.reporter?.name || 'Anonymous'}</span>
            </div>
            
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 text-gray-500" />
              <span>Category: {formatCategory(issue.category)}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span className="truncate">{issue.location?.address}</span>
            </div>
          </div>
        </div>
        
        {/* Issue details */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left column: Description and status history */}
            <div className="lg:col-span-3">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-md mb-8">
                <p className="whitespace-pre-wrap">{issue.description}</p>
              </div>
              
              <h2 className="text-xl font-semibold mb-3">Status History</h2>
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-3.5 w-px bg-gray-200 dark:bg-gray-700"></div>
                <ul className="space-y-4 ml-2">
                  {issue.statusHistory?.map((item, index) => (
                    <li key={index} className="relative pl-8">
                      <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 flex items-center justify-center">
                        <Clock className="h-3 w-3 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">{formatStatus(item.status)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(item.updatedAt)}
                          {item.updatedBy && 
                            <span> by {item.updatedBy.name || 'System'}</span>
                          }
                        </p>
                        {item.notes && (
                          <p className="text-sm mt-1">{item.notes}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Right column: Images and map */}
            <div className="lg:col-span-2">
              {/* Issue images */}
              <h2 className="text-xl font-semibold mb-3">Images</h2>
              <div className="grid grid-cols-1 gap-4 mb-6">
                {issue.images && issue.images.length > 0 ? (
                  issue.images.map((image, index) => (
                    <div key={index} className="relative aspect-[4/3] rounded-md overflow-hidden">
                      <Image 
                        src={image.url} 
                        alt={`Issue image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-100 dark:bg-slate-900 rounded-md p-4 text-center">
                    No images available
                  </div>
                )}
              </div>
              
              {/* Issue location map */}
              <h2 className="text-xl font-semibold mb-3">Location</h2>
              <div className="h-64 rounded-md overflow-hidden">
                {issue.location?.coordinates?.coordinates && (
                  <IssueLocationMap 
                    longitude={issue.location.coordinates.coordinates[0]}
                    latitude={issue.location.coordinates.coordinates[1]}
                    address={issue.location.address}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Status update form for admins and officials */}
        {session && ['admin', 'official'].includes(session.user.role) && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-3">Update Status</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-2">
                    New Status
                  </label>
                  <select
                    id="status"
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 dark:bg-slate-900"
                    required
                  >
                    <option value="reported">Reported</option>
                    <option value="under-review">Under Review</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Not Actionable</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-2">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add additional information about this status change"
                    className="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 dark:bg-slate-900"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={updateLoading || issue.status === updateStatus}
                className={cn(
                  "px-4 py-2 bg-blue-600 text-white rounded-md",
                  "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  (updateLoading || issue.status === updateStatus) ? "opacity-50 cursor-not-allowed" : ""
                )}
              >
                {updateLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Update Status"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
