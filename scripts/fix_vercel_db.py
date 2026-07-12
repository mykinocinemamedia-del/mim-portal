#!/usr/bin/env python3
"""Fix DATABASE_URL on Vercel to use pooler connection.

Usage:
  export VERCEL_TOKEN=...
  export VERCEL_TEAM_ID=...
  export VERCEL_PROJECT_ID=...
  export NEW_PROJECT_REF=...
  export DB_PASSWORD=...
  python3 scripts/fix_vercel_db.py
"""
import os
import json
import urllib.request
import urllib.error

VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN", "")
TEAM_ID = os.environ.get("VERCEL_TEAM_ID", "")
PROJECT_ID = os.environ.get("VERCEL_PROJECT_ID", "")
PROJECT_REF = os.environ.get("NEW_PROJECT_REF", "")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")

def api(method, path, data=None):
    url = f"https://api.vercel.com{path}"
    headers = {"Authorization": f"Bearer {VERCEL_TOKEN}", "Content-Type": "application/json"}
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"  Error: {e.read().decode()[:200]}")
        return None

def main():
    PW = urllib.parse.quote(DB_PASSWORD, safe='')
    POOLER_HOST = "aws-0-ap-southeast-1.pooler.supabase.com"
    
    db_url = f"postgresql://postgres.{PROJECT_REF}:{PW}@{POOLER_HOST}:6543/postgres?pgbouncer=true&connection_limit=1"
    direct_url = f"postgresql://postgres.{PROJECT_REF}:{PW}@{POOLER_HOST}:5432/postgres"
    
    envs = api("GET", f"/v9/projects/{PROJECT_ID}/env?teamId={TEAM_ID}").get("envs", [])
    for env in envs:
        if env.get("key") in ("DATABASE_URL", "DIRECT_URL"):
            api("DELETE", f"/v9/projects/{PROJECT_ID}/env/{env['id']}?teamId={TEAM_ID}")
    
    for key, value in [("DATABASE_URL", db_url), ("DIRECT_URL", direct_url)]:
        api("POST", f"/v10/projects/{PROJECT_ID}/env?teamId={TEAM_ID}", {
            "key": key, "value": value, "type": "encrypted",
            "target": ["production", "preview", "development"]
        })
        print(f"  ✓ {key}")

if __name__ == "__main__":
    import urllib.parse
    main()
