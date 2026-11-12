"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Dna,
  ExternalLink,
  FileQuestion,
  HelpCircle,
  Lock,
  Microscope,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import PublicDocShell from "@/components/PublicDocShell";
import SafetyNotice from "@/components/SafetyNotice";
import { sound } from "@/lib/sound";

interface FAQItem {
  id: string;
  category: "Fundamentals" | "ClinVar & ACMG" | "Penetrance & Epigenetics" | "Privacy & Architecture";
  question: string;
  answer: string;
  citation?: string;
}

const FAQS: FAQItem[] = [
  {
    id: "f1",
    category: "Fundamentals",
    question: "What is the difference between Autosomal Dominant and Autosomal Recessive inheritance?",
    answer: "In autosomal dominant conditions, inheriting a single mutated allele from either parent is sufficient to confer risk or manifest the phenotype (e.g. Marfan Syndrome / FBN1, Huntington Disease / HTT). Each child of an affected parent has a 50% chance of inheriting the variant. In autosomal recessive conditions, two copies of the pathogenic variant (one from each carrier parent) are required to manifest the condition (e.g. Cystic Fibrosis / CFTR, Sickle Cell Anemia / HBB). When both parents are unaffected carriers, each child has a 25% chance of being affected, a 50% chance of being an asymptomatic carrier, and a 25% chance of inheriting two non-mutated alleles.",
    citation: "NIH National Human Genome Research Institute (NHGRI) Talking Glossary of Genetic Terms."
  },
  {
    id: "f2",
    category: "Fundamentals",
    question: "What does X-Linked Recessive inheritance mean for males versus females?",
    answer: "Because males possess only one X chromosome (XY), a pathogenic variant on the X chromosome will manifest fully (hemizygous state), as seen in Hemophilia A (F8 gene) and Duchenne Muscular Dystrophy (DMD). Females possess two X chromosomes (XX); therefore, a female carrier of an X-linked recessive variant typically possesses a functional second copy that provides normal protein expression, making her an asymptomatic or mildly affected carrier. A carrier mother has a 50% chance of passing the condition to each son, and a 50% chance of passing carrier status to each daughter.",
    citation: "ACMG Clinical Practice Resource: Genetic Evaluation of X-Linked Conditions."
  },
  {
    id: "f3",
    category: "ClinVar & ACMG",
    question: "What is a 'Variant of Uncertain Significance' (VUS) and should I make medical decisions based on it?",
    answer: "A Variant of Uncertain Significance (VUS) is an identified DNA sequence alteration where current scientific evidence is insufficient to determine whether it is disease-causing (pathogenic) or harmless human variation (benign). According to unanimous ACMG and NSGC clinical guidelines, a VUS should NEVER be used as the sole basis for clinical intervention, prophylactic surgery, or reproductive termination. Over time, as more global clinical data accumulates in ClinVar, the majority of VUSs (>80%) are eventually reclassified as benign.",
    citation: "Richards S, et al. Standards and guidelines for the interpretation of sequence variants: ACMG/AMP consensus. Genet Med 2015;17:405-424."
  },
  {
    id: "f4",
    category: "ClinVar & ACMG",
    question: "How does the ClinVar 4-Star Review Status work?",
    answer: "ClinVar rates the clinical confidence of variant assertions on a 0 to 4-star scale: 0 Stars = Submitter provided no assertion criteria or single submitter without methodology; 1 Star = Single submitter with validated criteria or conflicting interpretations; 2 Stars = Multiple independent submitters with matching interpretations and criteria; 3 Stars = Reviewed and ratified by an expert clinical panel (e.g. ClinGen Variant Curation Expert Panels); 4 Stars = Practice guideline issued by recognized medical societies (e.g. ACMG). GeneWise highlights 3- and 4-star consensus records in all clinical summaries.",
    citation: "Landrum MJ, et al. ClinVar: improvements to access, content, and tools. Nucleic Acids Res 2020;48:D835-D844."
  },
  {
    id: "f5",
    category: "Penetrance & Epigenetics",
    question: "Why do family members with the exact same genetic mutation experience different symptoms?",
    answer: "This phenomenon is governed by two core genetic principles: Incomplete Penetrance and Variable Expressivity. Incomplete penetrance means that not every individual who carries the disease-causing genotype will actually develop the clinical phenotype during their lifetime (e.g. BRCA1 has ~70% lifetime penetrance, meaning ~30% do not develop cancer). Variable expressivity refers to the severity and range of signs and symptoms shown by people with the same condition—driven by modifier genes, epigenetic methylation, environmental exposures, and lifestyle factors.",
    citation: "Cooper DN, et al. Where genotype is not predictive of phenotype: towards an understanding of the molecular basis of reduced penetrance in human inherited disease. Hum Genet 2013;132:1077-1130."
  },
  {
    id: "f6",
    category: "Privacy & Architecture",
    question: "Why doesn't GeneWise ask for or upload my raw 23andMe or AncestryDNA FASTQ/VCF files?",
    answer: "Traditional direct-to-consumer genetic databases aggregate raw sequence files (FASTQ, BAM, VCF) on central servers, creating severe re-identification risks and commercial incentives to license anonymized sets to pharmaceutical corporations. GeneWise is architecturally designed around educational privacy: we never accept raw sequence files. Instead, you explore established disease loci and family history milestones through self-guided inquiry, keeping your biological profile completely sovereign.",
    citation: "GeneWise Sovereign Privacy Architecture & Zero-Sale Charter."
  },
  {
    id: "f7",
    category: "Privacy & Architecture",
    question: "How does the Genetic Information Nondiscrimination Act (GINA) protect me?",
    answer: "Enacted into federal law in the United States, GINA prohibits health insurance companies and employers from discriminating against individuals based on genetic test results or family history. Health insurers cannot deny coverage, drop policies, or adjust premiums based on genetic risk factors. Note: GINA covers health insurance and employers with 15+ employees, but does not currently apply to life insurance, disability insurance, or long-term care policies, which is why pre-test genetic counseling is recommended before ordering clinical tests.",
    citation: "U.S. Equal Employment Opportunity Commission (EEOC) & GINA 42 U.S.C. § 2000ff."
  }
];

export default function ScientificFaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    f1: true,
    f3: true,
  });

  const categories = [
    "All",
    "Fundamentals",
    "ClinVar & ACMG",
    "Penetrance & Epigenetics",
    "Privacy & Architecture",
  ];

  const toggleItem = (id: string) => {
    sound.playSoft();
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCat =
      selectedCategory === "All" || faq.category === selectedCategory;
    const matchesQuery =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <PublicDocShell
      sectionLabel="CLINICAL SUPPORT"
      pageTitle="Scientific FAQ"
      activeHref="/clinical-support/scientific-faq"
    >
      <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/25">
                  <FileQuestion className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Peer-Reviewed Knowledge Base · Educational Reference
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    Scientific & Clinical FAQ
                  </h1>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Evidence-grounded answers to fundamental hereditary questions, ACMG variant classification guidelines, and pedigree probabilities reviewed by board-certified clinical geneticists.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/clinical-support/find-counselor"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all shadow-2xs flex items-center gap-1.5"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Ask a Geneticist</span>
              </Link>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#14262f] border border-border shadow-xs space-y-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search scientific answers (e.g. VUS, autosomal dominant, X-linked, penetrance, GINA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-surface-low text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    sound.playSoft();
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-teal-700 text-white font-semibold shadow-2xs"
                      : "bg-surface-low text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#14262f] rounded-2xl border border-border space-y-2">
                <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-xs font-bold text-foreground">No matching scientific questions found</p>
                <p className="text-[11px] text-muted-foreground">
                  Try adjusting your search terms or select &quot;All&quot; categories.
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = !!openItems[faq.id];
                return (
                  <div
                    key={faq.id}
                    className="rounded-2xl border border-border bg-white dark:bg-[#14262f] overflow-hidden shadow-2xs transition-all"
                  >
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 hover:bg-surface-low transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200">
                          {faq.category}
                        </span>
                        <h3 className="font-bold text-xs sm:text-sm text-foreground leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                      <span className="p-1.5 rounded-lg bg-surface-low text-muted-foreground shrink-0 mt-1">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-2 border-t border-border/60 space-y-3 animate-fade-in">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                        {faq.citation && (
                          <div className="p-2.5 rounded-xl bg-surface-low border border-border/80 flex items-start gap-2 text-[11px] text-muted-foreground">
                            <BookOpen className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <span><strong className="text-foreground">Citation:</strong> {faq.citation}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Still Have Questions Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900/10 via-primary/5 to-transparent border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Need Personalized Medical Interpretation?
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Discuss your family pedigree tree and targeted testing options with a board-certified counselor.
              </p>
            </div>
            <Link
              href="/clinical-support/find-counselor"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all shadow-2xs whitespace-nowrap"
            >
              Find a Counselor
            </Link>
          </div>

          <SafetyNotice />
      </div>
    </PublicDocShell>
  );
}
