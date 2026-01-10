import React from 'react';
import { format, isAfter, isBefore } from 'date-fns';
import { Tag, Calendar, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function DealCard({ deal, business, onCopyCode, index = 0 }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (deal.couponCode) {
      navigator.clipboard.writeText(deal.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopyCode) onCopyCode(deal);
    }
  };

  const isActive = () => {
    const now = new Date();
    const end = new Date(deal.endDate);
    if (deal.startDate) {
      const start = new Date(deal.startDate);
      return isAfter(now, start) && isBefore(now, end);
    }
    return isBefore(now, end);
  };

  const active = isActive();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-gradient-to-br ${
        active ? 'from-orange-50 to-amber-50' : 'from-slate-50 to-slate-100'
      } rounded-2xl p-6 border-2 ${
        active ? 'border-orange-200' : 'border-slate-200'
      } shadow-sm hover:shadow-md transition-all`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${active ? 'bg-orange-100' : 'bg-slate-200'}`}>
            <Tag className={`w-5 h-5 ${active ? 'text-orange-600' : 'text-slate-500'}`} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{deal.title}</h3>
            {business && (
              <p className="text-sm text-slate-600">{business.name}</p>
            )}
          </div>
        </div>
        {active ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            Active
          </span>
        ) : (
          <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-semibold rounded-full">
            Expired
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-slate-700 mb-4">{deal.description}</p>

      {/* Coupon Code */}
      {deal.couponCode && (
        <div className="bg-white rounded-xl p-4 mb-4 border-2 border-dashed border-slate-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">COUPON CODE</p>
              <p className="text-xl font-bold text-slate-900 tracking-wider">{deal.couponCode}</p>
            </div>
            <Button
              onClick={handleCopy}
              size="sm"
              variant={copied ? "default" : "outline"}
              className={copied ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Redemption Instructions */}
      {deal.redemptionInstructions && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-blue-900 mb-1">How to Redeem:</p>
          <p className="text-sm text-blue-800">{deal.redemptionInstructions}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-slate-600 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Expires: {format(new Date(deal.endDate), 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span>{deal.viewCount || 0} views</span>
          <span>•</span>
          <span>{deal.saveCount || 0} saves</span>
        </div>
      </div>
    </motion.div>
  );
}