'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { gsap } from '@/lib/gsap';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  changePeriod?: string;
  subtext?: string;
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
  animateNumber?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  changePeriod,
  subtext,
  color = 'red',
  animateNumber = true,
}: StatsCardProps) {
  const numberRef = useRef<HTMLParagraphElement>(null);
  const [displayValue, setDisplayValue] = useState<string | number>(value);

  const colors = {
    red: {
      bg: 'bg-rose-50 border-rose-200/80 text-rose-600',
      glow: 'shadow-sm',
      gradient: 'from-rose-500/10 to-red-600/5',
    },
    blue: {
      bg: 'bg-sky-50 border-sky-200/80 text-sky-600',
      glow: 'shadow-sm',
      gradient: 'from-sky-500/10 to-blue-600/5',
    },
    green: {
      bg: 'bg-emerald-50 border-emerald-200/80 text-emerald-600',
      glow: 'shadow-sm',
      gradient: 'from-emerald-500/10 to-teal-600/5',
    },
    yellow: {
      bg: 'bg-amber-50 border-amber-200/80 text-amber-600',
      glow: 'shadow-sm',
      gradient: 'from-amber-500/10 to-orange-600/5',
    },
    purple: {
      bg: 'bg-purple-50 border-purple-200/80 text-purple-600',
      glow: 'shadow-sm',
      gradient: 'from-purple-500/10 to-indigo-600/5',
    },
    orange: {
      bg: 'bg-orange-50 border-orange-200/80 text-orange-600',
      glow: 'shadow-sm',
      gradient: 'from-orange-500/10 to-amber-600/5',
    },
  };

  const changeStyles = {
    positive: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    negative: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  useEffect(() => {
    if (typeof value === 'number' && animateNumber) {
      const target = value;
      const o = { val: 0 };
      const tween = gsap.to(o, {
        val: target,
        duration: 1.4,
        ease: 'power3.out',
        onUpdate: () => {
          setDisplayValue(Math.floor(o.val));
        },
      });
      return () => {
        tween.kill();
      };
    } else {
      setDisplayValue(value);
    }
  }, [value, animateNumber]);

  const activeColor = colors[color] || colors.red;

  const getValueSizeClass = (val: string | number) => {
    if (typeof val === 'number') return 'text-3xl';
    const len = String(val).length;
    if (len <= 4) return 'text-3xl';
    if (len <= 9) return 'text-2xl sm:text-[1.6rem]';
    return 'text-xl sm:text-2xl';
  };

  return (
    <div className="h-full min-h-[176px] flex flex-col justify-between relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-rose-50/50 via-white to-white border border-rose-100/90 p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-rose-300/80">
      {/* Background ambient accent */}
      <div
        className={`absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-gradient-to-br ${activeColor.gradient} blur-2xl pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity`}
      />
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-gradient-to-br from-rose-500/[0.08] via-red-500/[0.03] to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Row: Title, Value & Icon */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 truncate">
            {title}
          </p>
          <div className="mt-1.5 h-9 flex items-center overflow-hidden">
            <p
              ref={numberRef}
              className={`font-extrabold text-slate-900 tracking-tight font-heading tabular-nums truncate whitespace-nowrap leading-none ${getValueSizeClass(
                displayValue
              )}`}
              title={String(displayValue)}
            >
              {displayValue}
            </p>
          </div>
        </div>

        <div
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 ${activeColor.bg} ${activeColor.glow}`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* Bottom Section: Trend/Status Badge & Explanatory Subtext pinned to baseline */}
      <div className="relative z-10 mt-4 pt-1 flex flex-col justify-end space-y-1.5">
        <div className="h-6 flex items-center">
          {change && (
            <div className="flex items-center gap-1.5 flex-wrap overflow-hidden">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${changeStyles[changeType]}`}
              >
                {changeType === 'positive' && <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />}
                {changeType === 'negative' && <TrendingDown className="w-3 h-3 text-rose-600 shrink-0" />}
                {changeType === 'neutral' && <Minus className="w-3 h-3 text-slate-500 shrink-0" />}
                <span className="truncate">{change}</span>
              </span>
              {changePeriod && (
                <span className="text-[11px] text-slate-400 whitespace-nowrap truncate">{changePeriod}</span>
              )}
            </div>
          )}
        </div>

        <div className="h-4 flex items-center">
          {subtext && (
            <p className="text-[11px] text-slate-500 leading-none truncate whitespace-nowrap" title={subtext}>
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
