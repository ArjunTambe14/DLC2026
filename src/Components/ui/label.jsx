// Purpose: Reusable label styling.
import React from 'react';

function Label({ className = '', ...props }) {
  // Render the UI for this view.
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`} {...props} />
  );
}

export { Label };
