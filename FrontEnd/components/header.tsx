'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(authApi.getUser());
  }, []);

  const handleLogout = () => {
    authApi.logout();
    window.location.href = '/';
  };

  const getDashboardHref = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'Student') return '/dashboard/student';
    if (currentUser.role === 'Tutor') return '/dashboard/tutor';
    if (currentUser.role === 'Admin') return '/dashboard/admin';
    return '/dashboard/student';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E7E3EB] bg-white/95 dark:bg-[#170E1A]/95 backdrop-blur-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-plum-800 to-plum-950 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-plum-900/20 group-hover:scale-105 transition-transform">
                <span className="text-ivory-50 font-bold text-xl tracking-tight">T</span>
              </div>
              <span className="text-xl font-bold text-[#1F1924] dark:text-ivory-50 tracking-tight">
                Tutor<span className="text-plum-800 dark:text-lavender-300">Nest</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8 text-sm lg:text-[15px] font-medium text-gray-700 dark:text-gray-300">
            <Link href="/" className="hover:text-plum-800 dark:hover:text-lavender-300 transition-colors">
              Home
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center hover:text-plum-800 dark:hover:text-lavender-300 transition-colors focus:outline-none">
                  Find Tutors <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white dark:bg-[#1F1424] border-[#E7E3EB] shadow-lg">
                <DropdownMenuItem asChild>
                  <Link href="/search" className="w-full">All Subjects</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/search?subject=Mathematics">Mathematics</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/search?subject=Physics">Physics</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/search?subject=Chemistry">Chemistry</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/search?subject=Computer+Science">Computer Science</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/post-requirement" className="hover:text-plum-800 dark:hover:text-lavender-300 transition-colors">
              Post Requirement
            </Link>
            <Link href="/messages" className="hover:text-plum-800 dark:hover:text-lavender-300 transition-colors">
              Messages
            </Link>
            <Link href="/pricing" className="hover:text-plum-800 dark:hover:text-lavender-300 transition-colors">
              Pricing
            </Link>
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center space-x-2.5 lg:space-x-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <Link href={getDashboardHref()}>
                  <Button variant="ghost" size="sm" className="text-plum-900 dark:text-lavender-200 hover:bg-lavender-100/60 font-medium flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span>{currentUser.fullName?.split(' ')[0] || 'Dashboard'}</span>
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 text-xs">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-plum-900 hover:bg-lavender-50 font-medium">
                    Sign In
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="bg-plum-800 hover:bg-plum-900 text-white font-medium px-4 shadow-sm shadow-plum-900/10 flex items-center gap-1">
                      Register <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-[#1F1424] border-[#E7E3EB] shadow-lg">
                    <DropdownMenuItem asChild>
                      <Link href="/register/student" className="w-full">As Student</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register/tutor" className="w-full">As Tutor</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              className="p-2 text-gray-700 hover:text-plum-900 focus:outline-none rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E7E3EB] bg-white dark:bg-[#170E1A] max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            <div className="flex flex-col space-y-3 text-base">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 text-gray-800 hover:text-plum-800 font-medium">
                Home
              </Link>
              <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 text-gray-800 hover:text-plum-800 font-medium">
                Find Tutors
              </Link>
              <Link href="/post-requirement" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 text-gray-800 hover:text-plum-800 font-medium">
                Post Requirement
              </Link>
              <Link href="/messages" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 text-gray-800 hover:text-plum-800 font-medium">
                Messages
              </Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 text-gray-800 hover:text-plum-800 font-medium">
                Pricing Plans
              </Link>
              <hr className="my-2 border-gray-100" />
              {currentUser ? (
                <>
                  <Link href={getDashboardHref()} onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 text-plum-900 font-semibold">
                    My Account ({currentUser.fullName})
                  </Link>
                  <button onClick={handleLogout} className="text-left px-2 py-1.5 text-red-600 font-medium">
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-plum-200 text-plum-900">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register/student" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-plum-800 text-white hover:bg-plum-900">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
