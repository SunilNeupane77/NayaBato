'use client';

import { AlertTriangle, BarChart, FileText, MapPin, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useToast } from '@/components/ui/use-toast';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  // Check authorization for admin and official roles
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/dashboard');
    } else if (status === 'authenticated' && !['admin', 'official'].includes(session?.user?.role)) {
      toast({
        title: "Access Denied",
        description: "Only administrators and officials can access this area.",
        variant: "destructive"
      });
      router.push('/');
    }
  }, [status, session, router, toast]);
  
  // Don't render anything if not authorized
  if (status !== 'authenticated' || !['admin', 'official'].includes(session?.user?.role)) {
    return null;
  }
  
  // Helper function to check if a link is active
  const isActive = (path) => pathname === path;
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">{session?.user?.role === 'admin' ? 'Admin Panel' : 'Management Panel'}</h1>
          <p className="text-gray-400 text-sm">Manage the platform</p>
        </div>
        
        <nav className="mt-6">
          <ul className="space-y-1">
            <li>
              <Link
                href="/admin/dashboard"
                className={`block px-4 py-2 ${
                  isActive('/admin/dashboard')
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 mr-3" />
                  <span>Dashboard</span>
                </div>
              </Link>
            </li>
            
            {/* Admin-only menu items */}
            {session?.user?.role === 'admin' && (
              <>
                <li>
                  <Link
                    href="/admin/users"
                    className={`block px-4 py-2 ${
                      isActive('/admin/users')
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-3" />
                      <span>User Management</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/audit"
                    className={`block px-4 py-2 ${
                      isActive('/admin/audit')
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3" />
                      <span>Audit Logs</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/wards"
                    className={`block px-4 py-2 ${
                      isActive('/admin/wards')
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-3" />
                      <span>Ward Management</span>
                    </div>
                  </Link>
                </li>
              </>
            )}
            
            {/* Common menu items for all roles */}
            <li>
              <Link
                href="/issues"
                className={`block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white`}
              >
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-3" />
                  <span>Issues</span>
                </div>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 bg-gray-100">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
