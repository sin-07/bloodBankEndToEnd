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
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
  animateNumber?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  color = 'red',
  animateNumber = true,
}: StatsCardProps) {
  const numberRef = useRef<HTMLParagraphElement>(null);
  const [displayValue, setDisplayValue] = useState<string | number>(value);

  const colors = {
    red: {
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',
      gradient: 'from-rose-500/20 to-red-600/10',
    },
    blue: {
      bg: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
      glow: 'shadow-[0_0_20px_rgba(56,189,248,0.3)]',
      gradient: 'from-sky-500/20 to-blue-600/10',
    },
    green: {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]',
      gradient: 'from-emerald-500/20 to-teal-600/10',
    },
    yellow: {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]',
      gradient: 'from-amber-500/20 to-orange-600/10',
    },
    purple: {
      bg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
      glow: 'shadow-[0_0_20px_rgba(192,132,252,0.3)]',
      gradient: 'from-purple-500/20 to-indigo-600/10',
    },
    orange: {
      bg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
      glow: 'shadow-[0_0_20px_rgba(251,146,60,0.3)]',
      gradient: 'from-orange-500/20 to-amber-600/10',
    },
  };

  const changeStyles = {
    positive: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    negative: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    neutral: 'bg-slate-700/50 text-slate-300 border border-slate-600/40',
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

  return (
    <div className="relative group overflow-hidden rounded-2xl glass-card-elevated p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-600/80">
      {/* Background ambient accent */}
      <div
        className={`absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-gradient-to-br ${activeColor.gradient} blur-2xl pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity`}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            {title}
          </p>
          <p
            ref={numberRef}
            className="text-3xl font-extrabold text-white mt-1.5 tracking-tight font-heading tabular-nums"
          >
            {displayValue}
          </p>

          {change && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${changeStyles[changeType]}`}
              >
                {changeType === 'positive' && <TrendingUp className="w-3 h-3" />}
                {changeType === 'negative' && <TrendingDown className="w-3 h-3" />}
                {changeType === 'neutral' && <Minus className="w-3 h-3" />}
                {change}
              </span>
              <span className="text-[11px] text-slate-400">vs last month</span>
            </div>
          )}
        </div>

        <div
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 ${activeColor.bg} ${activeColor.glow}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
