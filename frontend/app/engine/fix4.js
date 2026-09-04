const fs = require('fs');
let lines = fs.readFileSync('page.tsx', 'utf8').split(/\r?\n/);

// Update variants (line 277, 0-indexed is 276)
lines[276] = "    'hero-token-focus': {";

// Update animate (lines 475-480, 0-indexed is 474-479)
lines.splice(474, 6, "            animate={phase === 'SCENE_TRANSITION' ? 'hero-token-focus' : (['hero-token-focus', 'hero-token-falling', 'impact'].includes(phase) ? phase : 'hidden')}");

fs.writeFileSync('page.tsx', lines.join('\n'));
console.log('Fixed by line indices.');
