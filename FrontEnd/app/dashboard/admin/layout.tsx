'use client';

import DashboardSidebar from '@/components/dashboard-sidebar';
import { Bell, Search, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(authApi.getUser());
  }, []);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar role="admin" />

      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="relative flex-1 max-w-xs sm:max-w-md mr-2 sm:mr-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search users, transactions..." className="pl-10 bg-gray-50 border-0" />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 border-l pl-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.profileImage || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100'} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.fullName || 'Not Signed In'}</p>
                    <p className="text-xs text-gray-500">{user?.role ? `${user.role} Account` : 'Guest'}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/admin/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" onClick={() => authApi.logout()}>Logout</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
