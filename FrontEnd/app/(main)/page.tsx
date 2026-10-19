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
  Play
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { tutorsApi, lookupsApi } from '@/lib/api';
import type { Tutor } from '@/lib/types';

export default function Home() {
  const [featuredTutors, setFeaturedTutors] = useState<Tutor[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    tutorsApi
      .search({ sortBy: 'rating', page: 1, pageSize: 3 })
      .then((res) => setFeaturedTutors(res.items))
      .catch((err) => console.error('Failed to load featured tutors', err));

    lookupsApi
      .getSubjects()
      .then((subs) => setSubjects(subs.map((s) => s.name)))
      .catch((err) => console.error('Failed to load subjects', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <div className="max-w-3xl">
            <Badge className="bg-white/20 text-white border-teal-300 mb-6">
              Trusted by 45,000+ Students
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Find the Perfect Tutor for Your Learning Journey
            </h1>
            <p className="text-lg md:text-xl text-teal-100 mb-8 leading-relaxed">
              Connect with verified, experienced tutors across India. Whether you need help with
              school subjects, competitive exams, or skill development, we have the right tutor for you.
            </p>

            {/* Search Box */}
            <div className="bg-white rounded-xl shadow-xl p-4 max-w-2xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="What do you want to learn?"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="md:w-48">
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">Select city</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="delhi">Delhi</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="hyderabad">Hyderabad</option>
                    <option value="chennai">Chennai</option>
                    <option value="pune">Pune</option>
                  </select>
                </div>
                <Link href="/search">
                  <Button className="w-full md:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700">
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-8 mt-8 text-teal-100">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span><strong className="text-white">15,000+</strong> Verified Tutors</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                <span><strong className="text-white">45,000+</strong> Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span><strong className="text-white">4.8</strong> Avg Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How TutorNest Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find your ideal tutor in just 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                step: '01',
                title: 'Search & Compare',
                description: 'Search for tutors based on subject, location, budget, and preferences. Compare profiles and reviews.'
              },
              {
                icon: CheckCircle,
                step: '02',
                title: 'Connect & Discuss',
                description: 'Contact tutors directly to discuss your requirements, schedule, and teaching approach.'
              },
              {
                icon: GraduationCap,
                step: '03',
                title: 'Start Learning',
                description: 'Book your sessions and begin your personalized learning journey with your chosen tutor.'
              }
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-teal-100 text-teal-600 mb-6">
                  <item.icon className="h-10 w-10" />
                </div>
                <div className="absolute top-0 right-8 text-5xl font-bold text-gray-100">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Subjects */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Subjects</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our most sought-after subjects and find expert tutors
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {subjects.map((subject) => (
              <Link
                key={subject}
                href={`/search?subject=${encodeURIComponent(subject)}`}
                className="group"
              >
                <Card className="h-full hover:shadow-md transition-all duration-200 hover:border-teal-300 cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                      <BookOpen className="h-6 w-6 text-teal-600" />
                    </div>
                    <p className="font-medium text-gray-900">{subject}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Tutors</h2>
              <p className="text-lg text-gray-600">Top-rated tutors with proven track records</p>
            </div>
            <Link href="/search">
              <Button variant="outline" className="mt-4 md:mt-0">
                View All Tutors <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6">
            {featuredTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose TutorNest?</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              We make finding the right tutor simple, safe, and effective
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Tutors',
                description: 'All our tutors go through a thorough verification process for your safety.'
              },
              {
                icon: Star,
                title: 'Quality Assured',
                description: 'Tutors are rated by students, ensuring you get the best learning experience.'
              },
              {
                icon: Clock,
                title: 'Flexible Scheduling',
                description: 'Find tutors who match your schedule, whether online or in-person.'
              },
              {
                icon: Award,
                title: 'Best Value',
                description: 'Compare rates and find tutors that fit your budget without compromising quality.'
              }
            ].map((item, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-teal-500/20 text-teal-400 mb-4">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Tutor CTA */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-8 md:p-12 lg:p-16 text-white flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Become a Tutor on TutorNest</h2>
              <p className="text-lg text-teal-100 mb-6">
                Share your knowledge, build your teaching career, and earn on your own schedule.
                Join thousands of tutors making a difference in students' lives.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register/tutor">
                  <Button className="bg-white text-teal-600 hover:bg-gray-100 px-8">
                    Register as Tutor
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                    <Play className="mr-2 h-5 w-5" />
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1544717305-278664924168?w=400"
                alt="Teaching"
                className="w-80 h-80 object-cover rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Students Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real experiences from students who found their perfect tutors
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Aditya Sharma',
                role: 'JEE Aspirant',
                content: 'Found an amazing Physics tutor who helped me improve from 60% to 95% in my mock tests. The platform made it so easy to compare and choose.',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
              },
              {
                name: 'Priya Patel',
                role: 'Class 10 Student',
                content: 'My Mathematics tutor is incredibly patient and explains concepts beautifully. My grades improved significantly within just 2 months.',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
              },
              {
                name: 'Rohan Gupta',
                role: 'NEET Aspirant',
                content: 'The verification system gave me confidence that I was choosing a qualified tutor. Best decision for my preparation journey.',
                avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd9b?w=100'
              }
            ].map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">{testimonial.content}</p>
                  <div className="flex items-center space-x-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-teal-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-lg text-teal-100 mb-8 max-w-2xl mx-auto">
            Find your perfect tutor today and begin your journey to academic success.
          </p>
          <Link href="/search">
            <Button className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-3 text-lg">
              Find a Tutor Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
