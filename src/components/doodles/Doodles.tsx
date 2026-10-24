import type { SVGProps } from 'react'

/**
 * Doodles desenhados "à mão": traços com pontas arredondadas e pequenas
 * irregularidades de propósito. Use com moderação.
 */
type P = SVGProps<SVGSVGElement> & { size?: number }

const base = (size: number, props: P) => ({
  width: size,
  height: size,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export const Cherry = ({ size = 40, ...p }: P) => (
  <svg viewBox="0 0 48 48" {...base(size, p)}>
    <path d="M16.5 30.5c-.4-7 4-15.6 12.2-21.8M33.8 31.2c-1.6-7.5-3.4-15.4-5-22.4" stroke="#5f5f37" />
    <path d="M28.6 8.9c3.6-3.5 9.2-3.9 12.6-1.1-3.4 3.6-8.8 4.3-12.6 1.1z" fill="#7A7A4A" stroke="#5f5f37" />
    <path d="M9.4 34.6c.2-4.6 4-7.6 8-7.2 4.3.5 6.7 4.4 6 8.4-.7 4-4.5 6.6-8.4 6.1-3.6-.4-5.8-3.6-5.6-7.3z" fill="#961415" stroke="#520215" />
    <path d="M25.6 35.4c.4-4.4 4.2-7.2 8.1-6.6 4 .6 6.4 4.4 5.6 8.2-.8 3.9-4.6 6.3-8.2 5.6-3.5-.6-5.8-3.6-5.5-7.2z" fill="#961415" stroke="#520215" />
    <path d="M13.2 32.4c.6-1.2 1.6-1.9 2.7-2.1M29.6 33c.6-1.1 1.5-1.8 2.6-2" stroke="#EFAFB3" strokeWidth="1.8" />
  </svg>
)

export const Flower = ({ size = 36, ...p }: P) => (
  <svg viewBox="0 0 48 48" {...base(size, p)}>
    {[0, 72, 144, 216, 288].map((r) => (
      <path
        key={r}
        d="M24 22c-4.6-2.4-6.4-8.6-3.4-12.4 1.8-2.2 5-2.2 6.8 0 3 3.8 1.2 10-3.4 12.4z"
        transform={`rotate(${r} 24 24)`}
        fill="#EFAFB3"
        stroke="#961415"
      />
    ))}
    <circle cx="24" cy="24" r="3.6" fill="#961415" stroke="#520215" />
  </svg>
)

export const Heart = ({ size = 28, ...p }: P) => (
  <svg viewBox="0 0 48 48" {...base(size, p)}>
    <path d="M24.4 40.2C15 33.6 7.6 27 7.8 18.4c.2-5.4 4.4-9 9-8.6 3.4.3 5.8 2.6 7.4 5.6 1.8-3.2 4.4-5.6 8-5.6 4.8 0 8.4 4 8 9.2-.6 8.4-7.6 14.6-15.8 21.2z" />
  </svg>
)

export const Star = ({ size = 24, ...p }: P) => (
  <svg viewBox="0 0 48 48" {...base(size, p)}>
    <path d="M24 6.5l4.8 11.2 12 .9-9.2 7.8 3 11.8L24.2 32l-10.6 6.4 3.1-11.9-9.1-7.7 12.1-1z" />
  </svg>
)

export const Sparkle = ({ size = 20, ...p }: P) => (
  <svg viewBox="0 0 48 48" {...base(size, p)}>
    <path d="M24 4c1.2 9.8 4.6 16.6 18 20-13.2 3-16.6 10-18 20-1.6-10.2-5-17-18-20 12.8-3.4 16.6-10.2 18-20z" />
  </svg>
)

export const Cup = ({ size = 36, ...p }: P) => (
  <svg viewBox="0 0 48 48" {...base(size, p)}>
    <path d="M9.6 18.4h24.6c.2 9.6-2.4 19.8-12.4 20-9.6.2-12.2-10.2-12.2-20z" fill="#FBF5EE" />
    <path d="M34 22.4c5-.8 7.6 1.6 6.8 4.8-.8 3.4-4.4 4.6-7.8 4.2" />
    <path d="M17 6.8c-1.6 2 1.4 3.6 0 6M23.4 5.2c-1.8 2.4 1.6 4.2 0 7.4M29.4 7.2c-1.4 1.8 1.2 3.4 0 5.6" strokeWidth="1.8" />
    <path d="M19 28.6c.8-1.6 2.6-1.8 3-.4.4-1.4 2.2-1.2 2.8.4.4 1.6-2.8 3.4-2.8 3.4s-3.4-1.6-3-3.4z" fill="#961415" stroke="#961415" strokeWidth="1.2" />
  </svg>
)

export const BookDoodle = ({ size = 36, ...p }: P) => (
  <svg viewBox="0 0 48 48" {...base(size, p)}>
    <path d="M24 13.2c-4.6-3.4-11-4-16.4-2.6l.4 25c5.6-1.2 11.6-.4 16 2.8 4.4-3.2 10.4-4 16-2.8l.4-25c-5.4-1.4-11.8-.8-16.4 2.6z" fill="#FBF5EE" />
    <path d="M24 13.2v25" />
    <path d="M12.4 17.4c2.8-.4 5.6 0 8 1M12.6 22.6c2.6-.4 5.4 0 7.8 1M28 18.4c2.4-1 5.2-1.4 8-1" strokeWidth="1.6" />
  </svg>
)

export const Coin = ({ size = 30, ...p }: P) => (
  <svg viewBox="0 0 48 48" {...base(size, p)}>
    <path d="M24.2 7.4c9.4-.2 16.6 7.4 16.4 16.8-.2 9.2-7.8 16.4-16.8 16.2-9.2-.2-16.4-7.6-16.2-16.8.2-9 7.4-16 16.6-16.2z" fill="#EFAFB3" />
    <path d="M27.6 18.2c-1-1.6-3-2.2-4.8-1.8-2.4.6-3 3.4-.8 4.6 2 1 5.6 1.2 5.6 4 0 2.6-3.6 3.6-6.2 2.2M24 14.2v3M24 29.6v3" />
  </svg>
)

export const Plane = ({ size = 40, ...p }: P) => (
  <svg viewBox="0 0 64 48" {...base(size, p)}>
    <path d="M6.4 22.6L54 8.2 38.6 39.4l-9-11.2z" fill="#FBF5EE" />
    <path d="M54 8.2L29.6 28.2l-2.4 10.6 6.6-6.4" />
    <path d="M4 40c6-1.4 9.6-4.8 10.6-9.4" strokeDasharray="2 5" strokeWidth="1.8" />
  </svg>
)

export const Squiggle = ({ width = 120, ...p }: P & { width?: number }) => (
  <svg viewBox="0 0 120 16" width={width} height={(width / 120) * 16} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden {...p}>
    <path d="M3 9.6c6-6.4 10.4-6.2 14.6.2 4.2 6.4 8.8 6.2 13.6-.4 4.6-6.4 9.4-6.2 13.8.4 4.6 6.4 9.2 6 13.6-.4s9.2-6.4 13.8.2c4.6 6.6 9.4 6.4 14-.2 4.4-6.4 9-6.2 13.6.2 4.4 6.2 8.6 6.2 12.8-.2" />
  </svg>
)

export const Underline = ({ width = 140, ...p }: P & { width?: number }) => (
  <svg viewBox="0 0 140 14" width={width} height={(width / 140) * 14} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden {...p}>
    <path d="M4 9.2c30-4.4 72-6.4 132-3.2M18 12c26-2.4 58-3 96-1.6" />
  </svg>
)

export const Arrow = ({ size = 48, ...p }: P) => (
  <svg viewBox="0 0 64 48" {...base(size, p)}>
    <path d="M6 10c12 2 26 10 30 22 1.6 4.8 2 8 1.6 10.4" />
    <path d="M30.6 37.4l7 5.2 4.6-7.6" />
  </svg>
)
