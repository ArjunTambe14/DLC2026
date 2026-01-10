// Purpose: Reusable select styling.
import React from 'react';

const SelectItem = ({ value, children }) => {
  // Render the UI for this view.
  return (
    <option value={value}>
      {children}
    </option>
  );
};

const SelectTrigger = ({ children }) => <>{children}</>;
const SelectValue = ({ children }) => <>{children}</>;
const SelectContent = ({ children }) => <>{children}</>;

const collectItems = (children, items = []) => {
  React.Children.forEach(children, (child) => {
    if (!child) return;
    if (child.type === SelectItem) {
      items.push({ value: child.props.value, label: child.props.children });
      return;
    }
    if (child.props && child.props.children) {
      collectItems(child.props.children, items);
    }
  });
  return items;
};

function Select({ value, onValueChange, className = '', children }) {
  const items = collectItems(children);

  return (
    <select
      value={value}
      onChange={(event) => onValueChange && onValueChange(event.target.value)}
      className={`h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${className}`}
    >
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
