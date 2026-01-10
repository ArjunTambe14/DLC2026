// Purpose: Tabs component for grouping admin sections.
import React from 'react';

const TabsContext = React.createContext(null);

function Tabs({ defaultValue, value: controlledValue, onValueChange, className = '', children }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const value = controlledValue ?? internalValue;

  const setValue = (next) => {
    if (controlledValue == null) {
      setInternalValue(next);
    }
    if (onValueChange) {
      onValueChange(next);
    }
  };

  // Render the UI for this view.
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className = '', ...props }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl p-1 ${className}`} {...props} />
  );
}

function TabsTrigger({ value, className = '', children, ...props }) {
  const context = React.useContext(TabsContext);
  const active = context?.value === value;

  return (
    <button
      type="button"
      onClick={() => context?.setValue(value)}
      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, className = '', children, ...props }) {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
