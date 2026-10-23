'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TutorCard from '@/components/tutor-card';
import {
  Search,
  Star,
  Shield,
  Clock,
  Users,
  BookOpen,
  GraduationCap,
  Award,
  CheckCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tutorsApi, lookupsApi } from '@/lib/api';
import type { Tutor } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const [featuredTutors, setFeaturedTutors] = useState<Tutor[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    tutorsApi
      .search({ sortBy: 'rating', page: 1, pageSize: 6 })
      .then((res) => setFeaturedTutors(res.items))
      .catch((err) => console.error('Failed to load featured tutors', err));

    lookupsApi
      .getSubjects()
      .then((subs) => setSubjects(subs.map((s) => s.name)))
      .catch((err) => console.error('Failed to load subjects', err));

    lookupsApi
      .getCities()
      .then((c) => setCities(c.map((x) => x.city)))
      .catch((err) => console.error('Failed to load cities', err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCity.trim()) params.set('city', selectedCity.trim());
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-ivory-100 dark:bg-[#0A242F] text-[#243238] dark:text-ivory-50">
      {/* ── 1. Compact Hero Section ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-plum-900 via-plum-800 to-[#0E3342] text-white overflow-hidden py-10 sm:py-14 lg:py-20">
        {/* Subtle ambient lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-lavender-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-plum-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-ivory-100 text-xs font-medium mb-4">
              <Sparkles className="h-3.5 w-3.5 text-lavender-300" />
              <span>India&apos;s Verified 1-on-1 Tutoring Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-3 sm:mb-4 text-ivory-50">
              Find the Perfect Tutor for Your Learning Journey
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-ivory-200/80 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
              Connect with verified experts for school boards, competitive exams (JEE/NEET), languages, and skills — online or in-person.
            </p>

            {/* Smart Search Card */}
            <form
              onSubmit={handleSearch}
              className="bg-white dark:bg-[#0F313E] rounded-2xl p-2.5 sm:p-3 shadow-xl border border-plum-900/20 max-w-2xl text-left"
            >
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Subject, topic, or tutor name..."
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm text-gray-900 dark:text-ivory-50 placeholder-gray-400 bg-gray-50/80 dark:bg-plum-950/40 rounded-xl border border-gray-200/80 dark:border-plum-800/50 focus:outline-none focus:ring-2 focus:ring-plum-700"
                  />
                </div>

                <div className="relative sm:w-48">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full pl-8 pr-7 py-2.5 sm:py-3 text-sm text-gray-800 dark:text-ivory-100 bg-gray-50/80 dark:bg-plum-950/40 rounded-xl border border-gray-200/80 dark:border-plum-800/50 focus:outline-none focus:ring-2 focus:ring-plum-700 appearance-none cursor-pointer"
                  >
                    <option value="">All Locations</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  className="bg-plum-800 hover:bg-plum-900 text-white font-medium py-2.5 sm:py-3 px-6 rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  Find Tutors
                </Button>
              </div>
            </form>

            {/* Quick Stats Pill Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-ivory-200/70">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-lavender-300" /> 100% ID Verified
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> 4.9/5 Rating
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-lavender-300" /> 45,000+ Students
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Popular Subjects: Horizontal Swipe on Mobile ─────────────────── */}
      <section className="py-8 sm:py-12 border-b border-[#E2E5DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#243238] dark:text-ivory-50">
                Explore Top Subjects
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">Pick a topic to view available verified tutors</p>
            </div>
            <Link
              href="/search"
              className="text-xs sm:text-sm font-semibold text-plum-800 hover:text-plum-900 flex items-center gap-0.5 shrink-0"
            >
              <span>See All</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Swipeable rail on mobile; multi-column grid on desktop */}
          <div className="flex sm:grid sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3.5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-none snap-x">
            {subjects.slice(0, 14).map((subject) => (
              <Link
                key={subject}
                href={`/search?subject=${encodeURIComponent(subject)}`}
                className="snap-start shrink-0 min-w-[130px] sm:min-w-0"
              >
                <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0F313E] border border-[#E2E5DF] dark:border-plum-900/60 hover:border-plum-400 hover:shadow-sm text-center transition-all group">
                  <div className="w-9 h-9 mx-auto mb-2 rounded-lg bg-lavender-100/70 dark:bg-plum-900/50 flex items-center justify-center text-plum-800 dark:text-lavender-200 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-ivory-100 truncate">
                    {subject}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Featured Tutors: Horizontal Touch Carousel on Mobile ─────────── */}
      <section className="py-8 sm:py-12 bg-white dark:bg-[#0D2B37] border-b border-[#E2E5DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#243238] dark:text-ivory-50">
                  Featured Tutors
                </h2>
                <Badge variant="secondary" className="bg-lavender-100 text-plum-900 text-[11px] font-semibold">
                  Top Rated
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">Verified instructors with proven results</p>
            </div>
            <Link
              href="/search"
              className="text-xs sm:text-sm font-semibold text-plum-800 hover:text-plum-900 flex items-center gap-0.5 shrink-0"
            >
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Swipeable on mobile; responsive 1-col or 2-col stack on desktop */}
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible pb-3 md:pb-0 scrollbar-none snap-x snap-mandatory">
            {featuredTutors.map((tutor) => (
              <div key={tutor.id} className="snap-start shrink-0 w-[84vw] max-w-[340px] md:w-auto md:max-w-none">
                <TutorCard tutor={tutor} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. How TutorNest Works: Compact 3-Step Flow ─────────────────────── */}
      <section className="py-8 sm:py-12 bg-ivory-50 dark:bg-[#0A242F] border-b border-[#E2E5DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#243238] dark:text-ivory-50">
              How TutorNest Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Get started in three easy steps</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: 'Search & Compare',
                desc: 'Filter verified tutors by subject, city, fee, and teaching mode.',
                icon: Search,
              },
              {
                step: '2',
                title: 'Connect Directly',
                desc: 'Chat with matching tutors, discuss requirements, and book sessions.',
                icon: CheckCircle,
              },
              {
                step: '3',
                title: 'Learn & Succeed',
                desc: 'Experience tailored 1-on-1 learning with secure session management.',
                icon: GraduationCap,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-start sm:flex-col sm:items-center sm:text-center gap-3.5 sm:gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F313E] border border-[#E2E5DF] shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-plum-50 dark:bg-plum-950 flex items-center justify-center text-plum-800 dark:text-lavender-300 font-bold shrink-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-ivory-50">
                    {item.step}. {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Become a Tutor Banner ────────────────────────────────────────── */}
      <section className="py-8 sm:py-12 bg-white dark:bg-[#0D2B37] border-b border-[#E2E5DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-plum-900 via-plum-800 to-[#0E3342] rounded-2xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="max-w-xl text-center md:text-left">
              <Badge className="bg-white/15 text-ivory-100 border-none text-xs mb-3">
                For Teachers &amp; Educators
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-ivory-50">
                Become a Tutor on TutorNest
              </h2>
              <p className="text-xs sm:text-sm text-ivory-200/80 leading-relaxed mb-5">
                Share your expertise, teach on your own terms, and connect with serious students in your city and online.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Link href="/register/tutor">
                  <Button className="bg-ivory-50 text-plum-950 hover:bg-white font-semibold text-xs sm:text-sm px-5 h-9 sm:h-10">
                    Register as Tutor
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="border-white/30 text-ivory-100 hover:bg-white/10 text-xs sm:text-sm px-4 h-9 sm:h-10 bg-transparent">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>

            <div className="shrink-0">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
                alt="Professional Tutor"
                className="w-40 h-40 sm:w-56 sm:h-56 object-cover rounded-2xl border-2 border-white/20 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Testimonials: Horizontal Swipeable on Mobile ─────────────────── */}
      <section className="py-8 sm:py-12 bg-ivory-100 dark:bg-[#0A242F]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-lg mx-auto mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#243238] dark:text-ivory-50">
              What Students Say
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Real reviews from our learning community</p>
          </div>

          <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 scrollbar-none snap-x snap-mandatory">
            {[
              {
                name: 'Aditya Sharma',
                role: 'JEE Aspirant',
                content: 'Found an amazing Physics tutor who helped me improve from 60% to 95% in mock tests. The verified system gave total peace of mind.',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
              },
              {
                name: 'Priya Patel',
                role: 'Class 10 Student',
                content: 'My Mathematics tutor explains concepts patiently. My exam scores jumped within 2 months of regular sessions.',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
              },
              {
                name: 'Rohan Gupta',
                role: 'NEET Aspirant',
                content: 'Found a Biology teacher in Kochi within 24 hours. The direct chat and transparent profile made choosing so easy.',
                avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
              }
            ].map((testimonial, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-[80vw] max-w-[320px] sm:w-auto sm:max-w-none p-5 rounded-2xl bg-white dark:bg-[#0F313E] border border-[#E2E5DF] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                </div>
                <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover border border-lavender-200"
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-ivory-100">{testimonial.name}</p>
                    <p className="text-[11px] text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
