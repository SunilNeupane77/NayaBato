'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import WardDashboard from '@/components/dashboard/WardDashboard';
import DepartmentDashboard from '@/components/dashboard/DepartmentDashboard';
import { Building, MapPin } from 'lucide-react';

export default function OfficialDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('wards');

  if (status === 'loading') return <div>Loading...</div>;
  
  if (!session || session.user.role !== 'official') {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Official Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session.user.name}</p>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('wards')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'wards'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MapPin className="inline-block w-4 h-4 mr-2" />
                My Wards
              </button>
              <button
                onClick={() => setActiveTab('departments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'departments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building className="inline-block w-4 h-4 mr-2" />
                My Department
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'wards' && <WardDashboard />}
        {activeTab === 'departments' && <DepartmentDashboard />}
      </div>
    </div>
  );
}
