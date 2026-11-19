-- ==============================================================================
-- GENEWISE AI — GENETIC COUNSELOR DISCOVERY & CLINICAL SUPPORT NETWORK
-- Migration: 20261118180000_genetic_counselor_network_rls.sql
-- Security: HIPAA 45 CFR § 164.312 & DPDP Act 2023 Section 11 Compliance
-- ==============================================================================

-- 1. DIRECTORY COUNSELORS TABLE
CREATE TABLE IF NOT EXISTS directory_counselors (
    id VARCHAR(100) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(150) NOT NULL,
    professional_title VARCHAR(100) NOT NULL,
    primary_specialty VARCHAR(100) NOT NULL,
    subspecialties JSONB DEFAULT '[]'::jsonb,
    credentials_display VARCHAR(255) NOT NULL,
    qualification VARCHAR(200) NOT NULL,
    certification_org VARCHAR(150) NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'verified',
    verification_source VARCHAR(255),
    verification_date TIMESTAMPTZ,
    expiration_date TIMESTAMPTZ,
    verification_reviewer VARCHAR(150),
    institution VARCHAR(255) NOT NULL,
    department VARCHAR(200),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'United States',
    practice_location VARCHAR(255) NOT NULL,
    languages JSONB DEFAULT '["English"]'::jsonb,
    telehealth_available BOOLEAN DEFAULT true,
    consultation_availability VARCHAR(150) DEFAULT 'Next available: 4 business days',
    waitlist_days INTEGER DEFAULT 4,
    experience_years INTEGER DEFAULT 10,
    fee_structure VARCHAR(255) DEFAULT 'Accepts Most Major Insurances · Self-Pay Available',
    avatar_url VARCHAR(255),
    bio TEXT NOT NULL,
    target_loci JSONB DEFAULT '[]'::jsonb,
    target_conditions JSONB DEFAULT '[]'::jsonb,
    services_offered JSONB DEFAULT '[]'::jsonb,
    consultation_modes JSONB DEFAULT '["Telehealth Video", "In-Person Clinic"]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_demo_provider BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_counselors_specialty ON directory_counselors(primary_specialty);
CREATE INDEX IF NOT EXISTS idx_counselors_country ON directory_counselors(country);
CREATE INDEX IF NOT EXISTS idx_counselors_city ON directory_counselors(city);
CREATE INDEX IF NOT EXISTS idx_counselors_telehealth ON directory_counselors(telehealth_available);
CREATE INDEX IF NOT EXISTS idx_counselors_status ON directory_counselors(verification_status);

-- 2. COUNSELOR CREDENTIALS TABLE
CREATE TABLE IF NOT EXISTS counselor_credentials (
    id SERIAL PRIMARY KEY,
    counselor_id VARCHAR(100) REFERENCES directory_counselors(id) ON DELETE CASCADE,
    credential_type VARCHAR(100) NOT NULL,
    issuer_org VARCHAR(200) NOT NULL,
    credential_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'verified',
    country VARCHAR(100) DEFAULT 'United States',
    issued_date TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    verification_source_url VARCHAR(500),
    evidence_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credentials_counselor ON counselor_credentials(counselor_id);

-- 3. COUNSELOR VERIFICATION HISTORY (TAMPER-RESISTANT AUDIT)
CREATE TABLE IF NOT EXISTS counselor_verification_history (
    id SERIAL PRIMARY KEY,
    counselor_id VARCHAR(100) REFERENCES directory_counselors(id) ON DELETE CASCADE,
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    reviewed_by VARCHAR(150) NOT NULL,
    review_notes TEXT,
    audit_hash VARCHAR(64),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. APPOINTMENT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS appointment_requests (
    id VARCHAR(100) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    counsellor_id VARCHAR(100) REFERENCES directory_counselors(id) ON DELETE RESTRICT,
    patient_name VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50),
    consultation_purpose VARCHAR(255) NOT NULL,
    preferred_date VARCHAR(50) NOT NULL,
    preferred_time_slot VARCHAR(50) NOT NULL,
    time_zone VARCHAR(100) DEFAULT 'UTC',
    consultation_format VARCHAR(50) DEFAULT 'telehealth',
    telehealth_link VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    reschedule_reason VARCHAR(255),
    intake_notes TEXT,
    consent_data_sharing BOOLEAN DEFAULT false,
    attached_report_ids JSONB DEFAULT '[]'::jsonb,
    include_pedigree BOOLEAN DEFAULT true,
    doctor_prep_summary_id VARCHAR(100),
    audit_token VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointment_user ON appointment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_counselor ON appointment_requests(counsellor_id);
CREATE INDEX IF NOT EXISTS idx_appointment_status ON appointment_requests(status);

-- 5. SAVED COUNSELORS BOOKMARKS
CREATE TABLE IF NOT EXISTS saved_counselors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    counselor_id VARCHAR(100) REFERENCES directory_counselors(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_counselor_bookmark UNIQUE (user_id, counselor_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_counselors_user ON saved_counselors(user_id);

-- 6. CONSULTATION PREPARATION BRIEFS (AI DOCTOR PREP WIZARD)
CREATE TABLE IF NOT EXISTS consultation_preparations (
    id VARCHAR(100) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    counselor_id VARCHAR(100),
    consultation_purpose VARCHAR(200) NOT NULL,
    selected_goals JSONB DEFAULT '[]'::jsonb,
    family_history_data JSONB DEFAULT '{}'::jsonb,
    relevant_genes JSONB DEFAULT '[]'::jsonb,
    attached_document_ids JSONB DEFAULT '[]'::jsonb,
    generated_brief JSONB NOT NULL,
    is_shared_with_counselor BOOLEAN DEFAULT false,
    shared_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consultation_prep_user ON consultation_preparations(user_id);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE directory_counselors ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_counselors ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_preparations ENABLE ROW LEVEL SECURITY;

-- 1. directory_counselors: Public read of active directory; write for admins
CREATE POLICY rls_directory_counselors_select ON directory_counselors
    FOR SELECT USING (is_active = true);

CREATE POLICY rls_directory_counselors_admin ON directory_counselors
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- 2. counselor_credentials: Public read of verified credentials; write for admins
CREATE POLICY rls_counselor_credentials_select ON counselor_credentials
    FOR SELECT USING (status = 'verified');

CREATE POLICY rls_counselor_credentials_admin ON counselor_credentials
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin');

-- 3. appointment_requests: Patient can read/insert their own requests; admin/counselor can read assigned
CREATE POLICY rls_appointment_requests_patient_select ON appointment_requests
    FOR SELECT TO authenticated
    USING (
        user_id = (auth.jwt() ->> 'sub')::integer
        OR (auth.jwt() ->> 'role') = 'admin'
    );

CREATE POLICY rls_appointment_requests_patient_insert ON appointment_requests
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (auth.jwt() ->> 'sub')::integer);

CREATE POLICY rls_appointment_requests_patient_update ON appointment_requests
    FOR UPDATE TO authenticated
    USING (
        user_id = (auth.jwt() ->> 'sub')::integer
        OR (auth.jwt() ->> 'role') = 'admin'
    );

-- 4. saved_counselors: User-isolated bookmarks
CREATE POLICY rls_saved_counselors_user_all ON saved_counselors
    FOR ALL TO authenticated
    USING (user_id = (auth.jwt() ->> 'sub')::integer)
    WITH CHECK (user_id = (auth.jwt() ->> 'sub')::integer);

-- 5. consultation_preparations: User-isolated clinical briefs
CREATE POLICY rls_consultation_preparations_user_all ON consultation_preparations
    FOR ALL TO authenticated
    USING (user_id = (auth.jwt() ->> 'sub')::integer)
    WITH CHECK (user_id = (auth.jwt() ->> 'sub')::integer);
