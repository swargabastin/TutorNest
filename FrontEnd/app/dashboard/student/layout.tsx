'use client';

import DashboardSidebar from '@/components/dashboard-sidebar';
import { Bell, Search, Wallet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar role="student" />

      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="relative flex-1 max-w-xs sm:max-w-md mr-2 sm:mr-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search tutors, subjects..." className="pl-10 bg-gray-50 border-0" />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href="/wallet">
              <Button variant="outline" size="sm">
                <Wallet className="h-4 w-4 mr-2" />
                <span>2,450</span>
                <span className="text-gray-500 ml-1">coins</span>
              </Button>
            </Link>

            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://images.unsplash.com/photo-1599566150163-29194dcabd9b?w=100" />
                    <AvatarFallback>RK</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">Ravi Kumar</p>
                    <p className="text-xs text-gray-500">Student</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/student/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/subscription">Subscription</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">Logout</Link>
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
