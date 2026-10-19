'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TutorCard from '@/components/tutor-card';
import {
  ArrowLeft,
  Star,
  MapPin,
  Monitor,
  Clock,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Calendar
} from 'lucide-react';
import { tutorsApi, studentsApi, authApi } from '@/lib/api';
import type { TutorDetail } from '@/lib/api';
import type { Tutor } from '@/lib/types';
import { BookSessionModal } from '@/components/book-session-modal';

export default function TutorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const tutorId = params.id as string;

  const [tutor, setTutor] = useState<TutorDetail | null>(null);
  const [similarTutors, setSimilarTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [contacting, setContacting] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    if (!tutorId) return;
    setLoading(true);
    tutorsApi
      .getById(tutorId)
      .then((data) => {
        setTutor(data);
        return tutorsApi.search({ subject: data.subjects[0], page: 1, pageSize: 4 });
      })
      .then((res) => {
        if (res) setSimilarTutors(res.items.filter((t) => t.id !== tutorId).slice(0, 3));
      })
      .catch((err) => {
        console.error('Failed to load tutor', err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [tutorId]);

  const handleContact = async () => {
    if (!tutor) return;
    if (!authApi.isLoggedIn()) {
      router.push(`/register/student?next=/tutor/${tutor.id}`);
      return;
    }
    setContactError('');
    setContacting(true);
    try {
      await studentsApi.sendEnquiry({
        tutorProfileId: tutor.id,
        subject: tutor.subjects[0] ?? '',
        level: tutor.teachingLevels[0] ?? '',
        message: `Hi ${tutor.name}, I'm interested in learning from you.`,
      });
      setContactSent(true);
    } catch (err: any) {
      setContactError(err?.response?.data?.message ?? 'Could not send your enquiry. Please try again.');
    } finally {
      setContacting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading tutor profile…</p>
      </div>
    );
  }

  if (notFound || !tutor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="p-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tutor Not Found</h2>
            <Link href="/search">
              <Button>Back to Search</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/search" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-teal-100"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h1 className="text-2xl font-bold text-gray-900">{tutor.name}</h1>
                      {tutor.verified && (
                        <Badge className="bg-teal-100 text-teal-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{tutor.qualification}</p>

                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-bold text-gray-900">{tutor.rating}</span>
                        <span className="text-gray-500 ml-1">({tutor.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <BookOpen className="h-5 w-5 mr-1" />
                        {tutor.experience} years experience
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-1" />
                        {tutor.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-5 w-5 mr-1" />
                        {tutor.studentsTaught} students taught
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-teal-600">
                      ₹{tutor.hourlyRate}
                      <span className="text-base font-normal text-gray-500">/hr</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tutor.mode.includes('online') && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          <Monitor className="h-3 w-3 mr-1" /> Online
                        </Badge>
                      )}
                      {tutor.mode.includes('offline') && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <MapPin className="h-3 w-3 mr-1" /> In-person
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Tabs defaultValue="about">
              <TabsList className="w-full">
                <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
                <TabsTrigger value="subjects" className="flex-1">Subjects</TabsTrigger>
              </TabsList>

              <TabsContent value="about">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">About Me</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">{tutor.bio}</p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Languages I Teach In</h4>
                        <div className="flex flex-wrap gap-2">
                          {tutor.languages.map((lang) => (
                            <Badge key={lang} variant="outline">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Teaching Levels</h4>
                        <div className="flex flex-wrap gap-2">
                          {tutor.teachingLevels.map((level) => (
                            <Badge key={level} variant="outline">{level}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Response Time</h4>
                        <div className="flex items-center text-gray-700">
                          <Clock className="h-5 w-5 mr-2 text-teal-600" />
                          {tutor.responseTime}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Student Count</h4>
                        <div className="flex items-center text-gray-700">
                          <Users className="h-5 w-5 mr-2 text-teal-600" />
                          {tutor.studentsTaught} students taught
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Student Reviews
                      <span className="text-sm font-normal text-gray-500 ml-2">({tutor.reviewCount} reviews)</span>
                    </h3>

                    <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-gray-900">{tutor.rating}</p>
                        <div className="flex items-center justify-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < Math.floor(tutor.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{tutor.reviewCount} reviews</p>
                      </div>
                    </div>

                    {/* Real reviews from the backend */}
                    {tutor.reviews.length === 0 ? (
                      <p className="text-center text-gray-500 py-6">No reviews yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {tutor.reviews.map((review) => (
                          <div key={review.id} className="border-b pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600 overflow-hidden">
                                  {review.studentAvatar ? (
                                    <img src={review.studentAvatar} alt={review.studentName} className="w-full h-full object-cover" />
                                  ) : (
                                    review.studentName.charAt(0)
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">{review.studentName}</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                            {review.reviewText && <p className="text-gray-700">{review.reviewText}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subjects">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Subjects I Teach</h3>
                    <div className="space-y-4">
                      {tutor.subjects.map((subject) => (
                        <div key={subject} className="p-4 rounded-lg border">
                          <h4 className="font-medium text-gray-900 mb-2">{subject}</h4>
                          <div className="flex flex-wrap gap-2">
                            {tutor.teachingLevels.map((level) => (
                              <Badge key={level} variant="secondary">{level}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">
                  Interested in learning from {tutor.name.split(' ')[0]}?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Contact {tutor.name.split(' ')[0]} to discuss your learning goals and schedule classes.
                </p>

                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Tuition Fee</p>
                  <p className="text-2xl font-bold text-teal-600">
                    ₹{tutor.hourlyRate}
                    <span className="text-base font-normal text-gray-500">/hour</span>
                  </p>
                </div>

                {contactSent ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-700 text-sm">
                    <CheckCircle className="h-5 w-5 mx-auto mb-2" />
                    Your enquiry has been sent to {tutor.name.split(' ')[0]}.
                  </div>
                ) : (
                  <>
                    {contactError && (
                      <p className="text-sm text-red-600">{contactError}</p>
                    )}
                    <BookSessionModal tutor={tutor} />
                    <Button variant="outline" className="w-full" onClick={handleContact} disabled={contacting}>
                      <Phone className="h-4 w-4 mr-2" />
                      {contacting ? 'Sending…' : 'Contact Tutor'}
                    </Button>
                  </>
                )}

                <div className="text-center text-sm text-gray-500">
                  <span className="flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" />
                    Usually responds within {tutor.responseTime}
                  </span>
                </div>

                <div className="py-4 border-t">
                  <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-teal-600" />
                      Verified
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-teal-600" />
                      Trusted
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Tutors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Tutors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {similarTutors.length === 0 ? (
                  <p className="text-sm text-gray-500">No similar tutors found.</p>
                ) : (
                  similarTutors.map((similar) => (
                    <Link key={similar.id} href={`/tutor/${similar.id}`} className="block">
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <img
                          src={similar.avatar}
                          alt={similar.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{similar.name}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                            {similar.rating}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-teal-600">₹{similar.hourlyRate}/hr</span>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
