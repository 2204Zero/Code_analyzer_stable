"use client";

import { useEffect, useRef } from "react";

export default function InteractiveTiles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let points: { x: number; y: number; life: number }[] = [];
    let animationFrameId: number;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    window.addEventListener("resize", resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      points.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        life: 1.0 // Start at max intensity
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Use 'lighter' blend mode for a vibrant, glowing neon overlap
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        
        // Intensity fades as life approaches 0
        const alpha = Math.max(0, p1.life);
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        
        // Taper the line width for a sleek, premium tail
        ctx.lineWidth = 4 * p1.life;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        // GitHub Authentic Green glow
        ctx.strokeStyle = `rgba(57, 211, 83, ${alpha})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(57, 211, 83, ${alpha})`;
        
        ctx.stroke();
      }

      // Age the points to create the fading trail effect
      for (let i = 0; i < points.length; i++) {
        points[i].life -= 0.04; // Increased decay for a much faster, snappier fade (< 1 sec)
      }

      // Remove points that have completely faded out
      points = points.filter((p) => p.life > 0);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden hidden md:block z-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
