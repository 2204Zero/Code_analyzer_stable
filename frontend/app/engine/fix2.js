const fs = require('fs');
let code = fs.readFileSync('page.tsx', 'utf8');

code = code.replace(
  /animate=\{\n\s*phase === \"SCENE_TRANSITION\" \|\| phase === \"hero-token-focus\" \? \"focus\" :\n\s*phase === \"hero-token-falling\" \? \"falling\" :\n\s*phase === \"impact\" \? \"impact\" :\n\s*\"hidden\"\n\s*\}/g,
  `animate={phase === 'SCENE_TRANSITION' ? 'hero-token-focus' : (['hero-token-focus', 'hero-token-falling', 'impact'].includes(phase) ? phase : 'hidden')}`
);

code = code.replace(
  /    focus: \{\n      x: 0,\n      y: 0,\n      scale: 3\.5,/g,
  `    'hero-token-focus': {\n      x: 0,\n      y: 0,\n      scale: 3.5,`
);

fs.writeFileSync('page.tsx', code);
console.log('Fixed variants and animate prop.');
