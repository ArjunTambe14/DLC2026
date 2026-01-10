import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { api, getToken } from '@/api/client';
import { useAuth } from '@/context/AuthContext.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#0ea5e9', '#14b8a6'];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174/api';

const downloadCsv = async (type) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/reports/${type}.csv`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  });
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${type}.csv`;
  link.click();
};

export default function Reports() {
  const { user, loading } = useAuth();

  const { data: topRated } = useQuery({
    queryKey: ['reports', 'top-rated'],
    queryFn: () => api.get('/reports/top-rated?minReviews=3'),
    enabled: user?.role === 'admin'
  });

  const { data: mostReviewed } = useQuery({
    queryKey: ['reports', 'most-reviewed'],
    queryFn: () => api.get('/reports/most-reviewed'),
    enabled: user?.role === 'admin'
  });

  const { data: favorites } = useQuery({
    queryKey: ['reports', 'favorites'],
    queryFn: () => api.get('/reports/favorites'),
    enabled: user?.role === 'admin'
  });

  const { data: deals } = useQuery({
    queryKey: ['reports', 'deals'],
    queryFn: () => api.get('/reports/deals'),
    enabled: user?.role === 'admin'
  });

  const { data: categories } = useQuery({
    queryKey: ['reports', 'category-distribution'],
    queryFn: () => api.get('/reports/category-distribution'),
    enabled: user?.role === 'admin'
  });

  const { data: weekly } = useQuery({
    queryKey: ['reports', 'weekly-activity'],
    queryFn: () => api.get('/reports/weekly-activity'),
    enabled: user?.role === 'admin'
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
          <p className="text-slate-600">Sign in with an admin account to view reports.</p>
        </div>
      </div>
    );
  }

  const categoryData = categories?.items || [];
  const weeklyDataMap = new Map();
  (weekly?.items || []).forEach((row) => {
    if (!weeklyDataMap.has(row.week)) {
      weeklyDataMap.set(row.week, { week: row.week });
    }
    weeklyDataMap.get(row.week)[row.metric] = row.count;
  });
  const weeklyData = Array.from(weeklyDataMap.values()).sort((a, b) => a.week.localeCompare(b.week));

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-slate-900">Analytics & Reports</h1>
            </div>
            <p className="text-lg text-slate-600">Admin insights for performance and growth.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Category Distribution</CardTitle>
              <Button variant="outline" onClick={() => downloadCsv('category-distribution')}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} dataKey="business_count" nameKey="category" outerRadius={110} label>
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Weekly Activity</CardTitle>
              <Button variant="outline" onClick={() => downloadCsv('weekly-activity')}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" />
                  <Line type="monotone" dataKey="reviews" stroke="#10b981" />
                  <Line type="monotone" dataKey="favorites" stroke="#ef4444" />
                  <Line type="monotone" dataKey="deal_interactions" stroke="#f59e0b" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Top Rated Businesses</CardTitle>
              <Button variant="outline" onClick={() => downloadCsv('top-rated')}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(topRated?.items || []).map((row, index) => (
                <div key={row.name} className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
                  <div>
                    <div className="font-semibold text-slate-900">#{index + 1} {row.name}</div>
                    <div className="text-sm text-slate-600">{row.category}</div>
                  </div>
                  <div className="text-sm text-slate-700">{row.average_rating} ({row.review_count} reviews)</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Most Reviewed Businesses</CardTitle>
              <Button variant="outline" onClick={() => downloadCsv('most-reviewed')}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(mostReviewed?.items || []).map((row, index) => (
                <div key={row.name} className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
                  <div>
                    <div className="font-semibold text-slate-900">#{index + 1} {row.name}</div>
                    <div className="text-sm text-slate-600">{row.category}</div>
                  </div>
                  <div className="text-sm text-slate-700">{row.review_count} reviews</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Favorites Leaderboard</CardTitle>
              <Button variant="outline" onClick={() => downloadCsv('favorites')}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(favorites?.items || []).map((row, index) => (
                <div key={row.name} className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
                  <div>
                    <div className="font-semibold text-slate-900">#{index + 1} {row.name}</div>
                    <div className="text-sm text-slate-600">{row.category}</div>
                  </div>
                  <div className="text-sm text-slate-700">{row.favorite_count} favorites</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Top Deals</CardTitle>
              <Button variant="outline" onClick={() => downloadCsv('deals')}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deals?.items || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="copy_count" fill="#f59e0b" />
                  <Bar dataKey="view_count" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Most redeemed/clicked deals (copies vs views)
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
