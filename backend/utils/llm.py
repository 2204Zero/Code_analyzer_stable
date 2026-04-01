import httpx
import json
from config.settings import USE_LOCAL

# ✅ GLOBAL CLIENT (fix)
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


# ---------------- FUTURE API LLM ---------------- #

async def call_api(prompt: str):
    return "API LLM not configured yet"


# ---------------- MAIN ENTRY ---------------- #

async def call_llm(prompt: str):
    if USE_LOCAL:
        return await call_ollama(prompt)
    else:
        return await call_api(prompt)