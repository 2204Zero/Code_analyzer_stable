import re
import os
from models.graph_schemas import GraphNode, GraphEdge, ArchitectureGraph

def extract_imports(code: str) -> list[str]:
    imports = []
    # Python: import X, from X import Y
    py_import_re = re.finditer(r'^\s*(?:from\s+([a-zA-Z0-9_\.]+)\s+import|import\s+([a-zA-Z0-9_\.,\s]+))', code, re.MULTILINE)
    for match in py_import_re:
        if match.group(1):
            imports.append(match.group(1))
        if match.group(2):
            for m in match.group(2).split(','):
                imports.append(m.strip())
                
    # JS/TS: import X from 'Y', require('Y')
    js_import_re = re.finditer(r'(?:import\s+.*?\s+from\s+|require\s*\(\s*)[\'"]([^\'"]+)[\'"]', code)
    for match in js_import_re:
        imports.append(match.group(1))
        
    return imports

def build_architecture_graph(files: dict[str, str]) -> ArchitectureGraph:
    nodes = []
    edges = []
    
    file_keys = list(files.keys())
    
    for filepath, content in files.items():
        filename = os.path.basename(filepath)
        # fallback if filepath is just an id
        if not filename:
            filename = filepath
            
        nodes.append(GraphNode(id=filepath, label=filename, type="file"))
        
        extracted_imports = extract_imports(content)
        for imp in extracted_imports:
            imp_norm = imp.replace('.', '/').strip('/')
            imp_base = os.path.basename(imp)
            for potential_target in file_keys:
                if filepath == potential_target:
                    continue
                # Match if import path is in target path, or target basename matches import
                if imp_norm in potential_target or imp_base in potential_target:
                    edges.append(GraphEdge(source=filepath, target=potential_target, weight=1))
                    break
                    
    return ArchitectureGraph(nodes=nodes, edges=edges)
