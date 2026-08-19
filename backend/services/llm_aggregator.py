import json
from utils.llm import call_llm, call_structured_llm
from models.llm_schemas import FinalSummaryResponse


async def generate_final_summary(issues):
    prompt = f"""
    You are a senior software engineer.

    Analyze these issues found in a codebase:

    {issues}

    Return a comprehensive summary of the overall code quality.
    Score the code on code_quality, maintainability, readability, and robustness out of 10.
    List the top critical issues.
    Provide actionable recommendations.
    """

    response = await call_structured_llm(prompt, response_model=FinalSummaryResponse)
    
    return response.model_dump()