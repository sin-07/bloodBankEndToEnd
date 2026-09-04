'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Custom cursor with blood-drop trailing effect.
 * Only renders on non-touch devices (width >= 1024).
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);
  const [visible, setVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const trails = trailRefs.current;
    if (!dot || !ring) return;

    let mx = 0, my = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) setVisible(true);

      // Dot follows instantly
      gsap.to(dot, { x: mx, y: my, duration: 0.1, ease: 'power2.out', overwrite: 'auto' });
      // Ring follows with lag
      gsap.to(ring, { x: mx, y: my, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
      // Trail particles
      trails.forEach((t, i) => {
        gsap.to(t, {
          x: mx + (Math.random() - 0.5) * 20,
          y: my + (Math.random() - 0.5) * 20,
          opacity: 0.6,
          scale: 1,
          duration: 0.15 + i * 0.06,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        gsap.to(t, {
          opacity: 0, scale: 0.2, duration: 0.5, delay: 0.1 + i * 0.04, ease: 'power2.in', overwrite: false,
        });
      });
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    // Scale cursor on interactive elements
    const onOver = () => gsap.to(ring, { scale: 1.8, borderColor: 'rgba(220,38,38,0.4)', duration: 0.3 });
    const onOut = () => gsap.to(ring, { scale: 1, borderColor: 'rgba(220,38,38,0.3)', duration: 0.3 });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    // Attach hover listeners to interactive elements
    const interactives = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onOver);
      el.addEventListener('mouseleave', onOut);
    });

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', onOver);
        el.removeEventListener('mouseleave', onOut);
      });
    };
  }, [isDesktop, visible]);

  if (!isDesktop) return null;

  return (
    <div className={`cursor-container ${visible ? 'opacity-100' : 'opacity-0'}`} style={{ transition: 'opacity 0.2s' }}>
      {/* Trail particles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          ref={el => { if (el) trailRefs.current[i] = el; }}
          className="cursor-trail"
        />
      ))}
      {/* Outer ring */}
      <div ref={ringRef} className="cursor-ring" />
      {/* Center dot */}
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
