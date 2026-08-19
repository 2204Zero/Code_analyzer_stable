from models.llm_schemas import PerformanceReportSchema
from utils.llm import call_structured_llm

async def profile_codebase_performance(files_dict: dict[str, str]) -> PerformanceReportSchema:
    # Filter non-code files
    ignored_extensions = {".md", ".json", ".yaml", ".yml", ".txt", ".lock", ".csv", ".ini"}
    code_files = {}
    for filepath, content in files_dict.items():
        if not any(filepath.endswith(ext) for ext in ignored_extensions):
            code_files[filepath] = content

    prompt = f"""
You are an Elite Staff Engineer specializing in algorithmic optimization.
Analyze the following code files and identify any severe algorithmic bottlenecks.
Explicitly look for:
- Nested loops yielding O(N^2) or worse time complexity.
- N+1 database query patterns.
- Accidental memory leaks (e.g., unbounded arrays).

If the code is already highly optimized, return an empty list of critical_bottlenecks. Do NOT hallucinate fake issues.

Code Files:
{code_files}
"""
    try:
        response = await call_structured_llm(
            prompt=prompt,
            response_model=PerformanceReportSchema
        )
        return response
    except Exception as e:
        import logging
        logging.getLogger("agentic_ai").warning(f"Failed to profile performance: {e}")
        return PerformanceReportSchema(overall_repo_complexity="Unknown", critical_bottlenecks=[])
