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
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-teal-600" />
          {userRole === 'Tutor' ? "Today's & Upcoming Classes" : "My Scheduled Classes"}
        </CardTitle>
        <span className="text-xs text-gray-500 font-normal">
          {bookings.filter(b => b.status === 'Confirmed').length} Active
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-gray-500 text-sm py-4">Loading schedule…</p>
        ) : bookings.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            No sessions scheduled yet.
            <br />
            <span className="text-xs text-gray-400">
              {userRole === 'Tutor'
                ? 'Session requests from students will appear here.'
                : 'Book a session directly from a tutor profile!'}
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => {
              const startDate = new Date(booking.startTime);
              const isConfirmed = booking.status === 'Confirmed';
              const isPending = booking.status === 'Pending';

              return (
                <div key={booking.id} className="p-3 rounded-lg border bg-gray-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-gray-900">
                        {userRole === 'Tutor' ? booking.studentName : booking.tutorName}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">({booking.subject})</span>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      {booking.mode === 'Online' ? <Video className="h-3.5 w-3.5 text-teal-600" /> : <MapPin className="h-3.5 w-3.5 text-gray-400" />}
                      {booking.mode}
                    </span>
                    {booking.isTrial && (
                      <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700">Trial</Badge>
                    )}
                  </div>

                  {booking.meetingLink && (
                    <div className="pt-1">
                      <a
                        href={booking.meetingLink.startsWith('http') ? booking.meetingLink : `https://${booking.meetingLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-teal-600 hover:underline font-medium gap-1"
                      >
                        Join Class Online <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* Actions for Tutor on Pending bookings */}
                  {userRole === 'Tutor' && isPending && (
                    <div className="pt-2 border-t space-y-2">
                      <Input
                        type="text"
                        placeholder="Video meeting link (e.g. Google Meet / Zoom)"
                        value={meetingLinks[booking.id] || ''}
                        onChange={(e) => setMeetingLinks({ ...meetingLinks, [booking.id]: e.target.value })}
                        className="text-xs bg-white h-7"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 text-xs h-7 bg-green-600 hover:bg-green-700"
                          disabled={actioningId === booking.id}
                          onClick={() => handleUpdateStatus(booking.id, 'Confirmed')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Confirm Session
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 text-red-600"
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
