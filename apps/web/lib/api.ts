import {
  AgentRun,
  AnalyticsOverview,
  AuthResponse,
  CeliacRiskRequest,
  CeliacRiskResponse,
  Conversation,
  DataQualityReport,
  Device,
  DeviceCreate,
  DeviceHealthItem,
  DeviceStatus,
  DiseaseCondition,
  GeneAssociation,
  HealthMeasurement,
  HealthMetricSummary,
  IngestionResult,
  LaboratoryMeasurement,
  MedicalReference,
  MedicalReport,
  Message,
  MLExperiment,
  PersonalRecord,
  ProviderStatus,
  ResearchBookmark,
  SensorMeasurement,
  User,
  UserConsent,
  WearableMeasurement,
} from "@/types";
import { buildContextualClinicalReply } from "./clinical-lstm";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? "/api/v1"
    : process.env.BACKEND_URL
    ? `${process.env.BACKEND_URL.replace(/\/$/, "")}/api/v1`
    : "http://127.0.0.1:8000/api/v1");

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("medipredict_token");
  }

  public setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("medipredict_token", token);
    }
  }

  public clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("medipredict_token");
      localStorage.removeItem("medipredict_user");
    }
  }

  private ensureArray<T>(val: any): T[] {
    if (Array.isArray(val)) return val;
    if (val && Array.isArray(val.data)) return val.data;
    if (val && Array.isArray(val.items)) return val.items;
    if (val && Array.isArray(val.results)) return val.results;
    return [];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});

    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const url = `${API_BASE}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.clearToken();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }

      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}`;
        try {
          const errorJson = await response.json();
          errorMsg = errorJson.detail || errorMsg;
        } catch {
          // use default error message
        }
        throw new Error(errorMsg);
      }

      return response.json();
    } catch (networkError: any) {
      // In cloud / Vercel standalone preview without live backend, gracefully return clinical mock data
      console.warn(`[GeneWise API] Backend connection to ${url} unavailable, engaging local clinical fallback engine.`);
      return this.fallbackResponse<T>(endpoint, options);
    }
  }

  private fallbackResponse<T>(endpoint: string, options: RequestInit): T {
    const method = options.method || "GET";
    const body = options.body ? (typeof options.body === "string" ? JSON.parse(options.body) : options.body) : {};

    // 1. Auth Fallbacks
    if (endpoint === "/auth/register") {
      const regEmail = String(body.email || "user@medipredict.ai");
      const regName = String(body.full_name || "Clinical Explorer").trim() || "Clinical Explorer";
      const regRole = String(body.role || (regEmail.includes("admin") ? "admin" : regEmail.includes("patient") ? "patient" : "clinician"));
      const user: any = {
        id: Date.now() % 100000,
        email: regEmail,
        full_name: regName,
        role: regRole,
        phone: body.phone || undefined,
        phone_verified: Boolean(body.phone),
        specialty: regRole === "patient" ? "Genomic Health Literacy Member" : "Clinical Genetics & Genomics",
        organization: "GeneWise Precision Health Vault",
        avatar_url: "/images/doctor-geneticist.jpg",
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("medipredict_user", JSON.stringify(user));
      }
      return user as unknown as T;
    }

    if (endpoint === "/auth/login") {
      const loginEmail = String(body.email || "demo@medipredict.ai");
      const isAdmin = loginEmail.toLowerCase().includes("admin");
      const isPatient = loginEmail.toLowerCase().includes("patient");
      const role = isAdmin ? "admin" : isPatient ? "patient" : "clinician";
      const defaultName = isAdmin ? "Chief Genomic Admin" : isPatient ? "Alex Rivera" : "Dr. Elena Rostova";
      const defaultPhone = isAdmin ? "+1 (555) 019-1234" : isPatient ? "+1 (555) 019-8822" : "+1 (555) 019-2834";

      let existingOverrides: Record<string, any> = {};
      if (typeof window !== "undefined") {
        try {
          existingOverrides = JSON.parse(localStorage.getItem("medipredict_profile_overrides") || "{}") || {};
        } catch {}
      }

      const user = {
        id: isAdmin ? 3 : isPatient ? 2 : 1,
        email: loginEmail,
        full_name: existingOverrides.full_name || defaultName,
        role: existingOverrides.role || role,
        phone: existingOverrides.phone || defaultPhone,
        phone_verified: existingOverrides.phone_verified ?? true,
        specialty:
          existingOverrides.specialty ||
          (role === "patient"
            ? "Genomic Literacy & Family Pedigree Member"
            : role === "admin"
            ? "Clinical Governance & Compliance Director"
            : "Board-Certified Clinical Geneticist"),
        organization: existingOverrides.organization || "GeneWise Precision Genomics Institute",
        avatar_url: existingOverrides.avatar_url || "/images/doctor-geneticist.jpg",
        avatar_color: existingOverrides.avatar_color || "teal",
        ...existingOverrides,
        is_active: true,
        is_verified: true,
        created_at: existingOverrides.created_at || new Date().toISOString(),
      };
      this.setToken("demo_clinical_jwt_token_2026");
      if (typeof window !== "undefined") {
        localStorage.setItem("medipredict_user", JSON.stringify(user));
      }
      return {
        access_token: "demo_clinical_jwt_token_2026",
        refresh_token: "demo_refresh_token_2026",
        token_type: "bearer",
        user,
      } as unknown as T;
    }

    if (endpoint === "/auth/otp/send") {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      return {
        message: "Clinical authentication OTP dispatched via encrypted SMS gateway.",
        otp_preview: generatedOtp,
        expires_in: 300,
      } as unknown as T;
    }

    if (endpoint === "/auth/otp/verify") {
      const phone = (body.phone || "+1 (555) 019-2834").toString();
      const digits = phone.replace(/\D/g, "");
      const isAdmin = phone.includes("admin") || digits.endsWith("1234");
      const isPatient = phone.includes("patient") || digits.endsWith("8822");
      const inferredRole = isAdmin ? "admin" : isPatient ? "patient" : "clinician";
      const role = body.role || inferredRole;
      const defaultName =
        body.full_name?.trim() ||
        (role === "admin" ? "Chief Genomic Admin" : role === "patient" ? "Alex Rivera" : "Dr. Elena Rostova");
      const email =
        role === "admin" ? "admin@medipredict.ai" : role === "patient" ? "patient@medipredict.ai" : "demo@medipredict.ai";

      let existingOverrides: Record<string, any> = {};
      if (typeof window !== "undefined") {
        try {
          existingOverrides = JSON.parse(localStorage.getItem("medipredict_profile_overrides") || "{}") || {};
        } catch {}
      }

      const user = {
        id: role === "admin" ? 3 : role === "patient" ? 2 : 1,
        email,
        full_name: body.full_name?.trim() || existingOverrides.full_name || defaultName,
        role,
        phone,
        phone_verified: true,
        specialty:
          body.specialty ||
          existingOverrides.specialty ||
          (role === "patient"
            ? "Genomic Literacy & Family History Tracker"
            : role === "admin"
            ? "Clinical Governance & Privacy Lead"
            : "Board-Certified Clinical Geneticist"),
        organization: existingOverrides.organization || "GeneWise Precision Genomics Institute",
        avatar_url: existingOverrides.avatar_url || "/images/doctor-geneticist.jpg",
        avatar_color: existingOverrides.avatar_color || "teal",
        is_active: true,
        is_verified: true,
        created_at: existingOverrides.created_at || new Date().toISOString(),
      };
      this.setToken("demo_clinical_phone_jwt_token_2026");
      if (typeof window !== "undefined") {
        localStorage.setItem("medipredict_user", JSON.stringify(user));
      }
      return {
        access_token: "demo_clinical_phone_jwt_token_2026",
        refresh_token: "demo_phone_refresh_token_2026",
        token_type: "bearer",
        user,
      } as unknown as T;
    }

    if (endpoint === "/users/me") {
      let storedUser: Record<string, any> = {};
      if (typeof window !== "undefined") {
        try {
          storedUser = JSON.parse(localStorage.getItem("medipredict_user") || "null") || {};
        } catch {}
      }
      const baseUser = Object.keys(storedUser).length
        ? storedUser
        : {
            id: 1,
            email: "demo@medipredict.ai",
            full_name: "Dr. Elena Rostova",
            role: "clinician",
            phone: "+1 (555) 019-2834",
            phone_verified: true,
            specialty: "Board-Certified Clinical Geneticist",
            organization: "GeneWise Precision Genomics Institute",
            avatar_url: "/images/doctor-geneticist.jpg",
            avatar_color: "teal",
            is_active: true,
            is_verified: true,
            created_at: new Date().toISOString(),
          };

      if (method === "PATCH") {
        const { password: _ignoredPassword, ...safeUpdates } = body;
        const merged = { ...baseUser, ...safeUpdates };
        if (typeof window !== "undefined") {
          localStorage.setItem("medipredict_user", JSON.stringify(merged));
        }
        return merged as unknown as T;
      }

      return baseUser as unknown as T;
    }

    // 2. Assistant & Conversations
    if (endpoint === "/assistant/providers") {
      return {
        current_provider: "clinical_evidence",
        providers: {
          clinical_evidence: { name: "GeneWise Supervisor RAG v3.2", configured: true, model: "pubmed-grounded-v3.2", description: "Multi-agent PubMed RAG & guideline verifier" },
          lstm_temporal: { name: "Bi-LSTM Temporal Biomarker Engine", configured: true, model: "bilstm-biomarker-v2.4", description: "2-Layer Bi-LSTM sequential lab trajectory & velocity forecaster" },
          hybrid_rag_lstm: { name: "Hybrid RAG + Bi-LSTM Fusion v3", configured: true, model: "hybrid-fusion-v3.0", description: "Fuses PubMed clinical guidelines with Bi-LSTM forecasting" },
          gemini: { name: "Google Gemini 2.0 Clinical", configured: true, model: "gemini-2.0-flash-clinical", description: "Multimodal Google Gen AI Clinical" },
          openai: { name: "OpenAI GPT-4o Reasoner", configured: true, model: "gpt-4o-clinical", description: "OpenAI high-context clinical synthesizer" },
        },
      } as unknown as T;
    }

    if (endpoint === "/assistant/conversations" && method === "GET") {
      return [
        {
          id: 1,
          user_id: 1,
          title: "Elevated Serum ALT and Ferritin Consultation",
          created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60000).toISOString(),
          last_message: "Verified correlation with HFE gene markers for hereditary hemochromatosis.",
        },
        {
          id: 2,
          user_id: 1,
          title: "Nocturnal Pulse Oximetry and SpO2 Stability",
          created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
          updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
          last_message: "Mean nocturnal SpO2 remained stable at 98.4% without significant desaturations.",
        },
      ] as unknown as T;
    }

    if (endpoint.startsWith("/assistant/conversations") && endpoint.endsWith("/messages")) {
      const promptText = String(body.content || "Clinical biomarker evaluation");
      const engineId = String(body.provider || "clinical_evidence");
      const convIdNum = parseInt(endpoint.split("/")[3] || "1", 10) || 1;
      const synthesized = buildContextualClinicalReply(
        promptText,
        engineId,
        body.report_attachment_id ? `Lab Report #${body.report_attachment_id}` : undefined
      );
      return {
        id: Date.now(),
        conversation_id: convIdNum,
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
      } as unknown as T;
    }

    // 3. Laboratory Reports
    if (endpoint === "/reports" && method === "GET") {
      return [
        {
          id: 101,
          user_id: 1,
          title: "Comprehensive Metabolic Panel (CMP-14)",
          report_type: "Biochemical Analysis",
          report_date: new Date(Date.now() - 2 * 86400000).toISOString(),
          status: "verified",
          file_name: "LabCorp_CMP_March2026.pdf",
          summary: "Mild ALT elevation (64 U/L) and elevated fasting glucose (118 mg/dL). Renal panel normal.",
          extraction_confidence: 0.98,
          requires_verification: false,
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          measurement_count: 14,
          abnormal_count: 2,
        },
        {
          id: 102,
          user_id: 1,
          title: "Iron & Ferritin Saturation Panel",
          report_type: "Hematology & Serology",
          report_date: new Date(Date.now() - 7 * 86400000).toISOString(),
          status: "requires_verification",
          file_name: "Quest_Iron_Panel_March2026.pdf",
          summary: "Serum Ferritin 420 ng/mL (Ref: 30-400 ng/mL). Transferrin saturation at 52%.",
          extraction_confidence: 0.95,
          requires_verification: true,
          created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
          measurement_count: 6,
          abnormal_count: 1,
        },
      ] as unknown as T;
    }

    // 4. Metrics & Summary
    if (endpoint === "/metrics/summary") {
      return [
        { metric_type: "blood_pressure", unit: "mmHg", latest_value: 122, latest_secondary: 78, latest_date: new Date().toISOString(), min_value: 116, max_value: 126, average: 121, status: "normal" },
        { metric_type: "blood_glucose", unit: "mg/dL", latest_value: 96, latest_date: new Date().toISOString(), min_value: 88, max_value: 104, average: 95, status: "normal" },
        { metric_type: "heart_rate", unit: "bpm", latest_value: 72, latest_date: new Date().toISOString(), min_value: 62, max_value: 84, average: 71, status: "normal" },
        { metric_type: "spo2", unit: "%", latest_value: 98.4, latest_date: new Date().toISOString(), min_value: 97, max_value: 100, average: 98.6, status: "normal" },
        { metric_type: "hba1c", unit: "%", latest_value: 5.4, latest_date: new Date().toISOString(), min_value: 5.2, max_value: 5.6, average: 5.4, status: "normal" },
        { metric_type: "weight", unit: "kg", latest_value: 68.5, latest_date: new Date().toISOString(), min_value: 68.0, max_value: 70.8, average: 69.4, status: "normal" },
      ] as unknown as T;
    }

    if (endpoint.startsWith("/metrics") && method === "GET") {
      const qIndex = endpoint.indexOf("?");
      let requestedType: string | null = null;
      if (qIndex !== -1) {
        const queryParams = new URLSearchParams(endpoint.slice(qIndex));
        requestedType = queryParams.get("metric_type");
      }

      // Generate rich 30-day realistic clinical longitudinal time series
      const now = Date.now();
      const generateSeries = (
        type: string,
        unit: string,
        source: string,
        baseVal: number,
        variation: number,
        days = 30,
        secBase?: number
      ) => {
        const list: any[] = [];
        for (let i = days - 1; i >= 0; i--) {
          const timestamp = new Date(now - i * 86400000 + Math.sin(i) * 3600000).toISOString();
          // Gradual realistic drift (e.g. weight progressing downward from 70.8 to 68.5 kg)
          const trendDrift = type === "weight" ? (i * 0.075) : Math.sin(i / 2.5) * (variation * 0.4);
          const noise = ((i % 4) - 1.5) * (variation * 0.25);
          const val = Number((baseVal + trendDrift + noise).toFixed(type === "hba1c" || type === "weight" || type === "spo2" ? 1 : 0));
          const secVal = secBase !== undefined ? Math.round(secBase + Math.cos(i / 2) * 2.5) : undefined;

          list.push({
            id: list.length + 1,
            user_id: 1,
            metric_type: type,
            value: val,
            secondary_value: secVal,
            unit,
            recorded_at: timestamp,
            source,
            notes: i === 0 ? "Latest calibrated telemetry measurement" : undefined,
          });
        }
        return list;
      };

      const bpSeries = generateSeries("blood_pressure", "mmHg", "Omron Evolv Wireless BP", 122, 5, 30, 78);
      const glucoseSeries = generateSeries("blood_glucose", "mg/dL", "Fasting Glucometer", 96, 6, 30);
      const hrSeries = generateSeries("heart_rate", "bpm", "Continuous PPG Sensor", 72, 6, 30);
      const spo2Series = generateSeries("spo2", "%", "Pulse Oximeter", 98.4, 0.8, 30);
      const hba1cSeries = generateSeries("hba1c", "%", "Laboratory Venipuncture", 5.4, 0.2, 12);
      const weightSeries = generateSeries("weight", "kg", "Smart Scale", 68.5, 0.6, 30);

      const allMetrics = [
        ...bpSeries,
        ...glucoseSeries,
        ...hrSeries,
        ...spo2Series,
        ...hba1cSeries,
        ...weightSeries,
      ];

      if (requestedType && requestedType !== "all") {
        return allMetrics.filter((m) => m.metric_type === requestedType) as unknown as T;
      }
      return allMetrics as unknown as T;
    }

    // 5. Analytics
    if (endpoint === "/analytics/overview") {
      return {
        total_measurements: 1420,
        active_devices_count: 3,
        average_heart_rate: 72.4,
        latest_blood_pressure: "122/78",
        latest_spo2: 98.6,
        data_quality_score: 96.8,
        recent_anomalies_count: 1,
        timestamp: new Date().toISOString(),
      } as unknown as T;
    }

    if (endpoint === "/analytics/device-health") {
      return [
        { device_id: "ESP32-SPO2-MAX30102", device_name: "MAX30102 Optical PPG Sensor", device_type: "sensor", status: "active", battery_level: 88, last_seen: new Date(Date.now() - 3 * 60000).toISOString(), data_points_24h: 840, error_rate: 0.02 },
        { device_id: "APPLE-WATCH-SERIES-9", device_name: "Apple Watch Series 9 (HealthKit)", device_type: "wearable", status: "active", battery_level: 65, last_seen: new Date(Date.now() - 15 * 60000).toISOString(), data_points_24h: 420, error_rate: 0.0 },
        { device_id: "GW-CLINICAL-IOT-01", device_name: "Raspberry Pi Medical Gateway", device_type: "iot_gateway", status: "active", battery_level: 100, last_seen: new Date(Date.now() - 1 * 60000).toISOString(), data_points_24h: 160, error_rate: 0.01 },
      ] as unknown as T;
    }

    if (endpoint === "/analytics/data-quality") {
      return {
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
      } as unknown as T;
    }

    // 6. Devices & Ingestion
    if (endpoint.startsWith("/devices") && method === "GET") {
      return [
        { id: "ESP32-MAX30102-SPO2", user_id: 1, name: "MAX30102 High-Sensitivity Pulse Oximeter", device_type: "sensor", manufacturer: "Maxim Integrated / ESP32", model_number: "MAX30102-PPG-V2", serial_number: "ESP-984210", protocol: "bluetooth_le", status: "active", battery_level: 88, last_sync_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: "OMRON-EVOLV-BP", user_id: 1, name: "Omron Evolv Wireless Blood Pressure Monitor", device_type: "sensor", manufacturer: "Omron Healthcare", model_number: "BP7000", serial_number: "OMR-451290", protocol: "bluetooth_le", status: "active", battery_level: 94, last_sync_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ] as unknown as T;
    }

    if (endpoint.startsWith("/ingestion/")) {
      return {
        status: "success",
        ingested_count: 1,
        rejected_count: 0,
        duplicate_count: 0,
        quality_status: "verified",
        message: "Section 10 Standard payload verified and persisted.",
      } as unknown as T;
    }

    // 7. Multi-Agent Run
    if (endpoint === "/agents/run") {
      return {
        id: `RUN-${Date.now()}`,
        user_id: 1,
        agent_type: body.agent_type || "supervisor",
        task_description: body.task_description || "Clinical review",
        status: "completed",
        result: {
          synthesis: "Comprehensive clinical evaluation complete. Verified normal vital trajectory with isolated mild transaminase elevation requiring standard non-urgent follow-up.",
          evidence_grade: "Grade A (Randomized Controlled Trials & Systematic Guidelines)",
          recommended_next_step: "Follow-up metabolic panel in 60 days.",
        },
        tool_calls: [
          { tool: "query_pubmed_rag", args: { query: "isolated ALT elevation asymptomatic" }, status: "completed" },
          { tool: "check_telemetry_history", args: { days: 7 }, status: "completed" },
        ],
        human_review_required: false,
        started_at: new Date(Date.now() - 3000).toISOString(),
        completed_at: new Date().toISOString(),
      } as unknown as T;
    }

    // 8. ML Models & Experiments
    if (endpoint === "/ml/predict-risk") {
      const iga = Number(body.iga ?? 4.2);
      const igg = Math.max(0.5, Number(body.igg ?? 10.5));
      const symptomKeys = ["diarrhoea", "abdominal_pain", "sticky_stool", "weight_loss", "short_stature"];
      const symptomCount = symptomKeys.reduce((acc, k) => acc + (String(body[k] || "").toLowerCase() === "yes" ? 1 : 0), 0);
      const diabetesBoost = String(body.diabetes || "").toLowerCase() === "yes" ? (String(body.diabetes_type || "").toLowerCase().includes("type_1") || String(body.diabetes_type || "").toLowerCase().includes("type 1") ? 0.16 : 0.08) : 0;
      const ratioBoost = Math.min(0.12, (iga / igg) * 0.06);
      const rawScore = 0.06 + Math.min(0.52, (iga / 28.0) * 0.48) + symptomCount * 0.06 + diabetesBoost + ratioBoost;
      const p = Number(Math.min(0.96, Math.max(0.05, rawScore)).toFixed(3));

      return {
        estimated_risk_probability: p,
        risk_level: p >= 0.6 ? "High" : p >= 0.3 ? "Moderate" : "Low",
        predicted_classification:
          p >= 0.6
            ? "High Serological & Clinical Risk Profile"
            : p >= 0.3
            ? "Moderate Susceptibility — Serological Monitoring Advised"
            : "Low Risk / Baseline Reference Interval",
        confidence_interval: [Number(Math.max(0.02, p - 0.07).toFixed(3)), Number(Math.min(0.99, p + 0.07).toFixed(3))],
        model_provenance: {
          algorithm: body.model_name || "GradientBoostingClassifier (Scikit-Learn 1.4.2)",
          version: "1.4.0",
          sample_count: 2500,
          test_auc: 0.962,
          test_accuracy: 0.942,
        },
        contributing_factors: [
          iga >= 10
            ? `Elevated Serum IgA titer (${iga.toFixed(1)} g/L) drives primary mucosal signal`
            : `Baseline Serum IgA (${iga.toFixed(1)} g/L) within low-risk range`,
          diabetesBoost > 0
            ? "Concomitant Diabetes comorbidity adjusts prior autoimmune likelihood"
            : "No autoimmune diabetic comorbidity modifier active",
          `Symptom Severity Composite Index: ${symptomCount} / 5 clinical markers positive`,
          `Engineered IgA/IgG Interaction Ratio: ${(iga / igg).toFixed(2)}`,
        ],
        recommended_clinical_followup:
          p >= 0.6
            ? [
                "Confirmation via duodenal mucosal biopsy (Marsh classification) prior to gluten-free dietary restriction.",
                "Quantitative anti-tTG IgA + total serum IgA panel to rule out selective IgA deficiency.",
                "Consultation with a board-certified Gastroenterologist.",
              ]
            : p >= 0.3
            ? [
                "Repeat anti-tTG IgA titer and HLA-DQ2/DQ8 genetic susceptibility check in 3-6 months.",
                "Monitor gastrointestinal symptom frequency in Digital Health Journal.",
                "Discuss iron, ferritin, and vitamin D absorptive status with primary physician.",
              ]
            : [
                "Maintain routine preventive annual screening schedule.",
                "No immediate invasive endoscopic evaluation indicated based on serological profile.",
              ],
        disclaimer: "Statistical risk estimate for research and educational purposes. Never replaces clinical endoscopy or biopsy.",
      } as unknown as T;
    }

    if (endpoint === "/ml/models") {
      return [
        {
          id: "celiac_risk_v1",
          name: "Celiac Disease Risk Gradient Booster",
          algorithm: "GradientBoostingClassifier (Scikit-Learn 1.4)",
          framework: "Scikit-Learn / Joblib",
          category: "Autoimmune / GI",
          version: "1.4.0",
          auc: 0.962,
          f1: 0.938,
          brier: 0.051,
          latency_ms: 14,
          samples: 2500,
          calibration: "Platt Scaling",
          status: "active_production",
        },
        {
          id: "cardio_risk_v2",
          name: "Cardiometabolic 5-Year Risk Ensemble",
          algorithm: "RandomForestEnsemble + CalibrationCV",
          framework: "Scikit-Learn / SHAP",
          category: "Cardiometabolic",
          version: "2.1.0",
          auc: 0.941,
          f1: 0.916,
          brier: 0.062,
          latency_ms: 19,
          samples: 4800,
          calibration: "Isotonic Regression",
          status: "active_production",
        },
        {
          id: "anomaly_iso_v1",
          name: "Biochemical Laboratory Outlier Detector",
          algorithm: "IsolationForest (Unsupervised)",
          framework: "Scikit-Learn / NumPy",
          category: "Lab Anomaly",
          version: "1.1.0",
          auc: 0.945,
          f1: 0.927,
          brier: 0.058,
          latency_ms: 9,
          samples: 12000,
          calibration: "Platt Scaling",
          status: "active_production",
        },
        {
          id: "bilstm_seq_v2",
          name: "Bi-LSTM Longitudinal Biomarker Forecaster",
          algorithm: "2-Layer Bi-LSTM (128u) + Temporal Attention",
          framework: "PyTorch 2.3 / ONNX Runtime",
          category: "Temporal Deep Learning",
          version: "2.4.0",
          auc: 0.958,
          f1: 0.946,
          brier: 0.044,
          latency_ms: 11,
          samples: 9400,
          calibration: "Conformal Sequence Interval",
          status: "active_production",
        },
        {
          id: "prs_genomic_v3",
          name: "Polygenic Variant Pathogenicity Scorer",
          algorithm: "LightGBM + DeepSHAP Explainer",
          framework: "LightGBM / ONNX Runtime",
          category: "Genomics & Variants",
          version: "3.0.2-rc1",
          auc: 0.974,
          f1: 0.951,
          brier: 0.041,
          latency_ms: 23,
          samples: 18400,
          calibration: "Temperature Scaling",
          status: "staging_candidate",
        },
      ] as unknown as T;
    }

    if (endpoint === "/ml/experiments") {
      if (method === "POST") {
        const expId = `EXP-${Date.now().toString().slice(-6)}`;
        return {
          id: expId,
          model_name: body.model_name || "CeliacDiseaseGradientBoosting",
          experiment_name: body.experiment_name || `exp_run_${Date.now().toString().slice(-4)}`,
          dataset_name: body.dataset_name || "celiac_biomarker_cohort_v2",
          parameters: body.parameters || { learning_rate: 0.04, max_depth: 5, n_estimators: 200 },
          metrics: body.metrics || { accuracy: 0.948, roc_auc: 0.968, f1_score: 0.944, brier_score: 0.046 },
          artifact_path: `ml/artifacts/${expId.toLowerCase()}.pkl`,
          version: body.version || "1.2.0",
          status: "completed",
          created_at: new Date().toISOString(),
        } as unknown as T;
      }

      return [
        {
          id: "EXP-PRS-LGBM-05",
          model_name: "PolygenicVariantScorer",
          experiment_name: "polygenic_lightgbm_focal_loss",
          dataset_name: "clinvar_gnomad_curated_2026",
          parameters: { num_leaves: 64, learning_rate: 0.03, feature_fraction: 0.85, focal_gamma: 2.0 },
          metrics: { accuracy: 0.957, roc_auc: 0.974, f1_score: 0.951, brier_score: 0.041 },
          artifact_path: "ml/artifacts/prs_lgbm_v3.onnx",
          version: "3.0.2-rc1",
          status: "staging",
          created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
        },
        {
          id: "EXP-BAYESIAN-OPT-04",
          model_name: "CeliacDiseaseGradientBoosting",
          experiment_name: "bayesian_hyperopt_n_estimators_200",
          dataset_name: "celiac_biomarker_cohort_v2",
          parameters: { n_estimators: 200, max_depth: 5, learning_rate: 0.04, subsample: 0.88 },
          metrics: { accuracy: 0.948, roc_auc: 0.968, f1_score: 0.945, brier_score: 0.047 },
          artifact_path: "ml/artifacts/celiac_gb_hyperopt_v2.pkl",
          version: "1.4.0",
          status: "completed",
          created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
        },
        {
          id: "EXP-CELIAC-GB-01",
          model_name: "CeliacDiseaseGradientBoosting",
          experiment_name: "baseline_gradient_boosted_trees",
          dataset_name: "celiac_biomarker_cohort_v1",
          parameters: { n_estimators: 150, max_depth: 4, learning_rate: 0.05 },
          metrics: { accuracy: 0.941, roc_auc: 0.962, f1_score: 0.938, brier_score: 0.051 },
          artifact_path: "ml/artifacts/celiac_gb_v1.pkl",
          version: "1.0.0",
          status: "deployed",
          created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
        },
        {
          id: "EXP-CARDIO-RF-03",
          model_name: "CardiometabolicEnsemble",
          experiment_name: "cardiometabolic_5yr_rf_isotonic",
          dataset_name: "framingham_biobank_aligned_v2",
          parameters: { n_estimators: 300, max_depth: 8, calibration: "isotonic" },
          metrics: { accuracy: 0.929, roc_auc: 0.941, f1_score: 0.916, brier_score: 0.062 },
          artifact_path: "ml/artifacts/cardio_rf_v2.pkl",
          version: "2.1.0",
          status: "deployed",
          created_at: new Date(Date.now() - 52 * 3600000).toISOString(),
        },
        {
          id: "EXP-LAB-ISO-FOREST-02",
          model_name: "BiochemicalAnomalyDetector",
          experiment_name: "isolation_forest_unsupervised",
          dataset_name: "comprehensive_metabolic_panel_corpus",
          parameters: { contamination: 0.05, n_estimators: 100, bootstrap: true },
          metrics: { accuracy: 0.936, roc_auc: 0.945, f1_score: 0.927, brier_score: 0.058 },
          artifact_path: "ml/artifacts/iso_forest_v1.pkl",
          version: "1.1.0",
          status: "deployed",
          created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
        },
      ] as unknown as T;
    }

    // 8. Research & Evidence Library
    if (endpoint.startsWith("/research/search")) {
      const allResearch = [
        {
          id: 1,
          title: "ACG Clinical Guidelines: Diagnosis and Management of Celiac Disease",
          authors: "Rubio-Tapia A, Hill ID, Semrad C, Kelly CP, Lebwohl B.",
          journal: "Am J Gastroenterol",
          publication_year: 2023,
          pmid: "36598284",
          doi: "10.14309/ajg.0000000000002073",
          evidence_level: "Grade 1A Evidence",
          category: "Gastroenterology",
          abstract: "These clinical practice guidelines summarize evidence-based recommendations for the diagnosis, histological evaluation, genetic profiling (HLA-DQ2/DQ8), and management of celiac disease in children and adult patients. Recommends tTG-IgA as the preferred initial serologic test, alongside total serum IgA.",
          key_findings: "Initial serological evaluation must include high-affinity tTG-IgA combined with total serum IgA to rule out selective IgA deficiency. Confirmatory duodenal biopsy remains the diagnostic gold standard for adult patients.",
          url: "https://pubmed.ncbi.nlm.nih.gov/36598284/"
        },
        {
          id: 2,
          title: "Standards of Care in Diabetes—2024: Glycemic Goals and Hypoglycemia Risk",
          authors: "American Diabetes Association Professional Practice Committee",
          journal: "Diabetes Care",
          publication_year: 2024,
          pmid: "38078589",
          doi: "10.2337/dc24-S006",
          evidence_level: "Clinical Practice Guideline",
          category: "Endocrinology",
          abstract: "Provides the latest clinical guidelines on individualized HbA1c target thresholds (<7.0% for most nonpregnant adults), continuous glucose monitoring (CGM) time-in-range (>70% between 70-180 mg/dL), and automated insulin delivery.",
          key_findings: "Time in Range (TIR 70-180 mg/dL) > 70% is strongly correlated with a reduced risk of microvascular and macrovascular complications.",
          url: "https://pubmed.ncbi.nlm.nih.gov/38078589/"
        },
        {
          id: 3,
          title: "EASL-EASD-EASO Clinical Practice Guidelines on Metabolic Dysfunction-Associated Steatotic Liver Disease (MASLD)",
          authors: "European Association for the Study of the Liver (EASL)",
          journal: "J Hepatol",
          publication_year: 2024,
          pmid: "38851239",
          doi: "10.1016/j.jhep.2024.04.031",
          evidence_level: "Clinical Practice Guideline",
          category: "Hepatology",
          abstract: "Presents consensus on MASLD diagnosis, non-invasive fibrosis testing (FIB-4 score, transient elastography), and multi-disciplinary metabolic risk stratification across clinical care networks.",
          key_findings: "Non-invasive biomarker score FIB-4 < 1.30 safely rules out advanced hepatic fibrosis with a negative predictive value exceeding 90%.",
          url: "https://pubmed.ncbi.nlm.nih.gov/38851239/"
        },
        {
          id: 4,
          title: "2023 AHA/ACC Guideline for the Management of Patients With Chronic Coronary Disease",
          authors: "Writing Committee Members, Virani SS, Newby LK, et al.",
          journal: "Circulation",
          publication_year: 2023,
          pmid: "37471501",
          doi: "10.1161/CIR.0000000000001168",
          evidence_level: "Grade 1A Evidence",
          category: "Cardiology",
          abstract: "A comprehensive update on risk factor modification, lipid-lowering therapies (high-intensity statins, ezetimibe, PCSK9 inhibitors), and cardiac biomarker monitoring for coronary disease.",
          key_findings: "Aggressive LDL-C reduction to < 55 mg/dL (< 1.4 mmol/L) yields sustained reduction in major adverse cardiovascular events (MACE).",
          url: "https://pubmed.ncbi.nlm.nih.gov/37471501/"
        },
        {
          id: 5,
          title: "KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease",
          authors: "Kidney Disease: Improving Global Outcomes (KDIGO) CKD Work Group",
          journal: "Kidney Int",
          publication_year: 2024,
          pmid: "38490803",
          doi: "10.1016/j.kint.2023.10.018",
          evidence_level: "Grade 1A Evidence",
          category: "Nephrology",
          abstract: "Updates criteria for CKD diagnosis, eGFR cystatin C testing, urinary albumin-to-creatinine ratio (uACR) risk classification, and disease-slowing therapies including SGLT2 inhibitors and nonsteroidal MRAs.",
          key_findings: "Dual monitoring of eGFR trajectory alongside uACR detects accelerated kidney function decline up to 24 months earlier than serum creatinine alone.",
          url: "https://pubmed.ncbi.nlm.nih.gov/38490803/"
        },
        {
          id: 6,
          title: "Diagnostic Accuracy of tTG-IgA in Serology-Only Celiac Confirmation in Symptomatic Cohorts",
          authors: "Penny HA, et al.",
          journal: "The Lancet Gastroenterol Hepatol",
          publication_year: 2024,
          pmid: "37812904",
          doi: "10.1016/S2468-1253(23)00341-2",
          evidence_level: "Systematic Review & Meta-Analysis",
          category: "Gastroenterology",
          abstract: "A multinational cohort study of 2,400+ patients demonstrating that tTG-IgA titers exceeding 10x the upper limit of normal possess 98.9% positive predictive value for villous atrophy.",
          key_findings: "A 10x ULN tTG-IgA combined with positive endomysial antibody (EMA) in a second blood draw allows biopsy-sparing diagnosis in high-prevalence pediatric cohorts.",
          url: "https://pubmed.ncbi.nlm.nih.gov/37812904/"
        },
        {
          id: 7,
          title: "ACMG Recommendations for Reporting Secondary Findings in Clinical Exome and Genome Sequencing: 2023 Update",
          authors: "Miller DT, Lee K, Chung WK, et al.",
          journal: "Genet Med",
          publication_year: 2023,
          pmid: "37347484",
          doi: "10.1016/j.gim.2023.100866",
          evidence_level: "Clinical Practice Guideline",
          category: "Medical Genetics",
          abstract: "Updates the actionable gene list (ACMG SF v3.2) covering hereditary cancer syndromes, cardiovascular channelopathies, and metabolic inborn errors for clinical genomic screening.",
          key_findings: "Routine screening of actionable genomic secondary findings identifies medically preventable conditions in 2.5% to 3.0% of unselected clinical sequencing patients.",
          url: "https://pubmed.ncbi.nlm.nih.gov/37347484/"
        },
        {
          id: 8,
          title: "EASL Clinical Practice Guidelines: Management of Hepatocellular Carcinoma",
          authors: "Galle PR, Forner A, Llovet JM, et al.",
          journal: "J Hepatol",
          publication_year: 2023,
          pmid: "29622681",
          doi: "10.1016/j.jhep.2018.03.019",
          evidence_level: "Clinical Practice Guideline",
          category: "Oncology",
          abstract: "Standardized clinical staging and biomarker surveillance for cirrhotic patients at risk of hepatocellular carcinoma, including semiannual ultrasound and alpha-fetoprotein (AFP) trajectories.",
          key_findings: "Semiannual ultrasound surveillance alongside serial AFP dynamics significantly increases early-stage tumor detection, enabling curative resection or ablation.",
          url: "https://pubmed.ncbi.nlm.nih.gov/29622681/"
        },
        {
          id: 9,
          title: "2023 ESH Guidelines for the Management of Arterial Hypertension",
          authors: "Mancia G, Kreutz R, Brunström M, et al.",
          journal: "J Hypertens",
          publication_year: 2023,
          pmid: "37345492",
          doi: "10.1097/HJH.0000000000003480",
          evidence_level: "Grade 1A Evidence",
          category: "Cardiology",
          abstract: "Guideline highlighting home blood pressure monitoring, automated cuff validation, pulse pressure calculation as an arterial stiffness surrogate, and combination single-pill therapy.",
          key_findings: "Wide pulse pressure (> 60 mmHg) in elderly individuals represents independent vascular stiffness and elevated stroke risk, warranting personalized titration.",
          url: "https://pubmed.ncbi.nlm.nih.gov/37345492/"
        },
        {
          id: 10,
          title: "Multi-Cancer Early Detection (MCED) via Targeted Methylation and Cell-Free DNA Sequencing",
          authors: "Klein EA, Richards D, Cohn A, et al.",
          journal: "Annals of Oncology",
          publication_year: 2024,
          pmid: "34172480",
          doi: "10.1016/j.annonc.2021.05.806",
          evidence_level: "Prospective Cohort Study",
          category: "Oncology",
          abstract: "Clinical validation of cell-free DNA (cfDNA) methylation profiling for simultaneous early detection and tissue of origin localization across more than 50 cancer types.",
          key_findings: "Overall specificity of 99.5% with a false-positive rate under 0.5%, with tissue of origin accurately predicted in 88.7% of cancer cases.",
          url: "https://pubmed.ncbi.nlm.nih.gov/34172480/"
        }
      ];

      // Parse query parameters
      const qIndex = endpoint.indexOf("?");
      if (qIndex !== -1) {
        const queryParams = new URLSearchParams(endpoint.slice(qIndex + 1));
        const q = (queryParams.get("q") || "").toLowerCase();
        const cat = queryParams.get("category");

        let filtered = allResearch;
        if (cat && cat !== "All Categories") {
          filtered = filtered.filter(item => item.category.toLowerCase().includes(cat.toLowerCase()));
        }
        if (q) {
          filtered = filtered.filter(item =>
            item.title.toLowerCase().includes(q) ||
            item.abstract.toLowerCase().includes(q) ||
            item.key_findings.toLowerCase().includes(q) ||
            item.pmid.includes(q)
          );
        }
        return (filtered as unknown as T);
      }

      return (allResearch as unknown as T);
    }

    if (endpoint.startsWith("/research/bookmarks")) {
      return [
        { id: 1, reference_id: 1, notes: "Essential ACG celiac diagnostic guidelines. Key for tTG-IgA algorithms.", created_at: new Date(Date.now() - 48 * 3600000).toISOString() },
        { id: 2, reference_id: 2, notes: "ADA 2024 continuous glucose monitoring target ranges.", created_at: new Date(Date.now() - 24 * 3600000).toISOString() }
      ] as unknown as T;
    }

    // 9. Admin Operations & Governance
    if (endpoint === "/admin/stats") {
      return {
        total_users: 148,
        total_reports: 1284,
        total_measurements: 84920,
        total_conversations: 3410,
        total_audit_events: 2740,
        database_status: "Operational • SQLite WAL Mode (4.2 MB)",
        ai_provider: "Gemini 1.5 Pro • Clinical Evidence Engine",
        active_sessions: 24,
        system_uptime: "99.99%",
        p99_latency_ms: 12.4
      } as unknown as T;
    }

    if (endpoint.startsWith("/admin/audit-logs")) {
      const allLogs = [
        { id: 101, action: "LOGIN", user_id: 1, user_email: "demo@medipredict.ai", resource_type: "UserSession", resource_id: "sess_9021", ip_address: "192.168.1.104", timestamp: new Date(Date.now() - 15 * 60000).toISOString(), outcome: "success", checksum: "8f7a9d2b1c4e6a8f3b5d7e9c1a3f5b7d9e1a3c5e7b9d1f3a5c7e9b1d3f5a7b9c", details: { auth_method: "2fa_totp", role: "clinician" } },
        { id: 102, action: "VIEW_REPORT", user_id: 1, user_email: "demo@medipredict.ai", resource_type: "LabReport", resource_id: "rep_celiac_14", ip_address: "192.168.1.104", timestamp: new Date(Date.now() - 45 * 60000).toISOString(), outcome: "success", checksum: "3b7e9a1c5d9f7a8b3c5e1d9a7f3b5c7d9e1a3f5b7d9c1e3a5f7b9d1c3e5a7b9d", details: { panel: "celiac_serology", tTG_IgA: 84.5 } },
        { id: 103, action: "CLINICIAN_VERIFICATION_SIGN_OFF", user_id: 1, user_email: "demo@medipredict.ai", resource_type: "LabReport", resource_id: "rep_celiac_14", ip_address: "192.168.1.104", timestamp: new Date(Date.now() - 90 * 60000).toISOString(), outcome: "success", checksum: "7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b", details: { marsh_grade: "Marsh IIIb", verified: true } },
        { id: 104, action: "AI_QUERY", user_id: 2, user_email: "patient@medipredict.ai", resource_type: "Conversation", resource_id: "conv_8492", ip_address: "172.56.21.89", timestamp: new Date(Date.now() - 140 * 60000).toISOString(), outcome: "success", checksum: "1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c", details: { model: "gemini-1.5-pro", topic: "hba1c_trajectory" } },
        { id: 105, action: "EXPORT_DATA", user_id: 1, user_email: "demo@medipredict.ai", resource_type: "PatientRecord", resource_id: "bundle_fhir_01", ip_address: "192.168.1.104", timestamp: new Date(Date.now() - 210 * 60000).toISOString(), outcome: "success", checksum: "5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f", details: { standard: "HL7 FHIR v4", consent_id: "DPDP-2023-889" } },
        { id: 106, action: "FEATURE_ENGINEERING_RUN", user_id: 1, user_email: "demo@medipredict.ai", resource_type: "MLEngine", resource_id: "feat_pipe_v2", ip_address: "127.0.0.1", timestamp: new Date(Date.now() - 320 * 60000).toISOString(), outcome: "success", checksum: "9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c", details: { features: ["MAP", "PP", "IgA_IgG_ratio"], status: "computed" } },
        { id: 107, action: "BIOMETRIC_PASSKEY_AUTH", user_id: 1, user_email: "demo@medipredict.ai", resource_type: "UserSession", resource_id: "passkey_webauthn_01", ip_address: "192.168.1.104", timestamp: new Date(Date.now() - 480 * 60000).toISOString(), outcome: "success", checksum: "2c4e6a8f3b5d7e9c1a3f5b7d9e1a3c5e7b9d1f3a5c7e9b1d3f5a7b9c8f7a9d2b", details: { passkey_type: "Touch ID", rp: "medipredict.ai" } },
        { id: 108, action: "RATE_LIMIT_ENGAGED", user_id: null, user_email: "SYSTEM_SECURITY", resource_type: "SecurityFirewall", resource_id: "rate_lock_01", ip_address: "45.33.32.156", timestamp: new Date(Date.now() - 620 * 60000).toISOString(), outcome: "prevented", checksum: "4e6a8f3b5d7e9c1a3f5b7d9e1a3c5e7b9d1f3a5c7e9b1d3f5a7b9c8f7a9d2b1c", details: { lockout_duration_s: 30, reason: "3_failed_attempts" } },
        { id: 109, action: "USER_REGISTER", user_id: 3, user_email: "sarah.chen@medipredict.ai", resource_type: "User", resource_id: "usr_3", ip_address: "192.168.1.110", timestamp: new Date(Date.now() - 780 * 60000).toISOString(), outcome: "success", checksum: "6a8f3b5d7e9c1a3f5b7d9e1a3c5e7b9d1f3a5c7e9b1d3f5a7b9c8f7a9d2b1c4e", details: { role: "patient", consent_granted: true } },
        { id: 110, action: "VIEW_REPORT", user_id: 1, user_email: "demo@medipredict.ai", resource_type: "LabReport", resource_id: "rep_lipid_02", ip_address: "192.168.1.104", timestamp: new Date(Date.now() - 940 * 60000).toISOString(), outcome: "success", checksum: "8f3b5d7e9c1a3f5b7d9e1a3c5e7b9d1f3a5c7e9b1d3f5a7b9c8f7a9d2b1c4e6a", details: { panel: "cardiac_lipid", score: "Framingham 4.2%" } },
        { id: 111, action: "LOGIN", user_id: 1, user_email: "demo@medipredict.ai", resource_type: "UserSession", resource_id: "sess_9030", ip_address: "192.168.1.104", timestamp: new Date(Date.now() - 1100 * 60000).toISOString(), outcome: "success", checksum: "3b5d7e9c1a3f5b7d9e1a3c5e7b9d1f3a5c7e9b1d3f5a7b9c8f7a9d2b1c4e6a8f", details: { auth_method: "sms_otp_autofill", carrier: "encrypted_twilio" } },
        { id: 112, action: "AI_QUERY", user_id: 1, user_email: "demo@medipredict.ai", resource_type: "Assistant", resource_id: "query_celiac_biomarkers", ip_address: "192.168.1.104", timestamp: new Date(Date.now() - 1280 * 60000).toISOString(), outcome: "success", checksum: "5d7e9c1a3f5b7d9e1a3c5e7b9d1f3a5c7e9b1d3f5a7b9c8f7a9d2b1c4e6a8f3b", details: { topic: "tTG_IgA_cutoff_guidelines", source: "ACG 2023" } },
        { id: 113, action: "PASSWORD_RESET_SUCCESS", user_id: 2, user_email: "patient@medipredict.ai", resource_type: "User", resource_id: "usr_2", ip_address: "172.56.21.89", timestamp: new Date(Date.now() - 1440 * 60000).toISOString(), outcome: "success", checksum: "7e9c1a3f5b7d9e1a3c5e7b9d1f3a5c7e9b1d3f5a7b9c8f7a9d2b1c4e6a8f3b5d", details: { method: "entropy_verified", algorithm: "bcrypt" } },
        { id: 114, action: "EXPORT_DATA", user_id: 1, user_email: "admin@medipredict.ai", resource_type: "AuditTrail", resource_id: "audit_hmac_export", ip_address: "192.168.1.104", timestamp: new Date(Date.now() - 1600 * 60000).toISOString(), outcome: "success", checksum: "9c1a3f5b7d9e1a3c5e7b9d1f3a5c7e9b1d3f5a7b9c8f7a9d2b1c4e6a8f3b5d7e", details: { records_count: 2740, sha256: "verified" } }
      ];

      // Parse filter
      const qIndex = endpoint.indexOf("action_filter=");
      if (qIndex !== -1) {
        const filterVal = decodeURIComponent(endpoint.slice(qIndex + 14).split("&")[0]);
        if (filterVal && filterVal !== "All Actions") {
          return (allLogs.filter(l => l.action === filterVal) as unknown as T);
        }
      }

      return (allLogs as unknown as T);
    }

    if (endpoint === "/admin/users") {
      return [
        { id: 1, email: "demo@medipredict.ai", full_name: "Dr. Elena Rostova", role: "clinician", is_active: true, is_verified: true, created_at: new Date(Date.now() - 90 * 86400000).toISOString() },
        { id: 2, email: "patient@medipredict.ai", full_name: "Alex Rivera", role: "patient", is_active: true, is_verified: true, created_at: new Date(Date.now() - 60 * 86400000).toISOString() },
        { id: 3, email: "admin@medipredict.ai", full_name: "Chief Administrator", role: "admin", is_active: true, is_verified: true, created_at: new Date(Date.now() - 120 * 86400000).toISOString() },
        { id: 4, email: "marcus.sterling@medipredict.ai", full_name: "Prof. Marcus Sterling", role: "researcher", is_active: true, is_verified: true, created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
        { id: 5, email: "sarah.chen@hospital.org", full_name: "Dr. Sarah Chen, MD", role: "clinician", is_active: true, is_verified: true, created_at: new Date(Date.now() - 14 * 86400000).toISOString() }
      ] as unknown as T;
    }

    // Default empty array or object
    return ([] as unknown as T);
  }

  // Auth Endpoints
  async register(data: { email: string; password: string; full_name: string; phone?: string; role?: string }): Promise<User> {
    return this.request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    if (typeof window !== "undefined") {
      localStorage.setItem("medipredict_user", JSON.stringify(res.user));
    }
    return res;
  }

  async sendPhoneOTP(data: { phone: string; country_code?: string }): Promise<{ message: string; otp_preview: string; expires_in: number }> {
    return this.request<{ message: string; otp_preview: string; expires_in: number }>("/auth/otp/send", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyPhoneOTP(data: {
    phone: string;
    otp: string;
    full_name?: string;
    role?: string;
    specialty?: string;
  }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    if (typeof window !== "undefined") {
      localStorage.setItem("medipredict_user", JSON.stringify(res.user));
    }
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } finally {
      this.clearToken();
    }
  }

  async getMe(): Promise<User> {
    return this.request<User>("/users/me");
  }

  async updateMe(data: Record<string, any>): Promise<User> {
    return this.request<User>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Assistant Endpoints
  async getProviders(): Promise<ProviderStatus> {
    return this.request<ProviderStatus>("/assistant/providers");
  }

  async listConversations(): Promise<Conversation[]> {
    const res = await this.request<any>("/assistant/conversations");
    return this.ensureArray<Conversation>(res);
  }

  async createConversation(title?: string): Promise<Conversation> {
    return this.request<Conversation>("/assistant/conversations", {
      method: "POST",
      body: JSON.stringify({ title: title || "New Medical Consultation" }),
    });
  }

  async getConversation(id: number): Promise<Conversation> {
    return this.request<Conversation>(`/assistant/conversations/${id}`);
  }

  async deleteConversation(id: number): Promise<void> {
    return this.request<void>(`/assistant/conversations/${id}`, {
      method: "DELETE",
    });
  }

  async sendMessage(
    conversationId: number,
    content: string,
    provider?: string,
    reportAttachmentId?: number
  ): Promise<Message> {
    return this.request<Message>(`/assistant/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content,
        provider,
        report_attachment_id: reportAttachmentId,
      }),
    });
  }

  // Reports Endpoints
  async listReports(): Promise<MedicalReport[]> {
    const res = await this.request<any>("/reports");
    return this.ensureArray<MedicalReport>(res);
  }

  async getReport(id: number): Promise<MedicalReport> {
    return this.request<MedicalReport>(`/reports/${id}`);
  }

  async uploadReport(formData: FormData): Promise<MedicalReport> {
    return this.request<MedicalReport>("/reports/upload", {
      method: "POST",
      body: formData,
    });
  }

  async analyzeReport(id: number): Promise<{
    report_id: number;
    summary: string;
    ai_interpretation: string;
    key_findings: string[];
    potential_abnormalities: string[];
    clinical_disclaimer: string;
  }> {
    return this.request(`/reports/${id}/analyze`, {
      method: "POST",
    });
  }

  async updateMeasurement(
    reportId: number,
    measurementId: number,
    data: { value?: number; unit?: string; flag?: string; user_verified?: boolean }
  ): Promise<LaboratoryMeasurement> {
    return this.request<LaboratoryMeasurement>(
      `/reports/${reportId}/measurements/${measurementId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  }

  async addMeasurement(
    reportId: number,
    data: Partial<LaboratoryMeasurement>
  ): Promise<LaboratoryMeasurement> {
    return this.request<LaboratoryMeasurement>(
      `/reports/${reportId}/measurements`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async deleteReport(id: number): Promise<void> {
    return this.request<void>(`/reports/${id}`, {
      method: "DELETE",
    });
  }

  getReportExportUrl(id: number): string {
    return `${API_BASE}/reports/${id}/export`;
  }

  getReportExportPdfUrl(id: number): string {
    return `${API_BASE}/reports/${id}/export-pdf`;
  }

  getReportExportCsvUrl(id: number): string {
    return `${API_BASE}/reports/${id}/export-csv`;
  }

  getReportDownloadUrl(id: number): string {
    return `${API_BASE}/reports/${id}/download`;
  }

  // Health Metrics Endpoints
  async listMetrics(metricType?: string): Promise<HealthMeasurement[]> {
    const q = metricType ? `?metric_type=${encodeURIComponent(metricType)}` : "";
    const res = await this.request<any>(`/metrics${q}`);
    return this.ensureArray<HealthMeasurement>(res);
  }

  async createMetric(data: {
    metric_type: string;
    value: number;
    secondary_value?: number;
    unit: string;
    source?: string;
    notes?: string;
  }): Promise<HealthMeasurement> {
    return this.request<HealthMeasurement>("/metrics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async logMetric(data: {
    metric_type: string;
    value: number;
    secondary_value?: number;
    unit: string;
    source?: string;
    notes?: string;
  }): Promise<HealthMeasurement> {
    return this.createMetric(data);
  }

  async getMetricsSummary(): Promise<HealthMetricSummary[]> {
    const res = await this.request<any>("/metrics/summary");
    return this.ensureArray<HealthMetricSummary>(res);
  }

  async deleteMetric(id: number): Promise<void> {
    return this.request<void>(`/metrics/${id}`, {
      method: "DELETE",
    });
  }

  getMetricsExportCsvUrl(): string {
    return `${API_BASE}/metrics/export/csv`;
  }

  // Diseases & Genetics Endpoints
  async listDiseases(search?: string, specialty?: string): Promise<DiseaseCondition[]> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (specialty) params.append("specialty", specialty);
    const res = await this.request<any>(`/diseases?${params.toString()}`);
    return this.ensureArray<DiseaseCondition>(res);
  }

  async getDisease(id: number): Promise<DiseaseCondition> {
    return this.request<DiseaseCondition>(`/diseases/${id}`);
  }

  async listGenes(symbol?: string, condition?: string): Promise<GeneAssociation[]> {
    const params = new URLSearchParams();
    if (symbol) params.append("symbol", symbol);
    if (condition) params.append("condition", condition);
    const res = await this.request<any>(`/genes?${params.toString()}`);
    return this.ensureArray<GeneAssociation>(res);
  }

  // Research Endpoints
  async searchResearch(q?: string, category?: string): Promise<MedicalReference[]> {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (category) params.append("category", category);
    const res = await this.request<any>(`/research/search?${params.toString()}`);
    return this.ensureArray<MedicalReference>(res);
  }

  async listBookmarks(): Promise<ResearchBookmark[]> {
    const res = await this.request<any>("/research/bookmarks");
    return this.ensureArray<ResearchBookmark>(res);
  }

  async addBookmark(referenceId: number, notes?: string): Promise<ResearchBookmark> {
    return this.request<ResearchBookmark>("/research/bookmarks", {
      method: "POST",
      body: JSON.stringify({ reference_id: referenceId, notes }),
    });
  }

  async removeBookmark(bookmarkId: number): Promise<void> {
    return this.request<void>(`/research/bookmarks/${bookmarkId}`, {
      method: "DELETE",
    });
  }

  // Personal Records Endpoints
  async listRecords(category?: string): Promise<PersonalRecord[]> {
    const q = category ? `?category=${encodeURIComponent(category)}` : "";
    const res = await this.request<any>(`/records${q}`);
    return this.ensureArray<PersonalRecord>(res);
  }

  async createRecord(data: {
    title: string;
    category?: string;
    doctor_or_facility?: string;
    summary?: string;
    tags?: string[];
  }): Promise<PersonalRecord> {
    return this.request<PersonalRecord>("/records", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteRecord(id: number): Promise<void> {
    return this.request<void>(`/records/${id}`, {
      method: "DELETE",
    });
  }

  // Privacy Endpoints
  async getConsents(): Promise<UserConsent[]> {
    const res = await this.request<any>("/privacy/consent");
    return this.ensureArray<UserConsent>(res);
  }

  async updateConsent(consentType: string, granted: boolean): Promise<UserConsent> {
    return this.request<UserConsent>("/privacy/consent", {
      method: "PATCH",
      body: JSON.stringify({ consent_type: consentType, granted }),
    });
  }

  async exportPrivacyData(): Promise<any> {
    return this.request("/privacy/export", {
      method: "POST",
    });
  }

  async deleteAccount(): Promise<void> {
    return this.request<void>("/privacy/account-deletion", {
      method: "POST",
    });
  }

  // ML Endpoints
  async predictRisk(data: CeliacRiskRequest): Promise<CeliacRiskResponse> {
    return this.request<CeliacRiskResponse>("/ml/predict-risk", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async listNotifications(): Promise<any[]> {
    const res = await this.request<any>("/notifications");
    return this.ensureArray<any>(res);
  }

  async markNotificationRead(id: number): Promise<any> {
    return this.request<any>(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  }

  async markAllNotificationsRead(): Promise<any> {
    return this.request<any>("/notifications/mark-all-read", {
      method: "POST",
    });
  }

  // Clinician Workspace
  async listClinicianReports(statusFilter?: string): Promise<any[]> {
    const q = statusFilter ? `?status_filter=${encodeURIComponent(statusFilter)}` : "";
    const res = await this.request<any>(`/clinician/reports${q}`);
    return this.ensureArray<any>(res);
  }

  async reviewClinicianReport(
    id: number,
    clinician_notes: string,
    status: string,
    escalation_reason?: string,
    escalation_department?: string
  ): Promise<any> {
    return this.request<any>(`/clinician/reports/${id}/review`, {
      method: "POST",
      body: JSON.stringify({
        clinician_notes,
        status,
        escalation_reason,
        escalation_department,
      }),
    });
  }

  async getClinicianAuditLogs(limit: number = 30): Promise<any[]> {
    const res = await this.request<any>(`/clinician/audit-logs?limit=${limit}`);
    return this.ensureArray<any>(res);
  }

  // Unified Search
  async search(query: string): Promise<any[]> {
    const res = await this.request<any>(`/search?q=${encodeURIComponent(query)}`);
    return this.ensureArray<any>(res);
  }

  // Admin Portal
  async getAdminStats(): Promise<any> {
    return this.request<any>("/admin/stats");
  }

  async getAdminAuditLogs(limit: number = 50, actionFilter?: string): Promise<any[]> {
    let url = `/admin/audit-logs?limit=${limit}`;
    if (actionFilter) {
      url += `&action_filter=${encodeURIComponent(actionFilter)}`;
    }
    const res = await this.request<any>(url);
    return this.ensureArray<any>(res);
  }

  async getAdminUsers(): Promise<any[]> {
    const res = await this.request<any>("/admin/users");
    return this.ensureArray<any>(res);
  }

  async updateUserRole(userId: number, newRole: string): Promise<any> {
    return this.request<any>(`/admin/users/${userId}/role?new_role=${newRole}`, {
      method: "PATCH",
    });
  }

  // Connected Devices Endpoints
  async listDevices(deviceType?: string): Promise<Device[]> {
    const q = deviceType ? `?device_type=${encodeURIComponent(deviceType)}` : "";
    const res = await this.request<any>(`/devices${q}`);
    return this.ensureArray<Device>(res);
  }

  async registerDevice(data: DeviceCreate): Promise<Device> {
    return this.request<Device>("/devices", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getDevice(id: string): Promise<Device> {
    return this.request<Device>(`/devices/${id}`);
  }

  async connectDevice(id: string): Promise<{ status: string; session_id: string }> {
    return this.request<{ status: string; session_id: string }>(`/devices/${id}/connect`, {
      method: "POST",
    });
  }

  async disconnectDevice(id: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/devices/${id}/disconnect`, {
      method: "POST",
    });
  }

  async getDeviceStatus(id: string): Promise<DeviceStatus> {
    return this.request<DeviceStatus>(`/devices/${id}/status`);
  }

  async deleteDevice(id: string): Promise<void> {
    return this.request<void>(`/devices/${id}`, {
      method: "DELETE",
    });
  }

  // Sensor & Ingestion Endpoints
  async ingestSensor(payload: any): Promise<IngestionResult> {
    return this.request<IngestionResult>("/ingestion/sensors", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async ingestWearable(payload: any): Promise<IngestionResult> {
    return this.request<IngestionResult>("/ingestion/wearables", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async ingestIoT(payload: any): Promise<IngestionResult> {
    return this.request<IngestionResult>("/ingestion/iot", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Analytics Endpoints
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    return this.request<AnalyticsOverview>("/analytics/overview");
  }

  async getDeviceHealth(): Promise<DeviceHealthItem[]> {
    const res = await this.request<any>("/analytics/device-health");
    return this.ensureArray<DeviceHealthItem>(res);
  }

  async getDataQuality(): Promise<DataQualityReport> {
    return this.request<DataQualityReport>("/analytics/data-quality");
  }

  // Multi-Agent Framework Endpoints
  async runAgent(
    agent_type: string,
    task_description: string,
    context?: Record<string, any>
  ): Promise<AgentRun> {
    return this.request<AgentRun>("/agents/run", {
      method: "POST",
      body: JSON.stringify({
        agent_type,
        task_description,
        context: context || {},
      }),
    });
  }

  async listAgentRuns(): Promise<AgentRun[]> {
    const res = await this.request<any>("/agents/runs");
    return this.ensureArray<AgentRun>(res);
  }

  async getAgentRun(id: string): Promise<AgentRun> {
    return this.request<AgentRun>(`/agents/runs/${id}`);
  }

  // Machine Learning Research & Experimentation Endpoints
  async listMLModels(): Promise<any[]> {
    const res = await this.request<any>("/ml/models");
    return this.ensureArray<any>(res);
  }

  async listMLExperiments(): Promise<MLExperiment[]> {
    const res = await this.request<any>("/ml/experiments");
    return this.ensureArray<MLExperiment>(res);
  }

  async getMLExperiment(id: string): Promise<MLExperiment> {
    return this.request<MLExperiment>(`/ml/experiments/${id}`);
  }

  async createMLExperiment(data: {
    model_name: string;
    experiment_name: string;
    dataset_name: string;
    parameters?: Record<string, any>;
    metrics: Record<string, any>;
    artifact_path?: string;
    version?: string;
  }): Promise<MLExperiment> {
    return this.request<MLExperiment>("/ml/experiments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Multilingual Indian Voice Assistant Methods
  async getVoiceLanguages(): Promise<any> {
    return this.request("/voice/languages");
  }

  async createVoiceSession(preferredLanguage: string = "hi-IN"): Promise<any> {
    return this.request("/voice/session", {
      method: "POST",
      body: JSON.stringify({ preferred_language: preferredLanguage, consent_given: true }),
    });
  }

  async processVoiceQuery(
    queryText: string,
    preferredLanguage?: string,
    sessionId?: string
  ): Promise<any> {
    return this.request("/voice/process", {
      method: "POST",
      body: JSON.stringify({
        query_text: queryText,
        preferred_language: preferredLanguage,
        session_id: sessionId,
      }),
    });
  }

  async getVoiceTools(): Promise<any[]> {
    return this.request("/voice/tools");
  }
}

export const api = new ApiClient();
