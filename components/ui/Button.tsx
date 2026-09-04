'use client';

import React from 'react';
import { createRipple } from '@/lib/gsap';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  ripple?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  ripple = true,
  icon,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed select-none overflow-hidden active:scale-[0.98]';

  const variants = {
    primary:
      'bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-900/40 hover:shadow-rose-700/50 border border-rose-500/30 focus:ring-rose-500',
    glow:
      'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-glow-md hover:shadow-glow-lg border border-rose-400/40 focus:ring-rose-500 animate-pulse-glow',
    secondary:
      'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700/60 hover:border-slate-600 shadow-sm focus:ring-slate-500',
    danger:
      'bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-950/50 border border-red-600/40 focus:ring-red-600',
    outline:
      'border-2 border-rose-600/80 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500 focus:ring-rose-500',
    ghost:
      'text-slate-300 hover:text-white hover:bg-slate-800/60 focus:ring-slate-400',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs font-semibold gap-1.5',
    md: 'px-5 py-2.5 text-sm font-semibold gap-2',
    lg: 'px-7 py-3.5 text-base font-bold gap-2.5',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !disabled && !loading) {
      createRipple(e);
    }
    if (onClick) onClick(e);
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
