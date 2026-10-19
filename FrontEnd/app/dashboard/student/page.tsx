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
  id: string; subject: string; level: string; city?: string;
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
        <Card className="w-full max-w-md shadow-md border-gray-200">
          <CardHeader className="text-center pb-2">
            <div className="bg-teal-50 text-teal-600 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-3">
              <BookOpen className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Student Account Required</CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              Sign in with a student account to view your requirements, enquiries, and learning stats.
            </p>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <Link href="/register/student">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">Sign In as Student</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back{studentName ? `, ${studentName}` : ''}!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your learning journey</p>
        </div>
        <Link href="/post-requirement">
          <Button>Post New Requirement</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm">Active Requirements</p>
                <p className="text-3xl font-bold mt-2">{loading ? '—' : stats?.activeRequirements ?? 0}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-teal-200 mt-3">
              Total responses: {loading ? '—' : stats?.tutorResponses ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Enquiries Sent</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '—' : stats?.totalEnquiries ?? 0}</p>
              </div>
              <div className="bg-teal-100 text-teal-600 rounded-lg p-3">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Tutors you've reached out to</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Coins Balance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '—' : (stats?.coinBalance ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-yellow-100 text-yellow-600 rounded-lg p-3">
                <Star className="h-6 w-6" />
              </div>
            </div>
            <Link href="/wallet">
              <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
                Add More Coins
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Requirements Posted</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '—' : requirements.length}</p>
              </div>
              <div className="bg-blue-100 text-blue-600 rounded-lg p-3">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">All time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Requirements */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">My Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading…</p>
            ) : requirements.length === 0 ? (
              <p className="text-gray-500 text-sm">You haven't posted any requirements yet.</p>
            ) : (
              requirements.map((req) => (
                <div
                  key={req.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{req.subject}</h3>
                      <Badge variant={req.status.toLowerCase() === 'active' ? 'default' : 'secondary'}>
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{req.level}{req.city ? ` | ${req.city}` : ''}</p>
                    {req.description && <p className="text-sm text-gray-500 line-clamp-1">{req.description}</p>}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-600">{req.responseCount} responses</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
            <Link href="/post-requirement">
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Post New Requirement
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <LiveScheduleCard userRole="Student" />
      </div>

      {/* Recommended Tutors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recommended Tutors</CardTitle>
          <Link href="/search">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading…</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {recentTutors.map((tutor) => (
                <div key={tutor.id} className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow">
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{tutor.name}</h4>
                    <p className="text-sm text-gray-600">{tutor.subjects.join(', ')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium ml-1">{tutor.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-600">₹{tutor.hourlyRate}/hr</span>
                    </div>
                  </div>
                  <Link href={`/tutor/${tutor.id}`}>
                    <Button size="sm" variant="outline">View</Button>
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
