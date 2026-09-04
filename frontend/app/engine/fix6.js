const fs = require('fs');
let code = fs.readFileSync('page.tsx', 'utf8');

// Use an actual block replace!
const startIdx = code.indexOf('animate={');
const endIdx = code.indexOf('className="absolute top-1/2 left-1/2 -ml-[24px] -mt-[24px]');

if (startIdx !== -1 && endIdx !== -1) {
    const before = code.substring(0, startIdx);
    const after = code.substring(endIdx);
    code = before + `animate={phase === 'SCENE_TRANSITION' ? 'hero-token-focus' : phase}\n            ` + after;
}

// Clean up the mistake from earlier where it added animate twice
code = code.replace(/            animate=\{\n              phase === "SCENE_TRANSITION".*\n.*\n.*\n.*\n            animate=\{phase/g, "            animate={phase");
code = code.replace(/            animate=\{phase === 'SCENE_TRANSITION' \? 'hero-token-focus' : \(\['hero-token-focus', 'hero-token-falling', 'impact'\]\.includes\(phase\) \? phase : 'hidden'\)\}\n      \)\}/g, "");

fs.writeFileSync('page.tsx', code);
console.log('Fixed animate block.');
