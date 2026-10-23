'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function MobileNav() {
  const pathname = usePathname();
  const [accountHref, setAccountHref] = useState('/login');

  useEffect(() => {
    const user = authApi.getUser();
    if (user?.role === 'Student') {
      setAccountHref('/dashboard/student');
    } else if (user?.role === 'Tutor') {
      setAccountHref('/dashboard/tutor');
    } else if (user?.role === 'Admin') {
      setAccountHref('/dashboard/admin');
    } else {
      setAccountHref('/login');
    }
  }, [pathname]);

  const navItems = [
    { label: 'Home', href: '/', icon: Home, match: (p: string) => p === '/' },
    { label: 'Tutors', href: '/search', icon: Search, match: (p: string) => p.startsWith('/search') || p.startsWith('/tutor/') },
    { label: 'Post Need', href: '/post-requirement', icon: PlusCircle, match: (p: string) => p === '/post-requirement' },
    { label: 'Messages', href: '/messages', icon: MessageSquare, match: (p: string) => p.startsWith('/messages') },
    { label: 'Account', href: accountHref, icon: User, match: (p: string) => p.startsWith('/dashboard') || p.startsWith('/login') || p.startsWith('/register') },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#170E1A]/95 backdrop-blur-md border-t border-[#E7E3EB] dark:border-plum-900 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom,0.25rem)]"
    >
      <div className="grid grid-cols-5 h-14 items-center">
        {navItems.map((item) => {
          const isActive = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center h-full py-1 transition-all ${
                isActive
                  ? 'text-plum-800 dark:text-lavender-300 font-semibold scale-105'
                  : 'text-gray-500 hover:text-plum-800 dark:text-gray-400 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-plum-800 dark:bg-lavender-300" />
                )}
              </div>
              <span className="text-[10px] leading-tight mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
