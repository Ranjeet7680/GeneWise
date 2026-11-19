export type BiologicalBranch = "maternal" | "paternal" | "immediate";
export type BiologicalSex = "male" | "female" | "other" | "unknown";
export type VitalStatus = "living" | "deceased" | "unknown";
export type GeneticStatus = "untested" | "negative" | "carrier" | "affected" | "variant_of_uncertain_significance" | "unknown";

export type EducationalRiskCategory =
  | "Insufficient information"
  | "No clear pattern identified"
  | "Further discussion may be useful"
  | "Professional genetic evaluation suggested";

export interface FamilyCondition {
  id?: number;
  condition_name: string;
  icd10_code?: string;
  age_of_diagnosis?: number;
  is_genetic_confirmed: boolean;
  notes?: string;
}

export interface FamilyMember {
  id: number;
  first_name?: string;
  last_name?: string;
  relationship: string;
  biological_branch: BiologicalBranch;
  biological_sex: BiologicalSex;
  generation_depth: number;
  is_proband: boolean;
  vital_status: VitalStatus;
  age_current_or_death?: number;
  year_of_birth?: number;
  carrier_status: GeneticStatus;
  notes?: string;
  conditions: FamilyCondition[];
}

export interface FamilyGeneticsOverview {
  family_members_count: number;
  pedigree_completeness_pct: number;
  conditions_recorded_count: number;
  genetic_variants_count: number;
  carrier_conditions_count: number;
  referrals_count: number;
  primary_risk_level: EducationalRiskCategory;
  disclaimer: string;
}

export interface GeneticRiskSummary {
  risk_category: EducationalRiskCategory;
  observed_family_history: string[];
  relevant_inherited_conditions: string[];
  why_pattern_deserves_attention: string[];
  missing_information: string[];
  evidence_and_sources: { title: string; source: string; url?: string; level?: string }[];
  suggested_clinician_questions: string[];
  recommended_next_steps: string[];
  disclaimer: string;
}

export interface CarrierConditionInfo {
  condition_name: string;
  gene_symbol: string;
  inheritance_pattern: string;
  who_should_consider: string[];
  screening_limitations: string[];
  residual_risk_explanation: string;
  partner_testing_guidance: string;
  source_references: string[];
  last_reviewed_date: string;
}

export interface PreconceptionPlan {
  id?: number;
  user_id?: number;
  partner_family_history_collected: boolean;
  known_conditions_reviewed: boolean;
  previous_genetic_tests_reviewed: boolean;
  carrier_screening_discussed: boolean;
  medications_reviewed: boolean;
  vaccinations_reviewed: boolean;
  folic_acid_initiated: boolean;
  clinician_questions_prepared: boolean;
  counsellor_consultation_scheduled: boolean;
  partner_notes?: string;
  medication_notes?: string;
  vaccination_notes?: string;
  custom_questions?: string[];
  follow_up_checklist?: { task: string; completed: boolean }[];
  checklist_state?: Record<string, boolean>;
  created_at?: string;
  updated_at?: string;
}

export interface GeneticCounsellor {
  id: number;
  full_name: string;
  credentials: string;
  specialty: string;
  affiliation: string;
  city: string;
  state: string;
  country?: string;
  telehealth_available: boolean;
  in_person_available?: boolean;
  languages_spoken: string[];
  consultation_fee_inr?: number;
  available_days?: string[];
  bio?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface SpecialistReferral {
  id: number;
  counsellor_id: number;
  counsellor_name: string;
  specialty: string;
  referral_status: "requested" | "scheduled" | "completed" | "cancelled";
  preferred_date?: string;
  reason_for_referral: string;
  notes?: string;
  consent_given: boolean;
  created_at: string;
}

export interface GeneticAssistantResponse {
  summary: string;
  family_history_observations: string[];
  possible_inheritance_patterns: string[];
  educational_risk_category: EducationalRiskCategory;
  evidence: string[];
  uncertainties: string[];
  screening_discussion_options: string[];
  professional_follow_up: string[];
  medical_disclaimer: string;
  audio_base64?: string;
  language?: string;
}
