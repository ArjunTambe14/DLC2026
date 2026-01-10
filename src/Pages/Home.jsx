import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Award, Tag, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import BusinessCard from '../components/business/BusinessCard';
import DealCard from '../components/deal/DealCard';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => base44.entities.Business.list('-created_date', 6)
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['featuredDeals'],
    queryFn: () => base44.entities.Deal.list('-created_date', 3)
  });

  const categories = [
    { name: 'Food', icon: '🍕', color: 'from-orange-400 to-red-500', value: 'food' },
    { name: 'Retail', icon: '🛍️', color: 'from-pink-400 to-purple-500', value: 'retail' },
    { name: 'Services', icon: '⚙️', color: 'from-blue-400 to-cyan-500', value: 'services' },
    { name: 'Health', icon: '💊', color: 'from-green-400 to-emerald-500', value: 'health' },
    { name: 'Entertainment', icon: '🎬', color: 'from-purple-400 to-pink-500', value: 'entertainment' },
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by LocalLift AI</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Discover & Support
              <br />
              <span className="bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">
                Local Businesses
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
              Find amazing local businesses, read reviews, and unlock exclusive deals—all in one place.
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
                <div className="text-3xl font-bold mb-1">{businesses.length}+</div>
                <div className="text-sm text-blue-200">Local Businesses</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="text-3xl font-bold mb-1">{deals.length}+</div>
                <div className="text-sm text-blue-200">Active Deals</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl font-bold mb-1">AI</div>
                <div className="text-sm text-blue-200">Powered</div>
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
      {deals.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-6 h-6 text-orange-600" />
                  <h2 className="text-3xl font-bold text-slate-900">
                    Hot Deals Right Now
                  </h2>
                </div>
                <p className="text-slate-600">
                  Don't miss out on these exclusive offers
                </p>
              </div>
              <Link to={createPageUrl('DealsHub')}>
                <Button variant="outline" className="gap-2">
                  All Deals <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal, index) => (
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
              Experience AI-Powered Discovery
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              LocalLift AI helps you find the perfect local business based on your preferences, 
              answers your questions, and recommends the best deals—all intelligently.
            </p>
            <Link to={createPageUrl('Businesses')}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                Start Exploring
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}