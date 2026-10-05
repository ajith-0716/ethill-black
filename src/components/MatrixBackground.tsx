import React, { useEffect, useRef } from 'react';

interface MatrixBackgroundProps {
  opacity?: number;
  colorScheme?: 'green' | 'cyan' | 'red';
}

export const MatrixBackground: React.FC<MatrixBackgroundProps> = ({
  opacity = 0.18,
  colorScheme = 'green',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF$#@%&*+-=<>';
    const fontSize = 14;
    let columns = Math.floor(width / fontSize);
    let drops: number[] = [];

    const initDrops = () => {
      columns = Math.floor(width / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -100);
      }
    };
    initDrops();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initDrops();
    };

    window.addEventListener('resize', handleResize);

    const primaryColor =
      colorScheme === 'cyan'
        ? '#06b6d4'
        : colorScheme === 'red'
        ? '#ef4444'
        : '#10b981';

    const glowColor =
      colorScheme === 'cyan'
        ? 'rgba(6, 182, 212, 0.8)'
        : colorScheme === 'red'
        ? 'rgba(239, 68, 68, 0.8)'
        : 'rgba(16, 185, 129, 0.8)';

    let lastDraw = 0;
    const fps = 28;
    const interval = 1000 / fps;

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);
      const delta = currentTime - lastDraw;
      if (delta < interval) return;
      lastDraw = currentTime - (delta % interval);

      // Semi-transparent fade to create stream trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = primaryColor;
      ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head character is bright white/glowing
        if (Math.random() > 0.92) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = glowColor;
        } else {
          ctx.fillStyle = primaryColor;
          ctx.shadowBlur = 0;
        }

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [colorScheme]);

  return (
    <canvas
      ref={canvasRef}
      style={{ opacity }}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};
