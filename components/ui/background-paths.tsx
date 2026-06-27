'use client';

/**
 * @author: @dorianbaffier
 * @description: Background Paths (Optimized & Visible for Dark Mode)
 * @version: 1.0.2
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import React, { memo, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Point {
  x: number;
  y: number;
}

interface PathData {
  id: string;
  d: string;
  opacity: number;
  width: number;
  duration: number;
  delay: number;
}

// Path generation function
function generateAestheticPath(
  index: number,
  position: number,
  type: 'primary' | 'secondary' | 'accent'
): string {
  const baseAmplitude =
    type === 'primary' ? 150 : type === 'secondary' ? 100 : 60;
  const phase = index * 0.2;
  const points: Point[] = [];
  const segments = type === 'primary' ? 10 : type === 'secondary' ? 8 : 6;

  const startX = 2400;
  const startY = 800;
  const endX = -2400;
  const endY = -800 + index * 25;

  for (let i = 0; i <= segments; i++) {
    const progress = i / segments;
    const eased = 1 - (1 - progress) ** 2;

    const baseX = startX + (endX - startX) * eased;
    const baseY = startY + (endY - startY) * eased;

    const amplitudeFactor = 1 - eased * 0.3;
    const wave1 =
      Math.sin(progress * Math.PI * 3 + phase) *
      (baseAmplitude * 0.7 * amplitudeFactor);
    const wave2 =
      Math.cos(progress * Math.PI * 4 + phase) *
      (baseAmplitude * 0.3 * amplitudeFactor);
    const wave3 =
      Math.sin(progress * Math.PI * 2 + phase) *
      (baseAmplitude * 0.2 * amplitudeFactor);

    points.push({
      x: baseX * position,
      y: baseY + wave1 + wave2 + wave3,
    });
  }

  const pathCommands = points.map((point: Point, i: number) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prevPoint = points[i - 1];
    const tension = 0.4;
    const cp1x = prevPoint.x + (point.x - prevPoint.x) * tension;
    const cp1y = prevPoint.y;
    const cp2x = prevPoint.x + (point.x - prevPoint.x) * (1 - tension);
    const cp2y = point.y;
    return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  });

  return pathCommands.join(' ');
}

const generateUniqueId = (prefix: string): string =>
  `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// Memoized FloatingPaths component
const FloatingPaths = memo(function FloatingPaths({
  position,
}: {
  position: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Visual requirement: 36 paths in total to properly fill the screen
  const primaryPaths: PathData[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: generateUniqueId('primary'),
        d: generateAestheticPath(i, position, 'primary'),
        opacity: 0.15 + i * 0.02, // strokeOpacity starts at 0.15 minimum up to 0.4
        width: 3.5 + i * 0.2,
        duration: 35,
        delay: 0,
      })),
    [position]
  );

  const secondaryPaths: PathData[] = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: generateUniqueId('secondary'),
        d: generateAestheticPath(i, position, 'secondary'),
        opacity: 0.15 + i * 0.015, // strokeOpacity starts at 0.15 minimum up to 0.4
        width: 2.5 + i * 0.15,
        duration: 30,
        delay: 0,
      })),
    [position]
  );

  const accentPaths: PathData[] = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        id: generateUniqueId('accent'),
        d: generateAestheticPath(i, position, 'accent'),
        opacity: 0.15 + i * 0.02, // strokeOpacity starts at 0.15 minimum up to 0.4
        width: 1.5 + i * 0.1,
        duration: 25,
        delay: 0,
      })),
    [position]
  );

  // Prevent SSR hydration mismatch
  if (!mounted) {
    return <div className="pointer-events-none absolute inset-0 overflow-hidden bg-neutral-950" />;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-neutral-950">
      <svg
        className="h-full w-full opacity-60"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        viewBox="-2400 -800 4800 1600"
      >
        <title>Background Paths</title>

        <g className="primary-waves">
          {primaryPaths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="white"
              strokeLinecap="round"
              strokeWidth={path.width}
              initial={{ pathLength: 0.3, opacity: path.opacity }}
              animate={{
                pathLength: 1,
                opacity: [path.opacity * 0.6, path.opacity * 1.2, path.opacity * 0.6],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration: path.duration,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </g>

        <g className="secondary-waves" style={{ opacity: 0.8 }}>
          {secondaryPaths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="white"
              strokeLinecap="round"
              strokeWidth={path.width}
              initial={{ pathLength: 0.3, opacity: path.opacity }}
              animate={{
                pathLength: 1,
                opacity: [path.opacity * 0.6, path.opacity * 1.2, path.opacity * 0.6],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration: path.duration,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </g>

        <g className="accent-waves" style={{ opacity: 0.6 }}>
          {accentPaths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="white"
              strokeLinecap="round"
              strokeWidth={path.width}
              initial={{ pathLength: 0.3, opacity: path.opacity }}
              animate={{
                pathLength: 1,
                opacity: [path.opacity * 0.6, path.opacity * 1.2, path.opacity * 0.6],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration: path.duration,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
});

interface BackgroundPathsProps {
  children?: React.ReactNode;
}

export default memo(function BackgroundPaths({ children }: BackgroundPathsProps) {
  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-neutral-100 overflow-x-hidden">
      {/* Fixed background behind everything on z-0 */}
      <div className="fixed inset-0 z-0">
        <FloatingPaths position={1} />
      </div>

      {/* Content in front on z-10 */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
});
