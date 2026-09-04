const fs = require('fs');
let code = fs.readFileSync('app/engine/page.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  'import { Hexagon, Sparkles, Cpu } from "lucide-react";',
  'import { Hexagon, Sparkles, Cpu } from "lucide-react";\nimport { useRouter, useSearchParams } from "next/navigation";\nimport { Suspense } from "react";'
);

// 2. Change EnginePage to EngineContent and hook up router/params
code = code.replace(
  'export default function EnginePage() {',
  'function EngineContent() {\n  const router = useRouter();\n  const searchParams = useSearchParams();\n  const repoUrl = searchParams.get("repo") || "https://github.com/agentic-ai/core-engine";'
);

// 3. Remove targetRepo and hook up fullText
code = code.replace('const targetRepo = "https://github.com/agentic-ai/core-engine";\n', '');
code = code.replace('const fullText = targetRepo;', 'const fullText = typeof repoUrl === "string" ? repoUrl : "https://github.com/agentic-ai/core-engine";');
code = code.replaceAll('targetRepo', 'fullText');

// 4. Add Suspense wrapper at the end
code += `

export default function EnginePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090B] flex items-center justify-center text-emerald-500 font-mono">Initializing Vertex Space...</div>}>
      <EngineContent />
    </Suspense>
  );
}
`;

// 5. Add redirect on MATRIX phase
// Let's find where MATRIX is set or handled.
code = code.replace(
  'if (phase === "MATRIX") {',
  'if (phase === "MATRIX") {\n      setTimeout(() => { router.push("/repo/1") }, 4000);'
);

fs.writeFileSync('app/engine/page.tsx', code);
console.log('Updated EnginePage successfully.');
