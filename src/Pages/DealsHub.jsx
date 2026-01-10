import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tag, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DealCard from '../components/deal/DealCard';
import { isBefore } from 'date-fns';

export default function DealsHub() {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['allDeals'],
    queryFn: () => base44.entities.Deal.list('-created_date')
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => base44.entities.Business.list()
  });

  // Get business for each deal
  const dealsWithBusiness = deals.map(deal => ({
    ...deal,
    business: businesses.find(b => b.id === deal.businessId)
  }));

  // Filter deals
  const filteredDeals = dealsWithBusiness.filter(deal => {
    const now = new Date();
    const endDate = new Date(deal.endDate);
    const isActive = isBefore(now, endDate);

    // Status filter
    if (statusFilter === 'active' && !isActive) return false;
    if (statusFilter === 'expired' && isActive) return false;

    // Category filter
    if (categoryFilter !== 'all' && deal.category !== categoryFilter) return false;

    return true;
  });

  const categories = ['all', 'food', 'retail', 'services', 'health', 'entertainment', 'other'];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-slate-900">
              Deals & Coupons
            </h1>
          </div>
          <p className="text-lg text-slate-600">
            Exclusive offers from local businesses
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Deals</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredDeals.length}</span> deals
          </p>
        </div>

        {/* Deals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 h-64 animate-pulse" />
            ))}
          </div>
        ) : filteredDeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map((deal, index) => (
              <DealCard
                key={deal.id}
                deal={deal}
                business={deal.business}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No deals found
            </h3>
            <p className="text-slate-500">
              Try adjusting your filters or check back later for new offers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}