import React from 'react';

const baseClasses =
  'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 disabled:pointer-events-none';

const variantClasses = {
  default: 'bg-[#02142c] text-white hover:bg-[#237ca7]',
  outline: 'border border-[#237ca7] text-[#02142c] hover:bg-[#f2f7fb]',
  destructive: 'bg-red-600 text-white hover:bg-red-700'
};

const sizeClasses = {
  default: 'h-10',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-5 text-base'
};

const Button = React.forwardRef(function Button(
  { className = '', variant = 'default', size = 'default', ...props },
  ref
) {
  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size] || sizeClasses.default,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return <button ref={ref} className={classes} {...props} />;
});

export { Button };
