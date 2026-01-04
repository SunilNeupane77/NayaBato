'use client';

import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/i18n/language-context';
import { AlertTriangle, BarChart, FileText, MapPin, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OfficialLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Check authorization for official and admin roles
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/official/dashboard');
    } else if (status === 'authenticated' && !['official', 'admin'].includes(session?.user?.role)) {
      toast({
        title: t('admin.accessDenied') || 'Access Denied',
        description: t('admin.accessDeniedMessage') || 'You do not have permission to access this page.',
        variant: "destructive"
      });
      router.push('/');
    }
  }, [status, session, router, toast, t]);
  
  // Don't render anything if not authorized
  if (status !== 'authenticated' || !['official', 'admin'].includes(session?.user?.role)) {
    return null;
  }
  
  // Helper function to check if a link is active
  const isActive = (path) => pathname === path;
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">
            Official Panel
          </h1>
          <p className="text-gray-400 text-sm">Ward Management System</p>
        </div>
        
        <nav className="mt-6">
          <ul className="space-y-1">
            <li>
              <Link
                href="/official/dashboard"
                className={`block px-4 py-2 ${
                  isActive('/official/dashboard')
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
            
            {/* Issue Management */}
            <li>
              <Link
                href="/official/issues"
                className={`block px-4 py-2 ${
                  pathname.startsWith('/official/issues')
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-3" />
                  <span>Issues</span>
                </div>
              </Link>
            </li>
            
            {/* Ward Management */}
            <li>
              <Link
                href="/official/wards"
                className={`block px-4 py-2 ${
                  pathname.startsWith('/official/wards')
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>Wards</span>
                </div>
              </Link>
            </li>
            
            {/* User Management */}
            <li>
              <Link
                href="/official/users"
                className={`block px-4 py-2 ${
                  pathname.startsWith('/official/users')
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3" />
                  <span>Users</span>
                </div>
              </Link>
            </li>
            
            {/* Common menu items */}
            <li className="px-4 py-2 mt-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Quick Links
              </div>
            </li>
            
            <li>
              <Link
                href="/issues"
                className={`block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white`}
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-3" />
                  <span>All Issues</span>
                </div>
              </Link>
            </li>
            
            <li>
              <Link
                href="/profile"
                className={`block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white`}
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3" />
                  <span>Profile</span>
                </div>
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* User Info at Bottom */}
        <div className="absolute bottom-0 w-64 p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {session?.user?.name?.charAt(0).toUpperCase() || 'O'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || 'Official'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>
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
