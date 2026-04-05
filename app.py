from fastapi import FastAPI
from typing import Optional, Dict, Any
from rl.env import CodeAnalysisEnv

app = FastAPI()

env = CodeAnalysisEnv()


@app.post("/reset")
def reset():
    obs = env.reset()
    return {"observation": obs}


@app.post("/step")
def step(action: Optional[Dict[str, Any]] = None):
    # Handle case when no body is sent
    if action is None:
        action = {}

    obs, reward, done, info = env.step(action)

    return {
        "observation": obs,
        "reward": float(reward),   # ensure JSON serializable
        "done": bool(done),        # ensure proper type
        "info": info if info is not None else {}
    }