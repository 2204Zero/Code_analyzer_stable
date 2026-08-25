"use client";

import { useEffect, useState, useMemo } from "react";

// Pre-calculated waypoints for a highly detailed, right-facing human profile
// Scaled to completely fill a massive 1000px height (-500px to +500px)
const profilePoints = [
  { y: -500, x: 0 },
  { y: -450, x: 100 },
  { y: -400, x: 180 },
  { y: -300, x: 260 }, // Upper forehead
  { y: -200, x: 300 }, // Mid forehead
  { y: -100, x: 320 }, // Brow ridge
  { y: -60,  x: 290 }, // Eye socket (indented)
  { y: -20,  x: 310 }, // Bridge
  { y: 40,   x: 390 }, // Nose tip
  { y: 80,   x: 330 }, // Under nose
  { y: 110,  x: 350 }, // Upper lip
  { y: 130,  x: 330 }, // Mouth line
  { y: 160,  x: 360 }, // Lower lip
  { y: 200,  x: 320 }, // Chin dip
  { y: 260,  x: 380 }, // Chin tip
  { y: 320,  x: 320 }, // Throat connection
  { y: 400,  x: 300 }, // Neck
  { y: 500,  x: 340 }  // Collar/Shoulder (Fills bottom-left)
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
        
        if (distToEdge < 15) {
            // Absolute Solid Face Outline
            prob = 0.95;
        } else {
            // 1. Eye Socket (Deep Shadow at y=-60)
            const eyeDist = Math.hypot(y - (-60), (maxX - 20) - x);
            if (eyeDist < 40) prob = 0.05;
            
            // 2. Cheekbone (Highlight Strip at y=20)
            const cheekDist = Math.hypot(y - 20, (maxX - 40) - x);
            if (cheekDist < 45) prob = 0.7;
            
            // 3. Jawline (Structural Edge swooping down to y=260)
            const jawY = 260 + ((x - maxX) * -0.4);
            if (y > jawY - 25 && y < jawY + 25 && x > 150) {
                prob = 0.7;
            }
            
            // 4. Neural / Brain matter (Solidly fills the left side with dense sparking clusters)
            if (prob === 0.5) {
               const noise = Math.sin(x / 12) * Math.cos(y / 12);
               if (noise > 0.5) prob = 0.8;
               else if (noise < -0.5) prob = 0.2;
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
