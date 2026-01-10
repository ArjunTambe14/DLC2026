import React from 'react';

const Textarea = React.forwardRef(function Textarea({ className = '', ...props }, ref) {
  const classes =
    'min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ' +
    className;

  return <textarea ref={ref} className={classes} {...props} />;
});

export { Textarea };
