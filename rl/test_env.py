from env import CodeAnalysisEnv

env = CodeAnalysisEnv()

state = env.reset()
print("INITIAL STATE:", state)

action = {
    "identified_file": "main.py",
    "identified_issue": "unused variable",
    "suggested_fix": "remove unused variable"
}

next_state, reward, done, info = env.step(action)

print("\nREWARD:", reward)
print("DONE:", done)
print("INFO:", info)