'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin, Monitor, BookOpen, Clock, Users, CheckCircle, Heart, Play, ShieldCheck } from 'lucide-react';
import { Tutor } from '@/lib/types';

interface TutorCardProps {
  tutor: Tutor;
}

export default function TutorCard({ tutor }: TutorCardProps) {
  return (
    <Card className="overflow-hidden bg-white border border-[#E2E5DF] hover:border-plum-300 hover:shadow-md transition-all duration-300 rounded-xl">
      <CardContent className="p-3.5 sm:p-6">
        <div className="flex flex-row gap-3 sm:gap-5 items-start">
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-14 h-14 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-lavender-200"
              />
              {tutor.verified && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-plum-800 rounded-full p-0.5 sm:p-1 shadow-sm">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between gap-1.5 mb-1 sm:mb-2">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-xl font-bold text-[#243238] flex items-center gap-1.5 flex-wrap leading-tight">
                  <span className="truncate">{tutor.name}</span>
                  {tutor.idVerified && (
                    <Badge variant="secondary" className="bg-plum-50 text-plum-900 border border-plum-200 font-medium text-[9px] sm:text-[10px] px-1 py-0 sm:px-1.5 sm:py-0.5">
                      🛡️ ID
                    </Badge>
                  )}
                  {tutor.qualificationVerified && (
                    <Badge variant="secondary" className="bg-plum-50 text-plum-900 border border-plum-200 font-medium text-[9px] sm:text-[10px] px-1 py-0 sm:px-1.5 sm:py-0.5">
                      🎓 Degree
                    </Badge>
                  )}
                  {tutor.offersFreeDemo && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold text-[10px] sm:text-[11px] px-1.5 py-0">
                      Free Demo
                    </Badge>
                  )}
                  {tutor.introVideoUrl && (
                    <span className="inline-flex items-center text-[9px] sm:text-[10px] text-plum-800 bg-plum-50 border border-plum-200 rounded px-1 py-0 font-medium">
                      <Play className="h-2 w-2 mr-0.5 fill-plum-800" /> Video
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">{tutor.qualification}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-base sm:text-2xl font-bold text-plum-900 leading-tight">
                  ₹{tutor.hourlyRate}
                  <span className="text-[10px] sm:text-xs font-normal text-gray-500">/hr</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-4 gap-y-1 text-[11px] sm:text-sm text-gray-600 mb-1.5 sm:mb-3">
              <div className="flex items-center">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 fill-amber-500 mr-0.5" />
                <span className="font-semibold text-gray-900">{tutor.rating}</span>
                <span className="text-gray-400 ml-0.5">({tutor.reviewCount})</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 mr-0.5" />
                <span>{tutor.experience}y exp</span>
              </div>
              <div className="flex items-center truncate">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 mr-0.5 shrink-0" />
                <span className="truncate">{tutor.locality ? `${tutor.locality}, ${tutor.location}` : tutor.location}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
              {tutor.subjects.slice(0, 3).map((subject) => (
                <Badge key={subject} variant="outline" className="border-plum-200/80 bg-plum-50/50 text-plum-900 text-[10px] sm:text-xs py-0 sm:py-0.5 font-normal">
                  {subject}
                </Badge>
              ))}
              {tutor.boards?.slice(0, 2).map((board) => (
                <Badge key={board} variant="secondary" className="bg-lavender-100 text-plum-950 font-medium text-[10px] sm:text-[11px] py-0 sm:py-0.5 px-1.5 sm:px-2">
                  {board}
                </Badge>
              ))}
            </div>

            <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-1 sm:line-clamp-2 leading-relaxed">{tutor.bio}</p>

            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {tutor.responseTime}
                </span>
                {tutor.mode.includes('online') && (
                  <Badge variant="secondary" className="bg-lavender-100 text-plum-800 text-[10px] sm:text-[11px] px-1 py-0">
                    <Monitor className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 inline" /> Online
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link href={`/tutor/${tutor.id}`}>
                  <Button size="sm" className="bg-plum-800 hover:bg-plum-900 text-white font-medium text-[11px] sm:text-xs px-2.5 sm:px-3.5 h-7 sm:h-8 rounded-lg">
                    Profile
                  </Button>
                </Link>
                <Link href={`/messages?tutor=${tutor.id}`}>
                  <Button variant="outline" size="sm" className="border-[#E2E5DF] text-gray-700 hover:text-plum-900 text-[11px] sm:text-xs px-2.5 sm:px-3 h-7 sm:h-8 rounded-lg">
                    Chat
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
