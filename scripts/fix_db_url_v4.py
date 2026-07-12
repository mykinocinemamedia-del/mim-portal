import os
#!/usr/bin/env python3
"""Update DATABASE_URL - try port 5432 on pooler (direct mode)."""
import json
import urllib.request
import urllib.error

VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN", "")
TEAM_ID = os.environ.get("VERCEL_TEAM_ID", "")
PROJECT_ID = os.environ.get("VERCEL_PROJECT_ID", "")

# Try port 5432 on pooler (Supavisor direct/session mode)
NEW_DATABASE_URL = "postgresql://postgres.tgikwdngogwzpmbttjoc:EmreEmeel1311%23%23%23@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
NEW_DIRECT_URL = "postgresql://postgres.tgikwdngogwzpmbttjoc:EmreEmeel1311%23%23%23@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

def get_env_vars():
    url = f"https://api.vercel.com/v9/projects/{PROJECT_ID}/env?teamId={TEAM_ID}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {VERCEL_TOKEN}"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def delete_env_var(env_id, key):
    url = f"https://api.vercel.com/v9/projects/{PROJECT_ID}/env/{env_id}?teamId={TEAM_ID}"
    req = urllib.request.Request(url, method="DELETE", headers={"Authorization": f"Bearer {VERCEL_TOKEN}"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return True
    except:
        return False

def create_env_var(key, value, targets=None):
    if targets is None:
        targets = ["production", "preview", "development"]
    url = f"https://api.vercel.com/v10/projects/{PROJECT_ID}/env?teamId={TEAM_ID}"
    data = json.dumps({"key": key, "value": value, "type": "encrypted", "target": targets}).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST", headers={
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return True
    except urllib.error.HTTPError as e:
        print(f"  Create {key} failed: {e.read().decode()[:200]}")
        return False

def main():
    env_data = get_env_vars()
    envs = env_data.get("envs", [])
    for env in envs:
        if env.get("key") in ("DATABASE_URL", "DIRECT_URL"):
            delete_env_var(env.get("id"), env.get("key"))
    print("Creating new DATABASE_URL (pooler port 5432)...")
    create_env_var("DATABASE_URL", NEW_DATABASE_URL)
    create_env_var("DIRECT_URL", NEW_DIRECT_URL)
    print("✅ Done!")

if __name__ == "__main__":
    main()
