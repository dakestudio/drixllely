import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

/** Verde olivo de la paleta oficial (antes era el dorado #D4AF37). */
const PARTICLE_COLOR = '#536332';

const FloatingParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect the OS "reduce motion" setting: draw one static frame, no loop.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;

    const resizeCanvas = () => {
      // Scale by devicePixelRatio, otherwise the particles render blurry on
      // every phone and retina screen. Capped at 2 so we never pay for 3x.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const particleCount = Math.min(35, Math.floor(width / 30));
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedY: -(Math.random() * 0.3 + 0.1),
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
    }));

    const draw = (advance: boolean) => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particlesRef.current) {
        if (advance) {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.y * 0.01) * 0.2;
          p.rotation += p.rotationSpeed;

          // Reset when off screen
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        // Soft diamond. The glow comes from a single shadowed fill — the
        // previous version painted every particle twice, which made shadowBlur
        // (already the most expensive canvas op) cost double.
        ctx.shadowColor = PARTICLE_COLOR;
        ctx.shadowBlur = p.size * 2;
        ctx.fillStyle = PARTICLE_COLOR;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.6, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.6, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    };

    if (prefersReducedMotion) {
      draw(false);
    } else {
      const animate = () => {
        draw(true);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    }

    // Stop burning frames while the tab is in the background.
    const onVisibilityChange = () => {
      if (prefersReducedMotion) return;
      if (document.hidden) {
        cancelAnimationFrame(animationRef.current);
      } else {
        animationRef.current = requestAnimationFrame(function loop() {
          draw(true);
          animationRef.current = requestAnimationFrame(loop);
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};

export default FloatingParticles;
