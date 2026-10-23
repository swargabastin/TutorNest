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
  Calendar,
  ShieldCheck,
  Play
} from 'lucide-react';
import { tutorsApi, studentsApi, authApi } from '@/lib/api';
import type { TutorDetail } from '@/lib/api';
import type { Tutor } from '@/lib/types';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { BookSessionModal } from '@/components/book-session-modal';
import { parseVideoUrl } from '@/lib/video-utils';

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
      <div className="min-h-screen bg-[#F6F3EA] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-plum-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading tutor profile…</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !tutor) {
    return (
      <div className="min-h-screen bg-[#F6F3EA] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center border-[#E2E5DF] bg-white rounded-3xl shadow-xs">
            <CardContent className="p-8">
              <h2 className="text-lg font-bold text-[#243238] mb-2">Tutor Not Found</h2>
              <p className="text-xs text-slate-500 mb-5">The profile you are looking for does not exist or may have been unlisted.</p>
              <Link href="/search">
                <Button className="bg-plum-900 hover:bg-plum-950 text-white rounded-xl text-xs font-semibold px-5 h-10">
                  Back to Tutor Search
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F3EA] text-[#243238] flex flex-col">
      <Header />

      <div className="border-b border-[#E2E5DF] bg-white">
        <div className="container mx-auto px-4 py-3">
          <Link href="/search" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-plum-900 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Tutor Search
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6 md:py-8 flex-1">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Profile Header */}
            <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs overflow-hidden">
              <CardContent className="p-4 sm:p-8">
                <div className="flex flex-row gap-3.5 sm:gap-5 items-start">
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-16 h-16 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-plum-200 shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <h1 className="text-lg sm:text-2xl font-extrabold text-[#243238] tracking-tight mr-1">{tutor.name}</h1>
                      {tutor.idVerified && (
                        <Badge className="bg-plum-50 text-plum-900 border border-plum-200 text-[10px] font-bold py-0.5 px-2 rounded-full">
                          <ShieldCheck className="h-3 w-3 mr-1 text-plum-700" />
                          Identity Reviewed
                        </Badge>
                      )}
                      {tutor.qualificationVerified && (
                        <Badge className="bg-plum-50 text-plum-900 border border-plum-200 text-[10px] font-bold py-0.5 px-2 rounded-full">
                          <Award className="h-3 w-3 mr-1 text-plum-700" />
                          Qualification Reviewed
                        </Badge>
                      )}
                      {tutor.policeCheckVerified && (
                        <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold py-0.5 px-2 rounded-full">
                          <CheckCircle className="h-3 w-3 mr-1 text-emerald-700" />
                          Police Check Reviewed
                        </Badge>
                      )}
                      {tutor.addressVerified && (
                        <Badge className="bg-slate-50 text-slate-800 border border-slate-200 text-[10px] font-bold py-0.5 px-2 rounded-full">
                          <MapPin className="h-3 w-3 mr-1 text-slate-700" />
                          Address Reviewed
                        </Badge>
                      )}
                      {!tutor.idVerified && !tutor.qualificationVerified && !tutor.policeCheckVerified && tutor.verified && (
                        <Badge className="bg-plum-50 text-plum-900 border border-plum-200 text-[10px] font-bold py-0.5 px-2 rounded-full">
                          <CheckCircle className="h-3 w-3 mr-1 text-plum-700" />
                          Verified Tutor
                        </Badge>
                      )}
                      {tutor.offersFreeDemo && (
                        <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold py-0.5 px-2.5 rounded-full">
                          🎉 Free Demo Available
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-2">{tutor.qualification}</p>

                    {/* Boards & Locality Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {tutor.boards && tutor.boards.length > 0 && tutor.boards.map((b) => (
                        <Badge key={b} variant="secondary" className="bg-lavender-100 text-plum-950 text-[10px] font-semibold py-0 px-2">
                          {b}
                        </Badge>
                      ))}
                      {tutor.locality && (
                        <span className="text-[11px] text-slate-600 font-medium">
                          Area: <span className="font-semibold text-plum-900">{tutor.locality}</span>
                          {tutor.travelRadiusKm ? ` (travels up to ${tutor.travelRadiusKm} km)` : ''}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                        <span className="font-bold text-[#243238]">{tutor.rating}</span>
                        <span className="text-slate-400">({tutor.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <BookOpen className="h-3.5 w-3.5 text-plum-700 shrink-0" />
                        <span>{tutor.experience} yrs exp</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-plum-700 shrink-0" />
                        <span>{tutor.locality ? `${tutor.locality}, ${tutor.location}` : tutor.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Users className="h-3.5 w-3.5 text-plum-700 shrink-0" />
                        <span>{tutor.studentsTaught} taught</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-[#E2E5DF]">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#243238]">
                      ₹{tutor.hourlyRate}
                      <span className="text-xs font-normal text-slate-500">/hr</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2 justify-start sm:justify-end">
                      {tutor.mode.includes('online') && (
                        <Badge variant="outline" className="text-[10px] bg-plum-50 text-plum-900 border-plum-200">
                          <Monitor className="h-3 w-3 mr-1" /> Online
                        </Badge>
                      )}
                      {tutor.mode.includes('offline') && (
                        <Badge variant="outline" className="text-[10px] bg-[#F6F3EA] text-slate-700 border-[#E2E5DF]">
                          <MapPin className="h-3 w-3 mr-1" /> In-person
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Introduction (Phase 2) */}
            {(() => {
              const video = parseVideoUrl(tutor.introVideoUrl);
              if (!video.isValid || !video.embedUrl) return null;
              return (
                <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs overflow-hidden">
                  <CardHeader className="p-5 pb-3 bg-[#F6F3EA]/60 border-b border-[#E2E5DF]">
                    <CardTitle className="text-sm font-bold text-[#243238] flex items-center gap-2">
                      <Play className="h-4 w-4 text-plum-900 fill-plum-900" />
                      Tutor Video Introduction
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      Watch a short introductory message from {tutor.name} explaining their teaching approach and subject expertise.
                    </p>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner border border-[#E2E5DF]">
                      <iframe
                        src={video.embedUrl}
                        title={`${tutor.name} - Introduction Video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        className="absolute inset-0 w-full h-full border-0"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Tabs Content */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full bg-white border border-[#E2E5DF] p-1 rounded-xl h-11">
                <TabsTrigger value="about" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-plum-900 data-[state=active]:text-white">About</TabsTrigger>
                <TabsTrigger value="schedule" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-plum-900 data-[state=active]:text-white">Schedule</TabsTrigger>
                <TabsTrigger value="subjects" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-plum-900 data-[state=active]:text-white">Subjects & Boards</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-plum-900 data-[state=active]:text-white">Reviews ({tutor.reviewCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4">
                <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">About Tutor</h3>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{tutor.bio}</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-[#E2E5DF]">
                      <div>
                        <h4 className="text-xs font-bold text-[#243238] mb-2">Languages Spoken</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {tutor.languages.map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs border-[#E2E5DF] bg-[#F6F3EA]">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#243238] mb-2">Teaching Levels</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {tutor.teachingLevels.map((level) => (
                            <Badge key={level} variant="outline" className="text-xs border-[#E2E5DF] bg-[#F6F3EA]">{level}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#243238] mb-1.5">Response Time</h4>
                        <div className="flex items-center text-xs text-slate-600">
                          <Clock className="h-4 w-4 mr-1.5 text-plum-700" />
                          Usually within {tutor.responseTime}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#243238] mb-1.5">Student Base</h4>
                        <div className="flex items-center text-xs text-slate-600">
                          <Users className="h-4 w-4 mr-1.5 text-plum-700" />
                          {tutor.studentsTaught}+ students mentored
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Weekly Availability Schedule */}
              <TabsContent value="schedule" className="mt-4">
                <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Weekly Availability Schedule</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Stated weekly schedule. Specific demo or class times confirmed by tutor.</p>
                      </div>
                      <Badge variant="outline" className="bg-plum-50 text-plum-900 border-plum-200 text-xs font-medium">
                        IST Timezone
                      </Badge>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#E2E5DF] text-slate-500">
                            <th className="py-2.5 px-3 font-bold">Day</th>
                            <th className="py-2.5 px-3 font-medium">Morning (6-9 AM)</th>
                            <th className="py-2.5 px-3 font-medium">Afternoon (12-4 PM)</th>
                            <th className="py-2.5 px-3 font-medium">Evening (4-8 PM)</th>
                            <th className="py-2.5 px-3 font-medium">Night (8-10 PM)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5EFE8]">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                            const daySlots = tutor.availabilities?.filter((a) => a.day.toLowerCase() === day.toLowerCase()) ?? [];
                            const hasSlot = (startHour: number, endHour: number) => {
                              if (!tutor.availabilities || tutor.availabilities.length === 0) {
                                if (day === 'Saturday' || day === 'Sunday') return startHour >= 8 && endHour <= 18;
                                return startHour >= 16 && endHour <= 20;
                              }
                              return daySlots.some((s) => {
                                const h = parseInt(s.startTime.split(':')[0], 10);
                                return h >= startHour && h < endHour;
                              });
                            };

                            return (
                              <tr key={day} className="hover:bg-[#F6F3EA]/60 transition-colors">
                                <td className="py-2.5 px-3 font-bold text-[#243238]">{day}</td>
                                <td className="py-2.5 px-3">
                                  {hasSlot(6, 12) ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Available
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3">
                                  {hasSlot(12, 16) ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Available
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3">
                                  {hasSlot(16, 20) ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-plum-100 text-plum-900 border border-plum-200">
                                      Open (Prime)
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3">
                                  {hasSlot(20, 23) ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Available
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6 mb-6 p-4 bg-[#F6F3EA] border border-[#E2E5DF] rounded-xl">
                      <div className="text-center">
                        <p className="text-3xl font-extrabold text-[#243238]">{tutor.rating}</p>
                        <div className="flex items-center justify-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(tutor.rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{tutor.reviewCount} total reviews</p>
                      </div>
                    </div>

                    {tutor.reviews.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-6">No verified reviews submitted yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {tutor.reviews.map((review) => (
                          <div key={review.id} className="border-b border-[#E2E5DF] pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-plum-100 text-plum-900 flex items-center justify-center text-xs font-bold">
                                  {review.studentAvatar ? (
                                    <img src={review.studentAvatar} alt={review.studentName} className="w-full h-full object-cover rounded-full" />
                                  ) : (
                                    review.studentName.charAt(0)
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[#243238]">{review.studentName}</p>
                                  <p className="text-[10px] text-slate-400">
                                    {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                                ))}
                              </div>
                            </div>
                            {review.reviewText && <p className="text-xs text-slate-700 leading-relaxed">{review.reviewText}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subjects" className="mt-4">
                <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Subjects & Boards</h3>
                    {tutor.boards && tutor.boards.length > 0 && (
                      <div className="mb-4 p-3.5 rounded-xl border border-plum-100 bg-plum-50/50">
                        <h4 className="text-xs font-bold text-plum-950 mb-1.5">Curricula & Boards Covered</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {tutor.boards.map((b) => (
                            <Badge key={b} className="text-xs bg-plum-900 text-white font-medium">{b}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      {tutor.subjects.map((subject) => (
                        <div key={subject} className="p-3.5 rounded-xl border border-[#E2E5DF] bg-[#F6F3EA]">
                          <h4 className="text-xs font-bold text-[#243238] mb-1.5">{subject}</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {tutor.teachingLevels.map((level) => (
                              <Badge key={level} variant="outline" className="text-[11px] bg-white border-[#E2E5DF]">{level}</Badge>
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
          <div className="space-y-5">
            {/* Contact Card */}
            <Card className="sticky top-20 border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-[#243238]">
                  Book a Class with {tutor.name.split(' ')[0]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Discuss syllabus, weekly schedule, and begin personalized learning.
                </p>

                <div className="bg-plum-50/70 border border-plum-100 rounded-xl p-3.5">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Tuition Rate</p>
                  <p className="text-2xl font-extrabold text-plum-950">
                    ₹{tutor.hourlyRate}
                    <span className="text-xs font-normal text-slate-500"> / hour</span>
                  </p>
                </div>

                {contactSent ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center text-emerald-800 text-xs font-medium">
                    <CheckCircle className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
                    Enquiry sent to {tutor.name.split(' ')[0]}! You will be notified when they reply.
                  </div>
                ) : (
                  <>
                    {contactError && (
                      <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">{contactError}</p>
                    )}
                    {tutor.offersFreeDemo ? (
                      <>
                        <BookSessionModal
                          tutor={tutor}
                          defaultTrial={true}
                          trigger={
                            <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl h-11 text-xs font-bold shadow-xs">
                              🎉 Book Free Demo (45 Min)
                            </Button>
                          }
                        />
                        <BookSessionModal
                          tutor={tutor}
                          defaultTrial={false}
                          trigger={
                            <Button variant="outline" className="w-full h-10 rounded-xl border-plum-900 text-plum-900 hover:bg-plum-50 text-xs font-bold">
                              <Calendar className="h-4 w-4 mr-1.5" />
                              Book Regular Class
                            </Button>
                          }
                        />
                      </>
                    ) : (
                      <BookSessionModal tutor={tutor} />
                    )}
                    <Button
                      variant="outline"
                      className="w-full h-10 rounded-xl border-[#E2E5DF] text-[#243238] hover:bg-plum-50 text-xs font-semibold"
                      onClick={handleContact}
                      disabled={contacting}
                    >
                      <Phone className="h-3.5 w-3.5 mr-1.5 text-plum-800" />
                      {contacting ? 'Sending…' : 'Contact Direct'}
                    </Button>
                  </>
                )}

                <div className="text-center text-[11px] text-slate-500 pt-1">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3 text-plum-700" />
                    Usually responds within {tutor.responseTime}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#E2E5DF]">
                  <div className="flex items-center justify-around text-xs text-slate-600">
                    <div className="flex items-center gap-1 font-medium">
                      <CheckCircle className="h-3.5 w-3.5 text-plum-800" />
                      Verified
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <Award className="h-3.5 w-3.5 text-plum-800" />
                      Quality Check
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Tutors */}
            {similarTutors.length > 0 && (
              <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-[#243238]">Similar Tutors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {similarTutors.map((similar) => (
                    <Link key={similar.id} href={`/tutor/${similar.id}`} className="block">
                      <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-plum-50/50 transition-colors">
                        <img
                          src={similar.avatar}
                          alt={similar.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#243238] truncate">{similar.name}</p>
                          <div className="flex items-center text-[11px] text-slate-500">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500 mr-1" />
                            {similar.rating}
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-plum-950">₹{similar.hourlyRate}/h</span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
