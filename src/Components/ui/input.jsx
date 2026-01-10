import React from 'react';

const Input = React.forwardRef(function Input({ className = '', ...props }, ref) {
  const classes =
    'flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ' +
    className;

  return <input ref={ref} className={classes} {...props} />;
});

export { Input };
