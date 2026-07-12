#!/usr/bin/env python3
"""
Create Supabase tables for MIM Portal via SQL API.
Uses table prefix 'mim_' to avoid conflicts with existing projects.
"""
import os
import json
import urllib.request
import urllib.error
import sys

SUPABASE_URL = "https://api.supabase.com/v1/projects/tgikwdngogwzpmbttjoc/database/query"
SUPABASE_TOKEN = os.environ.get("SUPABASE_PERSONAL_ACCESS_TOKEN", "")

SQL = """
-- ====================================
-- MIM Portal Schema (prefix: mim_)
-- ====================================

-- 1. Helpers (Maids/Employees)
CREATE TABLE IF NOT EXISTS mim_helpers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  nickname TEXT,
  ic TEXT,
  age INT,
  birth_date DATE,
  religion TEXT,
  marital_status TEXT,
  education TEXT,
  phone TEXT,
  family_phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Malaysia',
  residency_state TEXT,
  work_area TEXT,
  can_relocate BOOLEAN DEFAULT FALSE,
  service_type TEXT,
  live_in BOOLEAN DEFAULT FALSE,
  back_and_forth BOOLEAN DEFAULT FALSE,
  can_both BOOLEAN DEFAULT FALSE,
  desired_job TEXT,
  skills TEXT[],
  child_ages TEXT[],
  other_skills TEXT,
  motivation TEXT,
  experience TEXT,
  profile_photo TEXT,
  email TEXT UNIQUE,
  password TEXT,
  is_first_login BOOLEAN DEFAULT TRUE,
  rating FLOAT DEFAULT 5.0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Employers
CREATE TABLE IF NOT EXISTS mim_employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  ic TEXT,
  phone TEXT,
  email TEXT UNIQUE,
  password TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Malaysia',
  service_type TEXT,
  num_kids INT DEFAULT 0,
  kids_ages TEXT,
  salary_offered FLOAT,
  join_date DATE,
  criteria TEXT,
  contract_expiry DATE,
  profile_data JSONB,
  is_first_login BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Admins
CREATE TABLE IF NOT EXISTS mim_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bookings
CREATE TABLE IF NOT EXISTS mim_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES mim_employers(id),
  helper_id UUID NOT NULL REFERENCES mim_helpers(id),
  service_type TEXT,
  salary FLOAT,
  start_date DATE,
  duration_months INT,
  live_in BOOLEAN DEFAULT FALSE,
  special_requests TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Contracts
CREATE TABLE IF NOT EXISTS mim_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES mim_bookings(id),
  contract_type TEXT NOT NULL,
  helper_id UUID REFERENCES mim_helpers(id),
  employer_id UUID REFERENCES mim_employers(id),
  content TEXT,
  pdf_url TEXT,
  signed_helper BOOLEAN DEFAULT FALSE,
  signed_employer BOOLEAN DEFAULT FALSE,
  signed_admin BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Working Schedules
CREATE TABLE IF NOT EXISTS mim_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id UUID NOT NULL REFERENCES mim_helpers(id),
  employer_id UUID REFERENCES mim_employers(id),
  work_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_day_off BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Payments
CREATE TABLE IF NOT EXISTS mim_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES mim_employers(id),
  helper_id UUID REFERENCES mim_helpers(id),
  amount FLOAT NOT NULL,
  due_date DATE,
  paid_date DATE,
  status TEXT DEFAULT 'pending',
  method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Video Courses
CREATE TABLE IF NOT EXISTS mim_video_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail TEXT,
  category TEXT,
  duration_minutes INT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Course Progress
CREATE TABLE IF NOT EXISTS mim_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL,
  course_id UUID NOT NULL REFERENCES mim_video_courses(id),
  watched_percent INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 10. Documents (FAQs, prices, medical, etc.)
CREATE TABLE IF NOT EXISTS mim_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  doc_type TEXT,
  content TEXT,
  file_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Notifications
CREATE TABLE IF NOT EXISTS mim_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Interviews (Google Meet recordings)
CREATE TABLE IF NOT EXISTS mim_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id UUID REFERENCES mim_helpers(id),
  employer_id UUID REFERENCES mim_employers(id),
  meet_url TEXT,
  recording_url TEXT,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Messages (Admin to user)
CREATE TABLE IF NOT EXISTS mim_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_admin BOOLEAN DEFAULT TRUE,
  to_user_id TEXT,
  to_user_type TEXT,
  subject TEXT,
  body TEXT,
  sent_via TEXT DEFAULT 'in_app',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Medical Records (Helpers)
CREATE TABLE IF NOT EXISTS mim_medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id UUID NOT NULL REFERENCES mim_helpers(id),
  record_type TEXT,
  result TEXT,
  file_url TEXT,
  notes TEXT,
  upload_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- Indexes
-- ====================================
CREATE INDEX IF NOT EXISTS idx_helpers_status ON mim_helpers(status);
CREATE INDEX IF NOT EXISTS idx_helpers_service_type ON mim_helpers(service_type);
CREATE INDEX IF NOT EXISTS idx_helpers_state ON mim_helpers(state);
CREATE INDEX IF NOT EXISTS idx_employers_status ON mim_employers(status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON mim_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_employer ON mim_bookings(employer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_helper ON mim_bookings(helper_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON mim_notifications(user_id, is_read);

-- ====================================
-- Enable RLS (Row Level Security) - allow anon for now
-- ====================================
ALTER TABLE mim_helpers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mim_employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mim_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE mim_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mim_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mim_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE mim_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mim_video_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mim_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE mim_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE mim_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mim_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE mim_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mim_medical_records ENABLE ROW LEVEL SECURITY;

-- Allow access to all (since we use service role key in API)
CREATE POLICY "allow_all_helpers" ON mim_helpers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_employers" ON mim_employers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_admins" ON mim_admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_bookings" ON mim_bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_contracts" ON mim_contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_schedules" ON mim_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_payments" ON mim_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_video_courses" ON mim_video_courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_course_progress" ON mim_course_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_documents" ON mim_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_notifications" ON mim_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_interviews" ON mim_interviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_messages" ON mim_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_medical_records" ON mim_medical_records FOR ALL USING (true) WITH CHECK (true);

-- ====================================
-- Seed Admin User (default)
-- ====================================
INSERT INTO mim_admins (email, password, full_name, role)
VALUES ('admin@mim.com', 'admin123', 'MIM Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- ====================================
-- Seed Video Courses (examples)
-- ====================================
INSERT INTO mim_video_courses (title, description, video_url, category, duration_minutes) VALUES
('Pengenalan Kerja Pembantu Rumah', 'Kursus asas untuk pembantu rumah baru', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Maid', 15),
('Penjagaan Bayi & Kanak-kanak', 'Panduan lengkap menjaga bayi dan kanak-kanak', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Babysitter', 25),
('Penjagaan Orang Tua', 'Asas penjagaan warga emas', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Caregiver', 30),
('Kebersihan Diri & Keselamatan', 'Amalan kebersihan dan keselamatan diri', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'General', 20),
('Komunikasi dengan Majikan', 'Cara berkomunikasi baik dengan majikan', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'General', 18)
ON CONFLICT DO NOTHING;

-- ====================================
-- Seed FAQ Documents
-- ====================================
INSERT INTO mim_documents (title, doc_type, content) VALUES
('Soalan Lazim - Pembantu', 'faq', 'Soalan lazim untuk pembantu rumah mengenai kerja, gaji, dan cuti.'),
('Soalan Lazim - Majikan', 'faq', 'Soalan lazim untuk majikan mengenai proses pengambilan pembantu.'),
('Senarai Harga Perkhidmatan', 'price', 'Pembantu Rumah: RM1500-2500
Pengasuh: RM1500-2500
Penjaga Orang Tua: RM1700-3500'),
('Proses Pengambilan', 'process', '1. Daftar online
2. Sediakan profil
3. Tonton video kursus
4. Temuduga Google Meet
5. Tandatangan kontrak
6. Mula kerja')
ON CONFLICT DO NOTHING;
"""

def run_query(sql):
    """Execute SQL via Supabase management API."""
    data = json.dumps({"query": sql}).encode("utf-8")
    req = urllib.request.Request(
        SUPABASE_URL,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {SUPABASE_TOKEN}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")
    except Exception as e:
        return 0, str(e)

def main():
    print("Creating MIM Portal tables in Supabase...", file=sys.stderr)
    # Split SQL by semicolons and execute statement by statement
    # because the API may not handle multiple statements in one query well.
    statements = [s.strip() for s in SQL.split(";") if s.strip() and not s.strip().startswith("--")]
    print(f"Total statements: {len(statements)}", file=sys.stderr)
    success = 0
    failed = 0
    for i, stmt in enumerate(statements, 1):
        # Skip pure comment statements
        cleaned = "\n".join([l for l in stmt.split("\n") if not l.strip().startswith("--")]).strip()
        if not cleaned:
            continue
        status, body = run_query(cleaned)
        if status in (200, 201):
            success += 1
            preview = cleaned[:60].replace("\n", " ")
            print(f"[{i:02d}] OK: {preview}...", file=sys.stderr)
        else:
            failed += 1
            preview = cleaned[:60].replace("\n", " ")
            err_msg = body[:200] if body else ""
            print(f"[{i:02d}] FAIL ({status}): {preview}", file=sys.stderr)
            print(f"     -> {err_msg}", file=sys.stderr)

    print(f"\nDone. Success: {success}, Failed: {failed}", file=sys.stderr)

if __name__ == "__main__":
    main()
