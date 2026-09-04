const fs = require('fs');
let code = fs.readFileSync('app/engine/page.tsx', 'utf8');

const targetStr = '<main className="relative h-screen w-screen bg-[#000000] overflow-hidden font-sans">';
const replacementStr = targetStr + `
      {/* Absolute Minimal Top Nav Overlay */}
      <div className="absolute top-0 left-0 w-full px-8 py-6 flex items-center justify-between z-[100] pointer-events-auto">
        <div 
          onClick={() => window.location.href = '/dashboard'}
          className="flex items-center gap-3 cursor-pointer opacity-70 hover:opacity-100 transition-opacity bg-black/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md"
        >
          <Hexagon className="w-5 h-5 text-emerald-500" fill="currentColor" fillOpacity={0.2} />
          <span className="font-extrabold text-sm tracking-tighter text-white">Abort Synthesis</span>
        </div>
      </div>
`;

code = code.replace(targetStr, replacementStr);
code = code.replace(/router\.push\(['"]\/repo\/1['"]\)/g, "window.location.href = '/repo/1'");
code = code.replace(/router\.push\(['"]\/dashboard['"]\)/g, "window.location.href = '/dashboard'");

fs.writeFileSync('app/engine/page.tsx', code);
console.log('Successfully injected overlay and changed to hard routing');
