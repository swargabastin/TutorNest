'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import TutorCard from '@/components/tutor-card';
import {
  Search,
  MapPin,
  Filter,
  X,
  Star,
  User,
  ChevronDown,
  Grid,
  List
} from 'lucide-react';
import { tutorsApi, lookupsApi } from '@/lib/api';
import { Tutor } from '@/lib/types';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [teachingLevels, setTeachingLevels] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const [filters, setFilters] = useState({
    search: searchParams.get('subject') || '',
    city: searchParams.get('city') || '',
    subject: searchParams.get('subject') || '',
    level: '',
    mode: [] as string[],
    minRate: 0,
    maxRate: 2000,
    minRating: 0,
    verified: false,
    sortBy: 'rating'
  });

  const [showFilters, setShowFilters] = useState(false);

  // Lookups load once — these back the filter dropdowns/checklists.
  useEffect(() => {
    lookupsApi.getSubjects().then((subs) => setSubjects(subs.map((s) => s.name))).catch(console.error);
    lookupsApi.getCities().then((c) => setCities(c.map((x) => x.city))).catch(console.error);
    lookupsApi.getTeachingLevels().then(setTeachingLevels).catch(console.error);
  }, []);

  // Re-query the backend any time a filter changes — the search/sort/pagination
  // now happens server-side instead of against an in-memory mock array.
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const applyFilters = async () => {
    setLoading(true);
    try {
      const res = await tutorsApi.search({
        search: filters.search || undefined,
        city: filters.city || undefined,
        subject: filters.subject || undefined,
        level: filters.level || undefined,
        mode: filters.mode.length > 0 ? filters.mode : undefined,
        minRate: filters.minRate,
        maxRate: filters.maxRate,
        minRating: filters.minRating,
        verifiedOnly: filters.verified,
        sortBy: filters.sortBy,
        page: 1,
        pageSize: 24,
      });
      setFilteredTutors(res.items);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Tutor search failed', err);
      setFilteredTutors([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      subject: '',
      level: '',
      mode: [],
      minRate: 0,
      maxRate: 2000,
      minRating: 0,
      verified: false,
      sortBy: 'rating'
    });
  };

  const toggleMode = (mode: string) => {
    if (filters.mode.includes(mode)) {
      setFilters({ ...filters, mode: filters.mode.filter(m => m !== mode) });
    } else {
      setFilters({ ...filters, mode: [...filters.mode, mode] });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col text-[#1F1924]">
      <Header />
      <div className="flex-1">
        {/* Search Header */}
        <div className="bg-white/95 backdrop-blur-md border-b border-[#EADDD0] sticky top-16 z-30 shadow-xs">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search subjects, tutors, or topics..."
                className="pl-10 h-11 bg-[#FAF8F5] border-[#EADDD0] rounded-xl focus-visible:ring-plum-600 focus-visible:border-plum-600"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div className="flex gap-2.5">
              <Select value={filters.city || 'all'} onValueChange={(value) => setFilters({ ...filters, city: value === 'all' ? '' : value })}>
                <SelectTrigger className="w-36 sm:w-44 h-11 bg-white border-[#EADDD0] rounded-xl">
                  <MapPin className="h-4 w-4 mr-2 text-plum-700 shrink-0" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.subject || 'all'} onValueChange={(value) => setFilters({ ...filters, subject: value === 'all' ? '' : value })}>
                <SelectTrigger className="w-36 sm:w-44 h-11 bg-white border-[#EADDD0] rounded-xl">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="lg:hidden h-11 rounded-xl border-[#EADDD0] text-[#1F1924]"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1.5 text-plum-700" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <Card className="sticky top-36 border-[#EADDD0] bg-white rounded-2xl shadow-xs">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#F0E6DB]">
                  <h3 className="text-base font-bold text-[#1F1924]">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-plum-700 hover:text-plum-900 transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Hourly Rate</h4>
                  <div className="px-1">
                    <Slider
                      value={[filters.minRate, filters.maxRate]}
                      min={0}
                      max={2000}
                      step={100}
                      className="accent-plum-900"
                      onValueChange={(value) => setFilters({ ...filters, minRate: value[0], maxRate: value[1] })}
                    />
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mt-2">
                      <span>₹{filters.minRate}</span>
                      <span>₹{filters.maxRate}</span>
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Minimum Rating</h4>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <label key={rating} className="flex items-center cursor-pointer text-sm text-slate-700 hover:text-plum-900">
                        <input
                          type="radio"
                          name="rating"
                          checked={filters.minRating === rating}
                          onChange={() => setFilters({ ...filters, minRating: rating })}
                          className="mr-3 accent-plum-900"
                        />
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`}
                            />
                          ))}
                          <span className="ml-2 text-xs font-medium text-slate-600">{rating}+</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Teaching Mode */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Teaching Mode</h4>
                  <div className="space-y-2.5">
                    <label className="flex items-center cursor-pointer">
                      <Checkbox
                        checked={filters.mode.includes('online')}
                        onCheckedChange={() => toggleMode('online')}
                      />
                      <span className="ml-2.5 text-sm text-slate-700">Online Classes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <Checkbox
                        checked={filters.mode.includes('offline')}
                        onCheckedChange={() => toggleMode('offline')}
                      />
                      <span className="ml-2.5 text-sm text-slate-700">In-person Classes</span>
                    </label>
                  </div>
                </div>

                {/* Verified Only */}
                <div className="mb-6">
                  <label className="flex items-center cursor-pointer">
                    <Checkbox
                      checked={filters.verified}
                      onCheckedChange={(checked) => setFilters({ ...filters, verified: checked as boolean })}
                    />
                    <span className="ml-2.5 text-sm font-medium text-slate-700">Verified Tutors Only</span>
                  </label>
                </div>

                {/* Teaching Level */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Teaching Level</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {teachingLevels.map((level) => (
                      <label key={level} className="flex items-center cursor-pointer text-sm text-slate-700">
                        <input
                          type="checkbox"
                          className="mr-2.5 accent-plum-900"
                          checked={filters.level === level}
                          onChange={() => setFilters({ ...filters, level: filters.level === level ? '' : level })}
                        />
                        <span className="text-xs">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* Mobile Filters */}
            {showFilters && (
              <Card className="lg:hidden mb-4 border-[#EADDD0] bg-white rounded-2xl shadow-xs">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Price Range (₹)</h4>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minRate}
                        onChange={(e) => setFilters({ ...filters, minRate: parseInt(e.target.value) || 0 })}
                        className="h-10 rounded-xl border-[#EADDD0]"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxRate}
                        onChange={(e) => setFilters({ ...filters, maxRate: parseInt(e.target.value) || 2000 })}
                        className="h-10 rounded-xl border-[#EADDD0]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <Checkbox
                        checked={filters.mode.includes('online')}
                        onCheckedChange={() => toggleMode('online')}
                      />
                      <span className="ml-2 text-xs font-medium text-slate-700">Online</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <Checkbox
                        checked={filters.mode.includes('offline')}
                        onCheckedChange={() => toggleMode('offline')}
                      />
                      <span className="ml-2 text-xs font-medium text-slate-700">In-person</span>
                    </label>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <Checkbox
                      checked={filters.verified}
                      onCheckedChange={(checked) => setFilters({ ...filters, verified: checked as boolean })}
                    />
                    <span className="ml-2 text-xs font-medium text-slate-700">Verified Only</span>
                  </label>
                </CardContent>
              </Card>
            )}

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1924]">Find Tutors</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{loading ? 'Searching tutors…' : `${totalCount} verified tutor${totalCount === 1 ? '' : 's'} available`}</p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                  <SelectTrigger className="w-36 sm:w-44 h-10 bg-white border-[#EADDD0] rounded-xl text-xs sm:text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="experience">Most Experience</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-[#EADDD0] bg-white rounded-xl overflow-hidden p-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-lg ${viewMode === 'list' ? 'bg-plum-900 text-white hover:bg-plum-900 hover:text-white' : 'text-slate-600 hover:text-[#1F1924]'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-lg ${viewMode === 'grid' ? 'bg-plum-900 text-white hover:bg-plum-900 hover:text-white' : 'text-slate-600 hover:text-[#1F1924]'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.city || filters.subject || filters.mode.length > 0 || filters.verified) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {filters.city && (
                  <Badge variant="outline" className="py-1 px-2.5 bg-plum-50 text-plum-950 border-plum-200 text-xs rounded-lg">
                    <MapPin className="h-3 w-3 mr-1 text-plum-700" />
                    {filters.city}
                    <button onClick={() => setFilters({ ...filters, city: '' })} className="ml-1.5 hover:text-plum-700">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.subject && (
                  <Badge variant="outline" className="py-1 px-2.5 bg-plum-50 text-plum-950 border-plum-200 text-xs rounded-lg">
                    {filters.subject}
                    <button onClick={() => setFilters({ ...filters, subject: '' })} className="ml-1.5 hover:text-plum-700">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.mode.map((mode) => (
                  <Badge key={mode} variant="outline" className="py-1 px-2.5 bg-plum-50 text-plum-950 border-plum-200 text-xs rounded-lg capitalize">
                    {mode}
                    <button onClick={() => toggleMode(mode)} className="ml-1.5 hover:text-plum-700">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.verified && (
                  <Badge variant="outline" className="py-1 px-2.5 bg-plum-50 text-plum-950 border-plum-200 text-xs rounded-lg">
                    Verified
                    <button onClick={() => setFilters({ ...filters, verified: false })} className="ml-1.5 hover:text-plum-700">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Tutor Results */}
            {loading ? (
              <Card className="text-center py-16 border-[#EADDD0] bg-white rounded-2xl">
                <CardContent>
                  <div className="w-8 h-8 border-2 border-plum-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-600 font-medium">Finding tutors near you…</p>
                </CardContent>
              </Card>
            ) : filteredTutors.length === 0 ? (
              <Card className="text-center py-16 border-[#EADDD0] bg-white rounded-2xl shadow-xs">
                <CardContent className="max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-plum-50 text-plum-800 flex items-center justify-center mx-auto mb-4">
                    <User className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1F1924] mb-1.5">No tutors match your search</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-5">Try relaxing your price range or removing some filters to see more results.</p>
                  <Button onClick={clearFilters} className="bg-plum-900 hover:bg-plum-950 text-white rounded-xl h-10 px-5 text-xs font-semibold">
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 gap-4' : 'space-y-4'}>
                {filteredTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
