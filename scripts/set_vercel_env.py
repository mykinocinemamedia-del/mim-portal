#!/usr/bin/env python3
"""Set all environment variables for the MIM Portal Vercel project.

Reads all secrets from a local .env file or environment variables.
No secrets are hardcoded in this file.

Usage:
  Set env vars first:
    export VERCEL_TOKEN=...
    export VERCEL_TEAM_ID=...
    export VERCEL_PROJECT_ID=...
    # And all the MIM_* env vars from .env
  
  Then run:
    python3 scripts/set_vercel_env.py
"""
import os
import json
import urllib.request
import urllib.error
import sys
from pathlib import Path

VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN", "")
TEAM_ID = os.environ.get("VERCEL_TEAM_ID", "")
PROJECT_ID = os.environ.get("VERCEL_PROJECT_ID", "")

# Load .env file if exists (for local runs)
env_file = Path(__file__).parent.parent / ".env"
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k and k not in os.environ:
                    os.environ[k] = v

# All env vars needed for production (read from environment)
ENV_VARS = {
    # Database (Supabase)
    "DATABASE_URL": os.environ.get("DATABASE_URL", ""),
    "DIRECT_URL": os.environ.get("DIRECT_URL", ""),
    
    # Supabase Client SDK
    "NEXT_PUBLIC_SUPABASE_URL": os.environ.get("NEXT_PUBLIC_SUPABASE_URL", ""),
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""),
    "SUPABASE_SERVICE_ROLE_KEY": os.environ.get("SUPABASE_SERVICE_ROLE_KEY", ""),
    
    # AI Providers
    "GROQ_API_KEY": os.environ.get("GROQ_API_KEY", ""),
    "GROQ_MODEL": os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile"),
    "GEMINI_API_KEY": os.environ.get("GEMINI_API_KEY", ""),
    "GEMINI_MODEL": os.environ.get("GEMINI_MODEL", "gemini-2.0-flash"),
    
    # Company Info
    "NEXT_PUBLIC_COMPANY_NAME": os.environ.get("NEXT_PUBLIC_COMPANY_NAME", "Kino Studios Sdn. Bhd."),
    "NEXT_PUBLIC_BRAND": os.environ.get("NEXT_PUBLIC_BRAND", "KinoCinema Media"),
    "NEXT_PUBLIC_COMPANY_EMAIL": os.environ.get("NEXT_PUBLIC_COMPANY_EMAIL", "hello@kino.my"),
    "NEXT_PUBLIC_COMPANY_PHONE": os.environ.get("NEXT_PUBLIC_COMPANY_PHONE", "+60176635990"),
    "NEXT_PUBLIC_COMPANY_WEBSITE": os.environ.get("NEXT_PUBLIC_COMPANY_WEBSITE", "www.kino.my"),
    "NEXT_PUBLIC_COMPANY_ADDRESS": os.environ.get("NEXT_PUBLIC_COMPANY_ADDRESS", "Ampang Jaya, Selangor Darul Ehsan, Malaysia"),
    "NEXT_PUBLIC_COMPANY_SSM": os.environ.get("NEXT_PUBLIC_COMPANY_SSM", "002138666-M"),
    "NEXT_PUBLIC_SIGNATORY": os.environ.get("NEXT_PUBLIC_SIGNATORY", "Mahadzir Hanafiah"),
    "NEXT_PUBLIC_WHATSAPP": os.environ.get("NEXT_PUBLIC_WHATSAPP", "60176635990"),
    "NEXT_PUBLIC_SITE_URL": os.environ.get("NEXT_PUBLIC_SITE_URL", "https://mim-portal.vercel.app"),
    
    # JWT Secret - generate a strong random one in production
    "JWT_SECRET": os.environ.get("JWT_SECRET", "change-me-in-production"),
}

def set_env_var(key, value, targets=None):
    if targets is None:
        targets = ["production", "preview", "development"]
    if not value:
        return 0, "empty value, skipped"
    url = f"https://api.vercel.com/v10/projects/{PROJECT_ID}/env?teamId={TEAM_ID}"
    data = {
        "key": key,
        "value": value,
        "type": "encrypted",
        "target": targets,
    }
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url, data=body, method="POST",
        headers={
            "Authorization": f"Bearer {VERCEL_TOKEN}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, ""
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        if "already" in body.lower() or e.code == 409:
            return 200, "already exists"
        return e.code, body
    except Exception as e:
        return 0, str(e)

def main():
    if not VERCEL_TOKEN or not TEAM_ID or not PROJECT_ID:
        print("ERROR: VERCEL_TOKEN, VERCEL_TEAM_ID, and VERCEL_PROJECT_ID env vars required")
        sys.exit(1)
    
    print(f"Setting {len(ENV_VARS)} env vars on Vercel project {PROJECT_ID}...")
    success = 0
    failed = 0
    for key, value in ENV_VARS.items():
        status, err = set_env_var(key, value)
        if status in (200, 201):
            success += 1
            print(f"  OK {key}")
        else:
            failed += 1
            print(f"  FAIL {key}: {err[:100]}")
    print(f"\nDone. Success: {success}, Failed: {failed}")

if __name__ == "__main__":
    main()
