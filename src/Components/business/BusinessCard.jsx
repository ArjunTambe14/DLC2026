// Purpose: Card UI for a single business listing.
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { MapPin, Phone, Star, CheckCircle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BusinessCard({ business, index = 0 }) {
  const categoryLabel = business.category
    ? business.category.charAt(0).toUpperCase() + business.category.slice(1)
    : '';

  // Render the UI for this view.
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={createPageUrl(`BusinessDetail?id=${business.id}`)}>
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 group h-full">
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-blue-100 to-slate-100 overflow-hidden">
            {business.imageUrl ? (
              <img
                src={business.imageUrl}
                alt={business.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <DollarSign className="w-16 h-16 text-slate-300" />
              </div>
            )}
            {business.verifiedBadge && (
              <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                <CheckCircle className="w-3 h-3" />
                Verified
              </div>
            )}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-slate-700">
              {categoryLabel}
            </div>
            {business.openNow !== null && (
              <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${business.openNow ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {business.openNow ? 'Open Now' : 'Closed'}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
              {business.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-900">
                  {business.averageRating > 0 ? business.averageRating.toFixed(1) : 'New'}
                </span>
              </div>
              <span className="text-sm text-slate-500">
                ({business.reviewCount} {business.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-sm font-medium text-slate-600">{business.priceLevel}</span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
              {business.description || 'No description available.'}
            </p>

            {/* Location & Phone */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                <span className="line-clamp-1">
                  {business.city}, {business.state}
                </span>
              </div>
              {business.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  <span>{business.phone}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {business.tags && business.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {business.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
