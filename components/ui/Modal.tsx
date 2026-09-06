'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        />

        {/* Modal Panel */}
        <div
          className={`relative inline-block align-bottom bg-gradient-to-b from-rose-50/70 via-white to-white border border-rose-100/90 rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full ${sizes[size]} z-50 animate-in zoom-in-95 duration-200`}
        >
          {/* Subtle ambient reddish glows */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-rose-500/12 via-red-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-gradient-to-tr from-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          {title && (
            <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100/90 bg-white/70 backdrop-blur-md">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight font-heading">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="relative z-10 px-4 sm:px-6 py-5 max-h-[80vh] overflow-y-auto text-slate-700">{children}</div>
        </div>
      </div>
    </div>
  );
}
