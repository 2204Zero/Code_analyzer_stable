from fastapi import FastAPI
from rl.env import CodeAnalysisEnv

app = FastAPI()

env = CodeAnalysisEnv()

@app.post("/reset")
def reset():
    state = env.reset()
    return state

@app.post("/step")
def step(action: dict):
    state, reward, done, info = env.step(action)
    return {
        "state": state,
        "reward": reward,
        "done": done,
        "info": info
    }