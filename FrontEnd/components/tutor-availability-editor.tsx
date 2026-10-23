'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Calendar,
  Clock,
  Sparkles,
  Save,
  MapPin,
  BookOpen,
  Check,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { tutorsApi, lookupsApi, TutorDetail } from '@/lib/api';

const DAYS = [
  { dayOfWeek: 1, label: 'Mon', fullLabel: 'Monday' },
  { dayOfWeek: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { dayOfWeek: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { dayOfWeek: 4, label: 'Thu', fullLabel: 'Thursday' },
  { dayOfWeek: 5, label: 'Fri', fullLabel: 'Friday' },
  { dayOfWeek: 6, label: 'Sat', fullLabel: 'Saturday' },
  { dayOfWeek: 0, label: 'Sun', fullLabel: 'Sunday' },
];

const TIME_SLOTS = [
  { key: 'morning', label: 'Morning', time: '09:00 – 12:00', start: '09:00:00', end: '12:00:00' },
  { key: 'afternoon', label: 'Afternoon', time: '12:00 – 16:00', start: '12:00:00', end: '16:00:00' },
  { key: 'evening', label: 'Evening', time: '16:00 – 19:00', start: '16:00:00', end: '19:00:00' },
  { key: 'night', label: 'Night', time: '19:00 – 21:00', start: '19:00:00', end: '21:00:00' },
];

export function TutorAvailabilityEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [offersFreeDemo, setOffersFreeDemo] = useState(true);
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('');
  const [travelRadius, setTravelRadius] = useState<number | ''>(5);

  // Availability matrix: Set of slot keys formatted as `${dayOfWeek}_${slotKey}`
  const [activeSlots, setActiveSlots] = useState<Set<string>>(new Set());

  const availableBoards = lookupsApi.getCurriculums();

  useEffect(() => {
    tutorsApi
      .getMyProfile()
      .then((profile: TutorDetail) => {
        setOffersFreeDemo(profile.offersFreeDemo ?? true);
        setSelectedBoards(profile.boards || []);
        setLocality(profile.locality || '');
        setPincode(profile.pincode || '');
        setTravelRadius(profile.travelRadiusKm ?? 5);

        // Preload availability
        if (profile.availabilities && profile.availabilities.length > 0) {
          const slots = new Set<string>();
          for (const a of profile.availabilities) {
            // Find day
            const dayEntry = DAYS.find(
              (d) => d.fullLabel.toLowerCase() === (a.day || '').toLowerCase()
            );
            if (dayEntry) {
              // Match slot by time
              const startHour = parseInt(a.startTime.split(':')[0], 10);
              let slotKey = 'morning';
              if (startHour >= 12 && startHour < 16) slotKey = 'afternoon';
              else if (startHour >= 16 && startHour < 19) slotKey = 'evening';
              else if (startHour >= 19) slotKey = 'night';

              slots.add(`${dayEntry.dayOfWeek}_${slotKey}`);
            }
          }
          setActiveSlots(slots);
        } else {
          // Default sensible slots: Weekday evenings
          const defaultSlots = new Set<string>();
          [1, 2, 3, 4, 5].forEach((d) => defaultSlots.add(`${d}_evening`));
          setActiveSlots(defaultSlots);
        }
      })
      .catch((err) => {
        console.error('Failed to load tutor availability details', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleSlot = (dayOfWeek: number, slotKey: string) => {
    const key = `${dayOfWeek}_${slotKey}`;
    const next = new Set(activeSlots);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setActiveSlots(next);
  };

  const toggleBoard = (board: string) => {
    setSelectedBoards((prev) =>
      prev.includes(board) ? prev.filter((b) => b !== board) : [...prev, board]
    );
  };

  const setPreset = (type: 'weekdays' | 'weekends' | 'clear') => {
    if (type === 'clear') {
      setActiveSlots(new Set());
    } else if (type === 'weekdays') {
      const next = new Set(activeSlots);
      [1, 2, 3, 4, 5].forEach((d) => {
        next.add(`${d}_evening`);
        next.add(`${d}_night`);
      });
      setActiveSlots(next);
    } else if (type === 'weekends') {
      const next = new Set(activeSlots);
      [6, 0].forEach((d) => {
        next.add(`${d}_morning`);
        next.add(`${d}_afternoon`);
        next.add(`${d}_evening`);
      });
      setActiveSlots(next);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // 1. Update Profile (OffersFreeDemo, Boards, Locality, Pincode, TravelRadiusKm)
      await tutorsApi.updateProfile({
        offersFreeDemo,
        boards: selectedBoards,
        locality: locality.trim() || undefined,
        pincode: pincode.trim() || undefined,
        travelRadiusKm: travelRadius === '' ? undefined : Number(travelRadius),
      });

      // 2. Prepare and save Availability slots
      const slotsToSave: { dayOfWeek: number; startTime: string; endTime: string }[] = [];
      activeSlots.forEach((slotId) => {
        const [dayStr, slotKey] = slotId.split('_');
        const dayOfWeek = parseInt(dayStr, 10);
        const slotDef = TIME_SLOTS.find((s) => s.key === slotKey);
        if (slotDef) {
          slotsToSave.push({
            dayOfWeek,
            startTime: slotDef.start,
            endTime: slotDef.end,
          });
        }
      });

      await tutorsApi.setAvailability(slotsToSave);

      setSuccessMessage('Schedule and preferences updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      console.error('Failed to save tutor schedule', err);
      setErrorMessage('Could not save schedule. Please verify your details and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-[#EADDD0] bg-white rounded-2xl shadow-xs">
        <CardContent className="p-8 text-center text-slate-500 text-xs">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-plum-900" />
          Loading your availability settings…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#EADDD0] bg-white rounded-2xl shadow-xs overflow-hidden">
      <CardHeader className="border-b border-[#F0E6DB] bg-[#FAF8F5]/60 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-[#1F1924] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-plum-900" />
              Availability & Tutoring Preferences
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Set your weekly teaching hours, free demo offerings, boards taught, and local travel radius.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-plum-900 hover:bg-plum-950 text-white rounded-xl text-xs font-semibold h-9 px-4 shrink-0"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {successMessage && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Free Demo Class Feature Toggle */}
        <div className="p-4 rounded-xl border border-plum-200 bg-plum-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#1F1924]">Offer 30-Minute Free Demo Classes</span>
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 text-[10px]">
                Recommended
              </Badge>
            </div>
            <p className="text-xs text-slate-600">
              Students can request an introductory trial without upfront coins. Tutors offering free demos receive up to 3× more student inquiries.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={offersFreeDemo}
              onCheckedChange={setOffersFreeDemo}
              aria-label="Toggle Free Demo Classes"
            />
            <span className="text-xs font-semibold text-plum-950">
              {offersFreeDemo ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Section 2: Weekly Schedule Matrix (7 Days x 4 Slots) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-plum-900" />
                Weekly Available Hours ({activeSlots.size} slots selected)
              </h3>
              <p className="text-xs text-slate-500">Tap slots to toggle your availability for parents and students.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreset('weekdays')}
                className="text-[11px] h-7 px-2.5 rounded-lg border-[#EADDD0] hover:bg-plum-50"
              >
                + Weekday Evenings
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreset('weekends')}
                className="text-[11px] h-7 px-2.5 rounded-lg border-[#EADDD0] hover:bg-plum-50"
              >
                + Weekends
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPreset('clear')}
                className="text-[11px] h-7 px-2 text-slate-500 hover:text-rose-600"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#EADDD0] rounded-xl bg-white shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#EADDD0] bg-[#FAF8F5]">
                  <th className="p-2.5 font-bold text-slate-700 w-24">Day</th>
                  {TIME_SLOTS.map((slot) => (
                    <th key={slot.key} className="p-2.5 font-bold text-slate-700 text-center">
                      <div className="font-semibold text-xs text-[#1F1924]">{slot.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{slot.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E6DB]">
                {DAYS.map((day) => (
                  <tr key={day.dayOfWeek} className="hover:bg-plum-50/20 transition-colors">
                    <td className="p-2.5 font-bold text-[#1F1924]">
                      <span className="hidden sm:inline">{day.fullLabel}</span>
                      <span className="sm:hidden">{day.label}</span>
                    </td>
                    {TIME_SLOTS.map((slot) => {
                      const isActive = activeSlots.has(`${day.dayOfWeek}_${slot.key}`);
                      return (
                        <td key={slot.key} className="p-1.5 sm:p-2 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSlot(day.dayOfWeek, slot.key)}
                            className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                              isActive
                                ? 'bg-plum-900 text-white shadow-2xs font-semibold hover:bg-plum-950'
                                : 'bg-[#FAF8F5] text-slate-500 hover:bg-[#F0E6DB] border border-dashed border-[#EADDD0]'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <Check className="h-3 w-3 stroke-[3]" /> Available
                              </>
                            ) : (
                              '—'
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Curriculum & Syllabus Boards */}
        <div className="space-y-2 pt-2 border-t border-[#F0E6DB]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-plum-900" />
            Curricula & Syllabus Boards Taught
          </h3>
          <p className="text-xs text-slate-500">Select all school boards you are qualified to tutor.</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {availableBoards.map((board) => {
              const isSelected = selectedBoards.includes(board);
              return (
                <button
                  type="button"
                  key={board}
                  onClick={() => toggleBoard(board)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-plum-900 text-white border-plum-900 font-semibold shadow-2xs'
                      : 'bg-white text-slate-700 border-[#EADDD0] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 inline mr-1 stroke-[3]" />}
                  {board}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Hyperlocal Location & Travel Radius */}
        <div className="space-y-3 pt-2 border-t border-[#F0E6DB]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-plum-900" />
            Hyperlocal Tutoring Area & Radius
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Locality / Neighborhood</label>
              <Input
                type="text"
                placeholder="e.g. Kakkanad, Kaloor, Edappally"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="text-xs h-9 bg-white border-[#EADDD0] rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">6-Digit Pincode</label>
              <Input
                type="text"
                maxLength={6}
                placeholder="e.g. 682030"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-xs h-9 bg-white border-[#EADDD0] rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Travel Radius (km)</label>
              <Input
                type="number"
                min={1}
                max={50}
                placeholder="5"
                value={travelRadius}
                onChange={(e) => setTravelRadius(e.target.value === '' ? '' : Number(e.target.value))}
                className="text-xs h-9 bg-white border-[#EADDD0] rounded-xl"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
