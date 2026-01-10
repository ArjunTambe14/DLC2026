import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Heart, Search } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import BusinessCard from '../Components/business/BusinessCard';

export default function Favorites() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {
        base44.auth.redirectToLogin(window.location.href);
      });
  }, []);

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['userBookmarks', user?.email],
    queryFn: () => base44.entities.Bookmark.filter({ userEmail: user.email }),
    enabled: !!user
  });

  const { data: allBusinesses = [] } = useQuery({
    queryKey: ['allBusinesses'],
    queryFn: () => base44.entities.Business.list()
  });

  // Get bookmarked businesses
  const bookmarkedBusinesses = allBusinesses.filter(business =>
    bookmarks.some(bookmark => bookmark.businessId === business.id)
  );

  // Filter and sort
  const filteredBusinesses = bookmarkedBusinesses
    .filter(business => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        business.name.toLowerCase().includes(search) ||
        business.description?.toLowerCase().includes(search) ||
        business.city?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return b.averageRating - a.averageRating;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        // newest bookmark
        const bookmarkA = bookmarks.find(bm => bm.businessId === a.id);
        const bookmarkB = bookmarks.find(bm => bm.businessId === b.id);
        return new Date(bookmarkB.created_date) - new Date(bookmarkA.created_date);
      }
    });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-600 fill-current" />
            <h1 className="text-4xl font-bold text-slate-900">
              Your Favorites
            </h1>
          </div>
          <p className="text-lg text-slate-600">
            Businesses you've saved for later
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Recently Saved</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600">
            <span className="font-semibold text-slate-900">{filteredBusinesses.length}</span> saved businesses
          </p>
        </div>

        {/* Business Grid */}
        {filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business, index) => (
              <BusinessCard key={business.id} business={business} index={index} />
            ))}
          </div>
        ) : bookmarkedBusinesses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-slate-500 mb-6">
              Start exploring and save businesses you love!
            </p>
            <a href="/Businesses" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Browse Businesses
            </a>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No results found
            </h3>
            <p className="text-slate-500">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}