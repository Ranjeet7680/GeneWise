# Contributing to GeneWise (MediPredict AI)

Thank you for your interest in contributing to **GeneWise**, an institutional AI-powered clinical decision-support and genetics literacy platform.

---

## 👥 Core Project Team & Contributors

The development, clinical research, software architecture, and machine learning pipelines of GeneWise are spearheaded by:

| S.No | Name | Country | Project Role | Organization |
|:---:|:---|:---:|:---|:---|
| **1** | **Ranjeet Kumar** | India | Odin - Writer & Lead Architect | Mercor |
| **2** | **Varunika B** | India | AI Engineer | AnantNetra |
| **3** | **Reetesh V** | India | AI / ML Engineer | Epsilon |
| **4** | **Shreya Kapoor** | India | Software Engineer | Heartfulness Institute |
| **5** | **Andalamala Sumanth** | India | EC Engineer | Visible Campus |

---

## 📜 Code of Conduct
All contributors, maintainers, and community researchers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all community members with respect, dignity, and professional courtesy.

---

## 🛠️ How to Contribute

### 1. Workflow & Branching Strategy
1. **Explore or File Issues**: Look for existing GitHub Issues or open a discussion before implementing significant architectural changes.
2. **Branch from `main`**:
   ```bash
   git checkout -b feature/clinical-workflow-improvement
   ```

### 2. Local Development Setup
- **Web Application (Next.js 14 App Router)**:
  ```bash
  cd apps/web
  npm install --legacy-peer-deps
  npm run dev
  ```
- **FastAPI Core Backend (Python 3.11)**:
  ```bash
  cd backend
  python -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  pip install -r requirements.txt
  uvicorn app.main:app --reload --port 8000
  ```

### 3. Testing & Verification Standards
Before submitting a pull request, verify all automated clinical and component test suites:
- **Frontend Vitest Suite**:
  ```bash
  npm --prefix apps/web test
  ```
- **Next.js Production Build**:
  ```bash
  npm --prefix apps/web run build
  ```
- **Backend Pytest Suite (70 tests passing)**:
  ```bash
  pytest backend/tests/
  ```

### 4. Submitting a Pull Request (PR)
- Provide a clear, concise summary of the clinical feature, bug fix, or performance optimization.
- Reference related issue IDs.
- Ensure all CI/CD verification workflows pass cleanly.

---

## 🛡️ Clinical Safety & Privacy Standards
- **Zero Hardcoded PHI**: Under no circumstances should real patient data, identifiable health records, or Protected Health Information (PHI) be committed to version control.
- **Guideline Alignment**: All clinical rules, risk calculators, and genetic interpretation logic must cite recognized clinical guidelines (ACMG, NSGC, ADA, ACG, KDIGO).
- **Security Check**: Enforce RFC 6238 TOTP, ReBAC access guards, and HMAC-SHA256 audit trails.

Thank you for helping advance open, evidence-grounded clinical intelligence!
