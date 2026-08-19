from pydantic import BaseModel
from typing import List, Optional

class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    semantic_summary: Optional[str] = None

class GraphEdge(BaseModel):
    source: str
    target: str
    weight: int = 1

class ArchitectureGraph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
