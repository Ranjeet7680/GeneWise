import logging
import re
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.family_genetics import FamilyGroup, FamilyMemberModel, FamilyHealthConditionModel, GeneticRiskSummary
from app.models.models import User
from app.services.family_genetics_service import FamilyGeneticsService, STANDARD_DISCLAIMER
from app.services.voice_service import MultilingualVoiceService, INDIAN_LANGUAGES

logger = logging.getLogger(__name__)

GENETIC_KNOWLEDGE_BASE = {
    "autosomal_dominant": {
        "title": "Autosomal Dominant Inheritance",
        "description": "A single altered gene copy inherited from either parent is sufficient to increase condition risk. Each child has a 50% chance of inheriting the gene alteration.",
        "examples": ["Familial Hypercholesterolemia (LDLR)", "Huntington Disease (HTT)", "Marfan Syndrome (FBN1)", "Hereditary Breast and Ovarian Cancer (BRCA1/2)"],
        "citations": [{"source": "MedlinePlus Genetics", "url": "https://medlineplus.gov/genetics/understanding/inheritance/dominant/"}],
    },
    "autosomal_recessive": {
        "title": "Autosomal Recessive Inheritance",
        "description": "Two altered copies of the gene (one from each biological parent) are required to express the condition. Carriers (one altered copy) are typically healthy and unaffected.",
        "examples": ["Beta Thalassemia (HBB)", "Sickle Cell Disease (HBB)", "Cystic Fibrosis (CFTR)", "Spinal Muscular Atrophy (SMN1)"],
        "citations": [{"source": "MedlinePlus Genetics", "url": "https://medlineplus.gov/genetics/understanding/inheritance/recessive/"}],
    },
    "x_linked": {
        "title": "X-Linked Inheritance",
        "description": "Caused by gene alterations on the X chromosome. Males (XY) are predominantly affected as they have only one X chromosome. Females (XX) are often asymptomatic carriers.",
        "examples": ["Duchenne Muscular Dystrophy (DMD)", "Hemophilia A & B (F8, F9)", "Fragile X Syndrome (FMR1)"],
        "citations": [{"source": "GeneReviews", "url": "https://www.ncbi.nlm.nih.gov/books/NBK1116/"}],
    },
    "carrier_screening": {
        "title": "Preconception Carrier Screening",
        "description": "Identifies individuals who carry a gene variant for an autosomal recessive or X-linked disorder. A negative result drastically reduces, but cannot entirely eliminate, carrier risk (residual risk).",
        "citations": [{"source": "ACOG Practice Bulletin No. 691", "url": "https://www.acog.org"}],
    },
}

class GeneticAIAssistant:
    @staticmethod
    def answer_genetic_query(
        query: str,
        user: User,
        db: Session,
        language: str = "en-US",
        include_pedigree_context: bool = True,
    ) -> Dict[str, Any]:
        """
        Processes genetic inquiries, providing plain-language educational explanations,
        pedigree-grounded risk context, carrier screening advice, and multilingual voice synthesis.
        Guaranteed to output the required 9-field structured schema.
        """
        query_lower = query.lower()

        # 1. Fetch authorized pedigree context if requested
        observations: List[str] = []
        possible_patterns: List[str] = []
        uncertainties: List[str] = []
        pedigree_summary = ""

        if include_pedigree_context:
            group = db.query(FamilyGroup).filter(FamilyGroup.user_id == user.id).first()
            if group:
                members = db.query(FamilyMemberModel).filter(FamilyMemberModel.group_id == group.id).all()
                conditions = (
                    db.query(FamilyHealthConditionModel)
                    .join(FamilyMemberModel, FamilyHealthConditionModel.member_id == FamilyMemberModel.id)
                    .filter(FamilyMemberModel.group_id == group.id)
                    .all()
                )
                completeness = FamilyGeneticsService.calculate_completeness(members)

                for c in conditions:
                    observations.append(
                        f"{c.condition_name} reported in {c.member.relationship_to_proband} "
                        f"({c.member.branch} branch, age of onset: {c.age_at_diagnosis or 'unspecified'})."
                    )

                if completeness < 65.0:
                    uncertainties.append(
                        f"Family health history completeness is currently at {completeness}%. "
                        "Grandparental and extended relative health details are partially missing."
                    )
                for m in members:
                    if m.history_status in ["incomplete", "unknown"]:
                        uncertainties.append(f"History for {m.relationship_to_proband} is marked as incomplete or unknown.")

                pedigree_summary = f"Your pedigree contains {len(members)} recorded members and {len(conditions)} documented conditions."

        # 2. Analyze query intent
        summary_paragraphs = []
        evidence_list = []
        screening_options = []
        professional_follow_up = []

        is_carrier_query = any(k in query_lower for k in ["carrier", "screening", "preconception", "baby", "pregnancy", "partner", "thalassemia", "sickle", "cystic fibrosis", "sma"])
        is_inheritance_query = any(k in query_lower for k in ["dominant", "recessive", "x-linked", "inherit", "passed down", "pattern", "genetics", "gene", "mutation", "dna"])
        is_cardio_query = any(k in query_lower for k in ["heart", "cardio", "cholesterol", "attack", "hypertension", "ldl"])
        is_cancer_query = any(k in query_lower for k in ["cancer", "brca", "tumor", "breast", "colon", "lynch"])

        if is_carrier_query:
            info = GENETIC_KNOWLEDGE_BASE["carrier_screening"]
            summary_paragraphs.append(
                f"**Carrier Screening Concept:** {info['description']} "
                "It is best conducted prior to conception so that couples have the widest array of reproductive options."
            )
            evidence_list.extend(info["citations"])
            screening_options.extend([
                "Hemoglobinopathy assessment (CBC + Hemoglobin HPLC) for Beta Thalassemia & Sickle Cell trait",
                "Pan-ethnic screening for Spinal Muscular Atrophy (SMN1 copy number)",
                "Cystic Fibrosis (CFTR variant panel)",
                "Expanded Carrier Screening panel (100–500+ conditions) for comprehensive preconception planning",
            ])
            possible_patterns.append("Autosomal Recessive carrier status (both biological parents must carry variants to produce an affected child).")
            professional_follow_up.append("Ask your obstetrician or reproductive geneticist if sequential or simultaneous partner screening is recommended.")

        if is_inheritance_query or is_cardio_query or is_cancer_query:
            if "dominant" in query_lower or is_cardio_query:
                ad = GENETIC_KNOWLEDGE_BASE["autosomal_dominant"]
                summary_paragraphs.append(
                    f"**{ad['title']}:** {ad['description']} Conditions frequently show vertical transmission across multiple generations."
                )
                possible_patterns.append("Autosomal Dominant inheritance pattern consideration.")
                evidence_list.extend(ad["citations"])

            if "recessive" in query_lower:
                ar = GENETIC_KNOWLEDGE_BASE["autosomal_recessive"]
                summary_paragraphs.append(
                    f"**{ar['title']}:** {ar['description']} Often skips generations, appearing horizontally among siblings."
                )
                possible_patterns.append("Autosomal Recessive inheritance pattern consideration.")
                evidence_list.extend(ar["citations"])

            if "x-linked" in query_lower or "x linked" in query_lower:
                xl = GENETIC_KNOWLEDGE_BASE["x_linked"]
                summary_paragraphs.append(
                    f"**{xl['title']}:** {xl['description']} Carrier mothers have a 50% chance of passing the condition to sons."
                )
                possible_patterns.append("X-Linked Recessive inheritance pattern consideration.")
                evidence_list.extend(xl["citations"])

        # Fallback / General explanation
        if not summary_paragraphs:
            summary_paragraphs.append(
                "In clinical genetics, family health history serves as a window into shared inherited predispositions, "
                "lifestyle factors, and common environmental exposures. Recognizing multi-generational patterns helps identify "
                "whether a condition is likely monogenic (Mendelian, such as a single high-impact gene mutation) or polygenic/multifactorial "
                "(many common variants interacting with lifestyle)."
            )
            evidence_list.append({
                "source": "MedlinePlus Genetics (NIH)",
                "title": "What does it mean to have a genetic predisposition to a disease?",
                "url": "https://medlineplus.gov/genetics/understanding/mutationsanddisorders/predisposition/",
            })

        # Determine Category
        if any("pathogenic" in obs.lower() for obs in observations) or len(observations) >= 4:
            educational_category = "Professional genetic evaluation suggested"
        elif len(observations) >= 2 or is_carrier_query:
            educational_category = "Further discussion may be useful"
        elif len(observations) == 0:
            educational_category = "No clear pattern identified"
        else:
            educational_category = "Further discussion may be useful"

        professional_follow_up.extend([
            "What specific surveillance guidelines apply to my personal risk category?",
            "Are there non-genetic risk factors (diet, exercise, biomarkers) that I should prioritize managing?",
            "Would clinical genetic counselling clarify ambiguous family findings?",
        ])

        summary_text = f"{pedigree_summary} " + "\n\n".join(summary_paragraphs) if pedigree_summary else "\n\n".join(summary_paragraphs)

        # 3. Multilingual voice synthesis if requested
        audio_b64 = None
        if language and language != "en-US" and language in INDIAN_LANGUAGES:
            try:
                voice_svc = MultilingualVoiceService()
                lang_meta = INDIAN_LANGUAGES[language]
                native_text, roman_text, eng_text = voice_svc._generate_multilingual_speech(
                    base_summary=summary_text[:300],
                    query=query,
                    language=language
                )
                # If native speech generated, provide localized greeting & summary note
                summary_text = f"[{lang_meta['name']} ({lang_meta['native']}) Translation]: {native_text}\n\n" + summary_text
            except Exception as e:
                logger.warning(f"Voice localization fallback: {e}")

        return {
            "summary": summary_text,
            "family_history_observations": observations if observations else ["No previous high-risk conditions reported in pedigree."],
            "possible_inheritance_patterns": possible_patterns if possible_patterns else ["Multifactorial / polygenic baseline risk"],
            "educational_risk_category": educational_category,
            "evidence": evidence_list,
            "uncertainties": uncertainties if uncertainties else ["Pedigree information appears consistent with self-reported records."],
            "screening_discussion_options": screening_options if screening_options else [
                "Routine pre-conception or wellness screening review with primary care physician.",
                "Review of common adult health biomarkers (blood pressure, lipid profile, fasting glucose).",
            ],
            "professional_follow_up": professional_follow_up,
            "medical_disclaimer": STANDARD_DISCLAIMER,
            "audio_content_base64": audio_b64,
            "language": language,
        }
