import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import BusinessCard from '../Components/business/BusinessCard';
import BusinessFilters from '../Components/business/BusinessFilters';
import { Building2 } from 'lucide-react';
import { Skeleton } from '@/Components/ui/skeleton';
import { Button } from '@/Components/ui/button';

export default function Businesses() {
  const [filters, setFilters] = useState({
    category: 'all',
    sort: 'newest',
    openNow: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Get URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category) setFilters(prev => ({ ...prev, category }));
    if (search) setSearchTerm(search);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['allBusinesses', filters, searchTerm, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.set('category', filters.category);
      if (filters.sort) params.set('sort', filters.sort);
      if (searchTerm) params.set('search', searchTerm);
      if (filters.openNow) params.set('openNow', 'true');
      params.set('page', String(page));
      params.set('pageSize', '9');
      return api.get(`/businesses?${params.toString()}`);
    }
  });

  const businesses = data?.items || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

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
            Showing <span className="font-semibold text-slate-900">{pagination.total}</span> businesses
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
        ) : businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business, index) => (
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

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
