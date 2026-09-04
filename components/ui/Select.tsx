'use client';

import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-2.5 bg-slate-900/90 text-white rounded-xl border transition-all duration-200 text-sm shadow-inner
            focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500
            disabled:bg-slate-800/50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${
              error
                ? 'border-rose-500/80 focus:ring-rose-500/40 bg-rose-950/20'
                : 'border-slate-700/80 hover:border-slate-600 focus:bg-slate-900'
            }
            ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-slate-900 text-slate-500">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs font-medium text-rose-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
