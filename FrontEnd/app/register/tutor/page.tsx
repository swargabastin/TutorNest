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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  BookOpen,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  X,
  Plus,
  IndianRupee,
  Laptop
} from 'lucide-react';
import { authApi, lookupsApi } from '@/lib/api';

export default function TutorRegistrationPage() {
  const router = useRouter();
  const [cities, setCities] = useState<string[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<{ id: number; name: string }[]>([]);
  const [teachingLevels, setTeachingLevels] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    qualification: '',
    experience: '',
    selectedSubjects: [] as string[],
    selectedLevels: [] as string[],
    bio: '',
    // These two were missing from the original form even though the backend
    // requires them to create a tutor account — added rather than faked.
    teachingMode: '' as '' | 'Online' | 'Offline' | 'Both',
    hourlyRate: '',
    agreeTerms: false
  });

  const [newSubject, setNewSubject] = useState('');
  const subjects = subjectOptions.map((s) => s.name);

  useEffect(() => {
    lookupsApi.getCities().then((c) => setCities(c.map((x) => x.city))).catch(console.error);
    lookupsApi.getSubjects().then(setSubjectOptions).catch(console.error);
    lookupsApi.getTeachingLevels().then(setTeachingLevels).catch(console.error);
  }, []);

  const handleAddSubject = () => {
    if (newSubject && !formData.selectedSubjects.includes(newSubject)) {
      setFormData({
        ...formData,
        selectedSubjects: [...formData.selectedSubjects, newSubject]
      });
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setFormData({
      ...formData,
      selectedSubjects: formData.selectedSubjects.filter(s => s !== subject)
    });
  };

  const handleToggleLevel = (level: string) => {
    if (formData.selectedLevels.includes(level)) {
      setFormData({
        ...formData,
        selectedLevels: formData.selectedLevels.filter(l => l !== level)
      });
    } else {
      setFormData({
        ...formData,
        selectedLevels: [...formData.selectedLevels, level]
      });
    }
  };

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
    if (formData.selectedSubjects.length === 0) {
      setError('Please add at least one subject you teach.');
      return;
    }
    if (!formData.teachingMode) {
      setError('Please select your teaching mode.');
      return;
    }
    if (!formData.hourlyRate || Number(formData.hourlyRate) <= 0) {
      setError('Please enter your hourly rate.');
      return;
    }

    const subjectIds = subjectOptions
      .filter((s) => formData.selectedSubjects.includes(s.name))
      .map((s) => s.id);

    setSubmitting(true);
    try {
      await authApi.registerTutor({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        city: formData.city || undefined,
        qualification: formData.qualification || undefined,
        experienceYears: Number(formData.experience) || 0,
        subjectIds,
        teachingLevels: formData.selectedLevels,
        bio: formData.bio || undefined,
        teachingMode: formData.teachingMode,
        hourlyRate: Number(formData.hourlyRate),
      });
      await authApi.login({ email: formData.email, password: formData.password });
      router.push('/dashboard/tutor');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12 px-4 text-[#1F1924]">
      <div className="container mx-auto max-w-2xl">
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-plum-900 mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to Home
        </Link>

        <Card className="shadow-xs border border-[#EADDD0] bg-white rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-4 pt-8 px-6 sm:px-10 border-b border-[#F0E6DB] bg-gradient-to-b from-plum-50/50 to-transparent">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-plum-100 text-plum-900 mx-auto mb-3">
              <BookOpen className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1F1924]">Register as a Tutor</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Connect with serious students across Kerala and grow your income</p>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-plum-800" />
                  Personal Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-bold text-[#1F1924]">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Prof. Anjali Nair"
                        className="pl-9 h-10 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-[#1F1924]">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tutor@example.com"
                        className="pl-9 h-10 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-bold text-[#1F1924]">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="pl-9 h-10 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-bold text-[#1F1924]">City</Label>
                    <Select value={formData.city} onValueChange={(value) => setFormData({...formData, city: value})}>
                      <SelectTrigger className="h-10 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm">
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-plum-800" />
                  Credentials & Rates
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="qualification" className="text-xs font-bold text-[#1F1924]">Highest Qualification</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="qualification"
                        type="text"
                        placeholder="e.g. M.Sc Physics, NIT Calicut"
                        className="pl-9 h-10 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm"
                        value={formData.qualification}
                        onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="experience" className="text-xs font-bold text-[#1F1924]">Years of Experience</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        max="50"
                        placeholder="e.g. 6"
                        className="pl-9 h-10 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="hourlyRate" className="text-xs font-bold text-[#1F1924]">Hourly Rate (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="hourlyRate"
                        type="number"
                        min="0"
                        placeholder="e.g. 500"
                        className="pl-9 h-10 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="teachingMode" className="text-xs font-bold text-[#1F1924]">Teaching Mode</Label>
                    <Select
                      value={formData.teachingMode}
                      onValueChange={(value) => setFormData({...formData, teachingMode: value as 'Online' | 'Offline' | 'Both'})}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm">
                        <Laptop className="h-4 w-4 mr-2 text-slate-400" />
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Offline">In-person</SelectItem>
                        <SelectItem value="Both">Both Online & In-person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Teaching Subjects */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-plum-800" />
                  Teaching Subjects
                </h3>

                <div className="flex gap-2 mb-2.5">
                  <Select value={newSubject} onValueChange={setNewSubject}>
                    <SelectTrigger className="flex-1 h-10 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm">
                      <SelectValue placeholder="Select a subject to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.filter(s => !formData.selectedSubjects.includes(s)).map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={handleAddSubject} className="h-10 rounded-xl border-[#EADDD0] px-3">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {formData.selectedSubjects.map((subject) => (
                    <Badge key={subject} variant="outline" className="py-1 px-2.5 rounded-lg bg-plum-50 text-plum-950 border-plum-200 text-xs">
                      {subject}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subject)}
                        className="ml-1.5 hover:text-rose-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Teaching Levels */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Teaching Levels</h3>
                <div className="flex flex-wrap gap-2">
                  {teachingLevels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleToggleLevel(level)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        formData.selectedLevels.includes(level)
                          ? 'bg-plum-900 border-plum-900 text-white shadow-xs'
                          : 'bg-[#FAF8F5] border-[#EADDD0] text-slate-700 hover:border-plum-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-xs font-bold text-[#1F1924]">About Yourself & Methodology</Label>
                <Textarea
                  id="bio"
                  placeholder="Describe your teaching approach, board proficiencies (CBSE, ICSE), student track record, and scheduling flexibility…"
                  rows={3}
                  className="rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm p-3 focus-visible:ring-plum-600"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </div>

              {/* Password */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-bold text-[#1F1924]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 h-10 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold text-[#1F1924]">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 h-10 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-1">
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
                {submitting ? 'Creating Profile…' : 'Submit Tutor Application'}
              </Button>

              <p className="text-center text-xs text-slate-600 pt-1">
                Already registered as a tutor?{' '}
                <Link href="/login" className="text-plum-900 font-bold hover:underline">
                  Sign in here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-5 text-xs text-slate-600">
          Looking to learn?{' '}
          <Link href="/register/student" className="text-plum-900 font-bold hover:underline">
            Register as a Student
          </Link>
        </p>
      </div>
    </div>
  );
}
