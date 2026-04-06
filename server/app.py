import subprocess
from fastapi import FastAPI
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager
from rl.env import CodeAnalysisEnv


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
def generate_default_action(state):
    try:
        files = str(state.get("files", "")).lower()

        issues = []
        fixes = []

        if "unused" in files:
            issues.append("unused variable")
            fixes.append("remove unused variable")

        if "hardcoded" in files or "magic number" in files:
            issues.append("hardcoded value")
            fixes.append("replace with constant")

        if "duplicate" in files:
            issues.append("duplicate code")
            fixes.append("remove duplication")

        # NEW BOOST
        if "function" in files or "loop" in files or "complex" in files:
            issues.append("code quality issue")
            fixes.append("refactor code")

        if not issues:
            issues = ["code quality issue"]
            fixes = ["refactor code"]

        return {
            "identified_issues": issues,
            "suggested_fixes": fixes
        }

    except Exception:
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
def step(action: Optional[Dict[str, Any]] = None):
    try:
        # IMPORTANT: fallback agent
        if not action:
            state = env.state()
            action = generate_default_action(state)

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