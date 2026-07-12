#!/usr/bin/env python3
"""Migrate Supabase env vars on Vercel.

Usage:
  export VERCEL_TOKEN=...
  export VERCEL_TEAM_ID=...
  export VERCEL_PROJECT_ID=...
  export NEW_PROJECT_REF=...
  export NEW_ANON_KEY=...
  export NEW_SERVICE_ROLE=...
  export DB_PASSWORD=...
  python3 scripts/migrate_supabase.py
"""
import os
import json
import urllib.request
import urllib.error

VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN", "")
TEAM_ID = os.environ.get("VERCEL_TEAM_ID", "")
PROJECT_ID = os.environ.get("VERCEL_PROJECT_ID", "")
PROJECT_REF = os.environ.get("NEW_PROJECT_REF", "")
ANON_KEY = os.environ.get("NEW_ANON_KEY", "")
SERVICE_ROLE = os.environ.get("NEW_SERVICE_ROLE", "")
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
    env_updates = {
        "NEXT_PUBLIC_SUPABASE_URL": f"https://{PROJECT_REF}.supabase.co",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY": ANON_KEY,
        "SUPABASE_SERVICE_ROLE_KEY": SERVICE_ROLE,
        "DATABASE_URL": f"postgresql://postgres.{PROJECT_REF}:{PW}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1",
        "DIRECT_URL": f"postgresql://postgres.{PROJECT_REF}:{PW}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
    }
    
    envs = api("GET", f"/v9/projects/{PROJECT_ID}/env?teamId={TEAM_ID}").get("envs", [])
    for env in envs:
        if env.get("key") in env_updates:
            api("DELETE", f"/v9/projects/{PROJECT_ID}/env/{env['id']}?teamId={TEAM_ID}")
    
    for key, value in env_updates.items():
        api("POST", f"/v10/projects/{PROJECT_ID}/env?teamId={TEAM_ID}", {
            "key": key, "value": value, "type": "encrypted",
            "target": ["production", "preview", "development"]
        })
        print(f"  ✓ {key}")

if __name__ == "__main__":
    import urllib.parse
    main()
