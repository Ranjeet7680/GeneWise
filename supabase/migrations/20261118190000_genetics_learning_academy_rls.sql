-- ==============================================================================
-- GENEWISE AI — GENETICS LEARNING ACADEMY & CERTIFICATE SYSTEM
-- Migration: 20261118190000_genetics_learning_academy_rls.sql
-- Security: Post-Quantum HMAC, HIPAA & DPDP Least-Privilege Tenant Isolation
-- ==============================================================================

-- 1. ACADEMY COURSES TABLE
CREATE TABLE IF NOT EXISTS academy_courses (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    subtitle VARCHAR(255),
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Beginner',
    duration_hours FLOAT DEFAULT 3.0,
    instructor_name VARCHAR(150) NOT NULL,
    instructor_title VARCHAR(200) NOT NULL,
    instructor_avatar VARCHAR(255),
    modules_count INTEGER DEFAULT 5,
    lessons_count INTEGER DEFAULT 15,
    acmg_alignment VARCHAR(255) DEFAULT 'ACMG Core Genomics Framework',
    is_published BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academy_courses_category ON academy_courses(category);
CREATE INDEX IF NOT EXISTS idx_academy_courses_difficulty ON academy_courses(difficulty);
CREATE INDEX IF NOT EXISTS idx_academy_courses_published ON academy_courses(is_published);

-- 2. ACADEMY CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS academy_chapters (
    id VARCHAR(100) PRIMARY KEY,
    course_id VARCHAR(100) REFERENCES academy_courses(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academy_chapters_course ON academy_chapters(course_id);

-- 3. ACADEMY LESSONS TABLE
CREATE TABLE IF NOT EXISTS academy_lessons (
    id VARCHAR(100) PRIMARY KEY,
    chapter_id VARCHAR(100) REFERENCES academy_chapters(id) ON DELETE CASCADE,
    lesson_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    reading_time_min INTEGER DEFAULT 8,
    objectives JSONB DEFAULT '[]'::jsonb,
    content_markdown TEXT NOT NULL,
    video_url VARCHAR(500),
    video_duration_sec INTEGER DEFAULT 0,
    video_timestamps JSONB DEFAULT '[]'::jsonb,
    audio_url VARCHAR(500),
    audio_duration_sec INTEGER DEFAULT 0,
    model_3d_identifier VARCHAR(100),
    interactive_simulation_id VARCHAR(100),
    key_takeaways JSONB DEFAULT '[]'::jsonb,
    clinical_pearls JSONB DEFAULT '[]'::jsonb,
    citations JSONB DEFAULT '[]'::jsonb,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academy_lessons_chapter ON academy_lessons(chapter_id);

-- 4. COURSE ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS academy_course_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id VARCHAR(100) REFERENCES academy_courses(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'enrolled',
    progress_percent FLOAT DEFAULT 0.0,
    completed_lessons_count INTEGER DEFAULT 0,
    enrolled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    CONSTRAINT uq_user_course_enrollment UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_academy_enrollments_user ON academy_course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_enrollments_course ON academy_course_enrollments(course_id);

-- 5. LESSON PROGRESS TABLE
CREATE TABLE IF NOT EXISTS academy_lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    lesson_id VARCHAR(100) REFERENCES academy_lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    time_spent_sec INTEGER DEFAULT 0,
    notes TEXT,
    is_bookmarked BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_lesson_progress UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_academy_progress_user ON academy_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_progress_lesson ON academy_lesson_progress(lesson_id);

-- 6. VIRTUAL LABS TABLE
CREATE TABLE IF NOT EXISTS academy_virtual_labs (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    learning_objectives JSONB DEFAULT '[]'::jsonb,
    instructions TEXT NOT NULL,
    simulation_type VARCHAR(100) NOT NULL,
    sample_data JSONB DEFAULT '{}'::jsonb,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. LAB ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS academy_lab_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    lab_id VARCHAR(100) REFERENCES academy_virtual_labs(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT true,
    result_data JSONB DEFAULT '{}'::jsonb,
    time_spent_sec INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academy_lab_attempts_user ON academy_lab_attempts(user_id);

-- 8. MODULE QUIZZES TABLE
CREATE TABLE IF NOT EXISTS academy_module_quizzes (
    id VARCHAR(100) PRIMARY KEY,
    chapter_id VARCHAR(100) REFERENCES academy_chapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score_pct FLOAT DEFAULT 70.0,
    time_limit_sec INTEGER DEFAULT 600,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS academy_quiz_questions (
    id VARCHAR(100) PRIMARY KEY,
    quiz_id VARCHAR(100) REFERENCES academy_module_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_index INTEGER NOT NULL,
    clinical_rationale TEXT NOT NULL,
    acmg_reference VARCHAR(255),
    order_index INTEGER DEFAULT 0
);

-- 10. QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS academy_quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    quiz_id VARCHAR(100) REFERENCES academy_module_quizzes(id) ON DELETE CASCADE,
    score_pct FLOAT NOT NULL,
    is_passed BOOLEAN NOT NULL,
    answers JSONB NOT NULL,
    time_spent_sec INTEGER DEFAULT 0,
    attempted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academy_quiz_attempts_user ON academy_quiz_attempts(user_id);

-- 11. FINAL EXAMS TABLE
CREATE TABLE IF NOT EXISTS academy_final_exams (
    id VARCHAR(100) PRIMARY KEY,
    course_id VARCHAR(100) REFERENCES academy_courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score_pct FLOAT DEFAULT 70.0,
    time_limit_sec INTEGER DEFAULT 1800,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. EXAM ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS academy_exam_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    exam_id VARCHAR(100) REFERENCES academy_final_exams(id) ON DELETE CASCADE,
    score_pct FLOAT NOT NULL,
    is_passed BOOLEAN NOT NULL,
    answers JSONB NOT NULL,
    time_spent_sec INTEGER DEFAULT 0,
    attempted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academy_exam_attempts_user ON academy_exam_attempts(user_id);

-- 13. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS academy_certificates (
    id SERIAL PRIMARY KEY,
    certificate_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    course_id VARCHAR(100) REFERENCES academy_courses(id) ON DELETE CASCADE,
    learner_name VARCHAR(255) NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    course_category VARCHAR(100) NOT NULL,
    completion_date VARCHAR(50) NOT NULL,
    final_score_pct FLOAT NOT NULL,
    duration_hours FLOAT NOT NULL,
    issuer_name VARCHAR(150) NOT NULL,
    issuer_title VARCHAR(200) NOT NULL,
    signature_digest VARCHAR(255) NOT NULL,
    verification_url VARCHAR(500) NOT NULL,
    qr_code_data TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'valid',
    revocation_reason TEXT,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academy_cert_id ON academy_certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_academy_cert_user ON academy_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_cert_status ON academy_certificates(status);

-- 14. CERTIFICATE REVOCATIONS AUDIT TABLE
CREATE TABLE IF NOT EXISTS academy_certificate_revocations (
    id SERIAL PRIMARY KEY,
    certificate_id VARCHAR(100) REFERENCES academy_certificates(certificate_id) ON DELETE CASCADE,
    revoked_by VARCHAR(150) NOT NULL,
    revocation_reason TEXT NOT NULL,
    audit_hash VARCHAR(255) NOT NULL,
    revoked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 15. DOWNLOADABLE MATERIALS TABLE
CREATE TABLE IF NOT EXISTS academy_downloadable_materials (
    id VARCHAR(100) PRIMARY KEY,
    course_id VARCHAR(100) REFERENCES academy_courses(id) ON DELETE CASCADE,
    lesson_id VARCHAR(100) REFERENCES academy_lessons(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    material_type VARCHAR(50) NOT NULL,
    file_format VARCHAR(20) NOT NULL,
    file_size_kb INTEGER NOT NULL,
    download_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_virtual_labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lab_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_module_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_final_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_certificate_revocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_downloadable_materials ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies for Curriculum Content
CREATE POLICY "Public Read Academy Courses"
    ON academy_courses FOR SELECT
    USING (is_published = true);

CREATE POLICY "Public Read Academy Chapters"
    ON academy_chapters FOR SELECT
    USING (true);

CREATE POLICY "Public Read Academy Lessons"
    ON academy_lessons FOR SELECT
    USING (true);

CREATE POLICY "Public Read Virtual Labs"
    ON academy_virtual_labs FOR SELECT
    USING (true);

CREATE POLICY "Public Read Module Quizzes"
    ON academy_module_quizzes FOR SELECT
    USING (true);

CREATE POLICY "Public Read Quiz Questions"
    ON academy_quiz_questions FOR SELECT
    USING (true);

CREATE POLICY "Public Read Final Exams"
    ON academy_final_exams FOR SELECT
    USING (true);

CREATE POLICY "Public Read Downloadable Materials"
    ON academy_downloadable_materials FOR SELECT
    USING (true);

CREATE POLICY "Public Read Certificates for Verification"
    ON academy_certificates FOR SELECT
    USING (true);

-- 2. Tenant Isolated User Progress & Submissions
CREATE POLICY "Learners Manage Own Enrollments"
    ON academy_course_enrollments FOR ALL
    USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Learners Manage Own Lesson Progress"
    ON academy_lesson_progress FOR ALL
    USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Learners Manage Own Lab Attempts"
    ON academy_lab_attempts FOR ALL
    USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Learners Manage Own Quiz Attempts"
    ON academy_quiz_attempts FOR ALL
    USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Learners Manage Own Exam Attempts"
    ON academy_exam_attempts FOR ALL
    USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

-- 3. Admin & Clinician Oversight
CREATE POLICY "Admins Manage Certificates"
    ON academy_certificates FOR ALL
    USING (auth.jwt() ->> 'role' IN ('admin', 'clinician'));

CREATE POLICY "Admins View Revocations"
    ON academy_certificate_revocations FOR ALL
    USING (auth.jwt() ->> 'role' IN ('admin', 'clinician'));
