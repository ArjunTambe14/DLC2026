import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Settings, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPanel() {
  const queryClient = useQueryClient();

  // Business Form State
  const [businessForm, setBusinessForm] = useState({
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
    imageUrl: ''
  });

  // Deal Form State
  const [dealForm, setDealForm] = useState({
    businessId: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    couponCode: '',
    redemptionInstructions: '',
    category: 'food'
  });

  const createBusinessMutation = useMutation({
    mutationFn: (data) => {
      const formattedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
        averageRating: 0,
        reviewCount: 0
      };
      return base44.entities.Business.create(formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['allBusinesses'] });
      setBusinessForm({
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
        imageUrl: ''
      });
      alert('Business created successfully!');
    }
  });

  const createDealMutation = useMutation({
    mutationFn: (data) => base44.entities.Deal.create({ ...data, viewCount: 0, saveCount: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['featuredDeals'] });
      setDealForm({
        businessId: '',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        couponCode: '',
        redemptionInstructions: '',
        category: 'food'
      });
      alert('Deal created successfully!');
    }
  });

  const handleBusinessSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!businessForm.name || !businessForm.city || !businessForm.state) {
      alert('Please fill in required fields: Name, City, State');
      return;
    }

    createBusinessMutation.mutate(businessForm);
  };

  const handleDealSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!dealForm.businessId || !dealForm.title || !dealForm.endDate) {
      alert('Please fill in required fields: Business ID, Title, End Date');
      return;
    }

    if (dealForm.startDate && new Date(dealForm.endDate) <= new Date(dealForm.startDate)) {
      alert('End date must be after start date');
      return;
    }

    createDealMutation.mutate(dealForm);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">
              Admin Panel
            </h1>
          </div>
          <p className="text-lg text-slate-600">
            Manage businesses and deals
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="business" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white">
            <TabsTrigger value="business" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
              Add Business
            </TabsTrigger>
            <TabsTrigger value="deal" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900">
              Add Deal
            </TabsTrigger>
          </TabsList>

          {/* Add Business */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Business
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBusinessSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Business Name *</Label>
                      <Input
                        id="name"
                        value={businessForm.name}
                        onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                        placeholder="Joe's Coffee Shop"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={businessForm.category}
                        onValueChange={(value) => setBusinessForm({ ...businessForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={businessForm.address}
                        onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                        placeholder="123 Main St"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={businessForm.city}
                        onChange={(e) => setBusinessForm({ ...businessForm, city: e.target.value })}
                        placeholder="Springfield"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={businessForm.state}
                        onChange={(e) => setBusinessForm({ ...businessForm, state: e.target.value })}
                        placeholder="IL"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        value={businessForm.zip}
                        onChange={(e) => setBusinessForm({ ...businessForm, zip: e.target.value })}
                        placeholder="62701"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={businessForm.phone}
                        onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={businessForm.website}
                        onChange={(e) => setBusinessForm({ ...businessForm, website: e.target.value })}
                        placeholder="https://joescoffee.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="hours">Hours</Label>
                      <Input
                        id="hours"
                        value={businessForm.hours}
                        onChange={(e) => setBusinessForm({ ...businessForm, hours: e.target.value })}
                        placeholder="Mon-Fri 9AM-5PM"
                      />
                    </div>

                    <div>
                      <Label htmlFor="priceLevel">Price Level</Label>
                      <Select
                        value={businessForm.priceLevel}
                        onValueChange={(value) => setBusinessForm({ ...businessForm, priceLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="$">$ (Budget)</SelectItem>
                          <SelectItem value="$$">$$ (Moderate)</SelectItem>
                          <SelectItem value="$$$">$$$ (Upscale)</SelectItem>
                          <SelectItem value="$$$$">$$$$ (Luxury)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={businessForm.imageUrl}
                        onChange={(e) => setBusinessForm({ ...businessForm, imageUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={businessForm.tags}
                        onChange={(e) => setBusinessForm({ ...businessForm, tags: e.target.value })}
                        placeholder="coffee, breakfast, wifi"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={businessForm.description}
                      onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                      placeholder="A cozy coffee shop serving fresh pastries..."
                      className="min-h-24"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={businessForm.verifiedBadge}
                      onChange={(e) => setBusinessForm({ ...businessForm, verifiedBadge: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="verified" className="cursor-pointer">
                      Verified Business
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={createBusinessMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {createBusinessMutation.isPending ? 'Creating...' : 'Create Business'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Deal */}
          <TabsContent value="deal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Create New Deal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDealSubmit} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Get the Business ID from the business detail page URL (e.g., ?id=abc123)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessId">Business ID *</Label>
                      <Input
                        id="businessId"
                        value={dealForm.businessId}
                        onChange={(e) => setDealForm({ ...dealForm, businessId: e.target.value })}
                        placeholder="Business ID"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="dealCategory">Category *</Label>
                      <Select
                        value={dealForm.category}
                        onValueChange={(value) => setDealForm({ ...dealForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="dealTitle">Deal Title *</Label>
                      <Input
                        id="dealTitle"
                        value={dealForm.title}
                        onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                        placeholder="50% Off Your First Order"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={dealForm.startDate}
                        onChange={(e) => setDealForm({ ...dealForm, startDate: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={dealForm.endDate}
                        onChange={(e) => setDealForm({ ...dealForm, endDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="couponCode">Coupon Code</Label>
                      <Input
                        id="couponCode"
                        value={dealForm.couponCode}
                        onChange={(e) => setDealForm({ ...dealForm, couponCode: e.target.value })}
                        placeholder="WELCOME50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dealDescription">Description *</Label>
                    <Textarea
                      id="dealDescription"
                      value={dealForm.description}
                      onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                      placeholder="Get 50% off your first order when you sign up..."
                      className="min-h-24"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="redemption">Redemption Instructions</Label>
                    <Textarea
                      id="redemption"
                      value={dealForm.redemptionInstructions}
                      onChange={(e) => setDealForm({ ...dealForm, redemptionInstructions: e.target.value })}
                      placeholder="Show this coupon code at checkout..."
                      className="min-h-20"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={createDealMutation.isPending}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {createDealMutation.isPending ? 'Creating...' : 'Create Deal'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}