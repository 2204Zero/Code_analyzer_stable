import subprocess
from fastapi import FastAPI
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager
from rl.env import CodeAnalysisEnv
import sys
import os

# Ensure backend modules can be imported
sys.path.append(os.path.abspath("backend"))
from backend.utils.llm import call_structured_llm
from backend.models.llm_schemas import RLActionSchema


# -----------------------------
# LIFESPAN (MODERN REPLACEMENT)
# -----------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        subprocess.Popen(["python", "inference.py"])
        print("Inference process started", flush=True)
    except Exception as e:
        print(f"Failed to start inference: {e}", flush=True)

    yield  # app runs here

    # (optional cleanup can go here)


# -----------------------------
# APP INIT
# -----------------------------
app = FastAPI(lifespan=lifespan)
env = CodeAnalysisEnv()


# -----------------------------
# SMART DEFAULT AGENT
# -----------------------------
async def generate_default_action(state):
    try:
        files = str(state.get("files", ""))

        prompt = f"""
        You are an AI generating dynamic RL environment actions based on the current state.
        Analyze the provided files state and intelligently identify issues and suggested fixes.
        
        State files:
        {files}
        """
        
        response = await call_structured_llm(prompt, response_model=RLActionSchema)
        return response.model_dump()

    except Exception as e:
        print(f"Error generating action: {e}", flush=True)
        return {
            "identified_issues": [],
            "suggested_fixes": []
        }


# -----------------------------
# RESET
# -----------------------------
@app.post("/reset")
def reset():
    try:
        obs = env.reset()
        return {"observation": obs}
    except Exception as e:
        return {
            "observation": {},
            "error": str(e)
        }


# -----------------------------
# STEP
# -----------------------------
@app.post("/step")
async def step(action: Optional[Dict[str, Any]] = None):
    try:
        # IMPORTANT: fallback agent
        if not action:
            state = env.state()
            action = await generate_default_action(state)

        obs, reward, done, info = env.step(action)

        return {
            "observation": obs,
            "reward": float(reward),
            "done": bool(done),
            "info": info if info else {}
        }

    except Exception as e:
        return {
            "observation": {},
            "reward": 0.0,
            "done": True,
            "info": {"error": str(e)}
        }


# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.get("/")
def home():
    return {"message": "Code Analysis RL Environment is running"}