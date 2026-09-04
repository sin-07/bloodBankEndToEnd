'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-xl">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full ${icon ? 'pl-10' : 'px-4'} py-2.5 bg-slate-900/90 text-white rounded-xl border transition-all duration-200 placeholder-slate-500 text-sm shadow-inner
              focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500
              disabled:bg-slate-800/50 disabled:text-slate-500 disabled:cursor-not-allowed
              ${
                error
                  ? 'border-rose-500/80 focus:ring-rose-500/40 bg-rose-950/20'
                  : 'border-slate-700/80 hover:border-slate-600 focus:bg-slate-900'
              }
              ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-rose-400">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
