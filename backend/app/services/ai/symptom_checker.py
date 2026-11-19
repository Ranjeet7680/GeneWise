"""
MediPredict AI — Clinical Symptom Checker & Triage Intelligence Engine
Provides evidence-based educational symptom assessment, red-flag warning sign detection,
triage urgency categorization, guideline citations, and physician discussion prompts.

STATUTORY CLINICAL NOTICE:
This engine provides educational health and symptom awareness only. It does NOT provide
definitive clinical diagnoses, prescribe treatments, or replace direct clinical evaluation
by a licensed, qualified healthcare professional. In a medical emergency, call 112 / 911 / 999.
"""

import re
from typing import Any, Dict, List, Optional, Tuple

RED_FLAG_PATTERNS = [
    {
        "pattern": re.compile(r"\b(?:crushing.*chest\s+pain|chest\s+pressure.*arm|left\s+arm\s+pain.*sweat|heart\s+attack|chest\s+tightness.*jaw)\b", re.IGNORECASE),
        "name": "Acute Coronary Syndrome / Myocardial Infarction Warning",
        "guidance": "Severe crushing chest pain radiating to the left arm or jaw with diaphoresis requires immediate emergency catheterization triage."
    },
    {
        "pattern": re.compile(r"\b(?:stroke|face\s+drooping|arm\s+weakness|slurred\s+speech|sudden\s+numbness.*one\s+side|loss\s+of\s+vision.*one\s+eye)\b", re.IGNORECASE),
        "name": "Acute Cerebrovascular Event (Stroke - FAST Protocol)",
        "guidance": "Sudden facial asymmetry, unilateral arm drift, or slurred speech requires immediate emergency neurological care within the thrombolytic window."
    },
    {
        "pattern": re.compile(r"\b(?:severe\s+shortness\s+of\s+breath|can'?t\s+breathe|suffocating|choking|anaphylaxis|throat\s+swelling|blue\s+lips|cyanosis)\b", re.IGNORECASE),
        "name": "Acute Respiratory Distress / Severe Airway Compromise",
        "guidance": "Acute inability to breathe, stridor, or cyanosis requires immediate emergency airway stabilization."
    },
    {
        "pattern": re.compile(r"\b(?:coughing.*blood|hemoptysis|vomiting.*blood|hematemesis|uncontrolled\s+bleeding|profuse\s+bleeding|black\s+tarry\s+stool)\b", re.IGNORECASE),
        "name": "Acute Hemorrhage / Upper Gastrointestinal Bleed",
        "guidance": "Active hematemesis, hemoptysis, or hemodynamic instability warrants immediate emergency medical evaluation."
    },
    {
        "pattern": re.compile(r"\b(?:stiff\s+neck.*fever|photophobia.*fever|thunderclap\s+headache|worst\s+headache.*life|seizure\s+lasting)\b", re.IGNORECASE),
        "name": "Acute Meningeal / Intracranial Pathology",
        "guidance": "Fever with nuchal rigidity or sudden severe thunderclap headache warrants immediate emergency exclusion of subarachnoid hemorrhage or meningitis."
    },
    {
        "pattern": re.compile(r"\b(?:suicid|kill\s+myself|end\s+my\s+life|want\s+to\s+die|self-harm)\b", re.IGNORECASE),
        "name": "Psychiatric Emergency / Crisis Alert",
        "guidance": "If you or someone you know is having thoughts of suicide or self-harm, please contact the National Suicide Prevention Lifeline (988 in USA/Canada, 14416 / Tele-MANAS in India, 111 in UK) immediately."
    },
]

ORGAN_SYSTEM_MAPPINGS = {
    "cardiovascular": {
        "keywords": ["chest pain", "chest pressure", "palpitations", "racing heart", "irregular heartbeat", "ankle swelling", "edema", "shortness of breath lying flat", "orthopnea"],
        "considerations": [
            "Coronary artery disease / angina pectoris (requires ECG & troponin evaluation)",
            "Benign or pathological cardiac arrhythmias (e.g., supraventricular tachycardia, atrial fibrillation)",
            "Hypertensive heart disease or vascular stiffness",
            "Non-cardiac chest discomfort (costochondritis, gastroesophageal reflux, musculoskeletal strain)"
        ],
        "evidence": {
            "guideline": "2023 AHA/ACC Guideline for the Management of Patients With Chronic Coronary Disease",
            "journal": "Circulation",
            "year": 2023,
            "pmid": "37471501",
            "doi": "10.1161/CIR.0000000000001168",
            "url": "https://pubmed.ncbi.nlm.nih.gov/37471501/"
        },
        "questions": [
            "Does the discomfort change with exertion, deep inspiration, or pressing on the chest wall?",
            "Do you have a personal or family history of early cardiovascular disease, high cholesterol, or hypertension?",
            "Would a resting 12-lead electrocardiogram (ECG) and baseline troponin assay be appropriate?"
        ]
    },
    "respiratory": {
        "keywords": ["cough", "shortness of breath", "wheezing", "chest congestion", "mucus", "phlegm", "sore throat", "stridor"],
        "considerations": [
            "Acute viral upper respiratory tract infection (common cold, influenza)",
            "Bronchial hyperreactivity, reactive airway disease, or asthma exacerbation",
            "Acute bronchitis or lower respiratory tract involvement (pneumonia)",
            "Allergic rhinosinusitis or post-nasal drip cough reflex"
        ],
        "evidence": {
            "guideline": "Global Initiative for Asthma (GINA) Strategy Report 2023",
            "journal": "Am J Respir Crit Care Med",
            "year": 2023,
            "pmid": "37213812",
            "doi": "10.1164/rccm.202302-0315PP",
            "url": "https://pubmed.ncbi.nlm.nih.gov/37213812/"
        },
        "questions": [
            "Are symptoms triggered by cold air, exercise, dust, or nighttime exposure?",
            "Have you noticed fevers, chills, or colored sputum production?",
            "Would spirometry, peak flow monitoring, or a chest radiograph be indicated?"
        ]
    },
    "gastrointestinal": {
        "keywords": ["abdominal pain", "stomach pain", "heartburn", "acid reflux", "nausea", "vomiting", "diarrhea", "constipation", "bloating", "gas", "indigestion", "sticky stool"],
        "considerations": [
            "Gastroesophageal reflux disease (GERD) or functional dyspepsia",
            "Acute gastroenteritis (viral or food-borne enteropathy)",
            "Immune-mediated enteropathy (celiac disease, especially with HLA-DQ2/8 predisposition)",
            "Irritable bowel syndrome (IBS) or food intolerance (lactose, FODMAPs)"
        ],
        "evidence": {
            "guideline": "ACG Clinical Guidelines: Diagnosis and Management of Celiac Disease",
            "journal": "Am J Gastroenterol",
            "year": 2023,
            "pmid": "36637387",
            "doi": "10.14309/ajg.0000000000002162",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36637387/"
        },
        "questions": [
            "Are symptoms correlated with specific foods such as gluten-containing grains, dairy, or spicy meals?",
            "Have you experienced unintended weight loss, nocturnal symptoms, or family history of GI disorders?",
            "Should we perform anti-tTG IgA serology, complete blood count, or endoscopic evaluation?"
        ]
    },
    "neurological": {
        "keywords": ["headache", "migraine", "dizziness", "vertigo", "lightheadedness", "tingling", "pins and needles", "tremor", "memory lapse"],
        "considerations": [
            "Primary headache disorders (tension-type headache, episodic migraine)",
            "Benign paroxysmal positional vertigo (BPPV) or vestibular neuritis",
            "Cervicogenic cephalalgia or postural musculoskeletal tension",
            "Orthostatic hypotension or dehydration-related presyncope"
        ],
        "evidence": {
            "guideline": "AAN/AHS Guideline on Pharmacologic Treatment for Episodic Migraine Prevention",
            "journal": "Neurology",
            "year": 2022,
            "pmid": "35131920",
            "doi": "10.1212/WNL.0000000000200115",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35131920/"
        },
        "questions": [
            "Is the headache accompanied by visual auras, nausea, photophobia, or neck stiffness?",
            "Does dizziness occur with changes in head position or upon standing up rapidly?",
            "Are there any focal neurological deficits such as unilateral limb weakness or facial numbness?"
        ]
    },
    "endocrine_metabolic": {
        "keywords": ["fatigue", "tiredness", "weight loss", "weight gain", "excessive thirst", "frequent urination", "heat intolerance", "cold intolerance", "hair loss"],
        "considerations": [
            "Impaired fasting glucose or emerging Type 2 Diabetes Mellitus",
            "Thyroid axis dysfunction (primary hypothyroidism or thyrotoxicosis)",
            "Nutritional deficiencies (Vitamin D, Vitamin B12, serum iron deficiency)",
            "Chronic physiological sleep deprivation or metabolic fatigue"
        ],
        "evidence": {
            "guideline": "Standards of Care in Diabetes—2024",
            "journal": "Diabetes Care",
            "year": 2024,
            "pmid": "38078580",
            "doi": "10.2337/dc24-Sint",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38078580/"
        },
        "questions": [
            "Have you noticed increased fluid intake, nocturnal urination, or unexplained fluctuations in body mass?",
            "Have you had recent laboratory testing for HbA1c, TSH, Free T4, or ferritin?",
            "Are there family members with autoimmune diabetes, thyroid disease, or metabolic disorders?"
        ]
    },
    "musculoskeletal": {
        "keywords": ["joint pain", "knee pain", "back pain", "neck pain", "muscle aches", "stiffness", "swelling in joints", "arthritis"],
        "considerations": [
            "Mechanical strain, ligamentous sprain, or postural myofascial syndrome",
            "Degenerative joint disease (osteoarthritis of load-bearing joints)",
            "Systemic or post-viral inflammatory arthralgia",
            "Tendinopathy or bursitis secondary to repetitive motion"
        ],
        "evidence": {
            "guideline": "2022 ACR Guideline for the Management of Musculoskeletal Pain & Osteoarthritis",
            "journal": "Arthritis Care Res",
            "year": 2022,
            "pmid": "31908149",
            "doi": "10.1002/acr.24131",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31908149/"
        },
        "questions": [
            "Is morning stiffness present for longer than 30 minutes, or does movement improve or worsen the pain?",
            "Is there localized heat, redness, or joint effusion?",
            "Would physical therapy, targeted radiography, or inflammatory serology (CRP, ESR) be helpful?"
        ]
    }
}

STANDARD_SYMPTOM_DISCLAIMER = (
    "MediPredict AI provides educational health and symptom awareness. It does not diagnose medical conditions, "
    "prescribe therapies, or replace clinical consultation with a qualified medical doctor. In the event of an acute "
    "emergency (such as crushing chest pain, stroke signs, or severe breathing difficulty), call 112 / 911 / 999 immediately."
)

class SymptomCheckerService:
    @classmethod
    def evaluate_symptoms(
        cls,
        symptoms: Optional[Any] = None,
        primary_symptom: Optional[str] = None,
        duration: str = "1-3 days",
        severity: int = 5,
        associated_symptoms: Optional[List[str]] = None,
        medical_history: Optional[List[str]] = None,
        relevant_medical_history: Optional[List[str]] = None,
        current_medications: Optional[List[str]] = None,
        user_age: Optional[int] = None,
        user_biological_sex: Optional[str] = None,
        language: str = "en-IN",
    ) -> Dict[str, Any]:
        """
        Executes structured symptom evaluation, red-flag triage, differential considerations,
        guideline retrieval, and clinical question formulation.
        """
        sym_list = []
        if primary_symptom:
            sym_list.append(primary_symptom)
        if isinstance(symptoms, list):
            sym_list.extend(symptoms)
        elif isinstance(symptoms, str) and symptoms:
            sym_list.append(symptoms)

        history_list = list(medical_history or []) + list(relevant_medical_history or [])

        combined_text = " ".join(sym_list + (associated_symptoms or []) + [duration]).lower()

        # 1. Red Flag & Emergency Screening
        red_flags_identified = []
        is_emergency = False
        emergency_instructions = None

        for red_flag in RED_FLAG_PATTERNS:
            if red_flag["pattern"].search(combined_text):
                red_flags_identified.append(f"{red_flag['name']}: {red_flag['guidance']}")
                is_emergency = True

        if is_emergency or severity >= 9:
            is_emergency = True
            triage_level = "EMERGENCY_SOS"
            emergency_instructions = (
                "CRITICAL WARNING: The reported symptoms suggest a potentially life-threatening medical emergency. "
                "Do NOT wait for an online assessment or appointment. Call emergency services immediately "
                "(112 in India, 911 in North America, 999 in UK) or proceed directly to the nearest emergency department."
            )
        elif severity >= 7 or "weeks" in duration.lower() or "months" in duration.lower():
            triage_level = "URGENT_EVALUATION"
        elif severity >= 4 or (medical_history and len(medical_history) > 0):
            triage_level = "ROUTINE_CLINICAL_REVIEW"
        else:
            triage_level = "SELF_CARE_MONITORING"

        # 2. Organ System Matching
        matched_systems = []
        primary_considerations = []
        clinical_evidence = []
        recommended_questions = []

        for sys_name, sys_data in ORGAN_SYSTEM_MAPPINGS.items():
            matches = [kw for kw in sys_data["keywords"] if kw in combined_text]
            if matches:
                matched_systems.append(sys_name)
                primary_considerations.extend(sys_data["considerations"][:2])
                clinical_evidence.append(sys_data["evidence"])
                recommended_questions.extend(sys_data["questions"][:2])

        # Fallback if no specific organ system matched
        if not primary_considerations:
            primary_considerations = [
                "Nonspecific constitutional or physiological symptom pattern",
                "Transient viral syndrome or lifestyle/environmental adaptation",
                "Requires routine baseline clinical evaluation if symptoms persist or escalate"
            ]
            clinical_evidence.append({
                "guideline": "Evidence-Based Primary Care Diagnostic Triage Principles",
                "journal": "Annals of Internal Medicine",
                "year": 2023,
                "pmid": "36805128",
                "doi": "10.7326/M22-2900",
                "url": "https://pubmed.ncbi.nlm.nih.gov/36805128/"
            })
            recommended_questions = [
                "What timeline should I monitor before seeking in-person clinical evaluation?",
                "Are there specific warning signs that should prompt earlier care?",
                "Could any of my current daily medications or supplements be contributing to these symptoms?"
            ]

        # 3. Personalized Context Deductions
        personalized_insights = []
        if medical_history:
            for hist in medical_history:
                if "diabetes" in hist.lower() and any(w in combined_text for w in ["thirst", "frequent", "fatigue", "vision"]):
                    personalized_insights.append("Given your documented history of diabetes, glycemic variability or elevated HbA1c should be evaluated with your endocrinologist.")
                if "hypertension" in hist.lower() and any(w in combined_text for w in ["headache", "dizziness", "chest", "vision"]):
                    personalized_insights.append("In patients with pre-existing hypertension, serial home blood pressure monitoring (morning and evening) is strongly recommended.")
                if "celiac" in hist.lower() and any(w in combined_text for w in ["diarrhea", "pain", "bloating"]):
                    personalized_insights.append("Your history of celiac disease highlights the importance of evaluating strict dietary gluten adherence and potential cross-contamination.")

        if current_medications:
            for med in current_medications:
                personalized_insights.append(f"Consider discussing potential side-effects or interactions of {med} with your prescribing physician or clinical pharmacist.")

        # 4. Formulate Educational Guidance
        symptom_list_str = ", ".join(sym_list) if sym_list else "Reported Symptoms"
        duration_note = f"duration reported as {duration}" if duration else "acute timeline"
        severity_label = f"severity rated {severity}/10"

        guidance_sections = [
            f"### Educational Symptom Assessment for: {symptom_list_str.title()}",
            f"**Reported Timeline & Intensity:** {duration_note.capitalize()}, {severity_label}.",
            "",
            "#### Potential Educational Considerations (Not a Diagnosis):",
            "\n".join([f"- **{c}**" for c in primary_considerations]),
            "",
            "#### Recommended Professional Evaluation Pathway:",
            f"- **Triage Urgency Category:** `{triage_level.replace('_', ' ')}`",
        ]

        if triage_level == "EMERGENCY_SOS":
            guidance_sections.append(f"- **Critical Action:** {emergency_instructions}")
        elif triage_level == "URGENT_EVALUATION":
            guidance_sections.append("- **Recommended Next Step:** Schedule an urgent care or same-day clinical appointment within 24 to 48 hours.")
        elif triage_level == "ROUTINE_CLINICAL_REVIEW":
            guidance_sections.append("- **Recommended Next Step:** Schedule a routine consultation with your primary care physician within the next 1–2 weeks.")
        else:
            guidance_sections.append("- **Recommended Next Step:** Supportive self-care and close monitoring. Seek formal clinical care if symptoms escalate or persist beyond 5-7 days.")

        if personalized_insights:
            guidance_sections.extend([
                "",
                "#### Personal Health Context Observations:",
                "\n".join([f"- {pi}" for pi in personalized_insights])
            ])

        educational_guidance = "\n".join(guidance_sections)

        urgency_explanation = emergency_instructions or (
            "Schedule an urgent care or same-day clinical appointment within 24 to 48 hours."
            if triage_level == "URGENT_EVALUATION"
            else "Schedule a routine consultation with your primary care physician within the next 1–2 weeks."
            if triage_level == "ROUTINE_CLINICAL_REVIEW"
            else "Supportive self-care and symptom monitoring at home."
        )

        return {
            "triage_level": triage_level,
            "is_emergency": is_emergency,
            "urgency_explanation": urgency_explanation,
            "emergency_instructions": emergency_instructions,
            "red_flags_detected": red_flags_identified,
            "red_flags_identified": red_flags_identified,
            "possible_considerations": primary_considerations,
            "primary_considerations": primary_considerations,
            "matched_systems": matched_systems,
            "evidence_sources": clinical_evidence,
            "clinical_evidence": clinical_evidence,
            "suggested_doctor_questions": recommended_questions[:3],
            "recommended_questions_for_doctor": recommended_questions[:3],
            "self_care_precautions": [
                "Maintain adequate oral hydration with water and electrolyte broths.",
                "Rest in a comfortable, quiet space and avoid strenuous physical exertion.",
                "Seek immediate emergency evaluation if severe red-flag warning signs develop."
            ],
            "emergency_contacts": {
                "India / EU": "112",
                "North America": "911",
                "United Kingdom": "999",
                "India Ambulance": "108"
            },
            "educational_guidance": educational_guidance,
            "statutory_disclaimer": STANDARD_SYMPTOM_DISCLAIMER,
            "disclaimer": STANDARD_SYMPTOM_DISCLAIMER,
        }
