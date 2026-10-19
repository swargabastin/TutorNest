'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, ChevronDown, Coins } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TutorNest</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3 lg:space-x-6 xl:space-x-8 text-sm lg:text-base font-medium">
            <Link href="/" className="text-gray-700 hover:text-teal-600 transition-colors">
              Home
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center text-gray-700 hover:text-teal-600 transition-colors">
                  Find Tutors <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/search" className="w-full">Search Tutors</Link>
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
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/post-requirement" className="text-gray-700 hover:text-teal-600 transition-colors">
              Post Requirement
            </Link>
            <Link href="/messages" className="text-gray-700 hover:text-teal-600 transition-colors">
              Messages
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-teal-600 transition-colors">
              Pricing
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1.5 lg:space-x-3 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center text-sm lg:text-base">
                  Register <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href="/register/student" className="w-full">As Student</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/register/tutor" className="w-full">As Tutor</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center text-sm lg:text-base">
                  Login <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/student" className="w-full">Student</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/tutor" className="w-full">Tutor</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/admin" className="w-full">Admin</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <button
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-teal-600 font-medium">Home</Link>
              <Link href="/search" className="text-gray-700 hover:text-teal-600 font-medium">Find Tutors</Link>
              <Link href="/post-requirement" className="text-gray-700 hover:text-teal-600 font-medium">Post Requirement</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-teal-600 font-medium">Pricing</Link>
              <hr className="my-2" />
              <Link href="/register/student" className="text-gray-700 font-medium">Register as Student</Link>
              <Link href="/register/tutor" className="text-gray-700 font-medium">Register as Tutor</Link>
              <Link href="/dashboard/student" className="text-teal-600 font-medium">Student Login</Link>
              <Link href="/dashboard/tutor" className="text-teal-600 font-medium">Tutor Login</Link>
              <Link href="/dashboard/admin" className="text-teal-600 font-medium">Admin Login</Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
