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
  glass = true,
  glow = false,
  hoverLift = true,
}: CardProps) {
  const baseCard = glass
    ? 'glass-card-elevated text-slate-100'
    : 'bg-slate-900 border border-slate-800 text-slate-100 shadow-xl';

  const hoverStyle = hoverLift
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-slate-700/80'
    : '';

  const glowStyle = glow ? 'glow-border' : '';

  return (
    <div
      className={`rounded-2xl overflow-hidden ${baseCard} ${hoverStyle} ${glowStyle} ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.07] bg-white/[0.02]">
          <div>
            {title && (
              <h3 className="text-base font-bold tracking-tight text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
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
    <div className={`px-6 py-4.5 border-b border-white/[0.07] bg-white/[0.02] ${className}`}>
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
    <h3 className={`text-base font-bold tracking-tight text-white ${className}`}>
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
