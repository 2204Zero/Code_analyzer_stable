import httpx
import json
from config.settings import USE_LOCAL
import google.generativeai as genai
import os
import asyncio
from dotenv import load_dotenv
from pydantic import BaseModel
import instructor
from tenacity import retry, stop_after_attempt, wait_exponential

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

gemini_model = genai.GenerativeModel("gemini-2.5-flash")

# Patch the gemini client
patched_client = instructor.from_gemini(
    client=genai.GenerativeModel(
        model_name="models/gemini-2.5-flash",
    ),
    mode=instructor.Mode.GEMINI_JSON,
)

# GLOBAL CLIENT (fix)
client = httpx.AsyncClient(timeout=60.0)


def extract_json(text: str):
    if not isinstance(text, str):
        return text

    try:
        return json.loads(text)
    except:
        pass

    start_obj = text.find("{")
    end_obj = text.rfind("}")

    start_arr = text.find("[")
    end_arr = text.rfind("]")

    if start_arr != -1 and (start_arr < start_obj or start_obj == -1):
        try:
            return json.loads(text[start_arr:end_arr+1])
        except:
            pass

    if start_obj != -1:
        try:
            return json.loads(text[start_obj:end_obj+1])
        except:
            pass

    return {
        "error": "Could not extract JSON",
        "raw_output": text
    }


# ---------------- LOCAL LLM ---------------- #

async def call_ollama(prompt: str):
    try:
        response = await client.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            }
        )

        data = response.json()
        return data.get("response", "")

    except Exception as e:
        return f"LLM Error: {str(e)}"


# ---------------- STRUCTURED API LLM ---------------- #

@retry(stop=stop_after_attempt(4), wait=wait_exponential(multiplier=1, min=2, max=10))
async def call_structured_llm(prompt: str, response_model: type[BaseModel]):
    try:
        response = await patched_client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            response_model=response_model,
        )
        return response
    except Exception as e:
        # If tenacity retries fail, return a safe fallback object based on the schema
        print(f"LLM Error after retries: {str(e)}")
        # Construct fallback via the model's schema defaults or empty fields
        fallback_data = {}
        for field_name, field_info in response_model.model_fields.items():
            if field_info.annotation == str:
                fallback_data[field_name] = f"AI generation failed due to error: {str(e)}"
            elif field_info.annotation == int or field_info.annotation == float:
                fallback_data[field_name] = 0
            elif "List" in str(field_info.annotation) or "list" in str(field_info.annotation):
                fallback_data[field_name] = []
            elif "dict" in str(field_info.annotation) or "Dict" in str(field_info.annotation):
                fallback_data[field_name] = {}
            else:
                fallback_data[field_name] = None
        return response_model(**fallback_data)


# ---------------- STREAMING API LLM ---------------- #

async def stream_llm(prompt: str):
    try:
        response = await gemini_model.generate_content_async(prompt, stream=True)
        async for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        yield f"LLM Error: {str(e)}"

# ---------------- MAIN ENTRY ---------------- #

async def call_llm(prompt: str):
    if USE_LOCAL:
        return await call_ollama(prompt)
    else:
        # Fallback if call_api was removed, though not strictly needed for this task
        return await call_ollama(prompt)