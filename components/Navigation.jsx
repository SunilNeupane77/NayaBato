'use client';

import LanguageSwitcher from '@/components/ui/language-switcher';
import { useLanguage } from '@/lib/i18n/language-context';
import { AlertTriangle, Bell, LogOut, Menu, Settings, User, Users, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  
  const isActive = (path) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 safe-area-top">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 xs:h-16 sm:h-16">
          <div className="flex items-center min-w-0">
            <Link href="/" className="flex items-center">
              <img
                src="/globe.svg"
                alt="Nayabato Logo"
                className="h-6 w-6 sm:h-8 sm:w-8 mr-2 flex-shrink-0"
              />
              <span className="font-bold text-lg sm:text-xl truncate">{t('common.appName')}</span>
            </Link>
          </div>
          <nav className="hidden lg:flex space-x-4 xl:space-x-6 ml-8">
            <Link
              href="/"
              className={`text-sm ${
                isActive('/') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {t('navigation.home')}
            </Link>
            <Link
              href="/issues"
              className={`text-sm ${
                isActive('/issues') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {t('navigation.issues')}
            </Link>
            <Link
              href="/about"
              className={`text-sm ${
                isActive('/about') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {t('navigation.about')}
            </Link>
            
            {session?.user?.role === 'admin' && (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`text-sm ${
                    isActive('/admin/dashboard') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {t('admin.dashboard')}
                </Link>
                <Link
                  href="/admin/users"
                  className={`text-sm ${
                    isActive('/admin/users') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {t('admin.users')}
                </Link>
                <Link
                  href="/admin/departments"
                  className={`text-sm ${
                    isActive('/admin/departments') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {t('admin.departments')}
                </Link>
              </>
            )}
            {session?.user?.role === 'official' && (
              <Link
                href="/admin/dashboard"
                className={`text-sm ${
                  isActive('/admin/dashboard') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {t('navigation.dashboard')}
              </Link>
            )}
            
            {session?.user?.role === 'citizen' && (
              <>
                <Link
                  href="/citizen/dashboard"
                  className={`text-sm ${
                    isActive('/citizen/dashboard') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/issues/report"
                  className={`text-sm ${
                    isActive('/issues/report') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {t('navigation.reportIssue')}
                </Link>
                <Link
                  href="/citizen/my-reports"
                  className={`text-sm ${
                    isActive('/citizen/my-reports') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {t('citizen.myReports')}
                </Link>
              </>
            )}
            {status === 'authenticated' && (
              <Link
                href="/notifications"
                className={`text-sm ${
                  isActive('/notifications') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {t('navigation.notifications')}
              </Link>
            )}
          </nav>

          <div className="flex items-center ml-auto space-x-2 sm:space-x-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            {status === 'authenticated' ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full p-0 h-8 w-8 sm:h-10 sm:w-10 touch-target" aria-label="User menu">
                    <Avatar>
                      <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
                    </Avatar>
                    {session?.user?.role && (
                      <Badge className="absolute -bottom-1 -right-1 px-1 py-0 text-[10px]">
                        {session.user.role}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                      <p className="text-xs leading-none text-gray-500">{session?.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('navigation.profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  {session?.user?.role === 'citizen' && (
                    <DropdownMenuItem asChild>
                      <Link href="/issues/report" className="cursor-pointer flex w-full">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <span>{t('navigation.reportIssue')}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {/* Admin-specific links */}
                  {session?.user?.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="cursor-pointer flex w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>{t('admin.dashboard')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users" className="cursor-pointer flex w-full">
                          <User className="mr-2 h-4 w-4" />
                          <span>{t('admin.users')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/departments" className="cursor-pointer flex w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>{t('admin.departments')}</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {/* Official-specific links */}
                  {session?.user?.role === 'official' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="cursor-pointer flex w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>{t('navigation.dashboard')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/issues" className="cursor-pointer flex w-full">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          <span>{t('navigation.reviewIssues')}</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {/* Citizen-specific links */}
                  {session?.user?.role === 'citizen' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/citizen/dashboard" className="cursor-pointer flex w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>{t('navigation.dashboard')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/issues/report" className="cursor-pointer flex w-full">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          <span>{t('navigation.reportIssue')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/citizen/my-reports" className="cursor-pointer flex w-full">
                          <User className="mr-2 h-4 w-4" />
                          <span>{t('citizen.myReports')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/citizen/community" className="cursor-pointer flex w-full">
                          <Users className="mr-2 h-4 w-4" />
                          <span>{t('citizen.community')}</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {status === 'authenticated' && (
                    <DropdownMenuItem asChild>
                      <Link href="/notifications" className="cursor-pointer flex w-full">
                        <Bell className="mr-2 h-4 w-4" />
                        <span>{t('navigation.notifications')}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('navigation.signOut')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex space-x-2 lg:space-x-3">
                <Button asChild variant="ghost" size="sm" className="mobile-button">
                  <Link href="/auth/signin">{t('navigation.signIn')}</Link>
                </Button>
                <Button asChild size="sm" className="mobile-button">
                  <Link href="/auth/register">{t('navigation.register')}</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="p-2 lg:hidden touch-target"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {isMenuOpen && (
        <div className="lg:hidden animate-slide-down bg-white border-t border-gray-200 safe-area-bottom">
          <div className="px-3 sm:px-4 py-4">
            {/* Language switcher for mobile */}
            <div className="sm:hidden mb-4 pb-4 border-b border-gray-200">
              <LanguageSwitcher />
            </div>
            
            <nav className="space-y-1">
              <Link
                href="/"
                className={`mobile-nav-item block ${
                  isActive('/') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.home')}
              </Link>
              <Link
                href="/issues"
                className={`mobile-nav-item block ${
                  isActive('/issues') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.issues')}
              </Link>
              <Link
                href="/about"
                className={`mobile-nav-item block ${
                  isActive('/about') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.about')}
              </Link>
              
              {/* Role-specific mobile navigation */}
              {(session?.user?.role === 'admin' || session?.user?.role === 'official') && (
                <Link
                  href="/admin/dashboard"
                  className={`mobile-nav-item block ${
                    isActive('/admin/dashboard') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {session?.user?.role === 'admin' ? t('admin.dashboard') : t('navigation.dashboard')}
                </Link>
              )}
              
              {session?.user?.role === 'admin' && (
                <>
                  <Link
                    href="/admin/users"
                    className={`mobile-nav-item block ${
                      isActive('/admin/users') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('admin.userManagement')}
                  </Link>
                  <Link
                    href="/admin/departments"
                    className={`mobile-nav-item block ${
                      isActive('/admin/departments') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('admin.departments')}
                  </Link>
                </>
              )}
              
              {session?.user?.role === 'citizen' && (
                <>
                  <Link
                    href="/citizen/dashboard"
                    className={`mobile-nav-item block ${
                      isActive('/citizen/dashboard') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navigation.dashboard')}
                  </Link>
                  <Link
                    href="/issues/report"
                    className={`mobile-nav-item block ${
                      isActive('/issues/report') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navigation.reportIssue')}
                  </Link>
                  <Link
                    href="/citizen/my-reports"
                    className={`mobile-nav-item block ${
                      isActive('/citizen/my-reports') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('citizen.myReports')}
                  </Link>
                </>
              )}
              
              {session?.user?.role === 'official' && (
                <Link
                  href="/issues"
                  className={`mobile-nav-item block ${
                    isActive('/issues') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.reviewIssues')}
                </Link>
              )}
              
              {status === 'authenticated' && (
                <Link
                  href="/notifications"
                  className={`mobile-nav-item block ${
                    isActive('/notifications') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.notifications')}
                </Link>
              )}
              
              {status !== 'authenticated' && (
                <div className="pt-4 border-t border-gray-200 mt-4 space-y-3">
                  <Link
                    href="/auth/signin"
                    className="touch-button w-full text-center border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navigation.signIn')}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="touch-button w-full text-center bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navigation.register')}
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
