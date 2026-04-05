import os
import json
import random
from typing import Dict, Any

from rl.reward import compute_reward

# NEW: task configs
try:
    from tasks.tasks import get_tasks
except ImportError:
    def get_tasks():
        return []


# FIXED PATH (VERY IMPORTANT)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DATA_PATH = os.path.join(BASE_DIR, "data", "jobs_data.json")


class CodeAnalysisEnv:
    def __init__(self, data_path=None):
        self.data_path = data_path or DEFAULT_DATA_PATH

        self.tasks = self.load_tasks()
        self.task_configs = get_tasks()

        self.current_task = None
        self.current_config = None

        self.done = False
        self.steps = 0

    # =========================
    # LOAD TASKS
    # =========================
    def load_tasks(self):
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Dataset not found at {self.data_path}")

        with open(self.data_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        tasks = []

        if isinstance(data, dict) and "data" in data:
            data = data["data"]

        if not isinstance(data, list):
            raise ValueError("jobs_data.json must contain a list or 'data' key")

        for item in data:
            try:
                if not isinstance(item, dict):
                    continue

                result = item.get("result", {})
                if not isinstance(result, dict):
                    continue

                task = {
                    "repo": item.get("repo_id", "unknown_repo"),
                    "problem": "Analyze code and find issues",
                    "files": result.get("analysis", ""),
                    "expected_issues": [
                        i.get("issue", "")
                        for i in result.get("issues", [])
                        if isinstance(i, dict)
                    ],
                    "expected_fixes": [
                        f.get("fix", "")
                        for f in result.get("fixes", [])
                        if isinstance(f, dict)
                    ],
                }

                if not task["expected_issues"]:
                    continue

                tasks.append(task)

            except Exception as e:
                print("Skipping invalid item:", e)

        if not tasks:
            raise ValueError("No valid tasks parsed from jobs_data.json")

        return tasks

    # =========================
    # RESET
    # =========================
    def reset(self) -> Dict[str, Any]:
        if not self.tasks:
            raise ValueError("No tasks loaded.")

        self.current_task = random.choice(self.tasks)

        if self.task_configs:
            self.current_config = random.choice(self.task_configs)
        else:
            self.current_config = {}

        self.done = False
        self.steps = 0

        # REQUIRED LOG
        print("[START]")

        return self._get_observation()

    # =========================
    # STEP
    # =========================
    def step(self, action: Dict[str, Any]):
        if self.done:
            raise Exception("Episode already finished. Call reset().")

        self.steps += 1

        try:
            reward, info = compute_reward(
                self.current_task,
                action,
                self.current_config
            )
        except Exception as e:
            # fail-safe (VERY IMPORTANT)
            print("[STEP] error in reward:", str(e))
            return self._get_observation(), 0.0, True, {"error": str(e)}

        # REQUIRED LOG
        print(f"[STEP] step={self.steps} action={action} reward={round(reward, 2)}")

        # episode end logic
        if reward >= 0.9 or self.steps >= 3:
            self.done = True

            # REQUIRED LOG
            print(
                f"[END] success={reward >= 0.9} "
                f"steps={self.steps} "
                f"score={round(reward, 2)}"
            )

        return (
            self._get_observation(),
            float(reward),
            self.done,
            info if info else {}
        )

    # =========================
    # OBSERVATION
    # =========================
    def _get_observation(self) -> Dict[str, Any]:
        if not self.current_task:
            raise Exception("Call reset() first.")

        return {
            "repo": self.current_task.get("repo", ""),
            "problem": self.current_task.get("problem", ""),
            "files": self.current_task.get("files", ""),
            "steps_taken": self.steps,
            "difficulty": self.current_config.get("difficulty", "unknown"),
        }

    # alias
    def state(self):
        return self._get_observation()