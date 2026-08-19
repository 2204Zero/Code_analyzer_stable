import json
from utils.llm import call_structured_llm
from models.llm_schemas import CriticReviewSchema

async def review_issues(code: str, proposed_issues: dict) -> dict:
    prompt = f"""
    You are a Senior Code Reviewer.
    Your task is to review the following code and the proposed issues.
    Aggressively filter out any hallucinations, false positives, or generic complaints that aren't actually present in the code.
    You must provide your internal reasoning, and then return the strict list of confirmed issues.

    Code:
    {code}

    Proposed Issues:
    {json.dumps(proposed_issues, indent=2)}
    """
    
    response = await call_structured_llm(prompt, response_model=CriticReviewSchema)
    return response.model_dump()
