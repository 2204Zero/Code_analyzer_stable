from pydantic import BaseModel, Field
from typing import List, Optional

class CodeIssueSchema(BaseModel):
    issue: str
    description: str
    severity: str
    fix: str
    git_patch: Optional[str] = Field(None, description="A strict Git Unified Diff (.patch) format string resolving the issue")

class CodeAnalysisResponse(BaseModel):
    summary: str
    structures: List[str]
    variables: List[str]
    patterns: List[str]
    potential_concerns: List[str]

class FinalSummaryResponse(BaseModel):
    summary: str
    scores: dict[str, int]
    critical_issues: List[str]
    recommendations: List[str]

class CriticReviewSchema(BaseModel):
    reasoning: str
    confirmed_issues: List[CodeIssueSchema]

class RLActionSchema(BaseModel):
    identified_issues: List[str]
    suggested_fixes: List[str]

class FileSummary(BaseModel):
    id: str
    summary: str

class BatchFileSummaries(BaseModel):
    summaries: List[FileSummary]

class BottleneckSchema(BaseModel):
    filepath: str
    function_name: str
    time_complexity: str
    space_complexity: str
    explanation: str
    recommended_fix: str

class PerformanceReportSchema(BaseModel):
    overall_repo_complexity: str
    critical_bottlenecks: List[BottleneckSchema]
