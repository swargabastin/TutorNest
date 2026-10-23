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
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { studentsApi, tutorsApi, authApi } from '@/lib/api';
import type { Tutor } from '@/lib/types';
import { LiveScheduleCard } from '@/components/live-schedule-card';

interface Requirement {
  id: string; subject: string; level: string; city?: string; board?: string; locality?: string; pincode?: string;
  status: string; responseCount: number; description?: string; createdAt: string;
}
interface StudentStats {
  activeRequirements: number; tutorResponses: number; coinBalance: number; totalEnquiries: number;
}

export default function StudentDashboard() {
  const [studentName, setStudentName] = useState('');
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [recentTutors, setRecentTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authApi.getUser();
    if (user?.fullName) setStudentName(user.fullName);

    // Only invoke student APIs if caller is a Student
    if (user?.role === 'Student') {
      Promise.all([
        studentsApi.getStats(),
        studentsApi.getRequirements(),
        tutorsApi.search({ sortBy: 'rating', page: 1, pageSize: 3 }),
      ])
        .then(([statsData, reqs, tutorRes]) => {
          setStats(statsData);
          setRequirements(reqs);
          setRecentTutors(tutorRes.items);
        })
        .catch((err) => console.error('Failed to load student dashboard', err))
        .finally(() => setLoading(false));
    } else {
      // Non-student or guest
      setLoading(false);
    }
  }, []);

  const user = authApi.getUser();
  const isAuth = authApi.isLoggedIn();
  const isUnauthorized = !loading && (!isAuth || user?.role !== 'Student');

  if (isUnauthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 sm:p-6 text-center">
        <Card className="w-full max-w-md shadow-xs border-[#E2E5DF] bg-white rounded-3xl">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="bg-plum-50 text-plum-900 rounded-2xl p-4 mx-auto w-16 h-16 flex items-center justify-center mb-3">
              <BookOpen className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl font-extrabold text-[#243238]">Student Account Required</CardTitle>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xs mx-auto">
              Sign in with your student account to view requirements, enquiries, and learning schedules.
            </p>
          </CardHeader>
          <CardContent className="pt-4 pb-8 space-y-2.5">
            <Link href="/login" className="block">
              <Button className="w-full bg-plum-900 hover:bg-plum-950 text-white rounded-xl h-11 text-xs font-semibold">
                Sign In to Account
              </Button>
            </Link>
            <Link href="/register/student" className="block">
              <Button variant="outline" className="w-full border-[#E2E5DF] text-[#243238] hover:bg-plum-50 rounded-xl h-11 text-xs font-semibold">
                Register as Student
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#243238]">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#243238] tracking-tight">Welcome back{studentName ? `, ${studentName}` : ''}!</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Here is an overview of your active tuitions and tutor responses</p>
        </div>
        <Link href="/post-requirement">
          <Button className="bg-plum-900 hover:bg-plum-950 text-white rounded-xl h-10 px-4 text-xs font-bold shadow-xs">
            + Post Requirement
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0E3342] text-white rounded-2xl shadow-xs border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs font-medium">Active Requirements</p>
                <p className="text-2xl sm:text-3xl font-extrabold mt-1">{loading ? '—' : stats?.activeRequirements ?? 0}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 text-white">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[11px] text-white/60 mt-2.5">
              Total responses: {loading ? '—' : stats?.tutorResponses ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-medium">Enquiries Sent</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#243238] mt-1">{loading ? '—' : stats?.totalEnquiries ?? 0}</p>
              </div>
              <div className="bg-plum-50 text-plum-900 rounded-xl p-2.5">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">Tutors contacted</p>
          </CardContent>
        </Card>

        <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-medium">Coin Balance</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#243238] mt-1">{loading ? '—' : (stats?.coinBalance ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-amber-50 text-amber-600 rounded-xl p-2.5">
                <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              </div>
            </div>
            <Link href="/wallet">
              <Button variant="outline" size="sm" className="w-full mt-2.5 text-xs h-8 rounded-lg border-[#E2E5DF] text-plum-900 hover:bg-plum-50">
                Top Up Coins
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-medium">Requirements Posted</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#243238] mt-1">{loading ? '—' : requirements.length}</p>
              </div>
              <div className="bg-plum-50 text-plum-900 rounded-xl p-2.5">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">Lifetime postings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Requirements */}
        <Card className="lg:col-span-2 border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold text-[#243238]">My Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-slate-500 text-xs py-4 text-center">Loading requirements…</p>
            ) : requirements.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 text-xs mb-3">You haven't posted any tuition requirements yet.</p>
                <Link href="/post-requirement">
                  <Button className="bg-plum-900 hover:bg-plum-950 text-white rounded-xl text-xs h-9 px-4">
                    Post First Requirement
                  </Button>
                </Link>
              </div>
            ) : (
              requirements.map((req) => (
                <div
                  key={req.id}
                  className="flex items-start justify-between p-3.5 rounded-xl border border-[#E2E5DF] bg-[#F6F3EA] hover:bg-plum-50/30 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xs sm:text-sm font-bold text-[#243238] truncate">{req.subject}</h3>
                      <Badge variant="outline" className={`text-[10px] font-semibold py-0 px-2 rounded-full ${
                        req.status.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 mb-1">
                      <span>{req.level}</span>
                      {req.board && (
                        <span className="bg-plum-50 text-plum-900 px-1.5 py-0.2 text-[10px] rounded border border-plum-150 font-medium">
                          {req.board}
                        </span>
                      )}
                      {(req.locality || req.city) && (
                        <span>• {[req.locality, req.city, req.pincode].filter(Boolean).join(', ')}</span>
                      )}
                    </div>
                    {req.description && <p className="text-xs text-slate-500 line-clamp-1">{req.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-plum-900">{req.responseCount} responses</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(req.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              ))
            )}
            {requirements.length > 0 && (
              <Link href="/post-requirement" className="block pt-2">
                <Button variant="outline" className="w-full h-10 rounded-xl border-[#E2E5DF] text-plum-900 hover:bg-plum-50 text-xs font-semibold">
                  <FileText className="h-4 w-4 mr-1.5" />
                  Post Another Requirement
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <LiveScheduleCard userRole="Student" />
      </div>

      {/* Recommended Tutors */}
      <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-bold text-[#243238]">Recommended Tutors</CardTitle>
          <Link href="/search">
            <Button variant="ghost" size="sm" className="text-xs text-plum-900 hover:text-plum-950 hover:bg-plum-50">
              View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500 text-xs py-4 text-center">Finding recommended tutors…</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {recentTutors.map((tutor) => (
                <div key={tutor.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#E2E5DF] bg-[#F6F3EA] hover:border-plum-200 transition-all">
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#243238] truncate">{tutor.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{tutor.subjects.join(', ')}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-[11px] font-bold text-[#243238] ml-1">{tutor.rating}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] font-semibold text-plum-950">₹{tutor.hourlyRate}/h</span>
                    </div>
                  </div>
                  <Link href={`/tutor/${tutor.id}`}>
                    <Button size="sm" variant="outline" className="h-8 rounded-lg border-[#E2E5DF] text-xs px-2.5 text-plum-900 hover:bg-plum-50">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
