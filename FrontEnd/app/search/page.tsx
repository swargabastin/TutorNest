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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1">
        {/* Search Header */}
        <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search subjects, tutors, or topics..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <Select value={filters.city || 'all'} onValueChange={(value) => setFilters({ ...filters, city: value === 'all' ? '' : value })}>
                <SelectTrigger className="w-40">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
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
                <SelectTrigger className="w-40">
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
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
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
            <Card className="sticky top-36">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-teal-600 hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Hourly Rate</h4>
                  <div className="px-2">
                    <Slider
                      value={[filters.minRate, filters.maxRate]}
                      min={0}
                      max={2000}
                      step={100}
                      onValueChange={(value) => setFilters({ ...filters, minRate: value[0], maxRate: value[1] })}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>₹{filters.minRate}</span>
                      <span>₹{filters.maxRate}</span>
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Minimum Rating</h4>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <label key={rating} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          checked={filters.minRating === rating}
                          onChange={() => setFilters({ ...filters, minRating: rating })}
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">{rating}+</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Teaching Mode */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Teaching Mode</h4>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <Checkbox
                        checked={filters.mode.includes('online')}
                        onCheckedChange={() => toggleMode('online')}
                      />
                      <span className="ml-3 text-sm text-gray-700">Online Classes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <Checkbox
                        checked={filters.mode.includes('offline')}
                        onCheckedChange={() => toggleMode('offline')}
                      />
                      <span className="ml-3 text-sm text-gray-700">In-person Classes</span>
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
                    <span className="ml-3 text-sm text-gray-700">Verified Tutors Only</span>
                  </label>
                </div>

                {/* Teaching Level */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Teaching Level</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {teachingLevels.map((level) => (
                      <label key={level} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="mr-3"
                          checked={filters.level === level}
                          onChange={() => setFilters({ ...filters, level: filters.level === level ? '' : level })}
                        />
                        <span className="text-sm text-gray-700">{level}</span>
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
              <Card className="lg:hidden mb-4">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Price Range</h4>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minRate}
                          onChange={(e) => setFilters({ ...filters, minRate: parseInt(e.target.value) || 0 })}
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxRate}
                          onChange={(e) => setFilters({ ...filters, maxRate: parseInt(e.target.value) || 2000 })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <Checkbox
                          checked={filters.mode.includes('online')}
                          onCheckedChange={() => toggleMode('online')}
                        />
                        <span className="ml-2 text-sm">Online</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <Checkbox
                          checked={filters.mode.includes('offline')}
                          onCheckedChange={() => toggleMode('offline')}
                        />
                        <span className="ml-2 text-sm">In-person</span>
                      </label>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <Checkbox
                        checked={filters.verified}
                        onCheckedChange={(checked) => setFilters({ ...filters, verified: checked as boolean })}
                      />
                      <span className="ml-2 text-sm">Verified Only</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Find Tutors</h1>
                <p className="text-gray-600 mt-1">{loading ? 'Searching…' : `${totalCount} tutors found`}</p>
              </div>

              <div className="flex items-center gap-3">
                <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="experience">Most Experience</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden sm:flex border rounded-lg">
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.city || filters.subject || filters.mode.length > 0 || filters.verified) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.city && (
                  <Badge variant="secondary" className="py-1.5 px-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    {filters.city}
                    <button onClick={() => setFilters({ ...filters, city: '' })} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.subject && (
                  <Badge variant="secondary" className="py-1.5 px-3">
                    {filters.subject}
                    <button onClick={() => setFilters({ ...filters, subject: '' })} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.mode.map((mode) => (
                  <Badge key={mode} variant="secondary" className="py-1.5 px-3">
                    {mode}
                    <button onClick={() => toggleMode(mode)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.verified && (
                  <Badge variant="secondary" className="py-1.5 px-3">
                    Verified
                    <button onClick={() => setFilters({ ...filters, verified: false })} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Tutor Results */}
            {loading ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-gray-600">Loading tutors…</p>
                </CardContent>
              </Card>
            ) : filteredTutors.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tutors found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters to find more tutors</p>
                  <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-6' : 'space-y-4'}>
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
