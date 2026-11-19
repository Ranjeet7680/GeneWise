"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  HelpCircle,
  Info,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
  Video,
  X,
} from "lucide-react";
import { GeneticCounsellor, SpecialistReferral } from "../types";

interface SpecialistDirectoryViewProps {
  counsellors: GeneticCounsellor[];
  referrals: SpecialistReferral[];
  onRequestReferral: (data: {
    counsellor_id: number;
    preferred_date?: string;
    reason_for_referral: string;
    notes?: string;
    consent_given: boolean;
  }) => Promise<void>;
}

export default function SpecialistDirectoryView({
  counsellors,
  referrals,
  onRequestReferral,
}: SpecialistDirectoryViewProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [telehealthOnly, setTelehealthOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"directory" | "referrals">("directory");

  // Referral Modal State
  const [selectedCounsellor, setSelectedCounsellor] = useState<GeneticCounsellor | null>(null);
  const [preferredDate, setPreferredDate] = useState<string>("");
  const [reasonForReferral, setReasonForReferral] = useState<string>(
    "Preconception risk assessment & Beta Thalassemia partner screening guidance."
  );
  const [clinicalNotes, setClinicalNotes] = useState<string>("");
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [showDataPreview, setShowDataPreview] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Filter counsellors
  const filteredCounsellors = counsellors.filter((c) => {
    if (selectedSpecialty !== "all" && !c.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())) {
      return false;
    }
    if (selectedLocation !== "all" && !c.city.toLowerCase().includes(selectedLocation.toLowerCase())) {
      return false;
    }
    if (telehealthOnly && !c.telehealth_available) {
      return false;
    }
    if (
      searchQuery &&
      !c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.affiliation.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleSubmitReferral = async () => {
    if (!selectedCounsellor || !consentGiven || !reasonForReferral.trim()) return;

    setIsSubmitting(true);
    try {
      await onRequestReferral({
        counsellor_id: selectedCounsellor.id,
        preferred_date: preferredDate || new Date().toISOString().split("T")[0],
        reason_for_referral: reasonForReferral,
        notes: clinicalNotes,
        consent_given: consentGiven,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedCounsellor(null);
        setActiveTab("referrals");
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Demo Notice & Regulatory Governance */}
      <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold">
            Demonstration Directory Notice & Clinical Practice Standards
          </p>
          <p className="text-muted-foreground dark:text-amber-300/80">
            This directory contains simulated healthcare professionals for demonstration purposes. In a clinical setting, verify credentials through the Board of Genetic Counselling (BGC) India, National Society of Genetic Counselors (NSGC), or the American College of Medical Genetics and Genomics (ACMG).
          </p>
        </div>
      </div>

      {/* Directory & Referrals Tab Switcher */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "directory"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-surface-low dark:bg-[#1c303d] text-foreground hover:bg-teal-500/10"
            }`}
          >
            Find Genetic Specialist ({filteredCounsellors.length})
          </button>
          <button
            onClick={() => setActiveTab("referrals")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "referrals"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-surface-low dark:bg-[#1c303d] text-foreground hover:bg-teal-500/10"
            }`}
          >
            <span>My Referrals & Appointments</span>
            <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-[10px] flex items-center justify-center font-bold">
              {referrals.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: Directory View */}
      {activeTab === "directory" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl border border-border bg-white dark:bg-[#162732] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by counsellor name, hospital, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-[#1c303d] text-foreground outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-[#1c303d] text-foreground outline-none"
              >
                <option value="all">All Specialties</option>
                <option value="Reproductive">Reproductive Genetics</option>
                <option value="Clinical">Clinical Genetics / Metabolic</option>
                <option value="Cancer">Cancer Genetics</option>
                <option value="Obstetrics">MFM & High-Risk Obstetrics</option>
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border bg-surface-low dark:bg-[#1c303d] text-foreground outline-none"
              >
                <option value="all">All Locations</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Chennai">Chennai</option>
                <option value="Delhi">Delhi NCR</option>
              </select>

              <label className="flex items-center gap-1.5 cursor-pointer ml-1">
                <input
                  type="checkbox"
                  checked={telehealthOnly}
                  onChange={(e) => setTelehealthOnly(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-semibold text-muted-foreground">Telehealth Only</span>
              </label>
            </div>
          </div>

          {/* Specialist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCounsellors.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                          {c.specialty}
                        </span>
                        {c.telehealth_available && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                            <Video className="w-2.5 h-2.5" />
                            <span>Telehealth</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-foreground mt-1">{c.full_name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Verified Credential: {c.credentials}</span>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950 border border-teal-500/30 text-teal-600 flex items-center justify-center font-bold shrink-0">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{c.bio}</p>

                  <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border/70">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-teal-600" />
                      <span>{c.affiliation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>
                        {c.city}, {c.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-teal-600" />
                      <span>Languages: {c.languages_spoken.join(", ")}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Consultation Fee</span>
                    <span className="text-xs font-mono font-bold text-foreground">
                      ₹{c.consultation_fee_inr || 1500} / session
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCounsellor(c);
                      setConsentGiven(false);
                      setPreferredDate(new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <span>Request Referral</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: My Referrals View */}
      {activeTab === "referrals" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Active Clinical Specialist Referrals</h3>
                <p className="text-xs text-muted-foreground">
                  Track your appointment referral requests, clinical notes transmission status, and consultation preparation.
                </p>
              </div>
              <span className="text-xs text-teal-600 font-semibold">Protected Health Information (HIPAA / DPDP)</span>
            </div>

            {referrals.length > 0 ? (
              <div className="space-y-3">
                {referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-4 rounded-xl border border-border bg-surface-low/30 dark:bg-[#192c38] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                            {ref.specialty}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ref.referral_status === "scheduled"
                                ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                                : ref.referral_status === "completed"
                                ? "bg-sky-500/10 text-sky-700 border border-sky-500/20"
                                : "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                            }`}
                          >
                            Status: {ref.referral_status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-foreground mt-1">{ref.counsellor_name}</h4>
                      </div>

                      <div className="text-right text-xs text-muted-foreground">
                        <div>Preferred Date: <span className="font-semibold text-foreground">{ref.preferred_date || "Flexible"}</span></div>
                        <div className="text-[10px]">Created: {new Date(ref.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-medium text-foreground">Reason: {ref.reason_for_referral}</p>
                      {ref.notes && <p className="text-muted-foreground italic">Notes: {ref.notes}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Explicit Patient Consent Documented</span>
                      </span>
                      <span>Referral ID: REF-{ref.id.toString().padStart(4, "0")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2">
                <p>No specialist referrals requested yet.</p>
                <button
                  onClick={() => setActiveTab("directory")}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white font-bold"
                >
                  Browse Genetic Counsellors
                </button>
              </div>
            )}
          </div>

          {/* Genetic Counselling Preparation Guide */}
          <div className="p-5 rounded-2xl border border-border bg-white dark:bg-[#162732] shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>How to Prepare for Your Genetic Counselling Appointment</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-1">
                <span className="font-bold text-teal-600">1. Bring Medical Records</span>
                <p className="text-muted-foreground">
                  Gather prior complete blood counts (CBC), hemoglobin electrophoresis/HPLC, and past genetic testing reports for both partners.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-1">
                <span className="font-bold text-teal-600">2. Export Family Pedigree</span>
                <p className="text-muted-foreground">
                  Use the "Export JSON / Print" feature in the Family Health Tree tab so your counsellor can review 3 generations of health patterns.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-surface-low/30 dark:bg-[#1a2d39] space-y-1">
                <span className="font-bold text-teal-600">3. Write Down Key Questions</span>
                <p className="text-muted-foreground">
                  Prepare your specific reproductive timeline, carrier screening interests, and any partner testing inquiries.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Request Referral Modal with Mandatory Explicit Consent */}
      {selectedCounsellor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#162732] rounded-2xl border border-border shadow-xl max-w-lg w-full p-6 space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                  CLINICAL REFERRAL REQUEST
                </span>
                <h3 className="text-base font-bold text-foreground">{selectedCounsellor.full_name}</h3>
              </div>
              <button
                onClick={() => setSelectedCounsellor(null)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Reason for Referral</label>
                <input
                  type="text"
                  value={reasonForReferral}
                  onChange={(e) => setReasonForReferral(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Preferred Consultation Date</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Additional Clinical Context (Optional)</label>
                <textarea
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Mention previous lab findings, specific carrier variants, or family history details..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-low dark:bg-[#1a2d39] text-foreground outline-none"
                />
              </div>

              {/* PREVIEW REFERRAL SUMMARY DATA DRAWER */}
              <div className="border border-border rounded-xl overflow-hidden bg-surface-low/40 dark:bg-[#182a35]">
                <button
                  type="button"
                  onClick={() => setShowDataPreview((v) => !v)}
                  className="w-full p-3 text-left flex items-center justify-between text-xs font-semibold text-foreground hover:bg-surface-low transition-colors"
                >
                  <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Preview Referral Data Summary (What Specialist Receives)</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {showDataPreview ? "Hide Preview ▲" : "Inspect Data ▼"}
                  </span>
                </button>

                {showDataPreview && (
                  <div className="p-3.5 border-t border-border space-y-2 text-[11px] leading-relaxed bg-white dark:bg-[#14232d]">
                    <div className="p-2.5 rounded-lg bg-surface-low font-mono text-[10px] text-muted-foreground space-y-1">
                      <p>
                        <strong className="text-foreground">Referral Recipient:</strong>{" "}
                        {selectedCounsellor.full_name} ({selectedCounsellor.credentials}) —{" "}
                        {selectedCounsellor.affiliation}
                      </p>
                      <p>
                        <strong className="text-foreground">Primary Reason:</strong> {reasonForReferral}
                      </p>
                      <p>
                        <strong className="text-foreground">Preferred Date:</strong>{" "}
                        {preferredDate || "Earliest Available"}
                      </p>
                      <p>
                        <strong className="text-foreground">Transmitted Pedigree State:</strong> 3 generations logged • Beta Thalassemia carrier trait documented • Partner screening status pending
                      </p>
                      <p>
                        <strong className="text-foreground">Clinical Context:</strong>{" "}
                        {clinicalNotes || "None documented"}
                      </p>
                    </div>
                    <p className="text-[10px] text-teal-800 dark:text-teal-300 font-medium">
                      Protected Health Information • Transmitted only with affirmative user consent. Zero unvalidated genetic probabilities.
                    </p>
                  </div>
                )}
              </div>

              {/* MANDATORY EXPLICIT CONSENT CHECKBOX */}
              <div className="p-3.5 rounded-xl border border-teal-500/40 bg-teal-500/10 dark:bg-teal-950/30 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-teal-900 dark:text-teal-200 block">
                      Explicit Consent for Clinical Data Transmission (Required)
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      I provide explicit consent to share my educational family health history and referral request with this specialist in accordance with clinical governance standards and DPDP / HIPAA data protection guidelines.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedCounsellor(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-surface-low"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReferral}
                disabled={!consentGiven || isSubmitting || !reasonForReferral.trim()}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : submitSuccess ? (
                  <span>Referral Sent!</span>
                ) : (
                  <span>Confirm Referral Request</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
