'use client';

import { AlertTriangle, Bell, LogOut, Menu, Settings, User, X } from 'lucide-react';
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and site name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src="/globe.svg"
                alt="Nayabato Logo"
                className="h-8 w-8 mr-2"
              />
              <span className="font-bold text-xl">Nayabato</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-6 ml-8">
            <Link
              href="/"
              className={`text-sm ${
                isActive('/') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            <Link
              href="/issues"
              className={`text-sm ${
                isActive('/issues') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Issues
            </Link>
            <Link
              href="/about"
              className={`text-sm ${
                isActive('/about') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              About
            </Link>
            
            {/* Role-specific navigation links */}
            {session?.user?.role === 'admin' && (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`text-sm ${
                    isActive('/admin/dashboard') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className={`text-sm ${
                    isActive('/admin/users') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Users
                </Link>
                <Link
                  href="/admin/departments"
                  className={`text-sm ${
                    isActive('/admin/departments') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Departments
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
                Dashboard
              </Link>
            )}
            
            {/* Citizen-specific links */}
            {session?.user?.role === 'citizen' && (
              <Link
                href="/issues/report"
                className={`text-sm ${
                  isActive('/issues/report') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Report Issue
              </Link>
            )}
            {status === 'authenticated' && (
              <Link
                href="/notifications"
                className={`text-sm ${
                  isActive('/notifications') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Notifications
              </Link>
            )}
          </nav>

          {/* User menu or sign in button */}
          <div className="flex items-center ml-auto">
            {status === 'authenticated' ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full p-0 h-10 w-10" aria-label="User menu">
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
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {session?.user?.role === 'citizen' && (
                    <DropdownMenuItem asChild>
                      <Link href="/issues/report" className="cursor-pointer flex w-full">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <span>Report Issue</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {/* Admin-specific links */}
                  {session?.user?.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="cursor-pointer flex w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users" className="cursor-pointer flex w-full">
                          <User className="mr-2 h-4 w-4" />
                          <span>Manage Users</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/departments" className="cursor-pointer flex w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Manage Departments</span>
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
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/issues" className="cursor-pointer flex w-full">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          <span>Review Issues</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {status === 'authenticated' && (
                    <DropdownMenuItem asChild>
                      <Link href="/notifications" className="cursor-pointer flex w-full">
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifications</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-3">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/register">Register</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="ml-4 p-2 md:hidden"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {isMenuOpen && (
        <div className="md:hidden py-4 px-4 border-t border-gray-200 bg-gray-50">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md ${
                isActive('/') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/issues"
              className={`px-3 py-2 rounded-md ${
                isActive('/issues') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Issues
            </Link>
            <Link
              href="/about"
              className={`px-3 py-2 rounded-md ${
                isActive('/about') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            {/* Role-specific mobile navigation */}
            {(session?.user?.role === 'admin' || session?.user?.role === 'official') && (
              <Link
                href="/admin/dashboard"
                className={`px-3 py-2 rounded-md ${
                  isActive('/admin/dashboard') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {session?.user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
              </Link>
            )}
            
            {session?.user?.role === 'admin' && (
              <>
                <Link
                  href="/admin/users"
                  className={`px-3 py-2 rounded-md ${
                    isActive('/admin/users') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Manage Users
                </Link>
              </>
            )}
            
            {session?.user?.role === 'citizen' && (
              <Link
                href="/issues/report"
                className={`px-3 py-2 rounded-md ${
                  isActive('/issues/report') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Report Issue
              </Link>
            )}
            
            {session?.user?.role === 'official' && (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`px-3 py-2 rounded-md ${
                    isActive('/admin/dashboard') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/issues"
                  className={`px-3 py-2 rounded-md ${
                    isActive('/issues') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Review Issues
                </Link>
              </>
            )}
            
            {status !== 'authenticated' && (
              <div className="pt-3 border-t border-gray-200">
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/auth/signin"
                    className="px-3 py-2 text-center rounded-md border border-gray-300 text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3 py-2 text-center rounded-md bg-blue-600 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
