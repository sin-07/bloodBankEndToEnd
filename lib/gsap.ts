'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useCallback, useEffect } from 'react';

/* ═══════════════════ Register Plugins ═══════════════════ */
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

/* ═══════════════════ Text Split Utility ═══════════════════ */

/** Split element text into <span> per character for stagger animations */
export function splitText(element: HTMLElement): HTMLSpanElement[] {
  const text = element.textContent || '';
  element.textContent = '';
  element.setAttribute('aria-label', text);
  const chars: HTMLSpanElement[] = [];
  for (const char of text) {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    span.style.willChange = 'transform, opacity';
    span.setAttribute('aria-hidden', 'true');
    element.appendChild(span);
    chars.push(span);
  }
  return chars;
}

/** Create a staggered text-reveal timeline */
export function createTextReveal(
  chars: HTMLSpanElement[],
  opts: { duration?: number; stagger?: number; y?: number; ease?: string } = {},
) {
  const { duration = 0.5, stagger = 0.025, y = 50, ease = 'power4.out' } = opts;
  return gsap.timeline().from(chars, {
    opacity: 0, y, rotateX: -30, stagger, duration, ease,
  });
}

/* ═══════════════════ Masked Reveal ═══════════════════ */

export function createMaskedReveal(
  el: HTMLElement,
  dir: 'up' | 'down' | 'left' | 'right' = 'up',
  duration = 1,
) {
  const map: Record<string, { from: string; to: string }> = {
    up:    { from: 'inset(100% 0 0 0)',  to: 'inset(0 0 0 0)' },
    down:  { from: 'inset(0 0 100% 0)',  to: 'inset(0 0 0 0)' },
    left:  { from: 'inset(0 100% 0 0)',  to: 'inset(0 0 0 0)' },
    right: { from: 'inset(0 0 0 100%)',  to: 'inset(0 0 0 0)' },
  };
  gsap.set(el, { clipPath: map[dir].from });
  return gsap.to(el, { clipPath: map[dir].to, duration, ease: 'power4.inOut' });
}

/* ═══════════════════ Counter ═══════════════════ */

export function animateCounter(
  el: HTMLElement, target: number,
  opts: { duration?: number; suffix?: string; ease?: string } = {},
) {
  const { duration = 2, suffix = '', ease = 'power2.out' } = opts;
  const o = { v: 0 };
  return gsap.to(o, {
    v: target, duration, ease,
    onUpdate: () => { el.textContent = Math.floor(o.v) + suffix; },
  });
}

/* ═══════════════════ Hook: Magnetic ═══════════════════ */

export function useMagnetic(strength = 0.35) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power3.out' });
  }, [strength]);

  const onLeave = useCallback(() => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.3)' });
  }, []);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [onMove, onLeave]);

  return ref;
}

/* ═══════════════════ Hook: 3-D Tilt ═══════════════════ */

export function useTilt(max = 8) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const rotY = ((e.clientX - r.left) / r.width - 0.5) * max;
    const rotX = ((e.clientY - r.top) / r.height - 0.5) * -max;
    gsap.to(el, { rotateY: rotY, rotateX: rotX, scale: 1.03, duration: 0.35, ease: 'power2.out', transformPerspective: 800 });
  }, [max]);

  const onLeave = useCallback(() => {
    if (!ref.current) return;
    gsap.to(ref.current, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1,0.5)', transformPerspective: 800 });
  }, []);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [onMove, onLeave]);

  return ref;
}

/* ═══════════════════ Hook: Mouse Parallax ═══════════════════ */

export function useMouseParallax() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const layers = c.querySelectorAll<HTMLElement>('[data-speed]');

    const onMove = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      const nx = (e.clientX - r.left - r.width / 2) / r.width;
      const ny = (e.clientY - r.top - r.height / 2) / r.height;
      layers.forEach(l => {
        const s = parseFloat(l.dataset.speed || '0');
        gsap.to(l, { x: nx * s, y: ny * s, duration: 0.9, ease: 'power2.out' });
      });
    };

    c.addEventListener('mousemove', onMove);
    return () => c.removeEventListener('mousemove', onMove);
  }, []);

  return ref;
}

/* ═══════════════════ Ripple Effect ═══════════════════ */

export function createRipple(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(r.width, r.height) * 2;

  Object.assign(ripple.style, {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    left: `${e.clientX - r.left - size / 2}px`,
    top: `${e.clientY - r.top - size / 2}px`,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    pointerEvents: 'none',
    transform: 'scale(0)',
    zIndex: '10',
  });

  el.style.position = 'relative';
  el.style.overflow = 'hidden';
  el.appendChild(ripple);

  gsap.to(ripple, {
    scale: 1, opacity: 0, duration: 0.7, ease: 'power2.out',
    onComplete: () => ripple.remove(),
  });
}
