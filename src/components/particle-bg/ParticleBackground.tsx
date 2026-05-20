import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  layer: 'bg' | 'fg' | 'accent';
}

const COLORS = {
  bg: ['rgba(34,211,238,0.3)', 'rgba(59,130,246,0.2)', 'rgba(147,197,253,0.15)'],
  fg: ['rgba(34,211,238,0.5)', 'rgba(192,132,252,0.4)', 'rgba(96,165,250,0.35)'],
  accent: ['rgba(34,211,238,0.8)', 'rgba(192,132,252,0.7)', 'rgba(59,130,246,0.6)'],
};

function createParticle(w: number, h: number, layer: Particle['layer']): Particle {
  const colorArr = COLORS[layer];
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    radius: layer === 'bg' ? 1 + Math.random() : layer === 'fg' ? 1.5 + Math.random() * 1.5 : 2 + Math.random() * 2,
    opacity: 0.3 + Math.random() * 0.7,
    color: colorArr[Math.floor(Math.random() * colorArr.length)],
    layer,
  };
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  const initParticles = useCallback((w: number, h: number) => {
    const bgCount = Math.floor((w * h) / 18000);
    const fgCount = Math.floor((w * h) / 35000);
    const accentCount = Math.floor((w * h) / 80000);

    const particles: Particle[] = [];
    for (let i = 0; i < bgCount; i++) particles.push(createParticle(w, h, 'bg'));
    for (let i = 0; i < fgCount; i++) particles.push(createParticle(w, h, 'fg'));
    for (let i = 0; i < accentCount; i++) particles.push(createParticle(w, h, 'accent'));

    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouse);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouseRef.current;

      for (const p of particlesRef.current) {
        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 120;

        if (dist < repelRadius && dist > 0) {
          const force = (repelRadius - dist) / repelRadius;
          p.vx += (dx / dist) * force * 0.5;
          p.vy += (dy / dist) * force * 0.5;
        }

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Boundaries
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }

      // Draw connections between close foreground particles
      ctx.globalAlpha = 1;
      const fgParticles = particlesRef.current.filter((p) => p.layer !== 'bg');
      for (let i = 0; i < fgParticles.length; i++) {
        for (let j = i + 1; j < fgParticles.length; j++) {
          const a = fgParticles[i];
          const b = fgParticles[j];
          const d = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
          if (d < 150) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(34,211,238,${0.1 * (1 - d / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
