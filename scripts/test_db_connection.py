#!/usr/bin/env python3
"""Test PostgreSQL connections to Supabase and create tables."""
import pg8000
import sys

NEW_PROJECT_REF = "alvrflracsiloizzjbip"
DB_PASSWORD = "EmreEmeel1311###"

connections = [
    {
        "name": "Direct (db.X.supabase.co:5432)",
        "host": f"db.{NEW_PROJECT_REF}.supabase.co",
        "port": 5432,
        "user": "postgres",
    },
    {
        "name": "Pooler Session (aws-0-ap-southeast-1:6543)",
        "host": "aws-0-ap-southeast-1.pooler.supabase.com",
        "port": 6543,
        "user": f"postgres.{NEW_PROJECT_REF}",
    },
    {
        "name": "Pooler Transaction (aws-0-ap-southeast-1:5432)",
        "host": "aws-0-ap-southeast-1.pooler.supabase.com",
        "port": 5432,
        "user": f"postgres.{NEW_PROJECT_REF}",
    },
]

working_conn = None
for cfg in connections:
    print(f"\nTesting: {cfg['name']}")
    try:
        conn = pg8000.connect(
            host=cfg["host"],
            port=cfg["port"],
            user=cfg["user"],
            password=DB_PASSWORD,
            database="postgres",
            timeout=15,
        )
        cursor = conn.cursor()
        cursor.execute("SELECT current_database(), current_user;")
        row = cursor.fetchone()
        print(f"  ✓ Connected! DB: {row[0]}, User: {row[1]}")
        cursor.close()
        if working_conn is None:
            working_conn = conn
        else:
            conn.close()
        break
    except Exception as e:
        print(f"  ✗ Failed: {str(e)[:200]}")

if working_conn:
    print(f"\n{'='*60}")
    print("SUCCESS! Connection established.")
    print(f"{'='*60}")
    working_conn.close()
    sys.exit(0)
else:
    print(f"\n{'='*60}")
    print("ALL CONNECTIONS FAILED")
    print(f"{'='*60}")
    sys.exit(1)
