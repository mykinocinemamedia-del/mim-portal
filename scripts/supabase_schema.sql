-- ====================================
-- MIM Portal Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL > New Query)
-- Project: tgikwdngogwzpmbttjoc (automarket-ai)
-- All tables use prefix "mim_" to avoid conflicts
-- ====================================

-- 1. Admins
CREATE TABLE IF NOT EXISTS mim_admins (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Helpers (Maids/Employees)
CREATE TABLE IF NOT EXISTS mim_helpers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
  skills TEXT,
  child_ages TEXT,
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

-- 3. Employers
CREATE TABLE IF NOT EXISTS mim_employers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
  profile_data TEXT,
  is_first_login BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bookings
CREATE TABLE IF NOT EXISTS mim_bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  employer_id TEXT NOT NULL REFERENCES mim_employers(id),
  helper_id TEXT NOT NULL REFERENCES mim_helpers(id),
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
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  booking_id TEXT REFERENCES mim_bookings(id),
  contract_type TEXT NOT NULL,
  helper_id TEXT REFERENCES mim_helpers(id),
  employer_id TEXT REFERENCES mim_employers(id),
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
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  helper_id TEXT NOT NULL REFERENCES mim_helpers(id),
  employer_id TEXT REFERENCES mim_employers(id),
  work_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  is_day_off BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Payments
CREATE TABLE IF NOT EXISTS mim_payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  employer_id TEXT NOT NULL REFERENCES mim_employers(id),
  helper_id TEXT REFERENCES mim_helpers(id),
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
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL,
  course_id TEXT NOT NULL REFERENCES mim_video_courses(id),
  watched_percent INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 10. Documents (FAQs, prices, etc.)
CREATE TABLE IF NOT EXISTS mim_documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  doc_type TEXT,
  content TEXT,
  file_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Notifications
CREATE TABLE IF NOT EXISTS mim_notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL,
  helper_id TEXT REFERENCES mim_helpers(id),
  employer_id TEXT REFERENCES mim_employers(id),
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Interviews (Google Meet)
CREATE TABLE IF NOT EXISTS mim_interviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  helper_id TEXT REFERENCES mim_helpers(id),
  employer_id TEXT REFERENCES mim_employers(id),
  meet_url TEXT,
  recording_url TEXT,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Messages
CREATE TABLE IF NOT EXISTS mim_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  from_admin BOOLEAN DEFAULT TRUE,
  helper_id TEXT REFERENCES mim_helpers(id),
  employer_id TEXT REFERENCES mim_employers(id),
  subject TEXT,
  body TEXT,
  sent_via TEXT DEFAULT 'in_app',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Medical Records
CREATE TABLE IF NOT EXISTS mim_medical_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  helper_id TEXT NOT NULL REFERENCES mim_helpers(id),
  record_type TEXT,
  result TEXT,
  file_url TEXT,
  notes TEXT,
  upload_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- Disable RLS (we use service role key in backend)
-- ====================================
ALTER TABLE mim_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_helpers DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_employers DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_video_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_course_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_interviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_medical_records DISABLE ROW LEVEL SECURITY;

-- ====================================
-- Seed Data
-- ====================================

-- Admin user
INSERT INTO mim_admins (email, password, full_name, role)
VALUES ('admin@mim.com.my', 'Admin@MIM2026', 'MIM Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Video courses
INSERT INTO mim_video_courses (title, description, video_url, category, duration_minutes) VALUES
('Pengenalan Kerja Pembantu Rumah', 'Kursus asas untuk pembantu rumah baru.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Maid', 15),
('Penjagaan Bayi & Kanak-kanak', 'Panduan menjaga bayi dan kanak-kanak.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Babysitter', 25),
('Penjagaan Orang Tua', 'Asas penjagaan warga emas.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Caregiver', 30),
('Kebersihan Diri & Keselamatan', 'Amalan kebersihan diri.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'General', 20),
('Komunikasi dengan Majikan', 'Cara berkomunikasi dengan majikan.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'General', 18),
('Pengurusan Masa & Jadual Kerja', 'Cara menguruskan masa.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'General', 22)
ON CONFLICT DO NOTHING;

-- Documents
INSERT INTO mim_documents (title, doc_type, content) VALUES
('Soalan Lazim - Pembantu', 'faq', 'Soalan lazim untuk pembantu rumah mengenai kerja, gaji, dan cuti.'),
('Soalan Lazim - Majikan', 'faq', 'Soalan lazim untuk majikan mengenai proses pengambilan pembantu.'),
('Senarai Harga Perkhidmatan', 'price', 'Pembantu Rumah: RM1500-2500, Pengasuh: RM1500-2500, Penjaga Orang Tua: RM1700-3500'),
('Proses Pengambilan', 'process', '1. Pendaftaran 2. Profil 3. Latihan 4. Temuduga 5. Kontrak 6. Mula Kerja')
ON CONFLICT DO NOTHING;

-- Sample helpers
INSERT INTO mim_helpers (full_name, nickname, age, religion, marital_status, education, phone, city, state, residency_state, work_area, can_relocate, service_type, live_in, desired_job, skills, motivation, experience, email, password, status, rating)
VALUES
('Siti Aminah binti Abdullah', 'Siti', 28, 'Islam', 'Berkahwin', 'SPM', '+60123456789', 'Kuala Lumpur', 'Kuala Lumpur', 'Kuala Lumpur', 'Kuala Lumpur', TRUE, 'maid', TRUE, 'maid', '["cooking","cleaning","washing"]', 'Saya ingin bekerja untuk menyokong keluarga.', '3 tahun bekerja sebagai pembantu rumah.', 'siti.demo@mim.com.my', 'Demo@1234', 'active', 4.8),
('Maria binti Santos', 'Maria', 32, 'Kristian', 'Bujang', 'Diploma', '+60198765432', 'Petaling Jaya', 'Selangor', 'Selangor', 'Selangor', FALSE, 'babysitter', FALSE, 'babysitter', '["baby_care","child_care","educating"]', 'Saya suka menjaga kanak-kanak.', '5 tahun sebagai pengasuh.', 'maria.demo@mim.com.my', 'Demo@1234', 'active', 4.9),
('Rani a/p Kumaran', 'Rani', 35, 'Hindu', 'Berkahwin', 'SPM', '+60112223344', 'Shah Alam', 'Selangor', 'Selangor', 'Selangor', TRUE, 'caregiver', TRUE, 'caregiver', '["cooking","cleaning"]', 'Saya ada pengalaman menjaga orang tua.', '4 tahun sebagai penjaga orang tua.', 'rani.demo@mim.com.my', 'Demo@1234', 'active', 4.7),
('Noraini binti Hasan', 'Nora', 26, 'Islam', 'Bujang', 'SPM', '+60133445566', 'Johor Bahru', 'Johor', 'Johor', 'Johor', TRUE, 'maid', FALSE, 'maid', '["cooking","cleaning","washing","baby_care"]', 'Ingin membantu keluarga di kampung.', '2 tahun pengalaman.', 'nora.demo@mim.com.my', 'Demo@1234', 'active', 5.0)
ON CONFLICT (email) DO NOTHING;

-- Sample employer
INSERT INTO mim_employers (full_name, phone, email, password, city, state, service_type, num_kids, kids_ages, salary_offered, criteria, status)
VALUES ('Ahmad bin Yusof', '+60155667788', 'ahmad.demo@mim.com.my', 'Demo@1234', 'Kuala Lumpur', 'Kuala Lumpur', 'maid', 2, '5, 8', 2000, 'Pembantu rumah yang pandai masak dan sabar dengan kanak-kanak.', 'active')
ON CONFLICT (email) DO NOTHING;

-- ====================================
-- AGENTIC AI SYSTEM TABLES (NEW)
-- ====================================

-- 15. Agents Registry
CREATE TABLE IF NOT EXISTS mim_agents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'idle',
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  schedule TEXT,
  config TEXT,
  total_runs INT DEFAULT 0,
  success_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Agent Activities (log)
CREATE TABLE IF NOT EXISTS mim_agent_activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  agent_id TEXT REFERENCES mim_agents(id),
  action TEXT,
  status TEXT,
  input TEXT,
  output TEXT,
  error_message TEXT,
  duration INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Leads (from lead gen agents)
CREATE TABLE IF NOT EXISTS mim_leads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  agent_id TEXT REFERENCES mim_agents(id),
  lead_type TEXT,
  source TEXT,
  source_url TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  profile_data TEXT,
  status TEXT DEFAULT 'new',
  score FLOAT,
  notes TEXT,
  converted_to TEXT,
  contacted_at TIMESTAMPTZ,
  qualified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Conversations (AI chat)
CREATE TABLE IF NOT EXISTS mim_conversations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  agent_id TEXT REFERENCES mim_agents(id),
  user_id TEXT,
  user_type TEXT,
  channel TEXT DEFAULT 'whatsapp',
  status TEXT DEFAULT 'active',
  context TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Agent Messages
CREATE TABLE IF NOT EXISTS mim_agent_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT REFERENCES mim_conversations(id),
  agent_id TEXT REFERENCES mim_agents(id),
  sender TEXT,
  content TEXT,
  message_type TEXT DEFAULT 'text',
  metadata TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Match Scores (AI Matchmaker)
CREATE TABLE IF NOT EXISTS mim_match_scores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  agent_id TEXT REFERENCES mim_agents(id),
  helper_id TEXT NOT NULL REFERENCES mim_helpers(id),
  employer_id TEXT NOT NULL REFERENCES mim_employers(id),
  score FLOAT NOT NULL,
  reasoning TEXT,
  factors TEXT,
  status TEXT DEFAULT 'suggested',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(helper_id, employer_id)
);

-- 21. Referrals
CREATE TABLE IF NOT EXISTS mim_referrals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  agent_id TEXT REFERENCES mim_agents(id),
  referrer_type TEXT,
  referrer_id TEXT,
  referrer_name TEXT,
  referrer_phone TEXT,
  referred_name TEXT,
  referred_phone TEXT,
  referred_email TEXT,
  status TEXT DEFAULT 'pending',
  reward_type TEXT,
  reward_amount FLOAT,
  reward_status TEXT,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Content Queue (social media)
CREATE TABLE IF NOT EXISTS mim_content_queue (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  agent_id TEXT REFERENCES mim_agents(id),
  platform TEXT,
  content_type TEXT,
  title TEXT,
  content TEXT,
  hashtags TEXT,
  media_url TEXT,
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  metrics TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Feedback (Quality Monitor)
CREATE TABLE IF NOT EXISTS mim_feedback (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  agent_id TEXT REFERENCES mim_agents(id),
  user_id TEXT,
  user_type TEXT,
  feedback_type TEXT,
  rating INT,
  category TEXT,
  comments TEXT,
  sentiment TEXT,
  action_taken TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. Agent Notifications
CREATE TABLE IF NOT EXISTS mim_agent_notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  agent_name TEXT,
  category TEXT,
  severity TEXT DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS on all agent tables
ALTER TABLE mim_agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_agent_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_agent_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_match_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_content_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE mim_agent_notifications DISABLE ROW LEVEL SECURITY;

-- ====================================
-- Done! Demo credentials:
-- Admin: admin@mim.com.my / Admin@MIM2026
-- Helper: siti.demo@mim.com.my / Demo@1234
-- Employer: ahmad.demo@mim.com.my / Demo@1234
-- ====================================

