// Purpose: Reusable badge styling.
import React from 'react';

const variants = {
  default: 'bg-blue-600 text-white',
  secondary: 'bg-slate-100 text-slate-700',
  outline: 'border border-slate-200 text-slate-600'
};

export function Badge({ children, variant = 'default' }) {
  // Render the UI for this view.
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}
