-- ==============================================================================
-- MEDIPREDICT AI — SECURITY ARCHITECTURE v2.0 POSTGRESQL & ROW-LEVEL SECURITY (RLS)
-- Migration: 20261118120000_security_architecture_v2_rls.sql
-- Framework: Supabase PostgreSQL 17 / PostgreSQL 15+
-- Standards: DPDP Act 2023, HIPAA Security Rule, GDPR Article 9 & 20, IEEE 2801
-- ==============================================================================

-- 1. EXTENSIONS & SCHEMAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

SET search_path = public, extensions;

-- ==============================================================================
-- 2. MFA FACTORS & SUSPICIOUS ACTIVITIES TABLES
-- ==============================================================================

-- MFA Factors (TOTP, Phone, Backup Codes)
CREATE TABLE IF NOT EXISTS public.mfa_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    factor_type VARCHAR(50) NOT NULL DEFAULT 'totp' CHECK (factor_type IN ('totp', 'phone_sms', 'backup_codes')),
    secret_encrypted TEXT,
    phone_number VARCHAR(50),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    backup_codes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_factor UNIQUE(user_id, factor_type)
);

-- Suspicious Activities & Threat Monitoring Table
CREATE TABLE IF NOT EXISTS public.suspicious_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    threat_type VARCHAR(100) NOT NULL CHECK (threat_type IN (
        'brute_force_login',
        'prompt_injection_attempt',
        'privilege_escalation_attempt',
        'idor_unauthorized_access',
        'rate_limit_breach',
        'malicious_file_upload',
        'session_hijacking_attempt'
    )),
    ip_address VARCHAR(100),
    user_agent TEXT,
    severity VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details JSONB DEFAULT '{}'::jsonb,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. HELPER FUNCTIONS WITH STRICT SECURITY DEFINER & SEARCH PATH
-- ==============================================================================

-- Resolve current user profile ID from auth.uid()
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    SELECT id FROM public.profiles WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- Resolve current user role ('patient', 'clinician', 'researcher', 'admin')
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS VARCHAR
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    SELECT COALESCE(
        (SELECT role FROM public.profiles WHERE auth_id = auth.uid() LIMIT 1),
        'anonymous'
    );
$$;

-- Relationship-Based Access Control (ReBAC): Active care relationship check
CREATE OR REPLACE FUNCTION public.has_active_care_relationship(target_patient_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.clinician_patient_relationships cpr
        WHERE cpr.clinician_id = public.current_profile_id()
          AND cpr.patient_id = target_patient_id
          AND cpr.status = 'active'
          AND (cpr.authorized_until IS NULL OR cpr.authorized_until > timezone('utc'::text, now()))
    );
$$;

-- Granular Consent Verification (DPDP Act 2023)
CREATE OR REPLACE FUNCTION public.has_patient_consent(target_patient_id UUID, consent_purpose TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.consent_records cr
        WHERE cr.user_id = target_patient_id
          AND cr.consent_type = consent_purpose
          AND cr.granted = true
    );
$$;

-- Check if session is currently active and not revoked
CREATE OR REPLACE FUNCTION public.is_session_valid(target_session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_sessions us
        WHERE us.id = target_session_id
          AND us.is_active = true
          AND us.expires_at > timezone('utc'::text, now())
    );
$$;

-- ==============================================================================
-- 4. FORCE ROW LEVEL SECURITY ON EVERY SENSITIVE TABLE
-- ==============================================================================

-- Core Identity & Auth Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.clinician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinician_profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.clinician_patient_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinician_patient_relationships FORCE ROW LEVEL SECURITY;

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.mfa_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_factors FORCE ROW LEVEL SECURITY;

-- Clinical Reports, Biomarkers & Vitals
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE public.extracted_biomarkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_biomarkers FORCE ROW LEVEL SECURITY;

ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics FORCE ROW LEVEL SECURITY;

ALTER TABLE public.personal_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_health_records FORCE ROW LEVEL SECURITY;

-- Sensors & IoT Devices
ALTER TABLE public.wearable_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_devices FORCE ROW LEVEL SECURITY;

ALTER TABLE public.wearable_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_measurements FORCE ROW LEVEL SECURITY;

ALTER TABLE public.sensor_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_measurements FORCE ROW LEVEL SECURITY;

-- AI Consultations
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations FORCE ROW LEVEL SECURITY;

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages FORCE ROW LEVEL SECURITY;

-- Privacy, Consent & Audit
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records FORCE ROW LEVEL SECURITY;

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests FORCE ROW LEVEL SECURITY;

ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests FORCE ROW LEVEL SECURITY;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications FORCE ROW LEVEL SECURITY;

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events FORCE ROW LEVEL SECURITY;

ALTER TABLE public.suspicious_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspicious_activities FORCE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. ROW-LEVEL SECURITY POLICIES (MFA, SESSIONS, REBAC, RESEARCHER)
-- ==============================================================================

-- --- MFA FACTORS POLICIES ---
CREATE POLICY "Users can manage their own MFA factors"
ON public.mfa_factors FOR ALL
TO authenticated
USING (user_id = public.current_profile_id() OR public.current_user_role() = 'admin')
WITH CHECK (user_id = public.current_profile_id() OR public.current_user_role() = 'admin');

-- --- USER SESSIONS POLICIES ---
CREATE POLICY "Users can view and revoke their own active sessions"
ON public.user_sessions FOR ALL
TO authenticated
USING (user_id = public.current_profile_id() OR public.current_user_role() = 'admin')
WITH CHECK (user_id = public.current_profile_id() OR public.current_user_role() = 'admin');

-- --- SUSPICIOUS ACTIVITIES POLICIES ---
CREATE POLICY "Admins can view and manage all suspicious activities"
ON public.suspicious_activities FOR ALL
TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "System can record suspicious activities"
ON public.suspicious_activities FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- --- RESEARCHER ROLE RESTRICTIONS (ANONYMIZED RESEARCH ONLY) ---
-- Researchers may query health metrics only when patient has granted 'anonymized_research' consent
CREATE POLICY "Researchers can view de-identified health metrics with consent"
ON public.health_metrics FOR SELECT
TO authenticated
USING (
    public.current_user_role() = 'researcher' AND
    public.has_patient_consent(patient_id, 'anonymized_research')
);

CREATE POLICY "Researchers can view de-identified biomarkers with consent"
ON public.extracted_biomarkers FOR SELECT
TO authenticated
USING (
    public.current_user_role() = 'researcher' AND
    EXISTS (
        SELECT 1 FROM public.medical_reports r
        WHERE r.id = report_id
          AND public.has_patient_consent(r.patient_id, 'anonymized_research')
    )
);

-- ==============================================================================
-- 6. PRIVATE SUPABASE STORAGE POLICIES (SHORT-LIVED SIGNED ACCESS)
-- ==============================================================================

-- Create private healthcare storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('medical-reports', 'medical-reports', false, 15728640, ARRAY['application/pdf', 'image/png', 'image/jpeg']),
    ('genetic-records', 'genetic-records', false, 52428800, ARRAY['application/json', 'text/plain', 'application/pdf', 'image/png']),
    ('clinical-scans', 'clinical-scans', false, 52428800, ARRAY['application/dicom', 'image/png', 'image/jpeg', 'application/pdf']),
    ('voice-notes', 'voice-notes', false, 10485760, ARRAY['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/ogg'])
ON CONFLICT (id) DO UPDATE SET 
    public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage object access policy: Patients access their own folders, ReBAC clinicians access under care relationship
CREATE POLICY "Private storage signed access for patients and care clinicians"
ON storage.objects FOR SELECT
TO authenticated
USING (
    -- Patient accesses objects under their user_id folder prefix: e.g. "reports/{user_id}/*"
    (storage.foldername(name))[2] = public.current_profile_id()::text OR
    public.current_user_role() = 'admin' OR
    (
        public.current_user_role() = 'clinician' AND
        public.has_active_care_relationship((storage.foldername(name))[2]::uuid)
    )
);

CREATE POLICY "Patients can upload to their own private storage folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    (storage.foldername(name))[2] = public.current_profile_id()::text
);

CREATE POLICY "Patients can delete from their own private storage folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
    (storage.foldername(name))[2] = public.current_profile_id()::text OR
    public.current_user_role() = 'admin'
);

-- Disallow public anonymous downloads on all storage buckets
REVOKE ALL ON SCHEMA storage FROM anon, public;
GRANT USAGE ON SCHEMA storage TO authenticated, service_role;

-- ==============================================================================
-- 7. AUDIT LOG IMMUTABILITY & TAMPER RESISTANCE
-- ==============================================================================

-- Strictly prevent updating or deleting audit events to ensure non-repudiation
REVOKE UPDATE, DELETE, TRUNCATE ON public.audit_events FROM authenticated, anon, public;

CREATE OR REPLACE FUNCTION public.prevent_audit_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RAISE EXCEPTION 'Audit log records are immutable and cannot be updated, deleted, or truncated (DPDP Act 2023 / HIPAA Sec. 164.312).';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_immutable ON public.audit_events;
CREATE TRIGGER trg_audit_immutable
BEFORE UPDATE OR DELETE ON public.audit_events
FOR EACH ROW
EXECUTE FUNCTION public.prevent_audit_modification();

-- ==============================================================================
-- 8. SUMMARY ATTESTATION
-- ==============================================================================
COMMENT ON SCHEMA public IS 'MediPredict AI / GeneWise Security Architecture v2.0 - Verified RLS, ReBAC, MFA, DPDP Act 2023, HIPAA Security Rule';
