'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, User, Mail, Phone, MapPin, Lock, ArrowLeft } from 'lucide-react';
import { authApi, lookupsApi } from '@/lib/api';

export default function StudentRegistrationPage() {
  const router = useRouter();
  const [cities, setCities] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    agreeTerms: false
  });

  useEffect(() => {
    lookupsApi.getCities().then((c) => setCities(c.map((x) => x.city))).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.registerStudent({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        city: formData.city || undefined,
      });
      await authApi.login({ email: formData.email, password: formData.password });
      router.push('/dashboard/student');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EA] py-8 sm:py-12 px-4 text-[#243238]">
      <div className="container mx-auto max-w-xl">
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-plum-900 mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to Home
        </Link>

        <Card className="shadow-xs border border-[#E2E5DF] bg-white rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-4 pt-8 px-6 sm:px-10 border-b border-[#E2E5DF] bg-gradient-to-b from-plum-50/50 to-transparent">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-plum-100 text-plum-900 mx-auto mb-3">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#243238]">Register as Student / Parent</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Create your free account to contact verified tutors across Kerala</p>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-bold text-[#243238]">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="e.g. Rahul Menon"
                      className="pl-9 h-10 rounded-xl border-[#E2E5DF] bg-[#F6F3EA] text-xs sm:text-sm"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-[#243238]">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@example.com"
                      className="pl-9 h-10 rounded-xl border-[#E2E5DF] bg-[#F6F3EA] text-xs sm:text-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-[#243238]">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="pl-9 h-10 rounded-xl border-[#E2E5DF] bg-[#F6F3EA] text-xs sm:text-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-bold text-[#243238]">City</Label>
                  <Select value={formData.city} onValueChange={(value) => setFormData({...formData, city: value})}>
                    <SelectTrigger className="h-10 rounded-xl border-[#E2E5DF] bg-[#F6F3EA] text-xs sm:text-sm">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-bold text-[#243238]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 h-10 rounded-xl border-[#E2E5DF] bg-[#F6F3EA] text-xs sm:text-sm"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold text-[#243238]">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 h-10 rounded-xl border-[#E2E5DF] bg-[#F6F3EA] text-xs sm:text-sm"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => setFormData({...formData, agreeTerms: checked as boolean})}
                />
                <label htmlFor="terms" className="text-xs text-slate-600 leading-snug">
                  I agree to the{' '}
                  <Link href="/terms" className="text-plum-900 font-semibold underline hover:text-plum-950">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-plum-900 font-semibold underline hover:text-plum-950">Privacy Policy</Link>
                </label>
              </div>

              {error && (
                <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-plum-900 hover:bg-plum-950 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs mt-2"
                disabled={submitting}
              >
                {submitting ? 'Creating Account…' : 'Create Free Student Account'}
              </Button>

              <p className="text-center text-xs text-slate-600 pt-1">
                Already registered?{' '}
                <Link href="/login" className="text-plum-900 font-bold hover:underline">
                  Sign in here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-5 text-xs text-slate-600">
          Looking to teach?{' '}
          <Link href="/register/tutor" className="text-plum-900 font-bold hover:underline">
            Register as a Tutor
          </Link>
        </p>
      </div>
    </div>
  );
}
