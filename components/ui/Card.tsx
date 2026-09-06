import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
  glass?: boolean;
  glow?: boolean;
  hoverLift?: boolean;
}

export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  noPadding = false,
  glass = false,
  glow = false,
  hoverLift = true,
}: CardProps) {
  const baseCard = glass
    ? 'glass-panel text-slate-800 shadow-sm'
    : 'bg-gradient-to-b from-rose-50/50 via-white to-white border border-rose-100/90 text-slate-800 shadow-xs';

  const hoverStyle = hoverLift
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-rose-300/80'
    : '';

  const glowStyle = glow ? 'glow-border' : '';

  return (
    <div
      className={`relative rounded-2xl sm:rounded-3xl overflow-hidden ${baseCard} ${hoverStyle} ${glowStyle} ${className}`}
    >
      {/* Subtle Ambient Reddish Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-rose-500/[0.08] via-red-500/[0.03] to-transparent rounded-full blur-2xl pointer-events-none" />

      {(title || action) && (
        <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-rose-100/70 bg-white/60 backdrop-blur-xs">
          <div>
            {title && (
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 font-heading">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`relative z-10 ${noPadding ? '' : 'p-4 sm:p-6'}`}>{children}</div>
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-4 sm:px-6 py-4 border-b border-rose-100/70 bg-white/60 backdrop-blur-xs ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-base font-bold tracking-tight text-slate-900 font-heading ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export default Card;
