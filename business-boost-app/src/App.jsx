import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Phone, Mail, Search, Filter, User, LogOut, 
  Bookmark, TrendingUp, Download, Shield, ChevronRight,
  PlusCircle, Eye, EyeOff, RefreshCw, CheckCircle
} from 'lucide-react';

// ==================== UTILITY FUNCTIONS ====================
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let captcha = '';
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};

const exportToCSV = (businesses) => {
  const headers = ['Name', 'Category', 'Address', 'Rating', 'Reviews', 'Deals'];
  const csv = [
    headers.join(','),
    ...businesses.map(b => [
      `"${b.name}"`,
      b.category,
      `"${b.address}"`,
      b.rating,
      b.reviewCount,
      `"${b.deals || ''}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'businesses.csv';
  a.click();
  window.URL.revokeObjectURL(url);
};

// ==================== SAMPLE DATA ====================
const initialBusinesses = [
  {
    id: 1,
    name: 'Java Junction Cafe',
    category: 'food',
    address: '123 Main St, Cityville',
    phone: '(555) 123-4567',
    email: 'contact@javajunction.com',
    description: 'Cozy coffee shop with artisanal brews and pastries. Free WiFi and comfortable seating.',
    rating: 4.5,
    reviewCount: 128,
    deals: 'Buy 5 coffees, get 1 free • 10% off for students',
    hours: '6AM-9PM Mon-Fri, 7AM-10PM Sat-Sun',
    bookmarked: false
  },
  {
    id: 2,
    name: 'Tech Haven',
    category: 'retail',
    address: '456 Tech Blvd, Cityville',
    phone: '(555) 987-6543',
    email: 'support@techhaven.com',
    description: 'Electronics and computer accessories store with expert advice and repair services.',
    rating: 4.2,
    reviewCount: 89,
    deals: '10% off on weekends for students • Free setup with purchase',
    hours: '10AM-8PM Mon-Sat, 12PM-6PM Sun',
    bookmarked: false
  },
  {
    id: 3,
    name: 'Green Thumb Landscaping',
    category: 'services',
    address: '789 Garden Way, Cityville',
    phone: '(555) 456-7890',
    email: 'service@greenthumb.com',
    description: 'Professional landscaping and garden maintenance with eco-friendly practices.',
    rating: 4.8,
    reviewCount: 67,
    deals: 'Free consultation for first-time customers • 15% off seasonal packages',
    hours: '8AM-6PM Mon-Fri, 9AM-4PM Sat',
    bookmarked: false
  },
  {
    id: 4,
    name: 'Urban Bistro',
    category: 'food',
    address: '321 Downtown Ave, Cityville',
    phone: '(555) 234-5678',
    email: 'hello@urbanbistro.com',
    description: 'Modern bistro serving farm-to-table cuisine with vegan and gluten-free options.',
    rating: 4.6,
    reviewCount: 156,
    deals: 'Happy Hour 4-6PM • 20% off for birthday celebrations',
    hours: '11AM-11PM Daily',
    bookmarked: false
  },
  {
    id: 5,
    name: 'Book Nook',
    category: 'retail',
    address: '567 Literary Lane, Cityville',
    phone: '(555) 345-6789',
    email: 'books@booknook.com',
    description: 'Independent bookstore with curated selection and author events.',
    rating: 4.7,
    reviewCount: 94,
    deals: 'Buy 3 books, get 1 free • Free book with coffee purchase',
    hours: '9AM-9PM Mon-Sat, 10AM-6PM Sun',
    bookmarked: false
  }
];

const initialReviews = [
  {
    id: 1,
    businessId: 1,
    userId: 1,
    userName: 'Alex Johnson',
    rating: 5,
    comment: 'Best coffee in town! The atmosphere is perfect for working.',
    date: '2024-01-15'
  },
  {
    id: 2,
    businessId: 2,
    userId: 2,
    userName: 'Sam Rivera',
    rating: 4,
    comment: 'Great selection of tech gadgets. Staff is very knowledgeable.',
    date: '2024-01-10'
  }
];

// ==================== COMPONENTS ====================
const StarRating = ({ rating, interactive = false, onRate }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`p-1 ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        >
          <Star
            className={`w-5 h-5 ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const BusinessCard = ({ business, onBookmark, onReview, isBookmarked }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{business.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {business.category}
            </span>
            <div className="flex items-center">
              <StarRating rating={business.rating} />
              <span className="ml-2 text-gray-600 font-medium">
                {business.rating} ({business.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onBookmark(business.id)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          {isBookmarked ? (
            <Bookmark className="w-6 h-6 fill-blue-600 text-blue-600" />
          ) : (
            <Bookmark className="w-6 h-6 text-gray-400" />
          )}
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{business.address}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          <span>{business.phone}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          <span>{business.email}</span>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{business.description}</p>

      {business.deals && (
        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex items-center font-medium text-yellow-800 mb-1">
            <Star className="w-4 h-4 mr-2" />
            Special Deals
          </div>
          <p className="text-sm text-yellow-700">{business.deals}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => onReview(business)}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Review
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
};

const CaptchaModal = ({ isOpen, onVerify, onClose }) => {
  const [captcha, setCaptcha] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCaptcha(generateCaptcha());
      setUserInput('');
      setError('');
    }
  }, [isOpen]);

  const handleRefresh = () => {
    setCaptcha(generateCaptcha());
    setUserInput('');
    setError('');
  };

  const handleVerify = () => {
    if (userInput.toUpperCase() === captcha) {
      onVerify();
    } else {
      setError('Incorrect CAPTCHA. Please try again.');
      handleRefresh();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Bot Prevention
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Please enter the characters shown below to verify you're human.
        </p>

        <div className="mb-6">
          <div className="bg-gray-900 p-4 rounded-lg text-center">
            <div className="text-3xl font-mono font-bold tracking-widest text-white mb-2">
              {captcha.split('').map((char, i) => (
                <span
                  key={i}
                  className={`inline-block transform ${
                    i % 2 === 0 ? 'rotate-3' : '-rotate-3'
                  } ${
                    ['text-red-400', 'text-green-400', 'text-blue-400', 'text-yellow-400'][i % 4]
                  }`}
                >
                  {char}
                </span>
              ))}
            </div>
            <button
              onClick={handleRefresh}
              className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="w-3 h-3" />
              Generate new code
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter the characters above
            </label>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type the characters"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleVerify}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Verify
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewModal = ({ isOpen, business, onSubmit, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleSubmit = () => {
    if (comment.trim().length < 10) {
      alert('Please write a review of at least 10 characters.');
      return;
    }
    setShowCaptcha(true);
  };

  const handleCaptchaVerify = () => {
    onSubmit({
      businessId: business.id,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    });
    setShowCaptcha(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Review {business?.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Rating
              </label>
              <StarRating 
                rating={rating} 
                interactive={true} 
                onRate={setRating} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Share your experience with this business..."
              />
              <p className="text-sm text-gray-500 mt-2">
                {comment.length}/200 characters
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Submit Review
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <CaptchaModal
        isOpen={showCaptcha}
        onVerify={handleCaptchaVerify}
        onClose={() => setShowCaptcha(false)}
      />
    </>
  );
};

// ==================== MAIN APP ====================
const App = () => {
  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [reviews, setReviews] = useState(initialReviews);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minRating: 0,
    sortBy: 'name'
  });
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    email: '',
    isRegistering: false
  });

  // Filter businesses
  const filteredBusinesses = businesses
    .filter(b => {
      if (filters.search && !b.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !b.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category !== 'all' && b.category !== filters.category) {
        return false;
      }
      if (filters.minRating > 0 && b.rating < filters.minRating) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'reviews': return b.reviewCount - a.reviewCount;
        default: return a.name.localeCompare(b.name);
      }
    });

  // Get bookmarked businesses
  const bookmarkedBusinesses = businesses.filter(b => b.bookmarked);

  // Get user reviews
  const userReviews = user ? reviews.filter(r => r.userId === user.id) : [];

  // Get statistics
  const stats = {
    totalBusinesses: businesses.length,
    averageRating: (businesses.reduce((sum, b) => sum + b.rating, 0) / businesses.length).toFixed(1),
    totalReviews: businesses.reduce((sum, b) => sum + b.reviewCount, 0),
    byCategory: businesses.reduce((acc, b) => {
      acc[b.category] = (acc[b.category] || 0) + 1;
      return acc;
    }, {})
  };

  // Event Handlers
  const handleBookmark = (businessId) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    
    setBusinesses(businesses.map(b => 
      b.id === businessId ? { ...b, bookmarked: !b.bookmarked } : b
    ));
  };

  const handleReview = (business) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setSelectedBusiness(business);
    setShowReviewModal(true);
  };

  const handleSubmitReview = (reviewData) => {
    const newReview = {
      id: reviews.length + 1,
      businessId: reviewData.businessId,
      userId: user.id,
      userName: user.username,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: reviewData.date
    };

    setReviews([newReview, ...reviews]);

    // Update business rating
    const businessReviews = reviews.filter(r => r.businessId === reviewData.businessId);
    const newBusinessReviews = [...businessReviews, newReview];
    const newRating = newBusinessReviews.reduce((sum, r) => sum + r.rating, 0) / newBusinessReviews.length;

    setBusinesses(businesses.map(b => 
      b.id === reviewData.businessId 
        ? { 
            ...b, 
            rating: parseFloat(newRating.toFixed(1)),
            reviewCount: b.reviewCount + 1
          }
        : b
    ));
  };

  const handleLogin = () => {
    if (!loginForm.username || !loginForm.password) {
      alert('Please enter username and password');
      return;
    }

    if (loginForm.isRegistering) {
      if (!loginForm.email) {
        alert('Please enter email');
        return;
      }
      // In a real app, this would be an API call
      setUser({
        id: Date.now(),
        username: loginForm.username,
        email: loginForm.email
      });
      alert('Registration successful!');
    } else {
      // Demo login - in real app, verify credentials
      setUser({
        id: 1,
        username: loginForm.username
      });
    }

    setShowLogin(false);
    setLoginForm({
      username: '',
      password: '',
      email: '',
      isRegistering: false
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleExport = () => {
    exportToCSV(businesses);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-lg sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Byte-Sized Business Boost</h1>
                    <p className="text-sm text-gray-600">Discover & Support Local Businesses</p>
                  </div>
                </div>
              </div>

              <nav className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                  Discover
                </Link>
                <Link to="/bookmarks" className="text-gray-700 hover:text-blue-600 font-medium">
                  Bookmarks ({bookmarkedBusinesses.length})
                </Link>
                <Link to="/reviews" className="text-gray-700 hover:text-blue-600 font-medium">
                  My Reviews ({userReviews.length})
                </Link>
                <Link to="/stats" className="text-gray-700 hover:text-blue-600 font-medium">
                  Statistics
                </Link>
              </nav>

              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-700">{user.username}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowLogin(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Discover Page */}
            <Route path="/" element={
              <>
                <div className="mb-8">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search businesses by name or description..."
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={filters.search}
                          onChange={(e) => setFilters({...filters, search: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <select
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.category}
                        onChange={(e) => setFilters({...filters, category: e.target.value})}
                      >
                        <option value="all">All Categories</option>
                        <option value="food">Food & Drink</option>
                        <option value="retail">Retail</option>
                        <option value="services">Services</option>
                      </select>

                      <select
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.minRating}
                        onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                      >
                        <option value="0">All Ratings</option>
                        <option value="4">4+ Stars</option>
                        <option value="3">3+ Stars</option>
                        <option value="2">2+ Stars</option>
                      </select>

                      <select
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.sortBy}
                        onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                      >
                        <option value="name">Sort by Name</option>
                        <option value="rating">Sort by Rating</option>
                        <option value="reviews">Sort by Reviews</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {filteredBusinesses.length} Businesses Found
                  </h2>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>

                {filteredBusinesses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <Search className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No businesses found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredBusinesses.map(business => (
                      <BusinessCard
                        key={business.id}
                        business={business}
                        onBookmark={handleBookmark}
                        onReview={handleReview}
                        isBookmarked={business.bookmarked}
                      />
                    ))}
                  </div>
                )}
              </>
            } />

            {/* Bookmarks Page */}
            <Route path="/bookmarks" element={
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Bookmarks</h2>
                  <p className="text-gray-600">Businesses you've saved for quick access</p>
                </div>

                {bookmarkedBusinesses.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                    <div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6">
                      <Bookmark className="w-12 h-12 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookmarks yet</h3>
                    <p className="text-gray-500 mb-6">Discover businesses and click the bookmark icon to save them</p>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Discover Businesses
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {bookmarkedBusinesses.map(business => (
                      <BusinessCard
                        key={business.id}
                        business={business}
                        onBookmark={handleBookmark}
                        onReview={handleReview}
                        isBookmarked={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            } />

            {/* Reviews Page */}
            <Route path="/reviews" element={
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Reviews</h2>
                  <p className="text-gray-600">Reviews you've submitted for local businesses</p>
                </div>

                {!user ? (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                    <div className="w-24 h-24 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Please login to view your reviews</h3>
                    <p className="text-gray-500 mb-6">Login to see and manage your reviews</p>
                    <button
                      onClick={() => setShowLogin(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Login Now
                    </button>
                  </div>
                ) : userReviews.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                    <div className="w-24 h-24 mx-auto bg-yellow-50 rounded-full flex items-center justify-center mb-6">
                      <Star className="w-12 h-12 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No reviews yet</h3>
                    <p className="text-gray-500 mb-6">Add your first review to help other community members</p>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Review
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userReviews.map(review => {
                      const business = businesses.find(b => b.id === review.businessId);
                      return (
                        <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-gray-900">{business?.name}</h3>
                              <div className="flex items-center gap-4 mt-1">
                                <StarRating rating={review.rating} />
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                              {business?.category}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            } />

            {/* Statistics Page */}
            <Route path="/stats" element={
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Statistics</h2>
                  <p className="text-gray-600">Insights about local businesses in our community</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Businesses</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalBusinesses}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Average Rating</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.averageRating}/5.0</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Reviews</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Active Categories</p>
                        <p className="text-3xl font-bold text-gray-900">{Object.keys(stats.byCategory).length}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Filter className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Business Distribution by Category</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(stats.byCategory).map(([category, count]) => (
                      <div key={category} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900 capitalize">{category}</span>
                          <span className="text-2xl font-bold text-blue-600">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / stats.totalBusinesses) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {((count / stats.totalBusinesses) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-xl font-bold">Byte-Sized Business Boost</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Connecting communities with local businesses since 2024
                </p>
              </div>
              <div className="flex gap-6">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 text-gray-300 hover:text-white"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white"
                >
                  <User className="w-4 h-4" />
                  {user ? 'Account' : 'Login'}
                </button>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-400 text-sm">
              <p>© 2024 Byte-Sized Business Boost. All sample data is fictional for demonstration purposes.</p>
            </div>
          </div>
        </footer>

        {/* Login Modal */}
        {showLogin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {loginForm.isRegistering ? 'Create Account' : 'Login'}
                </h3>
                <button
                  onClick={() => {
                    setShowLogin(false);
                    setLoginForm({
                      username: '',
                      password: '',
                      email: '',
                      isRegistering: false
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter username"
                  />
                </div>

                {loginForm.isRegistering && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setLoginForm({...loginForm, isRegistering: !loginForm.isRegistering})}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {loginForm.isRegistering
                      ? 'Already have an account? Login'
                      : "Don't have an account? Register"}
                  </button>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleLogin}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {loginForm.isRegistering ? 'Register' : 'Login'}
                  </button>
                  <button
                    onClick={() => setShowLogin(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        <ReviewModal
          isOpen={showReviewModal}
          business={selectedBusiness}
          onSubmit={handleSubmitReview}
          onClose={() => setShowReviewModal(false)}
        />
      </div>
    </Router>
  );
};

// ==================== RENDER ====================
export default App;