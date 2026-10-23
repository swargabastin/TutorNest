'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Video, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { bookingsApi, TutorDetail, authApi } from '@/lib/api';

interface BookSessionModalProps {
  tutor: TutorDetail;
  trigger?: React.ReactNode;
}

export function BookSessionModal({ tutor, trigger }: BookSessionModalProps) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(tutor.subjects[0] || 'General');
  const [mode, setMode] = useState<string>('Online');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [isTrial, setIsTrial] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authApi.isLoggedIn()) {
      setError('Please login as a student to book a session.');
      return;
    }

    if (!date || !time) {
      setError('Please select both a date and time for the class.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const start = new Date(`${date}T${time}:00Z`);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour session

      await bookingsApi.create({
        tutorProfileId: tutor.id,
        subject,
        mode,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        isTrial,
        studentNotes: notes,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to book session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) { setSuccess(false); setError(''); } }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full bg-plum-900 hover:bg-plum-950 text-white rounded-xl h-11 text-xs font-bold shadow-xs">
            <Calendar className="h-4 w-4 mr-2" />
            Book a Class / Trial
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl border-[#EADDD0] bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold flex items-center gap-2 text-[#1F1924]">
            <Calendar className="h-5 w-5 text-plum-800" />
            Book a Class with {tutor.name}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1F1924]">Session Request Sent!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Your class booking request has been sent to {tutor.name}. You will be notified once they confirm.
              </p>
            </div>
            <Button className="w-full bg-plum-900 hover:bg-plum-950 text-white rounded-xl h-10 text-xs font-semibold" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="p-2.5 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="subject" className="text-xs font-bold text-[#1F1924]">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject" className="h-10 rounded-xl border-[#EADDD0] bg-[#FAF8F5] text-xs">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {tutor.subjects.map((sub) => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="date" className="text-xs">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="time" className="text-xs">Start Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="mode" className="text-xs">Class Mode</Label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger id="mode">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online Video Class</SelectItem>
                    <SelectItem value="Offline">In-Person / Home</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Session Type</Label>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isTrial"
                    checked={isTrial}
                    onChange={(e) => setIsTrial(e.target.checked)}
                    className="rounded border-[#EADDD0] text-plum-900 focus:ring-plum-600 accent-plum-900"
                  />
                  <Label htmlFor="isTrial" className="text-xs font-medium cursor-pointer">
                    Request Free Trial (1 hr)
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes" className="text-xs font-bold text-[#1F1924]">Learning Goals or Topics (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="What topics or exams would you like help with?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="text-xs rounded-xl border-[#EADDD0] bg-[#FAF8F5]"
              />
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EADDD0] text-xs text-slate-600 flex justify-between items-center">
              <span>Estimated Tuition Fee:</span>
              <span className="font-extrabold text-[#1F1924]">
                {isTrial ? 'FREE (Trial)' : `₹${tutor.hourlyRate} / hour`}
              </span>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-plum-900 hover:bg-plum-950 text-white rounded-xl h-10 text-xs font-bold">
              {loading ? 'Submitting Request…' : 'Confirm Class Booking'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
