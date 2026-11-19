"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  User,
  Video,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { sound } from "@/lib/sound";
import { AppointmentBookingRecord, GeneticCounselor } from "@/types";

interface CounselorBookingModalProps {
  counselor: GeneticCounselor | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete?: (record: AppointmentBookingRecord) => void;
}

const TIME_SLOTS = [
  "09:00 - 09:45 AM",
  "10:30 - 11:15 AM",
  "01:30 - 02:15 PM",
  "03:00 - 03:45 PM",
  "04:30 - 05:15 PM",
];

export default function CounselorBookingModal({
  counselor,
  isOpen,
  onClose,
  onBookingComplete,
}: CounselorBookingModalProps) {
  const [format, setFormat] = useState<"telehealth" | "in_person">("telehealth");
  const [preferredDate, setPreferredDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split("T")[0];
  });
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<string>(TIME_SLOTS[0]);
  const [timeZone, setTimeZone] = useState<string>(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles";
    } catch {
      return "America/Los_Angeles";
    }
  });

  const [patientName, setPatientName] = useState<string>("Rajesh Kumar");
  const [patientEmail, setPatientEmail] = useState<string>("patient@example.com");
  const [patientPhone, setPatientPhone] = useState<string>("+1 (555) 349-2041");
  const [consultationPurpose, setConsultationPurpose] = useState<string>(
    "Review multi-generational family disease patterns"
  );
  const [intakeNotes, setIntakeNotes] = useState<string>(
    "Paternal history of early myocardial infarction and thoracic aortic aneurysm. Inquiring about Marfan / FBN1 gene panel indications."
  );
  const [consentDataSharing, setConsentDataSharing] = useState<boolean>(true);
  const [includePedigree, setIncludePedigree] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<AppointmentBookingRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!isOpen || !counselor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentDataSharing) {
      alert("Please provide informed consent for clinical data sharing to proceed.");
      return;
    }

    sound.playSuccess();
    setIsSubmitting(true);

    try {
      const record = await api.bookCounselorAppointment(counselor.id, {
        counsellor_id: counselor.id,
        patient_name: patientName,
        patient_email: patientEmail,
        patient_phone: patientPhone,
        consultation_purpose: consultationPurpose,
        preferred_date: preferredDate,
        preferred_time_slot: preferredTimeSlot,
        time_zone: timeZone,
        consultation_format: format,
        intake_notes: intakeNotes,
        consent_data_sharing: consentDataSharing,
        include_pedigree: includePedigree,
      });

      setBookingResult(record);
      if (onBookingComplete) onBookingComplete(record);
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!bookingResult?.telehealth_link) return;
    sound.playSoft();
    navigator.clipboard.writeText(bookingResult.telehealth_link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return typeof document !== "undefined"
    ? createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              sound.playSoft();
              onClose();
            }
          }}
          className="fixed inset-0 z-[99999] bg-slate-950/80 dark:bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-fade-in transition-all"
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          <div className="bg-white/98 dark:bg-[#112128]/98 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-teal-500/30 dark:border-teal-500/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] max-w-xl w-full max-h-[92dvh] flex flex-col overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border bg-surface-low/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/25">
                  <Calendar className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    Clinical Consultation Request
                  </span>
                  <h3 className="text-base font-extrabold text-foreground tracking-tight">
                    {bookingResult ? "Appointment Confirmed" : `Schedule with ${counselor.name}`}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playSoft();
                  onClose();
                }}
                className="p-1.5 rounded-xl text-muted-foreground hover:bg-surface-low hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {bookingResult ? (
                /* Booking Success Confirmation */
                <div className="space-y-5 text-center py-3">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/25">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-lg text-foreground">
                      Clinical Consultation Intake Transmitted
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Your referral has been securely dispatched to {counselor.name} at {counselor.institution}.
                    </p>
                  </div>

                  {/* Booking Receipt Card */}
                  <div className="p-4 rounded-2xl bg-surface-low border border-border text-left space-y-2.5 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-border/60">
                      <span className="text-muted-foreground">Booking Confirmation ID:</span>
                      <span className="font-mono font-bold text-foreground">{bookingResult.id}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Attending Specialist:</span>
                      <span className="font-bold text-foreground">{bookingResult.counsellor_name}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Requested Schedule:</span>
                      <span className="font-bold text-foreground">
                        {bookingResult.preferred_date} · {bookingResult.preferred_time_slot}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Format &amp; Time Zone:</span>
                      <span className="text-foreground capitalize">
                        {bookingResult.consultation_format} ({bookingResult.time_zone})
                      </span>
                    </div>

                    {bookingResult.telehealth_link && (
                      <div className="pt-2 border-t border-border/60 space-y-1.5">
                        <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                          Secure Telehealth Room Link:
                        </span>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#182d37] border border-border">
                          <Video className="w-4 h-4 text-teal-600 shrink-0" />
                          <span className="text-[11px] font-mono text-foreground truncate flex-1">
                            {bookingResult.telehealth_link}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className="px-2.5 py-1 rounded-lg bg-teal-700 text-white text-[11px] font-bold shrink-0 shadow-2xs flex items-center gap-1"
                          >
                            {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedLink ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[11px] pt-1 text-muted-foreground font-mono">
                      <span>Audit Verification:</span>
                      <span className="text-teal-700 dark:text-teal-400">{bookingResult.audit_token}</span>
                    </div>
                  </div>

                  {/* Pre-Consultation Instructions */}
                  <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 text-left space-y-2">
                    <h5 className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      Pre-Consultation Preparation Instructions
                    </h5>
                    <ul className="text-xs text-teal-900/80 dark:text-teal-200/80 space-y-1">
                      {(bookingResult.pre_consultation_instructions || [
                        "Gather 3 generations of family medical history before your visit.",
                        "Bring or upload any relevant genetic or molecular pathology lab reports.",
                        "Prepare 3-5 specific questions regarding inheritance patterns or testing utility.",
                        "Log into the secure telehealth portal 5 minutes before your scheduled appointment.",
                      ]).map((inst, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      sound.playSoft();
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all shadow-xs"
                  >
                    Close &amp; Return to Directory
                  </button>
                </div>
              ) : (
                /* Booking Form */
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {/* Counselor Mini Header */}
                  <div className="p-3.5 rounded-2xl bg-surface-low border border-border flex items-center gap-3">
                    <img
                      src={counselor.avatar || "/images/counselors/maya-lin.jpg"}
                      alt={counselor.name}
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-teal-500/30 shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-foreground text-xs">{counselor.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                          {counselor.specialty}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{counselor.institution}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{counselor.credentials}</p>
                    </div>
                  </div>

                  {/* Consultation Format */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                      Consultation Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playSoft();
                          setFormat("telehealth");
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${
                          format === "telehealth"
                            ? "bg-teal-50 dark:bg-teal-950/40 border-teal-600 text-teal-800 dark:text-teal-200 font-bold ring-1 ring-teal-500"
                            : "bg-surface-low border-border text-muted-foreground"
                        }`}
                      >
                        <Video className="w-4 h-4 text-teal-600" />
                        <span>Telehealth Video</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playSoft();
                          setFormat("in_person");
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${
                          format === "in_person"
                            ? "bg-teal-50 dark:bg-teal-950/40 border-teal-600 text-teal-800 dark:text-teal-200 font-bold ring-1 ring-teal-500"
                            : "bg-surface-low border-border text-muted-foreground"
                        }`}
                      >
                        <MapPin className="w-4 h-4 text-teal-600" />
                        <span>In-Person Clinic</span>
                      </button>
                    </div>
                  </div>

                  {/* Date & Time Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground">Preferred Date</label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full p-2 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground">Preferred Time Slot</label>
                      <select
                        value={preferredTimeSlot}
                        onChange={(e) => setPreferredTimeSlot(e.target.value)}
                        className="w-full p-2 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground text-xs"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Patient Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground">Patient Full Name</label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full p-2 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground">Contact Email</label>
                      <input
                        type="email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full p-2 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground text-xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Primary Consultation Reason */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground">
                      Primary Consultation Purpose
                    </label>
                    <select
                      value={consultationPurpose}
                      onChange={(e) => setConsultationPurpose(e.target.value)}
                      className="w-full p-2 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground text-xs"
                    >
                      <option>Review multi-generational family disease patterns</option>
                      <option>Follow up on a ClinVar variant classification</option>
                      <option>Discuss reproductive carrier screening (CFTR, SMN1)</option>
                      <option>Hereditary cardiovascular early-onset surveillance</option>
                      <option>General hereditary cancer risk evaluation (BRCA1/2)</option>
                      <option>Pharmacogenomics & Adverse Drug Reaction Guidance</option>
                    </select>
                  </div>

                  {/* Clinical Context / Notes */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground">
                      Clinical Context / Specific Symptoms (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={intakeNotes}
                      onChange={(e) => setIntakeNotes(e.target.value)}
                      placeholder="e.g. Any specific test results, symptoms, or upcoming family planning decisions..."
                      className="w-full p-2 rounded-xl border border-border bg-white dark:bg-[#182d37] text-foreground text-xs leading-relaxed resize-none"
                    />
                  </div>

                  {/* Privacy & Pedigree Attachment Checkbox */}
                  <div className="space-y-2 pt-1 border-t border-border">
                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePedigree}
                        onChange={(e) => setIncludePedigree(e.target.checked)}
                        className="rounded border-border text-teal-700 focus:ring-teal-700"
                      />
                      <span>
                        Attach my encrypted GeneWise Pedigree Checklist (FIPS 140-3 Zero Raw DNA).
                      </span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentDataSharing}
                        onChange={(e) => setConsentDataSharing(e.target.checked)}
                        className="rounded border-border text-teal-700 focus:ring-teal-700"
                        required
                      />
                      <span className="font-medium text-teal-900 dark:text-teal-200">
                        I explicitly consent to sharing this intake record with {counselor.name}.
                      </span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playSoft();
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-surface-low"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Transmitting Packet...</span>
                      ) : (
                        <>
                          <span>Confirm &amp; Transmit Request</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;
}
