'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Page transition with GSAP wipe overlay.
 * A red overlay wipes across the screen on route change.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const prevPath = useRef(pathname);
  const [mounted, setMounted] = useState(false);

  /* First mount — no transition, just reveal */
  useEffect(() => { setMounted(true); }, []);

  /* Route change — play wipe */
  useEffect(() => {
    if (!mounted) return;
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    const ol = overlayRef.current;
    if (!ol) return;

    const tl = gsap.timeline();
    tl.set(ol, { display: 'block', scaleY: 0, transformOrigin: 'top' })
      .to(ol, { scaleY: 1, duration: 0.35, ease: 'power4.inOut' })
      .to(ol, { scaleY: 0, transformOrigin: 'bottom', duration: 0.35, ease: 'power4.inOut', delay: 0.05 })
      .set(ol, { display: 'none' });
  }, [pathname, mounted]);

  return (
    <>
      {/* Wipe overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[200] bg-gradient-to-b from-red-600 to-red-700 pointer-events-none"
        style={{ display: 'none', willChange: 'transform' }}
      />
      {children}
    </>
  );
}
