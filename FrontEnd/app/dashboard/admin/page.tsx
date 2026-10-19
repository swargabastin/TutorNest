'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users,
  GraduationCap,
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  IndianRupee,
  Activity,
  Eye,
  Shield,
  Lock,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { adminApi, authApi } from '@/lib/api';
import { AdminVerificationQueue } from '@/components/admin-verification-queue';

interface AdminDashboardStats {
  totalTutors: number; totalStudents: number; pendingApplications: number;
  totalRequirements: number; totalRevenue: number; revenueThisMonth: number;
  activeSubscriptions: number;
  revenueChart: { month: string; revenue: number }[];
  userGrowthChart: { month: string; tutors: number; students: number }[];
}
interface TutorApplication {
  id: string; name: string; email?: string; phone?: string;
  subjects: string[]; qualification?: string; experienceYears: number;
  status: string; createdAt: string;
}
interface AdminPayment {
  id: string; user: string; type: string; amount: number;
  currency: string; status: string; createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [pendingApplications, setPendingApplications] = useState<TutorApplication[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('admin@hometutor.in');
  const [loginPassword, setLoginPassword] = useState('Admin@123');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      adminApi.getDashboard(),
      adminApi.getTutors({ status: 'Pending', pageSize: 5 }),
      adminApi.getPayments({ pageSize: 5 }),
    ])
      .then(([dashRes, tutorsRes, paymentsRes]) => {
        if (dashRes.status === 'fulfilled') setStats(dashRes.value);
        if (tutorsRes.status === 'fulfilled') setPendingApplications(tutorsRes.value?.items ?? []);
        if (paymentsRes.status === 'fulfilled') setRecentTransactions(paymentsRes.value?.items ?? []);
      })
      .catch((err) => console.error('Failed to load admin dashboard', err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      await authApi.login({ email: loginEmail, password: loginPassword });
      load();
    } catch (err: any) {
      setLoginError(err?.response?.data?.message || 'Invalid administrator credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleDecision = async (id: string, status: 'Approved' | 'Rejected') => {
    setActioning(id);
    try {
      await adminApi.updateTutorStatus(id, status);
      setPendingApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to update tutor status', err);
    } finally {
      setActioning(null);
    }
  };

  const revenueChart = stats?.revenueChart ?? [];
  const maxRevenue = Math.max(1, ...revenueChart.map((d) => d?.revenue ?? 0));
  const prevMonthRev = revenueChart.length >= 2 ? (revenueChart[revenueChart.length - 2]?.revenue ?? 0) : 0;
  const currentMonthRev = revenueChart.length >= 1 ? (revenueChart[revenueChart.length - 1]?.revenue ?? 0) : 0;
  const revenueGrowth =
    prevMonthRev > 0
      ? (((currentMonthRev - prevMonthRev) / prevMonthRev) * 100).toFixed(1)
      : '0.0';

  const user = authApi.getUser();
  const isAuth = authApi.isLoggedIn();
  const isUnauthorized = !loading && !stats && (!isAuth || user?.role !== 'Admin');

  if (isUnauthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-md border-gray-200">
          <CardHeader className="text-center pb-2">
            <div className="bg-teal-50 text-teal-600 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-3">
              <Shield className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Administrator Sign In</CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              Authenticate with your administrator credentials to access the management portal.
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                  {loginError}
                </div>
              )}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="admin@hometutor.in"
                  />
                </div>
              </div>
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="Admin@123"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5"
                disabled={loggingIn}
              >
                {loggingIn ? 'Authenticating...' : 'Sign In as Administrator'}
              </Button>
            </form>
            <div className="mt-4 pt-4 border-t text-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and management</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm">Total Tutors</p>
                <p className="text-3xl font-bold mt-2">{loading ? '—' : (stats?.totalTutors ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <GraduationCap className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-teal-200 mt-3">{loading ? '' : `${stats?.pendingApplications ?? 0} pending approval`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '—' : (stats?.totalStudents ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 text-blue-600 rounded-lg p-3">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Requirements</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '—' : (stats?.totalRequirements ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-orange-100 text-orange-600 rounded-lg p-3">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Revenue This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  <span className="text-sm">₹</span>
                  {loading ? '—' : ((stats?.revenueThisMonth ?? 0) / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="bg-green-100 text-green-600 rounded-lg p-3">
                <IndianRupee className="h-6 w-6" />
              </div>
            </div>
            <p className={`text-xs mt-3 flex items-center ${Number(revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Number(revenueGrowth) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {revenueGrowth}% vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading…</p>
            ) : (
              <div className="h-64 flex items-end gap-2 px-4">
                {revenueChart.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-md transition-all hover:from-teal-500 hover:to-teal-300"
                      style={{ height: `${Math.min(180, Math.max(8, ((data?.revenue ?? 0) / maxRevenue) * 180))}px` }}
                    />
                    <span className="text-xs text-gray-500 mt-2">{data?.month ?? ''}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Users (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading…</p>
            ) : (
              (stats?.userGrowthChart ?? []).map((point, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm font-medium">{point.month}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-teal-600">{point.tutors} tutors</span>
                    <span className="text-blue-600">{point.students} students</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verification Queue */}
      <AdminVerificationQueue />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading…</p>
            ) : recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-sm">No transactions yet.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-4 text-sm font-medium text-gray-500 pb-2 border-b">
                  <span>User</span>
                  <span>Type</span>
                  <span>Amount</span>
                  <span className="text-right">Date</span>
                </div>
                {recentTransactions.map((txn) => (
                  <div key={txn.id} className="grid grid-cols-4 text-sm items-center py-2 hover:bg-gray-50 -mx-2 px-2 rounded">
                    <span className="font-medium text-gray-900">{txn.user}</span>
                    <Badge variant="secondary">{txn.type}</Badge>
                    <span className="text-gray-900">₹{txn.amount}</span>
                    <span className="text-right text-gray-500">{txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading…</p>
            ) : pendingApplications.length > 0 ? pendingApplications.map((app) => (
              <div key={app.id} className="p-3 rounded-lg border bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{app.name}</span>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                    <Clock className="h-3 w-3 mr-1" /> Pending
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{app.subjects?.join(', ') ?? ''}</p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={actioning === app.id}
                    onClick={() => handleDecision(app.id, 'Approved')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={actioning === app.id}
                    onClick={() => handleDecision(app.id, 'Rejected')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>No pending applications</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
