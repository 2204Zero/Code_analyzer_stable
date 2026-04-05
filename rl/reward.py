import difflib


def similarity(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, a.lower(), b.lower()).ratio()


def compute_reward(task, action, config=None):
    # -----------------------------
    # SAFE EXTRACTION
    # -----------------------------
    expected_issues = task.get("expected_issues", [])
    expected_fixes = task.get("expected_fixes", [])

    # Handle both string and list inputs
    identified_issues = action.get("identified_issues") or action.get("identified_issue", [])
    suggested_fixes = action.get("suggested_fixes") or action.get("suggested_fix", [])

    # Normalize to list
    if isinstance(identified_issues, str):
        identified_issues = [identified_issues]

    if isinstance(suggested_fixes, str):
        suggested_fixes = [suggested_fixes]

    # -----------------------------
    # ISSUE SCORING (BEST MATCH PER EXPECTED)
    # -----------------------------
    issue_scores = []

    for expected in expected_issues:
        best_match = 0
        for predicted in identified_issues:
            sim = similarity(predicted, expected)
            best_match = max(best_match, sim)
        issue_scores.append(best_match)

    issue_score = sum(issue_scores) / len(issue_scores) if issue_scores else 0

    # -----------------------------
    # FIX SCORING
    # -----------------------------
    fix_scores = []

    for expected in expected_fixes:
        best_match = 0
        for predicted in suggested_fixes:
            sim = similarity(predicted, expected)
            best_match = max(best_match, sim)
        fix_scores.append(best_match)

    fix_score = sum(fix_scores) / len(fix_scores) if fix_scores else 0

    # -----------------------------
    # BASE REWARD
    # -----------------------------
    reward = (0.6 * issue_score) + (0.4 * fix_score)

    # -----------------------------
    # PARTIAL BONUS
    # -----------------------------
    if issue_score > 0.6 and fix_score > 0.6:
        reward += 0.1

    # -----------------------------
    # PENALTIES
    # -----------------------------
    if len(identified_issues) == 0:
        reward -= 0.1

    if len(suggested_fixes) == 0:
        reward -= 0.1

    # prevent spamming too many answers
    if len(identified_issues) > 5:
        reward -= 0.1

    if len(suggested_fixes) > 5:
        reward -= 0.1

    # -----------------------------
    # DIFFICULTY SCALING (IMPORTANT)
    # -----------------------------
    difficulty = (config or {}).get("difficulty", "medium")

    if difficulty == "easy":
        reward *= 1.0
    elif difficulty == "medium":
        reward *= 0.9
    elif difficulty == "hard":
        reward *= 0.8

    # -----------------------------
    # CLAMP
    # -----------------------------
    reward = max(0.0, min(1.0, reward))

    # -----------------------------
    # INFO DEBUG
    # -----------------------------
    info = {
        "issue_score": round(issue_score, 3),
        "fix_score": round(fix_score, 3),
        "final_reward": round(reward, 3),
        "difficulty": difficulty
    }

    return reward, info