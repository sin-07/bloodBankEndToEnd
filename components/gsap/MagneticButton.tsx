'use client';

import { useRef, ReactNode } from 'react';
import { useMagnetic, createRipple } from '@/lib/gsap';

interface Props {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: 'div' | 'button';
  onClick?: () => void;
}

/**
 * Wraps children with magnetic hover + click ripple.
 * Uses GSAP for silky-smooth magnetic pull.
 */
export default function MagneticButton({
  children,
  className = '',
  strength = 0.35,
  as: Tag = 'div',
  onClick,
}: Props) {
  const magnetRef = useMagnetic(strength);

  return (
    <div
      ref={magnetRef}
      className={`inline-block ${className}`}
      onClick={(e) => {
        createRipple(e);
        onClick?.();
      }}
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  );
}
