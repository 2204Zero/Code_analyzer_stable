from utils.llm import call_llm, call_structured_llm
from models.llm_schemas import CodeAnalysisResponse

# IMPORT correct agents (VERY IMPORTANT)
from agents.issue_generator_agent import issue_generator_agent
from agents.fixed_generator_agent import fix_generator_agent
from agents.explanation_agent import explanation_agent
from agents.critic_agent import review_issues
from agents.auto_healer_agent import generate_healing_patches


# Analyzer Agent
async def analyzer_agent(code: str):
    prompt = f"""
You are a senior code reviewer. Analyze the following code snippet.
Focus on identifying structures, variables, patterns, and potential concerns.

Code:
{code}
"""

    response = await call_structured_llm(prompt, response_model=CodeAnalysisResponse)

    return response.model_dump()


# PIPELINE (clean, no wrapping, no duplicates)
async def run_pipeline(code: str):
    analysis = await analyzer_agent(code)

    # DEBUG (optional, you can remove later)
    # print("ISSUE FUNCTION USED:", issue_generator_agent)

    issues = await issue_generator_agent(analysis)
    fixes = await fix_generator_agent(issues)
    explanations = await explanation_agent(analysis)

    proposed_results = {
        "analysis": analysis,
        "issues": issues,
        "fixes": fixes,
        "explanations": explanations
    }

    filtered_results = await review_issues(code, proposed_results)
    
    # Auto-Healer Phase
    if "confirmed_issues" in filtered_results and filtered_results["confirmed_issues"]:
        healed_issues = await generate_healing_patches(code, filtered_results["confirmed_issues"])
        filtered_results["confirmed_issues"] = healed_issues

    return filtered_results