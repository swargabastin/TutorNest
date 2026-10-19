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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mx-auto mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Register as Tutor</h1>
            <p className="text-gray-600 mt-2">Join our community of expert educators</p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-teal-600" />
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select value={formData.city} onValueChange={(value) => setFormData({...formData, city: value})}>
                      <SelectTrigger>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-teal-600" />
                  Professional Details
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Highest Qualification</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="qualification"
                        type="text"
                        placeholder="e.g., M.Sc Mathematics, IIT Delhi"
                        className="pl-10"
                        value={formData.qualification}
                        onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        max="50"
                        placeholder="e.g., 5"
                        className="pl-10"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="hourlyRate"
                        type="number"
                        min="0"
                        placeholder="e.g., 500"
                        className="pl-10"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teachingMode">Teaching Mode</Label>
                    <Select
                      value={formData.teachingMode}
                      onValueChange={(value) => setFormData({...formData, teachingMode: value as 'Online' | 'Offline' | 'Both'})}
                    >
                      <SelectTrigger>
                        <Laptop className="h-4 w-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Offline">In-person</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Teaching Subjects */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-teal-600" />
                  Teaching Subjects
                </h3>

                <div className="flex gap-2 mb-3">
                  <Select value={newSubject} onValueChange={setNewSubject}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.filter(s => !formData.selectedSubjects.includes(s)).map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={handleAddSubject}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.selectedSubjects.map((subject) => (
                    <Badge key={subject} variant="secondary" className="py-1 px-3">
                      {subject}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subject)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Teaching Levels */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Teaching Levels</h3>
                <div className="flex flex-wrap gap-2">
                  {teachingLevels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleToggleLevel(level)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        formData.selectedLevels.includes(level)
                          ? 'bg-teal-100 border-teal-300 text-teal-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">About Yourself</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell students about your teaching style, experience, and what makes you unique..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </div>

              {/* Password */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => setFormData({...formData, agreeTerms: checked as boolean})}
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-5">
                  I agree to the{' '}
                  <Link href="#" className="text-teal-600 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="#" className="text-teal-600 hover:underline">Privacy Policy</Link>
                </label>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
              )}

              <Button type="submit" className="w-full py-3 text-lg" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Application'}
              </Button>

              <p className="text-center text-gray-600">
                Already registered?{' '}
                <Link href="/dashboard/tutor" className="text-teal-600 hover:underline font-medium">
                  Login here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-gray-600">
          Looking to learn?{' '}
          <Link href="/register/student" className="text-teal-600 hover:underline font-medium">
            Register as a Student
          </Link>
        </p>
      </div>
    </div>
  );
}
