import React from 'react';

interface BadgeProps {
  text?: string;
  children?: React.ReactNode;
  color?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<string, { badge: string; dot: string }> = {
  default: {
    badge: 'bg-slate-100 text-slate-700 border border-slate-200',
    dot: 'bg-slate-400',
  },
  success: {
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold',
    dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
  },
  warning: {
    badge: 'bg-amber-50 text-amber-700 border border-amber-200/80 font-semibold',
    dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
  },
  danger: {
    badge: 'bg-rose-50 text-rose-700 border border-rose-200/80 font-semibold',
    dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
  },
  info: {
    badge: 'bg-sky-50 text-sky-700 border border-sky-200/80 font-semibold',
    dot: 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]',
  },
  purple: {
    badge: 'bg-purple-50 text-purple-700 border border-purple-200/80 font-semibold',
    dot: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
  },
};

export default function Badge({
  text,
  children,
  color,
  variant = 'default',
  dot = false,
  pulse = false,
  className = '',
}: BadgeProps) {
  const current = variantStyles[variant] || variantStyles.default;
  const colorClass = color || current.badge;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md ${colorClass} ${className}`}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.dot}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`} />
        </span>
      )}
      {children || text}
    </span>
  );
}
