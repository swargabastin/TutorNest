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
        <Card className="w-full max-w-md shadow-md border-gray-200">
          <CardHeader className="text-center pb-2">
            <div className="bg-teal-50 text-teal-600 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-3">
              <Users className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Tutor Account Required</CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              Sign in with a tutor account to view student enquiries, coin balance, and profile stats.
            </p>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <Link href="/register/tutor">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">Sign In as Tutor</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const firstName = tutorName.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
          <p className="text-gray-600 mt-1">
            {stats?.reviewCount ? `You have ${stats.reviewCount} reviews and a ${(stats?.rating ?? 0).toFixed(1)} rating` : "Here's your dashboard"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/search">
            <Button variant="outline">View Student Requirements</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm">Student Leads</p>
                <p className="text-3xl font-bold mt-2">{loading ? '—' : stats?.studentLeads ?? 0}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-teal-200 mt-3">Total enquiries received</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Coin Balance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '—' : stats?.coinBalance ?? 0}</p>
              </div>
              <div className="bg-blue-100 text-blue-600 rounded-lg p-3">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Used to unlock leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Earnings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  <span className="text-sm">₹</span>
                  {loading ? '—' : ((stats?.earnings ?? 0) / 1000).toFixed(1)}k
                </p>
              </div>
              <div className="bg-green-100 text-green-600 rounded-lg p-3">
                <IndianRupee className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Profile Rating</p>
                <div className="flex items-center mt-2">
                  <p className="text-3xl font-bold text-gray-900">{loading ? '—' : (stats?.rating ?? 0).toFixed(1)}</p>
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500 ml-2" />
                </div>
              </div>
              <div className="bg-yellow-100 text-yellow-600 rounded-lg p-3">
                <Star className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">{loading ? '—' : stats?.reviewCount ?? 0} reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Verification Widget */}
      <TutorVerificationWidget />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Student Leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading…</p>
            ) : leads.length === 0 ? (
              <p className="text-gray-500 text-sm">No leads yet — students who enquire about you will show up here.</p>
            ) : (
              leads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-teal-100 text-teal-600 rounded-full p-3">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{lead.studentName ?? 'Student'}</h3>
                        <Badge variant="secondary">{lead.level}</Badge>
                        {!lead.isRead && <Badge className="bg-teal-500">New</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">{lead.subject}</p>
                      {lead.message && <p className="text-sm text-gray-500 mt-1">{lead.message}</p>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
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
