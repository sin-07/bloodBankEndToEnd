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
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-2.5 bg-white text-slate-900 rounded-xl border transition-all duration-200 text-sm shadow-sm
            focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500
            disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
            ${
              error
                ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50/30'
                : 'border-slate-300 hover:border-slate-400 focus:bg-white'
            }
            ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-white text-slate-400">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
