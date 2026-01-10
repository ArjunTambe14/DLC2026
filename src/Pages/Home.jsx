import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Search, TrendingUp, Award, Tag, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import BusinessCard from '../Components/business/BusinessCard';
import DealCard from '../Components/deal/DealCard';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: businessData = { items: [] } } = useQuery({
    queryKey: ['businesses', 'featured'],
    queryFn: () => api.get('/businesses?page=1&pageSize=6&sort=newest')
  });

  const { data: dealData = { items: [] } } = useQuery({
    queryKey: ['featuredDeals'],
    queryFn: () => api.get('/deals?page=1&pageSize=6')
  });

  const businesses = businessData.items || [];
  const deals = dealData.items || [];
  const activeDeals = deals.filter((deal) => new Date(deal.endDate) > new Date());
  const businessTotal = businessData.pagination?.total || businesses.length;
  const dealTotal = activeDeals.length;

  const categories = [
    { name: 'Food', icon: '🍕', color: 'from-orange-400 to-red-500', value: 'food' },
    { name: 'Retail', icon: '🛍️', color: 'from-pink-400 to-rose-500', value: 'retail' },
    { name: 'Services', icon: '🧰', color: 'from-blue-400 to-cyan-500', value: 'services' },
    { name: 'Health', icon: '💊', color: 'from-green-400 to-emerald-500', value: 'health' },
    { name: 'Auto', icon: '🚗', color: 'from-slate-500 to-gray-700', value: 'auto' },
    { name: 'Beauty', icon: '💇‍♀️', color: 'from-rose-400 to-pink-500', value: 'beauty' },
    { name: 'Entertainment', icon: '🎬', color: 'from-purple-400 to-indigo-500', value: 'entertainment' },
    { name: 'Home', icon: '🏡', color: 'from-emerald-400 to-teal-500', value: 'home' },
    { name: 'Other', icon: '📦', color: 'from-slate-400 to-slate-500', value: 'other' }
  ];

  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.location.href = createPageUrl(`Businesses?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDZjMy4zMSAwIDYgMi42OSA2IDZzLTIuNjkgNi02IDYtNi0yLjY5LTYtNiAyLjY5LTYgNi02eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Discover & Support
              <br />
              <span className="bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">
                Local Businesses
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
              StreetPulse brings trusted reviews, active deals, and local favorites together in one place.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search for businesses, categories, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 h-14 text-lg border-0 focus-visible:ring-0 text-slate-900"
                />
              </div>
              <Button
                onClick={handleSearch}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-base font-semibold shadow-lg"
              >
                Search
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl font-bold mb-1">{businessTotal}+</div>
                <div className="text-sm text-blue-200">Local Businesses</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="text-3xl font-bold mb-1">{dealTotal}+</div>
                <div className="text-sm text-blue-200">Active Deals</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl font-bold mb-1">25+</div>
                <div className="text-sm text-blue-200">Categories & Tags</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-slate-600">
              Explore businesses that match your interests
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={createPageUrl(`Businesses?category=${category.value}`)}>
                  <div className="group cursor-pointer">
                    <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-6 text-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}>
                      <div className="text-4xl mb-3">{category.icon}</div>
                      <div className="font-semibold text-white">{category.name}</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h2 className="text-3xl font-bold text-slate-900">
                  Recently Added
                </h2>
              </div>
              <p className="text-slate-600">
                Check out the newest local businesses in your area
              </p>
            </div>
            <Link to={createPageUrl('Businesses')}>
              <Button variant="outline" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {businesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business, index) => (
                <BusinessCard key={business.id} business={business} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No businesses yet. Be the first to add one!</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Deals */}
      {activeDeals.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-6 h-6 text-orange-600" />
                  <h2 className="text-3xl font-bold text-slate-900">
                    Active Deals
                  </h2>
                </div>
                <p className="text-slate-600">
                  Grab community specials before they expire
                </p>
              </div>
              <Link to={createPageUrl('DealsHub')}>
                <Button variant="outline" className="gap-2">
                  View All Deals <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDeals.map((deal, index) => (
                <DealCard key={deal.id} deal={deal} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-blue-400" />
            <h2 className="text-4xl font-bold mb-6">
              Build a stronger local economy
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Every review, favorite, and visit helps local businesses thrive. Join the community today.
            </p>
            <Link to={createPageUrl('Businesses')}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                Explore Businesses
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
