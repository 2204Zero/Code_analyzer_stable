const fs = require('fs');
let code = fs.readFileSync('app/engine/page.tsx', 'utf8');

if (!code.includes('useRouter')) {
  code = code.replace('import { Hexagon, Sparkles, Cpu } from "lucide-react";', 'import { Hexagon, Sparkles, Cpu } from "lucide-react";\nimport { useRouter, useSearchParams } from "next/navigation";');
  code = code.replace('export default function EnginePage() {', 'export default function EnginePage() {\n  const router = useRouter();\n  const searchParams = useSearchParams();\n  const repoUrl = searchParams.get("repo") || "https://github.com/agentic-ai/core-engine";\n');
  code = code.replace('const targetRepo = "https://github.com/agentic-ai/core-engine";', '');
  code = code.replace('const fullText = targetRepo;', 'const fullText = typeof repoUrl === "string" ? repoUrl : "https://github.com/agentic-ai/core-engine";');
  
  // Find where phase is set to 'complete' and push to router shortly after
  code = code.replace("setPhase('complete');", "setPhase('complete');\n        setTimeout(() => router.push('/dashboard'), 1000);");
  
  fs.writeFileSync('app/engine/page.tsx', code);
  console.log('Updated EnginePage');
} else {
  console.log('Already updated');
}
