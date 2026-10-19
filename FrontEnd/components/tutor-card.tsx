'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin, Monitor, BookOpen, Award, Clock, Users, CheckCircle } from 'lucide-react';
import { Tutor } from '@/lib/types';

interface TutorCardProps {
  tutor: Tutor;
}

export default function TutorCard({ tutor }: TutorCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-teal-100"
              />
              {tutor.verified && (
                <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full p-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-grow">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {tutor.name}
                  {tutor.verified && (
                    <Badge variant="secondary" className="ml-2 bg-teal-100 text-teal-700">
                      Verified
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{tutor.qualification}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-600">
                  ₹{tutor.hourlyRate}
                  <span className="text-sm font-normal text-gray-500">/hour</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="font-medium text-gray-900">{tutor.rating}</span>
                <span className="mx-1">({tutor.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 text-gray-400 mr-1" />
                <span>{tutor.experience} years exp</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                <span>{tutor.location}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {tutor.subjects.map((subject) => (
                <Badge key={subject} variant="outline" className="border-teal-200 text-teal-700">
                  {subject}
                </Badge>
              ))}
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tutor.bio}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {tutor.responseTime}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {tutor.studentsTaught} students
              </div>
              <div className="flex items-center">
                {tutor.mode.includes('online') && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 mr-2">
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

            <div className="flex flex-wrap gap-3">
              <Link href={`/tutor/${tutor.id}`}>
                <Button>View Profile</Button>
              </Link>
              <Button variant="outline">Contact Tutor</Button>
              <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
