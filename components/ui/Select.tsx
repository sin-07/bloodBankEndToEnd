'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { gsap } from '@/lib/gsap';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: any) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder = 'Select an option',
      value,
      defaultValue,
      onChange,
      name,
      required,
      disabled = false,
      className = '',
      id,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedVal, setSelectedVal] = useState<string>(
      value !== undefined ? String(value) : defaultValue !== undefined ? String(defaultValue) : ''
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const chevronRef = useRef<SVGSVGElement>(null);
    const isAnimatingRef = useRef(false);

    // Sync state if controlled value prop changes
    useEffect(() => {
      if (value !== undefined) {
        setSelectedVal(String(value));
      }
    }, [value]);

    const currentOption = options.find((o) => String(o.value) === String(selectedVal));

    // Handle outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          if (isOpen) {
            closeMenu();
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          closeMenu();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const openMenu = () => {
      if (disabled || isAnimatingRef.current) return;
      setIsOpen(true);
      isAnimatingRef.current = true;

      // Animate Chevron rotation with GSAP
      if (chevronRef.current) {
        gsap.to(chevronRef.current, { rotate: 180, duration: 0.25, ease: 'power2.out' });
      }

      // Next tick animation for floating menu entrance
      requestAnimationFrame(() => {
        if (menuRef.current) {
          gsap.fromTo(
            menuRef.current,
            { opacity: 0, y: -8, scale: 0.97 },
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

          const items = menuRef.current.querySelectorAll('.gsap-dropdown-item');
          if (items.length > 0) {
            gsap.fromTo(
              items,
              { opacity: 0, x: -6 },
              { opacity: 1, x: 0, duration: 0.2, stagger: 0.035, ease: 'power2.out', delay: 0.03 }
            );
          }
        }
      });
    };

    const closeMenu = () => {
      if (!menuRef.current) {
        setIsOpen(false);
        if (chevronRef.current) gsap.to(chevronRef.current, { rotate: 0, duration: 0.2, ease: 'power2.out' });
        return;
      }

      isAnimatingRef.current = true;
      if (chevronRef.current) {
        gsap.to(chevronRef.current, { rotate: 0, duration: 0.2, ease: 'power2.out' });
      }

      gsap.to(menuRef.current, {
        opacity: 0,
        y: -6,
        scale: 0.98,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => {
          setIsOpen(false);
          isAnimatingRef.current = false;
        },
      });
    };

    const toggleMenu = () => {
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    const handleSelect = (opt: SelectOption, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedVal(opt.value);
      if (onChange) {
        onChange({ target: { value: opt.value, name } });
      }
      closeMenu();
    };

    const handleItemHover = (e: React.MouseEvent<HTMLButtonElement>) => {
      gsap.to(e.currentTarget, { x: 3, duration: 0.2, ease: 'power2.out' });
    };

    const handleItemLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      gsap.to(e.currentTarget, { x: 0, duration: 0.2, ease: 'power2.out' });
    };

    return (
      <div className={`w-full relative ${className}`} ref={containerRef} id={id}>
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        {/* Hidden Input for Form Submissions */}
        <input type="hidden" name={name} value={selectedVal} />

        {/* Custom Trigger Button */}
        <button
          type="button"
          ref={ref as any}
          onClick={toggleMenu}
          disabled={disabled}
          aria-haspopup="listbox"
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
            {currentOption?.icon && (
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                {currentOption.icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {currentOption ? currentOption.label : placeholder}
                </span>
                {currentOption?.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      currentOption.badgeColor || 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {currentOption.badge}
                  </span>
                )}
              </div>
              {currentOption?.subtitle && (
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {currentOption.subtitle}
                </p>
              )}
            </div>
          </div>

          <ChevronDown
            ref={chevronRef}
            className={`w-4 h-4 shrink-0 transition-colors ${
              isOpen ? 'text-rose-600' : 'text-slate-400'
            }`}
          />
        </button>

        {/* Floating GSAP-Animated Dropdown Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            role="listbox"
            className="absolute left-0 right-0 z-50 mt-2 bg-gradient-to-b from-rose-50/70 via-white/95 to-white/95 backdrop-blur-xl border border-rose-100/90 rounded-2xl p-2 shadow-2xl overflow-hidden max-h-72 overflow-y-auto"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Ambient reddish subtle glow */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-rose-500/[0.08] rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-1 relative z-10">
              {options.map((opt) => {
                const isSelected = String(opt.value) === String(selectedVal);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={(e) => handleSelect(opt, e)}
                    onMouseEnter={handleItemHover}
                    onMouseLeave={handleItemLeave}
                    className={`gsap-dropdown-item w-full text-left p-2.5 sm:p-3 rounded-xl transition-colors duration-150 flex items-center justify-between gap-3 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-rose-50/80 border border-rose-200/80 text-rose-950 shadow-xs'
                        : 'hover:bg-slate-100/70 border border-transparent text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {opt.icon && (
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-white border-rose-200 text-rose-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          {opt.icon}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-900">
                            {opt.label}
                          </span>
                          {opt.badge && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                opt.badgeColor || 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {opt.subtitle && (
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {opt.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {isSelected && <Check className="w-4 h-4 text-rose-600 stroke-[2.5]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
