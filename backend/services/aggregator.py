from sentence_transformers import SentenceTransformer, util
import threading

_model = None
_model_lock = threading.Lock()

def get_embedding_model():
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                try:
                    _model = SentenceTransformer('all-MiniLM-L6-v2')
                except Exception as e:
                    print("Could not load embedding model for aggregation:", e)
                    return None
    return _model

def aggregate_results(file_results):
    issue_counter = {}
    issue_descriptions = {}

    for result in file_results:
        if not result:
            continue

        issues = result.get("issues", [])

        for item in issues:
            if isinstance(item, dict):
                issue_text = item.get("issue", "Unknown issue").strip()
                description = item.get("description", "").strip()
            elif isinstance(item, str):
                issue_text = item.strip()
                description = ""
            else:
                continue

            if not issue_text:
                continue

            issue_counter[issue_text] = issue_counter.get(issue_text, 0) + 1
            if issue_text not in issue_descriptions or not issue_descriptions[issue_text]:
                issue_descriptions[issue_text] = description

    unique_issues = list(issue_counter.keys())

    if not unique_issues:
        return {
            "total_files": len(file_results),
            "total_unique_issues": 0,
            "top_issues": []
        }

    model = get_embedding_model()

    # Fallback to simple matching if model fails to load
    if model is None:
        top_issues = [
            {
                "issue": issue,
                "description": issue_descriptions.get(issue, ""),
                "count": count
            }
            for issue, count in issue_counter.items()
        ]
        top_issues.sort(key=lambda x: x["count"], reverse=True)
        return {
            "total_files": len(file_results),
            "total_unique_issues": len(issue_counter),
            "top_issues": top_issues
        }

    # Semantic Clustering
    embeddings = model.encode(unique_issues, convert_to_tensor=True)

    clusters = []
    visited = set()

    for i in range(len(unique_issues)):
        if i in visited:
            continue

        current_cluster = [i]
        visited.add(i)

        for j in range(i + 1, len(unique_issues)):
            if j in visited:
                continue

            sim = util.cos_sim(embeddings[i], embeddings[j]).item()
            if sim > 0.85:
                current_cluster.append(j)
                visited.add(j)

        clusters.append(current_cluster)

    clustered_top_issues = []
    for cluster in clusters:
        # Get the shortest issue string as the representative name
        cluster_issues = [unique_issues[idx] for idx in cluster]
        cluster_issues.sort(key=len)
        representative_name = cluster_issues[0]

        total_count = sum(issue_counter[iss] for iss in cluster_issues)

        # Use description of the representative if available, otherwise combine
        desc = issue_descriptions.get(representative_name, "")
        if not desc:
            for iss in cluster_issues:
                if issue_descriptions.get(iss):
                    desc = issue_descriptions.get(iss)
                    break

        clustered_top_issues.append({
            "issue": representative_name,
            "description": desc,
            "count": total_count
        })

    clustered_top_issues.sort(key=lambda x: x["count"], reverse=True)

    return {
        "total_files": len(file_results),
        "total_unique_issues": len(clusters),
        "top_issues": clustered_top_issues
    }

def calculate_repo_score(report):
    score = 100

    weights = {
        "Security Vulnerability": 10,
        "Null Reference": 8,
        "Memory Leak": 9,
        "Magic Number": 3,
        "Unused Variable": 2,
        "Unused Function": 3,
        "Code Smell": 2,
        "Inconsistent Naming Convention": 2,
        "Missing Error Handling": 6
    }

    issues = report.get("top_issues", [])

    for issue in issues:
        issue_name = issue["issue"]
        count = issue.get("count", 1)

        penalty = weights.get(issue_name, 4)  # default weight
        score -= penalty * count

    score = max(0, min(100, score))

    # grading
    if score >= 85:
        grade = "A"
    elif score >= 70:
        grade = "B"
    elif score >= 50:
        grade = "C"
    else:
        grade = "D"

    return {
        "repo_score": score,
        "grade": grade,
        "verdict": get_verdict(score)
    }


def get_verdict(score):
    if score >= 85:
        return "High quality code"
    elif score >= 70:
        return "Good but can be improved"
    elif score >= 50:
        return "Moderate issues present"
    else:
        return "Poor quality, needs major fixes"