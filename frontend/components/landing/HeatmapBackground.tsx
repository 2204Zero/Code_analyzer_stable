"use client";

import { useEffect, useState, useMemo } from "react";

// Pre-calculated waypoints for a highly realistic, anatomically correct human profile
// Scaled to completely fill a massive 1000px height (-500px to +500px)
const profilePoints = [
  { y: -500, x: 50 },
  { y: -450, x: 120 }, // Top curve
  { y: -400, x: 190 }, // Upper forehead
  { y: -350, x: 230 }, // Mid forehead
  { y: -300, x: 260 }, // Lower forehead
  { y: -250, x: 275 }, // Brow ridge start
  { y: -200, x: 285 }, // Brow ridge peak (protruding)
  { y: -170, x: 265 }, // Eye socket dip (deep and realistic)
  { y: -140, x: 275 }, // Upper nose bridge
  { y: -100, x: 300 }, // Mid nose
  { y: -50,  x: 340 }, // Nose tip (sharp point)
  { y: -20,  x: 300 }, // Under nose / Philtrum slope
  { y: 0,    x: 315 }, // Upper lip
  { y: 20,   x: 305 }, // Mouth line / separation
  { y: 40,   x: 320 }, // Lower lip
  { y: 70,   x: 295 }, // Chin dip (submental curve)
  { y: 120,  x: 335 }, // Chin peak (mandible front)
  { y: 180,  x: 290 }, // Throat start (larynx)
  { y: 250,  x: 270 }, // Neck
  { y: 350,  x: 290 }, // Lower neck / Trapezius slope
  { y: 450,  x: 340 }, // Shoulder connection
  { y: 500,  x: 360 }  // Shoulder base
];

function getMaxX(y: number) {
  if (y <= profilePoints[0].y) return profilePoints[0].x;
  if (y >= profilePoints[profilePoints.length - 1].y) return profilePoints[profilePoints.length - 1].x;
  
  for (let i = 0; i < profilePoints.length - 1; i++) {
    const p1 = profilePoints[i];
    const p2 = profilePoints[i+1];
    if (y >= p1.y && y <= p2.y) {
      const t = (y - p1.y) / (p2.y - p1.y);
      return p1.x + t * (p2.x - p1.x);
    }
  }
  return 0;
}

export default function HeatmapBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() => {
    const arr = [];
    
    // Balanced grid size pushed up to hit over 5,000 dots across the massive 1000px height
    const GRID_SIZE = 5; 

    // Extend the loop to cover the full viewport height (-500 to 500)
    for (let y = -500; y <= 500; y += GRID_SIZE) {
      const maxX = getMaxX(y);
      
      for (let x = 0; x <= 450; x += GRID_SIZE) {
        if (x > maxX) continue;
        
        const distToEdge = maxX - x;
        let prob = 0.5; // High base probability to solidly fill the back of the head
        
        if (distToEdge < 12) {
            // Absolute Solid Face Outline
            prob = 0.95;
        } else {
            // 1. Eye Socket (Deep Shadow at the newly defined y=-170 dip)
            const eyeDist = Math.hypot(y - (-170), (maxX - 15) - x);
            if (eyeDist < 35) prob = 0.02; // Create a stark void for the eye
            
            // 2. Cheekbone (Strong Highlight Strip just below the eye)
            const cheekDist = Math.hypot(y - (-60), (maxX - 40) - x);
            if (cheekDist < 45) prob = 0.8; // High density bone structure
            
            // 3. Jawline (Structural Edge swooping down to the new chin at y=120)
            const jawY = 120 + ((x - maxX) * -0.5);
            if (y > jawY - 20 && y < jawY + 20 && x > 150) {
                prob = 0.75; // Pronounced jaw definition
            }
            
            // 4. Neural / Brain matter (Solidly fills the back of the head with dense sparking clusters)
            if (prob === 0.5) {
               const noise = Math.sin(x / 12) * Math.cos(y / 12);
               if (noise > 0.4) prob = 0.85; // Even denser clusters
               else if (noise < -0.4) prob = 0.15;
            }
        }

        if (Math.random() < prob) {
          const delay = Math.random() * 8;
          const duration = 5 + Math.random() * 5; 

          arr.push({
            x,
            y,
            delay,
            duration,
            id: `bot-${x}-${y}-${Math.random()}`
          });
        }
      }
    }
    return arr;
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen opacity-90">
      
      {/* The Robot Emitter (Anchored to Left Edge) */}
      <div className="absolute top-1/2 left-0 w-full h-full">
         {particles.map(p => (
            <div 
              key={p.id}
              className="absolute w-[3px] h-[3px] rounded-[1px] bg-[#39d353] animate-earth-effervescence"
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
