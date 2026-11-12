export interface ExonDomainSpan {
  startExon: number;
  endExon: number;
  domain: string;
  summary: string;
}

export interface Gene {
  symbol: string;
  locus: string;
  genomicCoordinates: string;
  name: string;
  functionalClass:
    | "Ion Channel"
    | "DNA Repair"
    | "Metabolic Enzyme"
    | "Structural Protein"
    | "Tumor Suppressor"
    | "Receptor & Transport";
  inheritance: "Autosomal Dominant" | "Autosomal Recessive" | "Multifactorial";
  chromosome: string;
  exons: number;
  proteinLengthAA: number;
  clinVarVariants: number;
  hgncId: string;
  ncbiGeneId: string;
  omimId: string;
  pdbId: string;
  cryoResolution: string;
  plddtScore: number;
  pathogenicCount: number;
  vusCount: number;
  benignCount: number;
  hotspotExon: number;
  hotspotLabel: string;
  exonDomains: ExonDomainSpan[];
  description: string;
  pharmacogenomicsNote: string;
  associatedConditions: string[];
}

export interface VariantEvidence {
  id: string;
  gene: string;
  hgvsCoding: string;
  hgvsProtein: string;
  commonAlias?: string;
  significance:
    | "Pathogenic"
    | "Likely Pathogenic"
    | "VUS (Uncertain)"
    | "Benign / Polymorphism";
  stars: number;
  reviewPanel: string;
  condition: string;
  curatedDate: string;
  dbSnp: string;
  gnomadAf: string;
  caddPhred: number;
  alphaMissense: number;
  acmgCriteria: string[];
  ancestryFreq: Array<{ population: string; freqPct: number }>;
}

export const GENES_CATALOG: Gene[] = [
  {
    symbol: "CFTR",
    locus: "7q31.2",
    genomicCoordinates: "117,479,963 - 117,668,665 bp",
    name: "Cystic Fibrosis Transmembrane Conductance Regulator",
    functionalClass: "Ion Channel",
    inheritance: "Autosomal Recessive",
    chromosome: "Chr 7",
    exons: 27,
    proteinLengthAA: 1480,
    clinVarVariants: 2410,
    hgncId: "1884",
    ncbiGeneId: "1080",
    omimId: "602421",
    pdbId: "6MSM",
    cryoResolution: "Cryo-EM 3.4 Å Model",
    plddtScore: 91.4,
    pathogenicCount: 1845,
    vusCount: 324,
    benignCount: 241,
    hotspotExon: 10,
    hotspotLabel: "ΔF508 NBD1 Hotspot",
    exonDomains: [
      {
        startExon: 1,
        endExon: 6,
        domain: "TMD1 Pore Helices",
        summary: "Encodes Transmembrane Domain 1 (M1-M6 helices) forming apical epithelial chloride conduction pathway.",
      },
      {
        startExon: 7,
        endExon: 12,
        domain: "NBD1 ATP Pocket",
        summary: "Encodes Nucleotide-Binding Domain 1 (NBD1). Exon 10 harbors pathogenic ΔF508 deletion (c.1521_1523delCTT).",
      },
      {
        startExon: 13,
        endExon: 15,
        domain: "Regulatory R-Domain",
        summary: "Encodes disordered regulatory R-domain phosphorylated by Protein Kinase A (PKA) for channel gating.",
      },
      {
        startExon: 16,
        endExon: 20,
        domain: "TMD2 Pore Helices",
        summary: "Encodes Transmembrane Domain 2 (M7-M12 helices) stabilizing anionic selectivity filter.",
      },
      {
        startExon: 21,
        endExon: 27,
        domain: "NBD2 Terminal Module",
        summary: "Encodes NBD2 C-terminal module coordinating ATP-dependent channel closure kinetics.",
      },
    ],
    description:
      "Encodes an ABC transporter-class ion channel that conducts chloride and thiocyanate ions across epithelial cell membranes. CFTR mutations disrupt epithelial fluid transport across lungs, pancreas, gastrointestinal tract, and sweat ducts.",
    pharmacogenomicsNote:
      "Responsive to CFTR modulator therapies (ivacaftor potentiator and elexacaftor/tezacaftor correctors) stratified by class II-III alleles.",
    associatedConditions: [
      "Cystic Fibrosis (Autosomal Recessive)",
      "Congenital Bilateral Absence of Vas Deferens (CBAVD)",
      "Idiopathic Chronic Pancreatitis",
    ],
  },
  {
    symbol: "BRCA1",
    locus: "17q21.31",
    genomicCoordinates: "43,044,295 - 43,170,245 bp",
    name: "BRCA1 DNA Repair Associated",
    functionalClass: "DNA Repair",
    inheritance: "Autosomal Dominant",
    chromosome: "Chr 17",
    exons: 24,
    proteinLengthAA: 1863,
    clinVarVariants: 8520,
    hgncId: "1100",
    ncbiGeneId: "672",
    omimId: "113705",
    pdbId: "1JM7",
    cryoResolution: "NMR Solution Complex",
    plddtScore: 86.2,
    pathogenicCount: 4120,
    vusCount: 3180,
    benignCount: 1220,
    hotspotExon: 11,
    hotspotLabel: "RAD51 / SCD Central Domain",
    exonDomains: [
      {
        startExon: 1,
        endExon: 6,
        domain: "RING E3 Ubiquitin Finger",
        summary: "N-terminal RING domain heterodimerizing with BARD1; exon 2 harbors recurrent 185delAG founder allele.",
      },
      {
        startExon: 7,
        endExon: 13,
        domain: "Exon 11 DNA-Binding / SCD",
        summary: "Massive central exon encoding nuclear localization signals, RAD51 interaction, and PALB2 scaffolding.",
      },
      {
        startExon: 14,
        endExon: 24,
        domain: "Tandem BRCT Repeats",
        summary: "C-terminal phosphopeptide-binding BRCT repeats critical for double-strand break checkpoint recruitment.",
      },
    ],
    description:
      "Protein involved in DNA double-strand break repair via homologous recombination and transcriptional regulation. Forms heterodimeric complexes with BARD1 to exert essential E3 ubiquitin ligase activity.",
    pharmacogenomicsNote:
      "Loss-of-function alleles exhibit synthetic lethality with PARP1/2 inhibitors (olaparib, talazoparib) via homologous recombination deficiency.",
    associatedConditions: [
      "Hereditary Breast and Ovarian Cancer (HBOC)",
      "Autosomal Dominant Fanconi Anemia Complementation",
    ],
  },
  {
    symbol: "TP53",
    locus: "17p13.1",
    genomicCoordinates: "7,668,421 - 7,687,490 bp",
    name: "Tumor Protein p53",
    functionalClass: "Tumor Suppressor",
    inheritance: "Autosomal Dominant",
    chromosome: "Chr 17",
    exons: 11,
    proteinLengthAA: 393,
    clinVarVariants: 9410,
    hgncId: "11998",
    ncbiGeneId: "7157",
    omimId: "191170",
    pdbId: "2OCJ",
    cryoResolution: "X-Ray 2.05 Å Tetramer",
    plddtScore: 89.7,
    pathogenicCount: 5110,
    vusCount: 2890,
    benignCount: 1410,
    hotspotExon: 7,
    hotspotLabel: "DNA-Binding Core Arg248",
    exonDomains: [
      {
        startExon: 1,
        endExon: 4,
        domain: "Transactivation & Proline",
        summary: "TAD1/TAD2 motifs recruiting p300/CBP coactivators and regulated by MDM2 ubiquitin binding.",
      },
      {
        startExon: 5,
        endExon: 8,
        domain: "Sequence-Specific DNA-Binding",
        summary: "Central Zn2+-coordinated immunoglobulin beta-sandwich containing codon hotspots R175H, R248W, and R273H.",
      },
      {
        startExon: 9,
        endExon: 11,
        domain: "Tetramerization & C-Term",
        summary: "Oligomerization helix bundle enabling tetrameric promoter occupancy during cellular genotoxic stress.",
      },
    ],
    description:
      "Master cellular genome guardian coordinating cell-cycle G1 arrest, DNA repair induction, senescence, and mitochondrial apoptosis upon oncogenic stress or DNA damage.",
    pharmacogenomicsNote:
      "Germline pathogenic carriers require non-ionizing surveillance protocols due to heightened radiation-induced secondary malignancy risk.",
    associatedConditions: [
      "Li-Fraumeni Syndrome (Autosomal Dominant)",
      "Adrenocortical Carcinoma Susceptibility",
      "Early-Onset Sarcoma & CNS Neoplasia",
    ],
  },
  {
    symbol: "LDLR",
    locus: "19p13.2",
    genomicCoordinates: "11,089,432 - 11,133,820 bp",
    name: "Low Density Lipoprotein Receptor",
    functionalClass: "Receptor & Transport",
    inheritance: "Autosomal Dominant",
    chromosome: "Chr 19",
    exons: 18,
    proteinLengthAA: 860,
    clinVarVariants: 3180,
    hgncId: "6547",
    ncbiGeneId: "3949",
    omimId: "606945",
    pdbId: "1N7D",
    cryoResolution: "X-Ray 3.7 Å Endosomal Form",
    plddtScore: 93.1,
    pathogenicCount: 2140,
    vusCount: 680,
    benignCount: 360,
    hotspotExon: 4,
    hotspotLabel: "ApoB/ApoE Ligand Repeat",
    exonDomains: [
      {
        startExon: 1,
        endExon: 6,
        domain: "Ligand-Binding Repeats LA1-LA7",
        summary: "Cysteine-rich repeats directly capturing circulating ApoB-100 LDL particles; Exon 4 shows highest variant density.",
      },
      {
        startExon: 7,
        endExon: 14,
        domain: "EGF Precursor Homology",
        summary: "Beta-propeller region triggering acid-dependent LDL release inside hepatocyte endosomes.",
      },
      {
        startExon: 15,
        endExon: 18,
        domain: "O-Linked & NPxY Cytosolic Tail",
        summary: "Transmembrane anchor and NPxY clathrin-coated pit internalization signal required for receptor recycling.",
      },
    ],
    description:
      "Cell-surface hepatic receptor mediating clathrin-dependent endocytosis of cholesterol-rich LDL particles. Pathogenic loss impairs plasma clearance, accelerating coronary atherosclerosis.",
    pharmacogenomicsNote:
      "PCSK9 monoclonal antibodies (evolocumab, alirocumab) and inclisiran markedly boost hepatic residual LDLR recycling in heterozygous FH.",
    associatedConditions: [
      "Familial Hypercholesterolemia Type 1",
      "Premature Coronary Artery Calcification",
    ],
  },
  {
    symbol: "SCN5A",
    locus: "3p22.2",
    genomicCoordinates: "38,548,062 - 38,649,687 bp",
    name: "Sodium Voltage-Gated Channel Alpha Subunit 5",
    functionalClass: "Ion Channel",
    inheritance: "Autosomal Dominant",
    chromosome: "Chr 3",
    exons: 28,
    proteinLengthAA: 2016,
    clinVarVariants: 2870,
    hgncId: "10593",
    ncbiGeneId: "6331",
    omimId: "600163",
    pdbId: "6UZ3",
    cryoResolution: "Cryo-EM 3.2 Å Nav1.5",
    plddtScore: 90.8,
    pathogenicCount: 1520,
    vusCount: 990,
    benignCount: 360,
    hotspotExon: 28,
    hotspotLabel: "DIV Voltage Sensor & Tail",
    exonDomains: [
      {
        startExon: 1,
        endExon: 10,
        domain: "Domains I-II Voltage Sensors",
        summary: "Pore-forming transmembrane repeats initiating rapid Phase 0 cardiac action potential upstroke.",
      },
      {
        startExon: 11,
        endExon: 20,
        domain: "Intracellular Loop & Inactivation Gate",
        summary: "IFM fast-inactivation triad; missense gain-of-function variants prolong QT interval (LQT3).",
      },
      {
        startExon: 21,
        endExon: 28,
        domain: "Domain IV & Calmodulin C-Term",
        summary: "Encodes late sodium current modulation and C-terminal EF-hand; hotspots linked to Brugada Syndrome.",
      },
    ],
    description:
      "Principal cardiac voltage-gated sodium channel Nav1.5 generating the fast inward sodium current (INa) responsible for atrial and ventricular excitability and conduction velocity.",
    pharmacogenomicsNote:
      "Class IA/IC antiarrhythmics (ajmaline, flecainide) unmask Brugada ST-elevation patterns and must be carefully avoided in loss-of-function carriers.",
    associatedConditions: [
      "Brugada Syndrome Type 1",
      "Long QT Syndrome Type 3",
      "Progressive Cardiac Conduction Defect",
    ],
  },
  {
    symbol: "FBN1",
    locus: "15q21.1",
    genomicCoordinates: "48,408,306 - 48,645,709 bp",
    name: "Fibrillin 1",
    functionalClass: "Structural Protein",
    inheritance: "Autosomal Dominant",
    chromosome: "Chr 15",
    exons: 66,
    proteinLengthAA: 2871,
    clinVarVariants: 1940,
    hgncId: "3603",
    ncbiGeneId: "2200",
    omimId: "134797",
    pdbId: "2W86",
    cryoResolution: "X-Ray 2.1 Å cbEGF Tandem",
    plddtScore: 88.5,
    pathogenicCount: 1290,
    vusCount: 460,
    benignCount: 190,
    hotspotExon: 28,
    hotspotLabel: "Neonatal Region Exons 24-32",
    exonDomains: [
      {
        startExon: 1,
        endExon: 23,
        domain: "N-Terminal Fibrillin Repeats",
        summary: "Proline-rich assembly motifs organizing extracellular matrix elastin microfibril scaffolds.",
      },
      {
        startExon: 24,
        endExon: 32,
        domain: "Critical Neonatal cbEGF Cluster",
        summary: "Calcium-binding EGF repeats stabilizing aortic tunica media tensile resistance against pulsatile shear.",
      },
      {
        startExon: 33,
        endExon: 66,
        domain: "TGF-Beta Latent Binding Repeats",
        summary: "Sequestering TB motifs modulating canonical SMAD2/3 signaling in connective tissue homeostasis.",
      },
    ],
    description:
      "Large extracellular matrix glycoprotein essential for microfibril formation in elastic and non-elastic tissues. Regulates TGF-beta signaling; haploinsufficiency leads to systemic connective tissue laxity.",
    pharmacogenomicsNote:
      "Angiotensin receptor blockers (losartan) and beta-blockers reduce aortic root growth velocity via attenuation of downstream TGF-beta signaling.",
    associatedConditions: [
      "Marfan Syndrome (Autosomal Dominant)",
      "Weill-Marchesani Syndrome, Type 2",
    ],
  },
  {
    symbol: "PAH",
    locus: "12q23.2",
    genomicCoordinates: "102,836,885 - 102,958,410 bp",
    name: "Phenylalanine Hydroxylase",
    functionalClass: "Metabolic Enzyme",
    inheritance: "Autosomal Recessive",
    chromosome: "Chr 12",
    exons: 13,
    proteinLengthAA: 452,
    clinVarVariants: 1860,
    hgncId: "8582",
    ncbiGeneId: "5053",
    omimId: "612349",
    pdbId: "6HYC",
    cryoResolution: "Cryo-EM 3.1 Å Tetramer",
    plddtScore: 95.4,
    pathogenicCount: 1380,
    vusCount: 310,
    benignCount: 170,
    hotspotExon: 12,
    hotspotLabel: "Arg408Trp Catalytic Founder",
    exonDomains: [
      {
        startExon: 1,
        endExon: 4,
        domain: "ACT Regulatory Domain",
        summary: "Allosteric L-phenylalanine sensor site mediating substrate-triggered conformational activation.",
      },
      {
        startExon: 5,
        endExon: 10,
        domain: "Iron-Coordinating Catalytic Core",
        summary: "BH4 cofactor binding pocket hydroxylating L-phenylalanine into L-tyrosine inside hepatocytes.",
      },
      {
        startExon: 11,
        endExon: 13,
        domain: "Oligomerization Tetramer Domain",
        summary: "Coiled-coil tetramer hinge housing the prevalent European c.1222C>T (p.Arg408Trp) allele.",
      },
    ],
    description:
      "Hepatic tetrahydrobiopterin-dependent monooxygenase converting L-phenylalanine to L-tyrosine. Deficiency causes hyperphenylalaninemia and neurotoxic accumulation without dietary intervention.",
    pharmacogenomicsNote:
      "Residual folding variants respond to sapropterin dihydrochloride (BH4 chaperone) and pegvaliase enzyme substitution therapy.",
    associatedConditions: [
      "Classical Phenylketonuria (PKU)",
      "Mild Non-PKU Hyperphenylalaninemia",
    ],
  },
  {
    symbol: "KCNQ1",
    locus: "11p15.5",
    genomicCoordinates: "2,444,991 - 2,849,110 bp",
    name: "Potassium Voltage-Gated Channel Subfamily Q Member 1",
    functionalClass: "Ion Channel",
    inheritance: "Autosomal Dominant",
    chromosome: "Chr 11",
    exons: 16,
    proteinLengthAA: 676,
    clinVarVariants: 1438,
    hgncId: "6289",
    ncbiGeneId: "3784",
    omimId: "607542",
    pdbId: "6UZZ",
    cryoResolution: "Cryo-EM 3.1 Å KCNQ1-KCNE3",
    plddtScore: 91.9,
    pathogenicCount: 980,
    vusCount: 318,
    benignCount: 140,
    hotspotExon: 7,
    hotspotLabel: "S5-Pore Potassium Filter",
    exonDomains: [
      {
        startExon: 1,
        endExon: 5,
        domain: "Voltage-Sensing S1-S4 Helices",
        summary: "Positively charged S4 arginine ladder sensing ventricular action potential depolarization.",
      },
      {
        startExon: 6,
        endExon: 10,
        domain: "GYGD Selectivity Filter & S6",
        summary: "Pore helix cluster gating delayed rectifier potassium efflux (IKs) across cardiac sarcolemma.",
      },
      {
        startExon: 11,
        endExon: 16,
        domain: "C-Terminal Subunit Assembly",
        summary: "Calmodulin-binding coiled-coils coordinating tetrameric channel trafficking to the membrane.",
      },
    ],
    description:
      "Forms voltage-gated potassium channel mediating the delayed rectifier current (IKs) in cardiac myocytes. Loss-of-function variants delay ventricular repolarization, precipitating polymorphic arrhythmias.",
    pharmacogenomicsNote:
      "Beta-adrenergic blockade (nadolol or propranolol) prevents adrenergic trigger-induced torsades de pointes; QT-prolonging drugs contraindicated.",
    associatedConditions: [
      "Long QT Syndrome Type 1 (Romano-Ward)",
      "Jervell and Lange-Nielsen Syndrome",
    ],
  },
  {
    symbol: "HBB",
    locus: "11p15.4",
    genomicCoordinates: "5,225,464 - 5,229,395 bp",
    name: "Hemoglobin Subunit Beta",
    functionalClass: "Receptor & Transport",
    inheritance: "Autosomal Recessive",
    chromosome: "Chr 11",
    exons: 3,
    proteinLengthAA: 147,
    clinVarVariants: 1290,
    hgncId: "4827",
    ncbiGeneId: "3043",
    omimId: "141900",
    pdbId: "2HBS",
    cryoResolution: "X-Ray 2.05 Å Deoxy-HbS",
    plddtScore: 98.2,
    pathogenicCount: 940,
    vusCount: 210,
    benignCount: 140,
    hotspotExon: 1,
    hotspotLabel: "Codon 6 Glu6Val Polymerization",
    exonDomains: [
      {
        startExon: 1,
        endExon: 1,
        domain: "N-Terminal A/B Helices",
        summary: "Houses codon 6 c.20A>T (p.Glu7Val / HbS) driving hydrophobic deoxy-hemoglobin polymerization.",
      },
      {
        startExon: 2,
        endExon: 2,
        domain: "Heme Pocket Proximal/Distal",
        summary: "Encodes His64/His93 coordinating heme Fe2+ reversibly binding molecular oxygen across lungs and tissue.",
      },
      {
        startExon: 3,
        endExon: 3,
        domain: "Alpha-Beta Dimer Interface",
        summary: "Coordinates cooperative allosteric R-to-T oxygen offloading Bohr shift kinetics.",
      },
    ],
    description:
      "Beta-globin subunit combining with two alpha-globin chains to form adult Hemoglobin A. Structural missense or splicing defects impair erythrocyte deformability and oxygen delivery.",
    pharmacogenomicsNote:
      "Hydroxyurea reactivates fetal gamma-globin (HbF) expression; autologous CRISPR BCL11A editing restores durable hemoglobin synthesis.",
    associatedConditions: [
      "Sickle Cell Anemia",
      "Beta-Thalassemia Major & Intermedia",
    ],
  },
  {
    symbol: "MTHFR",
    locus: "1p36.22",
    genomicCoordinates: "11,785,723 - 11,806,103 bp",
    name: "Methylenetetrahydrofolate Reductase",
    functionalClass: "Metabolic Enzyme",
    inheritance: "Autosomal Recessive",
    chromosome: "Chr 1",
    exons: 11,
    proteinLengthAA: 656,
    clinVarVariants: 695,
    hgncId: "7436",
    ncbiGeneId: "4524",
    omimId: "607093",
    pdbId: "6FCX",
    cryoResolution: "X-Ray 2.50 Å FAD-Bound",
    plddtScore: 93.7,
    pathogenicCount: 245,
    vusCount: 190,
    benignCount: 260,
    hotspotExon: 5,
    hotspotLabel: "C677T Thermolabile Site",
    exonDomains: [
      {
        startExon: 1,
        endExon: 6,
        domain: "N-Terminal Catalytic FAD Domain",
        summary: "Binds flavin adenine dinucleotide (FAD); Exon 5 harbors common c.665C>T (A222V) thermolabile variant.",
      },
      {
        startExon: 7,
        endExon: 11,
        domain: "C-Terminal SAM Regulatory Domain",
        summary: "S-adenosylmethionine allosteric inhibitor sensor site coordinating methionine remethylation flux.",
      },
    ],
    description:
      "Key regulatory enzyme in folate and homocysteine metabolism. Catalyzes the conversion of 5,10-methylenetetrahydrofolate to 5-methyltetrahydrofolate. Frequently studied missense variants include C677T and A1298C.",
    pharmacogenomicsNote:
      "Riboflavin cofactor and active L-methylfolate supplementation normalize homocysteine elevation in severe thermolabile genotypes.",
    associatedConditions: [
      "Homocystinuria due to MTHFR Deficiency",
      "Neural Tube Defects Susceptibility (Folate-dependent)",
    ],
  },
  {
    symbol: "HTT",
    locus: "4p16.3",
    genomicCoordinates: "3,074,681 - 3,243,957 bp",
    name: "Huntingtin",
    functionalClass: "Structural Protein",
    inheritance: "Autosomal Dominant",
    chromosome: "Chr 4",
    exons: 67,
    proteinLengthAA: 3142,
    clinVarVariants: 688,
    hgncId: "4851",
    ncbiGeneId: "3064",
    omimId: "613004",
    pdbId: "6EZ8",
    cryoResolution: "Cryo-EM 4.0 Å HAP40 Complex",
    plddtScore: 84.9,
    pathogenicCount: 412,
    vusCount: 186,
    benignCount: 90,
    hotspotExon: 1,
    hotspotLabel: "Exon 1 CAG Repeat Tract",
    exonDomains: [
      {
        startExon: 1,
        endExon: 1,
        domain: "Polyglutamine (CAG) Tract",
        summary: "Normal range <26 repeats; full-penetrance expansions >=40 CAG induce striatal medium spiny neuronal toxicity.",
      },
      {
        startExon: 2,
        endExon: 34,
        domain: "N-HEAT Solenoid Scaffold",
        summary: "Alpha-helical HEAT repeats coordinating axonal vesicle transport and BDNF secretion.",
      },
      {
        startExon: 35,
        endExon: 67,
        domain: "C-HEAT Structural Module",
        summary: "Bridges macromolecular HAP40 complexes regulating autophagic clearance and synaptic homeostasis.",
      },
    ],
    description:
      "Encodes huntingtin protein containing polymorphic CAG trinucleotide repeat tract in exon 1. Unstable expansion beyond 36 repeats induces progressive neuronal degeneration and motor dysfunction.",
    pharmacogenomicsNote:
      "Allele-selective antisense oligonucleotides and splice modulators represent investigational RNA-lowering strategies.",
    associatedConditions: ["Huntington Disease (Autosomal Dominant)"],
  },
  {
    symbol: "APOE",
    locus: "19q13.32",
    genomicCoordinates: "44,905,796 - 44,909,393 bp",
    name: "Apolipoprotein E",
    functionalClass: "Metabolic Enzyme",
    inheritance: "Multifactorial",
    chromosome: "Chr 19",
    exons: 4,
    proteinLengthAA: 317,
    clinVarVariants: 412,
    hgncId: "613",
    ncbiGeneId: "348",
    omimId: "107741",
    pdbId: "2L7B",
    cryoResolution: "NMR Full-Length Structure",
    plddtScore: 90.2,
    pathogenicCount: 98,
    vusCount: 142,
    benignCount: 172,
    hotspotExon: 4,
    hotspotLabel: "Cys112Arg (ε4 Isoform)",
    exonDomains: [
      {
        startExon: 1,
        endExon: 2,
        domain: "5'UTR & Signal Peptide",
        summary: "Tissue-specific astrocytic and hepatic secretory signal sequence.",
      },
      {
        startExon: 3,
        endExon: 3,
        domain: "N-Terminal Helix Loop",
        summary: "Initiates four-helix bundle folding for receptor engagement.",
      },
      {
        startExon: 4,
        endExon: 4,
        domain: "LDL-R Binding & ε2/ε3/ε4 Site",
        summary: "Determines Cys/Arg isoform switch at positions 112 & 158 modulating CNS amyloid-beta clearance.",
      },
    ],
    description:
      "Major apolipoprotein of the chylomicron and HDL. Essential for the normal catabolism of triglyceride-rich lipoprotein constituents. Isoforms (ε2, ε3, ε4) modulate risk for neurodegenerative disorders.",
    pharmacogenomicsNote:
      "APOE ε4/ε4 homozygosity stratifies ARIA microvascular monitoring frequency during anti-amyloid immunotherapy.",
    associatedConditions: [
      "Alzheimer Disease Type 2 (Susceptibility)",
      "Hyperlipoproteinemia Type III",
    ],
  },
];

export const VARIANTS_EVIDENCE: VariantEvidence[] = [
  {
    id: "VCV000007105",
    gene: "CFTR",
    hgvsCoding: "c.1521_1523delCTT",
    hgvsProtein: "p.(Phe508del)",
    commonAlias: "ΔF508",
    significance: "Pathogenic",
    stars: 4,
    reviewPanel: "ClinGen Expert Panel",
    condition: "Cystic Fibrosis",
    curatedDate: "2024-04-12",
    dbSnp: "rs113993960",
    gnomadAf: "0.0082 (NFE)",
    caddPhred: 28.4,
    alphaMissense: 0.96,
    acmgCriteria: ["PS3", "PM1", "PM3", "PP3", "PP5"],
    ancestryFreq: [
      { population: "EUR", freqPct: 1.42 },
      { population: "AMR", freqPct: 0.58 },
      { population: "SAS", freqPct: 0.21 },
      { population: "AFR", freqPct: 0.14 },
      { population: "EAS", freqPct: 0.02 },
    ],
  },
  {
    id: "VCV000017652",
    gene: "BRCA1",
    hgvsCoding: "c.68_69delAG",
    hgvsProtein: "p.(Glu23Valfs*17)",
    commonAlias: "185delAG",
    significance: "Pathogenic",
    stars: 3,
    reviewPanel: "ENIGMA Expert Panel",
    condition: "HBOC Syndrome",
    curatedDate: "2024-02-18",
    dbSnp: "rs80357906",
    gnomadAf: "0.00041",
    caddPhred: 34.0,
    alphaMissense: 0.99,
    acmgCriteria: ["PVS1", "PS4", "PM2", "PP5"],
    ancestryFreq: [
      { population: "ASJ", freqPct: 0.92 },
      { population: "EUR", freqPct: 0.04 },
      { population: "AMR", freqPct: 0.03 },
      { population: "SAS", freqPct: 0.01 },
      { population: "EAS", freqPct: 0.0 },
    ],
  },
  {
    id: "VCV000012356",
    gene: "TP53",
    hgvsCoding: "c.743G>A",
    hgvsProtein: "p.(Arg248Gln)",
    commonAlias: "R248Q",
    significance: "Pathogenic",
    stars: 4,
    reviewPanel: "ClinGen TP53 VCEP",
    condition: "Li-Fraumeni Syndrome",
    curatedDate: "2024-05-09",
    dbSnp: "rs11540652",
    gnomadAf: "0.00001",
    caddPhred: 32.1,
    alphaMissense: 0.98,
    acmgCriteria: ["PS3", "PM1", "PM2", "PM5", "PP3"],
    ancestryFreq: [
      { population: "EUR", freqPct: 0.002 },
      { population: "SAS", freqPct: 0.001 },
      { population: "AMR", freqPct: 0.001 },
      { population: "AFR", freqPct: 0.001 },
      { population: "EAS", freqPct: 0.001 },
    ],
  },
  {
    id: "VCV000003702",
    gene: "LDLR",
    hgvsCoding: "c.682G>T",
    hgvsProtein: "p.(Glu228*)",
    commonAlias: "FH French Canadian",
    significance: "Pathogenic",
    stars: 3,
    reviewPanel: "ClinGen FH VCEP",
    condition: "Familial Hypercholesterolemia",
    curatedDate: "2024-04-02",
    dbSnp: "rs121908029",
    gnomadAf: "0.00004",
    caddPhred: 36.2,
    alphaMissense: 0.97,
    acmgCriteria: ["PVS1", "PM2", "PS4", "PP1"],
    ancestryFreq: [
      { population: "EUR", freqPct: 0.008 },
      { population: "AMR", freqPct: 0.002 },
      { population: "SAS", freqPct: 0.001 },
      { population: "AFR", freqPct: 0.0 },
      { population: "EAS", freqPct: 0.0 },
    ],
  },
  {
    id: "VCV000015333",
    gene: "HBB",
    hgvsCoding: "c.20A>T",
    hgvsProtein: "p.(Glu7Val)",
    commonAlias: "HbS",
    significance: "Pathogenic",
    stars: 4,
    reviewPanel: "ClinGen Hemoglobinopathy",
    condition: "Sickle Cell Anemia",
    curatedDate: "2024-03-22",
    dbSnp: "rs334",
    gnomadAf: "0.0046",
    caddPhred: 24.9,
    alphaMissense: 0.94,
    acmgCriteria: ["PS3", "PM3", "PP1_Strong", "PP3"],
    ancestryFreq: [
      { population: "AFR", freqPct: 9.21 },
      { population: "AMR", freqPct: 0.89 },
      { population: "SAS", freqPct: 0.42 },
      { population: "EUR", freqPct: 0.02 },
      { population: "EAS", freqPct: 0.0 },
    ],
  },
  {
    id: "VCV000009386",
    gene: "SCN5A",
    hgvsCoding: "c.5350G>A",
    hgvsProtein: "p.(Glu1784Lys)",
    commonAlias: "E1784K",
    significance: "Pathogenic",
    stars: 3,
    reviewPanel: "Criteria Provided",
    condition: "Brugada / LQT3 Overlap",
    curatedDate: "2024-02-11",
    dbSnp: "rs137854601",
    gnomadAf: "0.00003",
    caddPhred: 29.8,
    alphaMissense: 0.93,
    acmgCriteria: ["PS3", "PS4", "PM2", "PP3"],
    ancestryFreq: [
      { population: "EUR", freqPct: 0.004 },
      { population: "EAS", freqPct: 0.005 },
      { population: "AMR", freqPct: 0.001 },
      { population: "SAS", freqPct: 0.0 },
      { population: "AFR", freqPct: 0.0 },
    ],
  },
  {
    id: "VCV000000577",
    gene: "PAH",
    hgvsCoding: "c.1222C>T",
    hgvsProtein: "p.(Arg408Trp)",
    commonAlias: "R408W",
    significance: "Pathogenic",
    stars: 4,
    reviewPanel: "ClinGen PAH VCEP",
    condition: "Phenylketonuria",
    curatedDate: "2024-01-19",
    dbSnp: "rs5030858",
    gnomadAf: "0.0014",
    caddPhred: 31.0,
    alphaMissense: 0.99,
    acmgCriteria: ["PS3", "PM3", "PP3", "PP4"],
    ancestryFreq: [
      { population: "EUR", freqPct: 0.24 },
      { population: "AMR", freqPct: 0.07 },
      { population: "SAS", freqPct: 0.01 },
      { population: "AFR", freqPct: 0.01 },
      { population: "EAS", freqPct: 0.0 },
    ],
  },
  {
    id: "VCV000129458",
    gene: "KCNQ1",
    hgvsCoding: "c.1691C>T",
    hgvsProtein: "p.(Arg564Trp)",
    significance: "Likely Pathogenic",
    stars: 3,
    reviewPanel: "ClinGen LQT Working Group",
    condition: "Romano-Ward LQTS",
    curatedDate: "2023-11-07",
    dbSnp: "rs121912497",
    gnomadAf: "0.00001",
    caddPhred: 27.6,
    alphaMissense: 0.89,
    acmgCriteria: ["PM1", "PM2", "PP3", "PP5"],
    ancestryFreq: [
      { population: "EUR", freqPct: 0.002 },
      { population: "EAS", freqPct: 0.001 },
      { population: "AMR", freqPct: 0.0 },
      { population: "SAS", freqPct: 0.0 },
      { population: "AFR", freqPct: 0.0 },
    ],
  },
  {
    id: "VCV000495812",
    gene: "FBN1",
    hgvsCoding: "c.3421T>A",
    hgvsProtein: "p.(Cys1141Ser)",
    significance: "VUS (Uncertain)",
    stars: 1,
    reviewPanel: "Criteria Evaluated",
    condition: "Marfanoid Connective Phenotype",
    curatedDate: "2024-01-29",
    dbSnp: "rs137854498",
    gnomadAf: "0.00002",
    caddPhred: 25.1,
    alphaMissense: 0.68,
    acmgCriteria: ["PM1", "PP3"],
    ancestryFreq: [
      { population: "EUR", freqPct: 0.003 },
      { population: "SAS", freqPct: 0.002 },
      { population: "AMR", freqPct: 0.001 },
      { population: "AFR", freqPct: 0.0 },
      { population: "EAS", freqPct: 0.0 },
    ],
  },
  {
    id: "VCV000003522",
    gene: "MTHFR",
    hgvsCoding: "c.665C>T",
    hgvsProtein: "p.(Ala222Val)",
    commonAlias: "C677T",
    significance: "Benign / Polymorphism",
    stars: 2,
    reviewPanel: "Practice Guideline",
    condition: "Thermolabile MTHFR Modifier",
    curatedDate: "2024-03-04",
    dbSnp: "rs1801133",
    gnomadAf: "0.312",
    caddPhred: 23.4,
    alphaMissense: 0.24,
    acmgCriteria: ["BA1", "BS2"],
    ancestryFreq: [
      { population: "AMR", freqPct: 47.2 },
      { population: "EUR", freqPct: 33.8 },
      { population: "EAS", freqPct: 29.4 },
      { population: "SAS", freqPct: 16.5 },
      { population: "AFR", freqPct: 10.9 },
    ],
  },
];

export function getExonDomainDetails(
  gene: Gene,
  exon: number
): { domain: string; summary: string; isHotspot: boolean } {
  const matched =
    gene.exonDomains.find((d) => exon >= d.startExon && exon <= d.endExon) ||
    gene.exonDomains[0];
  return {
    domain: matched?.domain || gene.functionalClass,
    summary: matched?.summary || gene.description,
    isHotspot: exon === gene.hotspotExon,
  };
}
