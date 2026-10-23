'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  FileText,
  MessageSquare,
  Clock,
  TrendingUp,
  Calendar,
  ArrowRight,
  Star,
  MapPin,
  IndianRupee,
  Phone,
  Monitor,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { tutorsApi, authApi } from '@/lib/api';
import type { Enquiry } from '@/lib/api';
import { TutorVerificationWidget } from '@/components/tutor-verification-widget';
import { LiveScheduleCard } from '@/components/live-schedule-card';

interface TutorStats {
  profileViews: number; studentLeads: number; classesThisWeek: number;
  earnings: number; coinBalance: number; rating: number; reviewCount: number;
}

export default function TutorDashboard() {
  const [tutorName, setTutorName] = useState('');
  const [stats, setStats] = useState<TutorStats | null>(null);
  const [leads, setLeads] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authApi.getUser();
    if (user?.fullName) setTutorName(user.fullName);

    // Only invoke tutor APIs if caller is a Tutor
    if (user?.role === 'Tutor') {
      Promise.all([tutorsApi.getStats(), tutorsApi.getEnquiries()])
        .then(([statsData, enquiries]) => {
          setStats(statsData);
          setLeads(enquiries);
        })
        .catch((err) => console.error('Failed to load tutor dashboard', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const user = authApi.getUser();
  const isAuth = authApi.isLoggedIn();
  const isUnauthorized = !loading && (!isAuth || user?.role !== 'Tutor');

  if (isUnauthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 sm:p-6 text-center">
        <Card className="w-full max-w-md shadow-xs border-[#EADDD0] bg-white rounded-3xl">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="bg-plum-50 text-plum-900 rounded-2xl p-4 mx-auto w-16 h-16 flex items-center justify-center mb-3">
              <Users className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl font-extrabold text-[#1F1924]">Tutor Account Required</CardTitle>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xs mx-auto">
              Sign in with your verified tutor credentials to access leads, coin balance, and your class calendar.
            </p>
          </CardHeader>
          <CardContent className="pt-4 pb-8 space-y-2.5">
            <Link href="/login" className="block">
              <Button className="w-full bg-plum-900 hover:bg-plum-950 text-white rounded-xl h-11 text-xs font-semibold">
                Sign In as Tutor
              </Button>
            </Link>
            <Link href="/register/tutor" className="block">
              <Button variant="outline" className="w-full border-[#EADDD0] text-[#1F1924] hover:bg-plum-50 rounded-xl h-11 text-xs font-semibold">
                Apply as a Tutor
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const firstName = tutorName.split(' ')[0] || 'there';

  return (
    <div className="space-y-6 text-[#1F1924]">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1F1924] tracking-tight">Welcome back, {firstName}!</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {stats?.reviewCount ? `${stats.reviewCount} student reviews • ${(stats?.rating ?? 0).toFixed(1)} rating` : "Here is your tutor performance overview"}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/search">
            <Button variant="outline" className="border-[#EADDD0] text-[#1F1924] hover:bg-plum-50 rounded-xl text-xs font-semibold h-10 px-4">
              Browse Requirements
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1C081E] text-white rounded-2xl shadow-xs border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs font-medium">Student Leads</p>
                <p className="text-2xl sm:text-3xl font-extrabold mt-1">{loading ? '—' : stats?.studentLeads ?? 0}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 text-white">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[11px] text-white/60 mt-2.5">Direct student enquiries</p>
          </CardContent>
        </Card>

        <Card className="border-[#EADDD0] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-medium">Coin Balance</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#1F1924] mt-1">{loading ? '—' : stats?.coinBalance ?? 0}</p>
              </div>
              <div className="bg-plum-50 text-plum-900 rounded-xl p-2.5">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">Available to unlock leads</p>
          </CardContent>
        </Card>

        <Card className="border-[#EADDD0] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-medium">Estimated Earnings</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#1F1924] mt-1">
                  <span className="text-sm">₹</span>
                  {loading ? '—' : ((stats?.earnings ?? 0) / 1000).toFixed(1)}k
                </p>
              </div>
              <div className="bg-emerald-50 text-emerald-700 rounded-xl p-2.5">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">All-time tutoring</p>
          </CardContent>
        </Card>

        <Card className="border-[#EADDD0] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-medium">Profile Rating</p>
                <div className="flex items-center mt-1">
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#1F1924]">{loading ? '—' : (stats?.rating ?? 0).toFixed(1)}</p>
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 ml-1.5" />
                </div>
              </div>
              <div className="bg-amber-50 text-amber-600 rounded-xl p-2.5">
                <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">{loading ? '—' : stats?.reviewCount ?? 0} reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Verification Widget */}
      <TutorVerificationWidget />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <Card className="lg:col-span-2 border-[#EADDD0] bg-white rounded-2xl shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#1F1924]">Recent Student Enquiries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-slate-500 text-xs py-4 text-center">Loading student leads…</p>
            ) : leads.length === 0 ? (
              <p className="text-slate-500 text-xs py-4 text-center">No student enquiries yet — enquiries will appear here as students discover your profile.</p>
            ) : (
              leads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#EADDD0] bg-[#FAF8F5] hover:bg-plum-50/30 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-900 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-xs sm:text-sm font-bold text-[#1F1924] truncate">{lead.studentName ?? 'Student'}</h3>
                        <Badge variant="outline" className="text-[10px] bg-white border-[#EADDD0]">{lead.level}</Badge>
                        {!lead.isRead && <Badge className="bg-plum-900 text-white text-[10px] px-1.5 py-0">New</Badge>}
                      </div>
                      <p className="text-xs text-slate-600 truncate">{lead.subject}</p>
                      {lead.message && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{lead.message}</p>}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <LiveScheduleCard userRole="Tutor" />
      </div>
    </div>
  );
}
