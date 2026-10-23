'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Video, MapPin, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { bookingsApi, Booking } from '@/lib/api';

interface ScheduleCardProps {
  userRole: 'Tutor' | 'Student';
}

export function LiveScheduleCard({ userRole }: ScheduleCardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});

  const loadBookings = () => {
    setLoading(true);
    bookingsApi.getMyBookings()
      .then(setBookings)
      .catch((err) => console.error('Failed to load bookings', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'Confirmed' | 'Cancelled' | 'Completed') => {
    setActioningId(id);
    try {
      await bookingsApi.updateStatus(id, {
        status,
        meetingLink: meetingLinks[id],
      });
      loadBookings();
    } catch (err) {
      console.error('Failed to update booking status', err);
    } finally {
      setActioningId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Confirmed</Badge>;
      case 'Completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">Pending</Badge>;
    }
  };

  return (
    <Card className="h-full border-[#EADDD0] bg-white rounded-2xl shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-[#1F1924]">
          <Calendar className="h-4 w-4 text-plum-800" />
          {userRole === 'Tutor' ? "Today's & Upcoming Classes" : "My Scheduled Classes"}
        </CardTitle>
        <span className="text-[11px] text-slate-500 font-medium">
          {bookings.filter(b => b.status === 'Confirmed').length} Active
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-slate-500 text-xs py-4 text-center">Loading schedule…</p>
        ) : bookings.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-8">
            <Clock className="h-7 w-7 mx-auto mb-2 text-slate-300" />
            No sessions scheduled yet.
            <br />
            <span className="text-[11px] text-slate-400 mt-1 block">
              {userRole === 'Tutor'
                ? 'Session requests from students will appear here.'
                : 'Book a session directly from a tutor profile!'}
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {bookings.slice(0, 5).map((booking) => {
              const startDate = new Date(booking.startTime);
              const isConfirmed = booking.status === 'Confirmed';
              const isPending = booking.status === 'Pending';

              return (
                <div key={booking.id} className="p-3 rounded-xl border border-[#EADDD0] bg-[#FAF8F5] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-[#1F1924]">
                        {userRole === 'Tutor' ? booking.studentName : booking.tutorName}
                      </span>
                      <span className="text-xs text-slate-500 ml-1.5">({booking.subject})</span>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {startDate.toLocaleDateString('en-IN')} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      {booking.mode === 'Online' ? <Video className="h-3 w-3 text-plum-800" /> : <MapPin className="h-3 w-3 text-slate-400" />}
                      {booking.mode}
                    </span>
                    {booking.isTrial && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300 font-bold">
                        🎉 FREE DEMO
                      </Badge>
                    )}
                    {booking.gradeLevel && (
                      <span className="text-[11px] bg-white text-plum-900 px-1.5 py-0.5 rounded border border-[#EADDD0] font-medium">
                        {booking.gradeLevel}
                      </span>
                    )}
                  </div>

                  {booking.locationAddress && booking.mode !== 'Online' && (
                    <div className="text-[11px] text-slate-600 flex items-start gap-1">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                      <span>{booking.locationAddress}</span>
                    </div>
                  )}

                  {booking.studentNotes && (
                    <div className="text-[11px] text-slate-600 bg-white/70 p-1.5 rounded-lg border border-[#EADDD0] italic">
                      “{booking.studentNotes}”
                    </div>
                  )}

                  {booking.meetingLink && (
                    <div className="pt-1">
                      <a
                        href={booking.meetingLink.startsWith('http') ? booking.meetingLink : `https://${booking.meetingLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-plum-900 hover:underline font-semibold gap-1"
                      >
                        Join Class Online <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* Actions for Student on Pending bookings */}
                  {userRole === 'Student' && isPending && (
                    <div className="pt-2 border-t border-[#F0E6DB] flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Awaiting tutor confirmation</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 border-[#EADDD0] text-rose-700 hover:bg-rose-50 rounded-lg px-2"
                        disabled={actioningId === booking.id}
                        onClick={() => handleUpdateStatus(booking.id, 'Cancelled')}
                      >
                        <XCircle className="h-3 w-3 mr-1" /> Cancel Request
                      </Button>
                    </div>
                  )}

                  {/* Actions for Tutor on Confirmed bookings */}
                  {userRole === 'Tutor' && isConfirmed && (
                    <div className="pt-2 border-t border-[#F0E6DB] flex items-center justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 border-[#EADDD0] text-slate-700 hover:bg-slate-100 rounded-lg px-2"
                        disabled={actioningId === booking.id}
                        onClick={() => handleUpdateStatus(booking.id, 'Completed')}
                      >
                        <CheckCircle className="h-3 w-3 mr-1 text-emerald-600" /> Mark Completed
                      </Button>
                    </div>
                  )}

                  {/* Actions for Tutor on Pending bookings */}
                  {userRole === 'Tutor' && isPending && (
                    <div className="pt-2 border-t border-[#F0E6DB] space-y-2">
                      <Input
                        type="text"
                        placeholder="Video meeting link (e.g. Google Meet / Zoom)"
                        value={meetingLinks[booking.id] || ''}
                        onChange={(e) => setMeetingLinks({ ...meetingLinks, [booking.id]: e.target.value })}
                        className="text-xs bg-white h-8 rounded-lg border-[#EADDD0]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 text-xs h-8 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold"
                          disabled={actioningId === booking.id}
                          onClick={() => handleUpdateStatus(booking.id, 'Confirmed')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Confirm Session
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 border-[#EADDD0] text-rose-700 hover:bg-rose-50 rounded-lg"
                          disabled={actioningId === booking.id}
                          onClick={() => handleUpdateStatus(booking.id, 'Cancelled')}
                        >
                          <XCircle className="h-3 w-3 mr-1" /> Decline
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
