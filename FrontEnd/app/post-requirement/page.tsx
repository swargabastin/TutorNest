'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  ArrowLeft,
  BookOpen,
  MapPin,
  Clock,
  IndianRupee,
  User,
  CheckCircle
} from 'lucide-react';
import { studentsApi, lookupsApi, authApi } from '@/lib/api';

export default function PostRequirementPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [teachingLevels, setTeachingLevels] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    subject: '',
    level: '',
    board: '',
    city: '',
    locality: '',
    pincode: '',
    mode: '',
    budget: '',
    frequency: '',
    description: '',
    studentName: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    lookupsApi.getSubjects().then((s) => setSubjects(s.map((x) => x.name))).catch(console.error);
    lookupsApi.getCities().then((c) => setCities(c.map((x) => x.city))).catch(console.error);
    lookupsApi.getTeachingLevels().then(setTeachingLevels).catch(console.error);
  }, []);

  const frequencyToNumber = (freq: string): number | undefined => {
    switch (freq) {
      case '1-2': return 2;
      case '3-4': return 4;
      case '5-6': return 6;
      case 'daily': return 7;
      default: return undefined;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // The backend only accepts requirements from an authenticated student
    // account (posting is tied to the logged-in student's profile, not
    // the name/phone/email typed into this form). If the visitor isn't
    // logged in, send them to register/login instead of pretending the
    // post succeeded.
    if (!authApi.isLoggedIn()) {
      router.push('/register/student?next=/post-requirement');
      return;
    }

    setSubmitting(true);
    try {
      await studentsApi.postRequirement({
        subject: formData.subject,
        level: formData.level,
        board: formData.board || undefined,
        city: formData.city || undefined,
        locality: formData.locality || undefined,
        pincode: formData.pincode ? formData.pincode.trim() : undefined,
        mode: formData.mode,
        budget: formData.budget || undefined,
        frequencyPerWeek: frequencyToNumber(formData.frequency),
        description: formData.description,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not post your requirement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center border-[#EADDD0] bg-white rounded-3xl shadow-sm">
          <CardContent className="p-8 sm:p-12">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-5 border border-emerald-100">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#1F1924] mb-2">Requirement Posted!</h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Your tuition requirement has been broadcast to qualified tutors. Interested educators will reach out directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/search">
                <Button className="w-full sm:w-auto bg-plum-900 hover:bg-plum-950 text-white rounded-xl px-5 h-10 text-xs font-semibold">
                  Browse Tutors Now
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="w-full sm:w-auto border-[#EADDD0] text-[#1F1924] hover:bg-plum-50 rounded-xl px-5 h-10 text-xs font-semibold"
              >
                Post Another Requirement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F1924]">Post Tuition Requirement</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Describe your learning goals and let verified tutors send you proposals
            </p>
          </CardHeader>

          <CardContent className="p-6 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Requirement Details */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-plum-800" />
                  Subject & Level
                </h3>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs font-bold text-[#1F1924]">Subject *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({...formData, subject: value})}
                      required
                    >
                      <SelectTrigger className="h-11 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="level" className="text-xs font-bold text-[#1F1924]">Class / Level *</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => setFormData({...formData, level: value})}
                      required
                    >
                      <SelectTrigger className="h-11 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachingLevels.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="board" className="text-xs font-bold text-[#1F1924]">Curriculum / Board</Label>
                    <Select
                      value={formData.board}
                      onValueChange={(value) => setFormData({...formData, board: value})}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm">
                        <SelectValue placeholder="Select board" />
                      </SelectTrigger>
                      <SelectContent>
                        {['CBSE', 'ICSE', 'Kerala State Syllabus', 'ISC', 'IGCSE', 'IB'].map((board) => (
                          <SelectItem key={board} value={board}>{board}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-bold text-[#1F1924]">Location / City *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData({...formData, city: value})}
                      required
                    >
                      <SelectTrigger className="h-11 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="mode" className="text-xs font-bold text-[#1F1924]">Teaching Mode *</Label>
                    <Select
                      value={formData.mode}
                      onValueChange={(value) => setFormData({...formData, mode: value})}
                      required
                    >
                      <SelectTrigger className="h-11 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online Classes</SelectItem>
                        <SelectItem value="offline">In-person Classes</SelectItem>
                        <SelectItem value="both">Both Online & In-person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="locality" className="text-xs font-bold text-[#1F1924]">Locality / Area</Label>
                    <Input
                      id="locality"
                      type="text"
                      placeholder="e.g. Kakkanad, Kaloor, Edappally"
                      className="h-11 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm"
                      value={formData.locality}
                      onChange={(e) => setFormData({...formData, locality: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pincode" className="text-xs font-bold text-[#1F1924]">Pincode</Label>
                    <Input
                      id="pincode"
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 682030"
                      className="h-11 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm"
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}
                    />
                  </div>
                </div>
              </div>

              {/* Budget & Schedule */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4 text-plum-800" />
                  Budget & Schedule
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="budget" className="text-xs font-bold text-[#1F1924]">Hourly Budget (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="budget"
                        type="text"
                        placeholder="e.g. 400 - 600"
                        className="pl-10 h-11 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm"
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="frequency" className="text-xs font-bold text-[#1F1924]">Classes per Week</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) => setFormData({...formData, frequency: value})}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">1-2 classes / week</SelectItem>
                        <SelectItem value="3-4">3-4 classes / week</SelectItem>
                        <SelectItem value="5-6">5-6 classes / week</SelectItem>
                        <SelectItem value="daily">Daily classes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Requirement Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-bold text-[#1F1924]">Requirement Details *</Label>
                <Textarea
                  id="description"
                  placeholder="Detail your goals: syllabus/board (CBSE, ICSE, State), specific chapters, exam targets, preferred evening/morning hours…"
                  rows={4}
                  className="rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs sm:text-sm p-3 focus-visible:ring-plum-600"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              {/* Tips */}
              <div className="bg-plum-50/70 border border-plum-100 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-plum-950 mb-1.5">Tips for Faster Responses:</h4>
                <ul className="space-y-1 text-xs text-slate-700">
                  <li>• Mention the student's curriculum (CBSE, ICSE, Kerala State, IGCSE).</li>
                  <li>• Note upcoming unit tests or entrance exams (NEET, JEE, KEAM).</li>
                  <li>• Share preferred weekly hours or weekends-only preference.</li>
                </ul>
              </div>

              {error && (
                <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">{error}</p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-plum-900 hover:bg-plum-950 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs"
                  disabled={submitting}
                >
                  {submitting ? 'Broadcasting…' : 'Post Requirement'}
                </Button>
                <Link href="/register/student" className="sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-[#EADDD0] text-[#1F1924] hover:bg-plum-50 rounded-xl text-xs sm:text-sm font-semibold"
                  >
                    Create Student Account
                  </Button>
                </Link>
              </div>

              <p className="text-center text-[11px] text-slate-500">
                By posting, you agree to receive communications from interested verified educators.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
