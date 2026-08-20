"use client";

import { useEffect, useState, useMemo } from "react";

export default function HeatmapBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() => {
    const arr = [];
    
    // We are generating a massive Semicircle (Planet) bulging from the left edge.
    // The visual bulge reaches 500px into the screen at the vertical center.
    const R_OUT = 800; // Outer radius of the planet
    const R_IN = 300;  // Inner radius (creating a 500px thick "crust")
    const OFFSET_X = 300; // Pushes the center of the planet 300px OFF the left edge
    const GRID_SIZE = 14; // Strict GitHub heatmap spacing

    // Loop through the coordinate plane to map out the semicircle
    for (let y = -R_OUT; y <= R_OUT; y += GRID_SIZE) {
      for (let x = 0; x <= R_OUT - OFFSET_X; x += GRID_SIZE) {
        
        // Calculate distance from the hypothetical center (-OFFSET_X, 0)
        const distanceSq = Math.pow(x + OFFSET_X, 2) + Math.pow(y, 2);
        
        // If the coordinate falls inside the planet's crust
        if (distanceSq <= R_OUT * R_OUT && distanceSq >= R_IN * R_IN) {
          
          // Randomly skip to make it organic and target exactly ~1000 blocks
          // A 22% density yields roughly 1000 blocks out of the 4400 possible slots.
          if (Math.random() > 0.22) continue;

          // Stagger the animation so the planet looks like it's constantly boiling/effervescing
          const delay = Math.random() * 8;
          const duration = 5 + Math.random() * 5; 

          arr.push({
            x,
            y,
            delay,
            duration,
            id: `earth-${x}-${y}-${Math.random()}`
          });
        }
      }
    }
    return arr;
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen opacity-90">
      
      {/* The Semicircle Emitter (Left Edge) */}
      <div className="absolute top-1/2 left-0 w-full h-full">
         {particles.map(p => (
            <div 
              key={p.id}
              className="absolute w-[10px] h-[10px] rounded-[2px] bg-[#39d353] animate-earth-effervescence"
              style={{ 
                left: `${p.x}px`,
                // marginTop positions it relative to the vertical center (top-1/2)
                marginTop: `${p.y}px`, 
                animationDelay: `${p.delay}s`, 
                animationDuration: `${p.duration}s` 
              }}
            />
         ))}
      </div>

    </div>
  );
}
