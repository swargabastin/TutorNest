'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Wallet,
  CreditCard,
  Settings,
  Bell,
  MessageSquare,
  Calendar,
  BarChart3,
  GraduationCap,
  BookOpen,
  UserCog,
  Package
} from 'lucide-react';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const studentLinks: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/student' },
  { icon: Users, label: 'My Tutors', href: '/dashboard/student/tutors' },
  { icon: FileText, label: 'Requirements', href: '/dashboard/student/requirements' },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/student/messages' },
  { icon: Calendar, label: 'Schedule', href: '/dashboard/student/schedule' },
  { icon: Wallet, label: 'Wallet', href: '/wallet' },
  { icon: Package, label: 'Subscription', href: '/subscription' },
  { icon: Settings, label: 'Settings', href: '/dashboard/student/settings' },
];

const tutorLinks: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/tutor' },
  { icon: BookOpen, label: 'My Classes', href: '/dashboard/tutor/classes' },
  { icon: Users, label: 'My Students', href: '/dashboard/tutor/students' },
  { icon: FileText, label: 'Requirements', href: '/dashboard/tutor/requirements' },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/tutor/messages' },
  { icon: Calendar, label: 'Schedule', href: '/dashboard/tutor/schedule' },
  { icon: Wallet, label: 'Wallet', href: '/wallet' },
  { icon: Package, label: 'Subscription', href: '/subscription' },
  { icon: Settings, label: 'Settings', href: '/dashboard/tutor/settings' },
];

const adminLinks: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/admin' },
  { icon: GraduationCap, label: 'Tutors', href: '/dashboard/admin/tutors' },
  { icon: Users, label: 'Students', href: '/dashboard/admin/students' },
  { icon: FileText, label: 'Requirements', href: '/dashboard/admin/requirements' },
  { icon: UserCog, label: 'Applications', href: '/dashboard/admin/applications' },
  { icon: CreditCard, label: 'Transactions', href: '/dashboard/admin/transactions' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/admin/analytics' },
  { icon: Package, label: 'Plans', href: '/dashboard/admin/plans' },
  { icon: Settings, label: 'Settings', href: '/dashboard/admin/settings' },
];

interface DashboardSidebarProps {
  role: 'student' | 'tutor' | 'admin';
}

export default function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();

  const links = role === 'student' ? studentLinks : role === 'tutor' ? tutorLinks : adminLinks;

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-[#EADDD0] min-h-screen shrink-0">
      <div className="sticky top-0">
        <div className="p-4 border-b border-[#F0E6DB]">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-plum-900 rounded-xl flex items-center justify-center shadow-xs">
              <span className="text-white font-bold text-base">T</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[#1F1924]">TutorNest</span>
          </Link>
        </div>

        <nav className="p-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname ? (pathname === link.href || pathname.startsWith(link.href + '/')) : false;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors',
                  isActive
                    ? 'bg-plum-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-[#FAF8F5] hover:text-[#1F1924]'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
