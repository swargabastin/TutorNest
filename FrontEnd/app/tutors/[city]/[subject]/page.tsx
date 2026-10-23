import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import TutorCard from '@/components/tutor-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin,
  BookOpen,
  Star,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const CITIES: Record<string, string> = {
  kochi: 'Kochi',
  thiruvananthapuram: 'Thiruvananthapuram',
  kozhikode: 'Kozhikode',
  thrissur: 'Thrissur',
  kollam: 'Kollam',
  kottayam: 'Kottayam',
  kannur: 'Kannur',
  palakkad: 'Palakkad',
  alappuzha: 'Alappuzha',
  malappuram: 'Malappuram',
};

const SUBJECTS: Record<string, string> = {
  mathematics: 'Mathematics',
  maths: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  english: 'English',
  'computer-science': 'Computer Science',
  accountancy: 'Accountancy',
  economics: 'Economics',
  hindi: 'Hindi',
  malayalam: 'Malayalam',
};

interface PageProps {
  params: {
    city: string;
    subject: string;
  };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const cityKey = params.city.toLowerCase();
  const subjectKey = params.subject.toLowerCase();

  const cityName = CITIES[cityKey] || params.city.charAt(0).toUpperCase() + params.city.slice(1);
  const subjectName = SUBJECTS[subjectKey] || params.subject.charAt(0).toUpperCase() + params.subject.slice(1);

  const title = `Top ${subjectName} Tutors in ${cityName} | Verified Home & Online Tuition | TutorNest`;
  const description = `Find verified, high-rated ${subjectName} private tutors in ${cityName}, Kerala. Book free 30-min trial sessions, compare fees, and choose from CBSE, ICSE, and Kerala State boards.`;
  const canonicalUrl = `https://tutor-nest-delta.vercel.app/tutors/${cityKey}/${subjectKey}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'TutorNest',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

// Fetch tutors on server
async function getTutors(cityName: string, subjectName: string) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://tutornest-api.onrender.com/api';
    const res = await fetch(
      `${apiBase}/tutors/search?city=${encodeURIComponent(cityName)}&subject=${encodeURIComponent(subjectName)}&pageSize=9`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error('Failed to load programmatic tutors', err);
    return [];
  }
}

export default async function ProgrammaticTutorPage({ params }: PageProps) {
  const cityKey = params.city.toLowerCase();
  const subjectKey = params.subject.toLowerCase();

  const cityName = CITIES[cityKey] || params.city.charAt(0).toUpperCase() + params.city.slice(1);
  const subjectName = SUBJECTS[subjectKey] || params.subject.charAt(0).toUpperCase() + params.subject.slice(1);

  const rawTutors = await getTutors(cityName, subjectName);

  // Map to frontend Tutor type shape
  const tutors = (rawTutors || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    avatar: t.avatar || '',
    subjects: t.subjects || [],
    experience: t.experience || 0,
    rating: t.rating || 0,
    reviewCount: t.reviewCount || 0,
    hourlyRate: t.hourlyRate || 0,
    location: t.location || cityName,
    mode: ['both' as const],
    qualification: t.qualification || '',
    bio: t.bio || '',
    verified: t.isVerified || false,
    languages: t.languages || [],
    teachingLevels: t.teachingLevels || [],
    responseTime: t.responseTime || '',
    studentsTaught: t.studentsTaught || 0,
    locality: t.locality,
    pincode: t.pincode,
    boards: t.boards || [],
    offersFreeDemo: t.offersFreeDemo ?? true,
    idVerified: t.idVerified,
    qualificationVerified: t.qualificationVerified,
    policeCheckVerified: t.policeCheckVerified,
    introVideoUrl: t.introVideoUrl,
  }));

  // Structured Data (JSON-LD)
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://tutor-nest-delta.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `Tutors in ${cityName}`,
        item: `https://tutor-nest-delta.vercel.app/search?city=${encodeURIComponent(cityName)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${subjectName} Tutors in ${cityName}`,
        item: `https://tutor-nest-delta.vercel.app/tutors/${cityKey}/${subjectKey}`,
      },
    ],
  };

  const educationalOrgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: `TutorNest — ${subjectName} Tutoring in ${cityName}`,
    url: `https://tutor-nest-delta.vercel.app/tutors/${cityKey}/${subjectKey}`,
    description: `Private home and online ${subjectName} tuition in ${cityName}, Kerala. Certified tutors for CBSE, ICSE, and State Board.`,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: `${cityName}, Kerala`,
    },
  };

  const otherSubjects = Object.entries(SUBJECTS)
    .filter(([k]) => k !== subjectKey && k !== 'maths')
    .slice(0, 6);

  const otherCities = Object.entries(CITIES)
    .filter(([k]) => k !== cityKey)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-[#F6F3EA] text-[#243238] flex flex-col">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalOrgJsonLd) }}
      />

      <Header />

      {/* Breadcrumbs */}
      <div className="border-b border-[#E2E5DF] bg-white">
        <div className="container mx-auto px-4 py-2.5 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-plum-900 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link href={`/search?city=${encodeURIComponent(cityName)}`} className="hover:text-plum-900 transition-colors">
            {cityName}
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-plum-950">{subjectName} Tutors</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white to-[#F6F3EA] border-b border-[#E2E5DF] py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-3">
          <Badge className="bg-plum-50 text-plum-900 border border-plum-200 text-xs px-3 py-1 rounded-full font-bold">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-plum-700" />
            Verified {cityName} Tutors
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#243238]">
            Top <span className="text-plum-900">{subjectName}</span> Tutors in {cityName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect with verified private and home tutors in {cityName} for CBSE, ICSE, and Kerala State Syllabus.
            Compare qualifications, hourly rates, and schedule an introductory 30-minute free demo session.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/post-requirement">
              <Button className="bg-plum-900 hover:bg-plum-950 text-white rounded-xl text-xs font-bold h-10 px-5 shadow-xs">
                + Post Tuition Requirement
              </Button>
            </Link>
            <Link href={`/search?city=${encodeURIComponent(cityName)}&subject=${encodeURIComponent(subjectName)}`}>
              <Button variant="outline" className="border-[#E2E5DF] text-[#243238] hover:bg-plum-50 rounded-xl text-xs font-bold h-10 px-5">
                Explore All Filters
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8 max-w-6xl flex-1 space-y-10">
        {/* Results Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E5DF]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#243238]">
              Available {subjectName} Tutors in {cityName}
            </h2>
            <p className="text-xs text-slate-500">
              Showing {tutors.length} verified educators matching your criteria
            </p>
          </div>
          <Link href="/search" className="text-xs font-semibold text-plum-900 hover:underline">
            View All Tutors →
          </Link>
        </div>

        {/* Tutors Grid */}
        {tutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tutors.map((tutor: any) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        ) : (
          <Card className="border-[#E2E5DF] bg-white rounded-3xl p-8 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-plum-50 text-plum-900 rounded-2xl flex items-center justify-center mx-auto">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#243238]">No Tutors Listed Yet in this Exact Category</h3>
              <p className="text-xs text-slate-500 mt-1">
                Post your tuition requirement for {subjectName} in {cityName}. Verified tutors in Kerala will review and respond to you directly.
              </p>
            </div>
            <Link href="/post-requirement" className="block">
              <Button className="w-full bg-plum-900 hover:bg-plum-950 text-white rounded-xl text-xs font-bold h-10">
                Post {subjectName} Requirement
              </Button>
            </Link>
          </Card>
        )}

        {/* Why TutorNest in this city */}
        <div className="grid sm:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl border border-[#E2E5DF] bg-white space-y-2">
            <ShieldCheck className="h-6 w-6 text-plum-900" />
            <h3 className="text-sm font-bold text-[#243238]">Verified Government ID & Degrees</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every tutor undergoes background verification, certificate audit, and address confirmation before home tutoring approval.
            </p>
          </div>
          <div className="p-5 rounded-2xl border border-[#E2E5DF] bg-white space-y-2">
            <CheckCircle className="h-6 w-6 text-emerald-700" />
            <h3 className="text-sm font-bold text-[#243238]">1st Class Free Demo</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Test teaching chemistry and curriculum mastery with an introductory 30-minute free trial before confirming regular batches.
            </p>
          </div>
          <div className="p-5 rounded-2xl border border-[#E2E5DF] bg-white space-y-2">
            <MapPin className="h-6 w-6 text-plum-900" />
            <h3 className="text-sm font-bold text-[#243238]">Hyperlocal in {cityName}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Find tutors living within your neighborhood or immediate travel radius for punctual, weekly home classes.
            </p>
          </div>
        </div>

        {/* Frequently Asked Questions (SEO Structured Content) */}
        <div className="space-y-4 pt-4 border-t border-[#E2E5DF]">
          <h2 className="text-base sm:text-lg font-bold text-[#243238]">
            Frequently Asked Questions — {subjectName} Tuition in {cityName}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#E2E5DF] bg-white space-y-1.5">
              <h4 className="text-xs font-bold text-[#243238]">
                How much do {subjectName} tutors charge in {cityName}?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hourly tutoring rates in {cityName} typically range from ₹300/hr to ₹800/hr depending on whether the student is in primary school, Class 10 (SSLC/CBSE), or Class 12 Plus Two board exams.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[#E2E5DF] bg-white space-y-1.5">
              <h4 className="text-xs font-bold text-[#243238]">
                Can I request a free demo class for {subjectName}?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes! Most tutors on TutorNest offer a 30-minute free trial session without any coin deductions. You can book directly from the tutor's profile page.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[#E2E5DF] bg-white space-y-1.5">
              <h4 className="text-xs font-bold text-[#243238]">
                Which school boards are supported in {cityName}?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                TutorNest educators cover CBSE, ICSE, Kerala State Syllabus (SCERT/Plus Two), ISC, IGCSE, and IB boards for English and Malayalam mediums.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[#E2E5DF] bg-white space-y-1.5">
              <h4 className="text-xs font-bold text-[#243238]">
                Is home tuition available in my locality?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes. Tutors list their preferred travel radius and local neighborhoods across {cityName}. Both offline home tutoring and interactive 1-on-1 online classes are available.
              </p>
            </div>
          </div>
        </div>

        {/* Internal Linking SEO Grid */}
        <div className="space-y-4 pt-4 border-t border-[#E2E5DF]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Explore Other Subjects & Cities in Kerala
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Other Subjects in {cityName}:</p>
              <div className="flex flex-wrap gap-1.5">
                {otherSubjects.map(([slug, name]) => (
                  <Link
                    key={slug}
                    href={`/tutors/${cityKey}/${slug}`}
                    className="text-xs px-2.5 py-1 rounded-lg border border-[#E2E5DF] bg-white hover:bg-plum-50 hover:text-plum-900 transition-colors"
                  >
                    {name} in {cityName}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">{subjectName} in Other Kerala Cities:</p>
              <div className="flex flex-wrap gap-1.5">
                {otherCities.map(([slug, name]) => (
                  <Link
                    key={slug}
                    href={`/tutors/${slug}/${subjectKey}`}
                    className="text-xs px-2.5 py-1 rounded-lg border border-[#E2E5DF] bg-white hover:bg-plum-50 hover:text-plum-900 transition-colors"
                  >
                    {subjectName} in {name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
