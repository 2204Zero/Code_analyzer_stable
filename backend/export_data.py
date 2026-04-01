import requests
import json

URL = "http://127.0.0.1:8000/export/jobs"

def export_jobs_to_file():
    response = requests.get(URL)
    data = response.json()

    with open("jobs_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Jobs exported to jobs_data.json")

if __name__ == "__main__":
    export_jobs_to_file()