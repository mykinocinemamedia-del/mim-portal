#!/usr/bin/env python3
"""Import extracted maids into Supabase database."""
import json
import pg8000
import re
import sys

NEW_PROJECT_REF = "alvrflracsiloizzjbip"
DB_PASSWORD = "EmreEmeel1311###"

def clean_name(name):
    """Remove prefixes and clean up name."""
    # Remove common prefixes from interleaved data
    prefixes = ['kerja', 'call', 'xangkat', 'voicemail', 'DMasih', 'dalam', 'perbincangan',
                'Sudah', 'Belum', 'Ya', 'Tidak', 'T', 'm', 'e', 's', 't', 'a', 'p', 'i',
                'Masih', 'dalam', 'perbincangan', 'Remark', 'SF']
    
    # Split and filter
    parts = name.split()
    while parts and parts[0] in prefixes:
        parts.pop(0)
    
    name = ' '.join(parts)
    
    # If name has duplicate (e.g., "ELIYANA RIZKI BINTI ABDULLAHELIYANA RIZKI BINTI ABDULLAH")
    # try to find the duplicate pattern
    if len(name) > 20:
        half = len(name) // 2
        first_half = name[:half].strip()
        second_half = name[half:].strip()
        if first_half in second_half or second_half in first_half:
            name = first_half if len(first_half) > len(second_half) else second_half
    
    # Remove all caps duplicate (e.g., "Puteri najiha binti azarPUTERI NAJIHA BINTI AZAR")
    # Find where the caps version starts
    caps_match = re.search(r'(?<=[a-z])[A-Z]{3,}', name)
    if caps_match:
        name = name[:caps_match.start()].strip()
    
    # Title case
    if name.isupper():
        name = name.title()
    
    return name.strip()

def main():
    with open('/home/z/my-project/scripts/extracted_maids.json', 'r', encoding='utf-8') as f:
        maids = json.load(f)
    
    print(f"Loading {len(maids)} maids...")
    
    # Clean names
    for m in maids:
        m['fullName'] = clean_name(m['fullName'])
        # Skip if name too short
        if len(m['fullName']) < 5:
            m['fullName'] = f"Pembantu {m['phone'][-4:]}"
    
    # Connect to database
    print("Connecting to Supabase...")
    conn = pg8000.connect(
        host="aws-0-ap-southeast-1.pooler.supabase.com",
        port=6543,
        user=f"postgres.{NEW_PROJECT_REF}",
        password=DB_PASSWORD,
        database="postgres",
        timeout=30,
    )
    cursor = conn.cursor()
    
    # Import in batches
    success = 0
    failed = 0
    
    for i, m in enumerate(maids):
        try:
            # Check if email already exists
            cursor.execute("SELECT id FROM mim_helpers WHERE email = %s", (m['email'],))
            existing = cursor.fetchone()
            if existing:
                success += 1
                continue
            
            skills_str = json.dumps(m['skills']) if m['skills'] else None
            
            cursor.execute("""
                INSERT INTO mim_helpers (
                    full_name, nickname, phone, email, password, ic, age,
                    religion, marital_status, service_type, desired_job,
                    skills, live_in, back_and_forth, can_both,
                    status, rating, state, city, is_first_login
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s, %s, false
                )
            """, (
                m['fullName'],
                m.get('nickname', m['fullName'].split()[0] if m['fullName'] else 'Unknown'),
                m.get('phone', ''),
                m['email'],
                m.get('password', 'Demo@1234'),
                m.get('ic'),
                m.get('age'),
                m.get('religion', 'Islam'),
                m.get('maritalStatus', 'Bujang'),
                m.get('serviceType', 'maid'),
                m.get('desiredJob', 'maid'),
                skills_str,
                m.get('liveIn', True),
                m.get('backAndForth', False),
                m.get('canBoth', False),
                'active',
                5.0,
                m.get('state', 'Kuala Lumpur'),
                m.get('city', 'Kuala Lumpur'),
            ))
            conn.commit()
            success += 1
            
            if (i + 1) % 50 == 0:
                print(f"  Imported {i+1}/{len(maids)}...")
        except Exception as e:
            conn.rollback()
            failed += 1
            if failed <= 5:
                print(f"  Failed: {m['fullName']} - {str(e)[:100]}")
    
    cursor.close()
    conn.close()
    
    print(f"\nDone! Success: {success}, Failed: {failed}")
    
    # Verify count
    conn = pg8000.connect(
        host="aws-0-ap-southeast-1.pooler.supabase.com",
        port=6543,
        user=f"postgres.{NEW_PROJECT_REF}",
        password=DB_PASSWORD,
        database="postgres",
        timeout=15,
    )
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) FROM mim_helpers WHERE status = 'active';")
    count = cursor.fetchone()[0]
    print(f"Total active helpers in database: {count}")
    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()
