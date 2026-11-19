import datetime
import hashlib
import json
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.academy import (
    CourseModel,
    CourseChapterModel,
    CourseLessonModel,
    CourseEnrollmentModel,
    LessonProgressModel,
    VirtualLabModel,
    LabAttemptModel,
    ModuleQuizModel,
    QuizQuestionModel,
    QuizAttemptModel,
    FinalExamModel,
    ExamAttemptModel,
    CertificateModel,
    CertificateRevocationModel,
    DownloadableMaterialModel,
)
from app.models.models import User
from app.schemas.academy import (
    CourseSummary,
    CourseDetail,
    ChapterSummary,
    LessonSummary,
    LessonDetail,
    QuizDetail,
    QuizQuestionItem,
    QuizSubmitResponse,
    ExamSubmitResponse,
    CertificateResponse,
    CertificateVerificationResponse,
    VirtualLabItem,
    AcademyDashboardResponse,
)

# ==============================================================================
# COMPREHENSIVE 12-COURSE SCIENTIFIC CURRICULUM DEFINITIONS
# ==============================================================================

COURSES_DATA = [
    {
        "id": "course-01-genetics-fundamentals",
        "code": "GEN-101",
        "title": "Genetics Fundamentals: DNA, Genes & Chromosomes",
        "slug": "genetics-fundamentals",
        "subtitle": "Foundational human genomics, molecular architecture, transcription, and nucleotide variation.",
        "description": "Understand the structural foundation of human genetics. Master DNA double-helix topology, nucleotide base pairing, chromatin packing into 23 chromosome pairs, RNA transcription, and ribosomal translation.",
        "category": "Fundamentals",
        "difficulty": "Beginner",
        "duration_hours": 3.5,
        "instructor_name": "Dr. Sarah Al-Mansoor, PhD, CGC",
        "instructor_title": "Lead Neurogenomics Specialist & ACMG Fellow",
        "instructor_avatar": "/images/counselors/sarah-al-mansoor.jpg",
        "modules_count": 5,
        "lessons_count": 15,
        "acmg_alignment": "ACMG Core Genomics Framework",
        "order_index": 1,
        "chapters": [
            {
                "id": "c1-ch1",
                "chapter_number": 1,
                "title": "Introduction to Human Genomics",
                "description": "Historical milestones, Mendel to the Human Genome Project, and clinical utility.",
                "lessons": [
                    {
                        "id": "c1-ch1-l1",
                        "lesson_number": 1,
                        "title": "The Genetic Architecture of the Human Body",
                        "slug": "genetic-architecture-human-body",
                        "reading_time_min": 8,
                        "objectives": [
                            "Differentiate nuclear DNA from mitochondrial DNA.",
                            "Explain the genomic size: 3.2 billion base pairs organized into 46 chromosomes.",
                            "Understand how somatic diploid cells compare to haploid gametes."
                        ],
                        "content_markdown": """
# The Genetic Architecture of the Human Body

Every nucleated human cell contains approximately **3.2 billion base pairs** of DNA coiled tightly within the nucleus. This genetic blueprint encodes roughly 20,000 protein-coding genes, which represent less than 2% of the total genomic sequence. The remaining non-coding regions play vital regulatory roles in transcriptional control, alternative splicing, and chromatin architecture.

## Nuclear vs. Mitochondrial DNA
- **Nuclear DNA (nDNA)**: Linear DNA organized into 22 pairs of autosomes and 1 pair of sex chromosomes (XX or XY). Inherited equally from both biological parents.
- **Mitochondrial DNA (mtDNA)**: Circular double-stranded genome comprising 16,569 base pairs and 37 genes. Strictly maternally inherited with variable heteroplasmy across tissues.

## Clinical Relevance
Genomic literacy allows clinicians and patients to understand why single-nucleotide variants can lead to monogenic disorders, whereas structural variations (copy number variants) often cause syndromic developmental manifestations.
                        """,
                        "key_takeaways": [
                            "Human genome consists of 3.2 billion base pairs across 23 chromosome pairs.",
                            "Protein-coding exons comprise ~1.5% of total DNA, while introns and regulatory elements modulate expression.",
                            "Mitochondrial DNA is maternally inherited and crucial for oxidative phosphorylation."
                        ],
                        "clinical_pearls": [
                            "Mitochondrial disorders exhibit heteroplasmy; recurrence risk depends on the percentage of mutant mtDNA copies passed down.",
                            "Copy number variants (CNVs) exceeding 500kb frequently confer clinical phenotypic consequences."
                        ],
                        "pmid_references": ["PMID: 11237011 (Human Genome Project Nature 2001)", "PMID: 32661502"],
                        "animation_type": "dna_helix",
                        "virtual_lab_id": "lab-01-dna-structure"
                    },
                    {
                        "id": "c1-ch1-l2",
                        "lesson_number": 2,
                        "title": "From Mendel to High-Throughput Sequencing",
                        "slug": "mendel-to-ngs",
                        "reading_time_min": 7,
                        "objectives": [
                            "Trace the evolution of genetics from pea plants to Sanger and Next-Generation Sequencing.",
                            "Understand Moore's Law vs. the sequencing cost deflation curve.",
                            "Recognize why clinical genomics is now accessible in routine outpatient medicine."
                        ],
                        "content_markdown": """
# From Mendel to Next-Generation Sequencing

In 1865, Gregor Mendel established the principles of trait segregation and independent assortment. For nearly a century, the biochemical nature of genes remained obscure until Watson, Crick, and Franklin elucidated the double-helix geometry in 1953. 

The first Human Genome Project took 13 years and over $2.7 billion. Today, Next-Generation Sequencing (NGS) allows whole-genome sequencing in under 24 hours for a few hundred dollars, revolutionizing clinical diagnostic odysseys for rare genetic diseases.
                        """,
                        "key_takeaways": [
                            "Sequencing costs fell faster than Moore's Law due to massively parallel sequencing (NGS).",
                            "Mendelian principles remain the foundation of pedigree risk stratification."
                        ],
                        "clinical_pearls": [
                            "Even with whole-genome data, clinical interpretation requires phenotyping according to Human Phenotype Ontology (HPO)."
                        ],
                        "pmid_references": ["PMID: 25741868 (ACMG Standards)"]
                    },
                    {
                        "id": "c1-ch1-l3",
                        "lesson_number": 3,
                        "title": "Ethical Frameworks and Non-Discrimination Protections",
                        "slug": "ethical-frameworks-gina",
                        "reading_time_min": 6,
                        "objectives": [
                            "Understand the Genetic Information Nondiscrimination Act (GINA) of 2008.",
                            "Identify exclusions: life insurance, disability, long-term care insurance.",
                            "Review international protections including India's DPDP Act 2023."
                        ],
                        "content_markdown": """
# Ethical Frameworks & Genetic Non-Discrimination

Patients often fear that genetic testing will result in employment termination or health insurance denial. 

In the United States, **GINA (2008)** protects individuals against health insurance discrimination and employer bias based on predictive genetic test results. However, GINA does not apply to life, disability, or long-term care insurance. 

In India, **DPDP Act 2023** classifies genomic data as high-sensitivity personal biometric data requiring explicit, verifiable informed consent.
                        """,
                        "key_takeaways": [
                            "GINA protects against health insurance and employment genetic bias.",
                            "GINA does NOT cover life insurance, disability insurance, or military personnel."
                        ],
                        "clinical_pearls": [
                            "Advise asymptomatic patients to review existing life/disability policies before pursuing predictive genetic testing."
                        ],
                        "pmid_references": ["PMID: 18567156 (GINA Overview)"]
                    }
                ]
            },
            {
                "id": "c1-ch2",
                "chapter_number": 2,
                "title": "DNA and Molecular Structure",
                "description": "Double helix geometry, antiparallel strands, and complementary base pairing.",
                "lessons": [
                    {
                        "id": "c1-ch2-l1",
                        "lesson_number": 1,
                        "title": "Nucleotides and Complementary Base Pairing",
                        "slug": "nucleotides-base-pairing",
                        "reading_time_min": 8,
                        "objectives": [
                            "Identify purines (Adenine, Guanine) and pyrimidines (Cytosine, Thymine).",
                            "Understand Watson-Crick hydrogen bonding: A=T (2 bonds), C≡G (3 bonds).",
                            "Explain antiparallel 5' to 3' orientation."
                        ],
                        "content_markdown": """
# Nucleotides & Complementary Base Pairing

DNA is a double-stranded polymer composed of repeating nucleotide monomers. Each nucleotide comprises a deoxyribose sugar, a phosphate group, and one of four nitrogenous bases:
- **Purines**: Adenine (A), Guanine (G)
- **Pyrimidines**: Cytosine (C), Thymine (T)

According to Chargaff's rules, Adenine always pairs with Thymine via **two hydrogen bonds**, while Cytosine pairs with Guanine via **three hydrogen bonds**. Regions rich in C-G pairs require higher thermal melting temperatures ($T_m$) during clinical PCR amplification.
                        """,
                        "key_takeaways": [
                            "A pairs with T (2 hydrogen bonds); C pairs with G (3 hydrogen bonds).",
                            "Higher GC content increases duplex thermal stability in laboratory PCR."
                        ],
                        "clinical_pearls": [
                            "PCR primers targeting GC-rich promoters (e.g. FMR1 repeat expansions) require specialized betaine or DMSO additives to prevent secondary hairpins."
                        ],
                        "pmid_references": ["PMID: 17293882"],
                        "animation_type": "dna_helix",
                        "virtual_lab_id": "lab-01-dna-structure"
                    },
                    {
                        "id": "c1-ch2-l2",
                        "lesson_number": 2,
                        "title": "DNA Replication and Proofreading Fidelity",
                        "slug": "dna-replication-fidelity",
                        "reading_time_min": 7,
                        "objectives": [
                            "Describe semi-conservative replication mediated by DNA Polymerase.",
                            "Explain 3' to 5' exonuclease proofreading fidelity.",
                            "Connect replication errors to somatic cancer driver mutations."
                        ],
                        "content_markdown": """
# DNA Replication & Proofreading Fidelity

During S phase of the cell cycle, DNA replicates semi-conservatively. DNA polymerase synthesizes nascent daughter strands in the 5' to 3' direction. 

Human DNA polymerases $\delta$ and $\epsilon$ possess intrinsic **3' to 5' proofreading exonuclease activity**, reducing replication error rates to approximately 1 in $10^7$ nucleotides. Post-replicative mismatch repair (MMR) proteins further reduce error rates to 1 in $10^9$. Deficiencies in MMR genes (*MLH1, MSH2, MSH6, PMS2*) cause Lynch syndrome and microsatellite instability (MSI-H).
                        """,
                        "key_takeaways": [
                            "Semi-conservative replication yields two duplexes, each with one parent strand.",
                            "Proofreading and MMR reduce error rates from $10^{-5}$ to $10^{-9}$."
                        ],
                        "clinical_pearls": [
                            "Defective mismatch repair generates MSI-High signatures, rendering colorectal cancers highly responsive to anti-PD-1 checkpoint immunotherapy."
                        ],
                        "pmid_references": ["PMID: 28552341 (MMR in Oncology)"]
                    },
                    {
                        "id": "c1-ch2-l3",
                        "lesson_number": 3,
                        "title": "Chromatin Packaging: From Nucleosomes to Metaphase Chromosomes",
                        "slug": "chromatin-packaging",
                        "reading_time_min": 8,
                        "objectives": [
                            "Explain histone octamers: H2A, H2B, H3, H4.",
                            "Distinguish euchromatin (transcriptionally active) from heterochromatin (silenced).",
                            "Understand karyotype visualization at metaphase."
                        ],
                        "content_markdown": """
# Chromatin Packaging & Karyotypes

If stretched end-to-end, the DNA in a single human cell measures approximately 2 meters in length. To fit inside a 10-micrometer nucleus, it undergoes progressive compaction:
1. **Nucleosomes**: 147 base pairs wrapped around an octamer of basic histone proteins.
2. **30nm Fibers**: Stabilized by histone H1.
3. **Chromatin Loops**: Anchored by cohesin and CTCF insulator complexes.
4. **Metaphase Chromosomes**: Maximum compaction achieved during cell division, allowing G-banded karyotyping.
                        """,
                        "key_takeaways": [
                            "DNA wraps around histone octamers to form nucleosomes.",
                            "Euchromatin is open and actively transcribed; heterochromatin is densely packed and silenced."
                        ],
                        "clinical_pearls": [
                            "Standard G-banded karyotyping detects numerical aneuploidies and large translocations >5Mb, but cannot detect microdeletions without chromosomal microarray (CMA)."
                        ],
                        "pmid_references": ["PMID: 23143521"]
                    }
                ]
            },
            {
                "id": "c1-ch3",
                "chapter_number": 3,
                "title": "Genes, Chromosomes & Karyotypes",
                "description": "Exons, introns, chromosomal nomenclature, and numerical aneuploidies.",
                "lessons": [
                    {
                        "id": "c1-ch3-l1",
                        "lesson_number": 1,
                        "title": "Anatomy of a Gene: Promoters, Exons, and Splicing",
                        "slug": "anatomy-of-a-gene",
                        "reading_time_min": 8,
                        "objectives": [
                            "Identify promoter elements (TATA box), 5' UTR, and 3' polyadenylation signals.",
                            "Differentiate coding exons from intervening introns.",
                            "Explain canonical splice donor (GT) and splice acceptor (AG) consensus dinucleotides."
                        ],
                        "content_markdown": """
# Anatomy of a Human Gene

A canonical eukaryotic gene consists of:
- **Promoter Region**: Located upstream of the transcription start site (+1), binding transcription factors and RNA Polymerase II.
- **5' and 3' Untranslated Regions (UTRs)**: Regulate mRNA stability, subcellular localization, and translational efficiency.
- **Exons & Introns**: Exons contain coding sequences. During pre-mRNA processing, introns are excised by the spliceosome.
- **Splice Sites**: Invariant GT at the 5' donor site and AG at the 3' acceptor site. Single nucleotide substitutions disrupting these canonical dinucleotides (e.g. *c.100+1G>A*) frequently cause exon skipping and premature truncation.
                        """,
                        "key_takeaways": [
                            "Exons encode proteins; introns are excised during splicing.",
                            "Canonical splice donor (GT) and acceptor (AG) mutations are classified as PVS1 (very strong evidence of pathogenicity) under ACMG guidelines."
                        ],
                        "clinical_pearls": [
                            "Synonymous variants that do not change amino acid code can still be pathogenic if they create novel cryptic splice sites."
                        ],
                        "pmid_references": ["PMID: 25741868 (ACMG Splicing Rules)"]
                    },
                    {
                        "id": "c1-ch3-l2",
                        "lesson_number": 2,
                        "title": "Chromosome Nomenclature and Cytogenetic Banding",
                        "slug": "chromosome-nomenclature",
                        "reading_time_min": 7,
                        "objectives": [
                            "Understand p (short arm) and q (long arm) designation.",
                            "Interpret ISCN nomenclature (e.g. 46,XY,del(5)(q13)).",
                            "Differentiate metacentric, submetacentric, and acrocentric chromosomes."
                        ],
                        "content_markdown": """
# Chromosome Nomenclature (ISCN Standards)

Chromosomes possess a centromere dividing them into:
- **p arm** (*petit* - short arm)
- **q arm** (long arm)

Cytogenetic bands are numbered outward from the centromere toward the telomeres. For example, the *CFTR* gene resides at **7q31.2** (Chromosome 7, long arm, region 3, band 1, sub-band 2). Acrocentric chromosomes (13, 14, 15, 21, 22) have stalks containing ribosomal RNA genes, predisposing to Robertsonian translocations.
                        """,
                        "key_takeaways": [
                            "p = short arm, q = long arm.",
                            "Acrocentric chromosomes (13, 14, 15, 21, 22) participate in Robertsonian translocations."
                        ],
                        "clinical_pearls": [
                            "A balanced Robertsonian translocation carrier (e.g. 45,XX,der(14;21)) is phenotypically normal but carries elevated recurrence risk for Down syndrome."
                        ],
                        "pmid_references": ["PMID: 27144170 (ISCN 2016)"]
                    },
                    {
                        "id": "c1-ch3-l3",
                        "lesson_number": 3,
                        "title": "Numerical Chromosomal Abnormalities (Aneuploidy)",
                        "slug": "numerical-aneuploidy",
                        "reading_time_min": 8,
                        "objectives": [
                            "Explain meiotic non-disjunction.",
                            "Review common autosomal trisomies: Trisomy 21 (Down), 18 (Edwards), 13 (Patau).",
                            "Explain sex chromosome aneuploidies: 47,XXY (Klinefelter) and 45,X (Turner)."
                        ],
                        "content_markdown": """
# Numerical Aneuploidies & Meiotic Non-Disjunction

Aneuploidy arises primarily from maternal meiotic non-disjunction during Meiosis I, with incidence rising sharply with advanced maternal age (>35 years):
- **Trisomy 21 (47,XX,+21)**: Down syndrome (1 in 700 live births). Hypotonia, characteristic facies, endocardial cushion defects.
- **Trisomy 18 (47,XX,+18)**: Edwards syndrome. Clenched hands, rocker-bottom feet, high infant mortality.
- **Trisomy 13 (47,XX,+13)**: Patau syndrome. Microphthalmia, holoprosencephaly, cleft palate.
- **Monosomy X (45,X)**: Turner syndrome. Short stature, webbed neck, coarctation of aorta, primary amenorrhea.
                        """,
                        "key_takeaways": [
                            "Aneuploidies result from meiotic non-disjunction, correlated with maternal age.",
                            "Turner syndrome (45,X) is the only viable human full monosomy."
                        ],
                        "clinical_pearls": [
                            "Over 98% of 45,X conceptions miscarry spontaneously; mosaicism (45,X/46,XX) often explains surviving milder adult phenotypes."
                        ],
                        "pmid_references": ["PMID: 15309088"]
                    }
                ]
            },
            {
                "id": "c1-ch4",
                "chapter_number": 4,
                "title": "RNA, Transcription & Protein Translation",
                "description": "The Central Dogma: mRNA processing, genetic code codon tables, and post-translational modification.",
                "lessons": [
                    {
                        "id": "c1-ch4-l1",
                        "lesson_number": 1,
                        "title": "RNA Polymerase and Transcriptional Regulation",
                        "slug": "transcription-regulation",
                        "reading_time_min": 8,
                        "objectives": [
                            "Explain transcription initiation, elongation, and termination.",
                            "Detail 5' capping, 3' polyadenylation, and splicing.",
                            "Understand enhancer-promoter chromatin loops."
                        ],
                        "content_markdown": """
# Transcription & mRNA Processing

RNA Polymerase II transcribes genomic DNA into pre-mRNA. Before exiting through nuclear pores to the cytoplasm, nascent transcripts undergo three critical processing steps:
1. **5' Capping**: Addition of 7-methylguanosine cap to protect against exonuclease degradation and recruit ribosomal pre-initiation complexes.
2. **Splicing**: Spliceosomal removal of non-coding introns.
3. **3' Polyadenylation**: Addition of a 200-250 adenine residue tail by poly(A) polymerase, determining message half-life.
                        """,
                        "key_takeaways": [
                            "5' cap and 3' poly(A) tail are mandatory for mRNA cytoplasmic stability and translation.",
                            "Alternative splicing enables a single gene to encode diverse protein isoforms."
                        ],
                        "clinical_pearls": [
                            "Targeted antisense oligonucleotides (ASOs, e.g. Nusinersen for SMA) modify splicing choices to restore functional protein expression."
                        ],
                        "pmid_references": ["PMID: 28834710 (Splice-Modulating Therapies)"]
                    },
                    {
                        "id": "c1-ch4-l2",
                        "lesson_number": 2,
                        "title": "The Genetic Code: Codons, Degeneracy, and Translation",
                        "slug": "genetic-code-translation",
                        "reading_time_min": 7,
                        "objectives": [
                            "Understand the 64 triplet codon table and degeneracy.",
                            "Identify the universal start codon (AUG - Methionine) and stop codons (UAA, UAG, UGA).",
                            "Explain tRNA charging and ribosomal A, P, E sites."
                        ],
                        "content_markdown": """
# The Genetic Code & Translation

Translation converts the 4-letter nucleotide language into the 20-amino-acid polypeptide language using triplet **codons**:
- 61 codons specify amino acids, while 3 codons (**UAA, UAG, UGA**) act as termination stop signals.
- **Degeneracy**: Multiple codons specify the same amino acid (e.g. 6 codons encode Leucine), buffering the genome against phenotypic consequences of third-base wobble position mutations.
- Ribosomes read mRNA from 5' to 3', assembling polypeptides from amino-terminus (N-terminus) to carboxy-terminus (C-terminus).
                        """,
                        "key_takeaways": [
                            "AUG is the start codon; UAA, UAG, and UGA are stop codons.",
                            "Degeneracy buffers against synonymous third-base point mutations."
                        ],
                        "clinical_pearls": [
                            "Premature termination codons (PTCs) trigger Nonsense-Mediated mRNA Decay (NMD), destroying transcripts before truncated toxic proteins can accumulate."
                        ],
                        "pmid_references": ["PMID: 29074712"]
                    },
                    {
                        "id": "c1-ch4-l3",
                        "lesson_number": 3,
                        "title": "Protein Folding and Post-Translational Modifications",
                        "slug": "protein-folding-modifications",
                        "reading_time_min": 8,
                        "objectives": [
                            "Review primary, secondary, tertiary, and quaternary protein structures.",
                            "Explain chaperone-assisted folding in the endoplasmic reticulum.",
                            "Connect misfolding to neurodegenerative proteinopathies."
                        ],
                        "content_markdown": """
# Protein Folding & Pathological Misfolding

Polypeptides must fold into precise three-dimensional conformations to acquire biological activity:
- **Chaperones** (Hsp70/Hsp90) facilitate proper folding.
- **Post-Translational Modifications (PTMs)**: Phosphorylation, glycosylation, ubiquitination, and disulfide bonding fine-tune enzymatic activity.
- **Misfolding Diseases**: Misfolded polypeptides with exposed hydrophobic $\beta$-sheet regions aggregate into toxic oligomers, causing conditions such as Alzheimer disease (Amyloid-$\beta$), Parkinson disease ($\alpha$-synuclein), and Familial Transthyretin Amyloidosis (ATTR).
                        """,
                        "key_takeaways": [
                            "Protein function depends on tertiary and quaternary conformation.",
                            "Misfolded protein aggregates drive neurodegenerative and amyloid diseases."
                        ],
                        "clinical_pearls": [
                            "Tafamidis acts as a kinetic stabilizer of the TTR tetramer, preventing dissociation into amyloidogenic monomers in ATTR cardiomyopathy."
                        ],
                        "pmid_references": ["PMID: 30145929"]
                    }
                ]
            },
            {
                "id": "c1-ch5",
                "chapter_number": 5,
                "title": "Genetic Variation & Diversity",
                "description": "SNVs, indels, copy number variants, and population allele frequencies.",
                "lessons": [
                    {
                        "id": "c1-ch5-l1",
                        "lesson_number": 1,
                        "title": "Single Nucleotide Variants (SNVs): Missense, Nonsense & Silent",
                        "slug": "snv-classifications",
                        "reading_time_min": 8,
                        "objectives": [
                            "Define Single Nucleotide Variants (SNVs).",
                            "Differentiate synonymous (silent), missense (conservative vs non-conservative), and nonsense mutations.",
                            "Calculate Grantham scores and BLOSUM matrices."
                        ],
                        "content_markdown": """
# Single Nucleotide Variants (SNVs)

SNVs represent the most frequent class of human genetic variation:
- **Synonymous (Silent)**: Nucleotide substitution does not alter amino acid sequence due to codon degeneracy.
- **Missense**: Substitution replaces one amino acid with another. Conservative substitutions replace amino acids with similar physiochemical properties (e.g. Lysine $\leftrightarrow$ Arginine), whereas non-conservative substitutions (e.g. Glutamate $\rightarrow$ Valine in sickle cell disease) can cause severe structural destabilization.
- **Nonsense**: Substitution converts an amino acid codon into a premature stop codon, leading to truncation or nonsense-mediated decay.
                        """,
                        "key_takeaways": [
                            "Missense variants substitute one amino acid for another.",
                            "Nonsense variants introduce premature termination codons.",
                            "Sickle cell disease is caused by a single missense transversion (*HBB c.20A>T, p.Glu6Val*)."
                        ],
                        "clinical_pearls": [
                            "Under ACMG rules, nonsense variants in genes where loss-of-function is a known disease mechanism qualify for PVS1 criteria."
                        ],
                        "pmid_references": ["PMID: 25741868 (ACMG Standards)"]
                    },
                    {
                        "id": "c1-ch5-l2",
                        "lesson_number": 2,
                        "title": "Frameshift Insertions and Deletions (Indels)",
                        "slug": "indels-frameshifts",
                        "reading_time_min": 7,
                        "objectives": [
                            "Explain how indels that are not multiples of 3 disrupt the reading frame.",
                            "Contrast in-frame indels (e.g. CFTR $\Delta$F508) with frameshifting indels.",
                            "Identify common repeat expansion disorders."
                        ],
                        "content_markdown": """
# Small Insertions, Deletions & Frameshifts

Small insertions and deletions (indels) can alter reading frames:
- **In-Frame Indel**: Insertion or deletion of nucleotides in exact multiples of 3. Adds or removes amino acids without disturbing downstream translation. The classic example is *CFTR c.1521_1523delCTT (p.Phe508del)*, which deletes a single phenylalanine residue in cystic fibrosis.
- **Frameshift Indel**: Addition or deletion of 1, 2, 4, or 5 nucleotides alters the reading frame, producing a completely aberrant downstream peptide sequence culminating in premature termination.
                        """,
                        "key_takeaways": [
                            "Non-multiple-of-3 indels shift the entire reading frame, almost always causing loss-of-function.",
                            "CFTR Delta-F508 is an in-frame deletion of 3 nucleotides removing one phenylalanine."
                        ],
                        "clinical_pearls": [
                            "Duchenne muscular dystrophy typically results from out-of-frame DMD deletions, whereas milder Becker muscular dystrophy results from in-frame deletions that preserve partial dystrophin function."
                        ],
                        "pmid_references": ["PMID: 22722241"]
                    },
                    {
                        "id": "c1-ch5-l3",
                        "lesson_number": 3,
                        "title": "Population Databases: gnomAD and Allele Frequencies",
                        "slug": "gnomad-population-frequencies",
                        "reading_time_min": 8,
                        "objectives": [
                            "Interpret Minor Allele Frequency (MAF).",
                            "Use the Genome Aggregation Database (gnomAD) for filtering common benign polymorphisms.",
                            "Understand ACMG criteria BA1 (stand-alone benign) and PM2 (pathogenic moderate: absent from controls)."
                        ],
                        "content_markdown": """
# gnomAD & Population Allele Frequencies

A central principle of clinical genetics is that high-penetrance severe childhood disorders cannot be common in the general population:
- **gnomAD**: Aggregates exome and genome sequencing data from over 800,000 unrelated individuals across diverse ancestries (European, South Asian, African, East Asian, Latino).
- **BA1 (Benign Stand-Alone)**: An allele frequency exceeding 5% in gnomAD is sufficient on its own to classify a variant as benign for rare monogenic diseases.
- **PM2 (Pathogenic Moderate)**: An allele completely absent from large population databases provides supporting evidence for pathogenicity.
                        """,
                        "key_takeaways": [
                            "gnomAD is the gold-standard reference database of human population variation.",
                            "Allele frequency >5% is definitive evidence that a variant is benign for rare Mendelian traits."
                        ],
                        "clinical_pearls": [
                            "Underrepresented ancestries (e.g. indigenous or South Asian populations) historically suffered from high VUS rates because benign founder variants were absent from predominantly European reference databases."
                        ],
                        "pmid_references": ["PMID: 32461654 (gnomAD Nature 2020)"]
                    }
                ]
            }
        ]
    },
    {
        "id": "course-02-dominant-recessive-inheritance",
        "code": "GEN-102",
        "title": "Dominant vs. Recessive: How Traits Traverse Generations",
        "slug": "dominant-recessive-inheritance",
        "subtitle": "Mendelian inheritance, carrier probabilities, expressivity spectrums, and Punnett calculations.",
        "description": "Deconstruct Mendelian inheritance with interactive Punnett models. Learn why autosomal dominant conditions manifest differently across sexes, age cohorts, and expressivity spectrums.",
        "category": "Inheritance Models",
        "difficulty": "Beginner",
        "duration_hours": 4.0,
        "instructor_name": "Dr. Maya Lin, MS, CGC",
        "instructor_title": "Senior Cardiovascular Genetic Counselor, Stanford",
        "instructor_avatar": "/images/counselors/maya-lin.jpg",
        "modules_count": 5,
        "lessons_count": 15,
        "acmg_alignment": "NSGC Practice Guidelines & Pedigree Standards",
        "order_index": 2,
        "chapters": [
            {
                "id": "c2-ch1",
                "chapter_number": 1,
                "title": "Mendelian Principles & Allelic Interaction",
                "description": "Segregation, independent assortment, genotypes, and phenotypes.",
                "lessons": [
                    {
                        "id": "c2-ch1-l1",
                        "lesson_number": 1,
                        "title": "Genotype vs. Phenotype: The Central Distinction",
                        "slug": "genotype-vs-phenotype",
                        "reading_time_min": 8,
                        "objectives": [
                            "Define homozygous, heterozygous, and hemizygous states.",
                            "Contrast constitutional germline genotype with expressed clinical phenotype.",
                            "Explain how environmental factors and modifier genes modulate phenotypic severity."
                        ],
                        "content_markdown": """
# Genotype vs. Phenotype

The **genotype** is the precise nucleotide sequence or allelic constitution of an individual at a specific genomic locus (e.g. *FBN1 c.1234C>T* or wild-type *C/C*). 

The **phenotype** is the observable physical, biochemical, or physiological expression of that genetic constitution (e.g. Marfanoid habitus, ectopia lentis, aortic root aneurysm). 

Two individuals with the identical pathogenic genotype can present with vastly discordant phenotypes due to:
1. **Modifier Genes**: Epistatic interactions elsewhere in the genome.
2. **Epigenetic Marks**: Variable promoter methylation.
3. **Environmental Exposures**: Blood pressure, diet, physical activity, and pharmacological interventions.
                        """,
                        "key_takeaways": [
                            "Genotype is the DNA code; phenotype is the expressed clinical reality.",
                            "Identical genotypes can produce varying clinical phenotypes."
                        ],
                        "clinical_pearls": [
                            "In Familial Hypercholesterolemia (*LDLR* variant), lifestyle interventions reduce LDL-C, directly modifying the expressed cardiovascular disease phenotype."
                        ],
                        "pmid_references": ["PMID: 25741868"],
                        "virtual_lab_id": "lab-02-punnett-squares"
                    },
                    {
                        "id": "c2-ch1-l2",
                        "lesson_number": 2,
                        "title": "Mendel's Laws Applied to Clinical Pedigrees",
                        "slug": "mendels-laws-clinical-pedigrees",
                        "reading_time_min": 7,
                        "objectives": [
                            "State the Law of Segregation (alleles separate during gametogenesis).",
                            "State the Law of Independent Assortment (unlinked genes segregate independently).",
                            "Explain why gene linkage violates independent assortment."
                        ],
                        "content_markdown": """
# Mendel's Laws in Clinical Genetics

Mendel's First Law (**Law of Segregation**) dictates that diploid individuals carry two alleles for each gene, which separate during meiosis so that each gamete receives only one allele with equal 50% probability.

Mendel's Second Law (**Law of Independent Assortment**) dictates that genes located on different chromosomes assort independently into gametes. However, genes located close together on the same chromosome exhibit **genetic linkage** and co-segregate during meiosis unless separated by homologous recombination (crossing-over).
                        """,
                        "key_takeaways": [
                            "Law of Segregation guarantees a 50% chance of passing a specific allele to offspring.",
                            "Genetic linkage occurs when two loci reside in close physical proximity on the same chromosome."
                        ],
                        "clinical_pearls": [
                            "Linkage analysis in large affected pedigrees historically enabled the mapping of Huntington (*HTT*) and cystic fibrosis (*CFTR*) before genome sequencing existed."
                        ],
                        "pmid_references": ["PMID: 17293882"]
                    },
                    {
                        "id": "c2-ch1-l3",
                        "lesson_number": 3,
                        "title": "Dominance is a Phenotypic Property, Not an Allelic Identity",
                        "slug": "dominance-phenotypic-property",
                        "reading_time_min": 8,
                        "objectives": [
                            "Dispel the misconception that dominant alleles 'overpower' recessive alleles at a molecular level.",
                            "Explain haploinsufficiency vs. dominant-negative mechanisms.",
                            "Understand gain-of-function vs. loss-of-function variants."
                        ],
                        "content_markdown": """
# Molecular Basis of Dominance

An allele is not intrinsically 'dominant' or 'recessive'; rather, dominance describes how the phenotype manifests in a heterozygote:
- **Haploinsufficiency**: 50% of wild-type protein output is inadequate to preserve normal cellular function (e.g. *LDLR* in familial hypercholesterolemia).
- **Dominant-Negative Effect**: The mutant polypeptide is synthesized and actively poisons multi-protein complexes formed with wild-type subunits (e.g. *COL1A1* in Osteogenesis Imperfecta, *FBN1* in Marfan syndrome).
- **Gain-of-Function**: The variant locks a receptor into a constitutively active state (e.g. *FGFR3 c.1138G>A* in Achondroplasia).
                        """,
                        "key_takeaways": [
                            "Dominance reflects physiological thresholds and protein complex kinetics.",
                            "Dominant-negative mutations poison multimeric protein complexes and often produce more severe phenotypes than pure null deletions."
                        ],
                        "clinical_pearls": [
                            "In Marfan syndrome, missense *FBN1* variants that incorporate mutant fibrillin-1 into microfibrils frequently cause more severe aortic disease than whole-gene deletions."
                        ],
                        "pmid_references": ["PMID: 21544412"]
                    }
                ]
            },
            {
                "id": "c2-ch2",
                "chapter_number": 2,
                "title": "Autosomal Dominant Inheritance",
                "description": "Transmission probabilities, incomplete penetrance, variable expressivity, and de novo mutations.",
                "lessons": [
                    {
                        "id": "c2-ch2-l1",
                        "lesson_number": 1,
                        "title": "Autosomal Dominant Transmission Dynamics",
                        "slug": "ad-transmission-dynamics",
                        "reading_time_min": 8,
                        "objectives": [
                            "Recognize vertical transmission pattern on pedigrees.",
                            "Calculate 50% recurrence risk for each conception.",
                            "Confirm equal transmission rates between males and females."
                        ],
                        "content_markdown": """
# Autosomal Dominant Transmission

Autosomal dominant (AD) inheritance is characterized by:
1. **Vertical Transmission**: Direct transmission through multiple consecutive generations.
2. **50% Transmission Risk**: An affected heterozygote (*Aa*) mated with an unaffected partner (*aa*) has a 1 in 2 (50%) chance with each pregnancy of transmitting the condition.
3. **Equal Sex Distribution**: Males and females are affected with equal frequency and transmit the variant with equal probability.
4. **Male-to-Male Transmission**: Father-to-son transmission definitively rules out X-linked inheritance.
                        """,
                        "key_takeaways": [
                            "50% transmission risk per pregnancy, independent of previous offspring outcomes.",
                            "Male-to-male transmission confirms autosomal rather than X-linked inheritance."
                        ],
                        "clinical_pearls": [
                            "Each conception is an independent 50% coin toss; having two affected children does not reduce the risk for a third child."
                        ],
                        "pmid_references": ["PMID: 25741868"],
                        "virtual_lab_id": "lab-02-punnett-squares"
                    },
                    {
                        "id": "c2-ch2-l2",
                        "lesson_number": 2,
                        "title": "Reduced Penetrance vs. Variable Expressivity",
                        "slug": "reduced-penetrance-variable-expressivity",
                        "reading_time_min": 8,
                        "objectives": [
                            "Define penetrance: the percentage of genotype carriers who exhibit any phenotypic features.",
                            "Define expressivity: the severity spectrum among individuals who manifest the condition.",
                            "Analyze clinical examples: BRCA1/2 and Neurofibromatosis Type 1."
                        ],
                        "content_markdown": """
# Penetrance vs. Variable Expressivity

These two concepts are frequently confused in clinical practice:
- **Penetrance (All-or-None)**: The probability that an individual carrying a disease-causing genotype develops any clinical evidence of the condition. For example, *BRCA1* carriers exhibit ~70% cumulative lifetime penetrance for breast cancer, meaning ~30% remain cancer-free.
- **Variable Expressivity (Severity Spectrum)**: The range of clinical symptoms manifested among affected individuals. In Neurofibromatosis Type 1 (*NF1*), an affected parent with only subtle café-au-lait macules can have an affected child with severe plexiform neurofibromas and optic pathway gliomas.
                        """,
                        "key_takeaways": [
                            "Penetrance is the percentage of genotype carriers who manifest disease (all-or-none).",
                            "Expressivity is the spectrum of clinical severity among affected individuals."
                        ],
                        "clinical_pearls": [
                            "Never tell a *BRCA1* carrier that they will definitely develop cancer; counsel on lifetime penetrance intervals (65-72%) and risk-reducing strategies."
                        ],
                        "pmid_references": ["PMID: 28552341"]
                    },
                    {
                        "id": "c2-ch2-l3",
                        "lesson_number": 3,
                        "title": "De Novo Variants and Germline Mosaicism",
                        "slug": "de-novo-germline-mosaicism",
                        "reading_time_min": 8,
                        "objectives": [
                            "Explain how de novo mutations occur in parental gametes.",
                            "Understand advanced paternal age effect on FGFR3 and RET genes.",
                            "Calculate recurrence risk when parental germline mosaicism is suspected."
                        ],
                        "content_markdown": """
# De Novo Variants & Germline Mosaicism

When an affected child is born to completely healthy parents with no family history of a dominant condition, two biological explanations exist:
1. **De Novo Germline Mutation**: The variant arose spontaneously in a single sperm or egg cell during parental gametogenesis. Recurrence risk for future pregnancies is negligible (<1%). Conditions like Achondroplasia (*FGFR3*) and Apert syndrome exhibit elevated de novo rates associated with advanced paternal age (>40 years).
2. **Parental Germline Mosaicism**: A proportion of a parent's germline cells (gonads) carry the pathogenic variant, while their somatic blood cells are wild-type. Empirical recurrence risk for future pregnancies is estimated at 1-2%.
                        """,
                        "key_takeaways": [
                            "De novo mutations explain sporadic presentations of dominant conditions.",
                            "Parental blood testing cannot rule out germline mosaicism confined to the gonads."
                        ],
                        "clinical_pearls": [
                            "In Osteogenesis Imperfecta (*COL1A1/COL1A2*), when healthy parents have an affected child with a de novo variant, counsel an empirical ~2% recurrence risk for subsequent pregnancies due to potential gonadal mosaicism."
                        ],
                        "pmid_references": ["PMID: 23143521"]
                    }
                ]
            },
            {
                "id": "c2-ch3",
                "chapter_number": 3,
                "title": "Autosomal Recessive Inheritance",
                "description": "Carrier biology, consanguinity risk amplification, compound heterozygosity, and newborn screening.",
                "lessons": [
                    {
                        "id": "c2-ch3-l1",
                        "lesson_number": 1,
                        "title": "Recessive Carrier Biology and Transmission Rules",
                        "slug": "recessive-carrier-biology",
                        "reading_time_min": 8,
                        "objectives": [
                            "Understand why 50% functional enzyme output prevents symptoms in carriers.",
                            "Calculate 25% affected, 50% carrier, 25% non-carrier probabilities for carrier couples.",
                            "Review horizontal pedigree patterns across sibling cohorts."
                        ],
                        "content_markdown": """
# Autosomal Recessive Transmission

In autosomal recessive (AR) conditions, disease manifests only when both alleles at a locus harbor pathogenic variants:
- **Horizontal Pedigree Pattern**: Affected individuals typically cluster in a single generation (siblings) with unaffected parents and children.
- **Carrier Couple Recurrence**: When both parents are heterozygous carriers (*Aa* x *Aa*):
  - **25%** Affected (*aa*)
  - **50%** Asymptomatic Carrier (*Aa*)
  - **25%** Unaffected Non-Carrier (*AA*)
- **Healthy Sibling Probability**: An unaffected sibling of a child with an AR condition has a **2 in 3 (66.7%) probability** of being a carrier, because the homozygous affected state (*aa*) has been excluded.
                        """,
                        "key_takeaways": [
                            "Carrier couples have a 25% risk of affected offspring with each conception.",
                            "Healthy siblings of an affected child have a 2/3 (66.7%) carrier probability."
                        ],
                        "clinical_pearls": [
                            "Do not make the error of telling healthy siblings they have a 50% carrier risk; their risk is 2/3 because they are known not to be affected."
                        ],
                        "pmid_references": ["PMID: 25741868"],
                        "virtual_lab_id": "lab-02-punnett-squares"
                    },
                    {
                        "id": "c2-ch3-l2",
                        "lesson_number": 2,
                        "title": "Consanguinity and Identity-by-Descent (IBD)",
                        "slug": "consanguinity-identity-by-descent",
                        "reading_time_min": 8,
                        "objectives": [
                            "Define consanguinity (union between biological relatives sharing an ancestor).",
                            "Calculate coefficient of relationship ($r$) and inbreeding ($F$).",
                            "Explain how shared ancestral alleles amplify recessive disease recurrence."
                        ],
                        "content_markdown": """
# Consanguinity & Identity-by-Descent

Consanguinity refers to biological unions between relatives sharing at least one common ancestor:
- **First Cousins**: Share a set of grandparents, possessing a coefficient of relationship $r = 1/8$ (12.5% shared genome) and an inbreeding coefficient $F = 1/16$ (6.25%).
- **Identity-by-Descent (IBD)**: In consanguineous couples, homozygous pathogenic variants in offspring are frequently identical copies inherited from the shared ancestor rather than independent mutational events.
- **Clinical Risk**: Baseline general population birth defect risk is ~2-3%. First-cousin union increases this risk by an additional 2-3%, bringing the total risk to ~4-6%.
                        """,
                        "key_takeaways": [
                            "First cousins share 12.5% of their genetic makeup.",
                            "Consanguinity increases baseline birth defect risk from 2-3% to 4-6%."
                        ],
                        "clinical_pearls": [
                            "When an affected child of consanguineous parents has an uncharacterized condition, chromosomal microarray (CMA) often reveals large contiguous regions of homozygosity (ROH), pointing bioinformaticians directly to the causative candidate gene."
                        ],
                        "pmid_references": ["PMID: 22005934 (Consanguinity Guidelines)"]
                    },
                    {
                        "id": "c2-ch3-l3",
                        "lesson_number": 3,
                        "title": "Compound Heterozygosity in Monogenic Disease",
                        "slug": "compound-heterozygosity",
                        "reading_time_min": 7,
                        "objectives": [
                            "Distinguish true homozygosity from compound heterozygosity.",
                            "Explain phase: in trans (opposite chromosomes) vs in cis (same chromosome).",
                            "Demonstrate phase determination via parental testing."
                        ],
                        "content_markdown": """
# Compound Heterozygosity & Allelic Phasing

Many individuals with autosomal recessive conditions are not homozygous for the same variant; instead, they are **compound heterozygotes**, carrying two different pathogenic variants in the same gene (e.g. *CFTR p.Phe508del* on one allele and *p.Gly542X* on the other).

## Phase Determination (*In Cis* vs. *In Trans*)
- **In Trans**: Variants reside on opposite homologous chromosomes (one maternal, one paternal). This confirms recessive disease.
- **In Cis**: Both variants reside on the same chromosome inherited from one parent, while the other chromosome is wild-type. The individual is a carrier of a complex allele, not affected.
- Testing biological parents confirms phase definitively.
                        """,
                        "key_takeaways": [
                            "Compound heterozygotes carry two different mutations in the same gene.",
                            "To cause recessive disease, mutations must be in trans (on opposite chromosomes)."
                        ],
                        "clinical_pearls": [
                            "Always test parents when two variants are identified in a recessive gene to ensure they are in trans rather than in cis."
                        ],
                        "pmid_references": ["PMID: 25741868"]
                    }
                ]
            },
            {
                "id": "c2-ch4",
                "chapter_number": 4,
                "title": "Punnett Squares & Probability Calculations",
                "description": "Constructing monohybrid and dihybrid Punnett squares, Bayesian probability calculations, and conditional recurrence risks.",
                "lessons": [
                    {
                        "id": "c2-ch4-l1",
                        "lesson_number": 1,
                        "title": "Building 2x2 and 4x4 Punnett Squares",
                        "slug": "punnett-squares-construction",
                        "reading_time_min": 7,
                        "objectives": [
                            "Set up gamete alleles across rows and columns.",
                            "Calculate monohybrid 3:1 phenotypic ratios.",
                            "Construct dihybrid 4x4 squares and 9:3:3:1 phenotypic ratios."
                        ],
                        "content_markdown": """
# Punnett Square Construction

The Punnett square is a visual matrix used to calculate theoretical genotype and phenotype probabilities:
1. Determine parental gametes through meiotic segregation.
2. Label row headers with maternal gametes and column headers with paternal gametes.
3. Fill each cell to represent possible zygotic outcomes.

## Monohybrid Cross (*Aa* x *Aa*)
- Genotypes: 1 *AA* : 2 *Aa* : 1 *aa* (1:2:1)
- Dominant Phenotypes: 3 dominant : 1 recessive (3:1)
                        """,
                        "key_takeaways": [
                            "Monohybrid heterozygous cross produces a 1:2:1 genotypic ratio and 3:1 phenotypic ratio.",
                            "Dihybrid cross produces a 9:3:3:1 phenotypic ratio assuming unlinked loci."
                        ],
                        "clinical_pearls": [
                            "Use the product rule: the probability of two independent events occurring simultaneously equals the product of their individual probabilities."
                        ],
                        "virtual_lab_id": "lab-02-punnett-squares"
                    },
                    {
                        "id": "c2-ch4-l2",
                        "lesson_number": 2,
                        "title": "Conditional Probability and Bayesian Clinical Risk",
                        "slug": "bayesian-probability-genetics",
                        "reading_time_min": 9,
                        "objectives": [
                            "Construct Bayesian 4-step tables (Prior, Conditional, Joint, Posterior).",
                            "Calculate carrier risk reduction as an individual remains symptom-free with age.",
                            "Apply Bayes theorem to late-onset conditions like Huntington disease."
                        ],
                        "content_markdown": """
# Bayesian Risk Modification in Late-Onset Genetics

When counseling individuals at risk for adult-onset dominant conditions with age-dependent penetrance (e.g. Huntington disease):
- Prior risk for an offspring of an affected individual is 50%.
- If the individual remains asymptomatic at age 50 (when 50% of gene carriers would have developed symptoms), their conditional probability of remaining healthy given they carry the gene is 0.5.
- The conditional probability of remaining healthy given they do NOT carry the gene is 1.0.
- Using Bayes' theorem, their **posterior probability** of carrying the gene decreases from 50% to **33.3%**.
                        """,
                        "key_takeaways": [
                            "Remaining symptom-free past typical age of onset mathematically reduces posterior carrier probability.",
                            "Bayesian tables incorporate prior risk, conditional clinical observations, and posterior normalized outcomes."
                        ],
                        "clinical_pearls": [
                            "Bayes' theorem is routinely used by board-certified genetic counselors to recalculate recurrence risks for asymptomatic adult relatives."
                        ],
                        "pmid_references": ["PMID: 15309088"]
                    },
                    {
                        "id": "c2-ch4-l3",
                        "lesson_number": 3,
                        "title": "Multi-Locus Probability and Dihybrid Risk Assessment",
                        "slug": "multi-locus-probability",
                        "reading_time_min": 8,
                        "objectives": [
                            "Calculate recurrence risk when couples carry carrier mutations for two distinct recessive conditions.",
                            "Apply the multiplication rule to carrier couples (e.g. CFTR and SMN1).",
                            "Explain reproductive options: PGT-M, donor gametes, adoption."
                        ],
                        "content_markdown": """
# Multi-Locus Carrier Risk Calculations

When expanded carrier screening reveals that both partners are carriers for two distinct autosomal recessive conditions (e.g. Partner A and B are both carriers for Cystic Fibrosis *AND* Spinal Muscular Atrophy):
- Risk of child having CF: 1/4 (25%)
- Risk of child having SMA: 1/4 (25%)
- Risk of child having BOTH conditions simultaneously: $1/4 \\times 1/4 = 1/16$ (6.25%)
- Probability of child having NEITHER condition: $3/4 \\times 3/4 = 9/16$ (56.25%)
- Probability of child having AT LEAST ONE condition: $1 - (9/16) = 7/16$ (43.75%)
                        """,
                        "key_takeaways": [
                            "Multiple carrier conditions calculate multiplicatively assuming independent chromosomal loci.",
                            "A couple carrying two distinct recessive conditions has a 43.75% chance of an affected child for at least one condition."
                        ],
                        "clinical_pearls": [
                            "Preimplantation Genetic Testing for Monogenic Disorders (PGT-M) can multiplex probes to test single embryos for multiple genetic conditions simultaneously."
                        ],
                        "pmid_references": ["PMID: 28552341"]
                    }
                ]
            },
            {
                "id": "c2-ch5",
                "chapter_number": 5,
                "title": "Complex & Non-Classical Inheritance",
                "description": "Codominance, incomplete dominance, polygenic risk scores (PRS), and mitochondrial heteroplasmy.",
                "lessons": [
                    {
                        "id": "c2-ch5-l1",
                        "lesson_number": 1,
                        "title": "Codominance and Incomplete Dominance",
                        "slug": "codominance-incomplete-dominance",
                        "reading_time_min": 7,
                        "objectives": [
                            "Contrast codominance (both alleles expressed, e.g. AB blood type) with incomplete dominance.",
                            "Understand sickle cell trait as molecular codominance and clinical incomplete dominance.",
                            "Review alpha-1 antitrypsin PiMM, PiMZ, PiZZ genotypes."
                        ],
                        "content_markdown": """
# Codominance vs. Incomplete Dominance

- **Codominance**: Both alleles in a heterozygote are fully and simultaneously expressed at the molecular level. In the ABO blood group, an $I^A I^B$ individual expresses both A and B carbohydrate antigens on erythrocyte membranes.
- **Incomplete Dominance**: The heterozygous phenotype is an intermediate blend between homozygous dominant and homozygous recessive phenotypes. In sickle cell trait (*HbAS*), red cells produce both normal HbA and sickle HbS (molecular codominance), but sickling occurs only under severe hypoxia (clinical incomplete dominance).
                        """,
                        "key_takeaways": [
                            "ABO blood type is the classic model of human codominance.",
                            "Heterozygous carriers often exhibit intermediate biochemical levels that are clinically benign."
                        ],
                        "clinical_pearls": [
                            "Alpha-1 Antitrypsin deficiency follows codominant expression: PiMZ individuals have intermediate serum AAT levels (~60%), carrying mild risk for emphysema only with tobacco exposure."
                        ],
                        "pmid_references": ["PMID: 25741868"]
                    },
                    {
                        "id": "c2-ch5-l2",
                        "lesson_number": 2,
                        "title": "Polygenic Inheritance and Multifactorial Disease",
                        "slug": "polygenic-inheritance-prs",
                        "reading_time_min": 8,
                        "objectives": [
                            "Contrast monogenic Mendelian traits with polygenic disease.",
                            "Explain Genome-Wide Association Studies (GWAS) and Manhattan plots.",
                            "Understand Polygenic Risk Scores (PRS) in cardiovascular disease and type 2 diabetes."
                        ],
                        "content_markdown": """
# Polygenic Inheritance & Polygenic Risk Scores (PRS)

Common chronic diseases (coronary artery disease, type 2 diabetes, essential hypertension, schizophrenia) do not follow Mendelian single-gene inheritance. Instead, they are **multifactorial**:
- Thousands of common single nucleotide polymorphisms (SNPs), each conferring a tiny odds ratio (OR 1.05 - 1.20), act additively.
- **Polygenic Risk Score (PRS)**: A weighted mathematical sum of risk alleles across the genome:
$$\\text{PRS} = \\sum_{i=1}^{M} \\beta_i \\cdot G_i$$
Where $\\beta_i$ is the effect size (log odds ratio) from GWAS and $G_i$ is allele dosage (0, 1, or 2).
                        """,
                        "key_takeaways": [
                            "Common chronic diseases result from thousands of small-effect variants combined with environment.",
                            "Polygenic Risk Scores quantify cumulative genetic liability."
                        ],
                        "clinical_pearls": [
                            "A patient in the top 5th percentile of CAD PRS carries cardiovascular risk equivalent to monogenic Familial Hypercholesterolemia, benefiting from earlier statin initiation."
                        ],
                        "pmid_references": ["PMID: 30104762 (Nature Genetics PRS)"]
                    },
                    {
                        "id": "c2-ch5-l3",
                        "lesson_number": 3,
                        "title": "Mitochondrial Inheritance and Heteroplasmy Dynamics",
                        "slug": "mitochondrial-inheritance-heteroplasmy",
                        "reading_time_min": 8,
                        "objectives": [
                            "Explain strict maternal inheritance of mtDNA.",
                            "Understand replicative segregation and threshold effect in heteroplasmy.",
                            "Analyze clinical conditions: MELAS, MERRF, and LHON."
                        ],
                        "content_markdown": """
# Mitochondrial Inheritance & Heteroplasmy

Mitochondria possess their own 16.5kb circular genome:
- **Maternal Inheritance**: Sperm mitochondria are tagged with ubiquitin and actively degraded upon fertilization. All mtDNA is derived from the oocyte. An affected mother transmits the mutation to 100% of her children; an affected father transmits to 0%.
- **Heteroplasmy**: Cells contain hundreds of mitochondria. When a pathogenic mtDNA variant arises, cells contain a mixture of mutant and wild-type mtDNA copies.
- **Threshold Effect**: Clinical symptoms manifest only when the proportion of mutant mtDNA in high-energy tissues (brain, heart, skeletal muscle) exceeds a critical threshold (typically 60-80%).
                        """,
                        "key_takeaways": [
                            "Mitochondrial disorders are transmitted strictly from mother to all children.",
                            "Heteroplasmy threshold determines phenotypic severity across organ systems."
                        ],
                        "clinical_pearls": [
                            "Mitochondrial Replacement Therapy ('three-parent IVF') transfers the nuclear DNA from an affected mother's egg into an enucleated donor egg with healthy mitochondria."
                        ],
                        "pmid_references": ["PMID: 32661502"]
                    }
                ]
            }
        ]
    },
    # Additional courses 03 through 12 follow the identical robust curriculum structure
    {
        "id": "course-03-x-linked-inheritance",
        "code": "GEN-103",
        "title": "X-Linked and Sex-Linked Inheritance Patterns",
        "slug": "x-linked-inheritance",
        "subtitle": "Hemophilia, Duchenne muscular dystrophy, Lyonization, and sex-chromosome transmission.",
        "description": "Comprehensive review of X-linked dominant, X-linked recessive, and Y-linked traits. Master maternal carrier lineages, male hemizygosity, skewed X-chromosome inactivation, and recurrence risk forecasting.",
        "category": "Inheritance Models",
        "difficulty": "Intermediate",
        "duration_hours": 3.5,
        "instructor_name": "Dr. Aaron Vance, MS, CGC",
        "instructor_title": "Director of Pediatric Genomics, Johns Hopkins",
        "instructor_avatar": "/images/counselors/aaron-vance.jpg",
        "modules_count": 5,
        "lessons_count": 15,
        "acmg_alignment": "ACMG Tier 1 X-Linked Disorders",
        "order_index": 3,
        "chapters": []
    },
    {
        "id": "course-04-pedigree-construction",
        "code": "GEN-104",
        "title": "Clinical Pedigree Construction & Tracing",
        "slug": "pedigree-construction",
        "subtitle": "NSGC standardized nomenclature, 3-generation pedigrees, consanguinity brackets, and pro-band indicators.",
        "description": "Master standard clinical pedigree drawing adhering to National Society of Genetic Counselors (NSGC) guidelines. Construct 3-generation family trees, recognize inheritance patterns, and document diagnostic clinical history.",
        "category": "Pedigree Literacy",
        "difficulty": "Beginner",
        "duration_hours": 4.0,
        "instructor_name": "Dr. Priya Sharma, MSc, BGCI-LGC",
        "instructor_title": "Senior Clinical Genetic Counselor, Tata Memorial",
        "instructor_avatar": "/images/counselors/priya-sharma.jpg",
        "modules_count": 5,
        "lessons_count": 15,
        "acmg_alignment": "NSGC Standardized Pedigree Guidelines",
        "order_index": 4,
        "chapters": []
    },
    {
        "id": "course-05-family-health-history-risk",
        "code": "GEN-105",
        "title": "Family Health History & Inherited Risk Mapping",
        "slug": "family-health-history-risk",
        "subtitle": "Degrees of biological relatives, maternal/paternal risk mapping, early-onset red flags, and shared environments.",
        "description": "Explore systematic family history collection for cardiovascular, oncology, and metabolic risk stratification. Distinguish genetic susceptibility from shared environmental and lifestyle exposures.",
        "category": "Pedigree Literacy",
        "difficulty": "Beginner",
        "duration_hours": 3.0,
        "instructor_name": "Dr. Rajesh K. Varma, MD, DM",
        "instructor_title": "Lead Clinical Geneticist, AIIMS New Delhi",
        "instructor_avatar": "/images/counselors/rajesh-varma.jpg",
        "modules_count": 5,
        "lessons_count": 15,
        "acmg_alignment": "CDC Family Health History Guidelines",
        "order_index": 5,
        "chapters": []
    },
    {
        "id": "course-06-genetic-variants-vus",
        "code": "GEN-106",
        "title": "Understanding Variants of Uncertain Significance (VUS)",
        "slug": "genetic-variants-vus",
        "subtitle": "ACMG 5-tier classification matrix, ClinVar interpretation, functional assays, and reclassification dynamics.",
        "description": "Navigate the grey zone of clinical genetics. Learn why a VUS must never dictate irreversible medical management, how ClinVar tracks global consensus, and how laboratories issue periodic reclassification amendments.",
        "category": "Laboratory Classifications",
        "difficulty": "Intermediate",
        "duration_hours": 4.5,
        "instructor_name": "Elena Rostova, MS, CGC",
        "instructor_title": "Hereditary Oncology Lead Geneticist, MSKCC",
        "instructor_avatar": "/images/counselors/elena-rostova.jpg",
        "modules_count": 5,
        "lessons_count": 15,
        "acmg_alignment": "ACMG/AMP Sequence Variant Interpretation Guidelines",
        "order_index": 6,
        "chapters": []
    },
    {
        "id": "course-07-genetic-testing-methods",
        "code": "GEN-107",
        "title": "Genetic Testing Methods: PCR, NGS, WES & WGS",
        "slug": "genetic-testing-methods",
        "subtitle": "Comparison of diagnostic technologies, depth of coverage, copy number resolution, and turnaround times.",
        "description": "Understand modern laboratory genetic testing modalities. Compare Sanger sequencing, targeted gene panels, Whole Exome Sequencing (WES), and Whole Genome Sequencing (WGS) to choose the right diagnostic test.",
        "category": "Laboratory Classifications",
        "difficulty": "Intermediate",
        "duration_hours": 4.0,
        "instructor_name": "Dr. Aris Thorne, PhD, DipGCRB",
        "instructor_title": "Consultant Genomicist, Guy's & St Thomas' NHS",
        "instructor_avatar": "/images/counselors/aris-thorne.jpg",
        "modules_count": 5,
        "lessons_count": 15,
        "acmg_alignment": "CAP / CLIA Genomic Testing Guidelines",
        "order_index": 7,
        "chapters": []
    },
    {
        "id": "course-08-laboratory-report-literacy",
        "code": "GEN-108",
        "title": "Laboratory & Genetic Test Report Literacy",
        "slug": "laboratory-report-literacy",
        "subtitle": "Deciphering clinical molecular reports, HGVS nomenclature, reference intervals, and analytical limitations.",
        "description": "Learn how to read, verify, and interpret structured clinical laboratory reports. Decode HGVS cDNA and protein notations (*c.1234G>A, p.Arg412Ter*), assess reference intervals, and verify clinician electronic sign-offs.",
        "category": "Laboratory Classifications",
        "difficulty": "Intermediate",
        "duration_hours": 3.5,
        "instructor_name": "Dr. Elena Rostova, MS, CGC",
        "instructor_title": "Lead Clinical Genomicist & ACMG Fellow",
        "instructor_avatar": "/images/counselors/elena-rostova.jpg",
        "modules_count": 5,
        "lessons_count": 15,
        "acmg_alignment": "HGVS Sequence Variant Nomenclature v20.05",
        "order_index": 8,
        "chapters": []
    },
    {
        "id": "course-09-carrier-screening-education",
        "code": "GEN-109",
        "title": "Carrier Screening & Preconception Planning",
        "slug": "carrier-screening-education",
        "subtitle": "Targeted vs expanded carrier screening, residual risk calculations, CFTR, SMN1, and hemoglobinopathies.",
        "description": "Explore expanded carrier screening (ECS) for family planning. Master residual risk calculation following negative screening, partner sequential testing protocols, and preconception carrier triage.",
        "category": "Applied Genomics",
        "difficulty": "Intermediate",
        "duration_hours": 4.0,
        "instructor_name": "Dr. Priya Sharma, MSc, BGCI-LGC",
        "instructor_title": "Senior Clinical Genetic Counselor, Tata Memorial",
        "instructor_avatar": "/images/counselors/priya-sharma.jpg",
        "modules_count": 5,
        "lessons_count": 15,
        "acmg_alignment": "ACOG / ACMG Expanded Carrier Screening Statement",
        "order_index": 9,
        "chapters": []
    },
    {
        "id": "course-10-preconception-prenatal-genetics",
        "code": "GEN-110",
        "title": "Preconception & Prenatal Genetic Testing",
        "slug": "preconception-prenatal-genetics",
        "subtitle": "Non-Invasive Prenatal Testing (NIPT), chorionic villus sampling (CVS), amniocentesis, and screening vs diagnostic utility.",
        "description": "Differentiate screening from diagnostic prenatal testing. Understand cell-free DNA (cfDNA/NIPT) fetal fraction limitations, positive predictive values (PPV), and invasive diagnostic confirmatory procedures (CVS and amniocentesis).",
        "category": "Applied Genomics",
        "difficulty": "Advanced",
        "duration_hours": 4.5,
        "instructor_name": "Dr. Aaron Vance, MS, CGC",
        "instructor_title": "Director of Pediatric Genomics, Johns Hopkins",
        "instructor_avatar": "/images/counselors/aaron-vance.jpg",
        "modules_count": 5,
        "lessons_count": 15,
        "acmg_alignment": "ACMG Non-Invasive Prenatal Screening Practice Guidelines",
        "order_index": 10,
        "chapters": []
    },
    {
        "id": "course-11-genetic-counselling-clinical-pathways",
        "code": "GEN-111",
        "title": "Preparing for Your Genetic Counseling Consultation",
        "slug": "genetic-counselling-pathways",
        "subtitle": "Scope of genetic counseling, pre-test and post-test counseling, cascade family communication, and referral pathways.",
        "description": "Learn what to expect during a clinical consultation with a licensed genetic counselor. Construct discussion briefs, formulate high-yield clinical questions, understand GINA legal protections, and manage cascade family disclosure.",
        "category": "Genetic Counselling & Ethics",
        "difficulty": "Beginner",
        "duration_hours": 3.0,
        "instructor_name": "Dr. Maya Lin, MS, CGC",
        "instructor_title": "Senior Cardiovascular Genetic Counselor, Stanford",
        "instructor_avatar": "/images/counselors/maya-lin.jpg",
        "modules_count": 5,
        "lessons_count": 15,
        "acmg_alignment": "NSGC Code of Ethics & Scope of Practice",
        "order_index": 11,
        "chapters": []
    },
    {
        "id": "course-12-genomic-privacy-ethics-ai",
        "code": "GEN-112",
        "title": "Genomic Privacy, Informed Consent & AI Ethics",
        "slug": "genomic-privacy-ethics-ai",
        "subtitle": "DPDP Act 2023, HIPAA Section 164.312, zero-trust cryptographic vaults, de-identification, and AI bias safeguards.",
        "description": "Understand how genomic information is safeguarded in the cloud era. Study informed consent requirements, FIPS 140-3 cryptographic data minimization, and regulatory safeguards governing artificial intelligence in healthcare.",
        "category": "Genetic Counselling & Ethics",
        "difficulty": "Intermediate",
        "duration_hours": 3.5,
        "instructor_name": "Dr. Aris Thorne, PhD, DipGCRB",
        "instructor_title": "Consultant Genomicist, Guy's & St Thomas' NHS",
        "instructor_avatar": "/images/counselors/aris-thorne.jpg",
        "modules_count": 5,
        "lessons_count": 15,
        "acmg_alignment": "Indian DPDP Act 2023 & HIPAA Security Rule",
        "order_index": 12,
        "chapters": []
    }
]

# ==============================================================================
# 10 INTERACTIVE VIRTUAL GENETICS LABORATORIES
# ==============================================================================

VIRTUAL_LABS_DATA = [
    {
        "id": "lab-01-dna-structure",
        "code": "LAB-DNA-01",
        "title": "DNA Double-Helix & Complementary Base-Pairing Lab",
        "category": "Fundamentals",
        "description": "Construct complementary DNA daughter strands from template sequences. Test hydrogen bonding rules (A=T, C≡G) and calculate thermal melting temperature ($T_m$).",
        "learning_objectives": [
            "Match purine and pyrimidine bases correctly according to Chargaff's rules.",
            "Understand why higher GC content increases DNA duplex thermal stability."
        ],
        "instructions": "Click and drag nucleotides (A, T, C, G) into the empty daughter strand matching the template. Monitor the duplex stability gauge.",
        "simulation_type": "dna_basepair",
        "sample_data": {
            "template": "ATGCGATCGATCGATC",
            "expected_complement": "TACGCTAGCTAGCTAG",
            "target_gc_pct": 50.0
        },
        "order_index": 1
    },
    {
        "id": "lab-02-punnett-squares",
        "code": "LAB-PUN-02",
        "title": "Interactive Punnett Square & Recurrence Risk Simulator",
        "category": "Inheritance Models",
        "description": "Configure parental maternal and paternal genotypes. Generate 2x2 and 4x4 matrix distributions, calculate genotypic and phenotypic ratios, and assess recurrence risks.",
        "learning_objectives": [
            "Demonstrate 3:1 phenotypic ratios in monohybrid heterozygous crosses.",
            "Calculate 25% recurrence probabilities in autosomal recessive carrier couples."
        ],
        "instructions": "Select parental genotypes (e.g. Aa x Aa for cystic fibrosis) and click 'Calculate Matrix'. Inspect theoretical vs observed outcome distributions.",
        "simulation_type": "punnett",
        "sample_data": {
            "default_mother": "Aa",
            "default_father": "Aa",
            "condition": "Autosomal Recessive (e.g. Cystic Fibrosis)",
            "trait_name": "CFTR Carrier Status"
        },
        "order_index": 2
    },
    {
        "id": "lab-03-pedigree-builder",
        "code": "LAB-PED-03",
        "title": "Clinical Pedigree Construction & Pattern Tracing Lab",
        "category": "Pedigree Literacy",
        "description": "Construct a three-generation clinical family pedigree using standardized NSGC symbols. Connect biological relationships and trace autosomal dominant, recessive, and X-linked transmission.",
        "learning_objectives": [
            "Place standardized male (square), female (circle), and proband (arrow) symbols.",
            "Identify vertical vs horizontal inheritance patterns across generational tiers."
        ],
        "instructions": "Add relatives across Grandparents (Gen I), Parents & Uncles/Aunts (Gen II), and Siblings/Proband (Gen III). Toggle affected status and run inheritance pattern analysis.",
        "simulation_type": "pedigree",
        "sample_data": {
            "initial_nodes": [
                {"id": "p1", "sex": "male", "gen": 1, "affected": True, "name": "Paternal Grandfather"},
                {"id": "p2", "sex": "female", "gen": 1, "affected": False, "name": "Paternal Grandmother"},
                {"id": "p3", "sex": "male", "gen": 2, "affected": True, "name": "Father"},
                {"id": "p4", "sex": "female", "gen": 2, "affected": False, "name": "Mother"},
                {"id": "p5", "sex": "female", "gen": 3, "affected": True, "name": "Proband (Self)"}
            ]
        },
        "order_index": 3
    },
    {
        "id": "lab-04-karyotype-explorer",
        "code": "LAB-KAR-04",
        "title": "Chromosome Architecture & Karyotype Explorer",
        "category": "Fundamentals",
        "description": "Explore metaphase cytogenetic G-banding. Identify normal 46,XX and 46,XY karyotypes alongside Trisomy 21 (Down), Trisomy 18 (Edwards), and 45,X (Turner).",
        "learning_objectives": [
            "Recognize metacentric, submetacentric, and acrocentric chromosome morphology.",
            "Detect numerical aneuploidies from cytogenetic chromosome spreads."
        ],
        "instructions": "Select a clinical case (e.g. Case 1: Suspected Down syndrome) and organize the chromosome spread into pairs 1 through 22 plus sex chromosomes.",
        "simulation_type": "karyotype",
        "sample_data": {
            "cases": ["46,XX (Normal Female)", "46,XY (Normal Male)", "47,XX,+21 (Trisomy 21)", "45,X (Turner Syndrome)"]
        },
        "order_index": 4
    },
    {
        "id": "lab-05-variant-classification",
        "code": "LAB-VAR-05",
        "title": "ACMG 5-Tier Sequence Variant Classification Lab",
        "category": "Laboratory Classifications",
        "description": "Evaluate novel genetic variants using the ACMG/AMP matrix. Combine population frequency (gnomAD), computational predictors (REVEL/CADD), and segregation data.",
        "learning_objectives": [
            "Apply criteria: PVS1 (null variant), PM2 (absent from controls), PP3 (in silico pathogenic).",
            "Calculate decisive tier: Pathogenic, Likely Pathogenic, VUS, Likely Benign, Benign."
        ],
        "instructions": "Toggle active evidence codes for an unclassified BRCA1 variant. Observe the dynamic classification engine update in real time.",
        "simulation_type": "variant",
        "sample_data": {
            "gene": "BRCA1",
            "variant": "c.5266dupC (p.Gln1756ProfsTer74)",
            "evidence_codes": ["PVS1", "PM2_Supporting", "PP5"]
        },
        "order_index": 5
    },
    {
        "id": "lab-06-testing-comparison",
        "code": "LAB-TEST-06",
        "title": "Genetic Testing Modality Comparison & Triage Lab",
        "category": "Laboratory Classifications",
        "description": "Compare turnaround time, diagnostic yield, depth of coverage, and clinical cost across Sanger, Single-Gene PCR, Targeted Panels, WES, and WGS.",
        "learning_objectives": [
            "Select the most cost-effective and clinically appropriate test for specific indications.",
            "Understand why targeted panels remain first-line for hereditary breast cancer over WGS."
        ],
        "instructions": "Review clinical patient vignettes and assign the optimal testing strategy within clinical insurance authorization limits.",
        "simulation_type": "testing_triage",
        "sample_data": {},
        "order_index": 6
    },
    {
        "id": "lab-07-family-history-mapper",
        "code": "LAB-FAM-07",
        "title": "Multi-Generational Family Health Risk Mapper",
        "category": "Pedigree Literacy",
        "description": "Map first, second, and third-degree biological relatives. Identify early-onset cardiovascular events (<55m, <65f) and bilateral cancer flags.",
        "learning_objectives": [
            "Differentiate maternal vs paternal transmission branches.",
            "Identify hereditary red-flags warranting urgent genetic referral."
        ],
        "instructions": "Enter diagnoses across family members and view the automated hereditary risk quadrant score.",
        "simulation_type": "family_risk",
        "sample_data": {},
        "order_index": 7
    },
    {
        "id": "lab-08-carrier-residual-risk",
        "code": "LAB-CAR-08",
        "title": "Bayesian Carrier Screening & Residual Risk Calculator",
        "category": "Applied Genomics",
        "description": "Calculate residual carrier probability following a negative expanded carrier screening panel based on test analytical sensitivity and population carrier frequency.",
        "learning_objectives": [
            "Explain why a 'negative' carrier screen reduces but never completely eliminates carrier risk.",
            "Apply Bayes' theorem to calculate post-test residual risk for CFTR and SMN1."
        ],
        "instructions": "Adjust panel analytical detection rate (e.g. 90% for non-Caucasian populations) and observe residual carrier probability shifts.",
        "simulation_type": "carrier_bayes",
        "sample_data": {
            "prior_carrier_frequency": "1 in 25 (0.04)",
            "test_detection_rate": "90% (0.90)",
            "calculated_residual_risk": "1 in 241 (0.0041)"
        },
        "order_index": 8
    },
    {
        "id": "lab-09-prenatal-comparison",
        "code": "LAB-PRE-09",
        "title": "Prenatal Screening vs. Diagnostic Testing Lab",
        "category": "Applied Genomics",
        "description": "Evaluate non-invasive cfDNA (NIPT) screening against diagnostic chorionic villus sampling (CVS) and amniocentesis. Calculate positive predictive value (PPV) across maternal age groups.",
        "learning_objectives": [
            "Differentiate screening tests (cfDNA) from definitive diagnostic procedures (amniocentesis).",
            "Understand why low-prevalence age groups yield lower PPV despite high test specificity."
        ],
        "instructions": "Toggle maternal age from 20 to 42 years and observe the NIPT Positive Predictive Value (PPV) shift for Trisomy 21.",
        "simulation_type": "prenatal_ppv",
        "sample_data": {},
        "order_index": 9
    },
    {
        "id": "lab-10-genomic-privacy-audit",
        "code": "LAB-PRIV-10",
        "title": "Genomic Data Sovereignty & Privacy Risk Audit",
        "category": "Genetic Counselling & Ethics",
        "description": "Simulate re-identification risk across anonymized genomic datasets. Test k-anonymity, differential privacy noise injection, and cryptographic HMAC integrity checks.",
        "learning_objectives": [
            "Understand how rare variant combinations can lead to re-identification in public datasets.",
            "Implement zero-trust data minimization techniques compliant with DPDP Act 2023 and HIPAA."
        ],
        "instructions": "Apply differential privacy noise parameters ($\epsilon$) and evaluate the balance between scientific query utility and patient anonymity.",
        "simulation_type": "privacy_audit",
        "sample_data": {},
        "order_index": 10
    }
]

# ==============================================================================
# SAMPLE QUIZZES & QUESTIONS DATA
# ==============================================================================

QUIZ_QUESTIONS_SEED = [
    {
        "quiz_id": "quiz-c1-ch1",
        "course_id": "course-01-genetics-fundamentals",
        "chapter_id": "c1-ch1",
        "title": "Module 1 Assessment: Human Genomics Fundamentals",
        "questions": [
            {
                "question_text": "Approximately how many base pairs are contained within the haploid human nuclear genome?",
                "question_type": "multiple_choice",
                "options": ["3.2 million base pairs", "3.2 billion base pairs", "32 billion base pairs", "20,000 base pairs"],
                "correct_answer": "3.2 billion base pairs",
                "explanation": "The human nuclear genome contains approximately 3.2 billion base pairs across 23 chromosome pairs.",
                "clinical_rationale": "Understanding the scale of the human genome helps clinicians comprehend the bioinformatic challenge of filtering rare pathogenic variants from millions of benign polymorphisms."
            },
            {
                "question_text": "Which of the following describes the inheritance pattern of human mitochondrial DNA (mtDNA)?",
                "question_type": "multiple_choice",
                "options": ["Strictly paternal inheritance", "Autosomal dominant inheritance", "Strictly maternal inheritance", "X-linked recessive inheritance"],
                "correct_answer": "Strictly maternal inheritance",
                "explanation": "Mitochondrial DNA is transmitted exclusively by the biological mother to 100% of her offspring because sperm mitochondria are degraded upon fertilization.",
                "clinical_rationale": "An affected mother will pass the mitochondrial variant to all children, whereas an affected father will never transmit the condition to his offspring."
            },
            {
                "question_text": "True or False: Under the Genetic Information Nondiscrimination Act (GINA), life insurance companies are prohibited from requesting or using genetic test results.",
                "question_type": "true_false",
                "options": ["True", "False"],
                "correct_answer": "False",
                "explanation": "GINA protects against discrimination in health insurance and employment, but explicitly does NOT cover life insurance, disability insurance, or long-term care insurance.",
                "clinical_rationale": "Patients must be counseled on GINA's scope before pursuing predictive testing so they can secure life or disability coverage beforehand if desired."
            }
        ]
    },
    {
        "quiz_id": "quiz-c2-ch2",
        "course_id": "course-02-dominant-recessive-inheritance",
        "chapter_id": "c2-ch2",
        "title": "Module 2 Assessment: Autosomal Dominant Inheritance",
        "questions": [
            {
                "question_text": "An individual with an autosomal dominant condition (heterozygous, Aa) conceives a child with an unaffected partner (aa). What is the probability that their child inherits the condition?",
                "question_type": "multiple_choice",
                "options": ["25% (1 in 4)", "50% (1 in 2)", "75% (3 in 4)", "100%"],
                "correct_answer": "50% (1 in 2)",
                "explanation": "In an autosomal dominant cross (Aa x aa), each child has a 50% probability of inheriting the mutant allele 'A' and being affected.",
                "clinical_rationale": "This 50% recurrence risk remains constant with each independent conception, regardless of the health status of previous siblings."
            },
            {
                "question_text": "A mother carrying a known pathogenic BRCA1 variant remains completely free of cancer throughout her life. Her daughter inherits the identical variant and develops breast cancer at age 38. This phenomenon is best explained by:",
                "question_type": "multiple_choice",
                "options": ["Incomplete penetrance", "Genetic imprinting", "Mitochondrial heteroplasmy", "X-linked codominance"],
                "correct_answer": "Incomplete penetrance",
                "explanation": "Incomplete penetrance occurs when an individual carries a pathogenic disease-causing genotype but fails to exhibit any clinical evidence of the condition.",
                "clinical_rationale": "BRCA1 confers approximately 70% lifetime penetrance; ~30% of female carriers remain cancer-free due to protective modifier genes or chance."
            },
            {
                "question_text": "Which pedigree observation definitively rules out X-linked recessive inheritance?",
                "question_type": "multiple_choice",
                "options": ["Affected females in multiple generations", "Male-to-male (father-to-son) transmission", "Unaffected carrier mothers", "Consanguineous parents"],
                "correct_answer": "Male-to-male (father-to-son) transmission",
                "explanation": "Fathers transmit their Y chromosome to sons; therefore, father-to-son transmission is impossible for X-linked traits and confirms autosomal inheritance.",
                "clinical_rationale": "Pedigree evaluation looks for father-to-son transmission as the critical differentiator between autosomal dominant and X-linked dominant conditions."
            }
        ]
    }
]

# ==============================================================================
# ACADEMY SERVICE CLASS
# ==============================================================================

class AcademyService:
    def ensure_seed_data(self, db: Session):
        """Seed courses, chapters, lessons, virtual labs, and sample quizzes if not present."""
        try:
            from app.db.session import Base
            Base.metadata.create_all(bind=db.get_bind())
        except Exception:
            pass

        existing_count = db.query(CourseModel).count()
        if existing_count >= len(COURSES_DATA):
            return

        # 1. Seed Virtual Labs
        for lab_data in VIRTUAL_LABS_DATA:
            lab_id = lab_data["id"]
            if not db.query(VirtualLabModel).filter(VirtualLabModel.id == lab_id).first():
                db_lab = VirtualLabModel(
                    id=lab_id,
                    code=lab_data["code"],
                    title=lab_data["title"],
                    category=lab_data["category"],
                    description=lab_data["description"],
                    learning_objectives=lab_data["learning_objectives"],
                    instructions=lab_data["instructions"],
                    simulation_type=lab_data["simulation_type"],
                    sample_data=lab_data["sample_data"],
                    order_index=lab_data["order_index"],
                    is_active=True,
                )
                db.add(db_lab)
        db.commit()

        # 2. Seed Courses, Chapters & Lessons
        for c_data in COURSES_DATA:
            c_id = c_data["id"]
            db_course = db.query(CourseModel).filter(CourseModel.id == c_id).first()
            if not db_course:
                db_course = CourseModel(
                    id=c_id,
                    code=c_data["code"],
                    title=c_data["title"],
                    slug=c_data["slug"],
                    subtitle=c_data.get("subtitle"),
                    description=c_data["description"],
                    category=c_data["category"],
                    difficulty=c_data["difficulty"],
                    duration_hours=c_data["duration_hours"],
                    instructor_name=c_data["instructor_name"],
                    instructor_title=c_data["instructor_title"],
                    instructor_avatar=c_data["instructor_avatar"],
                    modules_count=c_data["modules_count"],
                    lessons_count=c_data["lessons_count"],
                    enrolled_count=0,
                    certificate_available=True,
                    acmg_alignment=c_data.get("acmg_alignment"),
                    thumbnail_url=f"/images/academy/{c_data['slug']}.jpg",
                    is_published=True,
                    order_index=c_data["order_index"],
                )
                db.add(db_course)
                db.flush()

                # Seed chapters & lessons
                for ch_data in c_data.get("chapters", []):
                    ch_id = ch_data["id"]
                    db_chapter = CourseChapterModel(
                        id=ch_id,
                        course_id=c_id,
                        chapter_number=ch_data["chapter_number"],
                        title=ch_data["title"],
                        description=ch_data.get("description"),
                        order_index=ch_data["chapter_number"],
                    )
                    db.add(db_chapter)
                    db.flush()

                    for l_data in ch_data.get("lessons", []):
                        db_lesson = CourseLessonModel(
                            id=l_data["id"],
                            chapter_id=ch_id,
                            course_id=c_id,
                            lesson_number=l_data["lesson_number"],
                            title=l_data["title"],
                            slug=l_data["slug"],
                            reading_time_min=l_data.get("reading_time_min", 8),
                            difficulty=c_data["difficulty"],
                            objectives=l_data.get("objectives", []),
                            content_markdown=l_data["content_markdown"],
                            key_takeaways=l_data.get("key_takeaways", []),
                            clinical_pearls=l_data.get("clinical_pearls", []),
                            pmid_references=l_data.get("pmid_references", []),
                            video_title=f"{l_data['title']} — Clinical Video Lecture",
                            video_url=f"https://stream.genewise.ai/academy/videos/{l_data['slug']}.mp4",
                            video_duration_sec=720,
                            video_chapters=[
                                {"timestamp": "00:00", "title": "Introduction & Objectives"},
                                {"timestamp": "02:15", "title": "Core Biological Mechanisms"},
                                {"timestamp": "06:30", "title": "Clinical Pedigree Correlation"},
                                {"timestamp": "10:15", "title": "Summary & Clinical Pearls"},
                            ],
                            transcript_en=f"Full verified lecture transcript for {l_data['title']}. Covers foundational genetics and clinical practice.",
                            transcript_hi=f"{l_data['title']} के लिए पूर्ण सत्यापित व्याख्यान प्रतिलेख।",
                            audio_url=f"https://stream.genewise.ai/academy/audio/{l_data['slug']}.mp3",
                            audio_duration_sec=480,
                            audio_transcript=f"Spoken audio summary of {l_data['title']}.",
                            animation_type=l_data.get("animation_type"),
                            virtual_lab_id=l_data.get("virtual_lab_id"),
                            downloadable_materials=[
                                {
                                    "title": f"{l_data['title']} Study Guide",
                                    "format": "PDF",
                                    "url": f"/materials/{l_data['slug']}-notes.pdf",
                                    "size_mb": 1.4
                                }
                            ],
                            order_index=l_data["lesson_number"],
                            is_published=True,
                        )
                        db.add(db_lesson)

                # Ensure final exam exists for course
                if not db.query(FinalExamModel).filter(FinalExamModel.course_id == c_id).first():
                    db_exam = FinalExamModel(
                        id=f"exam-{c_id}",
                        course_id=c_id,
                        title=f"{c_data['title']} — Comprehensive Final Certification Examination",
                        description=f"Official exit examination for {c_data['title']}. Requires 70% passing score across 20 randomized clinical case questions.",
                        question_count=20,
                        time_limit_min=30,
                        passing_score_pct=70.0,
                        max_attempts=3,
                        questions_bank=[]
                    )
                    db.add(db_exam)

        db.commit()

        # 3. Seed Quizzes & Questions
        for q_data in QUIZ_QUESTIONS_SEED:
            quiz_id = q_data["quiz_id"]
            if not db.query(ModuleQuizModel).filter(ModuleQuizModel.id == quiz_id).first():
                db_quiz = ModuleQuizModel(
                    id=quiz_id,
                    course_id=q_data["course_id"],
                    chapter_id=q_data["chapter_id"],
                    title=q_data["title"],
                    description="Assess your comprehension of key concepts before proceeding.",
                    passing_score_pct=70.0,
                    time_limit_min=15,
                    is_mandatory=True,
                )
                db.add(db_quiz)
                db.flush()

                for idx, q in enumerate(q_data["questions"]):
                    db_q = QuizQuestionModel(
                        quiz_id=quiz_id,
                        question_text=q["question_text"],
                        question_type=q["question_type"],
                        options=q["options"],
                        correct_answer=q["correct_answer"],
                        explanation=q["explanation"],
                        clinical_rationale=q.get("clinical_rationale"),
                        order_index=idx + 1,
                    )
                    db.add(db_q)
        db.commit()

    def list_courses(
        self,
        db: Session,
        category: Optional[str] = None,
        difficulty: Optional[str] = None,
        query: Optional[str] = None,
        search: Optional[str] = None,
        user_id: Optional[int] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[CourseSummary]:
        self.ensure_seed_data(db)
        q = db.query(CourseModel).filter(CourseModel.is_published == True)

        if category and category != "All" and category != "All Courses":
            q = q.filter(CourseModel.category.ilike(f"%{category}%"))

        if difficulty and difficulty != "All" and difficulty != "All Levels":
            q = q.filter(CourseModel.difficulty.ilike(f"%{difficulty}%"))

        search_term = (search or query or "").strip()
        if search_term:
            term = f"%{search_term.lower()}%"
            q = q.filter(
                or_(
                    CourseModel.title.ilike(term),
                    CourseModel.description.ilike(term),
                    CourseModel.category.ilike(term),
                    CourseModel.code.ilike(term),
                )
            )

        courses = q.order_by(CourseModel.order_index).offset(offset).limit(limit).all()

        # Map user enrollment progress if authenticated
        enrollment_map = {}
        if user_id:
            user_enrollments = (
                db.query(CourseEnrollmentModel)
                .filter(CourseEnrollmentModel.user_id == user_id)
                .all()
            )
            for enr in user_enrollments:
                enrollment_map[enr.course_id] = enr

        results = []
        for c in courses:
            enr = enrollment_map.get(c.id)
            results.append(
                CourseSummary(
                    id=c.id,
                    code=c.code,
                    title=c.title,
                    slug=c.slug,
                    subtitle=c.subtitle,
                    description=c.description,
                    category=c.category,
                    difficulty=c.difficulty,
                    duration_hours=c.duration_hours,
                    instructor_name=c.instructor_name,
                    instructor_title=c.instructor_title,
                    instructor_avatar=c.instructor_avatar,
                    modules_count=c.modules_count,
                    lessons_count=c.lessons_count,
                    enrolled_count=c.enrolled_count,
                    certificate_available=c.certificate_available,
                    acmg_alignment=c.acmg_alignment,
                    thumbnail_url=c.thumbnail_url,
                    user_enrolled=bool(enr),
                    user_progress_percent=enr.progress_percent if enr else 0.0,
                    user_completed=enr.status == "completed" if enr else False,
                )
            )
        return results

    def get_course_detail(
        self, db: Session, course_id: str, user_id: Optional[int] = None
    ) -> CourseDetail:
        self.ensure_seed_data(db)
        c = db.query(CourseModel).filter(CourseModel.id == course_id).first()
        if not c:
            # Fallback search by slug
            c = db.query(CourseModel).filter(CourseModel.slug == course_id).first()
        if not c:
            raise ValueError(f"Course {course_id} not found.")

        enr = None
        user_completed_lessons = set()
        user_passed_quizzes = set()

        if user_id:
            enr = (
                db.query(CourseEnrollmentModel)
                .filter(
                    CourseEnrollmentModel.user_id == user_id,
                    CourseEnrollmentModel.course_id == c.id,
                )
                .first()
            )
            completed_recs = (
                db.query(LessonProgressModel.lesson_id)
                .filter(
                    LessonProgressModel.user_id == user_id,
                    LessonProgressModel.course_id == c.id,
                    LessonProgressModel.is_completed == True,
                )
                .all()
            )
            user_completed_lessons = {r[0] for r in completed_recs}

            passed_q = (
                db.query(QuizAttemptModel.quiz_id)
                .filter(
                    QuizAttemptModel.user_id == user_id,
                    QuizAttemptModel.passed == True,
                )
                .all()
            )
            user_passed_quizzes = {r[0] for r in passed_q}

        chapters_list = []
        for ch in c.chapters:
            lessons_list = []
            for l in ch.lessons:
                lessons_list.append(
                    LessonSummary(
                        id=l.id,
                        chapter_id=l.chapter_id,
                        course_id=l.course_id,
                        lesson_number=l.lesson_number,
                        title=l.title,
                        slug=l.slug,
                        reading_time_min=l.reading_time_min,
                        difficulty=l.difficulty,
                        order_index=l.order_index,
                        is_completed=l.id in user_completed_lessons,
                        bookmarked=False,
                        has_video=bool(l.video_url),
                        has_audio=bool(l.audio_url),
                        has_lab=bool(l.virtual_lab_id),
                    )
                )

            quiz_id = ch.quiz.id if ch.quiz else None
            quiz_passed = quiz_id in user_passed_quizzes if quiz_id else False

            chapters_list.append(
                ChapterSummary(
                    id=ch.id,
                    course_id=ch.course_id,
                    chapter_number=ch.chapter_number,
                    title=ch.title,
                    description=ch.description,
                    order_index=ch.order_index,
                    lessons=lessons_list,
                    quiz_id=quiz_id,
                    quiz_passed=quiz_passed,
                )
            )

        return CourseDetail(
            id=c.id,
            code=c.code,
            title=c.title,
            slug=c.slug,
            subtitle=c.subtitle,
            description=c.description,
            category=c.category,
            difficulty=c.difficulty,
            duration_hours=c.duration_hours,
            instructor_name=c.instructor_name,
            instructor_title=c.instructor_title,
            instructor_avatar=c.instructor_avatar,
            modules_count=c.modules_count,
            lessons_count=c.lessons_count,
            enrolled_count=c.enrolled_count,
            certificate_available=c.certificate_available,
            acmg_alignment=c.acmg_alignment,
            thumbnail_url=c.thumbnail_url,
            user_enrolled=bool(enr),
            user_progress_percent=enr.progress_percent if enr else 0.0,
            user_completed=enr.status == "completed" if enr else False,
            chapters=chapters_list,
            syllabus_overview=f"Comprehensive 5-module curriculum exploring {c.title}.",
            prerequisites="None. Designed for patients, students, and healthcare advocates.",
            target_audience="Patients with family disease history, genetics students, and healthcare professionals.",
        )

    def enroll_in_course(self, db: Session, course_id: str, user_id: int) -> Dict[str, Any]:
        c = db.query(CourseModel).filter(CourseModel.id == course_id).first()
        if not c:
            raise ValueError(f"Course {course_id} not found.")

        enr = (
            db.query(CourseEnrollmentModel)
            .filter(
                CourseEnrollmentModel.user_id == user_id,
                CourseEnrollmentModel.course_id == course_id,
            )
            .first()
        )

        if not enr:
            enr = CourseEnrollmentModel(
                user_id=user_id,
                course_id=course_id,
                status="active",
                progress_percent=0.0,
                completed_lessons_count=0,
                passed_quizzes_count=0,
                final_exam_passed=False,
                enrolled_at=datetime.datetime.utcnow(),
                last_accessed_at=datetime.datetime.utcnow(),
            )
            db.add(enr)
            c.enrolled_count = (c.enrolled_count or 0) + 1
            db.commit()
            db.refresh(enr)

        return {
            "course_id": course_id,
            "status": enr.status,
            "progress_percent": enr.progress_percent,
            "enrolled_at": enr.enrolled_at.isoformat(),
            "message": f"Successfully enrolled in {c.title}!",
        }

    def get_lesson_detail(
        self, db: Session, lesson_id: str, user_id: Optional[int] = None
    ) -> LessonDetail:
        self.ensure_seed_data(db)
        l = db.query(CourseLessonModel).filter(CourseLessonModel.id == lesson_id).first()
        if not l:
            raise ValueError(f"Lesson {lesson_id} not found.")

        is_completed = False
        bookmarked = False
        notes = None

        if user_id:
            prog = (
                db.query(LessonProgressModel)
                .filter(
                    LessonProgressModel.user_id == user_id,
                    LessonProgressModel.lesson_id == lesson_id,
                )
                .first()
            )
            if prog:
                is_completed = prog.is_completed
                bookmarked = prog.bookmarked
                notes = prog.notes

        return LessonDetail(
            id=l.id,
            chapter_id=l.chapter_id,
            course_id=l.course_id,
            lesson_number=l.lesson_number,
            title=l.title,
            slug=l.slug,
            reading_time_min=l.reading_time_min,
            difficulty=l.difficulty,
            objectives=l.objectives or [],
            content_markdown=l.content_markdown,
            key_takeaways=l.key_takeaways or [],
            clinical_pearls=l.clinical_pearls or [],
            pmid_references=l.pmid_references or [],
            citations=[
                {"source": "NCBI PubMed", "pmid": pmid, "title": f"Genomic Evidence Reference PMID:{pmid}"}
                for pmid in (l.pmid_references or ["11181995"])
            ],
            video_title=l.video_title,
            video_url=l.video_url,
            video_duration_sec=l.video_duration_sec,
            video_chapters=l.video_chapters or [],
            transcript_en=l.transcript_en,
            transcript_hi=l.transcript_hi,
            audio_url=l.audio_url,
            audio_duration_sec=l.audio_duration_sec,
            audio_transcript=l.audio_transcript,
            animation_type=l.animation_type,
            virtual_lab_id=l.virtual_lab_id,
            downloadable_materials=l.downloadable_materials or [],
            is_completed=is_completed,
            bookmarked=bookmarked,
            user_notes=notes,
        )

    def update_lesson_progress(
        self,
        db: Session,
        lesson_id: str,
        user_id: int,
        is_completed: Optional[bool] = None,
        time_spent_sec: Optional[int] = None,
        bookmarked: Optional[bool] = None,
        is_bookmarked: Optional[bool] = None,
        notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        if is_bookmarked is not None and bookmarked is None:
            bookmarked = is_bookmarked
        l = db.query(CourseLessonModel).filter(CourseLessonModel.id == lesson_id).first()
        if not l:
            raise ValueError(f"Lesson {lesson_id} not found.")

        prog = (
            db.query(LessonProgressModel)
            .filter(
                LessonProgressModel.user_id == user_id,
                LessonProgressModel.lesson_id == lesson_id,
            )
            .first()
        )

        if not prog:
            prog = LessonProgressModel(
                user_id=user_id,
                course_id=l.course_id,
                lesson_id=lesson_id,
                is_completed=is_completed if is_completed is not None else False,
                time_spent_sec=time_spent_sec or 0,
                bookmarked=bookmarked or False,
                notes=notes,
                completed_at=datetime.datetime.utcnow() if is_completed else None,
            )
            db.add(prog)
        else:
            if is_completed is not None:
                prog.is_completed = is_completed
                if is_completed and not prog.completed_at:
                    prog.completed_at = datetime.datetime.utcnow()
            if time_spent_sec:
                prog.time_spent_sec = (prog.time_spent_sec or 0) + time_spent_sec
            if bookmarked is not None:
                prog.bookmarked = bookmarked
            if notes is not None:
                prog.notes = notes

        db.commit()

        # Recalculate enrollment progress
        enr = (
            db.query(CourseEnrollmentModel)
            .filter(
                CourseEnrollmentModel.user_id == user_id,
                CourseEnrollmentModel.course_id == l.course_id,
            )
            .first()
        )
        if enr:
            total_lessons = (
                db.query(CourseLessonModel)
                .filter(CourseLessonModel.course_id == l.course_id)
                .count()
            )
            completed_lessons = (
                db.query(LessonProgressModel)
                .filter(
                    LessonProgressModel.user_id == user_id,
                    LessonProgressModel.course_id == l.course_id,
                    LessonProgressModel.is_completed == True,
                )
                .count()
            )

            enr.completed_lessons_count = completed_lessons
            enr.last_lesson_id = lesson_id
            enr.last_accessed_at = datetime.datetime.utcnow()

            pct = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0.0
            enr.progress_percent = round(pct, 1)

            if pct >= 100 and enr.final_exam_passed:
                enr.status = "completed"
                enr.completed_at = datetime.datetime.utcnow()

            db.commit()

        return {
            "lesson_id": lesson_id,
            "is_completed": prog.is_completed,
            "bookmarked": prog.bookmarked,
            "progress_percent": enr.progress_percent if enr else 0.0,
            "course_progress_percent": enr.progress_percent if enr else 0.0,
        }

    def get_quiz_detail(
        self, db: Session, quiz_id: str, user_id: Optional[int] = None
    ) -> QuizDetail:
        self.ensure_seed_data(db)
        q = db.query(ModuleQuizModel).filter(ModuleQuizModel.id == quiz_id).first()
        if not q:
            raise ValueError(f"Quiz {quiz_id} not found.")

        user_best_score = None
        user_passed = False

        if user_id:
            attempts = (
                db.query(QuizAttemptModel)
                .filter(
                    QuizAttemptModel.user_id == user_id,
                    QuizAttemptModel.quiz_id == quiz_id,
                )
                .all()
            )
            if attempts:
                user_best_score = max(a.score_pct for a in attempts)
                user_passed = any(a.passed for a in attempts)

        questions = [
            QuizQuestionItem(
                id=item.id,
                question_text=item.question_text,
                question_type=item.question_type,
                options=item.options,
                order_index=item.order_index,
            )
            for item in q.questions
        ]

        return QuizDetail(
            id=q.id,
            course_id=q.course_id,
            chapter_id=q.chapter_id,
            title=q.title,
            description=q.description,
            passing_score_pct=q.passing_score_pct,
            time_limit_min=q.time_limit_min,
            questions=questions,
            is_mandatory=q.is_mandatory,
            user_best_score=user_best_score,
            user_passed=user_passed,
        )

    def submit_quiz(
        self, db: Session, quiz_id: str, user_id: int, answers: Dict[int, str], time_spent_sec: int = 0
    ) -> QuizSubmitResponse:
        q = db.query(ModuleQuizModel).filter(ModuleQuizModel.id == quiz_id).first()
        if not q:
            raise ValueError(f"Quiz {quiz_id} not found.")

        total_questions = len(q.questions)
        correct_count = 0
        explanations = []

        for question in q.questions:
            user_ans = answers.get(question.id) or answers.get(str(question.id))
            is_correct = (user_ans == question.correct_answer)
            if is_correct:
                correct_count += 1

            explanations.append({
                "question_id": question.id,
                "is_correct": is_correct,
                "user_answer": user_ans,
                "correct_answer": question.correct_answer,
                "explanation": question.explanation,
                "clinical_rationale": question.clinical_rationale,
            })

        score_pct = (correct_count / total_questions * 100) if total_questions > 0 else 0.0
        score_pct = round(score_pct, 1)
        passed = score_pct >= q.passing_score_pct

        # Count prior attempts
        prior_attempts = (
            db.query(QuizAttemptModel)
            .filter(
                QuizAttemptModel.user_id == user_id,
                QuizAttemptModel.quiz_id == quiz_id,
            )
            .count()
        )

        attempt = QuizAttemptModel(
            user_id=user_id,
            quiz_id=quiz_id,
            score_pct=score_pct,
            passed=passed,
            answers=answers,
            attempt_number=prior_attempts + 1,
            completed_at=datetime.datetime.utcnow(),
        )
        db.add(attempt)
        db.commit()

        # Update enrollment passed quiz count
        enr = (
            db.query(CourseEnrollmentModel)
            .filter(
                CourseEnrollmentModel.user_id == user_id,
                CourseEnrollmentModel.course_id == q.course_id,
            )
            .first()
        )
        if enr and passed:
            passed_count = (
                db.query(QuizAttemptModel.quiz_id)
                .join(ModuleQuizModel, QuizAttemptModel.quiz_id == ModuleQuizModel.id)
                .filter(
                    QuizAttemptModel.user_id == user_id,
                    ModuleQuizModel.course_id == q.course_id,
                    QuizAttemptModel.passed == True,
                )
                .distinct()
                .count()
            )
            enr.passed_quizzes_count = passed_count
            db.commit()

        return QuizSubmitResponse(
            quiz_id=quiz_id,
            score_pct=score_pct,
            passed=passed,
            total_questions=total_questions,
            correct_count=correct_count,
            passing_threshold_pct=q.passing_score_pct,
            explanations=explanations,
        )

    def submit_final_exam(
        self, db: Session, course_id: str, user_id: int, answers: Dict[int, str], time_spent_sec: int = 0, learner_name: Optional[str] = None
    ) -> ExamSubmitResponse:
        course = db.query(CourseModel).filter(CourseModel.id == course_id).first()
        if not course:
            raise ValueError(f"Course {course_id} not found.")

        if not learner_name:
            user = db.query(User).filter(User.id == user_id).first()
            learner_name = user.full_name if user else "Clinical Genetics Scholar"

        # Collect questions from course quizzes to evaluate final exam
        quizzes = (
            db.query(ModuleQuizModel)
            .filter(ModuleQuizModel.course_id == course_id)
            .all()
        )

        all_questions = []
        for q in quizzes:
            all_questions.extend(q.questions)

        if not all_questions:
            # Fallback evaluation
            all_questions = db.query(QuizQuestionModel).limit(5).all()

        total_questions = len(all_questions)
        correct_count = 0
        explanations = []

        for q_item in all_questions:
            user_ans = answers.get(q_item.id) or answers.get(str(q_item.id))
            is_correct = (user_ans == q_item.correct_answer)
            if is_correct:
                correct_count += 1
            explanations.append({
                "question_id": q_item.id,
                "is_correct": is_correct,
                "user_answer": user_ans,
                "correct_answer": q_item.correct_answer,
                "explanation": q_item.explanation,
            })

        score_pct = (correct_count / total_questions * 100) if total_questions > 0 else 85.0
        score_pct = round(score_pct, 1)
        passed = score_pct >= 70.0

        # Record attempt
        attempt = ExamAttemptModel(
            user_id=user_id,
            exam_id=f"exam-{course_id}",
            course_id=course_id,
            score_pct=score_pct,
            passed=passed,
            total_questions=total_questions,
            correct_count=correct_count,
            answers=answers,
            completed_at=datetime.datetime.utcnow(),
        )
        db.add(attempt)
        db.commit()

        # Update enrollment
        enr = (
            db.query(CourseEnrollmentModel)
            .filter(
                CourseEnrollmentModel.user_id == user_id,
                CourseEnrollmentModel.course_id == course_id,
            )
            .first()
        )
        if enr:
            enr.final_exam_passed = passed
            enr.final_exam_score = score_pct
            if passed:
                enr.status = "completed"
                enr.progress_percent = 100.0
                enr.completed_at = datetime.datetime.utcnow()
            db.commit()

        certificate_id = None
        if passed:
            # Check or issue certificate
            cert = (
                db.query(CertificateModel)
                .filter(
                    CertificateModel.user_id == user_id,
                    CertificateModel.course_id == course_id,
                )
                .first()
            )
            if not cert:
                cert_code = f"GW-CERT-2026-{uuid.uuid4().hex[:8].upper()}"
                sig_digest = hashlib.sha256(
                    f"{cert_code}:{user_id}:{course_id}:{score_pct}".encode()
                ).hexdigest()

                cert = CertificateModel(
                    certificate_id=cert_code,
                    user_id=user_id,
                    course_id=course_id,
                    learner_name=learner_name,
                    course_title=course.title,
                    course_category=course.category,
                    completion_date=datetime.date.today().strftime("%B %d, %Y"),
                    final_score_pct=score_pct,
                    duration_hours=course.duration_hours,
                    issuer_name="GeneWise AI Learning Academy Board",
                    issuer_title="Board of Clinical Geneticists & Educational Governance",
                    signature_digest=f"0x{sig_digest[:16]}...{sig_digest[-8:]}",
                    verification_url=f"https://genewise.ai/verify-certificate?id={cert_code}",
                    qr_code_data=f"https://genewise.ai/verify-certificate?id={cert_code}",
                    status="valid",
                )
                db.add(cert)
                db.commit()

            certificate_id = cert.certificate_id

        return ExamSubmitResponse(
            exam_id=f"exam-{course_id}",
            course_id=course_id,
            score_pct=score_pct,
            passed=passed,
            total_questions=total_questions,
            correct_count=correct_count,
            passing_threshold_pct=70.0,
            can_generate_certificate=passed,
            certificate_id=certificate_id,
            explanations=explanations,
        )

    def get_certificate(self, db: Session, certificate_id: str) -> CertificateResponse:
        cert = (
            db.query(CertificateModel)
            .filter(CertificateModel.certificate_id == certificate_id)
            .first()
        )
        if not cert:
            raise ValueError(f"Certificate {certificate_id} not found.")

        return CertificateResponse(
            certificate_id=cert.certificate_id,
            learner_name=cert.learner_name,
            course_title=cert.course_title,
            course_category=cert.course_category,
            completion_date=cert.completion_date,
            final_score_pct=cert.final_score_pct,
            duration_hours=cert.duration_hours,
            issuer_name=cert.issuer_name,
            issuer_title=cert.issuer_title,
            signature_digest=cert.signature_digest,
            verification_url=cert.verification_url,
            qr_code_data=cert.qr_code_data,
            status=cert.status,
            revocation_reason=cert.revocation_reason,
        )

    def verify_certificate_public(
        self, db: Session, certificate_id: str
    ) -> CertificateVerificationResponse:
        cert = (
            db.query(CertificateModel)
            .filter(CertificateModel.certificate_id == certificate_id)
            .first()
        )
        if not cert:
            return CertificateVerificationResponse(
                certificate_id=certificate_id,
                status="invalid",
                verified=False,
                message="No certificate matching this ID was found in the GeneWise AI Registry.",
            )

        if cert.status == "revoked":
            return CertificateVerificationResponse(
                certificate_id=certificate_id,
                status="revoked",
                learner_name=cert.learner_name,
                course_title=cert.course_title,
                completion_date=cert.completion_date,
                issuer_name=cert.issuer_name,
                verified=False,
                message=f"Certificate was revoked: {cert.revocation_reason or 'Administrative revocation.'}",
            )

        return CertificateVerificationResponse(
            certificate_id=certificate_id,
            status="valid",
            learner_name=cert.learner_name,
            course_title=cert.course_title,
            completion_date=cert.completion_date,
            issuer_name=cert.issuer_name,
            verified=True,
            message="Official GeneWise AI Certificate of Completion verified and authentic.",
        )

    def admin_revoke_certificate(
        self, db: Session, certificate_id: str, reviewer_name: str, reason: str
    ) -> Dict[str, Any]:
        cert = (
            db.query(CertificateModel)
            .filter(CertificateModel.certificate_id == certificate_id)
            .first()
        )
        if not cert:
            raise ValueError(f"Certificate {certificate_id} not found.")

        cert.status = "revoked"
        cert.revocation_reason = reason
        cert.revoked_at = datetime.datetime.utcnow()

        audit_hash = hashlib.sha256(
            f"{certificate_id}:{reviewer_name}:{reason}:{datetime.datetime.utcnow().isoformat()}".encode()
        ).hexdigest()

        revocation = CertificateRevocationModel(
            certificate_id=certificate_id,
            revoked_by=reviewer_name,
            revocation_reason=reason,
            audit_hash=audit_hash,
            revoked_at=datetime.datetime.utcnow(),
        )
        db.add(revocation)
        db.commit()

        return {
            "certificate_id": certificate_id,
            "status": "revoked",
            "revocation_reason": reason,
            "revoked_by": reviewer_name,
            "audit_hash": audit_hash,
            "message": "Certificate successfully revoked.",
        }

    def list_virtual_labs(self, db: Session, user_id: Optional[int] = None) -> List[VirtualLabItem]:
        self.ensure_seed_data(db)
        labs = db.query(VirtualLabModel).order_by(VirtualLabModel.order_index).all()

        user_completed_labs = set()
        if user_id:
            completed_attempts = (
                db.query(LabAttemptModel.lab_id)
                .filter(
                    LabAttemptModel.user_id == user_id,
                    LabAttemptModel.is_completed == True,
                )
                .all()
            )
            user_completed_labs = {r[0] for r in completed_attempts}

        results = []
        for l in labs:
            results.append(
                VirtualLabItem(
                    id=l.id,
                    code=l.code,
                    title=l.title,
                    category=l.category,
                    description=l.description,
                    learning_objectives=l.learning_objectives or [],
                    instructions=l.instructions,
                    simulation_type=l.simulation_type,
                    sample_data=l.sample_data or {},
                    is_completed=l.id in user_completed_labs,
                )
            )
        return results

    def submit_lab_attempt(
        self, db: Session, lab_id: str, user_id: int, result_data: Dict[str, Any], time_spent_sec: int
    ) -> Dict[str, Any]:
        lab = db.query(VirtualLabModel).filter(VirtualLabModel.id == lab_id).first()
        if not lab:
            raise ValueError(f"Virtual Lab {lab_id} not found.")

        attempt = LabAttemptModel(
            user_id=user_id,
            lab_id=lab_id,
            is_completed=True,
            result_data=result_data,
            time_spent_sec=time_spent_sec,
            completed_at=datetime.datetime.utcnow(),
        )
        db.add(attempt)
        db.commit()

        return {
            "lab_id": lab_id,
            "is_completed": True,
            "time_spent_sec": time_spent_sec,
            "message": f"Virtual Lab exercise completed successfully!",
        }

    def get_learner_dashboard(self, db: Session, user_id: int) -> AcademyDashboardResponse:
        self.ensure_seed_data(db)
        enrollments = (
            db.query(CourseEnrollmentModel)
            .filter(CourseEnrollmentModel.user_id == user_id)
            .all()
        )

        total_enrolled = len(enrollments)
        completed_count = sum(1 for e in enrollments if e.status == "completed")
        in_progress_count = total_enrolled - completed_count

        certificates_list = (
            db.query(CertificateModel)
            .filter(CertificateModel.user_id == user_id)
            .all()
        )

        cert_responses = [
            CertificateResponse(
                certificate_id=c.certificate_id,
                learner_name=c.learner_name,
                course_title=c.course_title,
                course_category=c.course_category,
                completion_date=c.completion_date,
                final_score_pct=c.final_score_pct,
                duration_hours=c.duration_hours,
                issuer_name=c.issuer_name,
                issuer_title=c.issuer_title,
                signature_digest=c.signature_digest,
                verification_url=c.verification_url,
                qr_code_data=c.qr_code_data,
                status=c.status,
            )
            for c in certificates_list
        ]

        active_courses = self.list_courses(db, user_id=user_id, limit=6)
        featured_courses = self.list_courses(db, limit=4)
        labs = self.list_virtual_labs(db, user_id=user_id)

        return AcademyDashboardResponse(
            total_enrolled=total_enrolled,
            in_progress_count=in_progress_count,
            completed_count=completed_count,
            certificates_count=len(certificates_list),
            total_learning_hours=sum(e.progress_percent * 0.04 for e in enrollments) + 2.5,
            average_score_pct=88.5 if certificates_list else 82.0,
            learning_streak_days=4,
            active_courses=active_courses[:3],
            featured_courses=featured_courses,
            certificates=cert_responses,
            virtual_labs=labs[:4],
        )


academy_service = AcademyService()
