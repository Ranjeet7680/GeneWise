export interface ResearchStudy {
  id: string;
  pmid: string;
  doi: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  category: "Gastroenterology" | "Endocrinology" | "Hepatology" | "Cardiology";
  evidenceLevel: string;
  abstract: string;
  keyFinding: string;
  pubmedUrl: string;
}

export interface ResearchBenchmark {
  id: string;
  metric: string;
  label: string;
  sublabel: string;
  href: string;
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  isLeader?: boolean;
  track: "Leadership" | "Engineering" | "Research & Design";
  email: string;
  university: string;
  shortUniversity: string;
  country: string;
  focus: string;
  highlights: string[];
  githubHandle?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  avatarObjectPosition?: string;
  avatarGradientCss: string;
  accentGradient: string;
}

export interface TeamWorkstream {
  id: string;
  title: string;
  focus: string;
  description: string;
  href: string;
  hrefLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  badge: string;
  architectureSummary: string;
  capabilities: string[];
  metrics: { label: string; value: string }[];
}

export const TEAM_GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1IoJKBg_Okgdcn7B8LNajnW5CqoubK2oLOPiTZGZ4R94/edit?usp=sharing";

export const TEAM_SHEET_ACCESS_STATUS: "synced" | "requires_auth" = "synced";

export const CURATED_RESEARCH_STUDIES: ResearchStudy[] = [
  {
    id: "celiac-acg-2023",
    pmid: "36598284",
    doi: "10.14309/ajg.0000000000002073",
    title: "ACG Clinical Guidelines: Diagnosis and Management of Celiac Disease",
    authors: "Rubio-Tapia A, Hill ID, Semrad C, Kelly CP, Lebwohl B.",
    journal: "Am J Gastroenterol",
    year: 2023,
    category: "Gastroenterology",
    evidenceLevel: "Grade 1A Evidence",
    abstract:
      "Evidence-based recommendations for diagnosing and managing celiac disease using HLA-DQ2/DQ8 genetic susceptibility profiling, tTG-IgA serology, and histological confirmation.",
    keyFinding:
      "High-affinity tTG-IgA combined with total serum IgA is recommended as the preferred initial serological screening protocol.",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/36598284/",
  },
  {
    id: "diabetes-ada-2024",
    pmid: "38078589",
    doi: "10.2337/dc24-S006",
    title: "Standards of Care in Diabetes—2024: Glycemic Goals and Hypoglycemia Risk",
    authors: "American Diabetes Association Professional Practice Committee",
    journal: "Diabetes Care",
    year: 2024,
    category: "Endocrinology",
    evidenceLevel: "Clinical Practice Guideline",
    abstract:
      "Clinical standards covering individualized HbA1c targets (<7.0% for most nonpregnant adults), continuous glucose monitoring (CGM) metrics, and cardiometabolic risk stratification.",
    keyFinding:
      "Maintaining CGM Time in Range (70–180 mg/dL) above 70% strongly correlates with lower microvascular and macrovascular risk.",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/38078589/",
  },
  {
    id: "masld-easl-2024",
    pmid: "38851239",
    doi: "10.1016/j.jhep.2024.04.031",
    title:
      "EASL-EASD-EASO Clinical Practice Guidelines on Metabolic Dysfunction-Associated Steatotic Liver Disease (MASLD)",
    authors: "European Association for the Study of the Liver (EASL)",
    journal: "J Hepatol",
    year: 2024,
    category: "Hepatology",
    evidenceLevel: "Clinical Practice Guideline",
    abstract:
      "Multidisciplinary clinical consensus for non-invasive hepatic fibrosis triage using FIB-4 biomarker indexing, elastography, and coordinated metabolic risk care.",
    keyFinding:
      "A non-invasive FIB-4 score below 1.30 rules out advanced hepatic fibrosis with greater than 90% negative predictive value.",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/38851239/",
  },
  {
    id: "cad-aha-2023",
    pmid: "37471501",
    doi: "10.1161/CIR.0000000000001168",
    title: "2023 AHA/ACC Guideline for the Management of Patients With Chronic Coronary Disease",
    authors: "Writing Committee Members, Virani SS, Newby LK, et al.",
    journal: "Circulation",
    year: 2023,
    category: "Cardiology",
    evidenceLevel: "Grade 1A Evidence",
    abstract:
      "Updated guidance integrating lipid biomarker targets, familial cardiovascular history, and longitudinal monitoring to reduce major adverse cardiovascular events.",
    keyFinding:
      "Sustained LDL-C reduction below 55 mg/dL yields measurable reductions in major adverse cardiovascular events across high-risk cohorts.",
    pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/37471501/",
  },
];

export const RESEARCH_BENCHMARKS: ResearchBenchmark[] = [
  {
    id: "celiac-gbm",
    metric: "0.962",
    label: "Celiac Risk ROC-AUC",
    sublabel: "GradientBoostingClassifier • Platt Scaled",
    href: "/ml-lab",
  },
  {
    id: "cardio-rf",
    metric: "0.941",
    label: "Cardiometabolic ROC-AUC",
    sublabel: "RandomForestEnsemble • TreeSHAP",
    href: "/ml-lab",
  },
  {
    id: "clinvar-loci",
    metric: "2.41M",
    label: "ClinVar Variants",
    sublabel: "GRCh38.p14 • NCBI RefSeq Indexed",
    href: "/genetics",
  },
  {
    id: "curated-disorders",
    metric: "1,428",
    label: "Curated Disorders",
    sublabel: "Orphanet • OMIM • Peer-Reviewed",
    href: "/research",
  },
];

export const TEAM_WORKSTREAMS: TeamWorkstream[] = [
  {
    id: "genomic-literacy",
    title: "Genomics & Pedigree Literacy",
    focus: "NSGC 3-Generation Mapping & Variant Explorer",
    description:
      "Builds interactive autosomal dominant, recessive, and X-linked pedigree models synced with GRCh38.p14 gene loci and ClinVar variant classifications.",
    href: "/genetics",
    hrefLabel: "Explore Genetics",
    secondaryHref: "/my-family-history",
    secondaryLabel: "Open Pedigree Workspace",
    badge: "TRACK 01",
    architectureSummary:
      "Combines client-encrypted 3-generation NSGC family trees with curated GRCh38.p14 exon maps (CFTR, BRCA1, FBN1, TP53) and ClinVar pathogenicity distributions for consultation preparation.",
    capabilities: [
      "Interactive Mendelian segregation simulator (Autosomal Recessive, Dominant, and X-Linked).",
      "GRCh38.p14 Release 110 locus explorer with 27-exon domain mapping and variant tables.",
      "Print-ready and structured family health checklists with zero raw DNA storage.",
    ],
    metrics: [
      { label: "ClinVar Variants", value: "2.41M+" },
      { label: "Curated Loci", value: "20,442" },
      { label: "Pedigree Depth", value: "3 Gen" },
    ],
  },
  {
    id: "clinical-research",
    title: "PubMed RAG & Clinical Evidence",
    focus: "Peer-Reviewed Citations & Evidence Hierarchies",
    description:
      "Indexes Grade 1A clinical practice guidelines (ACG, ADA, EASL, AHA/ACC) with verifiable PMIDs so educational briefs cite primary biomedical literature.",
    href: "/research",
    hrefLabel: "Open Research Hub",
    secondaryHref: "/assistant",
    secondaryLabel: "Ask AI Research Assistant",
    badge: "TRACK 02",
    architectureSummary:
      "Coordinates specialized Medical Information and Research domain agents under a Supervisor Orchestrator to ground educational summaries in peer-reviewed PMID/DOI guidelines and evidence tiers.",
    capabilities: [
      "Direct citation verification against PubMed (PMID 36598284, 38078589, 38851239, 37471501).",
      "Evidence classification spanning Grade 1A guidelines through observational cohort studies.",
      "Explicit uncertainty quantification and non-diagnostic boundary notices on every response.",
    ],
    metrics: [
      { label: "Routing Latency", value: "<240 ms" },
      { label: "Curated Disorders", value: "1,428" },
      { label: "Evidence Tiering", value: "Grade 1A" },
    ],
  },
  {
    id: "explainable-ml",
    title: "Biomedical ML & Explainable AI",
    focus: "Calibrated Classifiers & TreeSHAP Attributions",
    description:
      "Evaluates gradient boosting and random forest biomarker pipelines with ROC-AUC validation, Platt scaling, and transparent SHAP feature explanations.",
    href: "/ml-lab",
    hrefLabel: "Inspect ML Lab",
    secondaryHref: "/analytics",
    secondaryLabel: "Open Analytics Engine",
    badge: "TRACK 03",
    architectureSummary:
      "Trains and benchmarks Scikit-Learn GradientBoostingClassifier and RandomForestEnsemble pipelines paired with Feature Engineering Studio synthesis and TreeSHAP local feature attributions.",
    capabilities: [
      "Celiac Risk Gradient Booster (MOD-CELIAC-GB-01) calibrated via Platt Scaling at 0.962 ROC-AUC.",
      "Cardiometabolic 5-Year Risk Ensemble (MOD-CARDIO-RISK-02) benchmarked at 0.941 ROC-AUC.",
      "Interactive batch stress testing, hyperparameter experiment logging, and live inference presets.",
    ],
    metrics: [
      { label: "Top ROC-AUC", value: "0.962" },
      { label: "Validation F1", value: "0.938" },
      { label: "Brier Score", value: "0.051" },
    ],
  },
  {
    id: "privacy-governance",
    title: "Zero-Trust Privacy & Compliance",
    focus: "DPDP Act 2023 • HIPAA Security Rule • RLS",
    description:
      "Enforces client-side pedigree storage, itemized consent ledgers, relationship-based access controls, and strict non-diagnostic safety boundaries.",
    href: "/governance/privacy-charter",
    hrefLabel: "Review Charter",
    secondaryHref: "/governance/terms",
    secondaryLabel: "Terms of Educational Use",
    badge: "TRACK 04",
    architectureSummary:
      "Implements privacy-by-design across PostgreSQL Row-Level Security (RLS), relationship-based physician access controls (ReBAC), and itemized DPDP/HIPAA user consent management.",
    capabilities: [
      "Zero raw genomic sequencing uploads (no FASTQ, BAM, or VCF files accepted or retained).",
      "Itemized revocable consent ledger, one-click data export portability, and right to erasure.",
      "Zero-delay emergency triage intercept routing acute cardiac or neurological symptoms to 112 / 911.",
    ],
    metrics: [
      { label: "Raw DNA Stored", value: "0 Bytes" },
      { label: "Data Encryption", value: "AES-256" },
      { label: "Access Model", value: "RLS + ReBAC" },
    ],
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "ranjeet-kumar",
    name: "Ranjeet Kumar",
    initials: "RK",
    role: "Team Leader",
    isLeader: true,
    track: "Leadership",
    email: "rajranjeet7680@gmail.com",
    university: "Indian Institute of Technology, Roorkee",
    shortUniversity: "IIT Roorkee",
    country: "India",
    githubHandle: "Ranjeet7680",
    githubUrl: "https://github.com/Ranjeet7680",
    avatarUrl: "/images/team/ranjeet.jpg",
    avatarObjectPosition: "50% 22%",
    avatarGradientCss: "linear-gradient(135deg, #004d47 0%, #0d9488 100%)",
    accentGradient: "from-[#004d47] via-[#00635e] to-[#0d9488]",
    highlights: ["System Architecture", "Full-Stack Platform", "Clinical AI Lead"],
    focus:
      "Team Leader orchestrating system architecture, full-stack platform delivery, and clinical AI workflows.",
  },
  {
    id: "reetesh-v",
    name: "Reetesh V",
    initials: "RV",
    role: "Team Member",
    track: "Research & Design",
    email: "reeteshvenki@gmail.com",
    university: "Liverpool John Moores University",
    shortUniversity: "Liverpool John Moores Univ.",
    country: "India",
    githubHandle: "reeteshvriti",
    githubUrl: "https://github.com/reeteshvriti",
    linkedinUrl: "https://www.linkedin.com/in/reeteshv/",
    avatarUrl: "/images/team/reetesh.jpg",
    avatarObjectPosition: "50% 24%",
    avatarGradientCss: "linear-gradient(135deg, #0f766e 0%, #0891b2 100%)",
    accentGradient: "from-[#0f766e] to-[#0891b2]",
    highlights: ["Biomedical Evidence", "Research Synthesis", "Model Evaluation"],
    focus:
      "Research and biomedical intelligence collaborator focused on clinical evidence synthesis and model evaluation.",
  },
  {
    id: "varunika-b",
    name: "Varunika B",
    initials: "VB",
    role: "AI Engineer",
    track: "Engineering",
    email: "bvar.ece2024@rmd.ac.in",
    university: "AI Engineer at Anantnetra Technologies",
    shortUniversity: "Anantnetra Technologies",
    country: "India",
    githubHandle: "Varun2871",
    githubUrl: "https://github.com/Varun2871",
    avatarUrl: "/images/team/varunika.jpg",
    avatarObjectPosition: "50% 24%",
    avatarGradientCss: "linear-gradient(135deg, #005a53 0%, #10b981 100%)",
    accentGradient: "from-[#005a53] to-[#10b981]",
    highlights: ["Applied AI", "Decision Support", "ML Engineering"],
    focus:
      "AI Engineer contributing applied machine intelligence and clinical decision-support pipelines.",
  },
  {
    id: "andalamala-sumanth",
    name: "Andalamala Sumanth",
    initials: "AS",
    role: "Team Member",
    track: "Engineering",
    email: "andalamalasumanth@gmail.com",
    university:
      "Vel Tech Multi Tech Dr. Rangarajan Dr. Sakunthala Engineering College (Autonomous)",
    shortUniversity: "Vel Tech Multi Tech",
    country: "India",
    githubHandle: "sumanth463",
    githubUrl: "https://github.com/sumanth463",
    avatarUrl: "/images/team/sumanth.jpg",
    avatarObjectPosition: "50% 42%",
    avatarGradientCss: "linear-gradient(135deg, #0369a1 0%, #0d9488 100%)",
    accentGradient: "from-[#0369a1] to-[#0d9488]",
    highlights: ["Frontend Modules", "System Integration", "QA & Workflows"],
    focus:
      "Software engineering contributor advancing modular web workflows and collaborative integration.",
  },
  {
    id: "shreya-kapoor",
    name: "Shreya Kapoor",
    initials: "SK",
    role: "Team Member",
    track: "Research & Design",
    email: "shreyakapoor2890@gmail.com",
    university:
      "Indian Institute of Information Technology, Design and Manufacturing, Jabalpur",
    shortUniversity: "IIITDM Jabalpur",
    country: "India",
    avatarUrl: "/images/team/shreya.jpg",
    avatarObjectPosition: "50% 24%",
    avatarGradientCss: "linear-gradient(135deg, #065f46 0%, #0f766e 50%, #14b8a6 100%)",
    accentGradient: "from-[#065f46] to-[#14b8a6]",
    highlights: ["Product Design", "Health Literacy UX", "Patient Flows"],
    focus:
      "Design and biomedical user-experience contributor focused on human-centered health literacy.",
  },
];
