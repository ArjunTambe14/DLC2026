import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useAuth } from '@/context/AuthContext.jsx';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Star,
  Heart,
  CheckCircle,
  Tag as TagIcon,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import DealCard from '../Components/deal/DealCard';

export default function BusinessDetail() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('id');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [reviewPage, setReviewPage] = useState(1);
  const [newReview, setNewReview] = useState({ rating: 5, reviewText: '' });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [challengeAnswer, setChallengeAnswer] = useState('');

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => api.get(`/businesses/${businessId}`),
    enabled: !!businessId
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', businessId, reviewPage],
    queryFn: () => api.get(`/businesses/${businessId}/reviews?page=${reviewPage}&pageSize=5`),
    enabled: !!businessId
  });

  const { data: dealsData } = useQuery({
    queryKey: ['deals', businessId],
    queryFn: () => api.get(`/deals?businessId=${businessId}&page=1&pageSize=6`),
    enabled: !!businessId
  });

  const { data: bookmarksData } = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: () => api.get('/bookmarks'),
    enabled: !!user
  });

  useEffect(() => {
    if (bookmarksData?.items && businessId) {
      setIsBookmarked(bookmarksData.items.some((item) => item.id === businessId));
    }
  }, [bookmarksData, businessId]);

  useEffect(() => {
    if (businessId) {
      api.get('/verify-challenge?purpose=review').then(setChallenge).catch(() => setChallenge(null));
    }
  }, [businessId]);

  const activeDeals = useMemo(() => {
    const items = dealsData?.items || [];
    const now = new Date();
    return items.filter((deal) => new Date(deal.endDate) > now);
  }, [dealsData]);

  const handleCopyCode = async (deal) => {
    if (!user) return;
    try {
      await api.post(`/deals/${deal.id}/copy`, {});
    } catch {
      // Ignore copy errors.
    }
  };

  const toggleBookmarkMutation = useMutation({
    mutationFn: () => api.post(`/bookmarks/${businessId}`, {}),
    onSuccess: (data) => {
      setIsBookmarked(data.saved);
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] });
    }
  });

  const createReviewMutation = useMutation({
    mutationFn: (payload) => api.post(`/businesses/${businessId}/reviews`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      setNewReview({ rating: 5, reviewText: '' });
      setChallengeAnswer('');
      api.get('/verify-challenge?purpose=review').then(setChallenge).catch(() => setChallenge(null));
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => api.delete(`/reviews/${reviewId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
    }
  });

  const handleReviewSubmit = () => {
    if (!user) {
      return;
    }
    if (!newReview.reviewText.trim() || newReview.reviewText.trim().length < 10) {
      alert('Review must be at least 10 characters long.');
      return;
    }
    createReviewMutation.mutate({
      rating: newReview.rating,
      reviewText: newReview.reviewText,
      challengeToken: challenge?.token,
      challengeAnswer
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

  const categoryLabel = business.category
    ? business.category.charAt(0).toUpperCase() + business.category.slice(1)
    : '';

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <TagIcon className="w-32 h-32 text-slate-300" />
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
                {categoryLabel}
              </div>
              {business.openNow !== null && (
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${business.openNow ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {business.openNow ? 'Open Now' : 'Closed'}
                </div>
              )}
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  {business.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                    <span className="text-2xl font-bold text-slate-900">
                      {business.averageRating > 0 ? business.averageRating.toFixed(1) : 'New'}
                    </span>
                    <span className="text-slate-600">
                      ({business.reviewCount} {business.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                  <Badge variant="secondary">{business.priceLevel}</Badge>
                </div>
                <p className="text-slate-700 mb-6">{business.description}</p>
                <div className="flex flex-wrap gap-2">
                  {business.tags?.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[220px]">
                {user ? (
                  <Button
                    onClick={() => toggleBookmarkMutation.mutate()}
                    variant={isBookmarked ? "default" : "outline"}
                    className={isBookmarked ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Saved to Favorites' : 'Add to Favorites'}
                  </Button>
                ) : (
                  <Link to="/Auth">
                    <Button variant="outline">Sign in to Save</Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <div>{business.address}</div>
                  <div>{business.city}, {business.state} {business.zip}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <div>{business.hours || 'Hours not listed.'}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <div>{business.phone}</div>
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      Visit Website <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="w-5 h-5 text-blue-600" />
                    Quick Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <div>Category: {categoryLabel}</div>
                  <div>Price Level: {business.priceLevel}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Gallery */}
        {business.gallery?.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Photo Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {business.gallery.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${business.name} gallery ${index + 1}`}
                  className="rounded-2xl object-cover h-64 w-full"
                />
              ))}
            </div>
          </div>
        )}

        {/* Active Deals */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TagIcon className="w-5 h-5 text-orange-500" />
            <h2 className="text-2xl font-bold text-slate-900">Active Deals</h2>
          </div>
          {activeDeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeDeals.map((deal, index) => (
                <DealCard key={deal.id} deal={deal} index={index} onCopyCode={handleCopyCode} />
              ))}
            </div>
          ) : (
            <p className="text-slate-600">No active deals right now. Check back soon.</p>
          )}
        </div>

        {/* Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl font-bold text-slate-900">Reviews</h2>
            </div>

            {(reviewsData?.items || []).length > 0 ? (
              <div className="space-y-6">
                {(reviewsData?.items || []).map((review) => (
                  <div key={review.id} className="border-b border-slate-200 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-slate-900">{review.userName}</div>
                      <div className="flex items-center gap-2 text-amber-500">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span>{review.rating}</span>
                        {user?.role === 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => deleteReviewMutation.mutate(review.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-700">{review.reviewText}</p>
                    <div className="text-xs text-slate-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600">No reviews yet. Be the first to share your experience.</p>
            )}

            {reviewsData?.pagination?.totalPages > 1 && (
              <div className="flex items-center gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setReviewPage((prev) => Math.max(prev - 1, 1))}
                  disabled={reviewsData.pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-600">
                  Page {reviewsData.pagination.page} of {reviewsData.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setReviewPage((prev) => Math.min(prev + 1, reviewsData.pagination.totalPages))}
                  disabled={reviewsData.pagination.page === reviewsData.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">Leave a Review</h3>
            </div>

            {user ? (
              <>
                <label className="text-sm font-medium text-slate-700">Rating</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="mt-2"
                />

                <label className="text-sm font-medium text-slate-700 mt-4 block">Your Review</label>
                <Textarea
                  value={newReview.reviewText}
                  onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })}
                  placeholder="Share what stood out about this business."
                  rows={4}
                  className="mt-2"
                />

                {challenge && (
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium text-slate-700">Verification</label>
                    <div className="text-xs text-slate-500">{challenge.question}</div>
                    <Input
                      value={challengeAnswer}
                      onChange={(e) => setChallengeAnswer(e.target.value)}
                      placeholder="Enter your answer"
                    />
                  </div>
                )}

                <Button
                  onClick={handleReviewSubmit}
                  className="mt-6 w-full"
                  disabled={createReviewMutation.isLoading}
                >
                  Submit Review
                </Button>
              </>
            ) : (
              <div className="text-sm text-slate-600">
                Please <Link to="/Auth" className="text-blue-600 hover:text-blue-700">sign in</Link> to leave a review.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
