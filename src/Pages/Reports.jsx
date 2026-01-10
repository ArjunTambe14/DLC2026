import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, TrendingUp, Heart, Tag, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Reports() {
  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => base44.entities.Business.list()
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => base44.entities.Review.list()
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list()
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => base44.entities.Bookmark.list()
  });

  // Top rated businesses
  const topRated = [...businesses]
    .filter(b => b.reviewCount > 0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 10);

  // Most bookmarked
  const bookmarkCounts = {};
  bookmarks.forEach(bookmark => {
    bookmarkCounts[bookmark.businessId] = (bookmarkCounts[bookmark.businessId] || 0) + 1;
  });

  const mostBookmarked = businesses
    .map(business => ({
      ...business,
      bookmarkCount: bookmarkCounts[business.id] || 0
    }))
    .filter(b => b.bookmarkCount > 0)
    .sort((a, b) => b.bookmarkCount - a.bookmarkCount)
    .slice(0, 10);

  // Business by category
  const categoryCounts = {};
  businesses.forEach(business => {
    categoryCounts[business.category] = (categoryCounts[business.category] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Review sentiment
  const sentimentData = [
    { name: 'Positive', value: reviews.filter(r => r.rating >= 4).length, color: '#10b981' },
    { name: 'Neutral', value: reviews.filter(r => r.rating === 3).length, color: '#f59e0b' },
    { name: 'Negative', value: reviews.filter(r => r.rating <= 2).length, color: '#ef4444' }
  ];

  // Deal performance
  const topDeals = [...deals]
    .sort((a, b) => (b.viewCount + b.saveCount * 2) - (a.viewCount + a.saveCount * 2))
    .slice(0, 10);

  // Export to CSV
  const exportToCSV = () => {
    const csvData = [
      ['Business Name', 'Category', 'Rating', 'Reviews', 'Bookmarks'],
      ...businesses.map(b => [
        b.name,
        b.category,
        b.averageRating,
        b.reviewCount,
        bookmarkCounts[b.id] || 0
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business-report.csv';
    a.click();
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-slate-900">
                Analytics & Reports
              </h1>
            </div>
            <p className="text-lg text-slate-600">
              Data insights and business performance metrics
            </p>
          </div>
          <Button onClick={exportToCSV} className="gap-2 bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Businesses
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{businesses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Reviews
              </CardTitle>
              <MessageCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{reviews.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Bookmarks
              </CardTitle>
              <Heart className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{bookmarks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Active Deals
              </CardTitle>
              <Tag className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {deals.filter(d => new Date(d.endDate) > new Date()).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Businesses by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Businesses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Review Sentiment */}
          <Card>
            <CardHeader>
              <CardTitle>Review Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sentimentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Rated Businesses */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Rated Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRated.map((business, index) => (
                <div key={business.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-slate-400">#{index + 1}</div>
                    <div>
                      <div className="font-semibold text-slate-900">{business.name}</div>
                      <div className="text-sm text-slate-600">{business.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-amber-600">{business.averageRating.toFixed(1)} ⭐</div>
                    <div className="text-sm text-slate-600">{business.reviewCount} reviews</div>
                  </div>
                </div>
              ))}
              {topRated.length === 0 && (
                <p className="text-center text-slate-500 py-8">No rated businesses yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Most Bookmarked */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Most Bookmarked Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostBookmarked.map((business, index) => (
                <div key={business.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-slate-400">#{index + 1}</div>
                    <div>
                      <div className="font-semibold text-slate-900">{business.name}</div>
                      <div className="text-sm text-slate-600">{business.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-red-600">{business.bookmarkCount} ❤️</div>
                    <div className="text-sm text-slate-600">bookmarks</div>
                  </div>
                </div>
              ))}
              {mostBookmarked.length === 0 && (
                <p className="text-center text-slate-500 py-8">No bookmarked businesses yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Deals */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDeals.map((deal, index) => (
                <div key={deal.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-slate-400">#{index + 1}</div>
                    <div>
                      <div className="font-semibold text-slate-900">{deal.title}</div>
                      <div className="text-sm text-slate-600">{deal.category}</div>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">{deal.viewCount || 0}</div>
                      <div className="text-slate-600">views</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">{deal.saveCount || 0}</div>
                      <div className="text-slate-600">saves</div>
                    </div>
                  </div>
                </div>
              ))}
              {topDeals.length === 0 && (
                <p className="text-center text-slate-500 py-8">No deals yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}