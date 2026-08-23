"use client";

import { useMotionTemplate, useMotionValue, motion } from "framer-motion";

export default function InteractiveTiles() {
  const mouseX = useMotionValue(-1000); // Start hidden off-screen
  const mouseY = useMotionValue(-1000);

  // Reduced the glowing area radius based on feedback
  const radius = 200;

  const maskImage = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;

  return (
    <div 
      className="absolute inset-0 w-full h-full overflow-hidden hidden md:block z-0 pointer-events-auto"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }}
      onMouseLeave={() => {
        mouseX.set(-1000);
      }}
    >
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{
          WebkitMaskImage: maskImage,
          maskImage: maskImage
        }}
      >
        <svg width="100%" height="100%">
          <defs>
            <pattern id="heatmap-pattern" width="14" height="14" patternUnits="userSpaceOnUse">
              {/* GitHub Authentic Green: rgba(57, 211, 83) */}
              <rect x="1" y="1" width="12" height="12" rx="2" fill="rgba(57,211,83,0.25)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heatmap-pattern)" />
        </svg>
      </motion.div>
    </div>
  );
}
