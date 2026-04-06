import subprocess
from fastapi import FastAPI
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager

from rl.env import CodeAnalysisEnv


# -----------------------------
# LIFESPAN (REPLACES on_event)
# -----------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start inference in background
    try:
        subprocess.Popen(["python", "inference.py"])
        print("✅ Inference process started", flush=True)
    except Exception as e:
        print(f"❌ Failed to start inference: {e}", flush=True)

    yield

    # (Optional cleanup can go here)


# -----------------------------
# APP INIT
# -----------------------------
app = FastAPI(lifespan=lifespan)

env = CodeAnalysisEnv()


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
def step(action: Optional[Dict[str, Any]] = None):
    # Safe fallback action
    if not action:
        action = {
            "identified_issues": [],
            "suggested_fixes": []
        }

    try:
        obs, reward, done, info = env.step(action)

        return {
            "observation": obs,
            "reward": float(reward),
            "done": bool(done),
            "info": info if info else {}
        }

    except Exception as e:
        # NEVER crash
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