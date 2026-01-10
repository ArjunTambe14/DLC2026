import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Card } from '@/Components/ui/card';
import { 
  MapPin, Phone, Globe, Clock, DollarSign, Star, Heart, 
  CheckCircle, Tag as TagIcon, Calendar, ExternalLink, Send 
} from 'lucide-react';
import { motion } from 'framer-motion';
import DealCard from '../Components/deal/DealCard';
import AIChat from '../Components/ai/AIChat';

export default function BusinessDetail() {
  const [businessId, setBusinessId] = useState(null);
  const [user, setUser] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, reviewText: '' });
  const [isBookmarked, setIsBookmarked] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    setBusinessId(id);

    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => base44.entities.Business.filter({ id: businessId }),
    enabled: !!businessId,
    select: (data) => data[0]
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', businessId],
    queryFn: () => base44.entities.Review.filter({ businessId }, '-created_date'),
    enabled: !!businessId
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals', businessId],
    queryFn: () => base44.entities.Deal.filter({ businessId }),
    enabled: !!businessId
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks', user?.email],
    queryFn: () => base44.entities.Bookmark.filter({ userEmail: user.email }),
    enabled: !!user
  });

  useEffect(() => {
    if (bookmarks.length > 0 && businessId) {
      setIsBookmarked(bookmarks.some(b => b.businessId === businessId));
    }
  }, [bookmarks, businessId]);

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      // Check for duplicate review
      const existingReviews = await base44.entities.Review.filter({
        businessId,
        userEmail: user.email
      });

      if (existingReviews.length > 0) {
        throw new Error('You have already reviewed this business');
      }

      // Basic profanity filter
      const profanity = ['spam', 'scam', 'fake'];
      const hasProfanity = profanity.some(word => 
        reviewData.reviewText.toLowerCase().includes(word)
      );

      if (hasProfanity) {
        throw new Error('Review contains inappropriate content');
      }

      return base44.entities.Review.create(reviewData);
    },
    onSuccess: async () => {
      // Recalculate average rating
      const allReviews = await base44.entities.Review.filter({ businessId });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await base44.entities.Business.update(businessId, {
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length
      });

      queryClient.invalidateQueries({ queryKey: ['reviews', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      setNewReview({ rating: 5, reviewText: '' });
    }
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        const bookmark = bookmarks.find(b => b.businessId === businessId);
        await base44.entities.Bookmark.delete(bookmark.id);
      } else {
        await base44.entities.Bookmark.create({
          businessId,
          userEmail: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.email] });
      setIsBookmarked(!isBookmarked);
    }
  });

  const handleSubmitReview = async () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    if (!newReview.reviewText.trim() || newReview.reviewText.length < 10) {
      alert('Review must be at least 10 characters long');
      return;
    }

    createReviewMutation.mutate({
      businessId,
      rating: newReview.rating,
      reviewText: newReview.reviewText,
      userName: user.full_name,
      userEmail: user.email
    });
  };

  if (isLoading || !business) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-slate-200 rounded-2xl" />
            <div className="h-32 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const activeDeals = deals.filter(d => new Date(d.endDate) > new Date());

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8"
        >
          <div className="relative h-80 bg-gradient-to-br from-blue-100 to-slate-100">
            {business.imageUrl ? (
              <img
                src={business.imageUrl}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <DollarSign className="w-32 h-32 text-slate-300" />
              </div>
            )}
            <div className="absolute top-6 right-6 flex gap-3">
              {business.verifiedBadge && (
                <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </div>
              )}
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-slate-700">
                {business.category}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  {business.name}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                    <span className="text-2xl font-bold text-slate-900">
                      {business.averageRating > 0 ? business.averageRating.toFixed(1) : 'New'}
                    </span>
                    <span className="text-slate-600">
                      ({business.reviewCount} {business.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                  <span className="text-slate-400">•</span>
                  <span className="text-xl font-semibold text-slate-700">
                    {business.priceLevel}
                  </span>
                </div>
              </div>

              {user && (
                <Button
                  onClick={() => toggleBookmarkMutation.mutate()}
                  variant={isBookmarked ? "default" : "outline"}
                  size="lg"
                  className={`gap-2 ${isBookmarked ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Saved' : 'Save'}
                </Button>
              )}
            </div>

            {business.description && (
              <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                {business.description}
              </p>
            )}

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-900 mb-1">Address</div>
                  <div className="text-slate-600">
                    {business.address}
                    <br />
                    {business.city}, {business.state} {business.zip}
                  </div>
                </div>
              </div>

              {business.phone && (
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 mb-1">Phone</div>
                    <a href={`tel:${business.phone}`} className="text-blue-600 hover:underline">
                      {business.phone}
                    </a>
                  </div>
                </div>
              )}

              {business.website && (
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 mb-1">Website</div>
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Visit website <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {business.hours && (
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 mb-1">Hours</div>
                    <div className="text-slate-600">{business.hours}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {business.tags && business.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {business.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Deals */}
            {activeDeals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-bold text-slate-900">
                    Active Deals
                  </h2>
                </div>
                <div className="space-y-4">
                  {activeDeals.map((deal, index) => (
                    <DealCard key={deal.id} deal={deal} business={business} index={index} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Reviews ({reviews.length})
              </h2>

              {/* Add Review */}
              {user && (
                <Card className="p-6 mb-6 bg-slate-50 border-2 border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Write a Review</h3>
                  
                  {/* Star Rating */}
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= newReview.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <Textarea
                    placeholder="Share your experience... (minimum 10 characters)"
                    value={newReview.reviewText}
                    onChange={(e) => setNewReview(prev => ({ ...prev, reviewText: e.target.value }))}
                    className="mb-4 min-h-32"
                  />

                  <Button
                    onClick={handleSubmitReview}
                    disabled={createReviewMutation.isPending || newReview.reviewText.length < 10}
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>

                  {createReviewMutation.isError && (
                    <p className="text-red-600 text-sm mt-2">
                      {createReviewMutation.error.message}
                    </p>
                  )}
                </Card>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">
                          {review.userName}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(review.created_date).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-slate-700">{review.reviewText}</p>
                  </Card>
                ))}

                {reviews.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* AI Chat */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AIChat business={business} reviews={reviews} deals={activeDeals} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}