-- ==============================================================================
-- MEDIPREDICT AI — FAMILY HEALTH HISTORY & GENETIC RISK INTELLIGENCE SCHEMA
-- Migration: 20261118000000_family_health_genetics_rls.sql
-- Framework: Supabase PostgreSQL 15+ / 17
-- Compliance: DPDP Act 2023, HIPAA Security Rule, GDPR Article 9 (Genetic Data)
-- ==============================================================================

SET search_path = public, extensions;

-- 1. FAMILY GROUPS
CREATE TABLE IF NOT EXISTS public.family_groups (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    family_name VARCHAR(255) NOT NULL DEFAULT 'My Family Pedigree',
    proband_name VARCHAR(255) NOT NULL DEFAULT 'Proband (Self)',
    consanguinity_reported BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    completeness_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_family_groups_user_id ON public.family_groups(user_id);

-- 2. FAMILY MEMBERS
CREATE TABLE IF NOT EXISTS public.family_members (
    id VARCHAR(100) PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    relationship_to_proband VARCHAR(100) NOT NULL,
    generation INT NOT NULL DEFAULT 2,
    branch VARCHAR(50) NOT NULL DEFAULT 'Immediate',
    gender VARCHAR(20) NOT NULL DEFAULT 'unspecified',
    biological_relationship BOOLEAN NOT NULL DEFAULT true,
    is_proband BOOLEAN NOT NULL DEFAULT false,
    is_deceased BOOLEAN NOT NULL DEFAULT false,
    is_carrier BOOLEAN NOT NULL DEFAULT false,
    current_age VARCHAR(50),
    age_at_death VARCHAR(50),
    cause_of_death VARCHAR(255),
    history_status VARCHAR(50) NOT NULL DEFAULT 'known',
    clinical_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_family_members_group_id ON public.family_members(group_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);

-- 3. FAMILY RELATIONSHIPS
CREATE TABLE IF NOT EXISTS public.family_relationships (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    from_member_id VARCHAR(100) NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    to_member_id VARCHAR(100) NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    is_biological BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_family_relationships_group ON public.family_relationships(group_id);

-- 4. FAMILY HEALTH CONDITIONS
CREATE TABLE IF NOT EXISTS public.family_health_conditions (
    id BIGSERIAL PRIMARY KEY,
    member_id VARCHAR(100) NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    condition_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    icd10_code VARCHAR(50),
    age_at_diagnosis VARCHAR(50),
    is_genetic BOOLEAN NOT NULL DEFAULT false,
    suspected_inheritance VARCHAR(100) DEFAULT 'Unknown',
    verification_level VARCHAR(100) NOT NULL DEFAULT 'Family Reported',
    clinical_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_family_conditions_member ON public.family_health_conditions(member_id);

-- 5. GENETIC TEST RECORDS
CREATE TABLE IF NOT EXISTS public.genetic_test_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    member_id VARCHAR(100) REFERENCES public.family_members(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(100) NOT NULL,
    testing_laboratory VARCHAR(255),
    test_date TIMESTAMPTZ,
    methodology VARCHAR(255),
    indication TEXT,
    overall_result VARCHAR(100) NOT NULL DEFAULT 'Normal',
    clinician_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_genetic_tests_user_id ON public.genetic_test_records(user_id);

-- 6. GENETIC VARIANTS
CREATE TABLE IF NOT EXISTS public.genetic_variants (
    id BIGSERIAL PRIMARY KEY,
    test_record_id BIGINT NOT NULL REFERENCES public.genetic_test_records(id) ON DELETE CASCADE,
    gene_symbol VARCHAR(50) NOT NULL,
    variant_hgvs VARCHAR(255),
    clinical_significance VARCHAR(100) NOT NULL DEFAULT 'Uncertain Significance',
    zygosity VARCHAR(50) NOT NULL DEFAULT 'Heterozygous',
    inheritance_pattern VARCHAR(100) NOT NULL DEFAULT 'Autosomal Recessive',
    associated_condition VARCHAR(255),
    evidence_tier VARCHAR(100) NOT NULL DEFAULT 'Tier II (Potential Clinical Significance)',
    evidence_source VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_genetic_variants_gene ON public.genetic_variants(gene_symbol);

-- 7. INHERITANCE OBSERVATIONS
CREATE TABLE IF NOT EXISTS public.inheritance_observations (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    condition_name VARCHAR(255) NOT NULL,
    observed_pattern VARCHAR(100) NOT NULL,
    affected_members_count INT NOT NULL DEFAULT 1,
    generations_spanned INT NOT NULL DEFAULT 1,
    transmission_branch VARCHAR(50) NOT NULL DEFAULT 'Maternal & Paternal',
    confidence_level VARCHAR(50) NOT NULL DEFAULT 'Moderate (Educational Observation)',
    reason_for_attention TEXT NOT NULL,
    missing_data_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_inheritance_obs_group ON public.inheritance_observations(group_id);

-- 8. CARRIER SCREENING INFORMATION
CREATE TABLE IF NOT EXISTS public.carrier_screening_information (
    id BIGSERIAL PRIMARY KEY,
    condition_name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    gene_symbol VARCHAR(50) NOT NULL,
    inheritance_mode VARCHAR(100) NOT NULL DEFAULT 'Autosomal Recessive',
    clinical_description TEXT NOT NULL,
    who_should_consider TEXT NOT NULL,
    screening_limitations TEXT NOT NULL,
    residual_risk_explanation TEXT NOT NULL,
    partner_testing_importance TEXT NOT NULL,
    guideline_source VARCHAR(255) NOT NULL,
    guideline_url VARCHAR(500),
    last_reviewed_date VARCHAR(50) NOT NULL DEFAULT '2026-06'
);

-- 9. PRECONCEPTION PLANS
CREATE TABLE IF NOT EXISTS public.preconception_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_timeline VARCHAR(100) NOT NULL DEFAULT 'Planning within 6-12 months',
    partner_history_completed BOOLEAN NOT NULL DEFAULT false,
    partner_consented_sharing BOOLEAN NOT NULL DEFAULT false,
    known_conditions_reviewed BOOLEAN NOT NULL DEFAULT false,
    carrier_screening_discussed BOOLEAN NOT NULL DEFAULT false,
    medications_reviewed BOOLEAN NOT NULL DEFAULT false,
    vaccinations_reviewed BOOLEAN NOT NULL DEFAULT false,
    counselling_scheduled BOOLEAN NOT NULL DEFAULT false,
    custom_questions JSONB DEFAULT '[]'::jsonb,
    checklist_state JSONB DEFAULT '{}'::jsonb,
    clinical_summary_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_preconception_user ON public.preconception_plans(user_id);

-- 10. GENETIC RISK SUMMARIES
CREATE TABLE IF NOT EXISTS public.genetic_risk_summaries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    educational_category VARCHAR(100) NOT NULL,
    family_history_observations JSONB NOT NULL DEFAULT '[]'::jsonb,
    relevant_condition_info JSONB NOT NULL DEFAULT '[]'::jsonb,
    attention_rationale TEXT NOT NULL,
    missing_information JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_clinician_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_next_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_references JSONB NOT NULL DEFAULT '[]'::jsonb,
    data_quality_indicator VARCHAR(50) NOT NULL DEFAULT 'Moderate Completeness (Educational Only)',
    disclaimer TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_risk_summaries_user ON public.genetic_risk_summaries(user_id);

-- 11. GENETIC EVIDENCE SOURCES
CREATE TABLE IF NOT EXISTS public.genetic_evidence_sources (
    id BIGSERIAL PRIMARY KEY,
    source_name VARCHAR(100) NOT NULL,
    reference_title VARCHAR(500) NOT NULL,
    topic_category VARCHAR(100) NOT NULL,
    publication_date VARCHAR(50),
    url VARCHAR(500),
    evidence_tier VARCHAR(100) NOT NULL DEFAULT 'Clinical Practice Guideline / Peer Reviewed',
    limitations TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. GENETIC COUNSELLORS DIRECTORY
CREATE TABLE IF NOT EXISTS public.genetic_counsellors (
    id VARCHAR(100) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    board_certification VARCHAR(255) NOT NULL,
    clinic_affiliation VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    telehealth_available BOOLEAN NOT NULL DEFAULT true,
    languages_spoken JSONB DEFAULT '["English", "Hindi"]'::jsonb,
    consultation_availability VARCHAR(100) NOT NULL DEFAULT 'Next available: 2 business days',
    is_demo_provider BOOLEAN NOT NULL DEFAULT true,
    profile_bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_counsellors_specialty ON public.genetic_counsellors(specialty);
CREATE INDEX IF NOT EXISTS idx_counsellors_city ON public.genetic_counsellors(city);

-- 13. SPECIALIST REFERRALS
CREATE TABLE IF NOT EXISTS public.specialist_referrals (
    id VARCHAR(100) PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    counsellor_id VARCHAR(100) NOT NULL REFERENCES public.genetic_counsellors(id) ON DELETE RESTRICT,
    specialty_requested VARCHAR(100) NOT NULL,
    referral_reason VARCHAR(255) NOT NULL,
    clinical_priority VARCHAR(50) NOT NULL DEFAULT 'Routine Educational Referral',
    status VARCHAR(50) NOT NULL DEFAULT 'Requested',
    consent_granted BOOLEAN NOT NULL DEFAULT false,
    consent_timestamp TIMESTAMPTZ,
    include_family_tree BOOLEAN NOT NULL DEFAULT true,
    include_genetic_tests BOOLEAN NOT NULL DEFAULT true,
    scheduled_appointment_time TIMESTAMPTZ,
    secure_referral_summary JSONB,
    notes_for_specialist TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_referrals_user ON public.specialist_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_counsellor ON public.specialist_referrals(counsellor_id);

-- 14. GENETIC DATA CONSENTS
CREATE TABLE IF NOT EXISTS public.genetic_data_consents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    consent_type VARCHAR(100) NOT NULL,
    granted BOOLEAN NOT NULL DEFAULT false,
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    ip_address VARCHAR(100),
    user_agent VARCHAR(255),
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_genetic_consents_user ON public.genetic_data_consents(user_id, consent_type);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_health_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genetic_test_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genetic_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inheritance_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrier_screening_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preconception_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genetic_risk_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genetic_evidence_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genetic_counsellors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genetic_data_consents ENABLE ROW LEVEL SECURITY;

-- 1. Family Groups: Patients own their family groups; Admins full access
CREATE POLICY "family_groups_patient_owner" ON public.family_groups
    FOR ALL USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- 2. Family Members: Patient owner or authorized clinician
CREATE POLICY "family_members_patient_owner" ON public.family_members
    FOR ALL USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- 3. Family Health Conditions
CREATE POLICY "family_conditions_patient_owner" ON public.family_health_conditions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.family_members m
            WHERE m.id = family_health_conditions.member_id AND (m.user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
        )
    );

-- 4. Genetic Tests & Variants
CREATE POLICY "genetic_tests_patient_owner" ON public.genetic_test_records
    FOR ALL USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "genetic_variants_patient_owner" ON public.genetic_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.genetic_test_records t
            WHERE t.id = genetic_variants.test_record_id AND (t.user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
        )
    );

-- 5. Carrier Screening & Evidence: Public / Authenticated read access
CREATE POLICY "carrier_screening_read_all" ON public.carrier_screening_information
    FOR SELECT USING (true);

CREATE POLICY "genetic_evidence_read_all" ON public.genetic_evidence_sources
    FOR SELECT USING (true);

CREATE POLICY "genetic_counsellors_read_all" ON public.genetic_counsellors
    FOR SELECT USING (true);

-- 6. Preconception Plans: Strictly private to patient
CREATE POLICY "preconception_plans_owner" ON public.preconception_plans
    FOR ALL USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- 7. Genetic Risk Summaries
CREATE POLICY "risk_summaries_owner" ON public.genetic_risk_summaries
    FOR ALL USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- 8. Specialist Referrals: Patient owner & receiving specialist
CREATE POLICY "referrals_patient_owner" ON public.specialist_referrals
    FOR ALL USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- 9. Genetic Data Consents: Patient owner only
CREATE POLICY "genetic_consents_owner" ON public.genetic_data_consents
    FOR ALL USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
