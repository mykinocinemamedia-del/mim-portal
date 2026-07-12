#!/usr/bin/env python3
"""Extract maid data from PAPAN DATA MIM PDF using PyPDF2 (memory efficient)."""
from PyPDF2 import PdfReader
import re
import json

PDF_PATH = "/home/z/my-project/upload/PAPAN DATA MIM V1.pdf"

def extract_maids():
    reader = PdfReader(PDF_PATH)
    maids = []
    seen_phones = set()
    
    for page_idx in range(len(reader.pages)):
        text = reader.pages[page_idx].extract_text()
        if not text:
            continue
        
        # The text has interleaved data. Let's look for patterns.
        # Pattern: Name with binti/bin followed by phone number and age
        
        # Find all name+phone+age+ic patterns
        # Names: something binti/bin something
        name_pattern = r'([A-Z][a-z]+(?:\s+\w+){0,4}\s+(?:binti|bin)\s+\w+(?:\s+\w+)*)'
        
        # Find all occurrences
        names = re.finditer(name_pattern, text, re.IGNORECASE)
        
        for nm in names:
            name = nm.group(1).strip()
            # Skip if it's a header or too short
            if len(name) < 5 or name.startswith('Sudah') or name.startswith('Belum'):
                continue
            
            # Look for phone number near this name (within 200 chars after)
            after_text = text[nm.end():nm.end()+200]
            # Clean up the text
            after_clean = after_text.replace(' ', '').replace('\n', '')
            phone_match = re.search(r'(01\d{8,9})', after_clean)
            
            if not phone_match:
                continue
            
            phone = phone_match.group(1)
            # Normalize phone (remove extra digit if 11 digits starting with 01)
            if len(phone) == 11 and phone.startswith('01'):
                phone = phone[:10]
            
            if phone in seen_phones:
                continue
            seen_phones.add(phone)
            
            # Find age (2 digit number after phone)
            age = None
            age_match = re.search(phone + r'(\d{2})', after_clean)
            if age_match:
                age = int(age_match.group(1))
                if age < 18 or age > 70:
                    age = None
            
            # Find IC (12 digits)
            ic = None
            ic_match = re.search(r'(\d{12})', after_clean)
            if ic_match:
                ic = ic_match.group(1)
            
            # Determine marital status
            status = 'Bujang'
            context = text[max(0, nm.start()-100):nm.end()+300]
            if 'Sudah Berkahwin' in context or 'Berkahwin' in context:
                status = 'Berkahwin'
            elif 'Janda' in context or 'Duda' in context:
                status = 'Janda/Duda'
            
            # Determine service type from skills mentioned
            service_type = 'maid'  # default
            skills = []
            context_lower = context.lower()
            if 'menjaga bayi' in context_lower or 'pengasuh' in context_lower:
                skills.append('baby_care')
            if 'menjaga kanak' in context_lower:
                skills.append('child_care')
            if 'memasak' in context_lower:
                skills.append('cooking')
            if 'membersihkan rumah' in context_lower or 'mencuci' in context_lower:
                skills.append('cleaning')
            if 'menggosok' in context_lower:
                skills.append('washing')
            if 'penjaga orang tua' in context_lower or 'orang tua' in context_lower:
                service_type = 'caregiver'
            if 'pengasuh' in context_lower and 'bayi' in context_lower:
                service_type = 'babysitter'
            
            if not skills:
                skills = ['cleaning', 'cooking']
            
            # Find live-in preference
            live_in = False
            back_and_forth = False
            if 'live-in' in context_lower or 'live in' in context_lower or 'duduk bersama' in context_lower:
                live_in = True
            if 'back & forth' in context_lower or 'balik hari' in context_lower:
                back_and_forth = True
            if not live_in and not back_and_forth:
                live_in = True  # default
            
            # Find religion
            religion = 'Islam'  # default for Malaysia
            if 'kristian' in context_lower or 'christian' in context_lower:
                religion = 'Kristian'
            elif 'hindu' in context_lower:
                religion = 'Hindu'
            elif 'buddha' in context_lower or 'buddhist' in context_lower:
                religion = 'Buddha'
            
            # Generate email and password
            clean_name = re.sub(r'[^a-zA-Z]', '', name.lower())[:12]
            email = f"{clean_name}@mim.com.my"
            password = f"Demo@1234"
            
            maid = {
                'fullName': name,
                'nickname': name.split()[0],
                'phone': '+6' + phone if not phone.startswith('+') else phone,
                'email': email,
                'password': password,
                'ic': ic,
                'age': age,
                'religion': religion,
                'maritalStatus': status,
                'serviceType': service_type,
                'desiredJob': service_type,
                'skills': skills,
                'liveIn': live_in,
                'backAndForth': back_and_forth,
                'canBoth': not live_in and not back_and_forth,
                'status': 'active',
                'rating': 5.0,
                'state': 'Kuala Lumpur',  # default
                'city': 'Kuala Lumpur',
            }
            maids.append(maid)
    
    return maids

def main():
    print("Extracting maids from PDF (88 pages)...")
    maids = extract_maids()
    print(f"Found {len(maids)} unique maids")
    
    for i, m in enumerate(maids[:5]):
        print(f"\n{i+1}. {m['fullName']}")
        print(f"   Phone: {m['phone']}")
        print(f"   Age: {m['age']}")
        print(f"   Service: {m['serviceType']}")
        print(f"   Skills: {m['skills']}")
    
    with open('/home/z/my-project/scripts/extracted_maids.json', 'w', encoding='utf-8') as f:
        json.dump(maids, f, indent=2, ensure_ascii=False)
    print(f"\nSaved {len(maids)} maids to scripts/extracted_maids.json")

if __name__ == '__main__':
    main()
