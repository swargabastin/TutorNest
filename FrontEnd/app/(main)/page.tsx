'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TutorCard from '@/components/tutor-card';
import {
  Search,
  Star,
  Shield,
  Users,
  BookOpen,
  GraduationCap,
  CheckCircle,
  Sparkles,
  MapPin,
  ChevronRight,
  HelpCircle,
  Briefcase
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
  const [mobileTab, setMobileTab] = useState<'tutors' | 'how' | 'teach' | 'reviews'>('tutors');

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
    <div className="bg-ivory-100 dark:bg-[#0A242F] text-[#243238] dark:text-ivory-50">
      {/* ── 1. Compact Hero Section ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-plum-900 via-plum-800 to-[#0E3342] text-white overflow-hidden py-2 sm:py-12 lg:py-16">
        <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-lavender-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-plum-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto lg:mx-0 text-center lg:text-left">
            <h1 className="text-base sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-1 sm:mb-3 text-ivory-50">
              Find Verified 1-on-1 Tutors <span className="hidden sm:inline">Across India</span>
            </h1>
            <p className="hidden sm:block text-xs sm:text-base lg:text-lg text-ivory-200/80 mb-4 sm:mb-7 max-w-2xl leading-relaxed">
              Connect with verified experts for school boards, competitive exams (JEE/NEET), languages, and skills — online or in-person.
            </p>

            {/* Smart Unified Search Card */}
            <form
              onSubmit={handleSearch}
              className="bg-white dark:bg-[#0F313E] rounded-xl sm:rounded-2xl p-1 sm:p-3 shadow-lg border border-plum-900/20 max-w-2xl text-left"
            >
              <div className="flex items-center gap-1 sm:gap-3">
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Subject, exam, or tutor..."
                    className="w-full pl-8 pr-2 py-1 sm:py-2.5 text-xs sm:text-sm text-gray-900 dark:text-ivory-50 placeholder-gray-400 bg-transparent rounded-lg focus:outline-none"
                  />
                </div>

                <div className="relative shrink-0 sm:w-44">
                  <MapPin className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-auto sm:w-full pl-2 sm:pl-8 pr-2 sm:pr-7 py-1 sm:py-2.5 text-[11px] sm:text-sm text-gray-800 dark:text-ivory-100 bg-gray-100 sm:bg-gray-50/80 dark:bg-plum-950/60 rounded-md sm:rounded-xl border-none sm:border sm:border-gray-200/80 focus:outline-none cursor-pointer"
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
                  size="sm"
                  className="bg-plum-800 hover:bg-plum-900 text-white font-semibold py-1 sm:py-2 px-3 sm:px-5 h-7 sm:h-10 rounded-lg sm:rounded-xl shadow-xs text-xs sm:text-sm shrink-0"
                >
                  Find
                </Button>
              </div>

              {/* Mobile Quick Tap Filter Chips */}
              <div className="flex sm:hidden items-center gap-1 mt-1 pt-1 border-t border-gray-100 dark:border-plum-800/40 overflow-x-auto scrollbar-none text-[9px]">
                <Link
                  href="/search?freeDemo=true"
                  className="shrink-0 bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded border border-emerald-200/60"
                >
                  ⚡ Free Demo
                </Link>
                <Link
                  href="/search?board=CBSE"
                  className="shrink-0 bg-plum-50 text-plum-900 font-medium px-2 py-0.5 rounded border border-plum-200/60"
                >
                  CBSE
                </Link>
                <Link
                  href="/search?board=Kerala+State"
                  className="shrink-0 bg-plum-50 text-plum-900 font-medium px-2 py-0.5 rounded border border-plum-200/60"
                >
                  Kerala State
                </Link>
                <Link
                  href="/search?mode=online"
                  className="shrink-0 bg-sky-50 text-sky-800 font-medium px-2 py-0.5 rounded border border-sky-200/60"
                >
                  Online
                </Link>
              </div>
            </form>

            {/* Quick Stats Line */}
            <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-6 mt-1.5 sm:mt-5 text-[9px] sm:text-sm text-ivory-200/80">
              <span className="flex items-center gap-0.5">
                <Shield className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-lavender-300" /> 100% ID Verified
              </span>
              <span className="text-white/30">&bull;</span>
              <span className="flex items-center gap-0.5">
                <Star className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-amber-400 fill-amber-400" /> 4.9/5 Rating
              </span>
              <span className="text-white/30">&bull;</span>
              <span className="flex items-center gap-0.5">
                <Users className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-lavender-300" /> 45k+ Students
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Popular Subjects Strip ────────────────────────────────────────── */}
      <section className="py-1.5 sm:py-6 border-b border-[#E2E5DF] bg-white/50 dark:bg-[#0A242F]/50">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-1 sm:mb-3">
            <h2 className="text-xs sm:text-xl font-bold tracking-tight text-[#243238] dark:text-ivory-50 flex items-center gap-1">
              <span>Top Subjects</span>
            </h2>
            <Link
              href="/search"
              className="text-[10px] sm:text-xs font-semibold text-plum-800 hover:text-plum-900 flex items-center gap-0.5 shrink-0"
            >
              <span>See All</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex sm:grid sm:grid-cols-4 lg:grid-cols-7 gap-1 sm:gap-3 overflow-x-auto sm:overflow-visible pb-0.5 sm:pb-0 scrollbar-none snap-x">
            {subjects.slice(0, 14).map((subject) => (
              <Link
                key={subject}
                href={`/search?subject=${encodeURIComponent(subject)}`}
                className="snap-start shrink-0"
              >
                <div className="px-2 py-1 sm:p-2.5 rounded-md sm:rounded-xl bg-white dark:bg-[#0F313E] border border-[#E2E5DF] hover:border-plum-400 text-center transition-all flex sm:flex-col items-center justify-center gap-1 sm:gap-1.5 shadow-2xs">
                  <BookOpen className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-plum-800 dark:text-lavender-200 shrink-0" />
                  <p className="text-[10px] sm:text-xs font-medium text-gray-800 dark:text-ivory-100 whitespace-nowrap sm:whitespace-normal">
                    {subject}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. MOBILE ONLY: App-Style Segmented Navigation (< md) ───────────── */}
      <div className="md:hidden container mx-auto px-3 pt-2">
        <div className="flex items-center bg-white dark:bg-[#0F313E] p-0.5 rounded-lg border border-[#E2E5DF] shadow-2xs gap-0.5">
          <button
            onClick={() => setMobileTab('tutors')}
            className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all text-center ${
              mobileTab === 'tutors'
                ? 'bg-plum-800 text-white shadow-2xs'
                : 'text-gray-600 hover:text-plum-800'
            }`}
          >
            🌟 Tutors
          </button>
          <button
            onClick={() => setMobileTab('how')}
            className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all text-center ${
              mobileTab === 'how'
                ? 'bg-plum-800 text-white shadow-2xs'
                : 'text-gray-600 hover:text-plum-800'
            }`}
          >
            💡 How
          </button>
          <button
            onClick={() => setMobileTab('teach')}
            className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all text-center ${
              mobileTab === 'teach'
                ? 'bg-plum-800 text-white shadow-2xs'
                : 'text-gray-600 hover:text-plum-800'
            }`}
          >
            🎓 Teach
          </button>
          <button
            onClick={() => setMobileTab('reviews')}
            className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all text-center ${
              mobileTab === 'reviews'
                ? 'bg-plum-800 text-white shadow-2xs'
                : 'text-gray-600 hover:text-plum-800'
            }`}
          >
            ⭐ Reviews
          </button>
        </div>
      </div>

      {/* ── 4. MOBILE TAB CONTENT (< md) ─────────────────────────────────────── */}
      <div className="md:hidden container mx-auto px-3 py-2">
        {mobileTab === 'tutors' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-gray-800 dark:text-ivory-100">
                Top Rated Instructors
              </span>
              <Link href="/search" className="text-[10px] font-semibold text-plum-800 flex items-center">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
              {featuredTutors.map((tutor) => (
                <div key={tutor.id} className="snap-start shrink-0 w-[84vw] max-w-[320px]">
                  <TutorCard tutor={tutor} />
                </div>
              ))}
            </div>
          </div>
        )}

        {mobileTab === 'how' && (
          <div className="bg-white dark:bg-[#0F313E] p-2.5 rounded-xl border border-[#E2E5DF] shadow-2xs">
            <h3 className="text-xs font-bold text-gray-900 dark:text-ivory-50 mb-2">How TutorNest Works</h3>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-1.5 rounded-lg bg-plum-50/60 dark:bg-plum-950/40">
                <Search className="h-4 w-4 mx-auto text-plum-800 mb-1" />
                <p className="text-[10px] font-bold text-gray-900">1. Search</p>
                <p className="text-[8px] text-gray-500">Filter board &amp; city</p>
              </div>
              <div className="p-1.5 rounded-lg bg-plum-50/60 dark:bg-plum-950/40">
                <CheckCircle className="h-4 w-4 mx-auto text-plum-800 mb-1" />
                <p className="text-[10px] font-bold text-gray-900">2. Connect</p>
                <p className="text-[8px] text-gray-500">Chat &amp; free demo</p>
              </div>
              <div className="p-1.5 rounded-lg bg-plum-50/60 dark:bg-plum-950/40">
                <GraduationCap className="h-4 w-4 mx-auto text-plum-800 mb-1" />
                <p className="text-[10px] font-bold text-gray-900">3. Learn</p>
                <p className="text-[8px] text-gray-500">1-on-1 classes</p>
              </div>
            </div>
          </div>
        )}

        {mobileTab === 'teach' && (
          <div className="bg-gradient-to-r from-plum-900 via-plum-800 to-[#0E3342] rounded-xl p-3 text-white flex items-center justify-between gap-2 shadow-sm">
            <div>
              <span className="text-[9px] text-ivory-200 font-medium">Teach &bull; Earn &bull; Impact</span>
              <p className="text-xs font-bold text-white">Become a Verified Tutor</p>
            </div>
            <Link href="/register/tutor">
              <Button size="sm" className="bg-ivory-50 text-plum-950 hover:bg-white text-[11px] font-semibold h-7 px-3 rounded-lg shadow-2xs">
                Register
              </Button>
            </Link>
          </div>
        )}

        {mobileTab === 'reviews' && (
          <div className="bg-white dark:bg-[#0F313E] p-2.5 rounded-xl border border-[#E2E5DF] shadow-2xs">
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
              ))}
              <span className="text-[10px] font-bold text-gray-800 ml-1">4.9/5 Student Rating</span>
            </div>
            <p className="text-[10px] text-gray-600 dark:text-gray-300 italic mb-1.5">
              &ldquo;Found an amazing Physics tutor who helped me improve from 60% to 95% in mock tests. Verified system gave total peace of mind.&rdquo;
            </p>
            <p className="text-[9px] font-semibold text-gray-900 dark:text-ivory-100">Aditya Sharma &bull; JEE Aspirant</p>
          </div>
        )}
      </div>

      {/* ── 5. DESKTOP ONLY: Full Multi-Section Layout (>= md) ───────────────── */}
      <div className="hidden md:block">
        {/* Featured Tutors */}
        <section className="py-8 bg-white dark:bg-[#0D2B37] border-b border-[#E2E5DF]">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-[#243238] dark:text-ivory-50">
                  Featured Tutors
                </h2>
                <Badge variant="secondary" className="bg-lavender-100 text-plum-900 text-[11px] font-semibold px-2">
                  Top Rated
                </Badge>
              </div>
              <Link href="/search" className="text-sm font-semibold text-plum-800 hover:text-plum-900 flex items-center gap-0.5">
                <span>View All</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          </div>
        </section>

        {/* How TutorNest Works */}
        <section className="py-8 bg-ivory-50 dark:bg-[#0A242F] border-b border-[#E2E5DF]">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-[#243238] dark:text-ivory-50">
                How TutorNest Works
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Get started in three easy steps</p>
            </div>
            <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { step: '1', title: 'Search & Compare', desc: 'Filter verified tutors by subject, city, fee, and teaching mode.', icon: Search },
                { step: '2', title: 'Connect Directly', desc: 'Chat with matching tutors, discuss requirements, and book trial.', icon: CheckCircle },
                { step: '3', title: 'Learn & Succeed', desc: 'Experience tailored 1-on-1 learning with secure session management.', icon: GraduationCap },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center p-5 rounded-2xl bg-white dark:bg-[#0F313E] border border-[#E2E5DF] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-plum-50 dark:bg-plum-950 flex items-center justify-center text-plum-800 dark:text-lavender-300 font-bold mb-2">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-ivory-50 leading-tight mb-1">{item.step}. {item.title}</h3>
                  <p className="text-xs text-gray-500 leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Become a Tutor Banner */}
        <section className="py-8 bg-white dark:bg-[#0D2B37] border-b border-[#E2E5DF]">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="bg-gradient-to-r from-plum-900 via-plum-800 to-[#0E3342] rounded-2xl p-8 text-white flex items-center justify-between gap-6 shadow-md">
              <div className="max-w-xl text-left">
                <Badge className="bg-white/15 text-ivory-100 border-none text-xs mb-2 px-2 py-0.5">For Teachers &amp; Educators</Badge>
                <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-2 text-ivory-50">Become a Tutor on TutorNest</h2>
                <p className="text-sm text-ivory-200/80 leading-relaxed mb-5">Share your expertise, teach on your own terms, and connect with serious students in your city and online.</p>
                <div className="flex items-center gap-3">
                  <Link href="/register/tutor">
                    <Button className="bg-ivory-50 text-plum-950 hover:bg-white font-semibold text-sm px-5 h-10 rounded-xl">Register as Tutor</Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" className="border-white/30 text-ivory-100 hover:bg-white/10 text-sm px-4 h-10 rounded-xl bg-transparent">View Pricing</Button>
                  </Link>
                </div>
              </div>
              <div className="shrink-0">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80" alt="Professional Tutor" className="w-36 h-36 lg:w-48 lg:h-48 object-cover rounded-2xl border-2 border-white/20 shadow-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Student Reviews */}
        <section className="py-8 bg-ivory-100 dark:bg-[#0A242F]">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-lg mx-auto mb-5">
              <h2 className="text-2xl font-bold tracking-tight text-[#243238] dark:text-ivory-50">What Students Say</h2>
              <p className="text-sm text-gray-500 mt-0.5">Real reviews from our learning community</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'Aditya Sharma', role: 'JEE Aspirant', content: 'Found an amazing Physics tutor who helped me improve from 60% to 95% in mock tests. Verified system gave total peace of mind.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
                { name: 'Priya Patel', role: 'Class 10 Student', content: 'My Mathematics tutor explains concepts patiently. My exam scores jumped within 2 months of regular sessions.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
                { name: 'Rohan Gupta', role: 'NEET Aspirant', content: 'Found a Biology teacher in Kochi within 24 hours. The direct chat and transparent profile made choosing so easy.', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' }
              ].map((testimonial, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#0F313E] border border-[#E2E5DF] shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">&ldquo;{testimonial.content}&rdquo;</p>
                  </div>
                  <div className="flex items-center space-x-2.5 pt-2.5 border-t border-gray-100 dark:border-gray-800">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover border border-lavender-200" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-ivory-100">{testimonial.name}</p>
                      <p className="text-xs text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
