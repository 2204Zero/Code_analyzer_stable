import requests
import json
import time
import sys
import uuid

BASE_URL = "http://localhost:8000/api/v1"

def print_step(msg):
    print(f"\n[STEP] {msg}")

def print_success(msg):
    print(f"  [+] SUCCESS: {msg}")

def print_error(msg):
    print(f"  [!] ERROR: {msg}")

def main():
    print("=" * 60)
    print("STARTING VERTEX.AI FULL PRODUCTION E2E TEST")
    print("=" * 60)

    # Setup unique user
    username = f"test_{uuid.uuid4().hex[:6]}@example.com"
    password = "password123"

    try:
        requests.post(f"{BASE_URL}/register", json={"email": username, "password": password})
    except Exception as e:
        print_error(f"Failed to reach API: {e}")
        sys.exit(1)

    print_step("Security & Rate Limiting (Phase 5)")
    # 1. Authenticate to retrieve a JWT token.
    login_resp = requests.post(f"{BASE_URL}/login", json={"email": username, "password": password})
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print_success("Authenticated and retrieved JWT token.")

    # 2. Rapid-fire 6 POST requests to /api/v1/analyze-repo.
    repo_url = "https://github.com/pallets/flask"
    
    last_status = None
    repo_id = None
    for i in range(10):
        resp = requests.post(f"{BASE_URL}/analyze-repo", json={"repo_url": repo_url}, headers=headers)
        if i == 0 and resp.status_code == 200:
            repo_id = resp.json()["repo_id"]
        last_status = resp.status_code
        if last_status == 429:
            break
        time.sleep(0.1)

    # 3. Assert that the Rate Limiter intercepts the spam and returns an HTTP 429
    try:
        assert last_status == 429, f"Expected 429 Too Many Requests, got {last_status}"
        print_success("Rate Limiter intercepted spam (HTTP 429).")
    except AssertionError as e:
        print_error(f"Rate Limiting Test Failed: {e}")
        
    assert repo_id is not None, "Failed to extract repo_id from first request"
    print_success(f"Extracted repo_id: {repo_id}")

    print_step("ARQ Queues & Observability (Phases 1 & 8)")
    print("  Polling /api/v1/repo/{repo_id} every 3 seconds... (Watch terminal for structlog trace_ids)")
    
    # 1. Poll the /api/v1/repo/{repo_id} endpoint every 3 seconds.
    completed = False
    final_payload = None
    for _ in range(120): # Max 6 minutes
        resp = requests.get(f"{BASE_URL}/repo/{repo_id}", headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            if data["status"] == "completed":
                completed = True
                final_payload = data
                break
            elif data["status"] == "failed":
                print_error("Repository analysis failed.")
                sys.exit(1)
        time.sleep(3)
    
    assert completed, "Timeout waiting for ARQ job to complete."
    print_success("ARQ worker completed processing the job.")

    print_step("Core AI & Differentiators (Phases 2, 7, 14, 15)")
    report = final_payload.get("report", {})
    # 1. Multi-Agent Reflection: issues array is populated
    issues = report.get("top_issues", [])
    if len(issues) == 0:
        print_error(f"DEBUG FINAL PAYLOAD: {json.dumps(final_payload, indent=2)}")
    try:
        assert len(issues) > 0, "No issues were returned in the final payload."
        print_success("Multi-Agent Reflection populated the issues array.")

        # 2. Auto-Healer: git_patch exists and is valid
        first_issue = issues[0]
        git_patch = first_issue.get("issue", {}).get("git_patch") if isinstance(first_issue.get("issue"), dict) else first_issue.get("git_patch")
        assert git_patch is not None, "git_patch is missing from the issue."
        assert "--- a/" in git_patch or "+++" in git_patch or "diff" in git_patch, "git_patch does not look like a unified diff."
        print_success("Auto-Healer attached valid Git Unified Diff to the issue.")
        print("\n--- SAMPLE PATCH ---")
        print(str(git_patch)[:300] + "...\n")
    except AssertionError as e:
        print_error(f"Multi-Agent Reflection Test Failed: {e}")

    try:
        # 3. Big-O Profiler: performance_profile exists
        performance = final_payload.get("performance_profile", {})
        assert performance and "overall_repo_complexity" in performance, "performance_profile is missing overall_repo_complexity."
        print_success(f"Big-O Profiler ran. Overall Complexity: {performance['overall_repo_complexity']}")
    except AssertionError as e:
        print_error(f"Big-O Profiler Test Failed: {e}")

    print_step("3D Architecture Engine (Phases 9-12)")
    # 1. Send GET request
    arch_resp = requests.get(f"{BASE_URL}/repo/{repo_id}/architecture", headers=headers)
    
    try:
        # 2. Assert 200 OK
        assert arch_resp.status_code == 200, f"Architecture endpoint failed: {arch_resp.status_code}"
        
        # 3. Assert nodes and edges
        arch_data = arch_resp.json()
        assert "nodes" in arch_data and "edges" in arch_data, "Architecture graph missing nodes/edges."
        print_success(f"Architecture Engine returned 200 OK with {len(arch_data['nodes'])} nodes and {len(arch_data['edges'])} edges.")
        
        # 4. Check semantic_summary
        if arch_data["nodes"]:
            first_node = arch_data["nodes"][0]
            summary = first_node.get("semantic_summary")
            assert summary is not None and summary != "", "semantic_summary is missing or empty."
            print_success(f"Semantic Node Enrichment successful. Example summary: '{summary}'")
        else:
            print_error("No nodes returned in Architecture Graph.")
    except AssertionError as e:
        print_error(f"3D Architecture Test Failed: {e}")

    print_step("Advanced RAG & SSE Streaming (Phases 3 & 4)")
    try:
        # 1. Send POST request with stream=True
        ask_resp = requests.post(
            f"{BASE_URL}/ask-repo", 
            json={"repo_id": repo_id, "question": "What does this repo do?", "mode": "chat"}, 
            headers=headers, 
            stream=True
        )
        assert ask_resp.status_code == 200, "ask-repo failed"
        
        found_metadata = False
        found_text = False
        
        for line in ask_resp.iter_lines():
            if line:
                decoded = line.decode('utf-8')
                if decoded.startswith("data: "):
                    data_str = decoded[6:]
                    if data_str == "[DONE]":
                        break
                    try:
                        payload = json.loads(data_str)
                        if payload.get("type") == "metadata":
                            found_metadata = True
                            assert "chunks_used" in payload, "metadata missing chunks_used"
                            print_success(f"Received RAG metadata! Chunks used: {payload['chunks_used']}")
                        elif payload.get("type") == "text":
                            found_text = True
                    except json.JSONDecodeError:
                        pass

        assert found_metadata, "Failed to find metadata in SSE stream"
        assert found_text, "Failed to find text deltas in SSE stream"
        print_success("SSE Streaming returned both RAG metadata and text deltas.")
    except AssertionError as e:
        print_error(f"SSE Streaming Test Failed: {e}")

    print("\n" + "=" * 60)
    print("PRODUCTION INTEGRATION TESTS COMPLETE")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
