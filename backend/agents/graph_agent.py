from models.graph_schemas import ArchitectureGraph
from models.llm_schemas import BatchFileSummaries
from utils.llm import call_structured_llm

async def enrich_graph_semantics(graph: ArchitectureGraph, files_dict: dict[str, str]) -> ArchitectureGraph:
    # Token optimization: truncate files to first 100 lines
    truncated_files = {}
    for filepath, content in files_dict.items():
        lines = content.split('\n')
        truncated = '\n'.join(lines[:100])
        truncated_files[filepath] = truncated
        
    prompt = f"""
You are a Senior Architect analyzing a codebase.
I will provide you with a dictionary of files mapping their filepath to their truncated contents.
For each file, return a 1-sentence (max 15 words) summary explaining its core responsibility.

Files:
{truncated_files}
"""

    try:
        response = await call_structured_llm(
            prompt=prompt,
            response_model=BatchFileSummaries
        )
        
        # Map summaries back to nodes
        summary_map = {s.id: s.summary for s in response.summaries}
        for node in graph.nodes:
            if node.id in summary_map:
                node.semantic_summary = summary_map[node.id]
                
    except Exception as e:
        import logging
        logging.getLogger("agentic_ai").warning(f"Failed to enrich graph semantics: {e}")
        
    return graph
