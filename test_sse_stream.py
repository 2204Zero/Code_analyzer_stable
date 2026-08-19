import requests
import json
import time
import sys

BASE_URL = "http://127.0.0.1:8000"

LOGIN_URL = f"{BASE_URL}/api/v1/login"
REGISTER_URL = f"{BASE_URL}/api/v1/register"
ANALYZE_URL = f"{BASE_URL}/api/v1/analyze-repo"
ASK_URL = f"{BASE_URL}/api/v1/ask-repo"

EMAIL = "arq-test@example.com"
PASSWORD = "password123"

def main():
    print("--- 1. Authenticating ---")
    session = requests.Session()
    login_data = {"email": EMAIL, "password": PASSWORD}
    
    # Try register
    reg_res = session.post(REGISTER_URL, json=login_data)
    if reg_res.status_code not in (200, 201, 400):
        print(f"Register returned unexpected status: {reg_res.status_code} - {reg_res.text}")
    
    res = session.post(LOGIN_URL, json=login_data)
    if res.status_code != 200:
        # try without /api/v1 just in case
        LOGIN_URL_2 = f"{BASE_URL}/login"
        res = session.post(LOGIN_URL_2, json=login_data)
        if res.status_code != 200:
            print("Failed to authenticate.")
            print(res.text)
            sys.exit(1)
        else:
            global ANALYZE_URL, ASK_URL
            ANALYZE_URL = f"{BASE_URL}/analyze-repo"
            ASK_URL = f"{BASE_URL}/ask-repo"

    token = res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    print("--- 2. Getting Repo ID ---")
    res = session.post(ANALYZE_URL, json={"repo_url": "https://github.com/octocat/Hello-World"}, headers=headers)
    if res.status_code != 200:
        print("Failed to analyze repo.")
        print(res.text)
        sys.exit(1)
        
    repo_id = res.json().get("repo_id")
    print(f"Repo ID: {repo_id}")
    
    print("--- 3. Waiting for embeddings ---")
    time.sleep(3)
    
    print("--- 4. Testing the Stream ---")
    res = session.post(ASK_URL, json={"repo_id": repo_id, "question": "What does this repo do?", "mode": "chat"}, headers=headers, stream=True)
    
    if res.status_code != 200:
        print("Failed to start stream.")
        print(res.text)
        sys.exit(1)
        
    print("Stream connected. Reading lines...")
    
    metadata_received = False
    done_received = False
    
    for line in res.iter_lines():
        if line:
            decoded = line.decode('utf-8')
            if decoded.startswith('data: '):
                payload = decoded[6:]
                if payload == '[DONE]':
                    done_received = True
                    print("\n[DONE] signal received.")
                    break
                else:
                    try:
                        data = json.loads(payload)
                        if not metadata_received:
                            assert data.get('type') == 'metadata', "First packet must be metadata"
                            assert 'context_preview' in data, "Must contain context_preview"
                            assert 'chunks_used' in data, "Must contain chunks_used"
                            metadata_received = True
                            print("Metadata received correctly.")
                        elif data.get('type') == 'text':
                            print(data.get('delta', ''), end='', flush=True)
                        else:
                            print(f"\nUnexpected packet type: {data.get('type')}")
                    except json.JSONDecodeError:
                        print(f"\nFailed to parse JSON: {payload}")
            else:
                print(f"Unexpected line format: {decoded}")

    if not done_received:
        print("\nTest Failed: [DONE] signal not received.")
        sys.exit(1)
        
    print("\n--- Test Completed Successfully ---")

if __name__ == "__main__":
    main()
