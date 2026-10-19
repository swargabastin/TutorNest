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
    city: '',
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
        city: formData.city || undefined,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="p-12">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirement Posted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your tuition requirement has been posted. Qualified tutors will respond to your request shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/search">
                <Button>Browse Tutors</Button>
              </Link>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Post Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2 border-b">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mx-auto mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Post Your Tuition Requirement</h1>
            <p className="text-gray-600 mt-2">
              Let tutors find you - describe what you need and receive proposals
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Requirement Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-teal-600" />
                  Requirement Details
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({...formData, subject: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Class/Level *</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => setFormData({...formData, level: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachingLevels.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData({...formData, city: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mode">Teaching Mode *</Label>
                    <Select
                      value={formData.mode}
                      onValueChange={(value) => setFormData({...formData, mode: value})}
                      required
                    >
                      <SelectTrigger>
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
              </div>

              {/* Budget & Schedule */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <IndianRupee className="h-5 w-5 mr-2 text-teal-600" />
                  Budget & Schedule
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (per hour)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="budget"
                        type="text"
                        placeholder="e.g., 400-600"
                        className="pl-10"
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Classes per Week</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) => setFormData({...formData, frequency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">1-2 classes</SelectItem>
                        <SelectItem value="3-4">3-4 classes</SelectItem>
                        <SelectItem value="5-6">5-6 classes</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Requirement Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Describe Your Requirement *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about what you're looking for: specific topics, exam preparation, learning goals, preferred timing, etc."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
                <p className="text-sm text-gray-500">
                  Be specific to attract the right tutors. Mention exam dates, current understanding level, and any special requirements.
                </p>
              </div>

              {/* Contact Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-teal-600" />
                  Your Contact Details
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  We'll use the contact details from your student account when tutors respond —
                  log in or register below if you haven't already.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Name</Label>
                    <Input
                      id="studentName"
                      type="text"
                      placeholder="Your name"
                      value={formData.studentName}
                      onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-teal-50 rounded-lg p-4">
                <h4 className="font-medium text-teal-900 mb-2">Tips for a Better Response:</h4>
                <ul className="space-y-1 text-sm text-teal-800">
                  <li>• Include specific topics or chapters you need help with</li>
                  <li>• Mention your current school/college and board (CBSE, ICSE, etc.)</li>
                  <li>• Specify preferred timings and days</li>
                  <li>• State if you have any deadline or exam date</li>
                </ul>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" className="flex-1 py-3" disabled={submitting}>
                  {submitting ? 'Posting…' : 'Post Requirement'}
                </Button>
                <Link href="/register/student">
                  <Button type="button" variant="outline" className="w-full py-3">
                    Register for Free (Get More Responses)
                  </Button>
                </Link>
              </div>

              <p className="text-center text-sm text-gray-500">
                By posting, you agree to receive calls/SMS from interested tutors.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
