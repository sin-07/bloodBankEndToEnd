import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export default function Alert({
  type,
  title,
  message,
  onClose,
  className = '',
}: AlertProps) {
  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    error: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    info: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 border rounded-2xl backdrop-blur-md transition-all ${styles[type]} ${className}`}
    >
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1 text-xs">
        {title && <h4 className="font-bold text-sm text-white mb-0.5">{title}</h4>}
        <p className="leading-relaxed opacity-90">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
