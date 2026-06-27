'use client';

import { useEffect, useRef } from 'react';

export default function TransitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    // Ping dots — like bus location pings on a map
    const pings: { x: number; y: number; r: number; alpha: number; speed: number }[] = [];
    const spawnPing = () => {
      pings.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 0,
        alpha: 0.6,
        speed: 0.8 + Math.random() * 0.8,
      });
    };
    const pingInterval = setInterval(spawnPing, 1200);

    // Dot grid offset for drift effect
    let gridOffset = 0;

    // Orbs
    const orbs = [
      { x: 0.3, y: 0.4, vx: 0.0002, vy: 0.0001 },
      { x: 0.7, y: 0.6, vx: -0.0001, vy: 0.0002 },
      { x: 0.5, y: 0.2, vx: 0.0001, vy: -0.0002 },
    ];

    // Scan line
    let scanY = 0;

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dot grid
      gridOffset = (gridOffset + 0.15) % 24;
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      for (let x = gridOffset; x < canvas.width; x += 24) {
        for (let y = gridOffset; y < canvas.height; y += 24) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < 0 || orb.x > 1) orb.vx *= -1;
        if (orb.y < 0 || orb.y > 1) orb.vy *= -1;

        const grad = ctx.createRadialGradient(
          orb.x * canvas.width,
          orb.y * canvas.height,
          0,
          orb.x * canvas.width,
          orb.y * canvas.height,
          300
        );
        grad.addColorStop(0, 'rgba(34,197,94,0.07)');
        grad.addColorStop(1, 'rgba(34,197,94,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Scan line
      scanY = (scanY + 0.4) % canvas.height;
      const scanGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 4);
      scanGrad.addColorStop(0, 'rgba(34,197,94,0)');
      scanGrad.addColorStop(1, 'rgba(34,197,94,0.04)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 40, canvas.width, 44);

      // Pings
      for (let i = pings.length - 1; i >= 0; i--) {
        const p = pings[i];
        p.r += p.speed;
        p.alpha -= 0.008;
        if (p.alpha <= 0) {
          pings.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34,197,94,${p.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,197,94,${Math.min(p.alpha * 2, 0.8)})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(pingInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
