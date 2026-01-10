import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Settings, Plus, Trash2, Pencil } from 'lucide-react';
import { api } from '@/api/client';
import { useAuth } from '@/context/AuthContext.jsx';

const categoryOptions = ['food', 'retail', 'services', 'health', 'auto', 'beauty', 'entertainment', 'home', 'other'];

const emptyBusiness = {
  name: '',
  category: 'food',
  address: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  website: '',
  hours: '',
  priceLevel: '$$',
  tags: '',
  description: '',
  verifiedBadge: false,
  imageUrl: '',
  gallery: ''
};

const emptyDeal = {
  businessId: '',
  title: '',
  description: '',
  discountValue: '',
  startDate: '',
  endDate: '',
  terms: '',
  couponCode: '',
  redemptionInstructions: '',
  category: 'food'
};

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [businessForm, setBusinessForm] = useState(emptyBusiness);
  const [dealForm, setDealForm] = useState(emptyDeal);
  const [editingBusinessId, setEditingBusinessId] = useState(null);
  const [editingDealId, setEditingDealId] = useState(null);

  const { data: businessData } = useQuery({
    queryKey: ['adminBusinesses'],
    queryFn: () => api.get('/businesses?page=1&pageSize=100&sort=newest'),
    enabled: user?.role === 'admin'
  });

  const { data: dealData } = useQuery({
    queryKey: ['adminDeals'],
    queryFn: () => api.get('/deals?page=1&pageSize=100'),
    enabled: user?.role === 'admin'
  });

  const { data: reviewData } = useQuery({
    queryKey: ['adminReviews'],
    queryFn: () => api.get('/admin/reviews'),
    enabled: user?.role === 'admin'
  });

  const businesses = businessData?.items || [];
  const deals = dealData?.items || [];

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
          <Settings className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
          <p className="text-slate-600">Sign in with an admin account to manage content.</p>
        </div>
      </div>
    );
  }

  const handleBusinessSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...businessForm,
      tags: businessForm.tags ? businessForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      gallery: businessForm.gallery ? businessForm.gallery.split(',').map((url) => url.trim()).filter(Boolean) : []
    };
    if (editingBusinessId) {
      await api.put(`/businesses/${editingBusinessId}`, payload);
    } else {
      await api.post('/businesses', payload);
    }
    setBusinessForm(emptyBusiness);
    setEditingBusinessId(null);
    queryClient.invalidateQueries({ queryKey: ['adminBusinesses'] });
  };

  const handleDealSubmit = async (event) => {
    event.preventDefault();
    if (editingDealId) {
      await api.put(`/deals/${editingDealId}`, dealForm);
    } else {
      await api.post('/deals', dealForm);
    }
    setDealForm(emptyDeal);
    setEditingDealId(null);
    queryClient.invalidateQueries({ queryKey: ['adminDeals'] });
  };

  const handleEditBusiness = (biz) => {
    setEditingBusinessId(biz.id);
    setBusinessForm({
      name: biz.name || '',
      category: biz.category || 'food',
      address: biz.address || '',
      city: biz.city || '',
      state: biz.state || '',
      zip: biz.zip || '',
      phone: biz.phone || '',
      website: biz.website || '',
      hours: biz.hours || '',
      priceLevel: biz.priceLevel || '$$',
      tags: (biz.tags || []).join(', '),
      description: biz.description || '',
      verifiedBadge: Boolean(biz.verifiedBadge),
      imageUrl: biz.imageUrl || '',
      gallery: (biz.gallery || []).join(', ')
    });
  };

  const handleEditDeal = (deal) => {
    setEditingDealId(deal.id);
    setDealForm({
      businessId: deal.businessId || '',
      title: deal.title || '',
      description: deal.description || '',
      discountValue: deal.discountValue || '',
      startDate: deal.startDate || '',
      endDate: deal.endDate || '',
      terms: deal.terms || '',
      couponCode: deal.couponCode || '',
      redemptionInstructions: deal.redemptionInstructions || '',
      category: deal.category || 'food'
    });
  };

  const handleDeleteBusiness = async (id) => {
    await api.delete(`/businesses/${id}`);
    queryClient.invalidateQueries({ queryKey: ['adminBusinesses'] });
  };

  const handleDeleteDeal = async (id) => {
    await api.delete(`/deals/${id}`);
    queryClient.invalidateQueries({ queryKey: ['adminDeals'] });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600">Manage businesses, deals, and reviews.</p>
          </div>
        </div>

        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="businesses">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {editingBusinessId ? 'Edit Business' : 'Add Business'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBusinessSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Business name" value={businessForm.name} onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })} required />
                  <Select value={businessForm.category} onValueChange={(value) => setBusinessForm({ ...businessForm, category: value })}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Address" value={businessForm.address} onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })} />
                  <Input placeholder="City" value={businessForm.city} onChange={(e) => setBusinessForm({ ...businessForm, city: e.target.value })} required />
                  <Input placeholder="State" value={businessForm.state} onChange={(e) => setBusinessForm({ ...businessForm, state: e.target.value })} required />
                  <Input placeholder="ZIP" value={businessForm.zip} onChange={(e) => setBusinessForm({ ...businessForm, zip: e.target.value })} />
                  <Input placeholder="Phone" value={businessForm.phone} onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })} />
                  <Input placeholder="Website" value={businessForm.website} onChange={(e) => setBusinessForm({ ...businessForm, website: e.target.value })} />
                  <Input placeholder="Hours (e.g. Mon-Fri 8am-6pm)" value={businessForm.hours} onChange={(e) => setBusinessForm({ ...businessForm, hours: e.target.value })} />
                  <Input placeholder="Price Level ($$)" value={businessForm.priceLevel} onChange={(e) => setBusinessForm({ ...businessForm, priceLevel: e.target.value })} />
                  <Input placeholder="Tags (comma separated)" value={businessForm.tags} onChange={(e) => setBusinessForm({ ...businessForm, tags: e.target.value })} />
                  <Input placeholder="Image URL" value={businessForm.imageUrl} onChange={(e) => setBusinessForm({ ...businessForm, imageUrl: e.target.value })} />
                  <Input placeholder="Gallery URLs (comma separated)" value={businessForm.gallery} onChange={(e) => setBusinessForm({ ...businessForm, gallery: e.target.value })} />
                  <Textarea className="md:col-span-2" placeholder="Description" value={businessForm.description} onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })} />
                  <div className="md:col-span-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={businessForm.verifiedBadge}
                        onChange={(e) => setBusinessForm({ ...businessForm, verifiedBadge: e.target.checked })}
                      />
                      Verified Badge
                    </label>
                    <Button type="submit">{editingBusinessId ? 'Update Business' : 'Create Business'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {businesses.map((biz) => (
                <Card key={biz.id}>
                  <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
                    <div>
                      <div className="font-semibold text-slate-900">{biz.name}</div>
                      <div className="text-sm text-slate-600">{biz.category} • {biz.city}, {biz.state}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleEditBusiness(biz)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="destructive" onClick={() => handleDeleteBusiness(biz.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="deals">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {editingDealId ? 'Edit Deal' : 'Add Deal'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDealSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={dealForm.businessId} onValueChange={(value) => setDealForm({ ...dealForm, businessId: value })}>
                    <SelectTrigger><SelectValue placeholder="Select business" /></SelectTrigger>
                    <SelectContent>
                      {businesses.map((biz) => (
                        <SelectItem key={biz.id} value={biz.id}>{biz.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={dealForm.category} onValueChange={(value) => setDealForm({ ...dealForm, category: value })}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Title" value={dealForm.title} onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })} required />
                  <Input placeholder="Discount value (e.g. 15% off)" value={dealForm.discountValue} onChange={(e) => setDealForm({ ...dealForm, discountValue: e.target.value })} required />
                  <Input type="date" value={dealForm.startDate} onChange={(e) => setDealForm({ ...dealForm, startDate: e.target.value })} required />
                  <Input type="date" value={dealForm.endDate} onChange={(e) => setDealForm({ ...dealForm, endDate: e.target.value })} required />
                  <Input placeholder="Coupon code" value={dealForm.couponCode} onChange={(e) => setDealForm({ ...dealForm, couponCode: e.target.value })} />
                  <Input placeholder="Redemption instructions" value={dealForm.redemptionInstructions} onChange={(e) => setDealForm({ ...dealForm, redemptionInstructions: e.target.value })} />
                  <Input placeholder="Terms" value={dealForm.terms} onChange={(e) => setDealForm({ ...dealForm, terms: e.target.value })} />
                  <Textarea className="md:col-span-2" placeholder="Description" value={dealForm.description} onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })} />
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit">{editingDealId ? 'Update Deal' : 'Create Deal'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {deals.map((deal) => (
                <Card key={deal.id}>
                  <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
                    <div>
                      <div className="font-semibold text-slate-900">{deal.title}</div>
                      <div className="text-sm text-slate-600">{deal.businessName} • {deal.discountValue}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleEditDeal(deal)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="destructive" onClick={() => handleDeleteDeal(deal.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Moderate Reviews</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-3">
                {(reviewData?.items || []).length === 0 && (
                  <div>No reviews available yet.</div>
                )}
                {(reviewData?.items || []).map((review) => (
                  <div key={review.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50 rounded-lg p-4">
                    <div>
                      <div className="font-semibold text-slate-900">{review.business_name}</div>
                      <div className="text-xs text-slate-500">
                        {review.reviewer_name} • {review.reviewer_email} • Rating {review.rating}
                      </div>
                      <div className="text-sm text-slate-700 mt-2">{review.review_text}</div>
                    </div>
                    <Button variant="destructive" onClick={() => api.delete(`/reviews/${review.id}`).then(() => queryClient.invalidateQueries({ queryKey: ['adminReviews'] }))}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
