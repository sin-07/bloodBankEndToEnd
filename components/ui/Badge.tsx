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
    badge: 'bg-slate-800 text-slate-300 border border-slate-700/80',
    dot: 'bg-slate-400',
  },
  success: {
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
  },
  warning: {
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
  },
  danger: {
    badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]',
  },
  info: {
    badge: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
  },
  purple: {
    badge: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    dot: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]',
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
