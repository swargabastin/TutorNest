'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Lock, Mail, Shield, ArrowRight, CheckCircle2, Sparkles, GraduationCap, UserCheck } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'Student' | 'Tutor' | 'Admin'>('Student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({ email: email.trim(), password });
      const user = authApi.getUser();
      const role = user?.role || res?.user?.role || selectedRole;

      if (role === 'Admin') {
        router.push('/dashboard/admin');
      } else if (role === 'Tutor') {
        router.push('/dashboard/tutor');
      } else {
        router.push('/dashboard/student');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid email or password. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-[#E2E5DF] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Side: Ocean Teal Brand Panel (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-plum-950 via-plum-900 to-[#0E3342] text-white p-8 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-lavender-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <Link href="/" className="flex items-center space-x-2.5 mb-10">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                <span className="text-ivory-50 font-bold text-xl">T</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-ivory-50">TutorNest</span>
            </Link>

            <div className="space-y-4">
              <Badge className="bg-white/15 text-ivory-100 border-none text-xs">
                Welcome Back
              </Badge>
              <h2 className="text-2xl font-extrabold tracking-tight text-ivory-50 leading-snug">
                Accelerate Your Learning With Expert Tutors
              </h2>
              <p className="text-xs text-ivory-200/80 leading-relaxed">
                Log in to continue managing sessions, messaging verified tutors, or coordinating your teaching schedule.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/10 text-xs text-ivory-200/70">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-lavender-300 shrink-0" />
              <span>Verified tutors and safe 1-on-1 sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-lavender-300 shrink-0" />
              <span>Secure wallet and coin-based payments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-lavender-300 shrink-0" />
              <span>Real-time direct messaging with educators</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {/* Mobile Brand Header */}
            <div className="lg:hidden flex items-center justify-between mb-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-plum-800 rounded-lg flex items-center justify-center">
                  <span className="text-ivory-50 font-bold text-base">T</span>
                </div>
                <span className="text-lg font-bold text-gray-900">TutorNest</span>
              </Link>
              <Link href="/register/student" className="text-xs font-semibold text-plum-800">
                Create Account
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243238] tracking-tight">
                Sign In
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Enter your credentials to access your TutorNest account
              </p>
            </div>

            {/* Role Quick Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-ivory-200/80 rounded-xl mb-5 text-xs font-medium">
              {(['Student', 'Tutor', 'Admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`py-2 rounded-lg transition-all ${
                    selectedRole === r
                      ? 'bg-plum-800 text-white shadow-sm font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {error && (
              <div className="p-3 mb-4 text-xs sm:text-sm text-red-700 bg-red-50/90 border border-red-200 rounded-xl leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'Admin'
                        ? 'admin@hometutor.in'
                        : selectedRole === 'Tutor'
                        ? 'tutor@example.com'
                        : 'student@example.com'
                    }
                    required
                    className="pl-10 h-11 text-sm bg-gray-50/60 border-[#E2E5DF] focus:border-plum-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-gray-700">Password</Label>
                  <span className="text-[11px] text-plum-800 hover:underline cursor-pointer">
                    Forgot Password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="pl-10 pr-10 h-11 text-sm bg-gray-50/60 border-[#E2E5DF] focus:border-plum-700 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-plum-800 hover:bg-plum-900 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] mt-2"
              >
                {loading ? 'Authenticating...' : `Sign In as ${selectedRole}`}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                Don&apos;t have an account yet?{' '}
                <Link
                  href={selectedRole === 'Tutor' ? '/register/tutor' : '/register/student'}
                  className="font-bold text-plum-800 hover:underline"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
