#!/usr/bin/env python3
"""Create all MIM Portal tables in Supabase project via direct PostgreSQL connection.

Usage:
  export SUPABASE_PROJECT_REF=alvrflracsiloizzjbip
  export SUPABASE_DB_PASSWORD=your_password
  python3 scripts/create_tables.py
"""
import pg8000
import sys
import os
from pathlib import Path

PROJECT_REF = os.environ.get("SUPABASE_PROJECT_REF", "")
DB_PASSWORD = os.environ.get("SUPABASE_DB_PASSWORD", "")
SQL_FILE = Path(__file__).parent / "supabase_schema.sql"

def main():
    if not PROJECT_REF or not DB_PASSWORD:
        print("ERROR: Set SUPABASE_PROJECT_REF and SUPABASE_DB_PASSWORD env vars")
        sys.exit(1)

    print("=" * 60)
    print(f" Creating MIM Portal Tables in Supabase: {PROJECT_REF}")
    print("=" * 60)

    sql_content = SQL_FILE.read_text()
    print(f"Read SQL file: {len(sql_content)} chars")

    print("\nConnecting via pooler (port 6543)...")
    try:
        conn = pg8000.connect(
            host="aws-0-ap-southeast-1.pooler.supabase.com",
            port=6543,
            user=f"postgres.{PROJECT_REF}",
            password=DB_PASSWORD,
            database="postgres",
            timeout=30,
        )
        print("✓ Connected!")
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        sys.exit(1)

    statements = []
    for stmt in sql_content.split(";"):
        lines = [l for l in stmt.split("\n") if not l.strip().startswith("--")]
        cleaned = "\n".join(lines).strip()
        if cleaned:
            statements.append(cleaned)

    print(f"\nTotal SQL statements: {len(statements)}")

    cursor = conn.cursor()
    success = 0
    failed = 0
    for i, stmt in enumerate(statements, 1):
        parts = stmt.split()
        first_word = parts[0].upper() if parts else "UNKNOWN"
        obj_name = parts[2] if len(parts) > 2 else ""
        try:
            cursor.execute(stmt)
            conn.commit()
            success += 1
            print(f"  [{i:02d}] ✓ {first_word} {obj_name}")
        except Exception as e:
            err = str(e)
            if "already exists" in err.lower():
                print(f"  [{i:02d}] ⊙ {first_word} {obj_name} (exists)")
                success += 1
                conn.rollback()
            else:
                failed += 1
                print(f"  [{i:02d}] ✗ {first_word} {obj_name}: {err[:150]}")
                conn.rollback()

    cursor.close()
    conn.close()
    print(f"\n{'='*60}")
    print(f" RESULT: {success} succeeded, {failed} failed")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
