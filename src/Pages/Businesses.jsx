import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import BusinessCard from '../components/business/BusinessCard';
import BusinessFilters from '../components/business/BusinessFilters';
import { Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Businesses() {
  const [filters, setFilters] = useState({
    category: 'all',
    sort: 'newest'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Get URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category) setFilters(prev => ({ ...prev, category }));
    if (search) setSearchTerm(search);
  }, []);

  const { data: allBusinesses = [], isLoading } = useQuery({
    queryKey: ['allBusinesses'],
    queryFn: () => base44.entities.Business.list('-created_date', 100)
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Filter and sort businesses
  const filteredBusinesses = allBusinesses
    .filter(business => {
      // Category filter
      if (filters.category !== 'all' && business.category !== filters.category) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          business.name.toLowerCase().includes(search) ||
          business.description?.toLowerCase().includes(search) ||
          business.city?.toLowerCase().includes(search) ||
          business.tags?.some(tag => tag.toLowerCase().includes(search))
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (filters.sort === 'rating') {
        return b.averageRating - a.averageRating;
      } else if (filters.sort === 'reviews') {
        return b.reviewCount - a.reviewCount;
      } else {
        // newest
        return new Date(b.created_date) - new Date(a.created_date);
      }
    });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">
              All Businesses
            </h1>
          </div>
          <p className="text-lg text-slate-600">
            Discover and support local businesses in your community
          </p>
        </div>

        {/* Filters */}
        <BusinessFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Results Count */}
        <div className="my-6">
          <p className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredBusinesses.length}</span> businesses
          </p>
        </div>

        {/* Business Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <Skeleton className="h-48 w-full mb-4 rounded-xl" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business, index) => (
              <BusinessCard key={business.id} business={business} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No businesses found
            </h3>
            <p className="text-slate-500">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}