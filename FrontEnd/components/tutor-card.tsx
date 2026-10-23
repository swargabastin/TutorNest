'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin, Monitor, BookOpen, Clock, Users, CheckCircle, Heart } from 'lucide-react';
import { Tutor } from '@/lib/types';

interface TutorCardProps {
  tutor: Tutor;
}

export default function TutorCard({ tutor }: TutorCardProps) {
  return (
    <Card className="overflow-hidden bg-white border border-[#E7E3EB] hover:border-plum-300 hover:shadow-md transition-all duration-300 rounded-xl">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex-shrink-0 self-start sm:self-auto">
            <div className="relative">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-lavender-200"
              />
              {tutor.verified && (
                <div className="absolute -bottom-1 -right-1 bg-plum-800 rounded-full p-1 shadow-sm">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-grow">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#1F1924] flex items-center gap-2">
                  <span>{tutor.name}</span>
                  {tutor.verified && (
                    <Badge variant="secondary" className="bg-lavender-100 text-plum-900 border-none font-medium text-xs">
                      Verified
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{tutor.qualification}</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xl sm:text-2xl font-bold text-plum-900">
                  ₹{tutor.hourlyRate}
                  <span className="text-xs font-normal text-gray-500">/hr</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                <span className="font-semibold text-gray-900">{tutor.rating}</span>
                <span className="text-gray-400 ml-1">({tutor.reviewCount})</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-3.5 w-3.5 text-gray-400 mr-1" />
                <span>{tutor.experience}y exp</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-3.5 w-3.5 text-gray-400 mr-1" />
                <span>{tutor.location}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {tutor.subjects.map((subject) => (
                <Badge key={subject} variant="outline" className="border-plum-200/80 bg-plum-50/50 text-plum-900 text-xs py-0.5 font-normal">
                  {subject}
                </Badge>
              ))}
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{tutor.bio}</p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {tutor.responseTime}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {tutor.studentsTaught} taught
                </span>
                {tutor.mode.includes('online') && (
                  <Badge variant="secondary" className="bg-lavender-100 text-plum-800 text-[11px] px-1.5 py-0">
                    <Monitor className="h-3 w-3 mr-0.5 inline" /> Online
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/tutor/${tutor.id}`}>
                  <Button size="sm" className="bg-plum-800 hover:bg-plum-900 text-white font-medium text-xs px-3.5 h-8">
                    View Profile
                  </Button>
                </Link>
                <Link href={`/messages?tutor=${tutor.id}`}>
                  <Button variant="outline" size="sm" className="border-[#E7E3EB] text-gray-700 hover:text-plum-900 text-xs px-3 h-8">
                    Contact
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
