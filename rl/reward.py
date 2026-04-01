import json

# Load data
with open("data/jobs_data.json", "r", encoding="utf-8") as f:
    jobs = json.load(f)["data"]


def compute_reward(job):
    """
    Simple reward logic:
    +1 if result exists
    +1 if issues present
    +1 if fix present
    """

    reward = 0

    result = job.get("result")

    if result:
        reward += 1

        if isinstance(result, dict):
            if result.get("issues"):
                reward += 1
            if result.get("fix"):
                reward += 1

    return reward


def main():
    scores = []

    for job in jobs:
        score = compute_reward(job)

        scores.append({
            "job_id": job["job_id"],
            "reward": score
        })

    print("Reward Scores:\n")
    for s in scores:
        print(s)


if __name__ == "__main__":
    main()