// Purpose: Reusable card layout primitive.
import React from 'react';

function Card({ className = '', ...props }) {
  // Render the UI for this view.
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white shadow-sm ${className}`}
      {...props}
    />
  );
}

function CardHeader({ className = '', ...props }) {
  return <div className={`p-6 pb-2 ${className}`} {...props} />;
}

function CardTitle({ className = '', ...props }) {
  return <h3 className={`text-lg font-semibold ${className}`} {...props} />;
}

function CardContent({ className = '', ...props }) {
  return <div className={`p-6 pt-2 ${className}`} {...props} />;
}

export { Card, CardHeader, CardTitle, CardContent };
