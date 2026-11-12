import { NextRequest, NextResponse } from "next/server";
import { buildContextualClinicalReply } from "@/lib/clinical-lstm";

// Fallback Mock Clinical Database for Vercel Serverless Previews
const MOCK_USER = {
  id: 1,
  email: "demo@medipredict.ai",
  full_name: "Dr. Elena Rostova",
  role: "clinician",
  is_active: true,
  is_verified: true,
  created_at: new Date().toISOString(),
};

const MOCK_REPORTS = [
  {
    id: 101,
    patient_id: 1,
    patient_name: "Rajesh Kumar (Demo)",
    title: "Comprehensive Metabolic & Lipid Panel",
    report_type: "biochemistry",
    report_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    file_path: "/uploads/demo_cmp_panel.pdf",
    extraction_confidence: 0.985,
    abnormal_count: 2,
    triage_priority: "stat_critical",
    clinician_status: "pending",
    clinician_notes: "",
    ai_interpretation:
      "Critical elevation in Fasting Blood Glucose (186.4 mg/dL) and HbA1c (8.9%). Immediate clinical glycemic optimization recommended.",
    measurements: [
      {
        id: 1001,
        test_name: "Fasting Blood Glucose",
        value: 186.4,
        unit: "mg/dL",
        reference_low: 70.0,
        reference_high: 99.0,
        reference_text: "70.0 - 99.0 mg/dL",
        is_abnormal: true,
        flag: "critical",
        confidence: 0.99,
        user_verified: true,
      },
      {
        id: 1002,
        test_name: "Hemoglobin A1c (HbA1c)",
        value: 8.9,
        unit: "%",
        reference_low: 4.0,
        reference_high: 5.6,
        reference_text: "4.0 - 5.6 %",
        is_abnormal: true,
        flag: "high",
        confidence: 0.98,
        user_verified: false,
      },
      {
        id: 1003,
        test_name: "Serum Creatinine",
        value: 0.92,
        unit: "mg/dL",
        reference_low: 0.6,
        reference_high: 1.2,
        reference_text: "0.6 - 1.2 mg/dL",
        is_abnormal: false,
        flag: "normal",
        confidence: 0.99,
        user_verified: true,
      },
      {
        id: 1004,
        test_name: "Total Cholesterol",
        value: 178.0,
        unit: "mg/dL",
        reference_low: 120.0,
        reference_high: 200.0,
        reference_text: "< 200.0 mg/dL",
        is_abnormal: false,
        flag: "normal",
        confidence: 0.97,
        user_verified: true,
      },
    ],
  },
  {
    id: 102,
    patient_id: 2,
    patient_name: "Priya Sharma (Demo)",
    title: "Celiac Serology & Immunoglobulin Profile",
    report_type: "immunology",
    report_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    file_path: "/uploads/demo_celiac_serology.pdf",
    extraction_confidence: 0.972,
    abnormal_count: 2,
    triage_priority: "urgent",
    clinician_status: "approved",
    clinician_notes: "Strongly positive anti-tTG IgA with normal total IgA confirms celiac disease. Referred for gastroenterology duodenal biopsy.",
    ai_interpretation:
      "Marked elevation of Anti-Tissue Transglutaminase IgA (>128 U/mL). Positive Anti-Endomysial Antibodies (EMA) indicates high probability of Marsh 3 enteropathy.",
    measurements: [
      {
        id: 1005,
        test_name: "Anti-tTG IgA",
        value: 128.5,
        unit: "U/mL",
        reference_low: 0.0,
        reference_high: 10.0,
        reference_text: "< 10.0 U/mL",
        is_abnormal: true,
        flag: "critical",
        confidence: 0.98,
        user_verified: true,
      },
      {
        id: 1006,
        test_name: "Total Serum IgA",
        value: 2.45,
        unit: "g/L",
        reference_low: 0.8,
        reference_high: 3.0,
        reference_text: "0.8 - 3.0 g/L",
        is_abnormal: false,
        flag: "normal",
        confidence: 0.99,
        user_verified: true,
      },
    ],
  },
];

const MOCK_METRICS = [
  { id: 1, user_id: 1, metric_type: "blood_pressure", value: 122, secondary_value: 78, unit: "mmHg", recorded_at: new Date(Date.now() - 3600000 * 2).toISOString(), source: "Omron Evolv Wireless", notes: "Resting, seated" },
  { id: 2, user_id: 1, metric_type: "blood_pressure", value: 118, secondary_value: 76, unit: "mmHg", recorded_at: new Date(Date.now() - 86400000).toISOString(), source: "Omron Evolv Wireless", notes: "Morning resting" },
  { id: 3, user_id: 1, metric_type: "blood_pressure", value: 124, secondary_value: 80, unit: "mmHg", recorded_at: new Date(Date.now() - 2 * 86400000).toISOString(), source: "Manual Clinical", notes: "Evening reading" },
  { id: 4, user_id: 1, metric_type: "blood_pressure", value: 120, secondary_value: 78, unit: "mmHg", recorded_at: new Date(Date.now() - 3 * 86400000).toISOString(), source: "Omron Evolv Wireless", notes: "Resting" },
  { id: 5, user_id: 1, metric_type: "blood_pressure", value: 126, secondary_value: 82, unit: "mmHg", recorded_at: new Date(Date.now() - 5 * 86400000).toISOString(), source: "Manual Clinical", notes: "Post light walk" },
  { id: 6, user_id: 1, metric_type: "blood_pressure", value: 119, secondary_value: 75, unit: "mmHg", recorded_at: new Date(Date.now() - 7 * 86400000).toISOString(), source: "Omron Evolv Wireless", notes: "Morning resting" },
  { id: 7, user_id: 1, metric_type: "blood_pressure", value: 121, secondary_value: 77, unit: "mmHg", recorded_at: new Date(Date.now() - 10 * 86400000).toISOString(), source: "Omron Evolv Wireless", notes: "Resting" },
  { id: 8, user_id: 1, metric_type: "blood_pressure", value: 125, secondary_value: 79, unit: "mmHg", recorded_at: new Date(Date.now() - 14 * 86400000).toISOString(), source: "Omron Evolv Wireless", notes: "Resting" },
  { id: 9, user_id: 1, metric_type: "blood_glucose", value: 96.0, unit: "mg/dL", recorded_at: new Date(Date.now() - 3600000 * 4).toISOString(), source: "Accu-Chek Guide", notes: "Fasting" },
  { id: 10, user_id: 1, metric_type: "heart_rate", value: 72, unit: "bpm", recorded_at: new Date(Date.now() - 3600000 * 1).toISOString(), source: "MediWatch Pro V4", notes: "Resting pulse" },
  { id: 11, user_id: 1, metric_type: "spo2", value: 98.4, unit: "%", recorded_at: new Date(Date.now() - 3600000 * 1).toISOString(), source: "Pulse Oximeter", notes: "Room air" },
  { id: 12, user_id: 1, metric_type: "hba1c", value: 5.4, unit: "%", recorded_at: new Date(Date.now() - 15 * 86400000).toISOString(), source: "Venipuncture Lab", notes: "Quarterly review" },
  { id: 13, user_id: 1, metric_type: "weight", value: 68.5, unit: "kg", recorded_at: new Date(Date.now() - 86400000).toISOString(), source: "Withings Body+", notes: "Morning" },
];

const MOCK_METRICS_SUMMARY = [
  { metric_type: "blood_pressure", unit: "mmHg", latest_value: 122, latest_secondary: 78, latest_date: new Date().toISOString(), min_value: 116, max_value: 126, average: 121, status: "normal" as const },
  { metric_type: "blood_glucose", unit: "mg/dL", latest_value: 96, latest_date: new Date().toISOString(), min_value: 88, max_value: 104, average: 95, status: "normal" as const },
  { metric_type: "heart_rate", unit: "bpm", latest_value: 72, latest_date: new Date().toISOString(), min_value: 62, max_value: 84, average: 71, status: "normal" as const },
  { metric_type: "spo2", unit: "%", latest_value: 98.4, latest_date: new Date().toISOString(), min_value: 97, max_value: 100, average: 98.6, status: "normal" as const },
  { metric_type: "hba1c", unit: "%", latest_value: 5.4, latest_date: new Date().toISOString(), min_value: 5.2, max_value: 5.6, average: 5.4, status: "normal" as const },
  { metric_type: "weight", unit: "kg", latest_value: 68.5, latest_date: new Date().toISOString(), min_value: 68.0, max_value: 69.2, average: 68.6, status: "normal" as const },
];

const MOCK_RESEARCH = [
  {
    id: 1,
    title: "ACG Clinical Guidelines: Diagnosis and Management of Celiac Disease",
    authors: "Rubio-Tapia A, Hill ID, Semrad C, Kelly CP, et al.",
    journal: "American Journal of Gastroenterology",
    year: 2023,
    pmid: "36598285",
    evidence_level: "Level 1A Guideline",
    category: "Gastroenterology",
    abstract_snippet:
      "Updated evidence-based guidelines for initial screening with anti-tTG IgA, indications for intestinal biopsy, and monitoring mucosal healing on a strict gluten-free diet.",
    url: "https://pubmed.ncbi.nlm.nih.gov/36598285/",
  },
  {
    id: 2,
    title: "Standards of Care in Diabetes — 2024",
    authors: "American Diabetes Association Professional Practice Committee",
    journal: "Diabetes Care",
    year: 2024,
    pmid: "38078580",
    evidence_level: "Level 1A Guideline",
    category: "Endocrinology",
    abstract_snippet:
      "Comprehensive clinical guidance detailing diagnostic thresholds for diabetes (HbA1c >= 6.5%), continuous glucose monitoring, and cardiovascular risk reduction.",
    url: "https://pubmed.ncbi.nlm.nih.gov/38078580/",
  },
];

const MOCK_BOOKMARKS = [
  {
    id: 1,
    user_id: 1,
    reference_id: 1,
    notes: "Core guideline for celiac screening algorithm and duodenal biopsy criteria.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    reference: MOCK_RESEARCH[0],
  },
  {
    id: 2,
    user_id: 1,
    reference_id: 2,
    notes: "Diagnostic thresholds and ADA glycemic targets reference.",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    reference: MOCK_RESEARCH[1],
  },
];

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    user_id: 1,
    title: "Critical Lab Flag Detected",
    message: "Elevated Fasting Glucose (186.4 mg/dL) identified in Comprehensive Metabolic Panel.",
    type: "alert",
    priority: "stat_critical",
    is_read: false,
    link: "/reports",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    user_id: 1,
    title: "Continuous Telemetry Sync Active",
    message: "MediWatch Pro V4 synced 482 resting pulse measurements successfully.",
    type: "info",
    priority: "routine",
    is_read: true,
    link: "/devices/wearables",
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 3,
    user_id: 1,
    title: "Consent Preference Audited",
    message: "Your zero-trust data segregation and DPDP Act 2023 telemetry consents were verified.",
    type: "success",
    priority: "routine",
    is_read: true,
    link: "/settings/privacy",
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

const MOCK_CONSENTS = [
  { consent_type: "clinical_ai_processing", description: "Allow evidence-grounded AI model reasoning on uploaded lab panels", is_granted: true, updated_at: new Date().toISOString() },
  { consent_type: "wearable_telemetry_sync", description: "Continuous streaming from smartwatches and medical Bluetooth biosensors", is_granted: true, updated_at: new Date().toISOString() },
  { consent_type: "research_data_donation", description: "De-identified genomic and metabolic telemetry contribution to clinical research", is_granted: false, updated_at: new Date().toISOString() },
  { consent_type: "emergency_clinician_access", description: "Automated alert dispatch to attending physician for STAT critical biomarkers", is_granted: true, updated_at: new Date().toISOString() },
];

const MOCK_DEVICES_HEALTH = [
  {
    device_id: "ESP32-SPO2-MAX30102",
    device_name: "MAX30102 Optical PPG Sensor",
    device_type: "sensor",
    status: "active",
    battery_level: 88,
    last_seen: new Date(Date.now() - 3 * 60000).toISOString(),
    data_points_24h: 840,
    error_rate: 0.02,
  },
  {
    device_id: "APPLE-WATCH-SERIES-9",
    device_name: "Apple Watch Series 9 (HealthKit)",
    device_type: "wearable",
    status: "active",
    battery_level: 65,
    last_seen: new Date(Date.now() - 15 * 60000).toISOString(),
    data_points_24h: 420,
    error_rate: 0.0,
  },
  {
    device_id: "GW-CLINICAL-IOT-01",
    device_name: "Raspberry Pi Medical Gateway",
    device_type: "iot_gateway",
    status: "active",
    battery_level: 100,
    last_seen: new Date(Date.now() - 1 * 60000).toISOString(),
    data_points_24h: 160,
    error_rate: 0.01,
  },
];

const MOCK_AUDIT_LOGS = [
  {
    id: 1,
    action: "CLINICAL_SIGN_OFF",
    user_id: 1,
    resource_type: "report",
    resource_id: 102,
    details: { status: "approved", notes: "Verified serology findings" },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    checksum: "a7c8e9d02341bf6e8a",
  },
  {
    id: 2,
    action: "ESCALATION_DISPATCH",
    user_id: 1,
    resource_type: "report",
    resource_id: 101,
    details: { status: "escalated", department: "Endocrinology & Diabetes Clinic" },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    checksum: "f8319eac5203b87d90",
  },
];

async function forwardToBackend(req: NextRequest, slug: string[]) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return null;

  const path = slug.join("/");
  const search = req.nextUrl.search;
  const targetUrl = `${backendUrl.replace(/\/$/, "")}/api/v1/${path}${search}`;

  try {
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (!["host", "connection", "content-length"].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer();

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: "follow",
    });

    const responseHeaders = new Headers();
    response.headers.forEach((val, key) => {
      responseHeaders.set(key, val);
    });

    const responseBody = await response.arrayBuffer();
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.warn(`[Proxy Fallback] Failed connecting to backend at ${targetUrl}:`, err);
    return null;
  }
}

export async function GET(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  const slug = params.slug || [];
  const path = slug.join("/");

  // Try proxying to real backend if configured
  const proxyRes = await forwardToBackend(req, slug);
  if (proxyRes) return proxyRes;

  // Local Serverless Fallbacks
  if (path === "health" || path === "") {
    return NextResponse.json({
      status: "healthy",
      service: "GeneWise API Gateway",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      backend_connected: !!process.env.BACKEND_URL,
    });
  }

  if (path === "users/me") {
    return NextResponse.json(MOCK_USER);
  }

  if (path === "users/consents" || path === "privacy/consent") {
    return NextResponse.json(MOCK_CONSENTS);
  }

  if (path === "users/export-data" || path === "privacy/export") {
    return NextResponse.json({
      export_version: "2.4",
      user: MOCK_USER,
      reports: MOCK_REPORTS,
      metrics: MOCK_METRICS,
      consents: MOCK_CONSENTS,
      generated_at: new Date().toISOString(),
      compliance: "DPDP Act 2023 / HIPAA Sec. 164.312",
    });
  }

  if (path === "assistant/providers") {
    return NextResponse.json({
      current_provider: "clinical_evidence",
      providers: {
        clinical_evidence: {
          name: "GeneWise Supervisor RAG v3.2",
          configured: true,
          model: "pubmed-grounded-v3.2",
          description: "PubMed-grounded clinical guideline reasoning & verifier",
        },
        lstm_temporal: {
          name: "Bi-LSTM Temporal Biomarker Engine",
          configured: true,
          model: "bilstm-biomarker-v2.4",
          description: "2-Layer Bi-LSTM sequential lab trajectory & velocity forecaster",
        },
        hybrid_rag_lstm: {
          name: "Hybrid RAG + Bi-LSTM Fusion v3",
          configured: true,
          model: "hybrid-fusion-v3.0",
          description: "Fuses PubMed guidelines with Bi-LSTM forecasting",
        },
        gemini: {
          name: "Google Gemini 2.0 Clinical",
          configured: !!process.env.GEMINI_API_KEY,
          model: "gemini-2.0-flash-clinical",
          description: "Multimodal medical analysis",
        },
        openai: {
          name: "OpenAI GPT-4o Reasoner",
          configured: !!process.env.OPENAI_API_KEY,
          model: "gpt-4o-clinical",
          description: "High-context conversational health assistant",
        },
      },
    });
  }

  if (path === "assistant/conversations") {
    return NextResponse.json([
      {
        id: 1,
        user_id: 1,
        title: "Glycemic Control & Elevated HbA1c",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        last_message: "Verified correlation between elevated fasting glucose and HbA1c 8.9%.",
      },
      {
        id: 2,
        user_id: 1,
        title: "Celiac Disease Serology & Dietary Guidance",
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        last_message: "Recommended endoscopic biopsy before starting a gluten-free diet.",
      },
    ]);
  }

  if (path.startsWith("assistant/conversations/") && path.endsWith("/messages")) {
    return NextResponse.json([
      {
        id: 1,
        conversation_id: 1,
        role: "assistant",
        content:
          "Hello! I am your GeneWise Clinical Assistant. You can ask questions about your laboratory reports, diagnostic biomarkers, or medical guidelines. How can I assist your health inquiry today?",
        sources: [],
        safety_alerts: [],
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);
  }

  if (path === "reports") {
    return NextResponse.json(MOCK_REPORTS);
  }

  if (path.startsWith("reports/") && path.endsWith("/export/csv")) {
    const csvContent = "Test Name,Value,Unit,Reference,Status\nFasting Blood Glucose,186.4,mg/dL,70.0 - 99.0,critical\nHbA1c,8.9,%,4.0 - 5.6,high\nSerum Creatinine,0.92,mg/dL,0.6 - 1.2,normal";
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="genewise_lab_report.csv"',
      },
    });
  }

  if (path.startsWith("reports/")) {
    const reportId = parseInt(slug[1]);
    const found = MOCK_REPORTS.find((r) => r.id === reportId) || MOCK_REPORTS[0];
    return NextResponse.json(found);
  }

  if (path === "clinician/reports") {
    const statusFilter = req.nextUrl.searchParams.get("status");
    if (!statusFilter || statusFilter === "all") {
      return NextResponse.json(MOCK_REPORTS);
    }
    return NextResponse.json(MOCK_REPORTS.filter((r) => r.clinician_status === statusFilter));
  }

  if (path === "clinician/audit-logs") {
    return NextResponse.json(MOCK_AUDIT_LOGS);
  }

  if (path === "ml/models") {
    return NextResponse.json([
      {
        id: "MOD-CELIAC-GB-01",
        name: "Celiac Disease Risk Gradient Booster",
        algorithm: "GradientBoostingClassifier",
        version: "1.0.4",
        auc: 0.962,
        samples: 2206,
        framework: "Scikit-Learn 1.4 / Joblib",
      },
      {
        id: "MOD-BILSTM-SEQ-03",
        name: "Bi-LSTM Longitudinal Biomarker Forecaster",
        algorithm: "2-Layer Bi-LSTM + Temporal Attention",
        version: "2.4.0",
        auc: 0.958,
        samples: 9400,
        framework: "PyTorch 2.3 / ONNX Runtime",
      },
      {
        id: "MOD-CARDIO-RISK-02",
        name: "Cardiometabolic 5-Year Risk Classifier",
        algorithm: "RandomForestEnsemble",
        version: "2.1.0",
        auc: 0.941,
        samples: 4800,
        framework: "Scikit-Learn / SHAP",
      },
    ]);
  }

  if (path === "ml/experiments") {
    return NextResponse.json([
      {
        id: "EXP-CELIAC-GB-01",
        model_name: "CeliacDiseaseGradientBoosting",
        experiment_name: "baseline_gradient_boosted_trees",
        dataset_name: "celiac_biomarker_cohort_v1",
        version: "v1.4.0-prod",
        artifact_path: "ml/artifacts/celiac_gb_baseline_v1_4.pkl",
        parameters: {
          algorithm: "GradientBoostingClassifier",
          n_estimators: 150,
          learning_rate: 0.08,
          max_depth: 4,
          subsample: 0.85,
          min_samples_split: 6,
          calibration: "Platt Scaling (5-fold CV)",
          feature_count: 14,
        },
        metrics: { accuracy: 0.941, roc_auc: 0.962, f1_score: 0.938, brier_score: 0.051 },
        status: "deployed",
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "EXP-BAYESIAN-HYPEROPT-02",
        model_name: "CeliacDiseaseGradientBoosting",
        experiment_name: "bayesian_hyperopt_n_estimators_200",
        dataset_name: "celiac_biomarker_cohort_v2",
        version: "v1.5.2-rc1",
        artifact_path: "ml/artifacts/celiac_gb_hyperopt_v1_5.pkl",
        parameters: {
          algorithm: "GradientBoostingClassifier + Optuna TPE",
          n_estimators: 200,
          learning_rate: 0.05,
          max_depth: 5,
          subsample: 0.9,
          min_samples_split: 4,
          calibration: "Isotonic Regression (5-fold CV)",
          feature_count: 18,
        },
        metrics: { accuracy: 0.948, roc_auc: 0.968, f1_score: 0.942, brier_score: 0.044 },
        status: "completed",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ]);
  }

  if (path === "diseases") {
    return NextResponse.json([
      {
        id: 1,
        name: "Celiac Disease (Gluten-Sensitive Enteropathy)",
        specialty: "Gastroenterology",
        summary:
          "Immune-mediated systemic disorder triggered by gluten ingestion in genetically susceptible individuals (HLA-DQ2/DQ8).",
        symptoms: ["Chronic diarrhea", "Abdominal distension", "Iron deficiency anemia", "Fatigue"],
        risk_factors: ["First-degree relative with celiac", "Type 1 diabetes", "Hashimoto thyroiditis"],
        diagnostic_criteria: ["Elevated Anti-tTG IgA", "Total IgA assessment", "Duodenal mucosal biopsy"],
        last_reviewed: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Type 2 Diabetes Mellitus",
        specialty: "Endocrinology",
        summary:
          "Metabolic condition characterized by progressive insulin secretion defect on the background of insulin resistance.",
        symptoms: ["Polyuria", "Polydipsia", "Nocturia", "Unexplained weight loss"],
        risk_factors: ["BMI > 25 kg/m²", "Sedentary lifestyle", "First-degree family history"],
        diagnostic_criteria: ["Fasting Plasma Glucose >= 126 mg/dL", "HbA1c >= 6.5%"],
        last_reviewed: new Date().toISOString(),
      },
    ]);
  }

  if (path === "genetics" || path === "genes") {
    return NextResponse.json([
      {
        id: 1,
        gene_symbol: "HLA-DQA1 / HLA-DQB1",
        gene_name: "Major Histocompatibility Complex Class II",
        chromosome: "Chr 6p21.3",
        associated_condition: "Celiac Disease Susceptibility (DQ2.5 / DQ8 heterodimers)",
        inheritance_pattern: "Complex Oligogenic",
        clinical_significance: "High negative predictive value (>99%); absence effectively rules out celiac disease.",
      },
      {
        id: 2,
        gene_symbol: "HFE",
        gene_name: "Homeostatic Iron Regulator",
        chromosome: "Chr 6p22.2",
        associated_condition: "Hereditary Hemochromatosis Type 1",
        inheritance_pattern: "Autosomal Recessive",
        clinical_significance: "C282Y homozygosity accounts for 85-90% of clinical hemochromatosis cases.",
      },
    ]);
  }

  if (path === "records") {
    return NextResponse.json([
      {
        id: 1,
        title: "Annual Influenza & Tdap Booster Vaccination",
        category: "Immunization Record",
        doctor_or_facility: "Apollo Specialty Clinic",
        record_date: new Date(Date.now() - 30 * 86400000).toISOString(),
        summary: "Administered Quadrivalent Inactivated Influenza vaccine (Lot #FL8923). No adverse reaction noted.",
      },
      {
        id: 2,
        title: "Abdominal Ultrasound Examination",
        category: "Radiology",
        doctor_or_facility: "Max Healthcare Imaging Centre",
        record_date: new Date(Date.now() - 60 * 86400000).toISOString(),
        summary: "Normal hepatic parenchyma without focal lesion or steatosis. Gallbladder, pancreas, and spleen normal.",
      },
    ]);
  }

  if (path === "research") {
    return NextResponse.json(MOCK_RESEARCH);
  }

  if (path === "research/bookmarks") {
    return NextResponse.json(MOCK_BOOKMARKS);
  }

  if (path === "devices") {
    return NextResponse.json([
      {
        id: "DEV-WATCH-01",
        device_name: "MediWatch Pro V4",
        device_type: "smartwatch",
        model_number: "MW-PRO-4",
        serial_number: "MWP4-2026-9041",
        battery_level: 84,
        is_active: true,
        firmware_version: "v3.2.1",
        last_sync: new Date().toISOString(),
      },
      {
        id: "DEV-OXI-02",
        device_name: "Continuous Pulse Oximeter",
        device_type: "pulse_oximeter",
        model_number: "POX-C2",
        serial_number: "POXC2-7749",
        battery_level: 92,
        is_active: true,
        firmware_version: "v1.4.0",
        last_sync: new Date().toISOString(),
      },
    ]);
  }

  if (path === "devices/health" || path === "analytics/device-health") {
    return NextResponse.json(MOCK_DEVICES_HEALTH);
  }

  if (path === "analytics/overview") {
    return NextResponse.json({
      total_measurements: 1420,
      active_devices_count: 3,
      average_heart_rate: 72.4,
      latest_blood_pressure: "122/78 mmHg",
      latest_spo2: 98.6,
      data_quality_score: 96.8,
      recent_anomalies_count: 1,
      timestamp: new Date().toISOString(),
      total_patients: 1240,
      active_monitored_streams: 18,
      verified_reports_count: 842,
      pending_triage_count: 3,
      avg_spo2_percentage: 98.6,
      mean_heart_rate_bpm: 72,
    });
  }

  if (path === "analytics/data-quality") {
    return NextResponse.json({
      overall_quality_percentage: 96.8,
      verified_points: 1120,
      calibrated_points: 240,
      unverified_points: 52,
      flagged_outliers: 8,
      recommendations: [
        "All connected telemetry sensors meet ISO 80601-2-61 pulse oximetry signal confidence thresholds.",
        "ESP32 MAX30102 shows high baseline signal-to-noise ratio (>28dB).",
        "Wearable batch synchronization latency is within optimal range (< 15 mins).",
      ],
      completeness: 98.6,
      accuracy: 99.1,
      timeliness: 99.8,
      consistency: 97.4,
      overall_score: 98.7,
    });
  }

  if (path === "metrics/summary") {
    return NextResponse.json(MOCK_METRICS_SUMMARY);
  }

  if (path === "metrics" || path.startsWith("metrics?")) {
    const metricType = req.nextUrl.searchParams.get("metric_type");
    if (metricType) {
      return NextResponse.json(MOCK_METRICS.filter((m) => m.metric_type === metricType));
    }
    return NextResponse.json(MOCK_METRICS);
  }

  if (path === "metrics/export/csv") {
    const csvContent = "Date,Metric Type,Value,Secondary Value,Unit,Source\n" +
      MOCK_METRICS.map((m) => `${m.recorded_at},${m.metric_type},${m.value},${m.secondary_value || ""},${m.unit},${m.source || ""}`).join("\n");
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="genewise_health_metrics.csv"',
      },
    });
  }

  if (path === "notifications") {
    return NextResponse.json(MOCK_NOTIFICATIONS);
  }

  if (path === "admin/stats") {
    return NextResponse.json({
      total_users: 148,
      active_patients: 124,
      clinicians_on_duty: 12,
      processed_panels_24h: 53,
      mean_latency_ms: 18.4,
      uptime_percentage: 99.98,
    });
  }

  if (path === "admin/users") {
    return NextResponse.json([
      MOCK_USER,
      {
        id: 2,
        email: "patient@medipredict.ai",
        full_name: "Priya Sharma",
        role: "patient",
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        email: "admin@medipredict.ai",
        full_name: "System Administrator",
        role: "admin",
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  // Catch-all for unrecognized GET requests - return empty array for collection safety
  return NextResponse.json([]);
}

export async function POST(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  const slug = params.slug || [];
  const path = slug.join("/");

  // Try proxying to real backend if configured
  const proxyRes = await forwardToBackend(req, slug);
  if (proxyRes) return proxyRes;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  if (path === "auth/login" || path === "auth/register") {
    return NextResponse.json({
      access_token: "demo_clinical_jwt_session_2026",
      refresh_token: "demo_refresh_token_2026",
      token_type: "bearer",
      user: {
        ...MOCK_USER,
        email: body.email || MOCK_USER.email,
        full_name: body.full_name || MOCK_USER.full_name,
      },
    });
  }

  if (path === "privacy/export" || path === "users/export-data") {
    return NextResponse.json({
      export_version: "2.4",
      user: MOCK_USER,
      reports: MOCK_REPORTS,
      metrics: MOCK_METRICS,
      consents: MOCK_CONSENTS,
      generated_at: new Date().toISOString(),
      compliance: "DPDP Act 2023 / HIPAA Sec. 164.312",
    });
  }

  if (path === "privacy/consent" || path === "users/consents") {
    return NextResponse.json({
      status: "updated",
      consent_type: body.consent_type,
      is_granted: body.is_granted,
      updated_at: new Date().toISOString(),
    });
  }

  if (path === "assistant/conversations") {
    return NextResponse.json({
      id: Date.now(),
      user_id: 1,
      title: body.title || "Clinical Health Inquiry",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  if (path.startsWith("assistant/conversations/") && path.endsWith("/messages")) {
    const userPrompt = String(body.content || "Clinical biomarker evaluation");
    const engineId = String(body.provider || "clinical_evidence");
    const reportNote = body.report_attachment_id
      ? `Lab Report #${body.report_attachment_id}`
      : undefined;
    const synthesized = buildContextualClinicalReply(userPrompt, engineId, reportNote);

    return NextResponse.json({
      id: Date.now(),
      conversation_id: parseInt(slug[1]) || 1,
      role: "assistant",
      content: synthesized.content,
      sources: synthesized.sources,
      safety_alerts: synthesized.safety_alerts,
      model_used: synthesized.model_used,
      confidence_score: synthesized.confidence_score,
      reasoning_trace: synthesized.reasoning_trace,
      follow_up_questions: synthesized.follow_up_questions,
      lstm_forecast: synthesized.lstm_forecast,
      created_at: new Date().toISOString(),
    });
  }

  if (path === "assistant/voice/query" || path === "voice/process") {
    const q = body.query_text || body.transcript || "General clinical telemetry inquiry";
    const lang = body.preferred_language || body.language || "hi-IN";

    let speechResp = "";
    let subNative = "";
    let subRoman = "";
    let subEng = "";
    let isEmergency = false;
    const tools = ["PubMed Guideline Synthesis", "Clinical Evidence Engine"];

    const qLower = q.toLowerCase();
    if (
      qLower.includes("chest pain") ||
      qLower.includes("chhati me dard") ||
      qLower.includes("heart attack") ||
      qLower.includes("saans") ||
      qLower.includes("unconscious")
    ) {
      isEmergency = true;
      speechResp = "यह एक आपातकालीन स्थिति हो सकती है। कृपया तुरंत 112 या 108 पर कॉल करें।";
      subNative = "यह एक आपातकालीन स्थिति हो सकती है। कृपया तुरंत 112 या 108 पर कॉल करें।";
      subRoman = "Yeh ek aapaatkaaleen sthiti ho sakti hai. Kripya turant 112 ya 108 par call karein.";
      subEng = "This could be an acute medical emergency. Please dial 112 or 108 immediately.";
      tools.push("STAT Emergency Dispatch Protocol");
    } else if (
      qLower.includes("blood pressure") ||
      qLower.includes("bp") ||
      qLower.includes("telemetry") ||
      qLower.includes("vitals")
    ) {
      speechResp = "आपका हालिया ब्लड प्रेशर 122/78 mmHg है, जो सामान्य सीमा में है। हृदय गति 72 bpm स्थिर है।";
      subNative = "आपका हालिया ब्लड प्रेशर 122/78 mmHg है, जो सामान्य सीमा में है। हृदय गति 72 bpm स्थिर है।";
      subRoman = "Aapka haaliya blood pressure 122/78 mmHg hai, jo samanya seema me hai. Hriday gati 72 bpm sthir hai.";
      subEng = "Your recent blood pressure is 122/78 mmHg, which is optimal. Heart rate is steady at 72 bpm.";
      tools.push("IoT ICU Node #409 Stream");
    } else if (
      qLower.includes("celiac") ||
      qLower.includes("ttg") ||
      qLower.includes("iga") ||
      qLower.includes("biopsy")
    ) {
      speechResp = "tTG-IgA एंटीबॉडी 48 U/mL का स्तर सीलिएक रोग की ओर संकेत करता है। एसीजी दिशानिर्देशों के अनुसार पुष्टि हेतु एंडोस्कोपी आवश्यक है।";
      subNative = "tTG-IgA एंटीबॉडी 48 U/mL का स्तर सीलिएक रोग की ओर संकेत करता है। एसीजी दिशानिर्देशों के अनुसार पुष्टि हेतु एंडोस्कोपी बायोप्सी आवश्यक है।";
      subRoman = "tTG-IgA antibody 48 U/mL celiac rog ki or sanket karta hai. ACG guidelines ke anusaar biopsy aavashyak hai.";
      subEng = "Elevated tTG-IgA of 48 U/mL indicates probable celiac disease. Duodenal biopsy is recommended per ACG 2023 Grade 1A.";
      tools.push("Celiac Risk Stratifier (AUC 0.94)");
    } else if (
      qLower.includes("glucose") ||
      qLower.includes("sugar") ||
      qLower.includes("diabetes") ||
      qLower.includes("hba1c")
    ) {
      speechResp = "फास्टिंग ब्लड ग्लूकोज 114 mg/dL प्रीडायबिटीज रेंज में है। एडीए 2024 मानकों के अनुसार जीवनशैली में संशोधन की सलाह दी जाती है।";
      subNative = "फास्टिंग ब्लड ग्लूकोज 114 mg/dL प्रीडायबिटीज रेंज में है। एडीए 2024 मानकों के अनुसार जीवनशैली में संशोधन और पुनः परीक्षण की सलाह दी जाती है।";
      subRoman = "Fasting glucose 114 mg/dL pre-diabetes range me hai. ADA 2024 standards ke mutabik lifestyle modification zaroori hai.";
      subEng = "Fasting glucose of 114 mg/dL falls within pre-diabetes range. Lifestyle intervention is recommended per ADA 2024.";
      tools.push("ADA 2024 Glycemic Standards");
    } else if (
      qLower.includes("marfan") ||
      qLower.includes("fbn1") ||
      qLower.includes("genetics") ||
      qLower.includes("pedigree") ||
      qLower.includes("carrier")
    ) {
      speechResp = "मारफान सिंड्रोम FBN1 जीन में ऑटोसोमल डोमिनेंट म्यूटेशन के कारण होता है। प्रत्येक संतान में 50% संचरण जोखिम होता है।";
      subNative = "मारफान सिंड्रोम FBN1 जीन (15q21.1) में ऑटोसोमल डोमिनेंट म्यूटेशन के कारण होता है। क्लिनवार रिकॉर्ड VCV000016375 के अनुसार 50% विरासत जोखिम है।";
      subRoman = "Marfan syndrome FBN1 gene me autosomal dominant mutation se hota hai. 50% virasat jokhim hai.";
      subEng = "Marfan syndrome is caused by autosomal dominant variants in FBN1 (15q21.1) with 50% Mendelian transmission risk per ClinVar VCV000016375.";
      tools.push("NCBI ClinVar Registry", "GeneWise Pedigree Trace");
    } else {
      speechResp = "मैंने आपका प्रश्न समझ लिया है। क्लिनिकल साक्ष्यों के आधार पर आपके स्वास्थ्य पैरामीटर स्थिर और सामान्य हैं।";
      subNative = `आपके प्रश्न "${q}" का क्लिनिकल विश्लेषण पूरा हो गया है। साक्ष्य-आधारित दिशानिर्देशों के अनुसार सभी पैरामीटर सुरक्षित हैं।`;
      subRoman = `Aapke prashna "${q}" ka clinical vishleshan poora ho gaya hai. Sabhi parameters surakshit hain.`;
      subEng = `Clinical inquiry for "${q}" has been verified against current PubMed literature and clinical practice guidelines.`;
    }

    const langMap: Record<string, string> = {
      "hi-IN": "Hindi",
      "ta-IN": "Tamil",
      "te-IN": "Telugu",
      "bn-IN": "Bengali",
      "mr-IN": "Marathi",
      "gu-IN": "Gujarati",
      "kn-IN": "Kannada",
      "ml-IN": "Malayalam",
      "pa-IN": "Punjabi",
      "od-IN": "Odia",
      "as-IN": "Assamese",
      "ur-IN": "Urdu",
      "en-IN": "Indian English",
    };

    return NextResponse.json({
      transcript: q,
      detected_language: lang,
      language_name: langMap[lang] || "Hindi",
      detected_confidence: 0.98,
      speech_response: speechResp,
      response_text: subEng,
      is_emergency: isEmergency,
      tools_executed: tools,
      subtitles: {
        native: subNative,
        romanized: subRoman,
        english: subEng,
      },
      audio_url: null,
    });
  }

  if (path === "reports/upload") {
    return NextResponse.json({
      id: Date.now(),
      patient_id: 1,
      patient_name: "Demo Patient",
      title: "Uploaded Clinical Laboratory Panel",
      report_type: "blood_chemistry",
      report_date: new Date().toISOString(),
      extraction_confidence: 0.98,
      abnormal_count: 1,
      triage_priority: "routine",
      clinician_status: "pending",
      ai_interpretation:
        "Document successfully parsed. Extracted physiological parameters are within reference range with isolated slight variance.",
      measurements: [
        {
          id: Date.now() + 1,
          test_name: "Fasting Serum Glucose",
          value: 94.0,
          unit: "mg/dL",
          reference_text: "70.0 - 99.0 mg/dL",
          is_abnormal: false,
          flag: "normal",
          confidence: 0.99,
          user_verified: true,
        },
      ],
    });
  }

  if (path.startsWith("reports/") && path.endsWith("/analyze")) {
    const reportId = parseInt(slug[1]);
    const found = MOCK_REPORTS.find((r) => r.id === reportId) || MOCK_REPORTS[0];
    return NextResponse.json({
      report_id: reportId,
      status: "completed",
      summary: found.ai_interpretation,
      findings: found.measurements,
    });
  }

  if (path.startsWith("reports/") && path.endsWith("/measurements")) {
    return NextResponse.json({
      id: Date.now(),
      test_name: body.test_name || "New Biomarker",
      value: body.value || 0,
      unit: body.unit || "mg/dL",
      reference_text: body.reference_text || "Standard Range",
      is_abnormal: body.is_abnormal || false,
      flag: body.flag || "normal",
      confidence: 1.0,
      user_verified: true,
    });
  }

  if (path === "ml/predict-risk" || path === "ml/predict/celiac") {
    const age = body.age || 28;
    const iga = body.iga || 2.4;
    const isDiabetes = body.diabetes === "yes" || body.diabetes === "Yes" || body.has_type1_diabetes;
    const riskProb = Math.min(0.96, Math.max(0.04, (isDiabetes ? 0.35 : 0.1) + (iga > 10 ? 0.45 : 0.05)));

    return NextResponse.json({
      risk_level: riskProb > 0.6 ? "High" : riskProb > 0.3 ? "Moderate" : "Low",
      estimated_risk_probability: riskProb,
      predicted_classification: riskProb > 0.4 ? "High Celiac Risk" : "Low / Average Population Risk",
      confidence_interval: [Math.max(0.01, riskProb - 0.08), Math.min(0.99, riskProb + 0.08)],
      contributing_factors: [
        isDiabetes ? "Documented Type 1 Diabetes history (+0.32 probability weight)" : "Negative diabetes history",
        `Serum Immunoglobulin level: ${iga} g/L`,
        "Persistent gastrointestinal discomfort report",
      ],
      recommended_clinical_followup: [
        "Confirmatory anti-tTG IgA quantitative serology titer",
        "Total serum IgA assessment to rule out selective deficiency",
        "Gastroenterology specialist consultation before dietary changes",
      ],
      model_provenance: {
        algorithm: "GradientBoostingClassifier (Scikit-Learn)",
        version: "1.0.4",
        test_auc: "0.962",
        test_accuracy: "94.1%",
      },
    });
  }

  if (path === "ml/experiments") {
    const modelName = body.model_name || "CustomBiomedicalModel";
    const safeSlug = String(modelName).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    return NextResponse.json({
      id: `EXP-USER-${Date.now().toString().slice(-4)}`,
      model_name: modelName,
      experiment_name: body.experiment_name || "experiment_run",
      dataset_name: body.dataset_name || "cohort_validation_v1",
      version: body.version || "v1.0.0-exp",
      artifact_path: body.artifact_path || `ml/artifacts/${safeSlug}_checkpoint.pkl`,
      parameters: body.parameters && Object.keys(body.parameters).length > 0
        ? body.parameters
        : {
            algorithm: modelName,
            n_estimators: 180,
            learning_rate: 0.06,
            max_depth: 5,
            calibration: "Platt Scaling",
          },
      metrics: {
        accuracy: body.accuracy || 0.94,
        roc_auc: body.auc || 0.96,
        f1_score: body.f1 || 0.93,
        brier_score: body.brier_score || 0.052,
      },
      status: "completed",
      created_at: new Date().toISOString(),
    });
  }

  if (path === "records") {
    return NextResponse.json({
      id: Date.now(),
      title: body.title || "Personal Health Record",
      category: body.category || "Clinical Consultation",
      doctor_or_facility: body.doctor_or_facility || "Attending Physician",
      record_date: body.record_date || new Date().toISOString(),
      summary: body.summary || "Health record entry logged securely.",
    });
  }

  if (path === "metrics") {
    return NextResponse.json({
      id: Date.now(),
      metric_type: body.metric_type || "blood_pressure",
      value: body.value || 120,
      secondary_value: body.secondary_value || undefined,
      unit: body.unit || "mmHg",
      source: body.source || "manual_dashboard",
      recorded_at: new Date().toISOString(),
    });
  }

  if (path === "research/bookmarks") {
    const ref = MOCK_RESEARCH.find((r) => r.id === body.reference_id) || MOCK_RESEARCH[0];
    return NextResponse.json({
      id: Date.now(),
      user_id: 1,
      reference_id: body.reference_id || 1,
      notes: body.notes || "",
      created_at: new Date().toISOString(),
      reference: ref,
    });
  }

  if (path === "devices") {
    return NextResponse.json({
      id: `DEV-${Date.now().toString().slice(-4)}`,
      device_name: body.device_name || "Connected Biosensor",
      device_type: body.device_type || "wearable",
      model_number: body.model_number || "GEN-2026",
      serial_number: body.serial_number || `SN-${Date.now().toString().slice(-6)}`,
      battery_level: 100,
      is_active: true,
      firmware_version: "v1.0.0",
      last_sync: new Date().toISOString(),
    });
  }

  if (path.startsWith("devices/") && (path.endsWith("/connect") || path.endsWith("/disconnect"))) {
    return NextResponse.json({
      status: path.endsWith("/connect") ? "connected" : "disconnected",
      device_id: slug[1],
    });
  }

  if (path === "devices/wearables/ingest" || path === "devices/sensors/ingest" || path === "devices/iot/telemetry") {
    return NextResponse.json({
      status: "success",
      records_processed: Array.isArray(body.measurements) ? body.measurements.length : 1,
      received_at: new Date().toISOString(),
    });
  }

  if (path === "notifications/read-all") {
    return NextResponse.json({ status: "success", all_read: true });
  }

  if (path.startsWith("notifications/") && path.endsWith("/read")) {
    return NextResponse.json({ status: "success", read: true, id: parseInt(slug[1]) });
  }

  // Catch-all POST
  return NextResponse.json({ status: "success", message: "Recorded successfully", data: body });
}

export async function PUT(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  const slug = params.slug || [];
  const path = slug.join("/");

  const proxyRes = await forwardToBackend(req, slug);
  if (proxyRes) return proxyRes;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  if (path.startsWith("clinician/reports/") && path.endsWith("/review")) {
    const reportId = parseInt(slug[2]);
    const found = MOCK_REPORTS.find((r) => r.id === reportId) || MOCK_REPORTS[0];
    const updated = {
      ...found,
      clinician_status: body.status || "approved",
      clinician_notes: body.notes || found.clinician_notes,
      escalation_department: body.department,
      escalation_reason: body.reason,
    };
    return NextResponse.json(updated);
  }

  if (path === "users/consents") {
    return NextResponse.json({
      status: "updated",
      consent_type: body.consent_type,
      is_granted: body.is_granted,
      updated_at: new Date().toISOString(),
    });
  }

  if (path === "users/me") {
    return NextResponse.json({
      ...MOCK_USER,
      ...body,
    });
  }

  return NextResponse.json({ status: "success", updated: true, data: body });
}

export async function DELETE(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  const slug = params.slug || [];
  const proxyRes = await forwardToBackend(req, slug);
  if (proxyRes) return proxyRes;

  return NextResponse.json({ status: "deleted", success: true });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
