const fs = require('fs');
let code = fs.readFileSync('app/engine/page.tsx', 'utf8');

code = code.replace(/export default function EnginePage\(\) \{/, 'import { Suspense } from "react";\n\nfunction EngineContent() {\n');
code = code.replace(/export default function EngineContent\(\) \{/, 'function EngineContent() {'); // in case it was already replaced

code += `

export default function EnginePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090B] flex items-center justify-center text-emerald-500 font-mono">Initializing Vertex Space...</div>}>
      <EngineContent />
    </Suspense>
  );
}
`;

fs.writeFileSync('app/engine/page.tsx', code);
console.log('Fixed Suspense');
