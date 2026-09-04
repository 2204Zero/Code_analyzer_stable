const fs = require('fs');
let code = fs.readFileSync('page.tsx', 'utf8');

const targetAnimate = `            animate={
              phase === "SCENE_TRANSITION" || phase === "hero-token-focus" ? "focus" :
              phase === "hero-token-falling" ? "falling" :
              phase === "impact" ? "impact" :
              "hidden"
            }`;
const replacementAnimate = `            animate={phase === 'SCENE_TRANSITION' ? 'hero-token-focus' : (['hero-token-focus', 'hero-token-falling', 'impact'].includes(phase) ? phase : 'hidden')}`;

code = code.replace(targetAnimate, replacementAnimate);

const targetVariant = `    focus: {
      x: 0,
      y: 0,
      scale: 3.5,`;
const replacementVariant = `    'hero-token-focus': {
      x: 0,
      y: 0,
      scale: 3.5,`;

code = code.replace(targetVariant, replacementVariant);

fs.writeFileSync('page.tsx', code);
console.log('Fixed using string matching.');
