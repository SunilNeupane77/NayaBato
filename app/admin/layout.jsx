'use client';

import { AlertTriangle, BarChart, Building, FileText, MapPin, Users, Monitor, TrendingUp, Activity } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';

import { useToast } from '@/components/ui/use-toast';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Check authorization for admin and official roles
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/dashboard');
    } else if (status === 'authenticated' && !['admin', 'official'].includes(session?.user?.role)) {
      toast({
        title: t('admin.accessDenied'),
        description: t('admin.accessDeniedMessage'),
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
          <h1 className="text-xl font-bold">{session?.user?.role === 'admin' ? t('admin.adminPanel') : t('admin.managementPanel')}</h1>
          <p className="text-gray-400 text-sm">{t('admin.managePlatform')}</p>
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
                  <span>{t('admin.dashboard')}</span>
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
                      <span>{t('admin.userManagement')}</span>
                    </div>
                  </Link>
                </li>
                
                {/* Real-time Data Section */}
                <li className="px-4 py-2 mt-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Real-time Data
                  </div>
                </li>
                <li>
                  <Link
                    href="/admin/sessions"
                    className={`block px-4 py-2 ${
                      isActive('/admin/sessions')
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <Monitor className="h-5 w-5 mr-3" />
                      <span>User Sessions</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/activities"
                    className={`block px-4 py-2 ${
                      isActive('/admin/activities')
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-3" />
                      <span>User Activities</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/analytics"
                    className={`block px-4 py-2 ${
                      isActive('/admin/analytics')
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-3" />
                      <span>Analytics</span>
                    </div>
                  </Link>
                </li>
                
                <li>
                  <Link
                    href="/admin/departments"
                    className={`block px-4 py-2 ${
                      isActive('/admin/departments')
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <Building className="h-5 w-5 mr-3" />
                      <span>{t('admin.departments')}</span>
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
                      <span>{t('admin.auditLogs')}</span>
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
                      <span>{t('admin.wardManagement')}</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/ward-assignment"
                    className={`block px-4 py-2 ${
                      isActive('/admin/ward-assignment')
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-3" />
                      <span>Ward Assignment</span>
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
                  <span>{t('admin.issues')}</span>
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
