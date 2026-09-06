'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock, Check, Sparkles } from 'lucide-react';
import { gsap } from '@/lib/gsap';

export interface DatePickerProps {
  label?: string;
  error?: string;
  value?: string; // Format: YYYY-MM-DD
  defaultValue?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  min?: string; // Format: YYYY-MM-DD
  max?: string; // Format: YYYY-MM-DD
  name?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      label,
      error,
      value,
      defaultValue,
      onChange,
      min,
      max,
      name,
      required,
      disabled = false,
      placeholder = 'Select preferred donation date',
      className = '',
      id,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>(
      value !== undefined ? value : defaultValue || ''
    );

    // Initial calendar view based on selectedDate or today or min
    const initialDate = selectedDate
      ? new Date(selectedDate)
      : min
      ? new Date(min)
      : new Date();

    const [viewYear, setViewYear] = useState<number>(
      isNaN(initialDate.getTime()) ? new Date().getFullYear() : initialDate.getFullYear()
    );
    const [viewMonth, setViewMonth] = useState<number>(
      isNaN(initialDate.getTime()) ? new Date().getMonth() : initialDate.getMonth()
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const iconBadgeRef = useRef<HTMLDivElement>(null);
    const isAnimatingRef = useRef(false);

    const todayStr = new Date().toISOString().split('T')[0];

    // Sync state if controlled value prop changes
    useEffect(() => {
      if (value !== undefined) {
        setSelectedDate(value);
        if (value) {
          const d = new Date(value);
          if (!isNaN(d.getTime())) {
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
          }
        }
      }
    }, [value]);

    // Format readable display date (e.g., "Sunday, 06 Sep 2026")
    const formatDisplayDate = (dStr: string) => {
      if (!dStr) return '';
      const [y, m, d] = dStr.split('-').map(Number);
      if (!y || !m || !d) return dStr;
      const dateObj = new Date(y, m - 1, d);
      if (isNaN(dateObj.getTime())) return dStr;

      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    // Outside click dismiss
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          if (isOpen) {
            closeCalendar();
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Escape key dismiss
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          closeCalendar();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const openCalendar = () => {
      if (disabled || isAnimatingRef.current) return;
      setIsOpen(true);
      isAnimatingRef.current = true;

      if (iconBadgeRef.current) {
        gsap.to(iconBadgeRef.current, { scale: 1.1, duration: 0.2, ease: 'power2.out' });
      }

      requestAnimationFrame(() => {
        if (calendarRef.current) {
          gsap.fromTo(
            calendarRef.current,
            { opacity: 0, y: -10, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.25,
              ease: 'power2.out',
              onComplete: () => {
                isAnimatingRef.current = false;
              },
            }
          );

          const days = calendarRef.current.querySelectorAll('.gsap-calendar-day');
          if (days.length > 0) {
            gsap.fromTo(
              days,
              { opacity: 0, scale: 0.8 },
              { opacity: 1, scale: 1, duration: 0.2, stagger: 0.008, ease: 'power2.out', delay: 0.03 }
            );
          }
        }
      });
    };

    const closeCalendar = () => {
      if (!calendarRef.current) {
        setIsOpen(false);
        if (iconBadgeRef.current) gsap.to(iconBadgeRef.current, { scale: 1, duration: 0.2 });
        return;
      }

      isAnimatingRef.current = true;
      if (iconBadgeRef.current) gsap.to(iconBadgeRef.current, { scale: 1, duration: 0.2 });

      gsap.to(calendarRef.current, {
        opacity: 0,
        y: -8,
        scale: 0.98,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => {
          setIsOpen(false);
          isAnimatingRef.current = false;
        },
      });
    };

    const toggleCalendar = () => {
      if (isOpen) {
        closeCalendar();
      } else {
        openCalendar();
      }
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      let newMonth = viewMonth - 1;
      let newYear = viewYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      setViewMonth(newMonth);
      setViewYear(newYear);

      if (gridRef.current) {
        gsap.fromTo(gridRef.current, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' });
      }
    };

    const handleNextMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      let newMonth = viewMonth + 1;
      let newYear = viewYear;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      setViewMonth(newMonth);
      setViewYear(newYear);

      if (gridRef.current) {
        gsap.fromTo(gridRef.current, { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' });
      }
    };

    const handleSelectDay = (day: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setSelectedDate(dateStr);
      if (onChange) {
        onChange({ target: { value: dateStr, name } });
      }
      closeCalendar();
    };

    const handleQuickSelect = (dateStr: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedDate(dateStr);
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
      if (onChange) {
        onChange({ target: { value: dateStr, name } });
      }
      closeCalendar();
    };

    // Calculate calendar grid days
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

    // Tomorrow calculation
    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

    return (
      <div className={`w-full relative ${className}`} ref={containerRef} id={id}>
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        {/* Hidden Input for Form Submissions */}
        <input type="hidden" name={name} value={selectedDate} />

        {/* Custom Interactive Trigger Button */}
        <button
          type="button"
          ref={ref as any}
          onClick={toggleCalendar}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className={`w-full text-left px-4 py-3 bg-white rounded-2xl border transition-all duration-200 shadow-xs flex items-center justify-between gap-3 select-none ${
            disabled
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
              : isOpen
              ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-md bg-white'
              : error
              ? 'border-rose-400 bg-rose-50/20 hover:border-rose-500'
              : 'border-slate-300 hover:border-rose-300 hover:bg-slate-50/40'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              ref={iconBadgeRef}
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                selectedDate
                  ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1">
              {selectedDate ? (
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight">
                      {formatDisplayDate(selectedDate)}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Confirmed Date</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    Clinical collection window: 09:00 AM – 05:00 PM
                  </p>
                </div>
              ) : (
                <div>
                  <span className="font-semibold text-xs sm:text-sm text-slate-400">
                    {placeholder}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click to choose an available voluntary donation slot
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-xl border transition-all ${
                isOpen
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {isOpen ? 'Close' : 'Choose'}
            </span>
          </div>
        </button>

        {/* Floating GSAP-Animated Calendar Dialog */}
        {isOpen && (
          <div
            ref={calendarRef}
            role="dialog"
            aria-modal="true"
            className="absolute left-0 right-0 z-50 mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-2xl overflow-hidden"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Calendar Header: Month/Year navigation */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <CalendarIcon className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 font-heading tracking-tight">
                  {MONTH_NAMES[viewMonth]} <span className="text-rose-600">{viewYear}</span>
                </h4>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                  aria-label="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 pt-3 pb-1 text-center">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div ref={gridRef} className="grid grid-cols-7 gap-1 py-1">
              {/* Empty leading slots */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-9 sm:h-10" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === todayStr;
                const isDisabled = Boolean((min && dateStr < min) || (max && dateStr > max));

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={isDisabled}
                    onClick={(e) => handleSelectDay(day, e)}
                    onMouseEnter={(e) => {
                      if (!isDisabled) gsap.to(e.currentTarget, { scale: 1.1, duration: 0.18, ease: 'power2.out' });
                    }}
                    onMouseLeave={(e) => {
                      if (!isDisabled) gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: 'power2.out' });
                    }}
                    className={`gsap-calendar-day h-9 sm:h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all relative ${
                      isDisabled
                        ? 'text-slate-300 opacity-40 cursor-not-allowed bg-slate-50/50'
                        : isSelected
                        ? 'bg-rose-600 text-white font-black shadow-md shadow-rose-600/30 ring-2 ring-rose-500/50'
                        : isToday
                        ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>{day}</span>
                    {isToday && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-rose-500 absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Action Shortcuts Footer */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => handleQuickSelect(todayStr, e)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={(e) => handleQuickSelect(tomorrowStr, e)}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200/80 transition-colors"
                >
                  Tomorrow
                </button>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>Operating Hours: 09:00 – 17:00</span>
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
