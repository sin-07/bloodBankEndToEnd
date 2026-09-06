'use client';

import React, { useEffect } from 'react';
import { LogOut, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  isLoggingOut: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirmModal({
  isOpen,
  isLoggingOut,
  onConfirm,
  onCancel,
}: LogoutConfirmModalProps) {
  // Close on Escape key when not actively logging out
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoggingOut) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoggingOut, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={!isLoggingOut ? onCancel : undefined}
        />

        {/* Modal Dialog */}
        <div className="relative inline-block align-bottom bg-gradient-to-b from-rose-50/80 via-white to-white border border-rose-100/90 rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full max-w-sm p-6 sm:p-7 z-50 animate-in zoom-in-95 duration-200">
          {/* Subtle Ambient Reddish Glow Orbs */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-gradient-to-br from-rose-500/15 via-red-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-gradient-to-tr from-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {!isLoggingOut ? (
            <div className="relative z-10">
              {/* Close button */}
              <button
                type="button"
                onClick={onCancel}
                className="absolute top-0 right-0 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-rose-50/60 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-rose-50/90 border border-rose-200/80 flex items-center justify-center text-rose-600 mx-auto mb-4 shadow-sm shadow-rose-500/10">
                <LogOut className="w-6 h-6" />
              </div>

              {/* Text content */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 font-heading tracking-tight">
                  Confirm Sign Out
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Are you sure you want to end your current session? You will need to sign in again to access your clinical dashboard.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs border border-slate-200/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Yes, Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Circle Loader While Logging Out */
            <div className="relative z-10 py-6 flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in duration-200">
              <div className="relative w-14 h-14 flex items-center justify-center">
                {/* Circular spinner background track */}
                <div className="absolute inset-0 rounded-full border-4 border-rose-100" />
                {/* Animated circular spinning ring */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-rose-600 border-r-rose-600 animate-spin" />
                {/* Center icon */}
                <LogOut className="w-5 h-5 text-rose-600 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Signing Out...
                </h3>
                <p className="text-xs text-slate-500">
                  Safely clearing credentials and ending session
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
