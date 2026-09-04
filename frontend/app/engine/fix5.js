const fs = require('fs');
let code = fs.readFileSync('page.tsx', 'utf8');

code = code.replace(/\"HERO_TOKEN_FOCUS\"/g, '\"hero-token-focus\"');
code = code.replace(/\"HERO_TOKEN_FALLING\"/g, '\"hero-token-falling\"');
code = code.replace(/\"IMPACT\"/g, '\"impact\"');
code = code.replace(/\"MATRIX_REVEAL\"/g, '\"matrix-reveal\"');
code = code.replace(/\"MATRIX_FILLED\"/g, '\"matrix-filled\"');
code = code.replace(/\"COMPLETE\"/g, '\"complete\"');

// Update the variants
const variantsBlock = `  const heroTokenVariants = {
    initial: { scale: 0.5, opacity: 0, x: 0, y: 0, rotate: 0 },
    'hero-token-focus': {
      x: 0,
      y: 0,
      scale: 3.5,
      rotate: 0,
      opacity: 1,
      transition: { duration: 0.45, ease: 'easeInOut' }
    },
    'hero-token-falling': {
      x: [0, 20, -10, 40],
      y: [0, 120, 260, 420],
      scale: [3.5, 3.2, 2.8, 2.3],
      rotate: [0, -8, 10, 18],
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    impact: {
      x: 40,
      y: 420,
      scaleX: 1.08,
      scaleY: 0.9,
      rotate: 0,
      opacity: 1,
      transition: {
        duration: 0.18,
        ease: 'easeOut',
      },
    },
    hidden: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };`;

code = code.replace(/const heroTokenVariants = \{[\s\S]*?hidden: \{[\s\S]*?\}\n  \};/, variantsBlock);

// update y values for ground plane and shockwave (from 330 to 420)
code = code.replace(/y: 330/g, 'y: 420');
code = code.replace(/y: "calc\(-50% \+ 330px\)"/g, 'y: "calc(-50% + 420px)"');

// Add debug label
code = code.replace(/<main className="relative h-screen w-screen bg-\[#000000\] overflow-hidden font-sans">/, 
`<main className="relative h-screen w-screen bg-[#000000] overflow-hidden font-sans">\n      <div className="absolute bottom-4 left-4 z-[100] text-white font-mono text-xs">phase: {phase}</div>`);


// Update timers
const newTimers = `
  useEffect(() => {
    if (!isAnimating) return;

    setPhase("hero-token-focus");

    const timers = [
      setTimeout(() => setPhase("hero-token-falling"), 600),
      setTimeout(() => setPhase("impact"), 2200),
      setTimeout(() => setPhase("matrix-reveal"), 2500),
      setTimeout(() => setPhase("matrix-filled"), 3400),
      setTimeout(() => setPhase("complete"), 4500),
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, [isAnimating]);`;

code = code.replace(/  \/\/ 6\. Stage 2: The Cinematic Hero Token Skydive \(Master Timeline\)[\s\S]*?\}, \[isAnimating\]\);/, '  // 6. Stage 2: The Cinematic Hero Token Skydive (Master Timeline)' + newTimers);

fs.writeFileSync('page.tsx', code);
console.log('Replacements complete');
