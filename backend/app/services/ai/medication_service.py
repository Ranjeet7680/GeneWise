"""
MediPredict AI — Medication Education & Drug Intelligence Service
Provides evidence-based pharmacology reference monographs, interaction screening,
lifestyle/dietary precautions, patient discussion questions, and statutory non-prescribing safeguards.

STATUTORY CLINICAL NOTICE:
This module provides educational medication guidance only. It does NOT prescribe,
recommend dosage changes, or replace licensed pharmacist or physician consultation.
"""

import re
from typing import Any, Dict, List, Optional

MEDICATION_MONOGRAPHS: Dict[str, Dict[str, Any]] = {
    "metformin": {
        "generic_name": "Metformin Hydrochloride",
        "brand_names": ["Glucophage", "Fortamet", "Glumetza", "Riomet"],
        "drug_class": "Biguanide Antihyperglycemic Agent",
        "primary_uses": [
            "First-line oral management of Type 2 Diabetes Mellitus in adults and children >=10 years",
            "Off-label management of polycystic ovary syndrome (PCOS) with insulin resistance",
            "Pre-diabetes progression reduction under clinical supervision"
        ],
        "mechanism_of_action": (
            "Decreases hepatic glucose production (gluconeogenesis), decreases intestinal absorption of glucose, "
            "and improves insulin sensitivity by increasing peripheral glucose uptake and utilization via AMPK activation."
        ),
        "common_side_effects": [
            "Gastrointestinal upset (diarrhea, nausea, vomiting, flatulence, abdominal discomfort)",
            "Metallic taste in the mouth",
            "Reduced appetite",
            "Vitamin B12 deficiency with long-term therapy"
        ],
        "serious_side_effects_warning": [
            "Lactic Acidosis (rare but life-threatening metabolic emergency; risk increases with severe renal impairment, hepatic disease, acute heart failure, hypoxemia, or sepsis)",
            "Severe hypoglycemia (typically when combined with insulin or secretagogues like sulfonylureas)"
        ],
        "precautions_and_warnings": [
            "Renal Monitoring: Estimated GFR should be assessed prior to initiation and periodically. Contraindicated if eGFR <30 mL/min/1.73m².",
            "Iodinated Radiocontrast Procedures: Temporarily withhold at or before iodinated contrast imaging in patients with eGFR 30-60 mL/min; re-evaluate 48 hours post-procedure.",
            "Alcohol Avoidance: Excessive acute or chronic alcohol intake potentiates lactic acidosis risk.",
            "Long-term B12 Monitoring: Periodic serum vitamin B12 assessment is recommended every 2-3 years."
        ],
        "interactions": [
            {"drug": "cimetidine", "severity": "Moderate", "effect": "Competes for renal OCT2 transporters, increasing metformin plasma levels."},
            {"drug": "furosemide", "severity": "Moderate", "effect": "Increases metformin plasma concentrations without altering renal clearance."},
            {"drug": "iodinated contrast", "severity": "High", "effect": "Risk of acute contrast-induced nephropathy leading to severe lactic acidosis accumulation."}
        ],
        "food_and_lifestyle_interactions": [
            "Take with meals to significantly mitigate gastrointestinal adverse events.",
            "Avoid excessive alcohol consumption (binge drinking increases lactic acidosis risk).",
            "Maintain consistent dietary carbohydrate intake and stay well-hydrated."
        ],
        "questions_for_doctor": [
            "What is my most recent kidney function test (eGFR) and does my current dose remain safe?",
            "Should we check my serum Vitamin B12 levels if I have been taking metformin long-term?",
            "What should I do if I am scheduled for any contrast CT scan or surgery?"
        ],
        "citation": {
            "guideline": "Standards of Care in Diabetes—2024",
            "journal": "Diabetes Care",
            "year": 2024,
            "pmid": "38078580",
            "doi": "10.2337/dc24-Sint",
            "url": "https://pubmed.ncbi.nlm.nih.gov/38078580/"
        }
    },
    "atorvastatin": {
        "generic_name": "Atorvastatin Calcium",
        "brand_names": ["Lipitor", "Atorva", "Storvas"],
        "drug_class": "HMG-CoA Reductase Inhibitor (Statin)",
        "primary_uses": [
            "Reduction of elevated total cholesterol, LDL-C, and triglycerides in primary hyperlipidemia",
            "Primary and secondary prevention of atherosclerotic cardiovascular events (MI, stroke, revascularization)"
        ],
        "mechanism_of_action": (
            "Competitively inhibits 3-hydroxy-3-methylglutaryl-coenzyme A (HMG-CoA) reductase, the rate-limiting enzyme "
            "in hepatic cholesterol biosynthesis, upregulating LDL receptors on hepatocytes and accelerating LDL-C clearance."
        ),
        "common_side_effects": [
            "Myalgia and mild muscle aches",
            "Mild gastrointestinal symptoms (diarrhea, dyspepsia, nausea)",
            "Nasopharyngitis or joint pain (arthralgia)",
            "Modest elevation in fasting blood glucose or HbA1c"
        ],
        "serious_side_effects_warning": [
            "Rhabdomyolysis with acute kidney injury secondary to myoglobinuria (manifests as severe muscle pain, weakness, and dark tea-colored urine)",
            "Immune-mediated necrotizing myopathy (IMNM) with anti-HMGCR antibodies",
            "Severe hepatotoxicity / transaminase elevation >3x upper limit of normal"
        ],
        "precautions_and_warnings": [
            "Hepatic Disease: Baseline liver enzyme testing recommended; contraindicated in active liver disease or unexplained persistent transaminase elevations.",
            "Pregnancy & Lactation: Contraindicated during pregnancy and breastfeeding unless specialized high-risk lipidology consultation occurs.",
            "Unexplained Muscle Symptoms: Prompt clinical notification required if diffuse muscle pain, tenderness, or weakness develops."
        ],
        "interactions": [
            {"drug": "clarithromycin", "severity": "High", "effect": "Strong CYP3A4 inhibition significantly elevates atorvastatin AUC, increasing rhabdomyolysis risk."},
            {"drug": "itraconazole / ketoconazole", "severity": "High", "effect": "Potent CYP3A4 inhibition sharply elevates statin levels; dose reduction or temporary suspension required."},
            {"drug": "gemfibrozil", "severity": "High", "effect": "Inhibits glucuronidation and OATP1B1 uptake, multiplying myopathy risk. Concomitant use generally avoided."}
        ],
        "food_and_lifestyle_interactions": [
            "Avoid excessive grapefruit or grapefruit juice intake (>1 quart daily) due to CYP3A4 intestinal inhibition.",
            "Can be taken with or without food at any consistent time of day.",
            "Adopt heart-healthy Mediterranean or DASH dietary pattern for synergistic lipid optimization."
        ],
        "questions_for_doctor": [
            "Has my baseline lipid profile reached target LDL-C reduction according to AHA/ACC guidelines?",
            "What should I do if I experience unexpected muscle soreness or dark urine?",
            "Should we periodically check liver function enzymes (ALT/AST)?"
        ],
        "citation": {
            "guideline": "2023 AHA/ACC/ACCP/ASPC/NLA Guideline for the Management of Patients With Chronic Coronary Disease",
            "journal": "Circulation",
            "year": 2023,
            "pmid": "37471501",
            "doi": "10.1161/CIR.0000000000001168",
            "url": "https://pubmed.ncbi.nlm.nih.gov/37471501/"
        }
    },
    "lisinopril": {
        "generic_name": "Lisinopril",
        "brand_names": ["Prinivil", "Zestril", "Qbrelis"],
        "drug_class": "Angiotensin-Converting Enzyme (ACE) Inhibitor",
        "primary_uses": [
            "Treatment of hypertension in adults and pediatric patients >=6 years",
            "Adjunctive therapy in management of heart failure with reduced ejection fraction (HFrEF)",
            "Acute myocardial infarction hemodynamically stable post-event survival improvement"
        ],
        "mechanism_of_action": (
            "Inhibits angiotensin-converting enzyme, blocking conversion of angiotensin I to angiotensin II, a potent vasoconstrictor. "
            "Decreases aldosterone secretion, reduces systemic vascular resistance, and prevents degradation of the vasodilator bradykinin."
        ),
        "common_side_effects": [
            "Persistent dry, hacking nonproductive cough (secondary to bradykinin accumulation)",
            "Dizziness, lightheadedness, or orthostatic hypotension",
            "Headache and fatigue",
            "Mild transient serum creatinine rise"
        ],
        "serious_side_effects_warning": [
            "Angioedema of face, lips, tongue, or airway (medical emergency requiring immediate airway protection and discontinuation)",
            "Hyperkalemia (elevated serum potassium, potentially causing fatal cardiac arrhythmias)",
            "Acute renal failure in patients with bilateral renal artery stenosis or severe volume depletion"
        ],
        "precautions_and_warnings": [
            "BOXED WARNING - Fetal Toxicity: ACE inhibitors cause injury and death to developing fetus when used in pregnancy (2nd and 3rd trimesters). Discontinue immediately if pregnancy occurs.",
            "Electrolyte Monitoring: Check baseline and ongoing serum potassium and renal function.",
            "Dual RAAS Blockade: Concomitant use with ARBs or aliskiren increases risk of severe hypotension, syncope, hyperkalemia, and renal dysfunction."
        ],
        "interactions": [
            {"drug": "losartan / valsartan", "severity": "High", "effect": "Dual renin-angiotensin blockade significantly increases hyperkalemia and acute renal failure risk."},
            {"drug": "spironolactone / eplerenone", "severity": "High", "effect": "Additive potassium-sparing effect; requires rigorous serum potassium monitoring."},
            {"drug": "ibuprofen / nsaids", "severity": "Moderate", "effect": "Blunts antihypertensive efficacy and compromises renal hemodynamics via prostaglandin inhibition."}
        ],
        "food_and_lifestyle_interactions": [
            "Avoid potassium salt substitutes (KCl) and high-potassium supplements without physician approval.",
            "Rise slowly from sitting or lying positions to prevent postural dizziness.",
            "Stay adequately hydrated; excessive sweating, vomiting, or diarrhea can cause severe blood pressure drops."
        ],
        "questions_for_doctor": [
            "Is my serum potassium and kidney function within safe parameters on this dose?",
            "What should I do if I develop a persistent dry cough or facial swelling?",
            "Can I take common over-the-counter pain relievers like ibuprofen with this medication?"
        ],
        "citation": {
            "guideline": "2020 International Society of Hypertension Global Hypertension Practice Guidelines",
            "journal": "Hypertension",
            "year": 2020,
            "pmid": "32372703",
            "doi": "10.1161/HYPERTENSIONAHA.120.15026",
            "url": "https://pubmed.ncbi.nlm.nih.gov/32372703/"
        }
    },
    "amlodipine": {
        "generic_name": "Amlodipine Besylate",
        "brand_names": ["Norvasc", "Amlong", "Amlovas"],
        "drug_class": "Dihydropyridine Calcium Channel Blocker",
        "primary_uses": [
            "Management of essential hypertension",
            "Management of chronic stable angina pectoris and vasospastic (Prinzmetal's) angina"
        ],
        "mechanism_of_action": (
            "Inhibits transmembrane influx of extracellular calcium ions across vascular smooth muscle and cardiac muscle cells, "
            "causing peripheral arterial vasodilation and reducing total peripheral resistance."
        ),
        "common_side_effects": [
            "Peripheral edema (bilateral lower extremity ankle/pedal swelling)",
            "Flushing and warm sensations",
            "Palpitations or tachycardia",
            "Dizziness, lightheadedness, and fatigue"
        ],
        "serious_side_effects_warning": [
            "Severe symptomatic hypotension and syncope in patients with critical aortic stenosis",
            "Worsening angina or acute myocardial infarction upon dose initiation or titration in severe coronary disease"
        ],
        "precautions_and_warnings": [
            "Hepatic Impairment: Amlodipine is extensively metabolized by liver; dose titration must be cautious in hepatic dysfunction.",
            "Heart Failure: Use with caution in patients with heart failure due to potential negative inotropic effects.",
            "Peripheral Edema: Fluid accumulation is due to precapillary vasodilation, not renal sodium retention."
        ],
        "interactions": [
            {"drug": "simvastatin", "severity": "Moderate", "effect": "Amlodipine increases simvastatin exposure; limit simvastatin dose to 20 mg daily."},
            {"drug": "diltiazem", "severity": "Moderate", "effect": "Increases plasma concentration of amlodipine via CYP3A4 inhibition."},
            {"drug": "cyclosporine", "severity": "Moderate", "effect": "May increase cyclosporine blood trough concentrations."}
        ],
        "food_and_lifestyle_interactions": [
            "Can be taken with or without food at the same time each day.",
            "Elevate lower legs when resting if mild ankle swelling occurs.",
            "Limit high sodium intake to maximize blood pressure response."
        ],
        "questions_for_doctor": [
            "How can I tell if ankle swelling is an expected side effect or a sign of heart strain?",
            "What target blood pressure reading should I look for on my home monitor?",
            "Does amlodipine interact with my other lipid-lowering or cardiac medications?"
        ],
        "citation": {
            "guideline": "2023 ESH Guidelines for the Management of Arterial Hypertension",
            "journal": "J Hypertens",
            "year": 2023,
            "pmid": "37345614",
            "doi": "10.1097/HJH.0000000000003480",
            "url": "https://pubmed.ncbi.nlm.nih.gov/37345614/"
        }
    },
    "levothyroxine": {
        "generic_name": "Levothyroxine Sodium",
        "brand_names": ["Synthroid", "Levoxyl", "Tirosint", "Eltroxin"],
        "drug_class": "Synthetic Thyroid Hormone (T4)",
        "primary_uses": [
            "Replacement therapy in primary, secondary, or tertiary hypothyroidism",
            "Pituitary TSH suppression in thyroid carcinoma and euthyroid goiter management"
        ],
        "mechanism_of_action": (
            "Synthetic levothyroxine acts identically to endogenous thyroxine (T4). It is converted in peripheral tissues "
            "to active triiodothyronine (T3), binding to thyroid receptors in cell nuclei to regulate metabolic rate, gene expression, and protein synthesis."
        ),
        "common_side_effects": [
            "Usually none when correctly dosed",
            "Symptoms of overtreatment (palpitations, tachycardia, tremor, anxiety, heat intolerance, weight loss, insomnia)"
        ],
        "serious_side_effects_warning": [
            "Cardiac arrhythmias and angina pectoris in elderly or cardiac patients if initiated at excessive doses",
            "Decreased bone mineral density (osteopenia/osteoporosis) associated with chronic over-suppression of TSH",
            "Thyrotoxic crisis in acute massive overdose"
        ],
        "precautions_and_warnings": [
            "BOXED WARNING: Thyroid hormones should NOT be used alone or with other therapeutic agents for the treatment of obesity or weight loss.",
            "Strict Fasting Ingestion: Food, calcium, iron, soy, and coffee significantly impair gastrointestinal absorption.",
            "Narrow Therapeutic Index: Brand-to-generic switches require re-checking TSH 6-8 weeks later."
        ],
        "interactions": [
            {"drug": "calcium carbonate / iron sulfate", "severity": "High", "effect": "Forms insoluble chelates with levothyroxine; separate administration by at least 4 hours."},
            {"drug": "omeprazole / antacids", "severity": "Moderate", "effect": "Reduces gastric acidity required for optimal levothyroxine tablet dissolution and absorption."},
            {"drug": "warfarin", "severity": "Moderate", "effect": "Thyroid hormone enhances catabolism of vitamin K-dependent clotting factors, potentiating anticoagulant effect."}
        ],
        "food_and_lifestyle_interactions": [
            "Take with a full glass of water first thing in the morning on an empty stomach, at least 30 to 60 minutes before breakfast.",
            "Avoid espresso/coffee, soy products, and high-fiber foods within 1 hour of tablet ingestion.",
            "Separate calcium, iron, and multivitamin supplements by a minimum of 4 hours."
        ],
        "questions_for_doctor": [
            "When should I repeat my serum TSH and Free T4 lab tests to confirm my dose is optimal?",
            "Can I stay on the exact same manufacturer or brand of levothyroxine for consistency?",
            "How long after taking my thyroid tablet must I wait before drinking my morning coffee or taking vitamins?"
        ],
        "citation": {
            "guideline": "Clinical Practice Guidelines for Hypothyroidism in Adults (AACE/ATA)",
            "journal": "Endocr Pract",
            "year": 2022,
            "pmid": "23046710",
            "doi": "10.4158/EP12280.GL",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23046710/"
        }
    },
    "omeprazole": {
        "generic_name": "Omeprazole",
        "brand_names": ["Prilosec", "Omez", "Losec"],
        "drug_class": "Proton Pump Inhibitor (PPI)",
        "primary_uses": [
            "Healing and symptomatic relief of erosive esophagitis and gastroesophageal reflux disease (GERD)",
            "Treatment of active duodenal and benign gastric ulcers",
            "Helicobacter pylori eradication regimens in combination with antibiotics"
        ],
        "mechanism_of_action": (
            "Irreversibly inhibits the hydrogen-potassium adenosine triphosphatase (H+/K+ ATPase) enzyme system "
            "(the gastric proton pump) in gastric parietal cells, blocking the final step of acid secretion."
        ),
        "common_side_effects": [
            "Headache",
            "Abdominal pain, nausea, flatulence, constipation, or diarrhea"
        ],
        "serious_side_effects_warning": [
            "Clostridium difficile-associated diarrhea (CDAD) due to decreased gastric acid defense",
            "Acute interstitial nephritis (AIN) / kidney injury",
            "Hypomagnesemia with long-term use (>1 year), potentially triggering tetany and arrhythmias",
            "Increased risk of osteoporotic fractures (hip, spine, wrist) with high-dose long-term therapy",
            "Vitamin B12 malabsorption with extended use"
        ],
        "precautions_and_warnings": [
            "Shortest Duration: Use at the lowest effective dose for the shortest duration appropriate to condition.",
            "CYP2C19 Interaction: Concomitant use with clopidogrel reduces clopidogrel antiplatelet active metabolite formation.",
            "Gastric Malignancy Masking: Response to PPI therapy does not preclude presence of occult gastric malignancy."
        ],
        "interactions": [
            {"drug": "clopidogrel", "severity": "High", "effect": "Inhibits CYP2C19 activation of clopidogrel, significantly blunting antiplatelet efficacy."},
            {"drug": "methotrexate", "severity": "High", "effect": "Increases and prolongs serum levels of methotrexate, elevating toxicity risk."},
            {"drug": "levothyroxine", "severity": "Moderate", "effect": "Altered gastric pH decreases thyroid hormone tablet dissolution and bioavailability."}
        ],
        "food_and_lifestyle_interactions": [
            "Take 30 to 60 minutes before the first meal of the day (ideally breakfast) for maximum proton pump inhibition.",
            "Swallow capsules whole; do not crush or chew delayed-release granules.",
            "Avoid dietary acid reflux triggers: late-night heavy meals, peppermint, caffeine, chocolate, and tobacco."
        ],
        "questions_for_doctor": [
            "How long do I need to remain on this acid-suppressing medication?",
            "Could this medication be affecting my absorption of iron, magnesium, or Vitamin B12?",
            "Are there non-pharmacological or lifestyle changes I can make to reduce my reflux symptoms?"
        ],
        "citation": {
            "guideline": "ACG Clinical Guideline for the Diagnosis and Management of Gastroesophageal Reflux Disease",
            "journal": "Am J Gastroenterol",
            "year": 2022,
            "pmid": "34807007",
            "doi": "10.14309/ajg.0000000000001538",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34807007/"
        }
    },
    "metoprolol": {
        "generic_name": "Metoprolol (Tartrate / Succinate)",
        "brand_names": ["Lopressor", "Toprol-XL", "Betaloc"],
        "drug_class": "Beta-1 Selective Adrenoceptor Blocker",
        "primary_uses": [
            "Management of hypertension",
            "Long-term treatment of angina pectoris",
            "Heart failure with reduced ejection fraction (Toprol-XL succinate formulation only)",
            "Hemodynamically stable acute myocardial infarction"
        ],
        "mechanism_of_action": (
            "Competitively antagonizes beta-1 adrenergic receptors in cardiac tissue, reducing heart rate, cardiac output, "
            "myocardial contractility, and systemic blood pressure while inhibiting renin release."
        ),
        "common_side_effects": [
            "Bradycardia (low heart rate) and fatigue",
            "Dizziness, lightheadedness, or orthostatic hypotension",
            "Cold extremities (Raynaud's phenomenon exacerbation)",
            "Shortness of breath on exertion, depression, or sleep disturbances"
        ],
        "serious_side_effects_warning": [
            "BOXED WARNING - Ischemic Heart Disease: Do NOT abruptly discontinue therapy. Abrupt cessation can exacerbate angina, provoke myocardial infarction, or trigger ventricular arrhythmias.",
            "Severe symptomatic bradycardia (<50 bpm) and high-degree atrioventricular (AV) heart block",
            "Severe bronchospasm in susceptible asthmatic or COPD patients"
        ],
        "precautions_and_warnings": [
            "Hypoglycemia Masking: Beta-blockers can mask autonomic warning symptoms of hypoglycemia (tachycardia, tremor), though diaphoresis usually remains.",
            "Asthma / COPD: Caution required; selective beta-1 properties diminish at higher doses.",
            "Formulation Distinction: Metoprolol Tartrate is immediate-release (taken with or right after food multiple times daily); Metoprolol Succinate is extended-release once daily."
        ],
        "interactions": [
            {"drug": "diltiazem / verapamil", "severity": "High", "effect": "Additive negative chronotropic and dromotropic effects, risking severe bradycardia and heart block."},
            {"drug": "fluoxetine / paroxetine", "severity": "Moderate", "effect": "Strong CYP2D6 inhibitors increase metoprolol plasma concentration multiple-fold."},
            {"drug": "clonidine", "severity": "High", "effect": "If stopping both, stop beta-blocker several days before gradual clonidine withdrawal to prevent rebound hypertension."}
        ],
        "food_and_lifestyle_interactions": [
            "Metoprolol Tartrate should always be taken with or immediately following a meal.",
            "Monitor resting pulse rate regularly; inform doctor if resting heart rate falls below 50 beats/minute.",
            "Never stop this medication abruptly on your own."
        ],
        "questions_for_doctor": [
            "What is my target resting heart rate range while taking metoprolol?",
            "Am I taking the immediate-release tartrate or the once-daily extended-release succinate formulation?",
            "How should my medication be tapered if it ever needs to be adjusted or changed?"
        ],
        "citation": {
            "guideline": "2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure",
            "journal": "Circulation",
            "year": 2022,
            "pmid": "35363538",
            "doi": "10.1161/CIR.0000000000001063",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35363538/"
        }
    },
    "losartan": {
        "generic_name": "Losartan Potassium",
        "brand_names": ["Cozaar", "Losacar", "Repace"],
        "drug_class": "Angiotensin II Receptor Antagonist (ARB)",
        "primary_uses": [
            "Treatment of hypertension",
            "Reduction in risk of stroke in patients with hypertension and left ventricular hypertrophy",
            "Treatment of diabetic nephropathy in patients with Type 2 diabetes and elevated serum creatinine"
        ],
        "mechanism_of_action": (
            "Selectively blocks the binding of angiotensin II to the AT1 receptor found in vascular smooth muscle and adrenal gland, "
            "blocking vasoconstriction and aldosterone secretion without affecting bradykinin degradation."
        ),
        "common_side_effects": [
            "Upper respiratory infection symptoms or nasal congestion",
            "Dizziness, lightheadedness",
            "Back pain or leg pain",
            "Fatigue"
        ],
        "serious_side_effects_warning": [
            "BOXED WARNING - Fetal Toxicity: Discontinue as soon as pregnancy is detected. Drugs acting directly on RAAS can cause injury and death to developing fetus.",
            "Hyperkalemia (especially in patients with renal impairment or taking potassium supplements)",
            "Renal failure in patients dependent on renin-angiotensin system (e.g., bilateral renal artery stenosis)"
        ],
        "precautions_and_warnings": [
            "Pregnancy Contraindication: Strictly avoid during pregnancy.",
            "Potassium Monitoring: Routine serum potassium and creatinine monitoring is warranted.",
            "Hypotension in Volume Depletion: Ensure intravascular volume repletion before initiation to prevent marked hypotension."
        ],
        "interactions": [
            {"drug": "lisinopril / enalapril", "severity": "High", "effect": "Dual RAAS blockade increases hyperkalemia, hypotension, and renal impairment."},
            {"drug": "spironolactone", "severity": "High", "effect": "Synergistic potassium retention risk requiring close lab surveillance."},
            {"drug": "nsaids / ibuprofen", "severity": "Moderate", "effect": "Attenuates antihypertensive effect and increases acute renal deterioration risk."}
        ],
        "food_and_lifestyle_interactions": [
            "Avoid potassium-based salt substitutes without physician evaluation.",
            "Can be taken with or without food at the same time every day.",
            "Ensure adequate hydration to avoid postural dizziness."
        ],
        "questions_for_doctor": [
            "How does losartan protect my kidneys if I have diabetes or elevated blood pressure?",
            "What should I do if my home blood pressure readings are consistently below 100/60 mmHg?",
            "When will my electrolyte and creatinine levels be checked next?"
        ],
        "citation": {
            "guideline": "KDIGO 2023 Clinical Practice Guideline for the Management of Diabetes in CKD",
            "journal": "Kidney Int",
            "year": 2023,
            "pmid": "37979929",
            "doi": "10.1016/j.kint.2023.09.002",
            "url": "https://pubmed.ncbi.nlm.nih.gov/37979929/"
        }
    },
    "amoxicillin": {
        "generic_name": "Amoxicillin Trihydrate",
        "brand_names": ["Amoxil", "Moxatag", "Novamox"],
        "drug_class": "Aminopenicillin Beta-Lactam Antibiotic",
        "primary_uses": [
            "Treatment of susceptible bacterial infections of the ear, nose, throat, respiratory tract, and urinary tract",
            "Component of triple therapy for Helicobacter pylori eradication",
            "Infective endocarditis prophylaxis in high-risk dental procedures"
        ],
        "mechanism_of_action": (
            "Binds to penicillin-binding proteins (PBPs) inside the bacterial cell wall, inhibiting transpeptidation and "
            "interfering with peptidoglycan synthesis, leading to cell lysis and bacterial death (bactericidal)."
        ),
        "common_side_effects": [
            "Nausea, vomiting, diarrhea, and loose stools",
            "Mild cutaneous maculopapular rash",
            "Oral or vaginal candidiasis (thrush / yeast overgrowth)"
        ],
        "serious_side_effects_warning": [
            "Severe Anaphylaxis / Hypersensitivity reactions (hives, angioedema, bronchospasm, circulatory collapse)",
            "Clostridioides difficile-associated diarrhea (severe watery diarrhea and colitis)",
            "Severe cutaneous adverse reactions (Stevens-Johnson syndrome, DRESS syndrome)"
        ],
        "precautions_and_warnings": [
            "Penicillin Allergy: Inquire specifically regarding past history of penicillin, cephalosporin, or beta-lactam allergies.",
            "Complete Entire Prescribed Course: Discontinuing early encourages bacterial resistance and recurrence.",
            "Ineffective Against Viral Illnesses: Does not treat viral colds, influenza, or acute non-streptococcal bronchitis."
        ],
        "interactions": [
            {"drug": "methotrexate", "severity": "High", "effect": "Penicillins decrease renal clearance of methotrexate, causing severe toxicity."},
            {"drug": "allopurinol", "severity": "Moderate", "effect": "Concomitant use significantly increases incidence of drug-induced skin rashes."},
            {"drug": "warfarin", "severity": "Moderate", "effect": "Alters gut flora synthesizing vitamin K, potentially elevating INR/bleeding."}
        ],
        "food_and_lifestyle_interactions": [
            "Can be taken with food or milk to minimize gastrointestinal discomfort.",
            "Complete the entire prescribed schedule even if symptoms improve early.",
            "Consider probiotic foods (yogurt, kefir) separated from the antibiotic dose to support gut flora balance."
        ],
        "questions_for_doctor": [
            "Has a bacterial culture or diagnostic test confirmed that an antibiotic is necessary?",
            "What should I do if I experience loose stools, diarrhea, or a mild skin rash?",
            "Do I need to finish all remaining doses even after I feel completely recovered?"
        ],
        "citation": {
            "guideline": "Infectious Diseases Society of America (IDSA) Clinical Practice Guidelines",
            "journal": "Clin Infect Dis",
            "year": 2021,
            "pmid": "33844005",
            "doi": "10.1093/cid/ciaa1827",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33844005/"
        }
    },
    "aspirin": {
        "generic_name": "Acetylsalicylic Acid (Aspirin)",
        "brand_names": ["Bayer Aspirin", "Ecotrin", "Disprin", "Empirin"],
        "drug_class": "Antiplatelet Agent / Nonsteroidal Anti-inflammatory Drug (NSAID)",
        "primary_uses": [
            "Secondary cardiovascular prevention in established atherosclerotic cardiovascular disease (prior MI, stroke, stent)",
            "Acute management of suspected myocardial infarction (chewed 325 mg dose)",
            "Temporary relief of mild-to-moderate inflammatory pain and fever"
        ],
        "mechanism_of_action": (
            "Irreversibly acetylates and inhibits cyclooxygenase-1 (COX-1), preventing synthesis of thromboxane A2 (TXA2), "
            "a potent platelet aggregator and vasoconstrictor, inhibiting platelet aggregation for the 7-10 day lifespan of the platelet."
        ),
        "common_side_effects": [
            "Dyspepsia, gastric irritation, heartburn, and nausea",
            "Easy bruising and prolonged bleeding from minor abrasions"
        ],
        "serious_side_effects_warning": [
            "Gastrointestinal hemorrhage and peptic ulceration (manifests as hematemesis, black tarry stools, or sudden anemia)",
            "Reye's Syndrome in children and teenagers recovering from viral infections (influenza, varicella)",
            "Aspirin-exacerbated respiratory disease (AERD / Samter's triad) with severe asthma and nasal polyps"
        ],
        "precautions_and_warnings": [
            "Pediatric Contraindication: Do NOT give aspirin to children or teens with viral illnesses due to Reye's syndrome risk.",
            "Active Peptic Ulcer or Bleeding: Strictly contraindicated in active gastrointestinal ulceration or bleeding diathesis.",
            "Elective Surgery: Notify surgeon or proceduralist 7 days prior to scheduled surgeries for bleeding risk evaluation."
        ],
        "interactions": [
            {"drug": "warfarin / apixaban / rivaroxaban", "severity": "High", "effect": "Additive anticoagulant and antiplatelet synergy dramatically elevates major bleeding risk."},
            {"drug": "ibuprofen", "severity": "Moderate", "effect": "Competitive reversible COX-1 binding interferes with irreversible aspirin antiplatelet inhibition."},
            {"drug": "corticosteroids", "severity": "Moderate", "effect": "Synergistic gastrointestinal mucosal injury increasing ulcer risk."}
        ],
        "food_and_lifestyle_interactions": [
            "Take with food or a large glass of water to reduce gastric irritation.",
            "Limit alcohol intake; combined alcohol and aspirin markedly increases stomach ulcer and bleeding risk.",
            "Enteric-coated tablets may help stomach comfort but do not eliminate systemic bleeding risk."
        ],
        "questions_for_doctor": [
            "Is low-dose daily aspirin recommended for my specific cardiovascular risk profile?",
            "What signs of stomach bleeding (such as dark stools) should I watch out for?",
            "How many days prior to dental procedures or surgery should I discuss holding aspirin?"
        ],
        "citation": {
            "guideline": "2023 AHA/ACC/ACCP/ASPC/NLA Guideline for the Management of Patients With Chronic Coronary Disease",
            "journal": "Circulation",
            "year": 2023,
            "pmid": "37471501",
            "doi": "10.1161/CIR.0000000000001168",
            "url": "https://pubmed.ncbi.nlm.nih.gov/37471501/"
        }
    }
}

STATUTORY_MEDICATION_DISCLAIMER = (
    "MediPredict AI provides educational medication reference information. "
    "It does NOT prescribe, endorse, or alter any medication or dosage. "
    "Never start, discontinue, or alter any prescription or over-the-counter medicine "
    "without direct consultation with your prescribing physician or a licensed pharmacist."
)

class MedicationEducationService:
    @classmethod
    def normalize_name(cls, name: str) -> str:
        clean = re.sub(r"[^a-zA-Z0-9\s\-]", "", name.strip().lower())
        return clean

    @classmethod
    def find_monograph(cls, med_name: str) -> Optional[Dict[str, Any]]:
        target = cls.normalize_name(med_name)
        if not target:
            return None

        # 1. Direct match on generic key
        if target in MEDICATION_MONOGRAPHS:
            return MEDICATION_MONOGRAPHS[target]

        # 2. Match generic or brand names
        for key, monograph in MEDICATION_MONOGRAPHS.items():
            if target == cls.normalize_name(key) or target == cls.normalize_name(monograph["generic_name"]):
                return monograph
            for brand in monograph.get("brand_names", []):
                if target == cls.normalize_name(brand):
                    return monograph

        # 3. Substring match
        for key, monograph in MEDICATION_MONOGRAPHS.items():
            if key in target or target in key:
                return monograph
            for brand in monograph.get("brand_names", []):
                if cls.normalize_name(brand) in target:
                    return monograph

        return None

    @classmethod
    def get_medication_education(
        cls,
        medication_name: str,
        current_conditions: Optional[List[str]] = None,
        other_medications: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Assembles structured educational monograph, interaction cross-check,
        lifestyle guidelines, and doctor discussion points.
        """
        monograph = cls.find_monograph(medication_name)

        if not monograph:
            # Fallback for unrecognized medications
            return {
                "medication_name": medication_name,
                "generic_name": f"{medication_name.title()} (General Monograph)",
                "drug_class": "General Pharmacological Agent",
                "primary_uses": [
                    f"Clinical indications as specified on prescription label for {medication_name}",
                    "Follow directions provided by your licensed healthcare provider or dispensing pharmacy."
                ],
                "mechanism_of_action": (
                    f"Specific pharmacological receptor dynamics for '{medication_name}' should be reviewed with your pharmacist. "
                    "Pharmaceutical agents exert localized or systemic physiologic modulation based on their active chemical entity."
                ),
                "common_side_effects": [
                    "Mild gastrointestinal variations (nausea, mild stomach discomfort)",
                    "Drowsiness, mild headache, or dizziness depending on individual metabolism"
                ],
                "serious_side_effects_warning": [
                    "Severe allergic hypersensitivity (rash, hives, facial swelling, breathing difficulty - seek emergency care immediately)",
                    "Unusual fatigue, yellowing of eyes/skin, or sudden unexplained symptoms"
                ],
                "precautions_and_warnings": [
                    "Take strictly according to physician's labeled directions.",
                    "Verify potential cross-reactivity if you have known drug allergies.",
                    "Keep all medications safely stored out of reach of children and pets."
                ],
                "potential_interactions": [],
                "food_and_lifestyle_interactions": [
                    "Check prescription container for specific dietary or timing instructions (e.g., take with food or on an empty stomach).",
                    "Avoid alcohol unless specifically authorized by your doctor or pharmacist."
                ],
                "questions_for_pharmacist_or_doctor": [
                    f"What is the exact purpose of {medication_name} in my treatment plan?",
                    "What common side effects should I watch for and when should I call the clinic?",
                    "Are there any specific foods, drinks, or supplements I should avoid?"
                ],
                "citations": [
                    {
                        "guideline": "FDA Approved Drug Labeling and Reference Database",
                        "journal": "U.S. National Library of Medicine / DailyMed",
                        "year": 2024,
                        "url": "https://dailymed.nlm.nih.gov/"
                    }
                ],
                "non_prescribing_disclaimer": STATUTORY_MEDICATION_DISCLAIMER
            }

        # Analyze potential interactions with other_medications
        detected_interactions = []
        if other_medications:
            user_other_cleaned = [cls.normalize_name(m) for m in other_medications]
            for inter in monograph.get("interactions", []):
                inter_drug = cls.normalize_name(inter["drug"])
                for other_item in user_other_cleaned:
                    if inter_drug in other_item or other_item in inter_drug:
                        detected_interactions.append(inter)
                        break

        # Check condition-based precautions
        tailored_precautions = list(monograph["precautions_and_warnings"])
        if current_conditions:
            conds_lower = [c.lower() for c in current_conditions]
            if any("kidney" in c or "renal" in c or "ckd" in c for c in conds_lower):
                tailored_precautions.insert(0, "PATIENT ALERT: You have noted kidney/renal considerations. Dose adjustments and renal function monitoring are essential.")
            if any("liver" in c or "hepatic" in c or "cirrhosis" in c for c in conds_lower):
                tailored_precautions.insert(0, "PATIENT ALERT: You have noted liver/hepatic considerations. Hepatic clearance may be affected; review with physician.")
            if any("pregnant" in c or "pregnancy" in c for c in conds_lower):
                tailored_precautions.insert(0, "PATIENT ALERT: Pregnancy considerations noted. Discontinue medications with black-box fetal warnings and obtain immediate obstetric guidance.")

        return {
            "medication_name": medication_name,
            "generic_name": monograph["generic_name"],
            "drug_class": monograph["drug_class"],
            "primary_uses": monograph["primary_uses"],
            "mechanism_of_action": monograph["mechanism_of_action"],
            "common_side_effects": monograph["common_side_effects"],
            "serious_side_effects_warning": monograph["serious_side_effects_warning"],
            "precautions_and_warnings": tailored_precautions,
            "potential_interactions": detected_interactions if detected_interactions else monograph.get("interactions", []),
            "food_and_lifestyle_interactions": monograph["food_and_lifestyle_interactions"],
            "questions_for_pharmacist_or_doctor": monograph["questions_for_doctor"],
            "citations": [monograph["citation"]],
            "non_prescribing_disclaimer": STATUTORY_MEDICATION_DISCLAIMER
        }

    @classmethod
    def list_monographs(cls) -> List[Dict[str, str]]:
        return [
            {
                "key": key,
                "generic_name": m["generic_name"],
                "drug_class": m["drug_class"],
                "brand_names": ", ".join(m.get("brand_names", []))
            }
            for key, m in MEDICATION_MONOGRAPHS.items()
        ]
