export type WorkspaceLogoKey = "pulse" | "dna" | "shield" | "microscope" | "custom";

export interface WorkspaceBrandConfig {
  name: string;
  subtitle: string;
  badge: string;
  logoKey: WorkspaceLogoKey;
  logoUrl?: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  mfa_enabled?: boolean;
  email_verified_at?: string;
  created_at: string;
  phone?: string;
  phone_verified?: boolean;
  specialty?: string;
  organization?: string;
  bio?: string;
  avatar_url?: string;
  avatar_color?: string;
  workspace_name?: string;
  workspace_subtitle?: string;
  workspace_badge?: string;
  workspace_logo_key?: WorkspaceLogoKey;
  workspace_logo_url?: string;
}

export type ProfileUpdatePayload = Partial<Omit<User, "id" | "created_at">> & {
  password?: string;
};

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
  mfa_required?: boolean;
  mfa_token?: string;
  mfa_type?: string;
}

export interface MFAEnrollResponse {
  secret: string;
  qr_code_url?: string;
  otpauth_url: string;
  backup_codes: string[];
}

export interface UserSession {
  id: number;
  user_id: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
  expires_at: string;
  last_activity_at: string;
  is_active: boolean;
  is_current: boolean;
}

export interface SuspiciousActivity {
  id: number;
  threat_type: string;
  severity: "low" | "medium" | "high" | "critical";
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  created_at: string;
  resolved: boolean;
}

export interface MessageSource {
  title: string;
  journal?: string;
  year?: number;
  pmid?: string;
  doi?: string;
  evidence_level?: string;
  url?: string;
  abstract?: string;
  authors?: string;
}

export interface LstmStepPoint {
  visitLabel: string;
  value: number;
  lowerBound?: number;
  upperBound?: number;
  isForecast: boolean;
}

export interface NeuralTelemetry {
  tokens_per_second?: number;
  latency_ms?: number;
  attention_peak?: string;
  consensus_score?: number;
  evidence_grounding_score?: number;
  architecture_label?: string;
  hyperparameters?: {
    sequence_horizon?: string;
    temperature?: number;
    brier_score?: number;
    dropout?: number;
    zero_trust_status?: string;
  };
}

export interface LstmBiomarkerForecast {
  biomarkerKey: string;
  biomarkerLabel: string;
  unit: string;
  referenceRange: string;
  currentValue: number;
  projected30d: number;
  projected90d: number;
  projected180d?: number;
  deltaPerMonth: number;
  trend: "improving" | "stable" | "elevating";
  confidence: number;
  gateWeights: {
    forget: number;
    input: number;
    output: number;
  };
  attentionPeakVisit: string;
  sequence: LstmStepPoint[];
  clinicalSummary: string;
  riskTier?: "optimal" | "borderline" | "elevated" | "high";
  accelerationScore?: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: MessageSource[];
  safety_alerts?: string[];
  created_at: string;
  model_used?: string;
  confidence_score?: number;
  reasoning_trace?: string[];
  follow_up_questions?: string[];
  lstm_forecast?: LstmBiomarkerForecast;
  neural_telemetry?: NeuralTelemetry;
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  messages?: Message[];
}

export interface LaboratoryMeasurement {
  id: number;
  report_id: number;
  test_name: string;
  name?: string;
  category: string;
  value: number;
  unit: string;
  reference_low?: number;
  reference_high?: number;
  reference_text?: string;
  reference_range?: string;
  is_abnormal?: boolean;
  flag: "normal" | "low" | "high" | "critical" | "critical_high" | "critical_low";
  user_verified?: boolean;
  confidence: number;
  original_value?: number;
  original_unit?: string;
  previous_value?: number;
  change_pct?: number;
  verification_status?: "pending" | "verified" | "corrected" | "uncertain" | "rejected";
  verified_by?: string;
  verified_at?: string;
  created_at?: string;
  notes?: string;
}

export interface MedicalReport {
  id: number;
  user_id: number;
  title: string;
  report_type: string;
  report_date: string;
  status: string;
  file_name?: string;
  summary?: string;
  ai_interpretation?: string;
  extraction_confidence: number;
  requires_verification: boolean;
  created_at: string;
  measurement_count: number;
  abnormal_count: number;
  laboratory_name?: string;
  patient_mrn?: string;
  triage_priority?: "stat_critical" | "urgent" | "routine" | "incomplete";
  clinician_status?: "pending" | "reviewed" | "approved" | "escalated" | "rejected";
  clinician_notes?: string;
  clinician_reviewed_at?: string;
  assigned_clinician?: string;
  review_deadline?: string;
  audit_token?: string;
  escalation_reason?: string;
  escalation_department?: string;
  measurements?: LaboratoryMeasurement[];
}

export interface HealthMeasurement {
  id: number;
  user_id: number;
  metric_type: string;
  value: number;
  secondary_value?: number;
  unit: string;
  recorded_at: string;
  source: string;
  notes?: string;
}

export interface HealthMetricSummary {
  metric_type: string;
  unit: string;
  latest_value: number;
  latest_secondary?: number;
  latest_date: string;
  min_value: number;
  max_value: number;
  average: number;
  status: "normal" | "elevated" | "low" | "irregular";
}

export interface DiseaseCondition {
  id: number;
  name: string;
  specialty: string;
  summary: string;
  symptoms?: string[];
  risk_factors?: string[];
  diagnostic_tests?: string[];
  clinical_guidelines?: string;
  last_reviewed: string;
  pmid_references?: string[];
}

export interface GeneAssociation {
  id: number;
  gene_symbol: string;
  gene_name: string;
  chromosome?: string;
  inheritance_pattern?: string;
  associated_condition: string;
  doid?: string;
  omim_id?: string;
  pmid?: string;
  description: string;
  clinical_uncertainty_note?: string;
}

export interface MedicalReference {
  id: number;
  title: string;
  authors?: string;
  journal?: string;
  publication_year?: number;
  doi?: string;
  pmid?: string;
  abstract?: string;
  key_findings?: string;
  category: string;
  evidence_level: string;
  url?: string;
  is_bookmarked?: boolean;
}

export interface ResearchBookmark {
  id: number;
  user_id?: number;
  reference_id: number;
  notes?: string;
  created_at: string;
  reference?: MedicalReference;
}

export interface PersonalRecord {
  id: number;
  user_id: number;
  title: string;
  category: string;
  record_date: string;
  doctor_or_facility?: string;
  summary?: string;
  tags?: string[];
  created_at: string;
}

export interface UserConsent {
  id: number;
  consent_type: string;
  granted: boolean;
  version: string;
  updated_at: string;
}

export interface ShapExplanation {
  feature_name: string;
  display_name: string;
  feature_value: string;
  shap_value: number;
  direction: 'positive' | 'negative';
  magnitude: 'high' | 'moderate' | 'low';
  reference_cohort_mean: string;
  clinical_relevance: string;
}

export interface ModelTransparencyInfo {
  model_name: string;
  version: string;
  training_dataset: string;
  sample_size: number;
  train_size?: number;
  test_size?: number;
  training_date?: string;
  validation_method: string;
  roc_auc: number;
  cv_auc_mean?: number;
  cv_auc_std?: number;
  sensitivity?: number;
  specificity?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  brier_score?: number;
  calibration_status: string;
  known_limitations: string;
  intended_population: string;
  clinical_causation_notice?: string;
}

export interface ClinicalEvidenceCitation {
  guideline: string;
  authors?: string;
  journal?: string;
  year?: number;
  pmid?: string;
  doi?: string;
  recommendation: string;
  url?: string;
}

export interface DataCompletenessInfo {
  score_pct: number;
  is_sufficient: boolean;
  present_features: string[];
  missing_features: string[];
  status_message: string;
}

export interface CeliacRiskRequest {
  age: number;
  gender: string;
  diabetes: string;
  diabetes_type?: string;
  diarrhoea: string;
  abdominal_pain: string;
  short_stature: string;
  sticky_stool: string;
  weight_loss: string;
  iga: number;
  igg: number;
  igm: number;
  anti_ttg_iga?: number;
  total_iga?: number;
  anti_dgp_igg?: number;
  ema_iga?: string;
  symptom_duration?: string;
  gi_symptoms?: string[];
  family_history_celiac?: string;
  family_inherited_conditions?: string[];
  genetic_testing_hla?: string;
  ethnicity?: string;
  lab_measurement_date?: string;
  lab_source?: string;
  existing_diagnoses?: string[];
  missing_critical_data?: boolean;
}

export interface CeliacRiskResponse {
  estimated_risk_probability: number;
  risk_level: string;
  predicted_classification: string;
  confidence_interval: number[];
  model_provenance: {
    algorithm: string;
    version: string;
    sample_count: number;
    test_auc: number;
    test_accuracy: number;
  };
  contributing_factors: string[];
  recommended_clinical_followup: string[];
  disclaimer: string;
  data_completeness?: DataCompletenessInfo;
  shap_explanations?: ShapExplanation[];
  model_transparency?: ModelTransparencyInfo;
  evidence_citations?: ClinicalEvidenceCitation[];
  clinician_review?: any;
}

export interface ClinicianModelReviewRequest {
  review_status: 'approved' | 'rejected' | 'escalated';
  clinician_notes: string;
  reviewer_name?: string;
  escalation_department?: string;
  corrected_inputs?: Record<string, any>;
}

export interface ClinicianModelReviewResponse {
  status: string;
  review_id: string;
  reviewed_at: string;
  reviewer_name: string;
  review_status: string;
  clinician_notes: string;
  escalation_department?: string;
  audit_token: string;
  disclaimer: string;
}

export interface ProviderStatus {
  current_provider: string;
  providers: Record<
    string,
    {
      name: string;
      configured: boolean;
      model: string;
      description: string;
    }
  >;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "critical" | "report_ready";
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface ClinicianReportItem extends MedicalReport {
  patient_id?: number;
  patient_name?: string;
  patient_email?: string;
  patient_mrn?: string;
  laboratory_name?: string;
  assigned_clinician?: string;
  review_deadline?: string;
  clinician_notes?: string;
  clinician_status?: "pending" | "reviewed" | "approved" | "escalated" | "rejected";
  clinician_reviewed_at?: string;
  triage_priority?: "stat_critical" | "urgent" | "routine" | "incomplete";
  escalation_reason?: string;
  escalation_department?: string;
  audit_token?: string;
}

export interface BiomarkerTrendPoint {
  date: string;
  report_title?: string;
  value: number;
  flag: string;
  is_abnormal?: boolean;
}

export interface BiomarkerTrendSeries {
  test_name?: string;
  biomarker_name?: string;
  category?: string;
  current_value?: number;
  unit: string;
  reference_low?: number;
  reference_high?: number;
  reference_text?: string;
  flag?: string;
  trend_direction?: "increasing" | "decreasing" | "stable";
  data_points?: BiomarkerTrendPoint[];
  points?: BiomarkerTrendPoint[];
}

export interface MedicalEvidenceCitation {
  title: string;
  organization?: string;
  journal?: string;
  pmid: string;
  publication_year?: number;
  url: string;
  relevance: string;
  limitations?: string;
}

export interface ClinicianSignOffRequest {
  clinician_notes: string;
  decision: "approved" | "reviewed" | "rejected" | "escalated";
  reviewed_sections?: string[];
  attending_physician?: string;
  department?: string;
  escalation_reason?: string;
  escalation_department?: string;
  clinician_name?: string;
  clinician_role?: string;
  verification_checklist?: Record<string, boolean>;
}

export interface ClinicianSignOffResponse {
  status: string;
  report_id: number;
  audit_token: string;
  signed_off_at: string;
  attending_physician?: string;
  clinician_name?: string;
  clinician_role?: string;
  verified_measurement_count?: number;
  statutory_disclaimer?: string;
  decision?: string;
  message?: string;
}

export interface AdminStatsItem {
  total_users: number;
  total_reports: number;
  total_measurements: number;
  total_conversations: number;
  total_audit_events: number;
  database_status: string;
  ai_provider: string;
}

export interface AuditLogItem {
  id: number;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  timestamp: string;
  user_email?: string;
  user_name?: string;
  user_id?: number | null;
  outcome?: string;
  checksum?: string;
}

export interface SearchResultItem {
  category: "Disease" | "Genetics" | "Research" | "Health Record";
  id: number;
  title: string;
  subtitle?: string;
  link: string;
}

// Connected Healthcare & Ingestion Types
export interface Device {
  id: string;
  user_id: number;
  name: string;
  device_type: "wearable" | "sensor" | "iot_gateway" | "clinical_monitor" | "other";
  manufacturer?: string;
  model_number?: string;
  firmware_version?: string;
  serial_number?: string;
  protocol: "bluetooth_le" | "wifi" | "zigbee" | "cellular" | "cloud_api" | "mqtt" | "usb" | "manual";
  status: "active" | "inactive" | "pairing" | "error" | "maintenance";
  battery_level?: number;
  last_sync_at?: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DeviceCreate {
  name: string;
  device_type: "wearable" | "sensor" | "iot_gateway" | "clinical_monitor" | "other";
  manufacturer?: string;
  model_number?: string;
  firmware_version?: string;
  serial_number?: string;
  protocol?: string;
  settings?: Record<string, any>;
}

export interface DeviceStatus {
  device_id: string;
  name: string;
  device_type: string;
  status: string;
  battery_level?: number;
  last_sync_at?: string;
  active_stream: boolean;
}

export interface SensorMeasurement {
  id: number;
  user_id: number;
  device_id?: string;
  measurement_type: string;
  value: number;
  secondary_value?: number;
  unit: string;
  timestamp: string;
  source: string;
  quality_status: "verified" | "calibrated" | "unverified" | "outlier";
  created_at: string;
}

export interface WearableMeasurement {
  id: number;
  user_id: number;
  device_id?: string;
  platform: string;
  metric_type: string;
  value: number;
  unit: string;
  start_time?: string;
  end_time?: string;
  synced_at: string;
}

export interface IngestionResult {
  status: string;
  ingested_count: number;
  rejected_count: number;
  duplicate_count: number;
  quality_status: string;
  message: string;
}

// Healthcare Analytics Types
export interface AnalyticsOverview {
  total_measurements: number;
  active_devices_count: number;
  average_heart_rate?: number;
  latest_blood_pressure?: string;
  latest_spo2?: number;
  data_quality_score: number;
  recent_anomalies_count: number;
  timestamp: string;
}

export interface DeviceHealthItem {
  device_id: string;
  device_name: string;
  device_type: string;
  status: string;
  battery_level?: number;
  last_seen?: string;
  data_points_24h: number;
  error_rate: number;
}

export interface DataQualityReport {
  overall_quality_percentage: number;
  verified_points: number;
  calibrated_points: number;
  unverified_points: number;
  flagged_outliers: number;
  recommendations: string[];
}

// Multi-Agent Types
export interface AgentRun {
  id: string;
  user_id: number;
  agent_type: string;
  task_description: string;
  status: "pending" | "running" | "completed" | "failed" | "requires_review";
  result?: Record<string, any>;
  tool_calls?: Array<Record<string, any>>;
  human_review_required: boolean;
  human_review_notes?: string;
  started_at: string;
  completed_at?: string;
}

// ML Experimentation Types
export interface MLExperiment {
  id: string;
  model_name: string;
  experiment_name: string;
  dataset_name: string;
  parameters?: Record<string, any>;
  metrics: Record<string, any>;
  artifact_path?: string;
  version: string;
  status: string;
  created_at: string;
}

// Advanced AI Medical Assistant Upgrade Types
export interface SymptomCheckRequest {
  primary_symptom: string;
  duration?: string;
  severity: number;
  associated_symptoms?: string[];
  relevant_medical_history?: string[];
  current_medications?: string[];
  user_age?: number;
  user_biological_sex?: string;
}

export interface SymptomCheckResponse {
  triage_level: "EMERGENCY_SOS" | "URGENT_EVALUATION" | "ROUTINE_CLINICAL_REVIEW" | "SELF_CARE_MONITORING" | string;
  urgency_explanation: string;
  red_flags_detected: string[];
  possible_considerations: string[];
  evidence_sources: Array<{
    guideline: string;
    journal: string;
    year: number;
    pmid?: string;
    doi?: string;
    url?: string;
  }>;
  suggested_doctor_questions: string[];
  self_care_precautions: string[];
  emergency_contacts: Record<string, string>;
  statutory_disclaimer: string;
}

export interface MedicationEducationRequest {
  medication_name: string;
  dosage?: string;
  current_conditions?: string[];
  other_medications?: string[];
}

export interface MedicationEducationResponse {
  medication_name: string;
  generic_name: string;
  drug_class: string;
  primary_uses: string[];
  mechanism_of_action: string;
  common_side_effects: string[];
  serious_side_effects_warning: string[];
  precautions_and_warnings: string[];
  potential_interactions: Array<{
    drug: string;
    severity: string;
    effect: string;
  }>;
  food_and_lifestyle_interactions: string[];
  questions_for_pharmacist_or_doctor: string[];
  citations: Array<{
    guideline: string;
    journal: string;
    year: number;
    pmid?: string;
    doi?: string;
    url?: string;
  }>;
  non_prescribing_disclaimer: string;
}

export interface AuthorizedHealthContextResponse {
  user_id: number;
  consent_status: Record<string, boolean>;
  recent_reports: Array<{
    id: number;
    title: string;
    date?: string;
    abnormal_findings_count: number;
    key_abnormals: Array<{
      test: string;
      value: number;
      unit: string;
      flag: string;
    }>;
  }>;
  vitals_summary: {
    blood_pressure?: string;
    resting_heart_rate?: string;
    fasting_blood_glucose?: string;
    [key: string]: any;
  };
  wearables_telemetry?: {
    device_source: string;
    heart_rate?: number;
    spo2?: number;
    hrv_rmssd?: number;
    activity_steps?: number;
    recorded_at?: string;
  } | null;
  family_history_summary: Array<{
    relationship: string;
    first_name?: string;
    conditions: string[];
    maternal_or_paternal: string;
  }>;
  genetic_predispositions: Array<{
    gene: string;
    variant: string;
    significance: string;
    zygosity: string;
  }>;
  active_medications: string[];
  data_minimization_note: string;
}

export interface ConsultationSummaryRequest {
  counsellor_id?: number;
  specialty_requested: string;
  referral_reason: string;
  clinical_priority?: string;
  include_family_tree?: boolean;
  include_genetic_tests?: boolean;
  include_recent_vitals?: boolean;
  include_medications?: boolean;
  consent_granted: boolean;
  notes_for_specialist?: string;
}

export interface ConsultationSummaryResponse {
  referral_id?: number;
  patient_summary: {
    user_id: number;
    full_name: string;
    email: string;
    specialty_requested: string;
    clinical_priority?: string;
  };
  chief_complaint_and_history: string;
  relevant_family_and_genetic_findings: string[];
  key_biomarkers_and_vitals: Array<{
    metric: string;
    value: number;
    unit: string;
  }>;
  prepared_clinical_discussion_points: string[];
  consent_audit_token: string;
  statutory_disclaimer: string;
}

// ==============================================================================
// GENETIC COUNSELOR DISCOVERY & CLINICAL SUPPORT NETWORK
// ==============================================================================

export interface CounselorCredential {
  id?: number;
  credential_type: string;
  issuer_org: string;
  credential_id: string;
  status: "verified" | "pending" | "unverified" | "expired";
  country: string;
  issued_date?: string;
  expiry_date?: string;
  verification_source_url?: string;
  evidence_notes?: string;
}

export interface GeneticCounselor {
  id: string;
  name: string;
  title: string;
  professional_title: string;
  credentials: string;
  qualification: string;
  certification_org: string;
  registration_number: string;
  verification_status: "verified" | "pending" | "unverified" | "expired";
  verification_source?: string;
  institution: string;
  department?: string;
  location: string;
  city: string;
  state_province: string;
  country: string;
  specialty: string;
  subspecialties: string[];
  telehealth: boolean;
  languages: string[];
  bio: string;
  fee: string;
  waitlist_days: number;
  experience_years: number;
  avatar?: string;
  target_loci: string[];
  target_conditions: string[];
  services_offered?: string[];
  consultation_modes?: string[];
  consultation_availability: string;
  is_demo_provider: boolean;
  is_saved?: boolean;
  match_rationale?: string;
  credentials_list?: CounselorCredential[];
}

export interface AppointmentBookingPayload {
  counsellor_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  consultation_purpose: string;
  preferred_date: string;
  preferred_time_slot: string;
  time_zone: string;
  consultation_format: "telehealth" | "in_person";
  intake_notes?: string;
  consent_data_sharing: boolean;
  attached_report_ids?: number[];
  include_pedigree?: boolean;
  doctor_prep_summary_id?: string;
}

export interface AppointmentBookingRecord {
  id: string;
  counsellor_id: string;
  counsellor_name: string;
  patient_name: string;
  patient_email: string;
  consultation_purpose: string;
  preferred_date: string;
  preferred_time_slot: string;
  time_zone: string;
  consultation_format: "telehealth" | "in_person";
  telehealth_link?: string;
  status: "pending" | "accepted" | "rejected" | "rescheduled" | "cancelled";
  reschedule_reason?: string;
  intake_notes?: string;
  consent_data_sharing: boolean;
  audit_token: string;
  created_at: string;
  pre_consultation_instructions: string[];
}

export interface DoctorPrepPayload {
  counselor_id?: string;
  consultation_purpose: string;
  selected_goals: string[];
  family_conditions?: Array<{
    relative: string;
    branch: string;
    condition: string;
    age_at_diagnosis?: number;
  }>;
  relevant_genes?: string[];
  attached_report_ids?: number[];
  include_saved_pedigree?: boolean;
  patient_notes?: string;
}

export interface DoctorPrepBrief {
  id: string;
  consultation_purpose: string;
  family_history_overview: string;
  questions_to_ask: string[];
  documents_to_bring: string[];
  screening_topics: string[];
  missing_information: string[];
  important_uncertainties: string[];
  suggested_counselor_specialty: string;
  suggested_counselor_ids: string[];
  disclaimer: string;
  created_at: string;
}
