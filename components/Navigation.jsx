'use client';

import { UserAvatar } from '@/components/ui/user-avatar';
import LanguageSwitcher from '@/components/ui/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useLanguage } from '@/lib/i18n/language-context';
import { AlertTriangle, Bell, LogOut, Menu, Settings, User, Users, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    <header className="bg-background border-b border-border sticky top-0 z-50 safe-area-top">
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
          <nav className="hidden lg:flex space-x-2 xl:space-x-3 ml-8">
            <Button
              asChild
              variant={isActive('/') ? 'default' : 'ghost'}
              size="sm"
              className={`${
                isActive('/') 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50'
              } font-medium px-4 py-2 rounded-lg transition-all duration-200`}
            >
              <Link href="/">{t('navigation.home')}</Link>
            </Button>
            {/* Issues link - only for citizens */}
            {session?.user?.role === 'citizen' && (
              <Button
                asChild
                variant={isActive('/issues') ? 'default' : 'ghost'}
                size="sm"
                className={`${
                  isActive('/issues') 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                } font-medium px-4 py-2 rounded-lg transition-all duration-200`}
              >
                <Link href="/issues">{t('navigation.issues')}</Link>
              </Button>
            )}
            {!session && (
              <Button
                asChild
                variant={isActive('/about') ? 'default' : 'ghost'}
                size="sm"
                className={`${
                  isActive('/about') 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                } font-medium px-4 py-2 rounded-lg transition-all duration-200`}
              >
                <Link href="/about">{t('navigation.about')}</Link>
              </Button>
            )}
            
            {session?.user?.role === 'admin' && (
              <>
                <Button
                  asChild
                  variant={isActive('/admin/dashboard') ? 'default' : 'ghost'}
                  size="sm"
                  className={`${
                    isActive('/admin/dashboard') 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                  } font-medium px-4 py-2 rounded-lg transition-all duration-200`}
                >
                  <Link href="/admin/dashboard">{t('admin.dashboard')}</Link>
                </Button>
                <Button
                  asChild
                  variant={isActive('/admin/users') ? 'default' : 'ghost'}
                  size="sm"
                  className={`${
                    isActive('/admin/users') 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                  } font-medium px-4 py-2 rounded-lg transition-all duration-200`}
                >
                  <Link href="/admin/users">{t('admin.users')}</Link>
                </Button>
                <Button
                  asChild
                  variant={isActive('/admin/departments') ? 'default' : 'ghost'}
                  size="sm"
                  className={`${
                    isActive('/admin/departments') 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                  } font-medium px-4 py-2 rounded-lg transition-all duration-200`}
                >
                  <Link href="/admin/departments">{t('admin.departments')}</Link>
                </Button>
              </>
            )}
            {session?.user?.role === 'official' && (
              <>
                <Button
                  asChild
                  variant={isActive('/official') ? 'default' : 'ghost'}
                  size="sm"
                  className={`${
                    isActive('/official') 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                  } font-medium px-4 py-2 rounded-lg transition-all duration-200`}
                >
                  <Link href="/official">{t('navigation.dashboard')}</Link>
                </Button>
                <Button
                  asChild
                  variant={isActive('/official/issues') ? 'default' : 'ghost'}
                  size="sm"
                  className={`${
                    isActive('/official/issues') 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                  } font-medium px-4 py-2 rounded-lg transition-all duration-200`}
                >
                  <Link href="/official/issues">Issues</Link>
                </Button>
              </>
            )}
            
            {session?.user?.role === 'citizen' && (
              <>
                <Button
                  asChild
                  variant={isActive('/citizen/dashboard') ? 'default' : 'ghost'}
                  size="sm"
                  className={`${
                    isActive('/citizen/dashboard') 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                  } font-medium px-4 py-2 rounded-lg transition-all duration-200`}
                >
                  <Link href="/citizen/dashboard">{t('navigation.dashboard')}</Link>
                </Button>
                <Button
                  asChild
                  variant={isActive('/citizen/my-reports') ? 'default' : 'ghost'}
                  size="sm"
                  className={`${
                    isActive('/citizen/my-reports') 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                  } font-medium px-4 py-2 rounded-lg transition-all duration-200`}
                >
                  <Link href="/citizen/my-reports">{t('citizen.myReports')}</Link>
                </Button>
              </>
            )}
            {status === 'authenticated' && (
              <Button
                asChild
                variant={isActive('/notifications') ? 'default' : 'ghost'}
                size="sm"
                className={`${
                  isActive('/notifications') 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                } font-medium px-4 py-2 rounded-lg transition-all duration-200`}
              >
                <Link href="/notifications">{t('navigation.notifications')}</Link>
              </Button>
            )}
          </nav>

          <div className="flex items-center ml-auto space-x-2 sm:space-x-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <ThemeToggle />
            {status === 'authenticated' ? (
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full p-0 h-10 w-10 hover:bg-gray-100 dark:bg-gray-800 transition-colors duration-200" aria-label="User menu">
                      <UserAvatar 
                        user={session?.user} 
                        size="lg"
                        showBorder={true}
                        className="h-10 w-10"
                      />
                      {session?.user?.role && (
                        <Badge className="absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[10px] bg-blue-600 hover:bg-blue-700 border-2 border-white rounded-full font-medium">
                          {session.user.role}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-2">
                  <DropdownMenuLabel className="p-4">
                    <div className="flex items-center space-x-4">
                      <UserAvatar 
                        user={session?.user} 
                        size="lg"
                        className="h-12 w-12"
                      />
                      <div className="flex flex-col space-y-1">
                        <p className="text-base font-semibold leading-none">{session?.user?.name}</p>
                        <p className="text-sm leading-none text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                        <Badge variant="outline" className="w-fit mt-2 text-xs">
                          {session?.user?.role || 'citizen'}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 rounded-md">
                    <Link href="/profile" className="flex w-full items-center">
                      <User className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium">{t('navigation.profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Admin-specific links */}
                  {session?.user?.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 rounded-md">
                        <Link href="/admin/dashboard" className="flex w-full items-center">
                          <Settings className="mr-3 h-5 w-5 text-gray-500" />
                          <span className="text-sm font-medium">{t('admin.dashboard')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 rounded-md">
                        <Link href="/admin/users" className="flex w-full items-center">
                          <User className="mr-3 h-5 w-5 text-gray-500" />
                          <span className="text-sm font-medium">{t('admin.users')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 rounded-md">
                        <Link href="/admin/departments" className="flex w-full items-center">
                          <Settings className="mr-3 h-5 w-5 text-gray-500" />
                          <span className="text-sm font-medium">{t('admin.departments')}</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {/* Official-specific links */}
                  {session?.user?.role === 'official' && (
                    <>
                      <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 rounded-md">
                        <Link href="/official" className="flex w-full items-center">
                          <Settings className="mr-3 h-5 w-5 text-gray-500" />
                          <span className="text-sm font-medium">{t('navigation.dashboard')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 rounded-md">
                        <Link href="/official/users" className="flex w-full items-center">
                          <Users className="mr-3 h-5 w-5 text-gray-500" />
                          <span className="text-sm font-medium">User Management</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 rounded-md">
                        <Link href="/official/issues" className="flex w-full items-center">
                          <AlertTriangle className="mr-3 h-5 w-5 text-gray-500" />
                          <span className="text-sm font-medium">Issues</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {/* Citizen-specific links */}
                  {session?.user?.role === 'citizen' && (
                    <>
                      <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 rounded-md">
                        <Link href="/citizen/dashboard" className="flex w-full items-center">
                          <Settings className="mr-3 h-5 w-5 text-gray-500" />
                          <span className="text-sm font-medium">{t('navigation.dashboard')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 rounded-md">
                        <Link href="/citizen/my-reports" className="flex w-full items-center">
                          <User className="mr-3 h-5 w-5 text-gray-500" />
                          <span className="text-sm font-medium">{t('citizen.myReports')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 rounded-md">
                        <Link href="/citizen/community" className="flex w-full items-center">
                          <Users className="mr-3 h-5 w-5 text-gray-500" />
                          <span className="text-sm font-medium">{t('citizen.community')}</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {status === 'authenticated' && (
                    <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 rounded-md">
                      <Link href="/notifications" className="flex w-full items-center">
                        <Bell className="mr-3 h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium">{t('navigation.notifications')}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="p-3 cursor-pointer hover:bg-red-50 rounded-md text-red-600">
                    <LogOut className="mr-3 h-5 w-5" />
                    <span className="text-sm font-medium">{t('navigation.signOut')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Button 
                  asChild 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:bg-gray-800 font-medium px-4 py-2 rounded-lg transition-all duration-200"
                >
                  <Link href="/auth/signin">{t('navigation.signIn')}</Link>
                </Button>
                <Button 
                  asChild 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm dark:shadow-gray-900/20 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                >
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
        <div className="lg:hidden animate-slide-down bg-background border-t border-border safe-area-bottom absolute top-full left-0 right-0 z-40">
          <div className="px-3 sm:px-4 py-4">
            {/* Language switcher and theme toggle for mobile */}
            <div className="sm:hidden mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            
            <nav className="space-y-1">
              <Link
                href="/"
                className={`mobile-nav-item block ${
                  isActive('/') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.home')}
              </Link>
              {/* Issues link - only for citizens */}
              {session?.user?.role === 'citizen' && (
                <Link
                  href="/issues"
                  className={`mobile-nav-item block ${
                    isActive('/issues') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.issues')}
                </Link>
              )}
              {!session && (
                <Link
                  href="/about"
                  className={`mobile-nav-item block ${
                    isActive('/about') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.about')}
                </Link>
              )}
              
              {/* Role-specific mobile navigation */}
              {session?.user?.role === 'admin' && (
                <Link
                  href="/admin/dashboard"
                  className={`mobile-nav-item block ${
                    isActive('/admin/dashboard') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('admin.dashboard')}
                </Link>
              )}
              
              {session?.user?.role === 'official' && (
                <Link
                  href="/official"
                  className={`mobile-nav-item block ${
                    isActive('/official') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.dashboard')}
                </Link>
              )}
              
              {session?.user?.role === 'admin' && (
                <>
                  <Link
                    href="/admin/users"
                    className={`mobile-nav-item block ${
                      isActive('/admin/users') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('admin.userManagement')}
                  </Link>
                  <Link
                    href="/admin/departments"
                    className={`mobile-nav-item block ${
                      isActive('/admin/departments') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50'
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
                      isActive('/citizen/dashboard') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navigation.dashboard')}
                  </Link>
                  <Link
                    href="/citizen/my-reports"
                    className={`mobile-nav-item block ${
                      isActive('/citizen/my-reports') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('citizen.myReports')}
                  </Link>
                </>
              )}
              
              {status === 'authenticated' && (
                <Link
                  href="/notifications"
                  className={`mobile-nav-item block ${
                    isActive('/notifications') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.notifications')}
                </Link>
              )}
              
              {status !== 'authenticated' && (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-6 space-y-4">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-12 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900 font-medium rounded-lg transition-all duration-200"
                  >
                    <Link
                      href="/auth/signin"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('navigation.signIn')}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm dark:shadow-gray-900/20 hover:shadow-md transition-all duration-200"
                  >
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('navigation.register')}
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
