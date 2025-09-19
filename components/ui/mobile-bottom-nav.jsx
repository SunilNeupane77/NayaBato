'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { AlertTriangle, Bell, Home, Map, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileBottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t } = useLanguage();

  // Don't show on auth pages or admin pages
  if (pathname.startsWith('/auth') || pathname.startsWith('/admin')) {
    return null;
  }

  const isActive = (path) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: t('navigation.home'),
      show: true,
    },
    {
      href: '/issues',
      icon: Map,
      label: t('navigation.issues'),
      show: true,
    },
    {
      href: '/issues/report',
      icon: AlertTriangle,
      label: t('navigation.report'),
      show: session?.user?.role === 'citizen',
    },
    {
      href: '/notifications',
      icon: Bell,
      label: t('navigation.notifications'),
      show: !!session,
    },
    {
      href: session ? '/profile' : '/auth/signin',
      icon: User,
      label: session ? t('navigation.profile') : t('navigation.signIn'),
      show: true,
    },
  ].filter(item => item.show);

  return (
    <nav className="mobile:block tablet:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200 touch-target ${
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${active ? 'text-primary' : 'text-gray-600'}`} />
              <span className={`text-xs font-medium truncate ${active ? 'text-primary' : 'text-gray-600'}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
