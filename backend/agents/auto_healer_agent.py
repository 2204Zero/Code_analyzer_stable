from utils.llm import call_structured_llm
from models.llm_schemas import CodeIssueSchema
from pydantic import BaseModel
from typing import List

class HealedIssuesResponse(BaseModel):
    healed_issues: List[CodeIssueSchema]

async def generate_healing_patches(code: str, confirmed_issues: list[dict]) -> list[dict]:
    prompt = f"""
You are a Senior Git Version Control Expert. 
I am providing you with the raw source code and a list of confirmed bugs/issues.
For EACH issue, generate a strict, valid Git Unified Diff (.patch format) that completely fixes the issue.
Ensure the patch contains standard '--- a/file' and '+++ b/file' headers, and correct '-'/'+' line indicators.

Raw Code:
{code}

Confirmed Issues:
{confirmed_issues}
"""
    try:
        response = await call_structured_llm(prompt, response_model=HealedIssuesResponse)
        return [issue.model_dump() for issue in response.healed_issues]
    except Exception as e:
        import logging
        logging.getLogger("agentic_ai").warning(f"Failed to generate healing patches: {e}")
        return confirmed_issues
