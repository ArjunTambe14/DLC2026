// Purpose: Loading placeholder component.
import React from 'react';

function Skeleton({ className = '', ...props }) {
  // Render the UI for this view.
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 ${className}`}
      {...props}
    />
  );
}

export { Skeleton };
