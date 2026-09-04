'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Beautiful GSAP blood-drop loader with filling animation.
 * Shows a blood drop that fills up, pulses, and has floating particles.
 *
 * @param text - Optional loading text (default: "Loading...")
 * @param fullScreen - Whether to fill the entire viewport (default: true)
 * @param size - Size variant: 'sm' | 'md' | 'lg' (default: 'md')
 */
interface BloodLoaderProps {
  text?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 60, md: 100, lg: 150 };

export default function BloodLoader({ text = 'Loading...', fullScreen = true, size = 'md' }: BloodLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ── Blood fill wave rises ── */
      gsap.to('.blood-fill-wave', {
        attr: { y: -130 },
        duration: 2,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1,
      });

      /* ── Wave path morph ── */
      gsap.to('.wave-path-1', {
        attr: {
          d: 'M0,8 C30,-4 60,18 90,6 C120,-6 150,16 180,4 L180,60 L0,60Z',
        },
        duration: 1.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      gsap.to('.wave-path-2', {
        attr: {
          d: 'M0,12 C25,0 55,20 85,8 C115,-4 145,18 180,6 L180,60 L0,60Z',
        },
        duration: 1.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.3,
      });

      /* ── Drop gentle pulse ── */
      gsap.to('.loader-drop-outline', {
        scale: 1.03,
        duration: 1.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        transformOrigin: '50% 60%',
      });

      /* ── Floating bubbles inside drop ── */
      gsap.utils.toArray<HTMLElement>('.blood-bubble').forEach((bubble, i) => {
        gsap.to(bubble, {
          y: -20 - i * 8,
          x: `random(-6, 6)`,
          opacity: 0,
          scale: 0.3,
          duration: 1.5 + i * 0.3,
          ease: 'power1.out',
          repeat: -1,
          delay: i * 0.4,
        });
      });

      /* ── Dot loading text animation ── */
      gsap.to('.loader-dots', {
        opacity: 0.3,
        duration: 0.5,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.15, repeat: -1, yoyo: true },
      });

      /* ── Rings pulse ── */
      gsap.fromTo('.pulse-ring', 
        { scale: 0.85, opacity: 0.6 },
        {
          scale: 1.6,
          opacity: 0,
          duration: 1.8,
          ease: 'power2.out',
          repeat: -1,
          stagger: 0.6,
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const s = sizeMap[size];
  const viewBox = '0 0 120 164';

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? 'fixed inset-0 z-[150] bg-white/90 backdrop-blur-sm' : ''
      }`}
    >
      {/* Pulse rings behind drop */}
      <div className="relative" style={{ width: s, height: s * 1.37 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="pulse-ring absolute rounded-full border-2 border-red-300/40" style={{ width: s * 0.9, height: s * 0.9 }} />
          <div className="pulse-ring absolute rounded-full border-2 border-red-200/30" style={{ width: s * 0.9, height: s * 0.9 }} />
        </div>

        <svg
          ref={dropRef}
          viewBox={viewBox}
          width={s}
          height={s * 1.37}
          className="relative z-10"
          style={{ filter: 'drop-shadow(0 8px 24px rgba(220, 38, 38, 0.25))' }}
        >
          <defs>
            {/* Drop clip path */}
            <clipPath id="dropClip">
              <path d="M60 8 C60 8, 10 80, 10 108 C10 136, 32 156, 60 156 C88 156, 110 136, 110 108 C110 80, 60 8, 60 8Z" />
            </clipPath>

            {/* Gradient for fill */}
            <linearGradient id="bloodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>

            {/* Gradient for outline */}
            <linearGradient id="outlineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
          </defs>

          {/* Drop outline */}
          <path
            className="loader-drop-outline"
            d="M60 8 C60 8, 10 80, 10 108 C10 136, 32 156, 60 156 C88 156, 110 136, 110 108 C110 80, 60 8, 60 8Z"
            fill="none"
            stroke="url(#outlineGrad)"
            strokeWidth="2.5"
            opacity="0.5"
          />

          {/* Background of drop (light) */}
          <path
            d="M60 8 C60 8, 10 80, 10 108 C10 136, 32 156, 60 156 C88 156, 110 136, 110 108 C110 80, 60 8, 60 8Z"
            fill="#fee2e2"
          />

          {/* Blood fill — clipped to drop shape */}
          <g clipPath="url(#dropClip)">
            <g className="blood-fill-wave" transform="translate(0, 120)">
              {/* Wave layer 1 */}
              <path
                className="wave-path-1"
                d="M0,10 C30,0 60,18 90,8 C120,0 150,14 180,6 L180,60 L0,60Z"
                fill="#ef4444"
                opacity="0.6"
                transform="translate(-30, 0)"
              />
              {/* Wave layer 2 */}
              <path
                className="wave-path-2"
                d="M0,14 C25,2 55,22 85,10 C115,0 145,16 180,8 L180,60 L0,60Z"
                fill="url(#bloodGrad)"
                transform="translate(-30, 0)"
              />
              {/* Solid fill below waves */}
              <rect x="-30" y="20" width="240" height="150" fill="url(#bloodGrad)" />
            </g>
          </g>

          {/* Shine / highlight on drop */}
          <ellipse cx="42" cy="80" rx="10" ry="20" fill="white" opacity="0.15" transform="rotate(-15 42 80)" />
          <ellipse cx="38" cy="68" rx="4" ry="6" fill="white" opacity="0.2" transform="rotate(-15 38 68)" />

          {/* Floating bubbles */}
          <circle className="blood-bubble" cx="45" cy="130" r="3" fill="white" opacity="0.35" />
          <circle className="blood-bubble" cx="65" cy="135" r="2.5" fill="white" opacity="0.3" />
          <circle className="blood-bubble" cx="75" cy="128" r="2" fill="white" opacity="0.25" />
          <circle className="blood-bubble" cx="55" cy="140" r="1.8" fill="white" opacity="0.3" />
        </svg>
      </div>

      {/* Loading text */}
      <div className="flex items-center gap-0.5">
        <span className="text-sm font-medium text-gray-500 tracking-wide">{text}</span>
        <span className="flex gap-0.5 ml-0.5">
          <span className="loader-dots inline-block w-1 h-1 rounded-full bg-red-400" />
          <span className="loader-dots inline-block w-1 h-1 rounded-full bg-red-400" />
          <span className="loader-dots inline-block w-1 h-1 rounded-full bg-red-400" />
        </span>
      </div>
    </div>
  );
}
